/**
 * One-time script to delete user account by email
 * Usage: npx tsx scripts/delete-user-onetime.js
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function deleteUser() {
  const email = "georgepierce@hotmail.co.uk";

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
      console.log("✅ No accounts found with that email address.");
      return;
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

    console.log(`\n✅ Successfully deleted ${users.length} account(s) and all related data`);
    console.log(`   Deleted:`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Jobs: ${totalJobs}`);
    console.log(`   - Applications: ${totalApplications}`);
    console.log(`   - Saved Jobs: ${totalSavedJobs}`);
    console.log(`   - Conversations: ${totalConversations}`);
    console.log(`   - Messages: ${totalMessages}`);
    console.log(`   - Activity Logs: ${activityLogs.length}`);
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

deleteUser()
  .then(() => {
    console.log("\n✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });

