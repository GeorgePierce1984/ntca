import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: "Email and code are required" });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For new registrations, we might not have a user yet
      // In this case, we'll verify against sessionStorage on frontend
      // For now, return error
      return res.status(400).json({ error: "User not found" });
    }

    // Check if code matches and is not expired
    if (
      user.resetToken !== code ||
      !user.resetTokenExpiry ||
      user.resetTokenExpiry < new Date()
    ) {
      return res.status(400).json({
        error: "Invalid or expired verification code",
      });
    }

    // Mark email as verified
    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: true,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return res.status(500).json({
      error: "Failed to verify email. Please try again.",
    });
  }
}

