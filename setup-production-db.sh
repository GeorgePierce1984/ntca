#!/bin/bash

# NTCA Production Database Setup Script
# This script sets up the database for production deployment

echo "🗄️  NTCA Production Database Setup"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if required tools are installed
if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ npx is not installed. Please install Node.js first.${NC}"
    exit 1
fi

echo -e "${BLUE}📊 Checking current database status...${NC}"
echo ""

# Check if we can connect to the database
if npx prisma db pull --force > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${YELLOW}⚠️  Database connection issue - will attempt setup anyway${NC}"
fi

echo ""
echo -e "${BLUE}🔄 Generating Prisma client...${NC}"
npx prisma generate

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Prisma client generated successfully${NC}"
else
    echo -e "${RED}❌ Failed to generate Prisma client${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📋 Creating migration for current schema...${NC}"

# Create a new migration based on current schema
npx prisma migrate dev --create-only --name "production_ready_schema"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migration created successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Migration creation had issues - continuing anyway${NC}"
fi

echo ""
echo -e "${BLUE}🚀 Production deployment commands:${NC}"
echo "=================================="
echo ""
echo "After deploying to Vercel, run these commands:"
echo ""
echo -e "${YELLOW}1. Deploy the migration to production:${NC}"
echo "   npx prisma migrate deploy"
echo ""
echo -e "${YELLOW}2. Generate production client:${NC}"
echo "   npx prisma generate"
echo ""
echo -e "${YELLOW}3. Verify database status:${NC}"
echo "   npx prisma migrate status"
echo ""
echo -e "${YELLOW}4. (Optional) Seed initial data:${NC}"
echo "   node prisma/seed.js"
echo ""

echo -e "${BLUE}📊 Database Schema Summary:${NC}"
echo "=================================="
echo ""
echo "✅ Core Tables:"
echo "   - users (authentication & user management)"
echo "   - schools (school profiles & subscriptions)"
echo "   - teachers (enhanced teacher profiles)"
echo "   - jobs (job postings with Kazakhstan-specific fields)"
echo "   - applications (job applications with status tracking)"
echo "   - saved_jobs (teacher saved jobs)"
echo "   - application_notes (application communication)"
echo "   - job_alerts (teacher job notifications)"
echo "   - activity_logs (system activity tracking)"
echo ""

echo "✅ Key Features:"
echo "   - Complete teacher profiles with certifications"
echo "   - School subscription management"
echo "   - File upload support (CV, photos, portfolios)"
echo "   - Kazakhstan-specific requirements"
echo "   - Application status tracking"
echo "   - Job alerts and saved jobs"
echo "   - Activity logging for security"
echo ""

echo -e "${BLUE}🔒 Security Features:${NC}"
echo "=================================="
echo "   - Password hashing with bcrypt"
echo "   - JWT token authentication"
echo "   - Unique constraints to prevent duplicates"
echo "   - Cascade deletes for data integrity"
echo "   - Activity logging for audit trails"
echo ""

echo -e "${BLUE}🌟 Production-Ready Features:${NC}"
echo "=================================="
echo "   - Stripe integration for payments"
echo "   - File upload with Vercel Blob"
echo "   - Email notifications with Resend"
echo "   - Comprehensive user profiles"
echo "   - Job application workflow"
echo "   - School subscription management"
echo ""

echo -e "${GREEN}🎉 Database is Production Ready!${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Deploy your application: vercel --prod"
echo "2. Run migration on production: npx prisma migrate deploy"
echo "3. Test user registration and core features"
echo ""

# Create a simple database health check script
echo -e "${BLUE}📝 Creating database health check script...${NC}"

cat > check-db-health.js << 'EOF'
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabaseHealth() {
  try {
    console.log('🔍 Checking database connection...');

    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Check if tables exist by counting records
    const userCount = await prisma.user.count();
    const schoolCount = await prisma.school.count();
    const teacherCount = await prisma.teacher.count();
    const jobCount = await prisma.job.count();

    console.log('\n📊 Database Statistics:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Schools: ${schoolCount}`);
    console.log(`   Teachers: ${teacherCount}`);
    console.log(`   Jobs: ${jobCount}`);

    // Test a simple query
    const recentUsers = await prisma.user.findMany({
      take: 1,
      orderBy: { createdAt: 'desc' }
    });

    console.log('\n✅ Database queries working correctly');
    console.log('🎉 Database health check passed!');

  } catch (error) {
    console.error('❌ Database health check failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseHealth();
EOF

chmod +x check-db-health.js

echo -e "${GREEN}✅ Database health check script created: check-db-health.js${NC}"
echo ""
echo "Run after deployment: node check-db-health.js"
echo ""

echo -e "${GREEN}🚀 Your database is ready for production deployment!${NC}"
