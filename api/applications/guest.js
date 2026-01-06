import { PrismaClient } from "@prisma/client";
import formidable from "formidable";
import { put } from "@vercel/blob";
import fs from "fs/promises";
import path from "path";
import { emailHelpers } from "../../lib/email/email-service.js";

const prisma = new PrismaClient();

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to generate blob filename for guest applications
function generateGuestBlobPath(guestName, fileType, originalName) {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const sanitizedName = guestName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();

  // Structure: guest/sanitizedName-timestamp/fileType/filename
  return `guest/${sanitizedName}-${timestamp}/${fileType}/${timestamp}-${fileType}${ext}`;
}

// Upload file to Vercel Blob for guest applications
async function uploadGuestFileToVercelBlob(filePath, guestName, fileType, originalName) {
  try {
    const fileBuffer = await fs.readFile(filePath);
    const blobPath = generateGuestBlobPath(guestName, fileType, originalName);

    const { url } = await put(blobPath, fileBuffer, {
      access: "public",
      addRandomSuffix: false,
    });

    return url;
  } catch (error) {
    console.error("Vercel Blob upload error:", error);
    throw new Error("Failed to upload file");
  }
}

// Email validation function
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Parse form data
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowEmptyFiles: false,
    });

    const [fields, files] = await form.parse(req);

    // Extract required fields
    const jobId = fields.jobId?.[0];
    const firstName = fields.firstName?.[0];
    const lastName = fields.lastName?.[0];
    const email = fields.email?.[0];
    const phone = fields.phone?.[0];
    const city = fields.city?.[0];
    const country = fields.country?.[0];
    const coverLetter = fields.coverLetter?.[0];

    // Validate required fields
    if (!jobId) {
      return res.status(400).json({ error: "Job ID is required" });
    }

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ 
        error: "First name, last name, and email are required" 
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Please provide a valid email address" });
    }

    // Check if job exists and is active
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        school: true,
      },
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (job.status !== "ACTIVE") {
      return res.status(400).json({ 
        error: "This job is no longer accepting applications" 
      });
    }

    if (new Date() > job.deadline) {
      return res.status(400).json({ error: "Application deadline has passed" });
    }

    // Check for duplicate guest applications (same email for same job)
    const existingGuestApplication = await prisma.application.findFirst({
      where: {
        jobId: jobId,
        isGuestApplication: true,
        guestEmail: email,
      },
    });

    if (existingGuestApplication) {
      return res.status(400).json({ 
        error: "An application from this email address has already been submitted for this job" 
      });
    }

    // Handle CV upload
    let resumeUrl = null;

    if (files.cv && files.cv[0]) {
      const cvFile = files.cv[0];

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      
      if (!allowedTypes.includes(cvFile.mimetype)) {
        await fs.unlink(cvFile.filepath);
        return res.status(400).json({
          error: "Invalid file type. Please upload PDF or DOC/DOCX files only",
        });
      }

      // Upload to Vercel Blob
      try {
        const guestName = `${firstName}-${lastName}`;
        resumeUrl = await uploadGuestFileToVercelBlob(
          cvFile.filepath,
          guestName,
          "resume",
          cvFile.originalFilename || "resume.pdf",
        );
      } finally {
        // Clean up temp file
        await fs.unlink(cvFile.filepath);
      }
    }

    // Create guest application
    const application = await prisma.application.create({
      data: {
        jobId: jobId,
        teacherId: null, // No teacher ID for guest applications
        isGuestApplication: true,
        guestFirstName: firstName,
        guestLastName: lastName,
        guestEmail: email,
        guestPhone: phone || null,
        guestCity: city || null,
        guestCountry: country || null,
        coverLetter: coverLetter || null,
        resumeUrl: resumeUrl,
        status: "APPLIED",
      },
      include: {
        job: {
          include: {
            school: true,
          },
        },
      },
    });

    // Send notification email to school about guest application
    try {
      await emailHelpers.notifySchoolOfGuestApplication(
        job.school,
        job,
        {
          firstName,
          lastName,
          email,
          phone,
          city,
          country,
        },
        application,
      );
    } catch (emailError) {
      // Log error but don't fail the application
      console.error("Failed to send notification email:", emailError);
    }

    // Send confirmation email to applicant
    try {
      await emailHelpers.sendGuestApplicationConfirmation(
        { firstName, lastName, email },
        job,
        application,
      );
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
    }

    return res.status(201).json({
      message: "Application submitted successfully",
      application: {
        id: application.id,
        jobId: application.jobId,
        status: application.status,
        appliedAt: application.createdAt,
        job: {
          title: application.job.title,
          company: application.job.school.name,
          location: application.job.location,
        },
      },
    });

  } catch (error) {
    console.error("Guest application submission error:", error);

    return res.status(500).json({
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    await prisma.$disconnect();
  }
} 