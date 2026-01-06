import { put, del } from "@vercel/blob";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";

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

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allowed file types
    const allowedTypes = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "application/pdf": ".pdf",
      "application/msword": ".doc",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        ".docx",
      "text/plain": ".txt",
    };

    if (allowedTypes[file.mimetype]) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Allowed: JPG, PNG, WebP, PDF, DOC, DOCX, TXT",
        ),
      );
    }
  },
});

// Middleware to verify JWT token
function verifyToken(req) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) throw new Error("No token provided");

  return jwt.verify(token, process.env.JWT_SECRET);
}

// Helper function to generate blob filename with proper structure
function generateBlobPath(userType, userId, userName, fileType, originalName) {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const sanitizedName = userName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
  
  // Sanitize original filename (remove special chars, keep extension)
  const baseName = path.basename(originalName, ext);
  const sanitizedOriginalName = baseName.replace(/[^a-zA-Z0-9_-]/g, "-").substring(0, 50); // Limit length

  // Structure: userType/sanitizedName-userId/fileType/timestamp-originalfilename.ext
  return `${userType.toLowerCase()}/${sanitizedName}-${userId}/${fileType}/${timestamp}-${sanitizedOriginalName}${ext}`;
}

// Helper function to delete old file from blob storage
async function deleteOldFile(oldUrl) {
  if (!oldUrl) return;

  try {
    // Extract blob URL and delete
    const blobUrl = oldUrl.replace(process.env.NEXT_PUBLIC_APP_URL || "", "");
    await del(blobUrl);
  } catch (error) {
    console.error("Error deleting old file:", error);
    // Don't fail the upload if old file deletion fails
  }
}

// Main upload handler
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Verify authentication
    const decoded = verifyToken(req);

    // Get user profile
    let userProfile = null;
    let userName = "";

    if (decoded.userType === "TEACHER") {
      userProfile = await retryOperation(async () => {
        return await prisma.teacher.findUnique({
          where: { userId: decoded.userId },
        });
      });
      userName = userProfile
        ? `${userProfile.firstName}-${userProfile.lastName}`
        : "teacher";
    } else if (decoded.userType === "SCHOOL") {
      userProfile = await retryOperation(async () => {
        return await prisma.school.findUnique({
          where: { userId: decoded.userId },
        });
      });
      userName = userProfile ? userProfile.name : "school";
    }

    if (!userProfile) {
      return res.status(404).json({ error: "User profile not found" });
    }

    // Process file upload using multer
    await new Promise((resolve, reject) => {
      upload.single("file")(req, res, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { type } = req.body; // 'resume', 'photo', 'portfolio', 'certificate', 'logo', 'coverPhoto'

    // Validate file type based on upload type and user type
    const allowedTypes = {
      teacher: ["resume", "photo", "portfolio", "certificate"],
      school: ["logo", "coverPhoto", "photo", "certificate"],
    };

    const userTypeKey = decoded.userType.toLowerCase();
    if (
      !allowedTypes[userTypeKey] ||
      !allowedTypes[userTypeKey].includes(type)
    ) {
      return res.status(400).json({
        error: `Invalid file type for ${decoded.userType}. Allowed: ${allowedTypes[userTypeKey].join(", ")}`,
      });
    }

    // Validate file MIME type based on upload type
    const fileTypeValidation = {
      photo: ["image/jpeg", "image/png", "image/webp"],
      logo: ["image/jpeg", "image/png", "image/webp"],
      coverPhoto: ["image/jpeg", "image/png", "image/webp"],
      resume: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      portfolio: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      certificate: ["application/pdf", "image/jpeg", "image/png"],
    };

    if (!fileTypeValidation[type].includes(req.file.mimetype)) {
      return res.status(400).json({
        error: `Invalid file type for ${type}. Allowed: ${fileTypeValidation[type].join(", ")}`,
      });
    }

    // Generate blob path with proper structure
    const blobPath = generateBlobPath(
      decoded.userType,
      userProfile.id,
      userName,
      type,
      req.file.originalname,
    );

    // Get old file URL for deletion
    let oldFileUrl = null;
    if (decoded.userType === "TEACHER") {
      switch (type) {
        case "resume":
          oldFileUrl = userProfile.resumeUrl;
          break;
        case "photo":
          oldFileUrl = userProfile.photoUrl;
          break;
        case "portfolio":
          oldFileUrl = userProfile.portfolioUrl;
          break;
      }
    } else if (decoded.userType === "SCHOOL") {
      switch (type) {
        case "logo":
          oldFileUrl = userProfile.logoUrl;
          break;
        case "coverPhoto":
          oldFileUrl = userProfile.coverPhotoUrl;
          break;
        case "photo":
          oldFileUrl = userProfile.photoUrl;
          break;
      }
    }

    // Upload to Vercel Blob
    const { url } = await put(blobPath, req.file.buffer, {
      access: "public",
      contentType: req.file.mimetype,
      addRandomSuffix: false,
    });

    // Update user profile with new file URL
    if (decoded.userType === "TEACHER") {
      const updateData = { lastActive: new Date() };
      
      switch (type) {
        case "resume":
          updateData.resumeUrl = url;
          break;
        case "photo":
          updateData.photoUrl = url;
          break;
        case "portfolio":
          updateData.portfolioUrl = url;
          break;
      }

      await retryOperation(async () => {
        return await prisma.teacher.update({
          where: { id: userProfile.id },
          data: updateData,
        });
      });
    } else if (decoded.userType === "SCHOOL") {
      const updateData = {};
      
      switch (type) {
        case "logo":
          updateData.logoUrl = url;
          break;
        case "coverPhoto":
          updateData.coverPhotoUrl = url;
          break;
        case "photo":
          updateData.photoUrl = url;
          break;
      }

      await retryOperation(async () => {
        return await prisma.school.update({
          where: { id: userProfile.id },
          data: updateData,
        });
      });
    }

    // Delete old file if it exists
    if (oldFileUrl) {
      await deleteOldFile(oldFileUrl);
    }

    // Log activity
    await retryOperation(async () => {
      return await prisma.activityLog.create({
        data: {
          userId: decoded.userId,
          action: "FILE_UPLOADED",
          details: {
            type,
            filename: blobPath,
            originalname: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            url: url,
          },
          ipAddress:
            req.headers["x-forwarded-for"] || req.connection.remoteAddress,
          userAgent: req.headers["user-agent"],
        },
      });
    });

    return res.status(200).json({
      message: "File uploaded successfully",
      fileUrl: url,
      filename: blobPath,
      type,
      size: req.file.size,
      originalName: req.file.originalname,
    });
  } catch (error) {
    console.error("File upload error:", error);

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    if (error.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ error: "File too large. Maximum size is 10MB" });
    }

    if (error.message && error.message.includes("Invalid file type")) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({
      error: "File upload failed",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    await prisma.$disconnect();
  }
}

// Configure body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};
