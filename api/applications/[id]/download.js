import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// Middleware to verify JWT token
function verifyToken(req) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) throw new Error("No token provided");

  return jwt.verify(token, process.env.JWT_SECRET);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const decoded = verifyToken(req);
    const { id, type } = req.query;

    if (!id || !type) {
      return res.status(400).json({ error: "Application ID and document type are required" });
    }

    // Get application with teacher and job details
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        teacher: true,
        job: {
          include: {
            school: true,
          },
        },
      },
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Check authorization
    let authorized = false;

    if (decoded.userType === "SCHOOL") {
      // Schools can download documents for applications to their jobs
      const school = await prisma.school.findUnique({
        where: { userId: decoded.userId },
      });

      if (school && school.id === application.job.schoolId) {
        authorized = true;
      }
    } else if (decoded.userType === "TEACHER") {
      // Teachers can download their own documents
      const teacher = await prisma.teacher.findUnique({
        where: { userId: decoded.userId },
      });

      if (teacher && teacher.id === application.teacherId) {
        authorized = true;
      }
    } else if (decoded.userType === "ADMIN") {
      // Admins can download any document
      authorized = true;
    }

    if (!authorized) {
      return res.status(403).json({ error: "Unauthorized to download this document" });
    }

    // Get document URL based on type
    let documentUrl = null;
    let fileName = null;

    // Handle guest applications
    const isGuestApplication = !application.teacher;
    const firstName = isGuestApplication ? application.guestFirstName : application.teacher.firstName;
    const lastName = isGuestApplication ? application.guestLastName : application.teacher.lastName;

    switch (type) {
      case "resume":
      case "cv":
        documentUrl = application.resumeUrl || (!isGuestApplication ? application.teacher.resumeUrl : null);
        fileName = `${firstName}_${lastName}_Resume.pdf`;
        break;
      case "portfolio":
        documentUrl = application.portfolioUrl || (!isGuestApplication ? application.teacher.portfolioUrl : null);
        fileName = `${firstName}_${lastName}_Portfolio.pdf`;
        break;
      case "coverletter":
        // Cover letters are stored as text, not files
        if (application.coverLetter) {
          // Create a text file response
          const content = application.coverLetter;
          const buffer = Buffer.from(content, 'utf-8');

          res.setHeader('Content-Type', 'text/plain');
          res.setHeader('Content-Disposition', `attachment; filename="${firstName}_${lastName}_CoverLetter.txt"`);
          res.setHeader('Content-Length', buffer.length);

          return res.send(buffer);
        } else {
          return res.status(404).json({ error: "No cover letter found" });
        }
      case "certificate":
        // For future implementation when certificates are added
        documentUrl = !isGuestApplication ? application.teacher.certificateUrl : null;
        fileName = `${firstName}_${lastName}_Certificate.pdf`;
        break;
      default:
        return res.status(400).json({ error: "Invalid document type" });
    }

    if (!documentUrl) {
      return res.status(404).json({ error: `No ${type} found for this application` });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: decoded.userId,
        action: "DOCUMENT_DOWNLOADED",
        details: {
          applicationId: application.id,
          documentType: type,
          teacherName: `${firstName} ${lastName}`,
          jobTitle: application.job.title,
        },
        ipAddress: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
        userAgent: req.headers["user-agent"],
      },
    });

    // If document is stored in Vercel Blob or Cloudinary, redirect to the URL
    // The browser will handle the download based on content-disposition headers from the storage provider
    return res.redirect(documentUrl);

  } catch (error) {
    console.error("Document download error:", error);

    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    return res.status(500).json({
      error: "Failed to download document",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    await prisma.$disconnect();
  }
}
