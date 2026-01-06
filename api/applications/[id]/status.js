import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { emailHelpers } from "../../../lib/email/email-service.js";

const prisma = new PrismaClient();

// Middleware to verify JWT token
function verifyToken(req) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) throw new Error("No token provided");

  return jwt.verify(token, process.env.JWT_SECRET);
}

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    res.setHeader("Allow", "PATCH");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const decoded = verifyToken(req);
    const { id } = req.query;
    const { status, note, interviewDate, rating } = req.body;

    // Only schools can update application status
    if (decoded.userType !== "SCHOOL") {
      return res
        .status(403)
        .json({ error: "Only schools can update application status" });
    }

    const school = await prisma.school.findUnique({
      where: { userId: decoded.userId },
    });

    if (!school) {
      return res.status(404).json({ error: "School profile not found" });
    }

    // Find the application and verify it belongs to this school
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: true,
        teacher: true,
      },
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    if (application.job.schoolId !== school.id) {
      return res
        .status(403)
        .json({ error: "You can only update applications for your own jobs" });
    }

    // Validate status
    const validStatuses = [
      "APPLIED",
      "REVIEWING",
      "INTERVIEW",
      "DECLINED",
      "HIRED",
    ];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Update application in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update application
      const updateData = {};
      if (status) updateData.status = status;
      if (interviewDate) updateData.interviewDate = new Date(interviewDate);
      if (rating !== undefined) updateData.rating = rating;

      const updatedApplication = await tx.application.update({
        where: { id },
        data: updateData,
        include: {
          job: true,
          teacher: true,
          notes: {
            orderBy: { createdAt: "desc" },
          },
        },
      });

      // Add note if provided
      if (note) {
        await tx.applicationNote.create({
          data: {
            applicationId: id,
            content: note,
            authorType: "school",
            authorName: school.contactName || school.name,
          },
        });
      }

      return updatedApplication;
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: decoded.userId,
        action: "APPLICATION_STATUS_UPDATED",
        details: {
          applicationId: id,
          newStatus: status,
          teacherName: `${application.teacher.firstName} ${application.teacher.lastName}`,
          jobTitle: application.job.title,
          note,
        },
        ipAddress:
          req.headers["x-forwarded-for"] || req.connection.remoteAddress,
        userAgent: req.headers["user-agent"],
      },
    });

    // Send notification email to teacher if status changed
    if (status) {
      try {
        await emailHelpers.notifyTeacherOfStatusUpdate(
          application.teacher,
          application.job,
          school,
          status,
          note,
        );
      } catch (emailError) {
        // Log error but don't fail the status update
        console.error("Failed to send notification email:", emailError);
      }
    }

    return res.status(200).json({
      message: "Application status updated successfully",
      application: result,
    });
  } catch (error) {
    console.error("Application status update error:", error);

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
