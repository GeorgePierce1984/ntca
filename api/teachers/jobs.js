import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

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

    const teacher = await prisma.teacher.findUnique({
      where: { userId: decoded.userId },
    });

    if (!teacher) {
      return res.status(404).json({ error: "Teacher profile not found" });
    }

    if (req.method === "GET") {
      const {
        page = 1,
        limit = 20,
        search,
        location,
        country,
        salary_min,
        salary_max,
        type,
        qualification,
        visa_required,
        remote,
        sort = "latest",
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Get start of today (midnight) for deadline comparison
      // This ensures jobs with deadlines today are still visible
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      // Build search filters
      const where = {
        status: "ACTIVE",
        deadline: {
          gte: startOfToday,
        },
      };

      // Text search in title, description, city, and country
      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { city: { contains: search, mode: "insensitive" } },
          { country: { contains: search, mode: "insensitive" } },
        ];
      }

      // Location filter (searches both city and country)
      if (location) {
        where.OR = [
          ...(where.OR || []),
          { city: { contains: location, mode: "insensitive" } },
          { country: { contains: location, mode: "insensitive" } },
        ];
      }

      // Country filter - search in school's country field
      if (country) {
        where.school = {
          country: { contains: country, mode: "insensitive" },
        };
      }

      // Salary range filter (basic string matching for now)
      if (salary_min || salary_max) {
        // This is a simplified implementation - in production you'd want proper salary parsing
        if (salary_min) {
          where.salary = { contains: salary_min };
        }
      }

      // Employment type filter
      if (type) {
        where.type = type.toUpperCase();
      }

      // Qualification filter
      if (qualification) {
        where.qualification = { contains: qualification, mode: "insensitive" };
      }

      // Visa requirement filter
      if (visa_required !== undefined) {
        where.visaRequired = visa_required === "true";
      }

      // Sort options
      let orderBy = { createdAt: "desc" }; // default: latest

      switch (sort) {
        case "salary_high":
          orderBy = { salary: "desc" };
          break;
        case "salary_low":
          orderBy = { salary: "asc" };
          break;
        case "deadline":
          orderBy = { deadline: "asc" };
          break;
        case "oldest":
          orderBy = { createdAt: "asc" };
          break;
        default:
          orderBy = { createdAt: "desc" };
      }

      const [jobs, totalJobs] = await Promise.all([
        prisma.job.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy,
          include: {
            school: {
              select: {
                id: true,
                name: true,
                city: true,
                country: true,
                logoUrl: true,
                verified: true,
                description: true,
              },
            },
            _count: {
              select: { applications: true },
            },
            applications: {
              where: { teacherId: teacher.id },
              select: { id: true, status: true, createdAt: true },
            },
          },
        }),
        prisma.job.count({ where }),
      ]);

      // Add application status for this teacher
      const jobsWithStatus = jobs.map((job) => ({
        ...job,
        hasApplied: job.applications.length > 0,
        applicationStatus: job.applications[0]?.status || null,
        applicationDate: job.applications[0]?.createdAt || null,
        applications: undefined, // Remove applications array from response
      }));

      const totalPages = Math.ceil(totalJobs / parseInt(limit));

      return res.status(200).json({
        jobs: jobsWithStatus,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalJobs,
          totalPages,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1,
        },
      });
    } else if (req.method === "POST") {
      // Apply for a job
      const { jobId, coverLetter, resumeUrl, portfolioUrl } = req.body;

      if (!jobId) {
        return res.status(400).json({ error: "Job ID is required" });
      }

      // Check if job exists and is active
      const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: {
          school: {
            select: {
              name: true,
              city: true,
              country: true,
            },
          },
        },
      });

      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      if (job.status !== "ACTIVE") {
        return res
          .status(400)
          .json({ error: "This job is no longer accepting applications" });
      }

      // Check if deadline has passed (compare with start of today to include today's deadline)
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const jobDeadline = new Date(job.deadline);
      jobDeadline.setHours(0, 0, 0, 0);
      
      if (jobDeadline < startOfToday) {
        return res
          .status(400)
          .json({ error: "Application deadline has passed" });
      }

      // Check if already applied
      const existingApplication = await prisma.application.findUnique({
        where: {
          jobId_teacherId: {
            jobId,
            teacherId: teacher.id,
          },
        },
      });

      if (existingApplication) {
        return res
          .status(400)
          .json({ error: "You have already applied for this job" });
      }

      // Create application
      const application = await prisma.application.create({
        data: {
          jobId,
          teacherId: teacher.id,
          coverLetter,
          resumeUrl: resumeUrl || teacher.resumeUrl,
          portfolioUrl: portfolioUrl || teacher.portfolioUrl,
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

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: decoded.userId,
          action: "JOB_APPLICATION_SUBMITTED",
          details: {
            jobId,
            jobTitle: job.title,
            schoolName: job.school.name,
          },
          ipAddress:
            req.headers["x-forwarded-for"] || req.connection.remoteAddress,
          userAgent: req.headers["user-agent"],
        },
      });

      return res.status(201).json({
        message: "Application submitted successfully",
        application,
      });
    } else {
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (error) {
    console.error("Teacher jobs API error:", error);

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ error: "You have already applied for this job" });
    }

    return res.status(500).json({
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    await prisma.$disconnect();
  }
}
