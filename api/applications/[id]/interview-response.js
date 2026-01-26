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
    if (req.method === "PATCH") {
      // Accept interview slot or suggest alternative
      const decoded = verifyToken(req);
      const { id } = req.query;
      const { selectedSlot, alternativeSlot } = req.body;

      // Only teachers can respond to interview requests
      if (decoded.userType !== "TEACHER") {
        return res.status(403).json({ error: "Only teachers can respond to interview requests" });
      }

      const teacher = await prisma.teacher.findUnique({
        where: { userId: decoded.userId },
      });

      if (!teacher) {
        return res.status(404).json({ error: "Teacher profile not found" });
      }

      // Get application and verify it belongs to this teacher
      const application = await prisma.application.findUnique({
        where: { id },
        include: {
          interviewRequest: true,
          job: true,
        },
      });

      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      if (application.teacherId !== teacher.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      if (!application.interviewRequest) {
        return res.status(404).json({ error: "Interview request not found" });
      }

      // Update interview request
      const updateData = {};
      if (selectedSlot !== undefined) {
        updateData.selectedSlot = selectedSlot;
        updateData.status = "accepted";
      }
      if (alternativeSlot) {
        updateData.alternativeSlot = alternativeSlot;
        updateData.status = "alternative_suggested";
      }

      const updatedRequest = await prisma.interviewRequest.update({
        where: { id: application.interviewRequest.id },
        data: updateData,
      });

      // Update application interview date if a slot was selected
      if (selectedSlot !== undefined && selectedSlot !== null) {
        const timeSlots = application.interviewRequest.timeSlots;
        if (timeSlots && Array.isArray(timeSlots) && timeSlots[selectedSlot]) {
          const selectedTimeSlot = timeSlots[selectedSlot];
          const interviewDateTime = new Date(`${selectedTimeSlot.date}T${selectedTimeSlot.time}`);
          await prisma.application.update({
            where: { id },
            data: { interviewDate: interviewDateTime },
          });
        }
      }

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: decoded.userId,
          action: selectedSlot !== undefined ? "INTERVIEW_SLOT_ACCEPTED" : "INTERVIEW_ALTERNATIVE_SUGGESTED",
          details: {
            applicationId: id,
            interviewRequestId: application.interviewRequest.id,
            jobTitle: application.job.title,
            selectedSlot,
            alternativeSlot,
          },
          ipAddress: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
          userAgent: req.headers["user-agent"],
        },
      });

      return res.status(200).json({
        message: selectedSlot !== undefined 
          ? "Interview slot accepted successfully" 
          : "Alternative time slot suggested",
        interviewRequest: updatedRequest,
      });
    } else {
      res.setHeader("Allow", ["PATCH"]);
      return res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (error) {
    console.error("Interview response error:", error);

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

