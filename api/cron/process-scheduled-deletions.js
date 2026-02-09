/**
 * Cron job endpoint to process scheduled account deletions.
 * 
 * This should be called daily (e.g., via Vercel Cron or external cron service)
 * to delete accounts that have passed their deletionScheduledAt date.
 * 
 * Usage:
 * - Set up Vercel Cron: https://vercel.com/docs/cron-jobs
 * - Or call via external cron: curl https://www.nt-ca.com/api/cron/process-scheduled-deletions
 * 
 * Security: Add a secret token check if calling from external services.
 */

import { prisma } from "../_utils/prisma.js";

export default async function handler(req, res) {
  // Optional: Add secret token check for external cron services
  const cronSecret = req.headers["x-cron-secret"];
  if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const now = new Date();

    // Find users scheduled for deletion where deletionScheduledAt has passed
    const usersToDelete = await prisma.user.findMany({
      where: {
        deletionScheduledAt: {
          not: null,
          lte: now,
        },
      },
      include: {
        teacher: {
          include: {
            applications: true,
            savedJobs: true,
            conversations: {
              include: {
                messages: true,
              },
            },
          },
        },
        school: {
          include: {
            jobs: {
              include: {
                applications: true,
                savedJobs: true,
              },
            },
            conversations: {
              include: {
                messages: true,
              },
            },
          },
        },
      },
    });

    if (usersToDelete.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No accounts scheduled for deletion",
        deleted: 0,
      });
    }

    let deletedCount = 0;

    // Delete each user and related data
    for (const user of usersToDelete) {
      try {
        await prisma.$transaction(async (tx) => {
          // Delete activity logs
          await tx.activityLog.deleteMany({
            where: { userId: user.id },
          });

          // Delete user (cascade will handle School/Teacher, Jobs, Applications, etc.)
          await tx.user.delete({
            where: { id: user.id },
          });
        });

        deletedCount++;
        console.log(`✅ Deleted user: ${user.email} (${user.userType})`);
      } catch (error) {
        console.error(`❌ Failed to delete user ${user.email}:`, error);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Processed ${deletedCount} account deletion(s)`,
      deleted: deletedCount,
      totalFound: usersToDelete.length,
    });
  } catch (error) {
    console.error("Error processing scheduled deletions:", error);
    return res.status(500).json({
      error: "Failed to process scheduled deletions",
      message: error.message,
    });
  }
}

