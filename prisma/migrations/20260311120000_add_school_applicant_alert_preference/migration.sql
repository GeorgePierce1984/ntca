-- AlterTable
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "emailSchoolApplicantAlerts" BOOLEAN NOT NULL DEFAULT true;
