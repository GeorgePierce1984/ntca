# Vercel Environment Variables Setup Guide

## 🎯 Required Environment Variables

You need to add these 3 critical environment variables to Vercel for the platform to work properly:

### 1. INTERNAL_API_KEY
**Value:** `internal_237abfa041067044b2b37180136b562cba4b904e6a7ba2757cde7217`
**Purpose:** Secures internal API endpoints
**Environments:** Production, Preview, Development

### 2. NEXT_PUBLIC_APP_URL
**Value:** `https://ntca.vercel.app`
**Purpose:** Sets the base URL for the application (used in emails, redirects, etc.)
**Environments:** Production, Preview, Development

### 3. RESEND_API_KEY
**Value:** `[Get from https://resend.com]`
**Purpose:** Enables email sending functionality
**Environments:** Production, Preview, Development
**Note:** Platform will work without this, but no emails will be sent

## 📋 How to Add via Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Navigate to https://vercel.com/dashboard
   - Select your `ntca` project

2. **Access Environment Variables**
   - Click on "Settings" tab
   - Select "Environment Variables" from the left sidebar

3. **Add Each Variable**
   - Click "Add New"
   - Enter the variable name exactly as shown above
   - Paste the value
   - Select all environments (Production ✓, Preview ✓, Development ✓)
   - Click "Save"

4. **Redeploy After Adding Variables**
   - Go to "Deployments" tab
   - Click the three dots on the latest deployment
   - Select "Redeploy"

## 🔍 Variables Already Configured

These environment variables are already set up in Vercel:
- ✅ DATABASE_URL
- ✅ JWT_SECRET
- ✅ STRIPE_SECRET_KEY
- ✅ BLOB_READ_WRITE_TOKEN
- ✅ All Stripe price IDs
- ✅ Stack Auth keys

## 🚨 Important Notes

1. **Case Sensitive**: Variable names are case-sensitive. Copy them exactly.

2. **RESEND_API_KEY**: 
   - Sign up at https://resend.com
   - Free tier includes 3,000 emails/month
   - Get API key from dashboard (starts with `re_`)

3. **After Adding Variables**:
   - You must redeploy for changes to take effect
   - Check logs for any errors related to missing variables

## ✅ Verification

After adding variables and redeploying:

1. Check API health: https://ntca.vercel.app/api/health
2. Test registration (emails won't send without RESEND_API_KEY)
3. Monitor Vercel function logs for any errors

## 🆘 Troubleshooting

If you see errors after deployment:
- "INTERNAL_API_KEY not defined" → Variable not added or typo in name
- "Email sending failed" → RESEND_API_KEY not configured
- "Invalid environment" → NEXT_PUBLIC_APP_URL not set

Remember to redeploy after adding or changing environment variables!