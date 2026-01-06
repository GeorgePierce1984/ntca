# Add STRIPE_WEBHOOK_SECRET to Vercel

## 🎯 Quick Steps

### Step 1: Get Webhook Secret from Stripe

1. **Go to Stripe Dashboard**
   - https://dashboard.stripe.com/webhooks

2. **Click on your webhook endpoint** (the one you found)

3. **Find "Signing secret" section**
   - Usually near the top of the webhook details page

4. **Click "Reveal"** button

5. **Copy the secret**
   - It will look like: `whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - ⚠️ **Copy this immediately** - you'll need it for the next step

### Step 2: Add to Vercel

1. **Go to Vercel Dashboard**
   - https://vercel.com/george-pierces-projects/ntca/settings/environment-variables

2. **Click "Add New"** button

3. **Enter the following:**
   - **Key**: `STRIPE_WEBHOOK_SECRET`
   - **Value**: Paste the secret you copied from Stripe (whsec_...)
   - **Environments**: Select ALL three:
     - ✅ Production
     - ✅ Preview
     - ✅ Development

4. **Click "Save"**

### Step 3: Redeploy Application

**CRITICAL**: After adding the secret, you MUST redeploy:

1. **Go to Deployments tab** in Vercel
2. **Click the three dots (⋯)** on the latest deployment
3. **Click "Redeploy"**
4. **Wait for deployment to complete** (usually 1-2 minutes)

### Step 4: Verify It's Working

1. **In Stripe**, go to your webhook
2. **Click "Send test webhook"**
3. **Select event**: `checkout.session.completed`
4. **Click "Send test webhook"**
5. **Should return 200 OK** (not 500 error)

## ⚠️ Important Notes

- **STRIPE_SECRET_KEY** and **STRIPE_WEBHOOK_SECRET** are different:
  - `STRIPE_SECRET_KEY` = Your Stripe API key (for making API calls)
  - `STRIPE_WEBHOOK_SECRET` = Webhook signing secret (for verifying webhooks)

- **Both are required** for the system to work properly

- **Test vs Live Mode**: 
  - If you're in Test mode in Stripe, get the Test mode webhook secret
  - If you're in Live mode, get the Live mode webhook secret
  - They are different!

## 🔍 Verification

After adding and redeploying, check:

1. **Vercel Environment Variables:**
   - `STRIPE_SECRET_KEY` ✅ (you already have this)
   - `STRIPE_WEBHOOK_SECRET` ✅ (you just added this)

2. **Stripe Webhook:**
   - Has `checkout.session.completed` event ✅
   - URL is correct ✅
   - Test webhook returns 200 OK ✅

3. **Test Registration:**
   - Try signing up as a new school
   - Complete Stripe checkout
   - Check if account is created in database

