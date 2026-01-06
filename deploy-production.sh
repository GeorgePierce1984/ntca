#!/bin/bash

# NTCA Production Deployment Script
# This script handles the complete deployment process for the NTCA platform

set -e  # Exit on any error

echo "🚀 NTCA PRODUCTION DEPLOYMENT"
echo "============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
PRODUCTION_URL="https://ntca.vercel.app"
REQUIRED_NODE_VERSION="18"

# Function to print step headers
print_step() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Function to check command exists
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 is not installed. Please install it first.${NC}"
        exit 1
    fi
}

# Function to pause and wait for user
pause() {
    echo ""
    read -p "Press Enter to continue..."
}

print_step "🔍 Pre-deployment Checks"

# Check required tools
echo "Checking required tools..."
check_command node
check_command npm
check_command vercel
check_command npx

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt "$REQUIRED_NODE_VERSION" ]; then
    echo -e "${RED}❌ Node.js version $REQUIRED_NODE_VERSION or higher is required${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All required tools are installed${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Not in the NTCA project directory${NC}"
    exit 1
fi

print_step "📦 Installing Dependencies"

echo "Installing npm packages..."
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

print_step "🔐 Environment Variables Check"

echo "Checking critical environment variables in Vercel..."
echo ""

# Function to check if env var exists in Vercel
check_env_var() {
    if vercel env ls | grep -q "$1"; then
        echo -e "${GREEN}✅ $1 is configured${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 is MISSING${NC}"
        return 1
    fi
}

MISSING_VARS=0

# Check critical environment variables
check_env_var "DATABASE_URL" || MISSING_VARS=$((MISSING_VARS + 1))
check_env_var "JWT_SECRET" || MISSING_VARS=$((MISSING_VARS + 1))
check_env_var "STRIPE_SECRET_KEY" || MISSING_VARS=$((MISSING_VARS + 1))
check_env_var "BLOB_READ_WRITE_TOKEN" || MISSING_VARS=$((MISSING_VARS + 1))

# Check for missing critical vars that need to be added
echo ""
echo -e "${YELLOW}Checking for missing critical variables...${NC}"
check_env_var "RESEND_API_KEY" || {
    echo -e "${YELLOW}⚠️  Email service will not work without RESEND_API_KEY${NC}"
    MISSING_VARS=$((MISSING_VARS + 1))
}
check_env_var "INTERNAL_API_KEY" || {
    echo -e "${YELLOW}⚠️  Internal API security is not configured${NC}"
    MISSING_VARS=$((MISSING_VARS + 1))
}
check_env_var "NEXT_PUBLIC_APP_URL" || {
    echo -e "${YELLOW}⚠️  App URL is not configured${NC}"
    MISSING_VARS=$((MISSING_VARS + 1))
}

if [ $MISSING_VARS -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}⚠️  $MISSING_VARS environment variable(s) need attention${NC}"
    echo ""
    echo "To add missing variables, run:"
    echo -e "${BLUE}./add-production-env-vars.sh${NC}"
    echo ""
    read -p "Continue deployment anyway? (y/n): " continue_deploy
    if [ "$continue_deploy" != "y" ] && [ "$continue_deploy" != "Y" ]; then
        echo "Deployment cancelled."
        exit 1
    fi
fi

print_step "🗄️  Database Setup"

echo "Generating Prisma client..."
npx prisma generate

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Prisma client generated${NC}"
else
    echo -e "${RED}❌ Failed to generate Prisma client${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Note: Database migration will be run after deployment${NC}"

print_step "🏗️  Building Application"

echo "Building production bundle..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build completed successfully${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# Check build output
if [ -d "dist" ]; then
    BUILD_SIZE=$(du -sh dist | cut -f1)
    echo -e "${GREEN}✅ Build size: $BUILD_SIZE${NC}"
else
    echo -e "${RED}❌ Build output not found${NC}"
    exit 1
fi

print_step "🚀 Deploying to Vercel"

echo "Deploying to production..."
echo ""

# Deploy with Vercel
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Deployment successful!${NC}"
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

print_step "🗄️  Running Database Migration"

echo "Running production database migration..."
echo ""
echo -e "${YELLOW}This will update your production database schema${NC}"
read -p "Run migration now? (y/n): " run_migration

if [ "$run_migration" = "y" ] || [ "$run_migration" = "Y" ]; then
    npx prisma migrate deploy

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database migration completed${NC}"
    else
        echo -e "${RED}❌ Database migration failed${NC}"
        echo -e "${YELLOW}You may need to run this manually later${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Remember to run database migration manually:${NC}"
    echo "   npx prisma migrate deploy"
fi

print_step "🧪 Post-Deployment Verification"

echo "Checking deployment health..."
echo ""

# Check if the site is accessible
echo -n "Checking site availability... "
if curl -s -o /dev/null -w "%{http_code}" "$PRODUCTION_URL" | grep -q "200"; then
    echo -e "${GREEN}✅ Site is live!${NC}"
else
    echo -e "${YELLOW}⚠️  Site may still be propagating${NC}"
fi

# Check API health
echo -n "Checking API health... "
if curl -s "$PRODUCTION_URL/api/health" | grep -q "ok"; then
    echo -e "${GREEN}✅ API is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  API health check failed${NC}"
fi

print_step "📋 Production Testing Checklist"

echo "Please test the following critical features:"
echo ""
echo "1. 🔐 Authentication"
echo "   [ ] Teacher registration works"
echo "   [ ] School registration works"
echo "   [ ] Login functionality works"
echo "   [ ] Password reset emails sent"
echo ""
echo "2. 📧 Email Notifications"
echo "   [ ] Welcome emails are sent"
echo "   [ ] Application notifications work"
echo "   [ ] Status updates are sent"
echo ""
echo "3. 📁 File Upload"
echo "   [ ] CV upload works"
echo "   [ ] Photo upload works"
echo "   [ ] Files are accessible"
echo ""
echo "4. 💼 Job Applications"
echo "   [ ] Jobs can be posted"
echo "   [ ] Teachers can apply"
echo "   [ ] Applications appear in dashboard"
echo ""
echo "5. 💳 Payments"
echo "   [ ] Stripe checkout works"
echo "   [ ] Subscriptions are created"
echo "   [ ] Webhooks are processed"
echo ""

print_step "🎉 Deployment Complete!"

echo -e "${GREEN}Your NTCA platform is now live at:${NC}"
echo -e "${PURPLE}$PRODUCTION_URL${NC}"
echo ""
echo "📊 Monitoring:"
echo "   - Vercel Dashboard: https://vercel.com/dashboard"
echo "   - Database: Check your Neon dashboard"
echo "   - Stripe: Monitor payments in Stripe dashboard"
echo ""
echo "🔧 Next Steps:"
echo "   1. Complete the testing checklist above"
echo "   2. Monitor error logs in Vercel"
echo "   3. Set up monitoring alerts"
echo "   4. Create user documentation"
echo ""

if [ $MISSING_VARS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Remember: $MISSING_VARS environment variable(s) still need to be configured${NC}"
    echo "   Run: ./add-production-env-vars.sh"
    echo ""
fi

echo -e "${GREEN}🚀 Congratulations on launching NTCA!${NC}"
