import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function fixProductionDatabase() {
  console.log('Starting production database fix...');

  try {
    // Create missing tables
    console.log('\n1. Creating missing tables...');

    const tableQueries = [
      {
        name: 'saved_jobs',
        query: `CREATE TABLE IF NOT EXISTS "saved_jobs" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
          "teacherId" TEXT NOT NULL,
          "jobId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "saved_jobs_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "saved_jobs_teacherId_jobId_key" UNIQUE ("teacherId", "jobId")
        )`
      },
      {
        name: 'job_alerts',
        query: `CREATE TABLE IF NOT EXISTS "job_alerts" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
          "teacherId" TEXT NOT NULL,
          "title" TEXT NOT NULL,
          "criteria" JSONB NOT NULL,
          "active" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "job_alerts_pkey" PRIMARY KEY ("id")
        )`
      },
      {
        name: 'activity_logs',
        query: `CREATE TABLE IF NOT EXISTS "activity_logs" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
          "userId" TEXT NOT NULL,
          "action" TEXT NOT NULL,
          "details" JSONB,
          "ipAddress" TEXT,
          "userAgent" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
        )`
      },
      {
        name: 'application_notes',
        query: `CREATE TABLE IF NOT EXISTS "application_notes" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
          "applicationId" TEXT NOT NULL,
          "content" TEXT NOT NULL,
          "authorType" TEXT NOT NULL,
          "authorName" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "application_notes_pkey" PRIMARY KEY ("id")
        )`
      }
    ];

    for (const { name, query } of tableQueries) {
      try {
        await prisma.$executeRawUnsafe(query);
        console.log(`✅ Table ${name} created or already exists`);
      } catch (error) {
        console.error(`❌ Error creating table ${name}:`, error.message);
      }
    }

    // Add foreign key constraints
    console.log('\n2. Adding foreign key constraints...');

    const constraintQueries = [
      {
        name: 'saved_jobs_teacherId_fkey',
        query: `ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_teacherId_fkey"
                FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE`
      },
      {
        name: 'saved_jobs_jobId_fkey',
        query: `ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_jobId_fkey"
                FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE`
      },
      {
        name: 'job_alerts_teacherId_fkey',
        query: `ALTER TABLE "job_alerts" ADD CONSTRAINT "job_alerts_teacherId_fkey"
                FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE`
      },
      {
        name: 'application_notes_applicationId_fkey',
        query: `ALTER TABLE "application_notes" ADD CONSTRAINT "application_notes_applicationId_fkey"
                FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE`
      }
    ];

    for (const { name, query } of constraintQueries) {
      try {
        await prisma.$executeRawUnsafe(query);
        console.log(`✅ Constraint ${name} added`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`ℹ️  Constraint ${name} already exists`);
        } else {
          console.error(`❌ Error adding constraint ${name}:`, error.message);
        }
      }
    }

    // Create indexes
    console.log('\n3. Creating indexes...');

    const indexQueries = [
      {
        name: 'saved_jobs_teacherId_idx',
        query: `CREATE INDEX IF NOT EXISTS "saved_jobs_teacherId_idx" ON "saved_jobs"("teacherId")`
      },
      {
        name: 'saved_jobs_jobId_idx',
        query: `CREATE INDEX IF NOT EXISTS "saved_jobs_jobId_idx" ON "saved_jobs"("jobId")`
      },
      {
        name: 'job_alerts_teacherId_idx',
        query: `CREATE INDEX IF NOT EXISTS "job_alerts_teacherId_idx" ON "job_alerts"("teacherId")`
      },
      {
        name: 'activity_logs_userId_idx',
        query: `CREATE INDEX IF NOT EXISTS "activity_logs_userId_idx" ON "activity_logs"("userId")`
      },
      {
        name: 'application_notes_applicationId_idx',
        query: `CREATE INDEX IF NOT EXISTS "application_notes_applicationId_idx" ON "application_notes"("applicationId")`
      }
    ];

    for (const { name, query } of indexQueries) {
      try {
        await prisma.$executeRawUnsafe(query);
        console.log(`✅ Index ${name} created`);
      } catch (error) {
        console.error(`❌ Error creating index ${name}:`, error.message);
      }
    }

    // Verify tables exist
    console.log('\n4. Verifying tables...');

    const tables = ['saved_jobs', 'job_alerts', 'activity_logs', 'application_notes'];
    for (const table of tables) {
      try {
        const result = await prisma.$queryRawUnsafe(
          `SELECT COUNT(*) FROM "${table}"`
        );
        console.log(`✅ Table ${table} exists and is accessible`);
      } catch (error) {
        console.error(`❌ Table ${table} verification failed:`, error.message);
      }
    }

    // Test Prisma models
    console.log('\n5. Testing Prisma models...');

    try {
      const savedJobsCount = await prisma.savedJob.count();
      console.log(`✅ SavedJob model working - ${savedJobsCount} records`);
    } catch (error) {
      console.error('❌ SavedJob model error:', error.message);
    }

    try {
      const jobAlertsCount = await prisma.jobAlert.count();
      console.log(`✅ JobAlert model working - ${jobAlertsCount} records`);
    } catch (error) {
      console.error('❌ JobAlert model error:', error.message);
    }

    try {
      const activityLogsCount = await prisma.activityLog.count();
      console.log(`✅ ActivityLog model working - ${activityLogsCount} records`);
    } catch (error) {
      console.error('❌ ActivityLog model error:', error.message);
    }

    try {
      const applicationNotesCount = await prisma.applicationNote.count();
      console.log(`✅ ApplicationNote model working - ${applicationNotesCount} records`);
    } catch (error) {
      console.error('❌ ApplicationNote model error:', error.message);
    }

    console.log('\n✨ Database fix completed!');

  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixProductionDatabase();
