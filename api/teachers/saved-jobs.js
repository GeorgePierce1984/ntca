import jwt from "jsonwebtoken";
import { prisma } from "../_utils/prisma.js";

// Helper function to retry database operations (keep lightweight; avoid forced sleeps on every request)
async function retryOperation(operation, maxRetries = 3, initialDelay = 250) {
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
        delay = Math.min(delay * 2, 2000);
        continue;
      }
      throw error;
    }
  }
}

// Middleware to verify JWT token
function verifyToken(req) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) throw new Error("No token provided");

  return jwt.verify(token, process.env.JWT_SECRET);
}

export default async function handler(req, res) {
  try {
    const decoded = verifyToken(req);

    // Only teachers can access this endpoint
    if (decoded.userType !== "TEACHER") {
      return res.status(403).json({ error: "Teacher access required" });
    }

    const teacher = await retryOperation(async () => {
      return await prisma.teacher.findUnique({
        where: { userId: decoded.userId },
      });
    });

    if (!teacher) {
      return res.status(404).json({ error: "Teacher profile not found" });
    }

    if (req.method === "GET") {
      // Get all saved jobs for the teacher
      const savedJobs = await retryOperation(async () => {
        return await prisma.savedJob.findMany({
        where: { teacherId: teacher.id },
        include: {
          job: {
            include: {
              school: {
                select: {
                  id: true,
                  name: true,
                  city: true,
                  country: true,
                  logoUrl: true,
                  verified: true,
                },
              },
              _count: {
                select: { applications: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        });
      });

      // Avoid N+1 queries: fetch all applications for these jobs in one query
      const jobIds = savedJobs.map((s) => s.jobId);
      const applications = jobIds.length
        ? await retryOperation(async () => {
            return await prisma.application.findMany({
              where: {
                teacherId: teacher.id,
                jobId: { in: jobIds },
              },
              select: {
                jobId: true,
                status: true,
                createdAt: true,
              },
            });
          })
        : [];

      const appByJobId = new Map(applications.map((a) => [a.jobId, a]));

      const savedJobsWithStatus = savedJobs.map((savedJob) => {
        const application = appByJobId.get(savedJob.jobId);
        return {
          ...savedJob,
          job: {
            ...savedJob.job,
            hasApplied: !!application,
            applicationStatus: application?.status || null,
            applicationDate: application?.createdAt || null,
          },
        };
      });

      return res.status(200).json({ savedJobs: savedJobsWithStatus });
    } else if (req.method === "POST") {
      // Save a job
      let body = req.body;
      if (typeof body === "string") {
        try {
          body = JSON.parse(body);
        } catch {
          body = null;
        }
      }

      const jobIdFromBody = body?.jobId ? String(body.jobId) : null;
      const jobIdFromPath = req.url.split("/").pop();
      const jobId = jobIdFromBody || jobIdFromPath;

      if (!jobId || jobId === "saved-jobs") {
        return res.status(400).json({ error: "Job ID is required" });
      }

      // Check if job exists and is active
      const job = await retryOperation(async () => {
        return await prisma.job.findUnique({
          where: { id: jobId },
        });
      });

      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      if (job.status !== "ACTIVE") {
        return res.status(400).json({ error: "This job is no longer active" });
      }

      // Check if already saved
      const existingSavedJob = await retryOperation(async () => {
        return await prisma.savedJob.findUnique({
        where: {
          teacherId_jobId: {
            teacherId: teacher.id,
            jobId,
          },
        },
        });
      });

      if (existingSavedJob) {
        return res.status(400).json({ error: "Job already saved" });
      }

      // Create saved job
      const savedJob = await retryOperation(async () => {
        return await prisma.savedJob.create({
        data: {
          teacherId: teacher.id,
          jobId,
        },
        include: {
          job: {
            include: {
              school: {
                select: {
                  name: true,
                  city: true,
                  country: true,
                },
              },
            },
          },
        },
        });
      });

      // Log activity
      await retryOperation(async () => {
        return await prisma.activityLog.create({
          data: {
            userId: decoded.userId,
            action: "JOB_SAVED",
            details: {
              jobId,
              jobTitle: job.title,
            },
            ipAddress:
              req.headers["x-forwarded-for"] || req.connection.remoteAddress,
            userAgent: req.headers["user-agent"],
          },
        });
      });

      return res.status(201).json({
        message: "Job saved successfully",
        savedJob,
      });
    } else if (req.method === "DELETE") {
      // Unsave a job
      let body = req.body;
      if (typeof body === "string") {
        try {
          body = JSON.parse(body);
        } catch {
          body = null;
        }
      }

      const jobIdFromBody = body?.jobId ? String(body.jobId) : null;
      const jobIdFromPath = req.url.split("/").pop();
      const jobId = jobIdFromBody || jobIdFromPath;

      if (!jobId || jobId === "saved-jobs") {
        return res.status(400).json({ error: "Job ID is required" });
      }

      // Find and delete saved job
      const savedJob = await retryOperation(async () => {
        return await prisma.savedJob.findUnique({
          where: {
            teacherId_jobId: {
              teacherId: teacher.id,
              jobId,
            },
          },
        });
      });

      if (!savedJob) {
        return res.status(404).json({ error: "Saved job not found" });
      }

      await retryOperation(async () => {
        return await prisma.savedJob.delete({
          where: {
            id: savedJob.id,
          },
        });
      });

      // Log activity
      await retryOperation(async () => {
        return await prisma.activityLog.create({
        data: {
          userId: decoded.userId,
          action: "JOB_UNSAVED",
          details: {
            jobId,
          },
          ipAddress:
            req.headers["x-forwarded-for"] || req.connection.remoteAddress,
          userAgent: req.headers["user-agent"],
        },
        });
      });

      return res.status(200).json({
        message: "Job removed from saved jobs",
      });
    } else {
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      return res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (error) {
    console.error("Saved jobs API error:", error);

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    if (error.code === "P2002") {
      return res.status(400).json({ error: "Job already saved" });
    }

    return res.status(500).json({
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}
