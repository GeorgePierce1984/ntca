// Simple one-time script to delete all accounts with georgepierce@hotmail.co.uk
// Run with: npx tsx delete-george-account.js
// Or: node delete-george-account.js (if you have Node.js installed)

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const EMAIL_TO_DELETE = "georgepierce@hotmail.co.uk";

async function main() {
  try {
    console.log(`\n🔍 Searching for accounts with email: ${EMAIL_TO_DELETE}\n`);

    // Find all users with this email
    const users = await prisma.user.findMany({
      where: { email: EMAIL_TO_DELETE },
      include: {
        school: {
          include: {
            jobs: true,
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
      console.log("✅ No accounts found with that email address.\n");
      return;
    }

    // Count what will be deleted
    let totalJobs = 0;
    let totalApplications = 0;
    let totalSavedJobs = 0;
    let totalConversations = 0;
    let totalMessages = 0;

    users.forEach((user) => {
      console.log(`Found ${user.userType} account: ${user.id}`);
      if (user.school) {
        totalJobs += user.school.jobs.length;
        totalConversations += user.school.conversations.length;
        user.school.conversations.forEach((conv) => {
          totalMessages += conv.messages.length;
        });
        console.log(`  - School: ${user.school.name}`);
        console.log(`  - Jobs: ${user.school.jobs.length}`);
      }
      if (user.teacher) {
        totalApplications += user.teacher.applications.length;
        totalSavedJobs += user.teacher.savedJobs.length;
        totalConversations += user.teacher.conversations.length;
        user.teacher.conversations.forEach((conv) => {
          totalMessages += conv.messages.length;
        });
        console.log(`  - Teacher: ${user.teacher.firstName} ${user.teacher.lastName}`);
        console.log(`  - Applications: ${user.teacher.applications.length}`);
      }
    });

    // Count activity logs
    const activityLogs = await prisma.activityLog.findMany({
      where: {
        userId: { in: users.map((u) => u.id) },
      },
    });

    console.log(`\n📊 Summary:`);
    console.log(`  - Users: ${users.length}`);
    console.log(`  - Jobs: ${totalJobs}`);
    console.log(`  - Applications: ${totalApplications}`);
    console.log(`  - Saved Jobs: ${totalSavedJobs}`);
    console.log(`  - Conversations: ${totalConversations}`);
    console.log(`  - Messages: ${totalMessages}`);
    console.log(`  - Activity Logs: ${activityLogs.length}`);

    console.log(`\n🗑️  Deleting...\n`);

    // Delete in transaction
    await prisma.$transaction(async (tx) => {
      for (const user of users) {
        // Delete activity logs first (no cascade)
        const deletedLogs = await tx.activityLog.deleteMany({
          where: { userId: user.id },
        });
        console.log(`  ✓ Deleted ${deletedLogs.count} activity log(s) for user ${user.id}`);

        // Delete user (cascades to School/Teacher, Jobs, Applications, etc.)
        await tx.user.delete({
          where: { id: user.id },
        });
        console.log(`  ✓ Deleted user ${user.id} and all related data`);
      }
    });

    console.log(`\n✅ Successfully deleted ${users.length} account(s)!`);
    console.log(`\n📊 Deleted:`);
    console.log(`  - Users: ${users.length}`);
    console.log(`  - Jobs: ${totalJobs}`);
    console.log(`  - Applications: ${totalApplications}`);
    console.log(`  - Saved Jobs: ${totalSavedJobs}`);
    console.log(`  - Conversations: ${totalConversations}`);
    console.log(`  - Messages: ${totalMessages}`);
    console.log(`  - Activity Logs: ${activityLogs.length}\n`);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

