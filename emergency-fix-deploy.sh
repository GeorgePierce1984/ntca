#!/bin/bash

# NTCA Emergency Fix Deployment Script
# Fixes critical registration and login errors in production
# Date: December 2024

set -e  # Exit on any error

echo "🚨 NTCA EMERGENCY FIX DEPLOYMENT"
echo "================================"
echo "This script fixes critical registration/login errors"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Timestamp for logging
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="emergency_fix_${TIMESTAMP}.log"

# Function to log messages
log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

# Function to check prerequisites
check_prerequisites() {
    log "${BLUE}🔍 Checking prerequisites...${NC}"

    # Check for required commands
    for cmd in git npx vercel node; do
        if ! command -v $cmd &> /dev/null; then
            log "${RED}❌ $cmd is not installed. Please install it first.${NC}"
            exit 1
        fi
    done

    # Check for environment file
    if [ ! -f .env ]; then
        log "${RED}❌ .env file not found${NC}"
        exit 1
    fi

    log "${GREEN}✅ All prerequisites met${NC}"
}

# Function to backup current state
backup_current_state() {
    log ""
    log "${BLUE}📦 Creating backup...${NC}"

    # Create backup directory
    BACKUP_DIR="backups/emergency_${TIMESTAMP}"
    mkdir -p "$BACKUP_DIR"

    # Backup API files
    cp -r api/auth "$BACKUP_DIR/"

    # Save current git commit
    git rev-parse HEAD > "$BACKUP_DIR/git_commit.txt"

    log "${GREEN}✅ Backup created in $BACKUP_DIR${NC}"
}

# Function to apply code fixes
apply_code_fixes() {
    log ""
    log "${BLUE}🔧 Applying code fixes...${NC}"

    # Check if the registration API has already been fixed
    if grep -q "languageSkills" api/auth/register.js; then
        log "${YELLOW}⚠️  Registration API already appears to be fixed${NC}"
    else
        log "❌ Registration API needs fixing - please apply the fixes from FIX_REGISTRATION_ERRORS.md"
        log "   The api/auth/register.js file needs to be updated manually"
        exit 1
    fi

    log "${GREEN}✅ Code fixes verified${NC}"
}

