import jwt from "jsonwebtoken";
import { prisma } from "../../_utils/prisma.js";

// Helper function to verify JWT token
function verifyToken(req) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Helper function to retry database operations
async function retryOperation(operation, maxRetries = 3, initialDelay = 150) {
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
        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * 2, 1000);
        continue;
      }
      throw error;
    }
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "Job ID is required" });
    }

    // Caching:
    // - If unauthenticated, this is purely public data → allow short CDN caching.
    // - If authenticated, response includes user-specific hasApplied/applicationStatus → do not cache.
    const hasAuthHeader = !!req.headers.authorization;
    if (hasAuthHeader) {
      res.setHeader("Cache-Control", "private, no-store");
    } else {
      res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=120");
    }

    // Get job with school information
    const job = await retryOperation(async () => {
      return await prisma.job.findUnique({
      where: { id },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            city: true,
            country: true,
            logoUrl: true,
            coverPhotoUrl: true,
            verified: true,
            description: true,
            website: true,
            studentCount: true,
            benefits: true,
            schoolType: true,
            established: true,
            studentAgeRangeMin: true,
            studentAgeRangeMax: true,
            averageClassSize: true,
            curriculum: true,
            teachingPhilosophy: true,
            streetAddress: true,
            state: true,
            postalCode: true,
            contactName: true,
            contactEmail: true,
            telephone: true,
            phoneCountryCode: true,
          },
        },
        _count: {
          select: { applications: true },
        },
      },
      });
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // For public access, only allow viewing of ACTIVE jobs
    // This prevents access to DRAFT, PAUSED, or CLOSED jobs by teachers
    if (job.status !== "ACTIVE") {
      return res.status(404).json({ 
        error: "Job not available",
        message: "This job posting is not currently active."
      });
    }

    // Also check if job deadline has passed
    // Compare with start of today to include jobs expiring today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const jobDeadline = new Date(job.deadline);
    jobDeadline.setHours(0, 0, 0, 0);
    
    if (jobDeadline < startOfToday) {
      return res.status(404).json({ 
        error: "Job expired",
        message: "This job posting has expired and is no longer accepting applications."
      });
    }

    // Check if user has already applied (if authenticated as teacher)
    let hasApplied = false;
    let applicationStatus = null;
    const decoded = verifyToken(req);
    
    if (decoded && decoded.userType === "TEACHER") {
      const teacher = await retryOperation(async () => {
        return await prisma.teacher.findUnique({
          where: { userId: decoded.userId },
          select: { id: true },
        });
      });

      if (teacher) {
        const existingApplication = await retryOperation(async () => {
          return await prisma.application.findFirst({
            where: {
              jobId: id,
              teacherId: teacher.id,
            },
            select: {
              id: true,
              status: true,
              createdAt: true,
            },
          });
        });

        if (existingApplication) {
          hasApplied = true;
          applicationStatus = existingApplication.status;
        }
      }
    }

    return res.status(200).json({ 
      job: {
        ...job,
        hasApplied,
        applicationStatus,
      }
    });

  } catch (error) {
    console.error("Public job detail API error:", error);

    return res.status(500).json({
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
} 