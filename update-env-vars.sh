#!/bin/bash

# Script to update environment variable names from REACT_APP_* to VITE_*

echo "🔄 Updating environment variables from REACT_APP_* to VITE_*..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "📝 Creating a new .env file with template variables..."

    cat > .env << 'EOF'
# Stripe Price IDs
VITE_STRIPE_STARTER_MONTHLY_PRICE_ID=
VITE_STRIPE_STARTER_ANNUAL_PRICE_ID=
VITE_STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID=
VITE_STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID=
VITE_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=
VITE_STRIPE_ENTERPRISE_ANNUAL_PRICE_ID=

# Add your Stripe price IDs above
EOF

    echo "✅ Created .env file with template variables"
    echo "⚠️  Please add your Stripe price IDs to the .env file"
else
    # Create a backup of the original .env file
    cp .env .env.backup
    echo "📋 Created backup: .env.backup"

    # Update REACT_APP_ to VITE_ in the .env file
    if grep -q "REACT_APP_" .env; then
        sed -i '' 's/REACT_APP_/VITE_/g' .env
        echo "✅ Updated environment variable prefixes from REACT_APP_* to VITE_*"
    else
        echo "ℹ️  No REACT_APP_* variables found in .env file"
    fi
fi

# Check if .env.local exists and update it too
if [ -f .env.local ]; then
    cp .env.local .env.local.backup
    echo "📋 Created backup: .env.local.backup"

    if grep -q "REACT_APP_" .env.local; then
        sed -i '' 's/REACT_APP_/VITE_/g' .env.local
        echo "✅ Updated environment variable prefixes in .env.local"
    fi
fi

# Check if .env.production exists and update it too
if [ -f .env.production ]; then
    cp .env.production .env.production.backup
    echo "📋 Created backup: .env.production.backup"

    if grep -q "REACT_APP_" .env.production; then
        sed -i '' 's/REACT_APP_/VITE_/g' .env.production
        echo "✅ Updated environment variable prefixes in .env.production"
    fi
fi

echo ""
echo "📌 Important next steps:"
echo "1. Review your updated .env files to ensure variables are correct"
echo "2. Add these environment variables to your Vercel project settings"
echo "3. Make sure all variables have values assigned"
echo ""
echo "🚀 Ready to deploy!"
