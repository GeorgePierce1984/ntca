#!/bin/bash

# NTCA Production Deployment Commands
# This script contains all commands needed to deploy NTCA to production
# Run each section step by step

echo "🚀 NTCA PRODUCTION DEPLOYMENT COMMANDS"
echo "====================================="
echo ""
echo "Follow these commands step by step to deploy NTCA to production"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Pre-Deployment Checklist:${NC}"
echo "[ ] You have a Vercel account and CLI installed"
echo "[ ] You have a Resend account (or will create one)"
echo "[ ] You are in the ntca directory"
echo "[ ] You have committed your changes to git"
echo ""

read -p "Ready to continue? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 0
fi

echo ""
echo -e "${BLUE}Step 1: Install Dependencies${NC}"
echo "================================"
echo "npm install"
echo ""
echo "Run this command? (y/n)"
read -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm install
fi

echo ""
echo -e "${BLUE}Step 2: Generate Prisma Client${NC}"
echo "================================"
echo "npx prisma generate"
echo ""
echo "Run this command? (y/n)"
read -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx prisma generate
fi

echo ""
echo -e "${BLUE}Step 3: Build Project${NC}"
echo "================================"
echo "npm run build"
echo ""
echo "Run this command? (y/n)"
read -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run build
fi

echo ""
echo -e "${BLUE}Step 4: Add Environment Variables to Vercel${NC}"
echo "============================================"
echo ""
echo -e "${YELLOW}You need to add these environment variables to Vercel:${NC}"
echo ""
echo "1. INTERNAL_API_KEY"
echo "   Value: internal_237abfa041067044b2b37180136b562cba4b904e6a7ba2757cde7217"
echo ""
echo "2. NEXT_PUBLIC_APP_URL"
echo "   Value: https://ntca.vercel.app"
echo ""
echo "3. RESEND_API_KEY"
echo "   Value: [Get from https://resend.com after signing up]"
echo ""
echo -e "${GREEN}Option A: Add via Vercel Dashboard (Recommended)${NC}"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Select your NTCA project"
echo "3. Go to Settings > Environment Variables"
echo "4. Add each variable for Production, Preview, and Development"
echo ""
echo -e "${GREEN}Option B: Add via CLI${NC}"
echo "vercel env add INTERNAL_API_KEY production"
echo "vercel env add NEXT_PUBLIC_APP_URL production"
echo "vercel env add RESEND_API_KEY production"
echo ""
read -p "Have you added the environment variables? (y/n): " -n 1 -r
echo ""

echo ""
echo -e "${BLUE}Step 5: Deploy to Production${NC}"
echo "================================"
echo "vercel --prod"
echo ""
echo "This will:"
echo "- Upload your code to Vercel"
echo "- Build the application"
echo "- Deploy to production"
echo "- Provide you with a deployment URL"
echo ""
echo "Run this command? (y/n)"
read -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    vercel --prod
fi

echo ""
echo -e "${BLUE}Step 6: Run Database Migration${NC}"
echo "================================"
echo "npx prisma migrate deploy"
echo ""
echo -e "${YELLOW}Note: This may fail if database is not accessible.${NC}"
echo "If it fails, you may need to:"
echo "1. Check DATABASE_URL in Vercel environment variables"
echo "2. Ensure database is accessible from your network"
echo "3. Try again from a different network"
echo ""
echo "Run this command? (y/n)"
read -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx prisma migrate deploy
fi

echo ""
echo -e "${BLUE}Step 7: Verify Deployment${NC}"
echo "================================"
echo ""
echo -e "${GREEN}Test these URLs:${NC}"
echo "1. Main site: https://ntca.vercel.app"
echo "2. API Health: https://ntca.vercel.app/api/health"
echo "3. Registration: https://ntca.vercel.app/auth/signup"
echo "4. Login: https://ntca.vercel.app/auth/login"
echo ""
echo -e "${GREEN}Check Vercel Dashboard:${NC}"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Check deployment status"
echo "3. View function logs for any errors"
echo ""

echo ""
echo -e "${BLUE}📋 Post-Deployment Checklist:${NC}"
echo "================================"
echo "[ ] Main site loads without errors"
echo "[ ] Registration works for teachers (free)"
echo "[ ] Registration works for schools (goes to Stripe)"
echo "[ ] Login works for both user types"
echo "[ ] API health check returns ok"
echo "[ ] No critical errors in Vercel logs"
echo ""

echo ""
echo -e "${YELLOW}⚠️  Email Service Setup:${NC}"
echo "========================"
echo "If you haven't set up Resend yet:"
echo "1. Go to https://resend.com"
echo "2. Sign up for free account (3,000 emails/month)"
echo "3. Get your API key"
echo "4. Add to Vercel: vercel env add RESEND_API_KEY production"
echo "5. Redeploy: vercel --prod"
echo ""

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "======================="
echo ""
echo "Your NTCA platform should now be live at https://ntca.vercel.app"
echo ""
echo "Monitor the deployment for the next 30 minutes and test all critical features."
echo ""
echo -e "${BLUE}If you encounter issues:${NC}"
echo "- Check Vercel logs: vercel logs"
echo "- View deployments: vercel ls"
echo "- Rollback if needed: vercel rollback"
echo ""
echo "Good luck! 🚀"
