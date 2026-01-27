import { PrismaClient } from "@prisma/client";

// Reuse PrismaClient between serverless invocations to reduce cold-start latency.
// IMPORTANT: Do NOT call prisma.$disconnect() at the end of every request in Vercel serverless.
// That forces reconnections and can add 500–800ms+ per call.
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.__ntcaPrisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__ntcaPrisma = prisma;
}


