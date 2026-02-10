import { prisma } from "../_utils/prisma.js";

/**
 * Cleanup endpoint to remove orphaned Teacher/School profiles
 * (profiles where the User record has been deleted but Teacher/School still exists)
 * 
 * Security: Requires ADMIN_DELETE_TOKEN header
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Security: require an admin token header
  const adminToken = req.headers["x-admin-token"];
  if (!process.env.ADMIN_DELETE_TOKEN) {
    return res.status(500).json({
      error: "Server misconfigured: ADMIN_DELETE_TOKEN is not set",
    });
  }
  if (!adminToken || adminToken !== process.env.ADMIN_DELETE_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { dryRun } = req.body || {};

  try {
    // Find orphaned teachers (teachers where userId doesn't exist in users table)
    const orphanedTeachers = await prisma.$queryRaw`
      SELECT t.id, t."userId", t."firstName", t."lastName"
      FROM teachers t
      LEFT JOIN users u ON u.id = t."userId"
      WHERE u.id IS NULL
    `;

    // Find orphaned schools (schools where userId doesn't exist in users table)
    const orphanedSchools = await prisma.$queryRaw`
      SELECT s.id, s."userId", s.name
      FROM schools s
      LEFT JOIN users u ON u.id = s."userId"
      WHERE u.id IS NULL
    `;

    const teacherCount = Array.isArray(orphanedTeachers) ? orphanedTeachers.length : 0;
    const schoolCount = Array.isArray(orphanedSchools) ? orphanedSchools.length : 0;

    if (teacherCount === 0 && schoolCount === 0) {
      return res.status(200).json({
        success: true,
        message: "No orphaned profiles found",
        deleted: {
          teachers: 0,
          schools: 0,
        },
      });
    }

    console.log(`Found ${teacherCount} orphaned teachers and ${schoolCount} orphaned schools`);

    if (dryRun === true) {
      return res.status(200).json({
        success: true,
        dryRun: true,
        message: `Would delete ${teacherCount} orphaned teachers and ${schoolCount} orphaned schools`,
        found: {
          teachers: teacherCount,
          schools: schoolCount,
        },
        teachers: orphanedTeachers,
        schools: orphanedSchools,
      });
    }

    let deletedTeachers = 0;
    let deletedSchools = 0;

    // Delete orphaned teachers and their related data
    if (teacherCount > 0) {
      for (const teacher of orphanedTeachers) {
        try {
          await prisma.$transaction(async (tx) => {
            // Delete teacher's applications
            await tx.application.deleteMany({
              where: { teacherId: teacher.id },
            });

            // Delete teacher's saved jobs
            await tx.savedJob.deleteMany({
              where: { teacherId: teacher.id },
            });

            // Delete teacher's conversations and messages
            const conversations = await tx.conversation.findMany({
              where: { teacherId: teacher.id },
            });

            for (const conv of conversations) {
              await tx.message.deleteMany({
                where: { conversationId: conv.id },
              });
            }

            await tx.conversation.deleteMany({
              where: { teacherId: teacher.id },
            });

            // Delete teacher profile
            await tx.teacher.delete({
              where: { id: teacher.id },
            });
          });

          deletedTeachers++;
          console.log(`✅ Deleted orphaned teacher: ${teacher.id} (${teacher.firstName} ${teacher.lastName})`);
        } catch (error) {
          console.error(`❌ Failed to delete orphaned teacher ${teacher.id}:`, error);
        }
      }
    }

    // Delete orphaned schools and their related data
    if (schoolCount > 0) {
      for (const school of orphanedSchools) {
        try {
          await prisma.$transaction(async (tx) => {
            // Get school's jobs
            const jobs = await tx.job.findMany({
              where: { schoolId: school.id },
            });

            // Delete jobs and their related data
            for (const job of jobs) {
              await tx.application.deleteMany({
                where: { jobId: job.id },
              });

              await tx.savedJob.deleteMany({
                where: { jobId: job.id },
              });

              await tx.job.delete({
                where: { id: job.id },
              });
            }

            // Delete school's conversations and messages
            const conversations = await tx.conversation.findMany({
              where: { schoolId: school.id },
            });

            for (const conv of conversations) {
              await tx.message.deleteMany({
                where: { conversationId: conv.id },
              });
            }

            await tx.conversation.deleteMany({
              where: { schoolId: school.id },
            });

            // Delete school profile
            await tx.school.delete({
              where: { id: school.id },
            });
          });

          deletedSchools++;
          console.log(`✅ Deleted orphaned school: ${school.id} (${school.name})`);
        } catch (error) {
          console.error(`❌ Failed to delete orphaned school ${school.id}:`, error);
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: `Cleaned up ${deletedTeachers} orphaned teachers and ${deletedSchools} orphaned schools`,
      deleted: {
        teachers: deletedTeachers,
        schools: deletedSchools,
      },
      found: {
        teachers: teacherCount,
        schools: schoolCount,
      },
    });
  } catch (error) {
    console.error("❌ Error cleaning up orphaned profiles:", error);
    return res.status(500).json({
      error: "Failed to cleanup orphaned profiles",
      message: error.message,
    });
  }
}

