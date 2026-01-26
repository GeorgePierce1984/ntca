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
  if (req.method === "GET") {
    // Get all notes for an application
    try {
      const decoded = verifyToken(req);
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: "Application ID is required" });
      }

      // Get application to verify authorization
      const application = await prisma.application.findUnique({
        where: { id },
        include: {
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

      // Check authorization - only schools can view notes for their jobs
      if (decoded.userType === "SCHOOL") {
        const school = await prisma.school.findUnique({
          where: { userId: decoded.userId },
        });

        if (!school || school.id !== application.job.schoolId) {
          return res.status(403).json({ error: "Unauthorized" });
        }
      } else {
        return res.status(403).json({ error: "Only schools can view application notes" });
      }

      // Get notes
      const notes = await prisma.applicationNote.findMany({
        where: { applicationId: id },
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json({ notes });
    } catch (error) {
      console.error("Get notes error:", error);

      if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Invalid or expired token" });
      }

      return res.status(500).json({
        error: "Failed to fetch notes",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  } else if (req.method === "POST") {
    // Add a new note
    try {
      const decoded = verifyToken(req);
      const { id } = req.query;
      const { content } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Application ID is required" });
      }

      if (!content || !content.trim()) {
        return res.status(400).json({ error: "Note content is required" });
      }

      // Get application to verify authorization
      const application = await prisma.application.findUnique({
        where: { id },
        include: {
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

      // Check authorization - only schools can add notes
      if (decoded.userType !== "SCHOOL") {
        return res.status(403).json({ error: "Only schools can add notes" });
      }

      const school = await prisma.school.findUnique({
        where: { userId: decoded.userId },
      });

      if (!school || school.id !== application.job.schoolId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Create note
      const note = await prisma.applicationNote.create({
        data: {
          applicationId: id,
          content: content.trim(),
          authorType: "school",
          authorName: school.contactName || school.name,
        },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: decoded.userId,
          action: "APPLICATION_NOTE_ADDED",
          details: {
            applicationId: id,
            noteId: note.id,
            jobTitle: application.job.title,
          },
          ipAddress: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
          userAgent: req.headers["user-agent"],
        },
      });

      return res.status(201).json({
        message: "Note added successfully",
        note,
      });
    } catch (error) {
      console.error("Add note error:", error);

      if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Invalid or expired token" });
      }

      return res.status(500).json({
        error: "Failed to add note",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  } finally {
    await prisma.$disconnect();
  }
}

