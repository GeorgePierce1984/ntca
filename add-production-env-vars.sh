#!/bin/bash

# NTCA Production Environment Variables Setup Script
# This script helps you add the missing critical environment variables for production deployment

echo "🚀 NTCA Production Environment Variables Setup"
echo "=============================================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Please install it first:"
    echo "   npm i -g vercel"
    exit 1
fi

echo "✅ Vercel CLI is available"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📧 EMAIL SERVICE SETUP${NC}"
echo "================================================"
echo ""
echo "1. Go to https://resend.com and create a free account"
echo "2. Verify your domain or use the free resend.dev domain"
echo "3. Create an API key in the dashboard"
echo "4. The free tier includes 3,000 emails/month"
echo ""
read -p "Do you have your Resend API key ready? (y/n): " resend_ready

if [ "$resend_ready" = "y" ] || [ "$resend_ready" = "Y" ]; then
    echo ""
    echo "Adding RESEND_API_KEY to Vercel..."
    vercel env add RESEND_API_KEY production
    vercel env add RESEND_API_KEY preview
    vercel env add RESEND_API_KEY development
    echo -e "${GREEN}✅ RESEND_API_KEY added${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping RESEND_API_KEY - add it later with:${NC}"
    echo "   vercel env add RESEND_API_KEY production"
fi

echo ""
echo -e "${BLUE}🔒 SECURITY SETUP${NC}"
echo "================================================"
echo ""
echo "Adding INTERNAL_API_KEY for secure internal API calls..."

# Generate a secure internal API key
INTERNAL_KEY="internal_$(openssl rand -hex 28)"
echo "Generated secure internal API key: $INTERNAL_KEY"

echo "$INTERNAL_KEY" | vercel env add INTERNAL_API_KEY production --stdin
echo "$INTERNAL_KEY" | vercel env add INTERNAL_API_KEY preview --stdin
echo "$INTERNAL_KEY" | vercel env add INTERNAL_API_KEY development --stdin

echo -e "${GREEN}✅ INTERNAL_API_KEY added${NC}"

echo ""
echo -e "${BLUE}🌐 APPLICATION URL SETUP${NC}"
echo "================================================"
echo ""
echo "Adding NEXT_PUBLIC_APP_URL for proper email links..."

APP_URL="https://ntca.vercel.app"
echo "$APP_URL" | vercel env add NEXT_PUBLIC_APP_URL production --stdin
echo "$APP_URL" | vercel env add NEXT_PUBLIC_APP_URL preview --stdin
echo "$APP_URL" | vercel env add NEXT_PUBLIC_APP_URL development --stdin

echo -e "${GREEN}✅ NEXT_PUBLIC_APP_URL added${NC}"

echo ""
echo -e "${BLUE}📊 MONITORING SETUP (Optional)${NC}"
echo "================================================"
echo ""
read -p "Do you want to set up Sentry for error tracking? (y/n): " sentry_setup

if [ "$sentry_setup" = "y" ] || [ "$sentry_setup" = "Y" ]; then
    echo ""
    echo "1. Go to https://sentry.io and create a free account"
    echo "2. Create a new project for React"
    echo "3. Copy your DSN from the project settings"
    echo ""
    read -p "Do you have your Sentry DSN ready? (y/n): " sentry_ready

    if [ "$sentry_ready" = "y" ] || [ "$sentry_ready" = "Y" ]; then
        echo "Adding NEXT_PUBLIC_SENTRY_DSN..."
        vercel env add NEXT_PUBLIC_SENTRY_DSN production
        vercel env add NEXT_PUBLIC_SENTRY_DSN preview
        vercel env add NEXT_PUBLIC_SENTRY_DSN development
        echo -e "${GREEN}✅ NEXT_PUBLIC_SENTRY_DSN added${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipping Sentry setup${NC}"
fi

echo ""
echo -e "${BLUE}🎯 STRIPE WEBHOOK SETUP${NC}"
echo "================================================"
echo ""
read -p "Do you need to add Stripe webhook secret? (y/n): " webhook_setup

if [ "$webhook_setup" = "y" ] || [ "$webhook_setup" = "Y" ]; then
    echo ""
    echo "1. Go to your Stripe Dashboard"
    echo "2. Navigate to Developers > Webhooks"
    echo "3. Create a webhook endpoint: https://ntca.vercel.app/api/stripe/webhook"
    echo "4. Select events: customer.subscription.created, customer.subscription.updated, invoice.payment_succeeded"
    echo "5. Copy the webhook signing secret"
    echo ""
    echo "Adding STRIPE_WEBHOOK_SECRET..."
    vercel env add STRIPE_WEBHOOK_SECRET production
    vercel env add STRIPE_WEBHOOK_SECRET preview
    vercel env add STRIPE_WEBHOOK_SECRET development
    echo -e "${GREEN}✅ STRIPE_WEBHOOK_SECRET added${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping Stripe webhook setup${NC}"
fi

echo ""
echo -e "${GREEN}🎉 ENVIRONMENT SETUP COMPLETE!${NC}"
echo "================================================"
echo ""
echo "✅ Core environment variables added:"
echo "   - INTERNAL_API_KEY (generated securely)"
echo "   - NEXT_PUBLIC_APP_URL"
if [ "$resend_ready" = "y" ] || [ "$resend_ready" = "Y" ]; then
    echo "   - RESEND_API_KEY"
fi
if [ "$sentry_ready" = "y" ] || [ "$sentry_ready" = "Y" ]; then
    echo "   - NEXT_PUBLIC_SENTRY_DSN"
fi
if [ "$webhook_setup" = "y" ] || [ "$webhook_setup" = "Y" ]; then
    echo "   - STRIPE_WEBHOOK_SECRET"
fi

echo ""
echo -e "${BLUE}📋 NEXT STEPS:${NC}"
echo "================================================"
echo ""
echo "1. 🚀 Deploy your application:"
echo "   vercel --prod"
echo ""
echo "2. 🗄️  Run database migration:"
echo "   npx prisma migrate deploy"
echo ""
echo "3. 🧪 Test critical features:"
echo "   - User registration (teacher & school)"
echo "   - File upload (CV, photos)"
echo "   - Email notifications"
echo "   - Job applications"
echo ""
echo "4. 📈 Monitor deployment:"
echo "   - Check Vercel deployment logs"
echo "   - Test all user flows"
echo "   - Verify email delivery"
echo ""

if [ "$resend_ready" != "y" ] && [ "$resend_ready" != "Y" ]; then
    echo -e "${YELLOW}⚠️  IMPORTANT: Don't forget to add RESEND_API_KEY later!${NC}"
    echo "   Without it, no emails will be sent (registration, notifications, etc.)"
    echo ""
fi

echo -e "${GREEN}🚀 Your NTCA platform is ready for production!${NC}"
echo ""

# Update local .env file with generated internal key
echo ""
echo "Adding INTERNAL_API_KEY to local .env file..."
if grep -q "INTERNAL_API_KEY" .env; then
    sed -i.bak "s/INTERNAL_API_KEY=.*/INTERNAL_API_KEY=$INTERNAL_KEY/" .env
    echo "✅ Updated existing INTERNAL_API_KEY in .env"
else
    echo "" >> .env
    echo "# Internal API Security" >> .env
    echo "INTERNAL_API_KEY=$INTERNAL_KEY" >> .env
    echo "✅ Added INTERNAL_API_KEY to .env"
fi

echo ""
echo "🔧 Local development is also ready!"
echo "   Run: npm run dev"
