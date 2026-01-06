# Step-by-Step Webhook Verification

## ✅ Complete Verification Checklist

### Step 1: Check Webhook URL

1. **In Stripe Dashboard**, click on your webhook endpoint
2. **Look at the "Endpoint URL"** field
3. **Verify it matches one of these:**
   - `https://ntca.vercel.app/api/webhooks/stripe` (if you have custom domain)
   - `https://ntca-*.vercel.app/api/webhooks/stripe` (Vercel deployment URL)
   - Should end with `/api/webhooks/stripe`

**If URL is wrong:**
- Click "Update" or "Edit"
- Change to correct URL
- Save

### Step 2: Verify Required Events

1. **Still on the webhook details page**
2. **Look for "Events" or "Events to send"** section
3. **Check that these events are selected:**
   - ✅ `checkout.session.completed` (MOST IMPORTANT - must be there!)
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

**If `checkout.session.completed` is missing:**
- Click "Update" or "Edit"
- Add the missing event
- Save

### Step 3: Check Webhook Status

1. **Look for "Status" or "State"** on the webhook page
2. **Should say "Enabled" or "Active"**
3. **If it says "Disabled", enable it**

### Step 4: Get the Webhook Secret

1. **On the webhook details page**, scroll down
2. **Find "Signing secret"** section
3. **Click "Reveal"** button
4. **Copy the secret** - it looks like: `whsec_xxxxxxxxxxxxx`
5. **Keep this handy** - you'll need it for Step 5

### Step 5: Verify Secret in Vercel

1. **Go to Vercel Dashboard**
   - https://vercel.com/george-pierces-projects/ntca/settings/environment-variables

2. **Look for `STRIPE_WEBHOOK_SECRET`** in the list

3. **If it exists:**
   - Click "Edit" (pencil icon)
   - Compare the value with the secret from Step 4
   - They should match exactly
   - If different, update it

4. **If it doesn't exist:**
   - Click "Add New"
   - Key: `STRIPE_WEBHOOK_SECRET`
   - Value: Paste the secret from Step 4
   - Environments: Select all (Production, Preview, Development)
   - Click "Save"

### Step 6: Check Recent Webhook Activity

1. **Back in Stripe**, on the webhook details page
2. **Scroll to "Webhook attempts"** or "Recent events"
3. **Check for recent activity:**
   - If you've had school registrations, you should see attempts
   - Status should be **200** (success) not **500** (error)
   - Click on an attempt to see details

### Step 7: Test the Webhook

1. **In Stripe webhook details page**
2. **Look for "Send test webhook"** or "Test webhook" button
3. **Click it**
4. **Select event**: `checkout.session.completed`
5. **Click "Send test webhook"**
6. **Check response**: Should show **200 OK**

### Step 8: Verify Database Connection

After testing, verify the webhook can connect to your database:

1. **Check Vercel Function Logs:**
   - Go to Vercel Dashboard → Your Project → Functions
   - Look for `/api/webhooks/stripe` function
   - Check for any errors

2. **Or use the test endpoint:**
   - Visit: `https://your-vercel-url.vercel.app/api/test-db-connection`
   - Should show database connection info

### Step 9: Check Test vs Live Mode

1. **In Stripe Dashboard**, look at the toggle in top right
2. **If you're in "Test" mode:**
   - The webhook you found is for testing
   - You may also need one for "Live" mode (production)
   - Toggle to "Live" and check if a webhook exists there too

3. **If you're in "Live" mode:**
   - The webhook is for production
   - Make sure it's configured correctly

## 🎯 Quick Verification Summary

After completing all steps, you should have:

- ✅ Webhook URL pointing to your Vercel domain
- ✅ `checkout.session.completed` event selected
- ✅ Webhook enabled/active
- ✅ Webhook secret copied
- ✅ `STRIPE_WEBHOOK_SECRET` set in Vercel (matching Stripe)
- ✅ Test webhook returns 200 OK
- ✅ Application redeployed (if you updated the secret)

## ⚠️ Common Issues to Watch For

1. **URL mismatch**: Webhook URL doesn't match your Vercel domain
2. **Missing event**: `checkout.session.completed` not selected
3. **Secret mismatch**: Vercel secret doesn't match Stripe secret
4. **Not redeployed**: Updated secret but didn't redeploy
5. **Wrong mode**: Webhook in Test mode but using Live payments (or vice versa)

## 📝 After Verification

Once everything is verified:
1. Try a test school registration
2. Complete the Stripe checkout
3. Check if the user appears in the database
4. Monitor webhook attempts in Stripe

