import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { emailHelpers } from "../../lib/email/email-service.js";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { userType, email, password, ...profileData } = req.body;

    // Validate required fields
    if (!userType || !email) {
      return res
        .status(400)
        .json({ error: "User type and email are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ error: "Please provide a valid email address" });
    }

    // Validate user type
    if (!["school", "teacher"].includes(userType.toLowerCase())) {
      return res
        .status(400)
        .json({ error: "User type must be either 'school' or 'teacher'" });
    }

    // Validate password if provided
    if (password && password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters long" });
    }

    // Validate required profile fields based on user type
    if (userType.toLowerCase() === "school") {
      const requiredFields = [
        "name",
        "contactName",
        "city",
        "country",
        "estimateJobs",
      ];
      const missingFields = requiredFields.filter(
        (field) => !profileData[field],
      );
      if (missingFields.length > 0) {
        return res.status(400).json({
          error: `Missing required fields: ${missingFields.join(", ")}`,
        });
      }
    } else if (userType.toLowerCase() === "teacher") {
      const requiredFields = [
        "firstName",
        "lastName",
        "phone",
        "city",
        "country",
        "qualification",
        "experience",
      ];
      const missingFields = requiredFields.filter(
        (field) => !profileData[field],
      );
      if (missingFields.length > 0) {
        return res.status(400).json({
          error: `Missing required fields: ${missingFields.join(", ")}`,
        });
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User already exists with this email" });
    }

    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    // Create user and profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          userType: userType.toUpperCase(),
        },
      });

      // Create profile based on user type
      let profile;
      if (userType.toLowerCase() === "school") {
        profile = await tx.school.create({
          data: {
            userId: user.id,
            name: profileData.name,
            contactName: profileData.contactName,
            contactEmail: profileData.contactEmail || null,
            telephone: profileData.telephone,
            phoneCountryCode: profileData.phoneCountryCode || "+1",
            streetAddress: profileData.streetAddress,
            city: profileData.city,
            state: profileData.state || null,
            postalCode: profileData.postalCode,
            country: profileData.country,
            schoolType: profileData.schoolType || "private",
            estimateJobs: profileData.estimateJobs,
            website: profileData.website || null,
            description: profileData.description || null,
            established: profileData.established
              ? new Date(profileData.established)
              : null,
            studentCount: profileData.studentCount
              ? parseInt(profileData.studentCount)
              : null,
          },
        });
      } else if (userType.toLowerCase() === "teacher") {
        // First check if the database has the required columns
        let hasNewColumns = true;
        try {
          await tx.$queryRaw`SELECT "experienceYears" FROM "teachers" LIMIT 0`;
        } catch (error) {
          hasNewColumns = false;
          console.warn("Database schema is outdated, using minimal fields");
        }

        // Create teacher with appropriate fields based on schema version
        const teacherData = {
          userId: user.id,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone,
          phoneCountryCode: profileData.phoneCountryCode || "+1",
          streetAddress: profileData.streetAddress || null,
          city: profileData.city,
          state: profileData.state || null,
          postalCode: profileData.postalCode || null,
          country: profileData.country,
          qualification: profileData.qualification,
          experience: profileData.experience,
          bio: profileData.bio || null,
          dateOfBirth: profileData.dateOfBirth
            ? new Date(profileData.dateOfBirth)
            : null,
          nationality: profileData.nationality || null,
          visaStatus: profileData.visaStatus || null,
          availability: profileData.availability || null,
        };

        // Only add new fields if schema supports them
        if (hasNewColumns) {
          Object.assign(teacherData, {
            experienceYears: profileData.experienceYears || null,
            // Convert languages to languageSkills JSON format
            languageSkills: profileData.languages
              ? profileData.languages.reduce((acc, lang) => {
                  acc[lang] = "Native/Fluent"; // Default level
                  return acc;
                }, {})
              : null,
            // Split skills into technical and soft skills
            technicalSkills: profileData.technicalSkills || [],
            softSkills: profileData.softSkills || [],
            // Set default values for array fields that are required in schema
            certifications: [],
            subjects: [],
            ageGroups: [],
            preferredLocations: [],
            workAuthorization: [],
            education: [],
            specializations: [],
            previousSchools: [],
            references: [],
            achievements: [],
            publications: [],
            jobTypePreference: [],
            workEnvironmentPreference: [],
          });
        }

        profile = await tx.teacher.create({
          data: teacherData,
        });
      }

      return { user, profile };
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: result.user.id,
        action: "USER_REGISTERED",
        details: { userType, email },
        ipAddress:
          req.headers["x-forwarded-for"] || req.connection.remoteAddress,
        userAgent: req.headers["user-agent"],
      },
    });

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET environment variable is not set");
      return res.status(500).json({
        error: "Server configuration error. Please contact support.",
      });
    }

    const token = jwt.sign(
      {
        userId: result.user.id,
        email: result.user.email,
        userType: result.user.userType,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // Send welcome email
    try {
      if (userType.toLowerCase() === "school") {
        await emailHelpers.sendSchoolWelcome(result.profile);
      } else if (userType.toLowerCase() === "teacher") {
        await emailHelpers.sendTeacherWelcome(result.profile);
      }
    } catch (emailError) {
      // Log error but don't fail registration
      console.error("Failed to send welcome email:", emailError);
    }

    // Return success response (excluding password)
    const { password: _, ...userWithoutPassword } = result.user;

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: userWithoutPassword,
      profile: result.profile,
      redirectUrl:
        userType.toLowerCase() === "school"
          ? "/schools/dashboard"
          : "/teachers/dashboard",
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle specific Prisma errors
    if (error.code === "P2002") {
      return res.status(400).json({
        error: "A user with this email already exists",
      });
    }

    // Handle JWT errors
    if (error.name === "JsonWebTokenError") {
      return res.status(500).json({
        error: "Authentication system error. Please contact support.",
      });
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
