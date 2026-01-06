-- Migration: Add Stripe webhook fields
-- This adds fields needed for proper Stripe webhook handling

-- Add stripeCustomerId to users table
ALTER TABLE users ADD COLUMN "stripeCustomerId" TEXT;

-- Add subscription management fields to schools table
ALTER TABLE schools ADD COLUMN "subscriptionStatus" TEXT;
ALTER TABLE schools ADD COLUMN "currentPeriodEnd" TIMESTAMP(3);
ALTER TABLE schools ADD COLUMN "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE schools ADD COLUMN "subscriptionEndDate" TIMESTAMP(3);
ALTER TABLE schools ADD COLUMN "flagged" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE schools ADD COLUMN "flagReason" TEXT;

-- Create index on stripeCustomerId for faster lookups
CREATE INDEX "users_stripeCustomerId_idx" ON users("stripeCustomerId");

-- Create indexes on subscription fields for faster queries
CREATE INDEX "schools_subscriptionStatus_idx" ON schools("subscriptionStatus");
CREATE INDEX "schools_currentPeriodEnd_idx" ON schools("currentPeriodEnd");
