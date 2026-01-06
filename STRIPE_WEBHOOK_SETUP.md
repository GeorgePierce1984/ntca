# Stripe Webhook Setup Guide

This guide will help you configure the Stripe webhook to automatically create user accounts after successful payments.

## Why This Is Important

When a school registers and pays through Stripe, their account is NOT created immediately. Instead:
1. User fills out the registration form
2. They're redirected to Stripe checkout
3. After successful payment, Stripe sends a webhook to your app
4. The webhook handler creates the user account in the database

**Without a properly configured webhook, paid users won't be able to login!**

## Step 1: Set Up Webhook in Stripe Dashboard

1. **Login to Stripe Dashboard**
   - Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
   - Make sure you're in the correct mode (Test or Live)

2. **Navigate to Webhooks**
   - Click on "Developers" in the left sidebar
   - Click on "Webhooks"
   - Click "Add endpoint"

3. **Configure Webhook Endpoint**
   - **Endpoint URL**: `https://ntca.vercel.app/api/webhooks/stripe`
   - **Description**: "NTCA Payment Webhook"
   - **Events to listen for** (select these):
     - `checkout.session.completed` ✅ (REQUIRED)
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`

4. **Save the Endpoint**
   - Click "Add endpoint"

## Step 2: Get Your Webhook Signing Secret

1. After creating the endpoint, you'll see the webhook details page
2. Look for "Signing secret" section
3. Click "Reveal" to show the secret
4. Copy the secret (it starts with `whsec_`)

## Step 3: Add Webhook Secret to Vercel

1. **Go to Vercel Dashboard**
   - Visit [https://vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your NTCA project

2. **Add Environment Variable**
   - Go to Settings → Environment Variables
   - Click "Add New"
   - **Name**: `STRIPE_WEBHOOK_SECRET`
   - **Value**: Paste your webhook signing secret (whsec_...)
   - **Environment**: Select all (Production, Preview, Development)
   - Click "Save"

3. **Redeploy Your Application**
   - Go to the Deployments tab
   - Click the three dots on the latest deployment
   - Click "Redeploy"

## Step 4: Test Your Webhook

### Option A: Using Stripe CLI (Recommended for Local Testing)

1. **Install Stripe CLI**
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe

   # Windows
   scoop install stripe

   # Linux
   # Download from https://github.com/stripe/stripe-cli/releases
   ```

2. **Login to Stripe CLI**
   ```bash
   stripe login
   ```

3. **Forward Webhooks to Local Server**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. **Trigger Test Event**
   ```bash
   stripe trigger checkout.session.completed
   ```

### Option B: Test with Real Payment (Test Mode)

1. Make sure Stripe is in **Test Mode**
2. Go through the registration flow on your site
3. Use test card: `4242 4242 4242 4242`
4. Any future date for expiry
5. Any 3 digits for CVC
6. Complete the payment

## Step 5: Verify Webhook is Working

1. **Check Stripe Dashboard**
   - Go to Developers → Webhooks
   - Click on your webhook endpoint
   - Check "Webhook attempts" - you should see successful attempts

2. **Check Vercel Function Logs**
   ```bash
   vercel logs https://ntca.vercel.app
   ```
   Look for messages like:
   - "Processing successful payment"
   - "Successfully created user from Stripe payment"

3. **Check Database**
   - The user should exist in the database
   - They should be able to login with their credentials

## Troubleshooting

### "Webhook signature verification failed"
- Make sure `STRIPE_WEBHOOK_SECRET` is correctly set in Vercel
- Ensure you're using the correct signing secret for your mode (test/live)
- Redeploy after adding the environment variable

### User Account Not Created After Payment
1. Check Vercel logs for errors
2. Verify webhook is receiving events in Stripe Dashboard
3. Check that all required metadata is being sent in checkout session
4. Ensure database connection is working

### 500 Error on Webhook Endpoint
- Check Vercel Function logs
- Common issues:
  - Missing environment variables
  - Database connection issues
  - Prisma client not generated

### Testing Checklist
- [ ] Webhook endpoint added in Stripe Dashboard
- [ ] Correct events selected (especially `checkout.session.completed`)
- [ ] `STRIPE_WEBHOOK_SECRET` added to Vercel
- [ ] Application redeployed after adding secret
- [ ] Test payment completed successfully
- [ ] User can login after payment

## Important Notes

1. **Test vs Live Mode**: Make sure your webhook endpoint and signing secret match the mode you're using
2. **Multiple Environments**: You might need different webhooks for development, staging, and production
3. **Webhook Retries**: Stripe will retry failed webhooks, so ensure your handler is idempotent
4. **Security**: Never expose your webhook signing secret in client-side code

## Need Help?

If you're still having issues:
1. Check the detailed Vercel Function logs
2. Review the Stripe webhook attempt details
3. Ensure all environment variables are correctly set
4. Verify the database schema matches what the webhook expects