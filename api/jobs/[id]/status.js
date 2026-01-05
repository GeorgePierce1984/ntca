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
  if (req.method !== "PATCH") {
    res.setHeader("Allow", ["PATCH"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const decoded = verifyToken(req);
    const { id: jobId } = req.query;
    const { status } = req.body;

    // Only schools can update job status
    if (decoded.userType !== "SCHOOL") {
      return res.status(403).json({ error: "Only schools can update job status" });
    }

    // Validate status
    const validStatuses = ["ACTIVE", "PAUSED", "CLOSED"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be ACTIVE, PAUSED, or CLOSED" });
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
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (job.schoolId !== school.id) {
      return res.status(403).json({ error: "You can only update your own job postings" });
    }

    // Update job status
    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        status,
        updatedAt: new Date()
      },
      include: {
        school: true,
        _count: {
          select: { applications: true },
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: decoded.userId,
        action: "JOB_STATUS_UPDATED",
        details: {
          jobId: jobId,
          jobTitle: job.title,
          oldStatus: job.status,
          newStatus: status,
        },
        ipAddress: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
        userAgent: req.headers["user-agent"],
      },
    });

    // If job is closed, notify all applicants
    if (status === "CLOSED") {
      const applications = await prisma.application.findMany({
        where: {
          jobId: jobId,
          status: {
            in: ["APPLIED", "REVIEWING", "INTERVIEW"]
          }
        },
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  email: true
                }
              }
            }
          }
        }
      });

      // Send notification emails to applicants (async, don't wait)
      if (applications.length > 0) {
        applications.forEach(async (application) => {
          try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/email/send`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                to: application.teacher.user.email,
                subject: `Job Posting Closed: ${job.title}`,
                html: `
                  <h2>Job Posting Update</h2>
                  <p>The job posting you applied for has been closed.</p>
                  <h3>Job Details:</h3>
                  <ul>
                    <li><strong>Position:</strong> ${job.title}</li>
                    <li><strong>School:</strong> ${updatedJob.school.name}</li>
                    <li><strong>Location:</strong> ${job.location}</li>
                  </ul>
                  <p>If you haven't heard back from the school, you may want to follow up directly or explore other opportunities on our platform.</p>
                  <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/jobs" style="background-color: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Browse More Jobs</a></p>
                `,
              }),
            });
          } catch (error) {
            console.error("Failed to send notification email:", error);
          }
        });
      }
    }

    return res.status(200).json({
      message: `Job status updated to ${status}`,
      job: updatedJob,
    });

  } catch (error) {
    console.error("Job status update error:", error);

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
