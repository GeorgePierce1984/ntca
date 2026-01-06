-- CreateTable
CREATE TABLE "saved_jobs" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_jobs_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "teachers" ADD COLUMN     "achievements" TEXT[],
ADD COLUMN     "ageGroups" TEXT[],
ADD COLUMN     "availability" TEXT,
ADD COLUMN     "certifications" TEXT[],
ADD COLUMN     "currentLocation" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "education" JSONB[],
ADD COLUMN     "experienceYears" INTEGER,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "jobTypePreference" TEXT[],
ADD COLUMN     "languageSkills" JSONB,
ADD COLUMN     "languageTestScores" JSONB,
ADD COLUMN     "lastActive" TIMESTAMP(3),
ADD COLUMN     "maritalStatus" TEXT,
ADD COLUMN     "nativeLanguage" TEXT,
ADD COLUMN     "portfolioUrl" TEXT,
ADD COLUMN     "preferredLocations" TEXT[],
ADD COLUMN     "previousSchools" TEXT[],
ADD COLUMN     "profileComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "profileViews" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "publications" TEXT[],
ADD COLUMN     "references" JSONB[],
ADD COLUMN     "salaryExpectation" TEXT,
ADD COLUMN     "searchable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "softSkills" TEXT[],
ADD COLUMN     "specializations" TEXT[],
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "subjects" TEXT[],
ADD COLUMN     "teachingLicense" TEXT,
ADD COLUMN     "teachingStyle" TEXT,
ADD COLUMN     "technicalSkills" TEXT[],
ADD COLUMN     "visaStatus" TEXT,
ADD COLUMN     "willingToRelocate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "workAuthorization" TEXT[],
ADD COLUMN     "workEnvironmentPreference" TEXT[];

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "benefits" TEXT,
ADD COLUMN     "requirements" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "saved_jobs_teacherId_jobId_key" ON "saved_jobs"("teacherId", "jobId");

-- CreateIndex
CREATE INDEX "teachers_city_idx" ON "teachers"("city");
CREATE INDEX "teachers_country_idx" ON "teachers"("country");
CREATE INDEX "teachers_qualification_idx" ON "teachers"("qualification");
CREATE INDEX "teachers_subjects_idx" ON "teachers" USING GIN ("subjects");
CREATE INDEX "teachers_certifications_idx" ON "teachers" USING GIN ("certifications");
CREATE INDEX "teachers_searchable_idx" ON "teachers"("searchable");
CREATE INDEX "teachers_profileComplete_idx" ON "teachers"("profileComplete");

-- CreateIndex
CREATE INDEX "jobs_location_idx" ON "jobs"("location");
CREATE INDEX "jobs_qualification_idx" ON "jobs"("qualification");
CREATE INDEX "jobs_status_idx" ON "jobs"("status");
CREATE INDEX "jobs_deadline_idx" ON "jobs"("deadline");
CREATE INDEX "jobs_type_idx" ON "jobs"("type");
CREATE INDEX "jobs_visaRequired_idx" ON "jobs"("visaRequired");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_resetToken_idx" ON "users"("resetToken");

-- AddForeignKey
ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
