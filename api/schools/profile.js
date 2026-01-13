import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

// Initialize Prisma client with serverless-optimized settings
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Helper function to ensure Prisma is connected
async function ensureConnected() {
  try {
    // In serverless, $connect() is usually sufficient
    // The engine will be ready when we make actual queries
    await prisma.$connect();
  } catch (error) {
    // If connection fails, disconnect and rethrow
    await prisma.$disconnect().catch(() => {});
    throw error;
  }
}

// Helper function to retry database operations with exponential backoff
async function retryOperation(operation, maxRetries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Ensure connection is active before operation
      await ensureConnected();
      return await operation();
    } catch (error) {
      const isConnectionError = 
        error.message?.includes("Engine was empty") ||
        error.message?.includes("Engine is not yet connected") ||
        error.message?.includes("connection") ||
        error.code === "P1001" ||
        error.code === "P1017" ||
        error.code === "P1008" ||
        error.code === "GenericFailure" ||
        error.name === "PrismaClientUnknownRequestError";

      if (isConnectionError && attempt < maxRetries) {
        console.log(`Connection error on attempt ${attempt}, retrying in ${delay}ms...`);
        // Disconnect completely and wait before retrying
        await prisma.$disconnect().catch(() => {});
        
        // For "Engine is not yet connected", wait longer for engine to initialize
        if (error.message?.includes("Engine is not yet connected")) {
          // Wait longer for engine initialization in serverless environments
          await new Promise(resolve => setTimeout(resolve, 1000 + (attempt * 500)));
        } else {
          // Wait with exponential backoff for other connection errors
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        }
        
        continue;
      }
      throw error;
    }
  }
}

// Middleware to verify JWT token
function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    const error = new Error("No authorization header provided");
    error.name = "NoTokenError";
    throw error;
  }

  const token = authHeader.replace("Bearer ", "").trim();
  if (!token || token === "null" || token === "undefined" || token.length === 0) {
    const error = new Error("No token provided");
    error.name = "NoTokenError";
    throw error;
  }

  // Validate token format (JWT should have 3 parts separated by dots)
  const tokenParts = token.split(".");
  if (tokenParts.length !== 3) {
    const error = new Error("Invalid token format");
    error.name = "JsonWebTokenError";
    throw error;
  }

  if (!process.env.JWT_SECRET) {
    const error = new Error("JWT_SECRET not configured");
    error.name = "ConfigError";
    throw error;
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    // Re-throw JWT errors with proper error names
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      throw error;
    }
    // Wrap other errors
    const jwtError = new Error(error.message || "Token verification failed");
    jwtError.name = error.name || "JsonWebTokenError";
    throw jwtError;
  }
}