# Function to test locally
test_locally() {
    log ""
    log "${BLUE}🧪 Running local tests...${NC}"

    # Generate Prisma client
    log "Generating Prisma client..."
    npx prisma generate >> "$LOG_FILE" 2>&1

    # Create test script
    cat > test_registration_fix.js << 'EOF'
const { PrismaClient } = require('@prisma/client');

async function testFix() {
    const prisma = new PrismaClient();
    try {
        console.log('Testing database schema...');

        // Test if we can query with new fields
        const result = await prisma.$queryRaw`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'teachers'
            AND column_name IN ('experienceYears', 'languageSkills', 'technicalSkills', 'softSkills')
        `;

        console.log(`Found ${result.length} expected columns`);

        if (result.length < 4) {
            console.error('❌ Missing columns detected - migration needed');
            process.exit(1);
        }

        console.log('✅ Schema test passed');
    } catch (error) {
        console.error('❌ Schema test failed:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

testFix();
EOF

    # Run test
    node test_registration_fix.js >> "$LOG_FILE" 2>&1
    local test_result=$?

    # Clean up
    rm test_registration_fix.js

    if [ $test_result -ne 0 ]; then
        log "${YELLOW}⚠️  Local schema needs migration${NC}"
        return 1
    else
        log "${GREEN}✅ Local tests passed${NC}"
        return 0
    fi
}

# Function to deploy code
deploy_code() {
    log ""
    log "${BLUE}🚀 Deploying code to Vercel...${NC}"

    # Commit any changes
    if [ -n "$(git status --porcelain)" ]; then
        log "Committing emergency fixes..."
        git add -A
        git commit -m "EMERGENCY FX: Fix registration/login field mapping issues" >> "$LOG_FILE" 2>&1
    fi

    # Deploy to Vercel
    log "Deploying to production..."
    vercel --prod --yes >> "$LOG_FILE" 2>&1

    if [ $? -eq 0 ]; then
        log "${GREEN}✅ Code deployed successfully${NC}"
    else
        log "${RED}❌ Deployment failed - check $LOG_FILE for details${NC}"
        exit 1
    fi
}

# Function to run database migration
run_migration() {
    log ""
    log "${BLUE}🗄️  Running database migration...${NC}"

    read -p "Do you want to run the database migration now? (y/n): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log "Running migration..."

        # First, create a migration if needed
        if [ ! -d "prisma/migrations" ] || [ -z "$(ls -A prisma/migrations)" ]; then
            log "Creating initial migration..."
            npx prisma migrate dev --name emergency_fix_teacher_schema --create-only >> "$LOG_FILE" 2>&1
        fi

        # Deploy migration
        npx prisma migrate deploy >> "$LOG_FILE" 2>&1

        if [ $? -eq 0 ]; then
            log "${GREEN}✅ Migration deployed successfully${NC}"
        else
            log "${RED}❌ Migration failed - manual intervention required${NC}"
            log "Check $LOG_FILE for details"
            log ""
            log "You can try running the manual migration:"
            log "  1. Connect to your database"
            log "  2. Run the SQL from prisma/migrations/manual_fix_teacher_schema/migration.sql"
            return 1
        fi
    else
        log "${YELLOW}⚠️  Skipping migration - remember to run it manually${NC}"
        return 1
    fi
}

# Function to verify fix
verify_fix() {
    log ""
    log "${BLUE}🔍 Verifying fix in production...${NC}"

    # Test the health endpoint
    HEALTH_URL="https://ntca.vercel.app/api/health"
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL")

    if [ "$HTTP_STATUS" = "200" ]; then
        log "${GREEN}✅ API is responding${NC}"
    else
        log "${RED}❌ API health check failed (HTTP $HTTP_STATUS)${NC}"
    fi

    # Provide test URLs
    log ""
    log "${BLUE}📋 Manual Testing Required:${NC}"
    log "1. Test registration: https://ntca.vercel.app/auth/signup"
    log "2. Test login: https://ntca.vercel.app/auth/login"
    log "3. Check Vercel logs: https://vercel.com/dashboard"
    log ""
    log "${YELLOW}⚠️  Monitor these endpoints for 10-15 minutes${NC}"
}

# Function to provide rollback instructions
provide_rollback_instructions() {
    log ""
    log "${BLUE}🔄 Rollback Instructions (if needed):${NC}"
    log "1. Restore from backup: cp -r $BACKUP_DIR/auth api/"
    log "2. Commit and push: git add -A && git commit -m 'Rollback emergency fix'"
    log "3. Deploy: vercel --prod"
    log "4. Restore previous deployment in Vercel dashboard"
}

# Main execution
main() {
    log "${PURPLE}Starting emergency fix deployment at $(date)${NC}"
    log "All actions will be logged to: $LOG_FILE"
    log ""

    # Confirm before proceeding
    log "${YELLOW}⚠️  This will deploy fixes to PRODUCTION${NC}"
    read -p "Are you sure you want to continue? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Deployment cancelled"
        exit 0
    fi

    # Execute steps
    check_prerequisites
    backup_current_state
    apply_code_fixes

    # Test locally first
    if test_locally; then
        log "${GREEN}✅ Local tests passed - proceeding with deployment${NC}"
    else
        log "${YELLOW}⚠️  Local tests indicate migration needed${NC}"
    fi

    deploy_code

    # Run migration if needed
    if ! run_migration; then
        log "${YELLOW}⚠️  Database migration was skipped or failed${NC}"
        log "The application may not work correctly until migration is applied"
    fi

    verify_fix
    provide_rollback_instructions

    log ""
    log "${GREEN}🎉 Emergency fix deployment complete!${NC}"
    log "Log saved to: $LOG_FILE"
    log ""
    log "${PURPLE}NEXT STEPS:${NC}"
    log "1. Test registration and login immediately"
    log "2. Monitor error logs for 30 minutes"
    log "3. If issues persist, use rollback instructions"
    log "4. Update monitoring to prevent future issues"
}

# Run main function
main
