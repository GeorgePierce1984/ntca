import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Helper function to retry database operations
// Prisma auto-connects on first query, so we don't need manual connection management
async function retryOperation(operation, maxRetries = 3, initialDelay = 1000) {
  let delay = initialDelay;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Prisma will auto-connect on first query
      // For cold starts, add a small delay before first attempt
      if (attempt === 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
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
        // Disconnect to reset connection state
        await prisma.$disconnect().catch(() => {});
        // Wait before retrying - longer for "Engine is not yet connected"
        if (error.message?.includes("Engine is not yet connected")) {
          await new Promise(resolve => setTimeout(resolve, 1500 + (attempt * 500)));
        } else {
          await new Promise(resolve => setTimeout(resolve, delay));
          delay = Math.min(delay * 1.5, 2000); // Cap at 2 seconds to avoid timeout
        }
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
    const {
      page = 1,
      limit = 20,
      search,
      qualification,
      experience_min,
      location,
      country,
      city,
      sort = "latest",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build search filters - only show searchable teachers
    // Note: We'll filter by searchable only, as profileComplete might not be set for all teachers
    const where = {
      searchable: true,
    };

    // Build OR conditions for text search and location
    const orConditions = [];
    
    // Text search in name, qualification, subjects, bio
    if (search) {
      orConditions.push(
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { qualification: { contains: search, mode: "insensitive" } },
        { bio: { contains: search, mode: "insensitive" } }
      );
    }

    // Location filter (searches both city and country)
    if (location) {
      orConditions.push(
        { city: { contains: location, mode: "insensitive" } },
        { country: { contains: location, mode: "insensitive" } }
      );
    }

    // Add OR conditions if any exist
    if (orConditions.length > 0) {
      where.OR = orConditions;
    }

    // Qualification filter
    if (qualification) {
      where.qualification = {
        contains: qualification,
        mode: "insensitive",
      };
    }

    // Experience filter (minimum years)
    if (experience_min) {
      const minYears = parseInt(experience_min);
      if (!isNaN(minYears)) {
        where.experienceYears = {
          gte: minYears,
        };
      }
    }

    // Country filter
    if (country) {
      where.country = {
        contains: country,
        mode: "insensitive",
      };
    }

    // City filter
    if (city) {
      where.city = {
        contains: city,
        mode: "insensitive",
      };
    }

    // Sort options
    let orderBy = {};
    switch (sort) {
      case "latest":
        orderBy = { createdAt: "desc" };
        break;
      case "experience":
        orderBy = { experienceYears: "desc" };
        break;
      case "rating":
        orderBy = { rating: "desc" };
        break;
      case "name":
        orderBy = { firstName: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    // Fetch teachers
    const [teachers, totalTeachers] = await Promise.all([
      retryOperation(async () => {
        return await prisma.teacher.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            city: true,
            country: true,
            qualification: true,
            experienceYears: true,
            experience: true,
            bio: true,
            photoUrl: true,
            verified: true,
            rating: true,
            certifications: true,
            subjects: true,
            ageGroups: true,
            teachingStyle: true,
            nativeLanguage: true,
            languageSkills: true,
            otherLanguages: true,
            nationality: true,
            currentLocation: true,
            willingToRelocate: true,
            preferredLocations: true,
            visaStatus: true,
            workAuthorization: true,
            availability: true,
            startDate: true,
            education: true,
            teachingExperience: true,
            specializations: true,
            previousSchools: true,
            achievements: true,
            publications: true,
            resumeUrl: true,
            portfolioUrl: true,
            phone: true,
            phoneCountryCode: true,
            createdAt: true,
            lastActive: true,
            // Note: user relation might be null for some teachers, so we handle it safely
          },
        });
      }),
      retryOperation(async () => {
        return await prisma.teacher.count({ where });
      }),
    ]);

    // Calculate pagination
    const totalPages = Math.ceil(totalTeachers / parseInt(limit));

    return res.status(200).json({
      teachers: teachers.map(teacher => ({
        id: teacher.id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        city: teacher.city,
        country: teacher.country,
        qualification: teacher.qualification,
        experienceYears: teacher.experienceYears,
        experience: teacher.experience,
        verified: teacher.verified,
        rating: teacher.rating,
        photoUrl: teacher.photoUrl,
        subjects: teacher.subjects || [],
        languages: teacher.otherLanguages 
          ? (typeof teacher.otherLanguages === 'string' 
              ? teacher.otherLanguages.split(",").map(l => l.trim())
              : [])
          : teacher.nativeLanguage 
            ? [teacher.nativeLanguage]
            : [],
        availability: teacher.availability,
        bio: teacher.bio,
        certifications: teacher.certifications || [],
        ageGroups: teacher.ageGroups || [],
        teachingStyle: teacher.teachingStyle,
        nativeLanguage: teacher.nativeLanguage,
        currentLocation: teacher.currentLocation,
        willingToRelocate: teacher.willingToRelocate,
        preferredLocations: teacher.preferredLocations || [],
        visaStatus: teacher.visaStatus,
        workAuthorization: teacher.workAuthorization || [],
        startDate: teacher.startDate ? (teacher.startDate instanceof Date ? teacher.startDate.toISOString() : teacher.startDate) : null,
        education: Array.isArray(teacher.education) ? teacher.education : [],
        teachingExperience: teacher.teachingExperience 
          ? (Array.isArray(teacher.teachingExperience) ? teacher.teachingExperience : [])
          : [],
        specializations: teacher.specializations || [],
        previousSchools: teacher.previousSchools || [],
        achievements: teacher.achievements || [],
        publications: teacher.publications || [],
        resumeUrl: teacher.resumeUrl,
        portfolioUrl: teacher.portfolioUrl,
        phone: teacher.phone,
        phoneCountryCode: teacher.phoneCountryCode,
        // Note: Email is not included in public API for privacy
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalTeachers,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Teachers public API error:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({
      error: "Failed to fetch teachers",
      message: error.message || "Unknown error",
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  } finally {
    // Ensure Prisma connection is properly closed
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      // Ignore disconnect errors
    }
  }
}

