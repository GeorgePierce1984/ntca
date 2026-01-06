import { PrismaClient, UserType } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Track connection state to avoid unnecessary delays
let connectionAttempted = false;

// Ensure Prisma connection is active (optimized for performance)
async function ensureConnected() {
  // Only wait on first connection attempt (cold start)
  if (!connectionAttempted) {
    connectionAttempted = true;
    try {
      await prisma.$connect();
      // Small delay only on first connection for cold starts
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      await prisma.$disconnect().catch(() => {});
      throw error;
    }
  }
  // Subsequent calls: Prisma connection pooling handles it, no delay needed
}

// Helper function to retry database operations
async function retryOperation(operation, maxRetries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Only ensure connection on first attempt
      if (attempt === 1) {
        await ensureConnected();
      }
      return await operation();
    } catch (error) {
      const isConnectionError = 
        error.message?.includes("Engine was empty") ||
        error.message?.includes("Engine is not yet connected") ||
        error.message?.includes("connection") ||
        error.message?.includes("Response from the Engine was empty") ||
        error.code === "P1001" ||
        error.code === "P1017" ||
        error.code === "P1008" ||
        error.code === "GenericFailure" ||
        error.name === "PrismaClientUnknownRequestError";

      if (isConnectionError && attempt < maxRetries) {
        console.log(`Connection error on attempt ${attempt}, retrying in ${delay}ms...`);
        connectionAttempted = false; // Reset to allow reconnection
        await prisma.$disconnect().catch(() => {});
        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * 1.5, 3000); // Cap at 3 seconds
        continue;
      }
      throw error;
    }
  }
}

// Middleware to verify JWT token
function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const error = new Error("No token provided");
    error.name = "NoTokenError";
    throw error;
  }

  const token = authHeader.replace("Bearer ", "").trim();
  if (!token || token === "null" || token === "undefined" || token.length === 0) {
    const error = new Error("No token provided");
    error.name = "NoTokenError";
    throw error;
  }

  // Validate token format (JWT should have 3 parts separated by dots)
  const tokenParts = token.split(".");
  if (tokenParts.length !== 3) {
    const error = new Error("Invalid token format");
    error.name = "JsonWebTokenError";
    throw error;
  }

  if (!process.env.JWT_SECRET) {
    const error = new Error("JWT_SECRET not configured");
    error.name = "ConfigError";
    throw error;
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    // Re-throw JWT errors with proper error names
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      throw error;
    }
    // Wrap other errors
    const jwtError = new Error(error.message || "Token verification failed");
    jwtError.name = error.name || "JsonWebTokenError";
    throw jwtError;
  }
}

export default async function handler(req, res) {
  try {
    const decoded = verifyToken(req);
    const { id } = req.query; // conversationId

    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    // Verify conversation exists and user has access
    const conversation = await retryOperation(async () => {
      return await prisma.conversation.findUnique({
        where: { id },
      });
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Verify access
    if (decoded.userType === "SCHOOL") {
      const school = await retryOperation(async () => {
        return await prisma.school.findUnique({
          where: { userId: decoded.userId },
        });
      });

      if (conversation.schoolId !== school?.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Mark all messages from teacher as read (using raw SQL to handle TEXT type)
      await retryOperation(async () => {
        return await prisma.$executeRaw`
          UPDATE messages
          SET "read" = true, "readAt" = NOW()
          WHERE "conversationId" = ${id}
          AND "senderType"::text = 'TEACHER'
          AND "read" = false
        `;
      });
    } else if (decoded.userType === "TEACHER") {
      const teacher = await retryOperation(async () => {
        return await prisma.teacher.findUnique({
          where: { userId: decoded.userId },
        });
      });

      if (conversation.teacherId !== teacher?.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Mark all messages from school as read (using raw SQL to handle TEXT type)
      await retryOperation(async () => {
        return await prisma.$executeRaw`
          UPDATE messages
          SET "read" = true, "readAt" = NOW()
          WHERE "conversationId" = ${id}
          AND "senderType"::text = 'SCHOOL'
          AND "read" = false
        `;
      });
    } else {
      return res.status(403).json({ error: "Invalid user type" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Mark messages as read error:", error);
    
    if (error.message === "No token provided" || error.message?.includes("jwt")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    return res.status(500).json({ 
      error: "Internal server error",
      message: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    await prisma.$disconnect();
  }
}


