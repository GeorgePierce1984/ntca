#!/bin/bash

# NTCA Vercel CLI Deployment Script
# This script configures and deploys to Vercel

echo "🚀 NTCA Vercel Deployment"
echo "======================"
echo ""

cd "/Users/georgepierce/Desktop/Projects/ntca/ntca"

# Set up Node.js environment
export PATH="$PWD/node-v20.11.0-darwin-x64/bin:$PATH"

echo "📦 Setting up environment..."
echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Check if Vercel is authenticated
if vercel whoami &> /dev/null; then
    echo "✅ Already authenticated with Vercel"
    USER=$(vercel whoami)
    echo "   Logged in as: $USER"
    echo ""
    
    echo "🚀 Deploying to Vercel..."
    vercel --prod --yes
    
else
    echo "⚠️  Not authenticated with Vercel"
    echo ""
    echo "To authenticate, you need to:"
    echo ""
    echo "Option 1: Interactive Login (Recommended)"
    echo "-------------------------------------------"
    echo "Run: vercel login"
    echo "Then follow the instructions to open the browser"
    echo ""
    echo "Option 2: Use Authentication Token"
    echo "-----------------------------------"
    echo "1. Go to https://vercel.com/account/tokens"
    echo "2. Create a new token"
    echo "3. Run: vercel login YOUR_TOKEN"
    echo ""
    echo "Option 3: Deploy via Dashboard (Easiest)"
    echo "----------------------------------------"
    echo "1. Go to https://vercel.com/new"
    echo "2. Import rogit85/ntca"
    echo "3. Click Deploy"
    echo ""
    echo "Your changes are already on GitHub and ready to deploy!"
fi


