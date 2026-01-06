# Verify Stripe Webhook Configuration

## Step-by-Step Verification Guide

### Step 1: Check Current Production URL

Your current production URL is:
- **Production**: `https://ntca-dn33ivt4t-george-pierces-projects.vercel.app`
- **Custom Domain** (if configured): `https://ntca.vercel.app`

The webhook endpoint should be:
- `https://ntca.vercel.app/api/webhooks/stripe` (if custom domain)
- OR `https://ntca-dn33ivt4t-george-pierces-projects.vercel.app/api/webhooks/stripe` (Vercel URL)

### Step 2: Access Stripe Dashboard

1. **Go to Stripe Dashboard**
   - Visit: https://dashboard.stripe.com
   - Login with your Stripe account

2. **Check Current Mode**
   - Look at the toggle in the top right
   - Make sure you're in the correct mode (Test or Live)
   - **Important**: Webhooks are separate for Test and Live modes

### Step 3: Navigate to Webhooks

1. **Click "Developers"** in the left sidebar
2. **Click "Webhooks"**
3. You should see a list of webhook endpoints (if any exist)

### Step 4: Check Existing Webhooks

Look for webhooks with these URLs:
- `https://ntca.vercel.app/api/webhooks/stripe`
- `https://ntca-*.vercel.app/api/webhooks/stripe`
- Any URL ending in `/api/webhooks/stripe`

**What to check:**
- ✅ Does a webhook endpoint exist?
- ✅ Is the URL correct?
- ✅ Is it enabled?
- ✅ What events are selected?

### Step 5: Verify Required Events

The webhook MUST have these events selected:
- ✅ `checkout.session.completed` (CRITICAL - creates user account)
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

### Step 6: Check Webhook Signing Secret

1. **Click on your webhook endpoint**
2. **Scroll to "Signing secret" section**
3. **Click "Reveal"** to see the secret
4. **Copy the secret** (starts with `whsec_`)

### Step 7: Verify Secret in Vercel

1. **Go to Vercel Dashboard**
   - https://vercel.com/george-pierces-projects/ntca/settings/environment-variables

2. **Find `STRIPE_WEBHOOK_SECRET`**
3. **Verify it matches** the secret from Stripe Dashboard
4. **Check all environments** are selected (Production, Preview, Development)

### Step 8: Check Recent Webhook Attempts

1. **In Stripe Dashboard**, click on your webhook endpoint
2. **Scroll to "Webhook attempts"**
3. **Check recent attempts:**
   - ✅ Green = Success
   - ❌ Red = Failed
   - ⚠️ Yellow = Pending/Retrying

4. **Click on a recent attempt** to see:
   - Request details
   - Response from your server
   - Any error messages

### Step 9: Test Webhook (Optional)

If you want to test:

1. **In Stripe Dashboard** → Webhooks → Your endpoint
2. **Click "Send test webhook"**
3. **Select event**: `checkout.session.completed`
4. **Click "Send test webhook"**
5. **Check the response** - should be 200 OK

## Common Issues & Solutions

### Issue 1: No Webhook Endpoint Exists

**Solution:**
1. Click "Add endpoint" in Stripe Dashboard
2. Endpoint URL: `https://ntca.vercel.app/api/webhooks/stripe` (or your Vercel URL)
3. Select required events (see Step 5)
4. Save and copy the signing secret
5. Add `STRIPE_WEBHOOK_SECRET` to Vercel
6. Redeploy application

### Issue 2: Webhook URL is Wrong

**Solution:**
1. Update the webhook endpoint URL in Stripe
2. OR create a new webhook with the correct URL
3. Make sure it matches your production domain

### Issue 3: Webhook Secret Mismatch

**Solution:**
1. Get the correct secret from Stripe Dashboard
2. Update `STRIPE_WEBHOOK_SECRET` in Vercel
3. Redeploy application

### Issue 4: Webhook Events Not Selected

**Solution:**
1. Click on webhook endpoint in Stripe
2. Click "Update" or "Edit"
3. Select all required events (see Step 5)
4. Save

### Issue 5: Webhook Failing (500 errors)

**Check:**
1. Vercel Function logs for errors
2. Database connection (DATABASE_URL)
3. Missing environment variables
4. Prisma client issues

## Quick Checklist

- [ ] Webhook endpoint exists in Stripe Dashboard
- [ ] Webhook URL is correct (matches your Vercel domain)
- [ ] `checkout.session.completed` event is selected
- [ ] `STRIPE_WEBHOOK_SECRET` is set in Vercel
- [ ] Secret matches the one in Stripe Dashboard
- [ ] Application has been redeployed after setting secret
- [ ] Recent webhook attempts show success (200 OK)
- [ ] Test webhook works

## Next Steps After Verification

1. **If webhook is missing**: Create it following Step 1-5
2. **If webhook exists but failing**: Check Vercel logs
3. **If everything looks correct**: Test with a new school registration
4. **Monitor**: Check webhook attempts after test registration

