import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import formidable from "formidable";
import { put, del } from "@vercel/blob";
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

// Middleware to verify JWT token
function verifyToken(req) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) throw new Error("No token provided");

  return jwt.verify(token, process.env.JWT_SECRET);
}

// Helper function to generate blob filename with proper structure
function generateBlobPath(teacherId, teacherName, fileType, originalName) {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const sanitizedName = teacherName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();

  // Structure: teacher/sanitizedName-teacherId/fileType/timestamp-filename
  return `teacher/${sanitizedName}-${teacherId}/${fileType}/${timestamp}-${fileType}${ext}`;
}

// Upload file to Vercel Blob
async function uploadToVercelBlob(
  filePath,
  teacherId,
  teacherName,
  fileType,
  originalName,
) {
  try {
    const fileBuffer = await fs.readFile(filePath);
    const blobPath = generateBlobPath(
      teacherId,
      teacherName,
      fileType,
      originalName,
    );

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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const decoded = verifyToken(req);

    // Only teachers can apply for jobs
    if (decoded.userType !== "TEACHER") {
      return res
        .status(403)
        .json({ error: "Only teachers can apply for jobs" });
    }

    // Get teacher profile
    const teacher = await prisma.teacher.findUnique({
      where: { userId: decoded.userId },
    });

    if (!teacher) {
      return res.status(404).json({ error: "Teacher profile not found" });
    }

    // Parse form data
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowEmptyFiles: false,
    });

    const [fields, files] = await form.parse(req);

    const jobId = fields.jobId?.[0];
    const coverLetter = fields.coverLetter?.[0];

    if (!jobId) {
      return res.status(400).json({ error: "Job ID is required" });
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
      return res
        .status(400)
        .json({ error: "This job is no longer accepting applications" });
    }

    if (new Date() > job.deadline) {
      return res.status(400).json({ error: "Application deadline has passed" });
    }

    // Check if already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_teacherId: {
          jobId: jobId,
          teacherId: teacher.id,
        },
      },
    });

    if (existingApplication) {
      return res
        .status(400)
        .json({ error: "You have already applied for this job" });
    }

    // Handle CV upload - CV is required (either new upload or use existing)
    const useExistingResume = fields.useExistingResume?.[0] === "true";
    let resumeUrl;

    if (files.cv && files.cv[0]) {
      // New CV file uploaded
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
        const teacherName = `${teacher.firstName}-${teacher.lastName}`;
        resumeUrl = await uploadToVercelBlob(
          cvFile.filepath,
          teacher.id,
          teacherName,
          "resume",
          cvFile.originalFilename || "resume.pdf",
        );

        // Update teacher's resume URL
        await prisma.teacher.update({
          where: { id: teacher.id },
          data: { resumeUrl },
        });
      } finally {
        // Clean up temp file
        await fs.unlink(cvFile.filepath);
      }
    } else if (useExistingResume && teacher.resumeUrl) {
      // Use existing resume from teacher profile
      resumeUrl = teacher.resumeUrl;
    } else {
      // No CV provided and no existing CV available
      return res.status(400).json({
        error: "CV/Resume is required. Please upload a CV or ensure you have one on file.",
      });
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        jobId: jobId,
        teacherId: teacher.id,
        coverLetter: coverLetter || null,
        resumeUrl: resumeUrl,
        portfolioUrl: teacher.portfolioUrl,
        status: "APPLIED",
      },
      include: {
        job: {
          include: {
            school: true,
          },
        },
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            city: true,
            country: true,
            qualification: true,
            experienceYears: true,
            photoUrl: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: decoded.userId,
        action: "JOB_APPLICATION_SUBMITTED",
        details: {
          applicationId: application.id,
          jobId: jobId,
          jobTitle: job.title,
          schoolName: job.school.name,
        },
        ipAddress:
          req.headers["x-forwarded-for"] || req.connection.remoteAddress,
        userAgent: req.headers["user-agent"],
      },
    });

    // Send notification email to school
    try {
      await emailHelpers.notifySchoolOfApplication(
        job.school,
        job,
        teacher,
        application,
      );
    } catch (emailError) {
      // Log error but don't fail the application
      console.error("Failed to send notification email:", emailError);
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
    console.error("Application submission error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }

    return res.status(500).json({
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    await prisma.$disconnect();
  }
}