export default async function handler(req, res) {
  try {
    const decoded = verifyToken(req);

    // Only schools can access this endpoint
    if (decoded.userType !== "SCHOOL") {
      return res.status(403).json({ error: "School access required" });
    }

    if (req.method === "GET") {
      // Get school profile with retry logic
      const school = await retryOperation(async () => {
        return await prisma.school.findUnique({
          where: { userId: decoded.userId },
          include: {
            user: {
              select: {
                email: true,
              },
            },
            _count: {
              select: {
                jobs: true,
              },
            },
          },
        });
      });

      if (!school) {
        console.error("School profile not found for userId:", decoded.userId);
        // Check if user exists with retry logic
        const user = await retryOperation(async () => {
          return await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, userType: true },
          });
        });
        
        if (!user) {
          return res.status(404).json({ 
            error: "User not found",
            details: "The user account does not exist"
          });
        }
        
        // If user exists but school profile is missing, create a basic profile
        // This can happen if webhook failed or profile creation was incomplete
        console.log("Creating missing school profile for user:", decoded.userId);
        try {
          const newSchool = await retryOperation(async () => {
            return await prisma.school.create({
            data: {
              userId: decoded.userId,
              name: "School Name", // Placeholder - user will need to update
              contactName: "Contact Name", // Placeholder
              telephone: "N/A", // Placeholder
              phoneCountryCode: "+1",
              streetAddress: "Address", // Placeholder
              city: "City", // Placeholder
              postalCode: "",
              country: "Kazakhstan", // Default
              schoolType: "private", // Default
              estimateJobs: "As needed", // Default
              verified: false,
            },
            include: {
              user: {
                select: {
                  email: true,
                },
              },
              _count: {
                select: {
                  jobs: true,
                },
              },
            },
          });
          });
          
          console.log("✅ Created missing school profile:", newSchool.id);
          
          // Return the newly created profile with completion calculation
          const requiredFields = [
            newSchool.name,
            newSchool.contactName,
            newSchool.telephone,
            newSchool.streetAddress,
            newSchool.city,
            newSchool.country,
            newSchool.schoolType,
          ];

          const optionalButImportantFields = [
            newSchool.description,
            newSchool.website,
            newSchool.logoUrl,
            newSchool.established,
            newSchool.studentCount,
          ];

          const requiredComplete = requiredFields.every(field => field && field.toString().trim());
          const optionalComplete = optionalButImportantFields.filter(field =>
            field && field.toString().trim()
          ).length;

          const profileComplete = requiredComplete;

          const userData = await retryOperation(async () => {
            return await prisma.user.findUnique({
              where: { id: decoded.userId },
              select: {
                stripeCustomerId: true,
              },
            });
          });

          // Return 200 (not 201) so it doesn't trigger error handling
          return res.status(200).json({
            school: {
              ...newSchool,
              profileComplete,
              completionPercentage: Math.round(
                ((requiredFields.filter(f => f && f.toString().trim()).length + optionalComplete) / 
                 (requiredFields.length + optionalButImportantFields.length)) * 100
              ),
            },
            subscriptionId: newSchool.subscriptionId,
            subscriptionStatus: newSchool.subscriptionStatus,
            currentPeriodEnd: newSchool.currentPeriodEnd,
            cancelAtPeriodEnd: newSchool.cancelAtPeriodEnd,
            subscriptionEndDate: newSchool.subscriptionEndDate,
            stripeCustomerId: userData?.stripeCustomerId,
            _created: true, // Flag to indicate profile was just created
          });
        } catch (createError) {
          console.error("Failed to create school profile:", createError);
          return res.status(500).json({ 
            error: "School profile not found and could not be created",
            details: createError.message,
            userId: decoded.userId,
            userEmail: user.email
          });
        }
      }

      // Calculate profile completeness
      // Description is now optional - can be set from job posting
      const requiredFields = [
        school.name,
        school.contactName,
        school.telephone,
        school.streetAddress,
        school.city,
        school.country,
        school.schoolType,
      ];

      const optionalButImportantFields = [
        school.description, // Moved from required to optional
        school.website,
        school.logoUrl,
        school.established,
        school.studentCount,
      ];

      const requiredComplete = requiredFields.every(field => field && field.toString().trim());
      const optionalComplete = optionalButImportantFields.filter(field =>
        field && field.toString().trim()
      ).length;

      // Profile is complete if all required fields are filled
      // Optional fields improve the profile but aren't required
      const profileComplete = requiredComplete;

      // Get user to include stripeCustomerId with retry logic
      const user = await retryOperation(async () => {
        return await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            stripeCustomerId: true,
          },
        });
      });

      return res.status(200).json({
        school: {
          ...school,
          profileComplete,
          completionPercentage: Math.round(
            ((requiredFields.filter(f => f && f.toString().trim()).length + optionalComplete) / 
             (requiredFields.length + optionalButImportantFields.length)) * 100
          ),
        },
        subscriptionId: school.subscriptionId,
        subscriptionStatus: school.subscriptionStatus,
        currentPeriodEnd: school.currentPeriodEnd,
        cancelAtPeriodEnd: school.cancelAtPeriodEnd,
        subscriptionEndDate: school.subscriptionEndDate,
        stripeCustomerId: user?.stripeCustomerId,
      });

    } else if (req.method === "PUT") {
      // Update school profile
      const {
        name,
        contactName,
        contactEmail,
        telephone,
        phoneCountryCode,
        streetAddress,
        city,
        state,
        postalCode,
        country,
        schoolType,
        curriculum,
        estimateJobs,
        website,
        description,
        teachingPhilosophy,
        logoUrl,
        coverPhotoUrl,
        established,
        studentCount,
        studentAgeRangeMin,
        studentAgeRangeMax,
        averageClassSize,
        benefits,
      } = req.body;

      // Validate required fields
      if (!name || !contactName || !city || !country) {
        return res.status(400).json({ 
          error: "Missing required fields",
          required: ["name", "contactName", "city", "country"]
        });
      }

      // Calculate profile completeness
      // Description, telephone, streetAddress, and schoolType are now optional
      const requiredFields = [
        name, contactName, city, country
      ];
      const optionalButImportantFields = [
        description, // Moved from required to optional
        website, logoUrl, established, studentCount
      ];

      const requiredComplete = requiredFields.every(field => field && field.toString().trim());
      const optionalComplete = optionalButImportantFields.filter(field =>
        field && field.toString().trim()
      ).length;

      // Profile is complete if all required fields are filled
      // Optional fields improve the profile but aren't required
      const profileComplete = requiredComplete;

      // Validate and parse dates and numbers
      let parsedEstablished = null;
      if (established) {
        const establishedDate = new Date(established);
        if (!isNaN(establishedDate.getTime())) {
          parsedEstablished = establishedDate;
        }
      }

      let parsedStudentCount = null;
      if (studentCount) {
        const count = parseInt(studentCount);
        if (!isNaN(count) && count > 0) {
          parsedStudentCount = count;
        }
      }

      let parsedStudentAgeRangeMin = null;
      if (studentAgeRangeMin !== undefined && studentAgeRangeMin !== null) {
        const min = parseInt(studentAgeRangeMin);
        if (!isNaN(min) && min >= 0) {
          parsedStudentAgeRangeMin = min;
        }
      }

      let parsedStudentAgeRangeMax = null;
      if (studentAgeRangeMax !== undefined && studentAgeRangeMax !== null) {
        const max = parseInt(studentAgeRangeMax);
        if (!isNaN(max) && max >= 0) {
          parsedStudentAgeRangeMax = max;
        }
      }

      let parsedAverageClassSize = null;
      if (averageClassSize !== undefined && averageClassSize !== null) {
        const size = parseInt(averageClassSize);
        if (!isNaN(size) && size > 0) {
          parsedAverageClassSize = size;
        }
      }

      const updatedSchool = await retryOperation(async () => {
        return await prisma.school.update({
          where: { userId: decoded.userId },
          data: {
          name,
          contactName,
          contactEmail,
          telephone,
          phoneCountryCode: phoneCountryCode || "+1",
          streetAddress,
          city,
          state,
          postalCode,
          country,
          schoolType,
          curriculum: curriculum || null,
          estimateJobs,
          website,
          description,
          teachingPhilosophy: teachingPhilosophy || null,
          logoUrl,
          coverPhotoUrl,
          established: parsedEstablished,
          studentCount: parsedStudentCount,
          studentAgeRangeMin: parsedStudentAgeRangeMin,
          studentAgeRangeMax: parsedStudentAgeRangeMax,
          averageClassSize: parsedAverageClassSize,
          benefits: benefits || null,
          updatedAt: new Date(),
        },
        include: {
          user: {
            select: {
              email: true,
            },
          },
          _count: {
            select: {
              jobs: true,
            },
          },
        },
      });
      });

      // Log activity with retry logic
      await retryOperation(async () => {
        return await prisma.activityLog.create({
        data: {
          userId: decoded.userId,
          action: "PROFILE_UPDATED",
          details: {
            schoolId: updatedSchool.id,
            profileComplete,
          },
          ipAddress: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
          userAgent: req.headers["user-agent"],
        },
      });
      });

      return res.status(200).json({
        message: "Profile updated successfully",
        school: {
          ...updatedSchool,
          profileComplete,
          completionPercentage: Math.round(
            ((requiredFields.filter(f => f && f.toString().trim()).length + optionalComplete) / 
             (requiredFields.length + optionalButImportantFields.length)) * 100
          ),
        },
      });

    } else {
      res.setHeader("Allow", ["GET", "PUT"]);
      return res.status(405).json({ error: "Method Not Allowed" });
    }

  } catch (error) {
    console.error("School profile API error:", error);
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

    if (error.name === "NoTokenError") {
      return res.status(401).json({ 
        error: "No authentication token provided",
        details: "Please log in to access this resource"
      });
    }

    if (error.name === "ConfigError") {
      return res.status(500).json({ 
        error: "Server configuration error",
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
      error.code === "GenericFailure" ||
      error.name === "PrismaClientUnknownRequestError";

    if (isPrismaConnectionError) {
      console.error("Prisma connection error - attempting to reconnect...");
      try {
        await prisma.$disconnect();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await prisma.$connect();
      } catch (reconnectError) {
        console.error("Failed to reconnect:", reconnectError);
      }
      
      return res.status(503).json({
        error: "Database connection error",
        message: "Unable to connect to database. Please try again in a moment.",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
        retry: true,
      });
    }

    // Generic error response
    return res.status(500).json({
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
      errorType:       error.name || "UnknownError",
    });
  }
  // Note: In serverless environments, we don't disconnect to allow connection pooling
  // The connection will be reused across invocations
}