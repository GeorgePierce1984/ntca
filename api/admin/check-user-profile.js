import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Diagnostic endpoint to check if a user has a corresponding Teacher or School profile
 * Usage: POST /api/admin/check-user-profile
 * Body: { email: "user@example.com" }
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Admin token check (optional - you can add this if needed)
  // const adminToken = req.headers["x-admin-token"];
  // if (adminToken !== process.env.ADMIN_TOKEN) {
  //   return res.status(401).json({ error: "Unauthorized" });
  // }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        teacher: true,
        school: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
        email: email,
      });
    }

    // Check what's missing
    const hasTeacher = !!user.teacher;
    const hasSchool = !!user.school;
    const userType = user.userType;

    let issue = null;
    let fixable = false;

    if (userType === "TEACHER" && !hasTeacher) {
      issue = "User is marked as TEACHER but has no Teacher profile";
      fixable = true;
    } else if (userType === "SCHOOL" && !hasSchool) {
      issue = "User is marked as SCHOOL but has no School profile";
      fixable = true;
    } else if (userType === "TEACHER" && hasTeacher) {
      issue = "No issue - User has Teacher profile";
    } else if (userType === "SCHOOL" && hasSchool) {
      issue = "No issue - User has School profile";
    }

    const result = {
      email: user.email,
      userId: user.id,
      userType: user.userType,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      hasTeacher,
      hasSchool,
      issue,
      fixable,
      teacherId: user.teacher?.id || null,
      schoolId: user.school?.id || null,
    };

    // If fixable and user wants to fix it
    const { fix } = req.body;
    if (fix && fixable && userType === "TEACHER" && !hasTeacher) {
      // Create minimal Teacher profile
      try {
        const teacher = await prisma.teacher.create({
          data: {
            userId: user.id,
            firstName: "Unknown", // Placeholder - should be updated
            lastName: "User",
            phone: "",
            phoneCountryCode: "+1",
            city: "",
            country: "Unknown",
            qualification: "",
            experience: "",
          },
        });

        result.fixed = true;
        result.teacherId = teacher.id;
        result.message = "Teacher profile created successfully. User should update their profile.";
      } catch (error) {
        result.fixError = error.message;
        result.fixed = false;
      }
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error checking user profile:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    await prisma.$disconnect();
  }
}

