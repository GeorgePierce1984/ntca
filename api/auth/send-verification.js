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
      select: {
        id: true,
      },
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

    // Check if RESEND_API_KEY is configured before attempting to send
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your-resend-api-key') {
      console.error("RESEND_API_KEY not configured - email cannot be sent");
      console.error("Configuration check:", {
        hasKey: !!process.env.RESEND_API_KEY,
        keyValue: process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0, 5)}...` : 'undefined',
      });
      
      return res.status(200).json({
        success: true,
        message: "Verification code generated (email sending failed - RESEND_API_KEY not configured)",
        code: verificationCode,
        expiresAt: codeExpiry.toISOString(),
        emailSent: false,
        emailError: "RESEND_API_KEY not configured in Vercel environment variables",
        diagnostic: {
          issue: "Email service not configured",
          action: "Add RESEND_API_KEY to Vercel environment variables and redeploy",
          checkEndpoint: "/api/email/check-config",
        },
      });
    }

    // Log configuration before sending
    console.log("Email configuration check:", {
      hasResendKey: !!process.env.RESEND_API_KEY,
      resendKeyPrefix: process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0, 5)}...` : 'undefined',
      fromAddress: process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev (fallback)',
      fromName: process.env.EMAIL_FROM_NAME || 'NTCA Platform (fallback)',
      replyTo: process.env.EMAIL_REPLY_TO || 'onboarding@resend.dev (fallback)',
    });

    // Send verification email
    const emailResult = await emailHelpers.sendVerificationEmail(email, verificationCode);
    
    if (!emailResult.success) {
      console.error("Error sending verification email:", emailResult.error);
      console.error("Email details:", {
        email,
        fromDomain: process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev',
        resendError: emailResult.error,
        errorCode: emailResult.errorCode,
        errorStatus: emailResult.errorStatus,
        timestamp: new Date().toISOString(),
      });
      
      // Still return the code for development/testing, but warn the user
      // In production, you might want to fail here if email is critical
      return res.status(200).json({
        success: true,
        message: "Verification code generated (email sending failed - check RESEND_API_KEY)",
        code: verificationCode, // Frontend will store this in sessionStorage
        expiresAt: codeExpiry.toISOString(),
        emailSent: false,
        emailError: emailResult.error,
        diagnostic: {
          fromDomain: process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev',
          issue: process.env.EMAIL_FROM_ADDRESS === 'onboarding@resend.dev' || !process.env.EMAIL_FROM_ADDRESS
            ? 'CRITICAL: Using Resend test domain - can ONLY send to account owner! Verify a custom domain in Resend and set EMAIL_FROM_ADDRESS environment variable.'
            : 'Email sending failed. Check Resend dashboard for delivery status and error details.',
          recommendations: process.env.EMAIL_FROM_ADDRESS === 'onboarding@resend.dev' || !process.env.EMAIL_FROM_ADDRESS
            ? [
                '⚠️ Verify your domain in Resend (see VERIFY_RESEND_DOMAIN.md)',
                'Set EMAIL_FROM_ADDRESS environment variable to use verified domain (e.g., noreply@nt-ca.com)',
                'Redeploy after updating environment variables',
              ]
            : [
                'Check Resend dashboard for delivery status',
                'Check spam/junk folder',
                'Verify domain is still verified in Resend',
                'Contact support if issue persists',
              ],
        },
      });
    }

    // Log successful send for debugging
    console.log("Verification email sent successfully:", {
      email,
      messageId: emailResult.messageId,
      fromDomain: process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev',
      timestamp: new Date().toISOString(),
    });

    // Store verification code in session (for new users who don't exist in DB yet)
    // We'll return it to be stored in sessionStorage on frontend
    // Return success with code for frontend to store temporarily
    return res.status(200).json({
      success: true,
      message: "Verification code sent to your email",
      code: verificationCode, // Frontend will store this in sessionStorage
      expiresAt: codeExpiry.toISOString(),
      emailSent: true,
    });
  } catch (error) {
    console.error("Send verification error:", error);
    return res.status(500).json({
      error: "Failed to send verification code. Please try again.",
    });
  }
}

