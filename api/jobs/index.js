import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Helper function to retry database operations with exponential backoff
async function retryOperation(operation, maxRetries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const isConnectionError = 
        error.message?.includes("Engine was empty") ||
        error.message?.includes("Engine is not yet connected") ||
        error.message?.includes("connection") ||
        error.code === "P1001" ||
        error.code === "P1017" ||
        error.code === "P1008" ||
        error.name === "PrismaClientUnknownRequestError";

      if (isConnectionError && attempt < maxRetries) {
        console.log(`Connection error on attempt ${attempt}, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
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

    if (req.method === "GET") {
      // Get jobs based on user type
      let jobs;

      if (decoded.userType === "SCHOOL") {
        // Schools see their own jobs
        const school = await retryOperation(async () => {
          return await prisma.school.findUnique({
            where: { userId: decoded.userId },
          });
        });

        if (!school) {
          return res.status(404).json({ error: "School profile not found" });
        }

        jobs = await retryOperation(async () => {
          const allJobs = await prisma.job.findMany({
            where: { schoolId: school.id },
            include: {
              school: true,
              applications: {
                include: {
                  teacher: true,
                },
              },
              _count: {
                select: { applications: true },
              },
            },
            orderBy: { createdAt: "desc" },
          });

          // Auto-close jobs with passed deadlines
          const now = new Date();
          const jobsToClose = allJobs.filter(job => {
            if (job.status === "ACTIVE") {
              const deadlineDate = new Date(job.deadline);
              deadlineDate.setHours(23, 59, 59, 999); // End of deadline day
              return now > deadlineDate;
            }
            return false;
          });

          // Update jobs with passed deadlines to CLOSED
          if (jobsToClose.length > 0) {
            await Promise.all(
              jobsToClose.map(job =>
                prisma.job.update({
                  where: { id: job.id },
                  data: { status: "CLOSED" },
                })
              )
            );
            // Update the jobs array with new statuses
            jobsToClose.forEach(closedJob => {
              const index = allJobs.findIndex(j => j.id === closedJob.id);
              if (index !== -1) {
                allJobs[index].status = "CLOSED";
              }
            });
          }

          return allJobs;
        });
      } else {
        // Teachers see all active jobs
        jobs = await retryOperation(async () => {
          return await prisma.job.findMany({
            where: {
              status: {
                in: ["ACTIVE", "DRAFT"],
              },
            },
            include: {
              school: true,
              _count: {
                select: { applications: true },
              },
            },
            orderBy: { createdAt: "desc" },
          });
        });
      }

      return res.status(200).json({ jobs });
    } else if (req.method === "POST") {
      // Only schools can create jobs
      if (decoded.userType !== "SCHOOL") {
        return res
          .status(403)
          .json({ error: "Only schools can create job postings" });
      }

      const school = await retryOperation(async () => {
        return await prisma.school.findUnique({
          where: { userId: decoded.userId },
        });
      });

      if (!school) {
        return res.status(404).json({ error: "School profile not found" });
      }

      // Check subscription status before allowing job posting
      const subscriptionStatus = school.subscriptionStatus?.toLowerCase();
      if (subscriptionStatus === "cancelled" || subscriptionStatus === "past_due") {
        return res.status(403).json({
          error: "Subscription expired",
          message: subscriptionStatus === "cancelled"
            ? "Your subscription has expired. Please renew your subscription to post new jobs."
            : "Your payment is past due. Please update your payment method to continue posting jobs.",
          subscriptionStatus: school.subscriptionStatus,
          subscriptionEndDate: school.subscriptionEndDate,
          redirectUrl: "/schools/subscription",
        });
      }

      // Check if subscription is active
      if (subscriptionStatus !== "active" && !req.body.status === 'DRAFT') {
        return res.status(403).json({
          error: "Active subscription required",
          message: "An active subscription is required to post jobs. Please subscribe or renew your subscription.",
          subscriptionStatus: school.subscriptionStatus,
          redirectUrl: "/pricing",
        });
      }

      // Check if school profile is complete before allowing job posting
      // Only check for non-draft jobs
      // Only require the same fields that are mandatory during account registration
      const isDraft = req.body.status === 'DRAFT';
      
      if (!isDraft) {
        // Only require the 4 fields that are mandatory during registration:
        // name, contactName, city, country
        const requiredFields = [
          school.name,
          school.contactName,
          school.city,
          school.country,
        ];

        const missingFields = requiredFields
          .map((field, index) => {
            const fieldNames = ["name", "contactName", "city", "country"];
            return field && field.toString().trim() ? null : fieldNames[index];
          })
          .filter(Boolean);

        if (missingFields.length > 0) {
          return res.status(400).json({ 
            error: "Complete your school profile before posting jobs",
            message: "Please complete your school profile with all required information before posting job openings.",
            missingFields,
            profileComplete: false
          });
        }
      }

      const {
        title,
        subjectsTaught,
        studentAgeGroupMin,
        studentAgeGroupMax,
        startDate,
        contractLength,
        description,
        city,
        country,
        salary,
        type,
        deadline,
        teachingHoursPerWeek,
        qualification,
        experience,
        language,
        visaRequired,
        teachingLicenseRequired,
        kazakhLanguageRequired,
        localCertificationRequired,
        benefits,
        requirements,
        status,
        useSchoolProfile,
        schoolDescription,
        useSchoolBenefits,
      } = req.body;

      // Validate required fields
      if (
        !title ||
        !description ||
        !city ||
        !country ||
        !salary ||
        !type ||
        !deadline
      ) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Parse dates and numbers
      let parsedStartDate = null;
      if (startDate) {
        const startDateObj = new Date(startDate);
        if (!isNaN(startDateObj.getTime())) {
          parsedStartDate = startDateObj;
        }
      }

      let parsedStudentAgeGroupMin = null;
      if (studentAgeGroupMin !== undefined && studentAgeGroupMin !== null) {
        const min = parseInt(studentAgeGroupMin);
        if (!isNaN(min) && min >= 0) {
          parsedStudentAgeGroupMin = min;
        }
      }

      let parsedStudentAgeGroupMax = null;
      if (studentAgeGroupMax !== undefined && studentAgeGroupMax !== null) {
        const max = parseInt(studentAgeGroupMax);
        if (!isNaN(max) && max >= 0) {
          parsedStudentAgeGroupMax = max;
        }
      }

      const job = await retryOperation(async () => {
        return await prisma.job.create({
          data: {
            schoolId: school.id,
            title,
            subjectsTaught: subjectsTaught || null,
            studentAgeGroupMin: parsedStudentAgeGroupMin,
            studentAgeGroupMax: parsedStudentAgeGroupMax,
            startDate: parsedStartDate,
            contractLength: contractLength || null,
            description,
            city,
            country,
            salary,
            type: type.toUpperCase(),
            status: status || "ACTIVE",
            deadline: new Date(deadline),
            teachingHoursPerWeek: teachingHoursPerWeek || null,
            qualification: qualification || "",
            experience: experience || "",
            language: language || "English",
            visaRequired: visaRequired || false,
            teachingLicenseRequired: teachingLicenseRequired || false,
            kazakhLanguageRequired: kazakhLanguageRequired || false,
            localCertificationRequired: localCertificationRequired || false,
            benefits,
            requirements,
            useSchoolProfile: useSchoolProfile !== false,
            schoolDescription:
              useSchoolProfile === false ? schoolDescription : null,
            useSchoolBenefits: useSchoolBenefits !== undefined ? useSchoolBenefits : true,
          },
          include: {
            school: true,
          },
        });
      });

      // If school description is missing and useSchoolProfile is true, 
      // update school description from job description or schoolDescription
      // Also update if a custom schoolDescription was provided
      if (useSchoolProfile !== false && !school.description) {
        const descriptionToUse = schoolDescription || description || "";
        if (descriptionToUse && descriptionToUse.trim()) {
          try {
            await retryOperation(async () => {
              return await prisma.school.update({
                where: { id: school.id },
                data: { 
                  description: descriptionToUse.substring(0, 1000), // Limit length but allow more than 500
                  updatedAt: new Date(),
                },
              });
            });
            console.log("✅ Updated school description from job posting");
          } catch (updateError) {
            console.error("Failed to update school description:", updateError);
            // Don't fail the job creation if description update fails
          }
        }
      } else if (useSchoolProfile === false && schoolDescription && schoolDescription.trim()) {
        // If custom description provided, also update school profile if it's empty
        if (!school.description || school.description.trim() === "") {
          try {
            await retryOperation(async () => {
              return await prisma.school.update({
                where: { id: school.id },
                data: { 
                  description: schoolDescription.substring(0, 1000),
                  updatedAt: new Date(),
                },
              });
            });
            console.log("✅ Updated school description from custom job description");
          } catch (updateError) {
            console.error("Failed to update school description:", updateError);
          }
        }
      }

      // Log activity with retry logic
      await retryOperation(async () => {
        return await prisma.activityLog.create({
          data: {
            userId: decoded.userId,
            action: "JOB_CREATED",
            details: { jobId: job.id, title },
            ipAddress:
              req.headers["x-forwarded-for"] || req.connection.remoteAddress,
            userAgent: req.headers["user-agent"],
          },
        });
      });

      return res.status(201).json({
        message: "Job created successfully",
        job,
      });
    } else if (req.method === "DELETE") {
      // Schools can delete their own jobs (typically drafts)
      if (decoded.userType !== "SCHOOL") {
        return res.status(403).json({ error: "Only schools can delete jobs" });
      }

      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: "Job ID is required" });
      }

      const school = await retryOperation(async () => {
        return await prisma.school.findUnique({
          where: { userId: decoded.userId },
        });
      });

      if (!school) {
        return res.status(404).json({ error: "School profile not found" });
      }

      // Check if job belongs to this school
      const job = await retryOperation(async () => {
        return await prisma.job.findFirst({
          where: {
            id: id,
            schoolId: school.id,
          },
        });
      });

      if (!job) {
        return res.status(404).json({ error: "Job not found or unauthorized" });
      }

      // Only allow deletion of draft jobs or closed jobs with no applications
      if (job.status !== "DRAFT") {
        const applicationCount = await retryOperation(async () => {
          return await prisma.application.count({
            where: { jobId: id },
          });
        });

        if (applicationCount > 0) {
          return res.status(400).json({ 
            error: "Cannot delete job with applications. Close the job instead." 
          });
        }
      }

      // Delete the job with retry logic
      await retryOperation(async () => {
        return await prisma.job.delete({
          where: { id: id },
        });
      });

      // Log activity with retry logic
      await retryOperation(async () => {
        return await prisma.activityLog.create({
          data: {
            userId: decoded.userId,
            action: "JOB_DELETED",
            details: { 
              jobId: id, 
              jobTitle: job.title,
              jobStatus: job.status
            },
            ipAddress: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
            userAgent: req.headers["user-agent"],
          },
        });
      });

      return res.status(200).json({ message: "Job deleted successfully" });

    } else {
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      return res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (error) {
    console.error("Jobs API error:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    if (error.stack) {
      console.error("Error stack:", error.stack);
    }

    // Handle specific error types
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        error: error.name === "TokenExpiredError" ? "Token expired" : "Invalid token",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }

    // Handle Prisma connection errors
    const isPrismaConnectionError = 
      error.message?.includes("Engine was empty") ||
      error.message?.includes("Engine is not yet connected") ||
      error.message?.includes("connection") ||
      error.code === "P1001" ||
      error.code === "P1017" ||
      error.code === "P1008" ||
      error.name === "PrismaClientUnknownRequestError";

    if (isPrismaConnectionError) {
      console.error("Prisma connection error");
      
      return res.status(503).json({
        error: "Database connection error",
        message: "Unable to connect to database. Please try again in a moment.",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
        retry: true,
      });
    }

    return res.status(500).json({
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
      errorType: error.name || "UnknownError",
    });
  }
}
