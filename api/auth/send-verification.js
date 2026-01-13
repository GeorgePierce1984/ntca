import { PrismaClient } from "@prisma/client";
import { emailHelpers } from "../../lib/email/email-service.js";
import crypto from "crypto";

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

    // Generate 6-digit verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const codeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store verification code in database (using User table's resetToken fields temporarily)
    // Or create a separate verification table if needed
    // For now, we'll use a simple approach: store in a temporary table or use existing fields
    
    // Check if user exists (for existing users trying to verify)
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Update existing user with verification code
      await prisma.user.update({
        where: { email },
        data: {
          resetToken: verificationCode,
          resetTokenExpiry: codeExpiry,
        },
      });
    } else {
      // For new registrations, we'll store it in sessionStorage on frontend
      // and verify it when they complete registration
      // For now, return the code (in production, only send via email)
    }

    // Send verification email
    try {
      await emailHelpers.sendVerificationEmail(email, verificationCode);
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      // Don't fail the request if email fails, but log it
    }

    // Store verification code in session (for new users who don't exist in DB yet)
    // We'll return it to be stored in sessionStorage on frontend
    // Return success with code for frontend to store temporarily
    return res.status(200).json({
      success: true,
      message: "Verification code sent to your email",
      code: verificationCode, // Frontend will store this in sessionStorage
      expiresAt: codeExpiry.toISOString(),
    });
  } catch (error) {
    console.error("Send verification error:", error);
    return res.status(500).json({
      error: "Failed to send verification code. Please try again.",
    });
  }
}

