import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

    // Get job with school information
    const job = await prisma.job.findUnique({
      where: { id },
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
            website: true,
            studentCount: true,
            benefits: true,
          },
        },
        _count: {
          select: { applications: true },
        },
      },
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

    return res.status(200).json({ job });

  } catch (error) {
    console.error("Public job detail API error:", error);

    return res.status(500).json({
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    await prisma.$disconnect();
  }
} 