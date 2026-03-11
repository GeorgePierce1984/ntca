import jwt from "jsonwebtoken";
import { prisma } from "../_utils/prisma.js";

function verifyToken(req) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) throw new Error("No token provided");
  return jwt.verify(token, process.env.JWT_SECRET);
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const decoded = verifyToken(req);

      if (decoded.userType !== "SCHOOL") {
        return res.status(403).json({ error: "School access required" });
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          emailSchoolApplicantAlerts: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json({
        newApplicantAlerts: user.emailSchoolApplicantAlerts ?? true,
      });
    } catch (error) {
      console.error("Error fetching school email preferences:", error);
      return res.status(500).json({
        error: "Failed to fetch email preferences",
        message: error.message,
      });
    }
  }

  if (req.method === "PUT") {
    try {
      const decoded = verifyToken(req);

      if (decoded.userType !== "SCHOOL") {
        return res.status(403).json({ error: "School access required" });
      }

      const { newApplicantAlerts } = req.body;

      if (typeof newApplicantAlerts !== "boolean") {
        return res.status(400).json({
          error: "newApplicantAlerts must be a boolean",
        });
      }

      const user = await prisma.user.update({
        where: { id: decoded.userId },
        data: {
          emailSchoolApplicantAlerts: newApplicantAlerts,
        },
        select: {
          emailSchoolApplicantAlerts: true,
        },
      });

      await prisma.activityLog.create({
        data: {
          userId: decoded.userId,
          action: "SCHOOL_EMAIL_PREFERENCES_UPDATED",
          details: {
            newApplicantAlerts: user.emailSchoolApplicantAlerts,
          },
        },
      });

      return res.status(200).json({
        success: true,
        preferences: {
          newApplicantAlerts: user.emailSchoolApplicantAlerts,
        },
      });
    } catch (error) {
      console.error("Error updating school email preferences:", error);
      return res.status(500).json({
        error: "Failed to update email preferences",
        message: error.message,
      });
    }
  }

  res.setHeader("Allow", ["GET", "PUT"]);
  return res.status(405).json({ error: "Method Not Allowed" });
}
