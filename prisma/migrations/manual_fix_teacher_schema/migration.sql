-- Fix Teacher Schema Migration
-- This migration adds missing columns and fixes field naming issues

-- Add experienceYears column if it doesn't exist
ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "experienceYears" INTEGER;

-- Add language-related columns
ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "nativeLanguage" TEXT;
ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "languageSkills" JSONB;
ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "languageTestScores" JSONB;

-- Add teaching-specific columns
ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "teachingLicense" TEXT;
ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "teachingStyle" TEXT;
ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "subjects" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "ageGroups" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add location and availability columns
ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "currentLocation" TEXT;
ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "willingToRelocate" BOOLEAN DEFAULT false;
ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "preferredLocations" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "workAuthorization" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMP(3);

-- Add education and experience columns
ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "education" JSONB[] DEFAULT ARRAY[]::JSONB[];
ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "specializations" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "previousSchools" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "references" JSONB[] DEFAULT ARRAY[]::JSONB[];
ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "achievements" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "publications" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add personal columns
ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "gender" TEXT;
ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "maritalStatus" TEXT;

-- Add platform-specific columns
ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "profileComplete" BOOLEAN DEFAULT false;
ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "profileViews" INTEGER DEFAULT 0;
ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "lastActive" TIMESTAMP(3);
ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "searchable" BOOLEAN DEFAULT true;

-- Add preferences columns
ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "salaryExpectation" TEXT;
ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "jobTypePreference" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "workEnvironmentPreference" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add skills columns
ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "technicalSkills" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "softSkills" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Drop old columns if they exist (these might have been created incorrectly)
ALTER TABLE "teachers" DROP COLUMN IF EXISTS "languages";
ALTER TABLE "teachers" DROP COLUMN IF EXISTS "skills";

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "teachers_experienceYears_idx" ON "teachers"("experienceYears");
CREATE INDEX IF NOT EXISTS "teachers_currentLocation_idx" ON "teachers"("currentLocation");
CREATE INDEX IF NOT EXISTS "teachers_searchable_idx" ON "teachers"("searchable");
CREATE INDEX IF NOT EXISTS "teachers_profileComplete_idx" ON "teachers"("profileComplete");

-- Update existing records to have default values for new required fields
UPDATE "teachers"
SET
  "certifications" = ARRAY[]::TEXT[]
WHERE "certifications" IS NULL;

UPDATE "teachers"
SET
  "subjects" = ARRAY[]::TEXT[]
WHERE "subjects" IS NULL;

UPDATE "teachers"
SET
  "ageGroups" = ARRAY[]::TEXT[]
WHERE "ageGroups" IS NULL;

UPDATE "teachers"
SET
  "preferredLocations" = ARRAY[]::TEXT[]
WHERE "preferredLocations" IS NULL;

UPDATE "teachers"
SET
  "workAuthorization" = ARRAY[]::TEXT[]
WHERE "workAuthorization" IS NULL;

UPDATE "teachers"
SET
  "education" = ARRAY[]::JSONB[]
WHERE "education" IS NULL;

UPDATE "teachers"
SET
  "specializations" = ARRAY[]::TEXT[]
WHERE "specializations" IS NULL;

UPDATE "teachers"
SET
  "previousSchools" = ARRAY[]::TEXT[]
WHERE "previousSchools" IS NULL;

UPDATE "teachers"
SET
  "references" = ARRAY[]::JSONB[]
WHERE "references" IS NULL;

UPDATE "teachers"
SET
  "achievements" = ARRAY[]::TEXT[]
WHERE "achievements" IS NULL;

UPDATE "teachers"
SET
  "publications" = ARRAY[]::TEXT[]
WHERE "publications" IS NULL;

UPDATE "teachers"
SET
  "jobTypePreference" = ARRAY[]::TEXT[]
WHERE "jobTypePreference" IS NULL;

UPDATE "teachers"
SET
  "workEnvironmentPreference" = ARRAY[]::TEXT[]
WHERE "workEnvironmentPreference" IS NULL;

UPDATE "teachers"
SET
  "technicalSkills" = ARRAY[]::TEXT[]
WHERE "technicalSkills" IS NULL;

UPDATE "teachers"
SET
  "softSkills" = ARRAY[]::TEXT[]
WHERE "softSkills" IS NULL;

UPDATE "teachers"
SET
  "willingToRelocate" = false
WHERE "willingToRelocate" IS NULL;

UPDATE "teachers"
SET
  "profileComplete" = false
WHERE "profileComplete" IS NULL;

UPDATE "teachers"
SET
  "profileViews" = 0
WHERE "profileViews" IS NULL;

UPDATE "teachers"
SET
  "searchable" = true
WHERE "searchable" IS NULL;
