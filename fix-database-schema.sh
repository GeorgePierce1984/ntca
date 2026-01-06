#!/bin/bash

# NTCA Database Schema Fix Script
# This script fixes database schema mismatches and ensures the database is in sync with Prisma schema

set -e  # Exit on any error

echo "🔧 NTCA Database Schema Fix"
echo "==========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if command exists
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 is not installed. Please install it first.${NC}"
        exit 1
    fi
}

# Check required tools
echo "Checking required tools..."
check_command npx
check_command node

echo -e "${GREEN}✅ All required tools are installed${NC}"
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo -e "${GREEN}✅ Environment variables loaded${NC}"
else
    echo -e "${RED}❌ .env file not found${NC}"
    exit 1
fi

# Check database connection
echo -e "${BLUE}🔍 Checking database connection...${NC}"
npx prisma db pull --force > /dev/null 2>&1 && echo -e "${GREEN}✅ Database connection successful${NC}" || echo -e "${YELLOW}⚠️  Database connection issues detected${NC}"

echo ""
echo -e "${BLUE}📋 Current Database Status:${NC}"
echo "=================================="
npx prisma migrate status || true
echo ""

# Create backup warning
echo -e "${YELLOW}⚠️  IMPORTANT: This script will modify your database schema${NC}"
echo "It's recommended to backup your database before proceeding."
echo ""
read -p "Do you want to continue? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Operation cancelled."
    exit 1
fi

echo ""
echo -e "${BLUE}🔄 Step 1: Generate Prisma Client${NC}"
echo "=================================="
npx prisma generate

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Prisma client generated successfully${NC}"
else
    echo -e "${RED}❌ Failed to generate Prisma client${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔄 Step 2: Create Migration${NC}"
echo "=================================="

# Check if migrations folder exists
if [ ! -d "prisma/migrations" ]; then
    echo "No migrations found. Creating initial migration..."
    npx prisma migrate dev --name initial_schema --create-only
else
    echo "Creating migration for schema fixes..."
    npx prisma migrate dev --name fix_teacher_schema --create-only
fi

echo ""
echo -e "${BLUE}🔄 Step 3: Review Migration${NC}"
echo "=================================="
echo "A new migration has been created but not yet applied."
echo "Review the migration file to ensure it's correct."
echo ""
echo "The migration will:"
echo "- Add missing columns (experienceYears, etc.)"
echo "- Update column types if needed"
echo "- Add any missing indexes"
echo ""
read -p "Apply the migration now? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🔄 Step 4: Apply Migration${NC}"
    echo "=================================="

    # Apply migration
    npx prisma migrate deploy

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Migration applied successfully${NC}"
    else
        echo -e "${RED}❌ Migration failed${NC}"
        echo ""
        echo "Common issues and solutions:"
        echo "1. If column already exists: The migration may have partially applied"
        echo "2. If data type conflicts: You may need to manually update data"
        echo "3. If constraints fail: Check for invalid data in the database"
        echo ""
        echo "You can manually edit the migration file in prisma/migrations/"
        echo "Then run: npx prisma migrate deploy"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Migration not applied. You can apply it later with:${NC}"
    echo "   npx prisma migrate deploy"
fi

echo ""
echo -e "${BLUE}🔄 Step 5: Verify Schema${NC}"
echo "=================================="

# Create a test script to verify the schema
cat > verify-schema.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifySchema() {
  try {
    console.log('Testing database schema...\n');

    // Test User model
    console.log('✓ Checking User model...');
    const userCount = await prisma.user.count();
    console.log(`  Found ${userCount} users`);

    // Test Teacher model with all fields
    console.log('\n✓ Checking Teacher model...');
    const teacherCount = await prisma.teacher.count();
    console.log(`  Found ${teacherCount} teachers`);

    // Try to access experienceYears field
    const teacherWithExp = await prisma.teacher.findFirst({
      select: {
        id: true,
        experienceYears: true,
        languageSkills: true,
        technicalSkills: true,
        softSkills: true,
      }
    });

    if (teacherWithExp) {
      console.log('  ✓ experienceYears field accessible');
      console.log('  ✓ languageSkills field accessible');
      console.log('  ✓ technicalSkills field accessible');
      console.log('  ✓ softSkills field accessible');
    } else {
      console.log('  No teachers found to test fields');
    }

    // Test School model
    console.log('\n✓ Checking School model...');
    const schoolCount = await prisma.school.count();
    console.log(`  Found ${schoolCount} schools`);

    console.log('\n✅ Schema verification complete!');

  } catch (error) {
    console.error('\n❌ Schema verification failed:', error.message);
    console.error('\nThis usually means the database schema is not in sync.');
    console.error('Run: npx prisma migrate deploy');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifySchema();
EOF

echo "Running schema verification..."
node verify-schema.js

# Clean up
rm verify-schema.js

echo ""
echo -e "${BLUE}📋 Final Database Status:${NC}"
echo "=================================="
npx prisma migrate status

echo ""
echo -e "${GREEN}🎉 Database Schema Fix Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Test user registration and login"
echo "2. Deploy the updated code to production"
echo "3. Run migrations on production database"
echo ""
echo -e "${YELLOW}For production deployment:${NC}"
echo "1. Set DATABASE_URL to production database"
echo "2. Run: npx prisma migrate deploy"
echo "3. Verify with: npx prisma migrate status"
echo ""
echo -e "${BLUE}If you encounter issues:${NC}"
echo "- Check the migration files in prisma/migrations/"
echo "- Ensure all environment variables are set correctly"
echo "- Check database connection and permissions"
echo "- Review error logs for specific issues"
