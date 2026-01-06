#!/bin/bash

echo "🚀 Setting up NTCA Stripe products and prices..."

# Create Basic Plan Product
echo "Creating Basic Plan Product..."
BASIC_PRODUCT=$(stripe products create \
  --name "NTCA School Basic Plan" \
  --description "5 job postings per month with standard listings" | jq -r '.id')

echo "Basic Product ID: $BASIC_PRODUCT"

# Create Basic Plan Prices
echo "Creating Basic Plan Prices..."
BASIC_MONTHLY=$(stripe prices create \
  --product $BASIC_PRODUCT \
  --unit-amount 4900 \
  --currency usd \
  --recurring.interval month | jq -r '.id')

BASIC_ANNUAL=$(stripe prices create \
  --product $BASIC_PRODUCT \
  --unit-amount 51900 \
  --currency usd \
  --recurring.interval year | jq -r '.id')

echo "Basic Monthly Price ID: $BASIC_MONTHLY"
echo "Basic Annual Price ID: $BASIC_ANNUAL"

# Create Standard Plan Product
echo "Creating Standard Plan Product..."
STANDARD_PRODUCT=$(stripe products create \
  --name "NTCA School Standard Plan" \
  --description "25 job postings per month with premium listings and teacher network promotion" | jq -r '.id')

echo "Standard Product ID: $STANDARD_PRODUCT"

# Create Standard Plan Prices
echo "Creating Standard Plan Prices..."
STANDARD_MONTHLY=$(stripe prices create \
  --product $STANDARD_PRODUCT \
  --unit-amount 11900 \
  --currency usd \
  --recurring.interval month | jq -r '.id')

STANDARD_ANNUAL=$(stripe prices create \
  --product $STANDARD_PRODUCT \
  --unit-amount 125900 \
  --currency usd \
  --recurring.interval year | jq -r '.id')

echo "Standard Monthly Price ID: $STANDARD_MONTHLY"
echo "Standard Annual Price ID: $STANDARD_ANNUAL"

# Create Premium Plan Product
echo "Creating Premium Plan Product..."
PREMIUM_PRODUCT=$(stripe products create \
  --name "NTCA School Premium Plan" \
  --description "Unlimited job postings with AI-powered teacher matching and dedicated support" | jq -r '.id')

echo "Premium Product ID: $PREMIUM_PRODUCT"

# Create Premium Plan Prices
echo "Creating Premium Plan Prices..."
PREMIUM_MONTHLY=$(stripe prices create \
  --product $PREMIUM_PRODUCT \
  --unit-amount 29900 \
  --currency usd \
  --recurring.interval month | jq -r '.id')

PREMIUM_ANNUAL=$(stripe prices create \
  --product $PREMIUM_PRODUCT \
  --unit-amount 315900 \
  --currency usd \
  --recurring.interval year | jq -r '.id')

echo "Premium Monthly Price ID: $PREMIUM_MONTHLY"
echo "Premium Annual Price ID: $PREMIUM_ANNUAL"

# Output environment variables for easy copying
echo ""
echo "🎉 All products and prices created successfully!"
echo ""
echo "📋 Copy these environment variables to your .env file:"
echo ""
echo "# Stripe Price IDs for USD"
echo "VITE_STRIPE_BASIC_MONTHLY_USD=$BASIC_MONTHLY"
echo "VITE_STRIPE_BASIC_ANNUAL_USD=$BASIC_ANNUAL"
echo "VITE_STRIPE_STANDARD_MONTHLY_USD=$STANDARD_MONTHLY"
echo "VITE_STRIPE_STANDARD_ANNUAL_USD=$STANDARD_ANNUAL"
echo "VITE_STRIPE_PREMIUM_MONTHLY_USD=$PREMIUM_MONTHLY"
echo "VITE_STRIPE_PREMIUM_ANNUAL_USD=$PREMIUM_ANNUAL"
echo ""
echo "💡 Also add these to your Vercel environment variables!"
echo ""
echo "🔍 View your products in Stripe Dashboard:"
echo "https://dashboard.stripe.com/products" 