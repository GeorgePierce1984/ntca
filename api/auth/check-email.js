import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, userType: true },
    });

    if (existingUser) {
      return res.status(200).json({
        exists: true,
        message: `An account with the email ${email} is already in use. Please try logging in instead.`,
      });
    }

    return res.status(200).json({
      exists: false,
      message: "Email is available",
    });
  } catch (error) {
    console.error("Check email error:", error);
    return res.status(500).json({
      error: "Failed to check email. Please try again.",
    });
  }
}

