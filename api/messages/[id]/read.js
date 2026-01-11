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

// Helper function to retry database operations
// In serverless environments, Prisma handles connections automatically
async function retryOperation(operation, maxRetries = 3, initialDelay = 800) {
  let delay = initialDelay;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
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
        // Don't disconnect - let Prisma handle connections
        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * 1.5, 2000); // Cap at 2 seconds
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

    if (!id) {
      return res.status(400).json({ error: "Conversation ID is required" });
    }

    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    // Get conversation and verify user has access
    const conversation = await retryOperation(async () => {
      return await prisma.conversation.findUnique({
        where: { id },
      });
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Verify user has access to this conversation
    if (decoded.userType === "SCHOOL") {
      const school = await retryOperation(async () => {
        return await prisma.school.findUnique({
          where: { userId: decoded.userId },
        });
      });

      if (!school || conversation.schoolId !== school.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Mark all unread messages from TEACHER as read
      await retryOperation(async () => {
        return await prisma.message.updateMany({
          where: {
            conversationId: id,
            senderType: UserType.TEACHER,
            read: false,
          },
          data: {
            read: true,
            readAt: new Date(),
          },
        });
      });
    } else if (decoded.userType === "TEACHER") {
      const teacher = await retryOperation(async () => {
        return await prisma.teacher.findUnique({
          where: { userId: decoded.userId },
        });
      });

      if (!teacher || conversation.teacherId !== teacher.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Mark all unread messages from SCHOOL as read
      await retryOperation(async () => {
        return await prisma.message.updateMany({
          where: {
            conversationId: id,
            senderType: UserType.SCHOOL,
            read: false,
          },
          data: {
            read: true,
            readAt: new Date(),
          },
        });
      });
    } else {
      return res.status(403).json({ error: "Invalid user type" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Mark messages as read API error:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack,
    });

    // Handle specific error types
    if (error.name === "NoTokenError") {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    if (error.name === "ConfigError") {
      return res.status(500).json({ error: "Server configuration error" });
    }

    return res.status(500).json({
      error: "Internal server error",
      message: error.message || "Unknown error",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    // Don't disconnect in serverless - Prisma handles connections automatically
  }
}

