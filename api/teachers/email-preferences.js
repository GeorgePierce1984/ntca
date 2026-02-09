import { prisma } from "../_utils/prisma.js";
import jwt from "jsonwebtoken";

function verifyToken(req) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) throw new Error("No token provided");
  return jwt.verify(token, process.env.JWT_SECRET);
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const decoded = verifyToken(req);

      if (decoded.userType !== "TEACHER") {
        return res.status(403).json({ error: "Teacher access required" });
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          emailJobAlerts: true,
          emailPlatformUpdates: true,
          emailMarketing: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json({
        jobAlerts: user.emailJobAlerts ?? true,
        platformUpdates: user.emailPlatformUpdates ?? true,
        marketing: user.emailMarketing ?? false,
      });
    } catch (error) {
      console.error("Error fetching email preferences:", error);
      return res.status(500).json({
        error: "Failed to fetch email preferences",
        message: error.message,
      });
    }
  }

  if (req.method === "PUT") {
    try {
      const decoded = verifyToken(req);

      if (decoded.userType !== "TEACHER") {
        return res.status(403).json({ error: "Teacher access required" });
      }

      const { jobAlerts, platformUpdates, marketing } = req.body;

      const updateData = {};
      if (typeof jobAlerts === "boolean") {
        updateData.emailJobAlerts = jobAlerts;
      }
      if (typeof platformUpdates === "boolean") {
        updateData.emailPlatformUpdates = platformUpdates;
      }
      if (typeof marketing === "boolean") {
        updateData.emailMarketing = marketing;
      }

      const user = await prisma.user.update({
        where: { id: decoded.userId },
        data: updateData,
        select: {
          emailJobAlerts: true,
          emailPlatformUpdates: true,
          emailMarketing: true,
        },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: decoded.userId,
          action: "EMAIL_PREFERENCES_UPDATED",
          details: {
            jobAlerts: user.emailJobAlerts,
            platformUpdates: user.emailPlatformUpdates,
            marketing: user.emailMarketing,
          },
        },
      });

      return res.status(200).json({
        success: true,
        preferences: {
          jobAlerts: user.emailJobAlerts,
          platformUpdates: user.emailPlatformUpdates,
          marketing: user.emailMarketing,
        },
      });
    } catch (error) {
      console.error("Error updating email preferences:", error);
      return res.status(500).json({
        error: "Failed to update email preferences",
        message: error.message,
      });
    }
  }

  res.setHeader("Allow", ["GET", "PUT"]);
  return res.status(405).json({ error: "Method Not Allowed" });
}

