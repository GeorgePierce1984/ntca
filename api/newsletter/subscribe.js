import { prisma } from "../_utils/prisma.js";
import { sendEmail } from "../../lib/email/email-service.js";

function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  const trimmed = email.trim();
  // Simple validation (good enough for newsletter signup)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { email, source } = req.body || {};

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Store separately from accounts. Do NOT link to User table.
    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email: normalizedEmail },
      update: {
        status: "subscribed",
        source: source && typeof source === "string" ? source : undefined,
      },
      create: {
        email: normalizedEmail,
        status: "subscribed",
        source: source && typeof source === "string" ? source : undefined,
      },
      select: { id: true, email: true, status: true, createdAt: true },
    });

    // Send welcome email (best-effort)
    const emailResult = await sendEmail("newsletterWelcome", normalizedEmail, {});

    return res.status(200).json({
      success: true,
      subscriber,
      emailSent: !!emailResult?.success,
    });
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return res.status(500).json({ error: "Failed to subscribe. Please try again." });
  }
}


