-- Script to add school description fields if they don't exist
-- Run this script manually in your database to ensure all fields are present

-- Add school description field to schools table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'schools' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE "schools" ADD COLUMN "description" TEXT;
        RAISE NOTICE 'Added description column to schools table';
    ELSE
        RAISE NOTICE 'Description column already exists in schools table';
    END IF;
END $$;

-- Add school description preference fields to jobs table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'jobs' 
        AND column_name = 'useSchoolProfile'
    ) THEN
        ALTER TABLE "jobs" ADD COLUMN "useSchoolProfile" BOOLEAN NOT NULL DEFAULT true;
        RAISE NOTICE 'Added useSchoolProfile column to jobs table';
    ELSE
        RAISE NOTICE 'useSchoolProfile column already exists in jobs table';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'jobs' 
        AND column_name = 'schoolDescription'
    ) THEN
        ALTER TABLE "jobs" ADD COLUMN "schoolDescription" TEXT;
        RAISE NOTICE 'Added schoolDescription column to jobs table';
    ELSE
        RAISE NOTICE 'schoolDescription column already exists in jobs table';
    END IF;
END $$;

-- Update any existing jobs to use school profile by default
UPDATE "jobs" 
SET "useSchoolProfile" = true 
WHERE "useSchoolProfile" IS NULL;

RAISE NOTICE 'School description fields setup complete!'; 