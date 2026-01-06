import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check for authorization
  const authHeader = req.headers.authorization;
  const internalKey =
    process.env.INTERNAL_API_KEY ||
    "internal_237abfa041067044b2b37180136b562cba4b904e6a7ba2757cde7217";

  if (authHeader !== `Bearer ${internalKey}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    console.log("Starting emergency database fix...");

    // First, create missing tables
    const createTableQueries = [
      // Create saved_jobs table
      `CREATE TABLE IF NOT EXISTS "saved_jobs" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
        "teacherId" TEXT NOT NULL,
        "jobId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "saved_jobs_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "saved_jobs_teacherId_jobId_key" UNIQUE ("teacherId", "jobId")
      )`,

      // Create job_alerts table
      `CREATE TABLE IF NOT EXISTS "job_alerts" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
        "teacherId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "criteria" JSONB NOT NULL,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "job_alerts_pkey" PRIMARY KEY ("id")
      )`,

      // Create activity_logs table
      `CREATE TABLE IF NOT EXISTS "activity_logs" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
        "userId" TEXT NOT NULL,
        "action" TEXT NOT NULL,
        "details" JSONB,
        "ipAddress" TEXT,
        "userAgent" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
      )`,

      // Create application_notes table
      `CREATE TABLE IF NOT EXISTS "application_notes" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
        "applicationId" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "authorType" TEXT NOT NULL,
        "authorName" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "application_notes_pkey" PRIMARY KEY ("id")
      )`,

      // Create applications table if missing
      `CREATE TABLE IF NOT EXISTS "applications" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
        "jobId" TEXT NOT NULL,
        "teacherId" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'APPLIED',
        "coverLetter" TEXT,
        "resumeUrl" TEXT,
        "portfolioUrl" TEXT,
        "interviewDate" TIMESTAMP(3),
        "interviewNotes" TEXT,
        "rating" DOUBLE PRECISION,
        "feedback" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "applications_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "applications_jobId_teacherId_key" UNIQUE ("jobId", "teacherId")
      )`,

      // Create jobs table if missing
      `CREATE TABLE IF NOT EXISTS "jobs" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
        "schoolId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "location" TEXT NOT NULL,
        "salary" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'ACTIVE',
        "deadline" TIMESTAMP(3) NOT NULL,
        "qualification" TEXT NOT NULL,
        "experience" TEXT NOT NULL,
        "language" TEXT NOT NULL,
        "visaRequired" BOOLEAN NOT NULL DEFAULT false,
        "teachingLicenseRequired" BOOLEAN NOT NULL DEFAULT false,
        "kazakhLanguageRequired" BOOLEAN NOT NULL DEFAULT false,
        "localCertificationRequired" BOOLEAN NOT NULL DEFAULT false,
        "benefits" TEXT,
        "requirements" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
      )`,
    ];

    // Execute table creation queries
    const tableResults = [];
    for (const query of createTableQueries) {
      try {
        await prisma.$executeRawUnsafe(query);
        const tableName = query.match(
          /CREATE TABLE IF NOT EXISTS "([^"]+)"/,
        )[1];
        tableResults.push({
          query: `CREATE TABLE ${tableName}`,
          status: "success",
        });
      } catch (error) {
        tableResults.push({
          query: query.substring(0, 50) + "...",
          status: "error",
          error: error.message,
        });
      }
    }

    // Add foreign key constraints
    const constraintQueries = [
      `ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_teacherId_fkey"
       FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE`,

      `ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_jobId_fkey"
       FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE`,

      `ALTER TABLE "job_alerts" ADD CONSTRAINT "job_alerts_teacherId_fkey"
       FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE`,

      `ALTER TABLE "applications" ADD CONSTRAINT "applications_jobId_fkey"
       FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE`,

      `ALTER TABLE "applications" ADD CONSTRAINT "applications_teacherId_fkey"
       FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE`,

      `ALTER TABLE "application_notes" ADD CONSTRAINT "application_notes_applicationId_fkey"
       FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE`,

      `ALTER TABLE "jobs" ADD CONSTRAINT "jobs_schoolId_fkey"
       FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    ];

    // Try to add constraints
    for (const query of constraintQueries) {
      try {
        await prisma.$executeRawUnsafe(query);
      } catch (error) {
        // Constraint might already exist, ignore error
        if (!error.message.includes("already exists")) {
          console.log("Constraint error:", error.message);
        }
      }
    }

    // Execute raw SQL to add missing columns
    const queries = [
      // Add experienceYears column if it doesn't exist
      `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "experienceYears" INTEGER`,

      // Add language-related columns
      `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "nativeLanguage" TEXT`,
      `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "languageSkills" JSONB`,
      `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "languageTestScores" JSONB`,

      // Add teaching-specific columns
      `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "teachingLicense" TEXT`,
      `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "teachingStyle" TEXT`,
      `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[]`,
      `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "subjects" TEXT[] DEFAULT ARRAY[]::TEXT[]`,
      `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "ageGroups" TEXT[] DEFAULT ARRAY[]::TEXT[]`,

      // Add location and availability columns
      `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "currentLocation" TEXT`,
      `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "willingToRelocate" BOOLEAN DEFAULT false`,
      `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "preferredLocations" TEXT[] DEFAULT ARRAY[]::TEXT[]`,
      `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "workAuthorization" TEXT[] DEFAULT ARRAY[]::TEXT[]`,
      `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMP(3)`,

      // Add education and experience columns
      `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "education" JSONB[] DEFAULT ARRAY[]::JSONB[]`,
      `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "specializations" TEXT[] DEFAULT ARRAY[]::TEXT[]`,
      `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "previousSchools" TEXT[] DEFAULT ARRAY[]::TEXT[]`,
      `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "references" JSONB[] DEFAULT ARRAY[]::JSONB[]`,
      `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "achievements" TEXT[] DEFAULT ARRAY[]::TEXT[]`,
      `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "publications" TEXT[] DEFAULT ARRAY[]::TEXT[]`,

      // Add personal columns
      `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "gender" TEXT`,
      `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "maritalStatus" TEXT`,

      // Add platform-specific columns
      `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "profileComplete" BOOLEAN DEFAULT false`,
      `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "profileViews" INTEGER DEFAULT 0`,
      `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "lastActive" TIMESTAMP(3)`,
      `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "searchable" BOOLEAN DEFAULT true`,

      // Add preferences columns
      `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "salaryExpectation" TEXT`,
      `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "jobTypePreference" TEXT[] DEFAULT ARRAY[]::TEXT[]`,
      `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "workEnvironmentPreference" TEXT[] DEFAULT ARRAY[]::TEXT[]`,

      // Add skills columns
      `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "technicalSkills" TEXT[] DEFAULT ARRAY[]::TEXT[]`,
      `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "softSkills" TEXT[] DEFAULT ARRAY[]::TEXT[]`,

      // Add missing file URL columns
      `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "resumeUrl" TEXT`,
      `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "portfolioUrl" TEXT`,
      `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "photoUrl" TEXT`,

      // Add missing verification and rating columns
      `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "verified" BOOLEAN DEFAULT false`,
      `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "rating" DOUBLE PRECISION`,
    ];

    // Execute each query
    const results = [];
    for (const query of queries) {
      try {
        await prisma.$executeRawUnsafe(query);
        results.push({
          query: query.substring(0, 50) + "...",
          status: "success",
        });
      } catch (error) {
        // If column already exists, that's fine
        if (error.code === "42701") {
          results.push({
            query: query.substring(0, 50) + "...",
            status: "already exists",
          });
        } else {
          results.push({
            query: query.substring(0, 50) + "...",
            status: "error",
            error: error.message,
          });
        }
      }
    }

    // Update existing records to have default values
    const updateQueries = [
      `UPDATE "teachers" SET "certifications" = ARRAY[]::TEXT[] WHERE "certifications" IS NULL`,
      `UPDATE "teachers" SET "subjects" = ARRAY[]::TEXT[] WHERE "subjects" IS NULL`,
      `UPDATE "teachers" SET "ageGroups" = ARRAY[]::TEXT[] WHERE "ageGroups" IS NULL`,
      `UPDATE "teachers" SET "preferredLocations" = ARRAY[]::TEXT[] WHERE "preferredLocations" IS NULL`,
      `UPDATE "teachers" SET "workAuthorization" = ARRAY[]::TEXT[] WHERE "workAuthorization" IS NULL`,
      `UPDATE "teachers" SET "education" = ARRAY[]::JSONB[] WHERE "education" IS NULL`,
      `UPDATE "teachers" SET "specializations" = ARRAY[]::TEXT[] WHERE "specializations" IS NULL`,
      `UPDATE "teachers" SET "previousSchools" = ARRAY[]::TEXT[] WHERE "previousSchools" IS NULL`,
      `UPDATE "teachers" SET "references" = ARRAY[]::JSONB[] WHERE "references" IS NULL`,
      `UPDATE "teachers" SET "achievements" = ARRAY[]::TEXT[] WHERE "achievements" IS NULL`,
      `UPDATE "teachers" SET "publications" = ARRAY[]::TEXT[] WHERE "publications" IS NULL`,
      `UPDATE "teachers" SET "jobTypePreference" = ARRAY[]::TEXT[] WHERE "jobTypePreference" IS NULL`,
      `UPDATE "teachers" SET "workEnvironmentPreference" = ARRAY[]::TEXT[] WHERE "workEnvironmentPreference" IS NULL`,
      `UPDATE "teachers" SET "technicalSkills" = ARRAY[]::TEXT[] WHERE "technicalSkills" IS NULL`,
      `UPDATE "teachers" SET "softSkills" = ARRAY[]::TEXT[] WHERE "softSkills" IS NULL`,
      `UPDATE "teachers" SET "willingToRelocate" = false WHERE "willingToRelocate" IS NULL`,
      `UPDATE "teachers" SET "profileComplete" = false WHERE "profileComplete" IS NULL`,
      `UPDATE "teachers" SET "profileViews" = 0 WHERE "profileViews" IS NULL`,
      `UPDATE "teachers" SET "searchable" = true WHERE "searchable" IS NULL`,
    ];

    // Execute update queries
    for (const query of updateQueries) {
      try {
        const result = await prisma.$executeRawUnsafe(query);
        results.push({
          query: query.substring(0, 50) + "...",
          status: "updated",
          rows: result,
        });
      } catch (error) {
        results.push({
          query: query.substring(0, 50) + "...",
          status: "update error",
          error: error.message,
        });
      }
    }

    // Test the schema by trying to query a teacher
    let schemaTest = { status: "not tested" };
    try {
      const testQuery = await prisma.teacher.findFirst({
        select: {
          id: true,
          experienceYears: true,
          languageSkills: true,
          technicalSkills: true,
          softSkills: true,
          certifications: true,
          subjects: true,
          ageGroups: true,
        },
      });
      schemaTest = { status: "success", message: "Schema is now compatible" };
    } catch (error) {
      schemaTest = { status: "error", message: error.message };
    }

    // Count total columns added
    const successCount = results.filter((r) => r.status === "success").length;
    const existingCount = results.filter(
      (r) => r.status === "already exists",
    ).length;
    const errorCount = results.filter(
      (r) => r.status === "error" || r.status === "update error",
    ).length;

    console.log("Emergency database fix completed");

    return res.status(200).json({
      message: "Emergency database fix completed",
      summary: {
        tablesCreated: tableResults.filter((r) => r.status === "success")
          .length,
        columnsAdded: successCount,
        columnsExisting: existingCount,
        errors: errorCount,
        total: results.length + tableResults.length,
      },
      tableResults,
      columnResults: results,
      schemaTest,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Emergency database fix failed:", error);
    return res.status(500).json({
      error: "Emergency database fix failed",
      details: error.message,
      code: error.code,
    });
  } finally {
    await prisma.$disconnect();
  }
}
