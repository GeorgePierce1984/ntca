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
  try {
    // Only disconnect/reconnect on first attempt (cold start)
    if (!connectionAttempted) {
      connectionAttempted = true;
      await prisma.$disconnect().catch(() => {});
      await prisma.$connect();
      // Minimal delay for cold start
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    // Subsequent calls: Prisma connection pooling handles it, no delay needed
  } catch (error) {
    await prisma.$disconnect().catch(() => {});
    connectionAttempted = false; // Reset on error
    throw error;
  }
}

// Helper function to retry database operations
async function retryOperation(operation, maxRetries = 3, initialDelay = 800) {
  let delay = initialDelay;
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
    const { id } = req.query;

    if (req.method === "GET") {
      // Get all messages in a conversation
      const conversation = await retryOperation(async () => {
        return await prisma.conversation.findUnique({
          where: { id },
          include: {
            school: {
              include: { user: true },
            },
            teacher: {
              include: { user: true },
            },
          },
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

        if (conversation.schoolId !== school?.id) {
          return res.status(403).json({ error: "Access denied" });
        }
      } else if (decoded.userType === "TEACHER") {
        const teacher = await retryOperation(async () => {
          return await prisma.teacher.findUnique({
            where: { userId: decoded.userId },
          });
        });

        if (conversation.teacherId !== teacher?.id) {
          return res.status(403).json({ error: "Access denied" });
        }
      }

      // Calculate 3 days ago timestamp for filtering
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      // Get messages - filter out read messages older than 3 days
      const messages = await retryOperation(async () => {
        const allMessages = await prisma.message.findMany({
          where: { conversationId: id },
          orderBy: { createdAt: "asc" },
        });

        // Filter messages: keep unread messages, or read messages that were read within 3 days
        const filteredMessages = allMessages.filter((message) => {
          // Always show unread messages
          if (!message.read) {
            return true;
          }

          // For read messages, check if they were read within 3 days
          // Use readAt if available, otherwise use createdAt as fallback
          const readDate = message.readAt ? new Date(message.readAt) : new Date(message.createdAt);
          const daysSinceRead = (new Date().getTime() - readDate.getTime()) / (1000 * 60 * 60 * 24);
          
          return daysSinceRead <= 3;
        });

        return filteredMessages;
      });

      // Format other party info
      const otherParty = decoded.userType === "SCHOOL"
        ? {
            id: conversation.teacher.id,
            name: `${conversation.teacher.firstName} ${conversation.teacher.lastName}`,
            email: conversation.teacher.user.email,
            photoUrl: conversation.teacher.photoUrl,
          }
        : {
            id: conversation.school.id,
            name: conversation.school.name,
            email: conversation.school.contactEmail || conversation.school.user.email,
            logoUrl: conversation.school.logoUrl,
          };

      return res.status(200).json({
        conversation: {
          id: conversation.id,
          otherParty,
        },
        messages,
      });
    }

    if (req.method === "POST") {
      // Send a new message
      const { content } = req.body;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: "Message content is required" });
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
      } else if (decoded.userType === "TEACHER") {
        const teacher = await retryOperation(async () => {
          return await prisma.teacher.findUnique({
            where: { userId: decoded.userId },
          });
        });

        if (conversation.teacherId !== teacher?.id) {
          return res.status(403).json({ error: "Access denied" });
        }
      }

      // Create message
      const message = await retryOperation(async () => {
        return await prisma.message.create({
          data: {
            conversationId: id,
            senderId: decoded.userId,
            senderType: decoded.userType === "SCHOOL" ? UserType.SCHOOL : UserType.TEACHER,
            content: content.trim(),
          },
        });
      });

      // Update conversation timestamp
      await retryOperation(async () => {
        return await prisma.conversation.update({
          where: { id },
          data: { updatedAt: new Date() },
        });
      });

      return res.status(201).json({ message });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (error) {
    console.error("Messages API error:", error);
    
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


