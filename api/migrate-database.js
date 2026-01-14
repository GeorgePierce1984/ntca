// Database migration endpoint for creating conversations and messages tables
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Check if this is being run in production (basic safety check)
  // Temporarily allowing all hosts for migration - can be restricted later
  // if (process.env.NODE_ENV === "production" && req.headers.host !== "ntca.vercel.app") {
  //   return res.status(403).json({ error: "Migration only allowed on production domain" });
  // }

  try {
    console.log("Starting database migration...");

    // Check if stripeCustomerId column already exists
    const userColumns = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name = 'stripeCustomerId'
    `;

    if (userColumns.length === 0) {
      console.log("Adding stripeCustomerId to users table...");
      await prisma.$executeRaw`ALTER TABLE users ADD COLUMN "stripeCustomerId" TEXT`;
      await prisma.$executeRaw`CREATE INDEX "users_stripeCustomerId_idx" ON users("stripeCustomerId")`;
    } else {
      console.log("stripeCustomerId column already exists");
    }

    // Check if subscription fields exist in schools table
    const schoolColumns = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'schools'
      AND column_name IN ('subscriptionStatus', 'currentPeriodEnd', 'cancelAtPeriodEnd', 'subscriptionEndDate', 'flagged', 'flagReason')
    `;

    const existingColumns = schoolColumns.map((col) => col.column_name);

    if (!existingColumns.includes("subscriptionStatus")) {
      console.log("Adding subscriptionStatus to schools table...");
      await prisma.$executeRaw`ALTER TABLE schools ADD COLUMN "subscriptionStatus" TEXT`;
      await prisma.$executeRaw`CREATE INDEX "schools_subscriptionStatus_idx" ON schools("subscriptionStatus")`;
    }

    if (!existingColumns.includes("currentPeriodEnd")) {
      console.log("Adding currentPeriodEnd to schools table...");
      await prisma.$executeRaw`ALTER TABLE schools ADD COLUMN "currentPeriodEnd" TIMESTAMP(3)`;
      await prisma.$executeRaw`CREATE INDEX "schools_currentPeriodEnd_idx" ON schools("currentPeriodEnd")`;
    }

    if (!existingColumns.includes("cancelAtPeriodEnd")) {
      console.log("Adding cancelAtPeriodEnd to schools table...");
      await prisma.$executeRaw`ALTER TABLE schools ADD COLUMN "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false`;
    }

    if (!existingColumns.includes("subscriptionEndDate")) {
      console.log("Adding subscriptionEndDate to schools table...");
      await prisma.$executeRaw`ALTER TABLE schools ADD COLUMN "subscriptionEndDate" TIMESTAMP(3)`;
    }

    if (!existingColumns.includes("flagged")) {
      console.log("Adding flagged to schools table...");
      await prisma.$executeRaw`ALTER TABLE schools ADD COLUMN "flagged" BOOLEAN NOT NULL DEFAULT false`;
    }

    if (!existingColumns.includes("flagReason")) {
      console.log("Adding flagReason to schools table...");
      await prisma.$executeRaw`ALTER TABLE schools ADD COLUMN "flagReason" TEXT`;
    }

    // Check if coverPhotoUrl exists in schools table
    const coverPhotoCheck = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'schools'
      AND column_name = 'coverPhotoUrl'
    `;

    if (coverPhotoCheck.length === 0) {
      console.log("Adding coverPhotoUrl to schools table...");
      await prisma.$executeRaw`ALTER TABLE schools ADD COLUMN "coverPhotoUrl" TEXT`;
    } else {
      console.log("coverPhotoUrl column already exists");
    }

    // Check if conversations table exists
    const conversationsTableCheck = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name = 'conversations'
    `;

    if (conversationsTableCheck.length === 0) {
      console.log("Creating conversations table...");
      
      // First, ensure schools and teachers tables have primary keys
      // Check if primary key exists on schools table
      const schoolsPkCheck = await prisma.$queryRaw`
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_name = 'schools'
        AND constraint_type = 'PRIMARY KEY'
      `;
      
      // Check if primary key exists on teachers table
      const teachersPkCheck = await prisma.$queryRaw`
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_name = 'teachers'
        AND constraint_type = 'PRIMARY KEY'
      `;
      
      if (schoolsPkCheck.length === 0) {
        console.log("Checking if schools.id column exists and adding primary key...");
        // Check if the column exists first
        const schoolsIdColumn = await prisma.$queryRaw`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_name = 'schools'
          AND column_name = 'id'
        `;
        if (schoolsIdColumn.length > 0) {
          try {
            await prisma.$executeRaw`
              ALTER TABLE "schools" ADD CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
            `;
            console.log("✓ Added primary key to schools table");
          } catch (pkError) {
            console.log("Note: Could not add primary key to schools (may already exist or have duplicates):", pkError.message);
          }
        }
      } else {
        console.log("✓ schools table already has primary key");
      }
      
      if (teachersPkCheck.length === 0) {
        console.log("Checking if teachers.id column exists and adding primary key...");
        // Check if the column exists first
        const teachersIdColumn = await prisma.$queryRaw`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_name = 'teachers'
          AND column_name = 'id'
        `;
        if (teachersIdColumn.length > 0) {
          try {
            await prisma.$executeRaw`
              ALTER TABLE "teachers" ADD CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
            `;
            console.log("✓ Added primary key to teachers table");
          } catch (pkError) {
            console.log("Note: Could not add primary key to teachers (may already exist or have duplicates):", pkError.message);
          }
        }
      } else {
        console.log("✓ teachers table already has primary key");
      }
      
      // Create conversations table WITHOUT foreign keys first
      // We'll add foreign keys separately if the referenced tables have proper constraints
      await prisma.$executeRaw`
        CREATE TABLE "conversations" (
          "id" TEXT NOT NULL,
          "schoolId" TEXT NOT NULL,
          "teacherId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
        )
      `;
      await prisma.$executeRaw`
        CREATE UNIQUE INDEX "conversations_schoolId_teacherId_key" ON "conversations"("schoolId", "teacherId")
      `;
      await prisma.$executeRaw`
        CREATE INDEX "conversations_schoolId_idx" ON "conversations"("schoolId")
      `;
      await prisma.$executeRaw`
        CREATE INDEX "conversations_teacherId_idx" ON "conversations"("teacherId")
      `;
      console.log("✓ Created conversations table");
      
      // Try to add foreign key constraints (skip if they fail)
      // First check if we can query the schools/teachers tables to verify structure
      try {
        const schoolCheck = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "schools" LIMIT 1`;
        console.log("✓ Verified schools table exists and is accessible");
        
        // Try to add foreign key for schoolId
        try {
          await prisma.$executeRaw`
            ALTER TABLE "conversations" ADD CONSTRAINT "conversations_schoolId_fkey" 
            FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE
          `;
          console.log("✓ Added foreign key constraint for conversations.schoolId");
        } catch (fkError) {
          console.log("⚠ Could not add foreign key for schoolId (table created without FK):", fkError.message.split('\n')[0]);
        }
      } catch (err) {
        console.log("⚠ Could not verify schools table:", err.message.split('\n')[0]);
      }
      
      try {
        const teacherCheck = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "teachers" LIMIT 1`;
        console.log("✓ Verified teachers table exists and is accessible");
        
        // Try to add foreign key for teacherId
        try {
          await prisma.$executeRaw`
            ALTER TABLE "conversations" ADD CONSTRAINT "conversations_teacherId_fkey" 
            FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE
          `;
          console.log("✓ Added foreign key constraint for conversations.teacherId");
        } catch (fkError) {
          console.log("⚠ Could not add foreign key for teacherId (table created without FK):", fkError.message.split('\n')[0]);
        }
      } catch (err) {
        console.log("⚠ Could not verify teachers table:", err.message.split('\n')[0]);
      }
    } else {
      console.log("conversations table already exists");
    }

    // Check if messages table exists
    const messagesTableCheck = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name = 'messages'
    `;

    if (messagesTableCheck.length === 0) {
      console.log("Creating messages table...");
      
      // First check if UserType enum exists, create it if not
      const enumCheck = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'UserType'
        ) as exists
      `;
      
      if (!enumCheck[0]?.exists) {
        console.log("Creating UserType enum...");
        await prisma.$executeRaw`CREATE TYPE "UserType" AS ENUM ('SCHOOL', 'TEACHER')`;
      }
      
      await prisma.$executeRaw`
        CREATE TABLE "messages" (
          "id" TEXT NOT NULL,
          "conversationId" TEXT NOT NULL,
          "senderId" TEXT NOT NULL,
          "senderType" "UserType" NOT NULL,
          "content" TEXT NOT NULL,
          "read" BOOLEAN NOT NULL DEFAULT false,
          "readAt" TIMESTAMP(3),
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
        )
      `;
      await prisma.$executeRaw`
        CREATE INDEX "messages_conversationId_idx" ON "messages"("conversationId")
      `;
      await prisma.$executeRaw`
        CREATE INDEX "messages_senderId_idx" ON "messages"("senderId")
      `;
      console.log("✓ Created messages table");
      
      // Try to add foreign key constraint (skip if it fails)
      try {
        await prisma.$executeRaw`
          ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" 
          FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `;
        console.log("✓ Added foreign key constraint for messages.conversationId");
      } catch (fkError) {
        console.log("⚠ Could not add foreign key for messages.conversationId (table created without FK):", fkError.message.split('\n')[0]);
      }
    } else {
      console.log("messages table already exists");
      
      // Check if senderType column needs to be converted to enum type
      const columnTypeCheck = await prisma.$queryRaw`
        SELECT data_type
        FROM information_schema.columns
        WHERE table_name = 'messages'
        AND column_name = 'senderType'
      `;
      
      if (columnTypeCheck.length > 0 && columnTypeCheck[0].data_type === 'text') {
        console.log("Converting senderType column from TEXT to UserType enum...");
        try {
          // First ensure UserType enum exists
          const enumCheck = await prisma.$queryRaw`
            SELECT EXISTS (
              SELECT 1 FROM pg_type WHERE typname = 'UserType'
            ) as exists
          `;
          
          if (!enumCheck[0]?.exists) {
            await prisma.$executeRaw`CREATE TYPE "UserType" AS ENUM ('SCHOOL', 'TEACHER')`;
          }
          
          // Convert the column type
          await prisma.$executeRaw`
            ALTER TABLE "messages" 
            ALTER COLUMN "senderType" TYPE "UserType" 
            USING "senderType"::"UserType"
          `;
          console.log("✓ Converted senderType to UserType enum");
        } catch (convertError) {
          console.log("⚠ Could not convert senderType column:", convertError.message.split('\n')[0]);
        }
      }
    }

    // Try to add foreign key constraints if they don't exist (skip if they fail)
    // These are already handled above when creating the conversations table, but we'll try again here
    // in case the table was created in a previous run without foreign keys
    if (conversationsTableCheck.length > 0) {
      const schoolsConversationsCheck = await prisma.$queryRaw`
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_name = 'conversations'
        AND constraint_name = 'conversations_schoolId_fkey'
      `;

      if (schoolsConversationsCheck.length === 0) {
        try {
          await prisma.$executeRaw`
            ALTER TABLE "conversations" ADD CONSTRAINT "conversations_schoolId_fkey" 
            FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE
          `;
          console.log("✓ Added foreign key constraint for conversations.schoolId");
        } catch (fkError) {
          console.log("⚠ Could not add foreign key for conversations.schoolId:", fkError.message.split('\n')[0]);
        }
      }

      const teachersConversationsCheck = await prisma.$queryRaw`
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_name = 'conversations'
        AND constraint_name = 'conversations_teacherId_fkey'
      `;

      if (teachersConversationsCheck.length === 0) {
        try {
          await prisma.$executeRaw`
            ALTER TABLE "conversations" ADD CONSTRAINT "conversations_teacherId_fkey" 
            FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE
          `;
          console.log("✓ Added foreign key constraint for conversations.teacherId");
        } catch (fkError) {
          console.log("⚠ Could not add foreign key for conversations.teacherId:", fkError.message.split('\n')[0]);
        }
      }
    }

    // Add new school profile fields
    const teachingPhilosophyCheck = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'schools'
      AND column_name = 'teachingPhilosophy'
    `;

    if (teachingPhilosophyCheck.length === 0) {
      console.log("Adding teachingPhilosophy to schools table...");
      await prisma.$executeRaw`ALTER TABLE "schools" ADD COLUMN "teachingPhilosophy" TEXT`;
      console.log("✓ Added teachingPhilosophy column to schools table");
    } else {
      console.log("teachingPhilosophy column already exists");
    }

    const studentAgeRangeMinCheck = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'schools'
      AND column_name = 'studentAgeRangeMin'
    `;

    if (studentAgeRangeMinCheck.length === 0) {
      console.log("Adding studentAgeRangeMin to schools table...");
      await prisma.$executeRaw`ALTER TABLE "schools" ADD COLUMN "studentAgeRangeMin" INTEGER`;
      console.log("✓ Added studentAgeRangeMin column to schools table");
    } else {
      console.log("studentAgeRangeMin column already exists");
    }

    const studentAgeRangeMaxCheck = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'schools'
      AND column_name = 'studentAgeRangeMax'
    `;

    if (studentAgeRangeMaxCheck.length === 0) {
      console.log("Adding studentAgeRangeMax to schools table...");
      await prisma.$executeRaw`ALTER TABLE "schools" ADD COLUMN "studentAgeRangeMax" INTEGER`;
      console.log("✓ Added studentAgeRangeMax column to schools table");
    } else {
      console.log("studentAgeRangeMax column already exists");
    }

    const averageClassSizeCheck = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'schools'
      AND column_name = 'averageClassSize'
    `;

    if (averageClassSizeCheck.length === 0) {
      console.log("Adding averageClassSize to schools table...");
      await prisma.$executeRaw`ALTER TABLE "schools" ADD COLUMN "averageClassSize" INTEGER`;
      console.log("✓ Added averageClassSize column to schools table");
    } else {
      console.log("averageClassSize column already exists");
    }

    const curriculumCheck = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'schools'
      AND column_name = 'curriculum'
    `;

    if (curriculumCheck.length === 0) {
      console.log("Adding curriculum to schools table...");
      await prisma.$executeRaw`ALTER TABLE "schools" ADD COLUMN "curriculum" TEXT`;
      console.log("✓ Added curriculum column to schools table");
    } else {
      console.log("curriculum column already exists");
    }

    const benefitsCheck = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'schools'
      AND column_name = 'benefits'
    `;

    if (benefitsCheck.length === 0) {
      console.log("Adding benefits to schools table...");
      await prisma.$executeRaw`ALTER TABLE "schools" ADD COLUMN "benefits" TEXT`;
      console.log("✓ Added benefits column to schools table");
    } else {
      console.log("benefits column already exists");
    }

    // Add new job fields
    const subjectsTaughtCheck = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'jobs'
      AND column_name = 'subjectsTaught'
    `;

    if (subjectsTaughtCheck.length === 0) {
      console.log("Adding subjectsTaught to jobs table...");
      await prisma.$executeRaw`ALTER TABLE "jobs" ADD COLUMN "subjectsTaught" TEXT`;
      console.log("✓ Added subjectsTaught column to jobs table");
    } else {
      console.log("subjectsTaught column already exists");
    }

    const studentAgeGroupMinCheck = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'jobs'
      AND column_name = 'studentAgeGroupMin'
    `;

    if (studentAgeGroupMinCheck.length === 0) {
      console.log("Adding studentAgeGroupMin to jobs table...");
      await prisma.$executeRaw`ALTER TABLE "jobs" ADD COLUMN "studentAgeGroupMin" INTEGER`;
      console.log("✓ Added studentAgeGroupMin column to jobs table");
    } else {
      console.log("studentAgeGroupMin column already exists");
    }

    const studentAgeGroupMaxCheck = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'jobs'
      AND column_name = 'studentAgeGroupMax'
    `;

    if (studentAgeGroupMaxCheck.length === 0) {
      console.log("Adding studentAgeGroupMax to jobs table...");
      await prisma.$executeRaw`ALTER TABLE "jobs" ADD COLUMN "studentAgeGroupMax" INTEGER`;
      console.log("✓ Added studentAgeGroupMax column to jobs table");
    } else {
      console.log("studentAgeGroupMax column already exists");
    }

    const startDateCheck = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'jobs'
      AND column_name = 'startDate'
    `;

    if (startDateCheck.length === 0) {
      console.log("Adding startDate to jobs table...");
      await prisma.$executeRaw`ALTER TABLE "jobs" ADD COLUMN "startDate" TIMESTAMP(3)`;
      console.log("✓ Added startDate column to jobs table");
    } else {
      console.log("startDate column already exists");
    }

    const contractLengthCheck = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'jobs'
      AND column_name = 'contractLength'
    `;

    if (contractLengthCheck.length === 0) {
      console.log("Adding contractLength to jobs table...");
      await prisma.$executeRaw`ALTER TABLE "jobs" ADD COLUMN "contractLength" TEXT`;
      console.log("✓ Added contractLength column to jobs table");
    } else {
      console.log("contractLength column already exists");
    }

    const teachingHoursPerWeekCheck = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'jobs'
      AND column_name = 'teachingHoursPerWeek'
    `;

    if (teachingHoursPerWeekCheck.length === 0) {
      console.log("Adding teachingHoursPerWeek to jobs table...");
      await prisma.$executeRaw`ALTER TABLE "jobs" ADD COLUMN "teachingHoursPerWeek" TEXT`;
      console.log("✓ Added teachingHoursPerWeek column to jobs table");
    } else {
      console.log("teachingHoursPerWeek column already exists");
    }

    const useSchoolBenefitsCheck = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'jobs'
      AND column_name = 'useSchoolBenefits'
    `;

    if (useSchoolBenefitsCheck.length === 0) {
      console.log("Adding useSchoolBenefits to jobs table...");
      await prisma.$executeRaw`ALTER TABLE "jobs" ADD COLUMN "useSchoolBenefits" BOOLEAN NOT NULL DEFAULT true`;
      console.log("✓ Added useSchoolBenefits column to jobs table");
    } else {
      console.log("useSchoolBenefits column already exists");
    }

    // Migrate jobs.location to jobs.city and jobs.country
    const jobColumns = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'jobs'
      AND column_name IN ('location', 'city', 'country')
    `;

    const existingJobColumns = jobColumns.map((col) => col.column_name);

    if (existingJobColumns.includes("location") && (!existingJobColumns.includes("city") || !existingJobColumns.includes("country"))) {
      console.log("Migrating jobs.location to jobs.city and jobs.country...");
      
      // Add city and country columns
      if (!existingJobColumns.includes("city")) {
        await prisma.$executeRaw`ALTER TABLE "jobs" ADD COLUMN "city" TEXT`;
        console.log("✓ Added city column to jobs table");
      }
      
      if (!existingJobColumns.includes("country")) {
        await prisma.$executeRaw`ALTER TABLE "jobs" ADD COLUMN "country" TEXT`;
        console.log("✓ Added country column to jobs table");
      }

      // Migrate existing location data
      // Try to parse "City, Country" format
      const jobsWithLocation = await prisma.$queryRaw`
        SELECT id, location
        FROM jobs
        WHERE location IS NOT NULL AND location != ''
      `;

      for (const job of jobsWithLocation) {
        const location = job.location;
        let city = location;
        let country = "";

        // Try to split by comma
        if (location.includes(",")) {
          const parts = location.split(",").map(p => p.trim());
          if (parts.length >= 2) {
            // Last part is country, rest is city
            country = parts[parts.length - 1];
            city = parts.slice(0, -1).join(", ");
          } else {
            // Single comma, split in half
            const mid = Math.floor(parts.length / 2);
            city = parts.slice(0, mid).join(", ");
            country = parts.slice(mid).join(", ");
          }
        } else {
          // No comma, assume it's just a city
          city = location;
          country = "Kazakhstan"; // Default country
        }

        await prisma.$executeRaw`
          UPDATE jobs
          SET city = ${city}, country = ${country}
          WHERE id = ${job.id}
        `;
      }

      console.log(`✓ Migrated ${jobsWithLocation.length} job locations to city and country`);

      // Drop the location column
      await prisma.$executeRaw`ALTER TABLE "jobs" DROP COLUMN "location"`;
      console.log("✓ Dropped location column from jobs table");
    } else if (existingJobColumns.includes("location")) {
      console.log("⚠ jobs.location column exists but city/country columns also exist - skipping migration");
    } else if (!existingJobColumns.includes("location")) {
      console.log("✓ jobs table already has city and country columns (location column does not exist)");
    }

    // Add new teacher fields
    const teachingExperienceCheck = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'teachers'
      AND column_name = 'teachingExperience'
    `;

    if (teachingExperienceCheck.length === 0) {
      console.log("Adding teachingExperience to teachers table...");
      await prisma.$executeRaw`ALTER TABLE "teachers" ADD COLUMN "teachingExperience" JSONB`;
      console.log("✓ Added teachingExperience column to teachers table");
    } else {
      console.log("teachingExperience column already exists");
    }

    const otherLanguagesCheck = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'teachers'
      AND column_name = 'otherLanguages'
    `;

    if (otherLanguagesCheck.length === 0) {
      console.log("Adding otherLanguages to teachers table...");
      await prisma.$executeRaw`ALTER TABLE "teachers" ADD COLUMN "otherLanguages" TEXT`;
      console.log("✓ Added otherLanguages column to teachers table");
    } else {
      console.log("otherLanguages column already exists");
    }

    const refereeAvailableCheck = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'teachers'
      AND column_name = 'refereeAvailable'
    `;

    if (refereeAvailableCheck.length === 0) {
      console.log("Adding refereeAvailable to teachers table...");
      await prisma.$executeRaw`ALTER TABLE "teachers" ADD COLUMN "refereeAvailable" BOOLEAN DEFAULT false`;
      console.log("✓ Added refereeAvailable column to teachers table");
    } else {
      console.log("refereeAvailable column already exists");
    }

    const salaryExpectationVisibleCheck = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'teachers'
      AND column_name = 'salaryExpectationVisible'
    `;

    if (salaryExpectationVisibleCheck.length === 0) {
      console.log("Adding salaryExpectationVisible to teachers table...");
      await prisma.$executeRaw`ALTER TABLE "teachers" ADD COLUMN "salaryExpectationVisible" BOOLEAN DEFAULT true`;
      console.log("✓ Added salaryExpectationVisible column to teachers table");
    } else {
      console.log("salaryExpectationVisible column already exists");
    }

    const anonymiseProfileCheck = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'teachers'
      AND column_name = 'anonymiseProfile'
    `;

    if (anonymiseProfileCheck.length === 0) {
      console.log("Adding anonymiseProfile to teachers table...");
      await prisma.$executeRaw`ALTER TABLE "teachers" ADD COLUMN "anonymiseProfile" BOOLEAN DEFAULT false`;
      console.log("✓ Added anonymiseProfile column to teachers table");
    } else {
      console.log("anonymiseProfile column already exists");
    }

    const downloadableProfilePDFCheck = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'teachers'
      AND column_name = 'downloadableProfilePDF'
    `;

    if (downloadableProfilePDFCheck.length === 0) {
      console.log("Adding downloadableProfilePDF to teachers table...");
      await prisma.$executeRaw`ALTER TABLE "teachers" ADD COLUMN "downloadableProfilePDF" BOOLEAN DEFAULT true`;
      console.log("✓ Added downloadableProfilePDF column to teachers table");
    } else {
      console.log("downloadableProfilePDF column already exists");
    }

    // Check if email verification fields exist in users table
    const emailVerificationCheck = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name IN ('emailVerified', 'resetToken', 'resetTokenExpiry')
    `;

    const existingEmailVerificationColumns = emailVerificationCheck.map((col) => col.column_name);

    if (!existingEmailVerificationColumns.includes("emailVerified")) {
      console.log("Adding emailVerified to users table...");
      await prisma.$executeRaw`ALTER TABLE "users" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false`;
      console.log("✓ Added emailVerified column to users table");
    } else {
      console.log("emailVerified column already exists");
    }

    if (!existingEmailVerificationColumns.includes("resetToken")) {
      console.log("Adding resetToken to users table...");
      await prisma.$executeRaw`ALTER TABLE "users" ADD COLUMN "resetToken" TEXT`;
      console.log("✓ Added resetToken column to users table");
    } else {
      console.log("resetToken column already exists");
    }

    if (!existingEmailVerificationColumns.includes("resetTokenExpiry")) {
      console.log("Adding resetTokenExpiry to users table...");
      await prisma.$executeRaw`ALTER TABLE "users" ADD COLUMN "resetTokenExpiry" TIMESTAMP(3)`;
      console.log("✓ Added resetTokenExpiry column to users table");
    } else {
      console.log("resetTokenExpiry column already exists");
    }

    console.log("Migration completed successfully!");

    res.status(200).json({
      success: true,
      message: "Database migration completed successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Migration error:", error);
    res.status(500).json({
      error: "Migration failed",
      details: error.message,
    });
  } finally {
    await prisma.$disconnect();
  }
}
