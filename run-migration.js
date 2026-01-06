// Simple script to run the messaging migration
// Usage: node run-migration.js

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runMigration() {
  try {
    console.log("Starting database migration...");

    // Check if conversations table exists
    const conversationsTableCheck = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name = 'conversations'
    `;

    if (conversationsTableCheck.length === 0) {
      console.log("Creating conversations table...");
      await prisma.$executeRaw`
        CREATE TABLE "conversations" (
          "id" TEXT NOT NULL,
          "schoolId" TEXT NOT NULL,
          "teacherId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
        )
      `;
      await prisma.$executeRaw`
        CREATE UNIQUE INDEX "conversations_schoolId_teacherId_key" ON "conversations"("schoolId", "teacherId")
      `;
      await prisma.$executeRaw`
        CREATE INDEX "conversations_schoolId_idx" ON "conversations"("schoolId")
      `;
      await prisma.$executeRaw`
        CREATE INDEX "conversations_teacherId_idx" ON "conversations"("teacherId")
      `;
      await prisma.$executeRaw`
        ALTER TABLE "conversations" ADD CONSTRAINT "conversations_schoolId_fkey" 
        FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE
      `;
      await prisma.$executeRaw`
        ALTER TABLE "conversations" ADD CONSTRAINT "conversations_teacherId_fkey" 
        FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE
      `;
      console.log("✓ conversations table created");
    } else {
      console.log("✓ conversations table already exists");
    }

    // Check if messages table exists
    const messagesTableCheck = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name = 'messages'
    `;

    if (messagesTableCheck.length === 0) {
      console.log("Creating messages table...");
      await prisma.$executeRaw`
        CREATE TABLE "messages" (
          "id" TEXT NOT NULL,
          "conversationId" TEXT NOT NULL,
          "senderId" TEXT NOT NULL,
          "senderType" TEXT NOT NULL,
          "content" TEXT NOT NULL,
          "read" BOOLEAN NOT NULL DEFAULT false,
          "readAt" TIMESTAMP(3),
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
        )
      `;
      await prisma.$executeRaw`
        CREATE INDEX "messages_conversationId_idx" ON "messages"("conversationId")
      `;
      await prisma.$executeRaw`
        CREATE INDEX "messages_senderId_idx" ON "messages"("senderId")
      `;
      await prisma.$executeRaw`
        ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" 
        FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE
      `;
      console.log("✓ messages table created");
    } else {
      console.log("✓ messages table already exists");
    }

    console.log("\n✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();

