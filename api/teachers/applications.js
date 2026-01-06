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
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const decoded = verifyToken(req);
    const { status, page = 1, limit = 20 } = req.query;

    // Only teachers can view their applications
    if (decoded.userType !== "TEACHER") {
      return res.status(403).json({ error: "Only teachers can view their applications" });
    }

    // Get teacher profile
    const teacher = await prisma.teacher.findUnique({
      where: { userId: decoded.userId },
    });

    if (!teacher) {
      return res.status(404).json({ error: "Teacher profile not found" });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filters
    const where = {
      teacherId: teacher.id,
    };

    if (status) {
      where.status = status.toUpperCase();
    }

    // Get applications with pagination
    const [applications, totalApplications] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take: parseInt(limit),
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
            },
          },
          notes: {
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.application.count({ where }),
    ]);

    // Get application statistics
    const stats = await prisma.application.groupBy({
      by: ["status"],
      where: { teacherId: teacher.id },
      _count: {
        status: true,
      },
    });

    // Format statistics
    const statistics = {
      total: totalApplications,
      APPLIED: 0,
      REVIEWING: 0,
      INTERVIEW: 0,
      DECLINED: 0,
      HIRED: 0,
    };

    stats.forEach((stat) => {
      statistics[stat.status] = stat._count.status;
    });

    // Format applications for response
    const formattedApplications = applications.map((app) => ({
      id: app.id,
      status: app.status,
      appliedAt: app.createdAt,
      updatedAt: app.updatedAt,
      coverLetter: app.coverLetter,
      resumeUrl: app.resumeUrl,
      portfolioUrl: app.portfolioUrl,
      interviewDate: app.interviewDate,
      rating: app.rating,
      feedback: app.feedback,
      notes: app.notes,
      job: {
        id: app.job.id,
        title: app.job.title,
        description: app.job.description,
        location: app.job.location,
        salary: app.job.salary,
        type: app.job.type,
        status: app.job.status,
        deadline: app.job.deadline,
        createdAt: app.job.createdAt,
        qualification: app.job.qualification,
        experience: app.job.experience,
        language: app.job.language,
        visaRequired: app.job.visaRequired,
        benefits: app.job.benefits,
        requirements: app.job.requirements,
        school: app.job.school,
      },
    }));

    const totalPages = Math.ceil(totalApplications / parseInt(limit));

    return res.status(200).json({
      applications: formattedApplications,
      statistics,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalApplications,
        totalPages,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
      },
    });

  } catch (error) {
    console.error("Get teacher applications error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }

    return res.status(500).json({
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    await prisma.$disconnect();
  }
}
