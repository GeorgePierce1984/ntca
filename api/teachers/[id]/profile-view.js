import jwt from "jsonwebtoken";
import { prisma } from "../../_utils/prisma.js";

function tryDecodeToken(req) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return null;
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Missing teacher id" });

    const decoded = tryDecodeToken(req);

    const teacher = await prisma.teacher.findUnique({
      where: { id: String(id) },
      select: { id: true, userId: true, profileViews: true },
    });

    if (!teacher) return res.status(404).json({ error: "Teacher not found" });

    // Do not count self-views (teacher viewing their own profile)
    if (
      decoded?.userType === "TEACHER" &&
      decoded?.userId &&
      decoded.userId === teacher.userId
    ) {
      return res.status(200).json({ ok: true, skipped: true, profileViews: teacher.profileViews });
    }

    const updated = await prisma.teacher.update({
      where: { id: teacher.id },
      data: { profileViews: { increment: 1 } },
      select: { profileViews: true },
    });

    return res.status(200).json({ ok: true, skipped: false, profileViews: updated.profileViews });
  } catch (error) {
    console.error("Teacher profile view error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}


