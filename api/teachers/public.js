import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Retry operation helper for Prisma connection issues
async function retryOperation(operation, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      // Check if it's a connection error
      if (error.message?.includes("Engine is not yet connected") || 
          error.message?.includes("Response from the Engine was empty")) {
        const delay = attempt * 1000;
        console.log(`Connection error on attempt ${attempt}, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
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
    const where = {
      searchable: true,
      profileComplete: true, // Only show teachers with complete profiles
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
            user: {
              select: {
                email: true,
              },
            },
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
          ? teacher.otherLanguages.split(",").map(l => l.trim())
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
        startDate: teacher.startDate,
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
        email: teacher.user?.email,
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
    return res.status(500).json({
      error: "Failed to fetch teachers",
      message: error.message,
    });
  }
}

