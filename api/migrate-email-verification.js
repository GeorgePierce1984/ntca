// Database migration endpoint for adding email verification fields to users table
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    console.log("Starting email verification fields migration...");

    // Check if emailVerified column already exists
    const emailVerifiedCheck = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name = 'emailVerified'
    `;

    if (emailVerifiedCheck.length === 0) {
      console.log("Adding emailVerified to users table...");
      await prisma.$executeRaw`
        ALTER TABLE "users" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false
      `;
      console.log("✅ emailVerified column added");
    } else {
      console.log("emailVerified column already exists");
    }

    // Check if resetToken column already exists
    const resetTokenCheck = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name = 'resetToken'
    `;

    if (resetTokenCheck.length === 0) {
      console.log("Adding resetToken to users table...");
      await prisma.$executeRaw`
        ALTER TABLE "users" ADD COLUMN "resetToken" TEXT
      `;
      console.log("✅ resetToken column added");
    } else {
      console.log("resetToken column already exists");
    }

    // Check if resetTokenExpiry column already exists
    const resetTokenExpiryCheck = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name = 'resetTokenExpiry'
    `;

    if (resetTokenExpiryCheck.length === 0) {
      console.log("Adding resetTokenExpiry to users table...");
      await prisma.$executeRaw`
        ALTER TABLE "users" ADD COLUMN "resetTokenExpiry" TIMESTAMP(3)
      `;
      console.log("✅ resetTokenExpiry column added");
    } else {
      console.log("resetTokenExpiry column already exists");
    }

    console.log("✅ Email verification fields migration completed successfully");

    return res.status(200).json({
      success: true,
      message: "Email verification fields migration completed successfully",
    });
  } catch (error) {
    console.error("Migration error:", error);
    return res.status(500).json({
      error: "Failed to run migration",
      details: error.message,
    });
  }
}

