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
  try {
    if (req.method === "POST") {
      // Create interview request
      const decoded = verifyToken(req);
      const { id } = req.query;
      const { duration, locationType, location, message, timeSlots } = req.body;

      // Only schools can create interview requests
      if (decoded.userType !== "SCHOOL") {
        return res.status(403).json({ error: "Only schools can create interview requests" });
      }

      const school = await prisma.school.findUnique({
        where: { userId: decoded.userId },
      });

      if (!school) {
        return res.status(404).json({ error: "School profile not found" });
      }

      // Verify application belongs to this school
      const application = await prisma.application.findUnique({
        where: { id },
        include: { job: true },
      });

      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      if (application.job.schoolId !== school.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Check if interview request already exists
      const existingRequest = await prisma.interviewRequest.findUnique({
        where: { applicationId: id },
      });

      if (existingRequest) {
        return res.status(400).json({ error: "Interview request already exists for this application" });
      }

      // Validate time slots
      if (!timeSlots || !Array.isArray(timeSlots) || timeSlots.length !== 3) {
        return res.status(400).json({ error: "Exactly 3 time slots are required" });
      }

      // Create interview request
      const interviewRequest = await prisma.interviewRequest.create({
        data: {
          applicationId: id,
          duration: parseInt(duration),
          locationType,
          location,
          message: message || null,
          timeSlots: timeSlots,
          status: "pending",
        },
      });

      // Update application status to INTERVIEW
      await prisma.application.update({
        where: { id },
        data: { status: "INTERVIEW" },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: decoded.userId,
          action: "INTERVIEW_REQUEST_CREATED",
          details: {
            applicationId: id,
            interviewRequestId: interviewRequest.id,
            jobTitle: application.job.title,
          },
          ipAddress: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
          userAgent: req.headers["user-agent"],
        },
      });

      return res.status(201).json({
        message: "Interview request created successfully",
        interviewRequest,
      });
    } else if (req.method === "GET") {
      // Get interview request
      const decoded = verifyToken(req);
      const { id } = req.query;

      const application = await prisma.application.findUnique({
        where: { id },
        include: {
          job: {
            include: { school: true },
          },
          interviewRequest: true,
        },
      });

      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      // Check authorization
      if (decoded.userType === "SCHOOL") {
        const school = await prisma.school.findUnique({
          where: { userId: decoded.userId },
        });
        if (!school || school.id !== application.job.schoolId) {
          return res.status(403).json({ error: "Unauthorized" });
        }
      } else if (decoded.userType === "TEACHER") {
        if (application.teacherId !== decoded.userId) {
          return res.status(403).json({ error: "Unauthorized" });
        }
      } else {
        return res.status(403).json({ error: "Unauthorized" });
      }

      return res.status(200).json({
        interviewRequest: application.interviewRequest,
      });
    } else {
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (error) {
    console.error("Interview request error:", error);

    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    return res.status(500).json({
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    await prisma.$disconnect();
  }
}

