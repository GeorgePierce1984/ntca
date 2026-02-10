import jwt from "jsonwebtoken";
import { prisma } from "../_utils/prisma.js";
import Stripe from "stripe";
import { isDemoPremiumEmail } from "../_utils/demo-premium.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
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
        delay = Math.min(delay * 2, 2000); // Cap delay to keep requests snappy
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
              school: true, // needed for some UI surfaces
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

      // Demo premium allowlist (bypass Stripe & limits)
      const userForDemo = await retryOperation(async () => {
        return await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { email: true },
        });
      });
      const isDemoPremium = isDemoPremiumEmail(userForDemo?.email);

      // --- Subscription gating & job posting limits ---
      // Intended rules:
      // - No subscription: max 1 job EVER (lifetime). They can upgrade later to post more.
      // - Basic: max 5 job postings per billing period (month/year based on Stripe subscription)
      // - Standard: max 25 job postings per billing period
      // - Premium: unlimited
      //
      // We enforce this server-side using ActivityLog entries so deletion cannot bypass limits.
      const subscriptionStatus = (school.subscriptionStatus || "").toLowerCase();

      if (!isDemoPremium) {
      // If they have a subscription record but it's not in good standing, block (must renew)
      if (
        school.subscriptionId &&
        (subscriptionStatus === "cancelled" || subscriptionStatus === "past_due")
      ) {
        return res.status(403).json({
          error: "Subscription expired",
          code: "SUBSCRIPTION_EXPIRED",
          message:
            subscriptionStatus === "cancelled"
              ? "Your subscription has expired. Please renew your subscription to post new jobs."
              : "Your payment is past due. Please update your payment method to continue posting jobs.",
          subscriptionStatus: school.subscriptionStatus,
          subscriptionEndDate: school.subscriptionEndDate,
          redirectUrl: "/schools/subscription",
        });
      }

      // Helper to return a consistent upgrade response
      const denyForLimit = ({
        message,
        planName,
        limit,
        used,
        periodStart,
        periodEnd,
      }) => {
        return res.status(403).json({
          error: "Job posting limit reached",
          code: "JOB_LIMIT_REACHED",
          message,
          planName: planName || null,
          limit: typeof limit === "number" ? limit : null,
          used: typeof used === "number" ? used : null,
          periodStart: periodStart ? periodStart.toISOString() : null,
          periodEnd: periodEnd ? periodEnd.toISOString() : null,
          redirectUrl: "/schools/subscription",
        });
      };

      // FREE / no active subscription
      if (!school.subscriptionId || subscriptionStatus !== "active") {
        const lifetimeUsed = await retryOperation(async () => {
          return await prisma.activityLog.count({
            where: {
              userId: decoded.userId,
              action: "JOB_CREATED",
            },
          });
        });

        if (lifetimeUsed >= 1) {
          return denyForLimit({
            message:
              "Free accounts can post 1 job total. Upgrade your subscription to post more jobs and unlock premium features.",
            planName: "Free",
            limit: 1,
            used: lifetimeUsed,
          });
        }
      } else {
        // Active subscription: enforce per-billing-period limits using Stripe's rolling window
        if (!process.env.STRIPE_SECRET_KEY) {
          return res.status(500).json({
            error: "Server misconfigured: STRIPE_SECRET_KEY is not set",
          });
        }

        let stripeSubscription;
        try {
          stripeSubscription = await stripe.subscriptions.retrieve(
            school.subscriptionId,
            { expand: ["items.data.price.product"] },
          );
        } catch (e) {
          console.error("Failed to retrieve Stripe subscription:", e);
          return res.status(503).json({
            error: "Unable to verify subscription details. Please try again.",
            code: "SUBSCRIPTION_LOOKUP_FAILED",
            redirectUrl: "/schools/subscription",
          });
        }

        const price = stripeSubscription?.items?.data?.[0]?.price;
        const nickname = (price?.nickname || price?.product?.name || "").toString();
        const jobLimitMeta = price?.metadata?.jobLimit;

        const nicknameLower = nickname.toLowerCase();
        let planName = nickname || "Subscription";
        let periodLimit = null; // null means unlimited

        // Prefer Stripe price metadata.jobLimit if present
        if (typeof jobLimitMeta === "string" && jobLimitMeta.trim()) {
          if (jobLimitMeta.toLowerCase() === "unlimited") {
            periodLimit = null;
          } else {
            const parsed = parseInt(jobLimitMeta, 10);
            if (!isNaN(parsed) && parsed >= 0) {
              periodLimit = parsed;
            }
          }
        } else if (nicknameLower.includes("basic")) {
          periodLimit = 5;
          planName = "Basic";
        } else if (nicknameLower.includes("standard")) {
          periodLimit = 25;
          planName = "Standard";
        } else if (nicknameLower.includes("premium")) {
          periodLimit = null;
          planName = "Premium";
        }

        // If we still can't determine a limit, fail closed (ask user to contact support/upgrade)
        if (periodLimit === null && !nicknameLower.includes("premium") && jobLimitMeta !== "Unlimited") {
          // null may also mean "unknown" in this branch; guard above didn’t classify
          // If jobLimitMeta is absent and nickname doesn't match known tiers, treat as standard safe default (25)
          periodLimit = 25;
        }

        const periodStart = new Date(stripeSubscription.current_period_start * 1000);
        const periodEnd = new Date(stripeSubscription.current_period_end * 1000);

        if (typeof periodLimit === "number") {
          const usedInPeriod = await retryOperation(async () => {
            return await prisma.activityLog.count({
              where: {
                userId: decoded.userId,
                action: "JOB_CREATED",
                createdAt: {
                  gte: periodStart,
                  lt: periodEnd,
                },
              },
            });
          });

          if (usedInPeriod >= periodLimit) {
            return denyForLimit({
              message: `You've reached your ${planName} plan job posting limit (${periodLimit} per billing period). Please upgrade your subscription to post more jobs.`,
              planName,
              limit: periodLimit,
              used: usedInPeriod,
              periodStart,
              periodEnd,
            });
          }
        }
      }
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
