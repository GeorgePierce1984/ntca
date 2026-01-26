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
      // Accept or decline alternative interview time
      const decoded = verifyToken(req);
      const { id } = req.query;
      const { action } = req.body; // "accept" or "decline"

      // Only schools can respond to alternative suggestions
      if (decoded.userType !== "SCHOOL") {
        return res.status(403).json({ error: "Only schools can respond to alternative interview times" });
      }

      const school = await prisma.school.findUnique({
        where: { userId: decoded.userId },
      });

      if (!school) {
        return res.status(404).json({ error: "School profile not found" });
      }

      // Get application and verify it belongs to this school's job
      const application = await prisma.application.findUnique({
        where: { id },
        include: {
          interviewRequest: true,
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

      if (application.job.schoolId !== school.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      if (!application.interviewRequest) {
        return res.status(404).json({ error: "Interview request not found" });
      }

      if (application.interviewRequest.status !== "alternative_suggested") {
        return res.status(400).json({ error: "No alternative time suggestion to respond to" });
      }

      if (action === "accept") {
        // Accept the alternative time slot
        const alternativeSlot = application.interviewRequest.alternativeSlot;
        if (!alternativeSlot) {
          return res.status(400).json({ error: "No alternative slot found" });
        }

        // Update interview request to accepted with the alternative slot
        const interviewDateTime = new Date(`${alternativeSlot.date}T${alternativeSlot.time}`);
        
        await prisma.interviewRequest.update({
          where: { id: application.interviewRequest.id },
          data: {
            status: "accepted",
            selectedSlot: null, // Alternative slot is not one of the original slots
            // Store alternative slot as the selected time
          },
        });

        // Update application interview date
        await prisma.application.update({
          where: { id },
          data: { interviewDate: interviewDateTime },
        });

        // TODO: Send email notification to teacher

        return res.status(200).json({
          message: "Alternative time accepted successfully",
        });
      } else if (action === "decline") {
        // Decline the alternative time - reset to pending so teacher can choose from original slots
        await prisma.interviewRequest.update({
          where: { id: application.interviewRequest.id },
          data: {
            status: "pending",
            alternativeSlot: null,
          },
        });

        // TODO: Send email notification to teacher

        return res.status(200).json({
          message: "Alternative time declined. Teacher will be notified to select from original time slots.",
        });
      } else {
        return res.status(400).json({ error: "Invalid action. Must be 'accept' or 'decline'" });
      }
    } else {
      res.setHeader("Allow", ["PATCH"]);
      return res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (error) {
    console.error("Interview alternative response error:", error);

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

