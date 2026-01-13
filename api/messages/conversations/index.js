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
// Don't manually disconnect/connect as it causes "Engine is not yet connected" errors
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

    if (req.method === "GET") {
      // Get all conversations for the current user
      let conversations;

      if (decoded.userType === "SCHOOL") {
        const school = await retryOperation(async () => {
          return await prisma.school.findUnique({
            where: { userId: decoded.userId },
          });
        });

        if (!school) {
          return res.status(404).json({ error: "School profile not found" });
        }

        // Calculate 3 days ago timestamp for filtering
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        conversations = await retryOperation(async () => {
          return await prisma.conversation.findMany({
            where: { 
              schoolId: school.id,
              // Only show conversations updated in the last 3 days
              updatedAt: {
                gte: threeDaysAgo,
              },
            },
            include: {
              teacher: {
                include: {
                  user: true,
                },
              },
              messages: {
                orderBy: { createdAt: "desc" },
                take: 1, // Get last message for preview
              },
            },
            orderBy: { updatedAt: "desc" },
          });
        });

        // Calculate unread counts in a single query (much faster than per-conversation)
        // Only run query if there are conversations
        if (conversations.length > 0) {
          try {
            const conversationIds = conversations.map(c => c.id);
            const unreadCounts = await retryOperation(async () => {
              // Use Prisma.$queryRawUnsafe with proper array parameter binding
              return await prisma.$queryRawUnsafe(
                `SELECT 
                  "conversationId",
                  COUNT(*)::int as count
                FROM messages
                WHERE "conversationId" = ANY($1::text[])
                AND "read" = false
                AND "senderType"::text = 'TEACHER'
                GROUP BY "conversationId"`,
                conversationIds
              );
            });
            
            // Create a map for quick lookup
            const countMap = new Map();
            unreadCounts.forEach((row) => {
              countMap.set(row.conversationId, Number(row.count || 0));
            });
            
            // Assign counts to conversations
            conversations.forEach(conv => {
              conv._count = { messages: countMap.get(conv.id) || 0 };
            });
          } catch (error) {
            console.error("Error counting unread messages:", error);
            // Default all to 0 if count query fails
            conversations.forEach(conv => {
              conv._count = { messages: 0 };
            });
          }
        } else {
          // No conversations - return empty array immediately
          return res.status(200).json({ conversations: [] });
        }
      } else if (decoded.userType === "TEACHER") {
        const teacher = await retryOperation(async () => {
          return await prisma.teacher.findUnique({
            where: { userId: decoded.userId },
          });
        });

        if (!teacher) {
          return res.status(404).json({ error: "Teacher profile not found" });
        }

        // Calculate 3 days ago timestamp for filtering
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        conversations = await retryOperation(async () => {
          return await prisma.conversation.findMany({
            where: { 
              teacherId: teacher.id,
              // Only show conversations updated in the last 3 days
              updatedAt: {
                gte: threeDaysAgo,
              },
            },
            include: {
              school: {
                include: {
                  user: true,
                },
              },
              messages: {
                orderBy: { createdAt: "desc" },
                take: 1, // Get last message for preview
              },
            },
            orderBy: { updatedAt: "desc" },
          });
        });

        // Calculate unread counts in a single query (much faster than per-conversation)
        // Only run query if there are conversations
        if (conversations.length > 0) {
          try {
            const conversationIds = conversations.map(c => c.id);
            const unreadCounts = await retryOperation(async () => {
              // Use Prisma.$queryRawUnsafe with proper array parameter binding
              return await prisma.$queryRawUnsafe(
                `SELECT 
                  "conversationId",
                  COUNT(*)::int as count
                FROM messages
                WHERE "conversationId" = ANY($1::text[])
                AND "read" = false
                AND "senderType"::text = 'SCHOOL'
                GROUP BY "conversationId"`,
                conversationIds
              );
            });
            
            // Create a map for quick lookup
            const countMap = new Map();
            unreadCounts.forEach((row) => {
              countMap.set(row.conversationId, Number(row.count || 0));
            });
            
            // Assign counts to conversations
            conversations.forEach(conv => {
              conv._count = { messages: countMap.get(conv.id) || 0 };
            });
          } catch (error) {
            console.error("Error counting unread messages:", error);
            // Default all to 0 if count query fails
            conversations.forEach(conv => {
              conv._count = { messages: 0 };
            });
          }
        } else {
          // No conversations - return empty array immediately
          return res.status(200).json({ conversations: [] });
        }
      } else {
        return res.status(403).json({ error: "Invalid user type" });
      }

      // Format conversations for frontend
      const formattedConversations = conversations.map((conv) => {
        const otherParty = decoded.userType === "SCHOOL" 
          ? { 
              id: conv.teacher.id,
              name: `${conv.teacher.firstName} ${conv.teacher.lastName}`,
              email: conv.teacher.user.email,
              photoUrl: conv.teacher.photoUrl,
            }
          : {
              id: conv.school.id,
              name: conv.school.name,
              email: conv.school.contactEmail || conv.school.user.email,
              logoUrl: conv.school.logoUrl,
            };

        return {
          id: conv.id,
          otherParty,
          lastMessage: conv.messages[0] || null,
          unreadCount: conv._count.messages,
          updatedAt: conv.updatedAt,
        };
      });

      return res.status(200).json({ conversations: formattedConversations });
    }

    if (req.method === "POST") {
      // Create a new conversation or get existing one
      const { teacherId, schoolId, content } = req.body;

      if (decoded.userType === "SCHOOL") {
        if (!teacherId) {
          return res.status(400).json({ error: "teacherId is required" });
        }

        const school = await retryOperation(async () => {
          return await prisma.school.findUnique({
            where: { userId: decoded.userId },
          });
        });

        if (!school) {
          return res.status(404).json({ error: "School profile not found" });
        }

        // Find or create conversation
        let conversation = await retryOperation(async () => {
          return await prisma.conversation.findUnique({
            where: {
              schoolId_teacherId: {
                schoolId: school.id,
                teacherId: teacherId,
              },
            },
          });
        });

        if (!conversation) {
          conversation = await retryOperation(async () => {
            return await prisma.conversation.create({
              data: {
                schoolId: school.id,
                teacherId: teacherId,
              },
            });
          });
        }

        // If content is provided, create a message
        if (content) {
          await retryOperation(async () => {
            return await prisma.message.create({
              data: {
                conversationId: conversation.id,
                senderId: decoded.userId,
                senderType: UserType.SCHOOL,
                content: content,
              },
            });
          });

          // Update conversation timestamp
          await retryOperation(async () => {
            return await prisma.conversation.update({
              where: { id: conversation.id },
              data: { updatedAt: new Date() },
            });
          });
        }

        return res.status(200).json({ conversationId: conversation.id });
      } else if (decoded.userType === "TEACHER") {
        if (!schoolId) {
          return res.status(400).json({ error: "schoolId is required" });
        }

        const teacher = await retryOperation(async () => {
          return await prisma.teacher.findUnique({
            where: { userId: decoded.userId },
          });
        });

        if (!teacher) {
          return res.status(404).json({ error: "Teacher profile not found" });
        }

        // Find or create conversation
        let conversation = await retryOperation(async () => {
          return await prisma.conversation.findUnique({
            where: {
              schoolId_teacherId: {
                schoolId: schoolId,
                teacherId: teacher.id,
              },
            },
          });
        });

        if (!conversation) {
          conversation = await retryOperation(async () => {
            return await prisma.conversation.create({
              data: {
                schoolId: schoolId,
                teacherId: teacher.id,
              },
            });
          });
        }

        // If content is provided, create a message
        if (content) {
          await retryOperation(async () => {
            return await prisma.message.create({
              data: {
                conversationId: conversation.id,
                senderId: decoded.userId,
                senderType: UserType.TEACHER,
                content: content,
              },
            });
          });

          // Update conversation timestamp
          await retryOperation(async () => {
            return await prisma.conversation.update({
              where: { id: conversation.id },
              data: { updatedAt: new Date() },
            });
          });
        }

        return res.status(200).json({ conversationId: conversation.id });
      } else {
        return res.status(403).json({ error: "Invalid user type" });
      }
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (error) {
    // Handle specific error types
    if (error.name === "NoTokenError") {
      // Don't log expected authentication failures - they're handled gracefully
      return res.status(401).json({ error: "Authentication required" });
    }
    
    console.error("Messages API error:", error);

    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    if (error.name === "ConfigError") {
      return res.status(500).json({ error: "Server configuration error" });
    }

    if (error.message === "No token provided" || error.message?.includes("jwt")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    return res.status(500).json({ 
      error: "Internal server error",
      message: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    // Don't disconnect in serverless - Prisma handles connections automatically
    // await prisma.$disconnect() causes "Engine is not yet connected" errors
  }
}


