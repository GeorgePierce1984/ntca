#!/bin/bash

# Script to set up email-related environment variables in Vercel
# Run this script to configure all email settings for production

echo "Setting up email environment variables for Vercel..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Error: Vercel CLI is not installed. Please install it with: npm i -g vercel"
    exit 1
fi

# Email service configuration
echo "Configuring Resend email service..."

# Set Resend API key
# IMPORTANT: Replace with your actual Resend API key from https://resend.com
read -p "Enter your Resend API key: " RESEND_KEY
vercel env add RESEND_API_KEY production <<< "$RESEND_KEY"
echo "✓ RESEND_API_KEY set for production"

# Set email domain and addresses
vercel env add EMAIL_FROM_ADDRESS production <<< "noreply@ntca.com"
echo "✓ EMAIL_FROM_ADDRESS set for production"

vercel env add EMAIL_FROM_NAME production <<< "NTCA Platform"
echo "✓ EMAIL_FROM_NAME set for production"

vercel env add EMAIL_REPLY_TO production <<< "support@ntca.com"
echo "✓ EMAIL_REPLY_TO set for production"

# Set support email addresses
vercel env add SUPPORT_EMAIL production <<< "support@ntca.com"
echo "✓ SUPPORT_EMAIL set for production"

vercel env add ADMIN_EMAIL production <<< "admin@ntca.com"
echo "✓ ADMIN_EMAIL set for production"

# Set notification preferences
vercel env add SEND_APPLICATION_NOTIFICATIONS production <<< "true"
echo "✓ SEND_APPLICATION_NOTIFICATIONS set for production"

vercel env add SEND_STATUS_UPDATE_NOTIFICATIONS production <<< "true"
echo "✓ SEND_STATUS_UPDATE_NOTIFICATIONS set for production"

vercel env add SEND_SUBSCRIPTION_NOTIFICATIONS production <<< "true"
echo "✓ SEND_SUBSCRIPTION_NOTIFICATIONS set for production"

vercel env add SEND_JOB_ALERTS production <<< "true"
echo "✓ SEND_JOB_ALERTS set for production"

# Email rate limiting
vercel env add EMAIL_RATE_LIMIT_PER_HOUR production <<< "100"
echo "✓ EMAIL_RATE_LIMIT_PER_HOUR set for production"

# Development/staging environments (optional)
read -p "Do you want to set up email variables for development environment? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Setting up development environment..."

    vercel env add RESEND_API_KEY development <<< "$RESEND_KEY"
    vercel env add EMAIL_FROM_ADDRESS development <<< "dev@ntca.com"
    vercel env add EMAIL_FROM_NAME development <<< "NTCA Dev"
    vercel env add EMAIL_REPLY_TO development <<< "dev-support@ntca.com"
    vercel env add SUPPORT_EMAIL development <<< "dev-support@ntca.com"
    vercel env add ADMIN_EMAIL development <<< "dev-admin@ntca.com"
    vercel env add SEND_APPLICATION_NOTIFICATIONS development <<< "true"
    vercel env add SEND_STATUS_UPDATE_NOTIFICATIONS development <<< "true"
    vercel env add SEND_SUBSCRIPTION_NOTIFICATIONS development <<< "true"
    vercel env add SEND_JOB_ALERTS development <<< "true"
    vercel env add EMAIL_RATE_LIMIT_PER_HOUR development <<< "50"

    echo "✓ Development environment variables set"
fi

echo
echo "Email environment setup complete!"
echo
echo "Important Notes:"
echo "1. Make sure to update the EMAIL_FROM_ADDRESS to use a verified domain in Resend"
echo "2. Update the Resend API key if this is just a test key"
echo "3. Configure your domain's DNS records as instructed by Resend"
echo "4. Test email sending in development before deploying to production"
echo
echo "To verify your environment variables, run: vercel env ls"
echo "To pull environment variables locally, run: vercel env pull"
