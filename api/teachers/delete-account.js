import { prisma } from "../_utils/prisma.js";
import jwt from "jsonwebtoken";

function verifyToken(req) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) throw new Error("No token provided");
  return jwt.verify(token, process.env.JWT_SECRET);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const decoded = verifyToken(req);

    // Only teachers can delete their own account
    if (decoded.userType !== "TEACHER") {
      return res.status(403).json({ error: "Teacher access required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { teacher: true },
    });

    if (!user || !user.teacher) {
      return res.status(404).json({ error: "Teacher profile not found" });
    }

    // Schedule deletion in 7 days
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 7);

    // Immediately hide profile from schools (set searchable=false)
    await prisma.teacher.update({
      where: { id: user.teacher.id },
      data: { searchable: false },
    });

    // Schedule account deletion
    await prisma.user.update({
      where: { id: user.id },
      data: { deletionScheduledAt: deletionDate },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "ACCOUNT_DELETION_SCHEDULED",
        details: {
          scheduledFor: deletionDate.toISOString(),
          email: user.email,
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Account deletion scheduled. Your profile has been hidden from schools immediately.",
      deletionDate: deletionDate.toISOString(),
    });
  } catch (error) {
    console.error("Error scheduling account deletion:", error);
    return res.status(500).json({
      error: "Failed to schedule account deletion",
      message: error.message,
    });
  }
}

