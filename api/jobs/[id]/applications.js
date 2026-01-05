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
    const { id: jobId } = req.query;

    // Only schools can view applications for their jobs
    if (decoded.userType !== "SCHOOL") {
      return res.status(403).json({ error: "Only schools can view job applications" });
    }

    // Get school profile
    const school = await prisma.school.findUnique({
      where: { userId: decoded.userId },
    });

    if (!school) {
      return res.status(404).json({ error: "School profile not found" });
    }

    // Get job and verify ownership
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        school: true,
      },
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (job.schoolId !== school.id) {
      return res.status(403).json({ error: "You can only view applications for your own jobs" });
    }

    // Get all applications for this job
    const applications = await prisma.application.findMany({
      where: { jobId: jobId },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            phoneCountryCode: true,
            city: true,
            country: true,
            qualification: true,
            experienceYears: true,
            experience: true,
            bio: true,
            resumeUrl: true,
            portfolioUrl: true,
            photoUrl: true,
            teachingLicense: true,
            certifications: true,
            subjects: true,
            ageGroups: true,
            languageSkills: true,
            currentLocation: true,
            willingToRelocate: true,
            availability: true,
            startDate: true,
            education: true,
            specializations: true,
            previousSchools: true,
            salaryExpectation: true,
            verified: true,
            rating: true,
          },
        },
        notes: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Group applications by status
    const applicationsByStatus = {
      APPLIED: [],
      REVIEWING: [],
      INTERVIEW: [],
      DECLINED: [],
      HIRED: [],
    };

    applications.forEach((app) => {
      applicationsByStatus[app.status].push(app);
    });

    // Calculate statistics
    const stats = {
      total: applications.length,
      new: applicationsByStatus.APPLIED.length,
      reviewing: applicationsByStatus.REVIEWING.length,
      interview: applicationsByStatus.INTERVIEW.length,
      declined: applicationsByStatus.DECLINED.length,
      hired: applicationsByStatus.HIRED.length,
    };

    return res.status(200).json({
      job: {
        id: job.id,
        title: job.title,
        location: job.location,
        type: job.type,
        status: job.status,
        deadline: job.deadline,
        createdAt: job.createdAt,
      },
      applications,
      applicationsByStatus,
      stats,
    });

  } catch (error) {
    console.error("Get job applications error:", error);

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
