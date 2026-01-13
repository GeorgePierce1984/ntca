import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const EMAIL_TO_DELETE = "georgepierce@hotmail.co.uk";

async function deleteUserByEmail() {
  try {
    console.log(`🔍 Searching for accounts with email: ${EMAIL_TO_DELETE}`);

    // Find all users with this email
    const users = await prisma.user.findMany({
      where: { email: EMAIL_TO_DELETE },
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

    console.log(`\n📊 Found ${users.length} account(s) with that email:`);
    users.forEach((user, index) => {
      console.log(`\n  Account ${index + 1}:`);
      console.log(`    - User ID: ${user.id}`);
      console.log(`    - User Type: ${user.userType}`);
      console.log(`    - Created: ${user.createdAt}`);
      if (user.school) {
        console.log(`    - School: ${user.school.name}`);
        console.log(`    - Jobs: ${user.school.jobs.length}`);
        console.log(`    - Conversations: ${user.school.conversations.length}`);
      }
      if (user.teacher) {
        console.log(`    - Teacher: ${user.teacher.firstName} ${user.teacher.lastName}`);
        console.log(`    - Applications: ${user.teacher.applications.length}`);
        console.log(`    - Saved Jobs: ${user.teacher.savedJobs.length}`);
        console.log(`    - Conversations: ${user.teacher.conversations.length}`);
      }
    });

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

    console.log(`\n📈 Summary of data to be deleted:`);
    console.log(`    - Users: ${users.length}`);
    console.log(`    - Jobs: ${totalJobs}`);
    console.log(`    - Applications: ${totalApplications}`);
    console.log(`    - Saved Jobs: ${totalSavedJobs}`);
    console.log(`    - Conversations: ${totalConversations}`);
    console.log(`    - Messages: ${totalMessages}`);
    console.log(`    - Activity Logs: ${activityLogs.length}`);

    // Confirm deletion
    console.log(`\n⚠️  WARNING: This will permanently delete all the above data!`);
    console.log(`\nTo proceed, run this script with the --confirm flag:`);
    console.log(`   node scripts/delete-user-by-email.js --confirm\n`);

    // Check for --confirm flag
    const args = process.argv.slice(2);
    if (!args.includes("--confirm")) {
      console.log("❌ Deletion cancelled. Add --confirm flag to proceed.");
      return;
    }

    console.log("\n🗑️  Starting deletion...");

    // Delete in transaction to ensure data integrity
    await prisma.$transaction(async (tx) => {
      for (const user of users) {
        console.log(`\n  Deleting user: ${user.id} (${user.userType})...`);

        // Delete activity logs first (no cascade)
        const deletedLogs = await tx.activityLog.deleteMany({
          where: { userId: user.id },
        });
        console.log(`    ✓ Deleted ${deletedLogs.count} activity log(s)`);

        // Delete user (this will cascade delete School/Teacher, Jobs, Applications, etc.)
        await tx.user.delete({
          where: { id: user.id },
        });
        console.log(`    ✓ Deleted user and all related data`);
      }
    });

    console.log(`\n✅ Successfully deleted ${users.length} account(s) and all related data!`);
    console.log(`\n📊 Final summary:`);
    console.log(`    - Users deleted: ${users.length}`);
    console.log(`    - Jobs deleted: ${totalJobs}`);
    console.log(`    - Applications deleted: ${totalApplications}`);
    console.log(`    - Saved Jobs deleted: ${totalSavedJobs}`);
    console.log(`    - Conversations deleted: ${totalConversations}`);
    console.log(`    - Messages deleted: ${totalMessages}`);
    console.log(`    - Activity Logs deleted: ${activityLogs.length}`);
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
deleteUserByEmail()
  .then(() => {
    console.log("\n✨ Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Script failed:", error);
    process.exit(1);
  });

