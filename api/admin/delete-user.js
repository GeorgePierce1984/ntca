import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Security: Only allow POST requests
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email, confirm } = req.body || {};

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Email is required" });
  }

  // Security: Require confirmation
  if (confirm !== "DELETE_ALL_ACCOUNTS") {
    return res.status(400).json({
      error:
        "Confirmation required. Send { email: \"user@example.com\", confirm: 'DELETE_ALL_ACCOUNTS' } to proceed.",
    });
  }

  try {
    console.log(`🔍 Searching for accounts with email: ${email}`);

    // Find all users with this email
    const users = await prisma.user.findMany({
      where: { email },
      include: {
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
      },
    });

    if (users.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No accounts found with that email address.",
        deleted: {
          users: 0,
          jobs: 0,
          applications: 0,
          savedJobs: 0,
          conversations: 0,
          messages: 0,
          activityLogs: 0,
        },
      });
    }

    // Count related data
    let totalJobs = 0;
    let totalApplications = 0;
    let totalSavedJobs = 0;
    let totalConversations = 0;
    let totalMessages = 0;

    users.forEach((user) => {
      if (user.school) {
        totalJobs += user.school.jobs.length;
        user.school.jobs.forEach((job) => {
          totalApplications += job.applications.length;
          totalSavedJobs += job.savedJobs.length;
        });
        totalConversations += user.school.conversations.length;
        user.school.conversations.forEach((conv) => {
          totalMessages += conv.messages.length;
        });
      }
      if (user.teacher) {
        totalApplications += user.teacher.applications.length;
        totalSavedJobs += user.teacher.savedJobs.length;
        totalConversations += user.teacher.conversations.length;
        user.teacher.conversations.forEach((conv) => {
          totalMessages += conv.messages.length;
        });
      }
    });

    // Count activity logs
    const activityLogs = await prisma.activityLog.findMany({
      where: {
        userId: {
          in: users.map((u) => u.id),
        },
      },
    });

    console.log(`\n📊 Found ${users.length} account(s) to delete:`);
    console.log(`    - Jobs: ${totalJobs}`);
    console.log(`    - Applications: ${totalApplications}`);
    console.log(`    - Saved Jobs: ${totalSavedJobs}`);
    console.log(`    - Conversations: ${totalConversations}`);
    console.log(`    - Messages: ${totalMessages}`);
    console.log(`    - Activity Logs: ${activityLogs.length}`);

    // Delete in transaction to ensure data integrity
    await prisma.$transaction(async (tx) => {
      for (const user of users) {
        console.log(`Deleting user: ${user.id} (${user.userType})...`);

        // Delete activity logs first (no cascade)
        await tx.activityLog.deleteMany({
          where: { userId: user.id },
        });

        // Delete user (this will cascade delete School/Teacher, Jobs, Applications, etc.)
        await tx.user.delete({
          where: { id: user.id },
        });
      }
    });

    return res.status(200).json({
      success: true,
      message: `Successfully deleted ${users.length} account(s) and all related data`,
      deleted: {
        users: users.length,
        jobs: totalJobs,
        applications: totalApplications,
        savedJobs: totalSavedJobs,
        conversations: totalConversations,
        messages: totalMessages,
        activityLogs: activityLogs.length,
      },
    });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    return res.status(500).json({
      error: "Failed to delete user accounts",
      message: error.message,
    });
  }
}

