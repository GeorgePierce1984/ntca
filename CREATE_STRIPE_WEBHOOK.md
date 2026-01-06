# Create Stripe Webhook - Step by Step

## 🎯 Step-by-Step Instructions

### Step 1: Get Your Production URL

Your webhook endpoint will be:
```
https://ntca.vercel.app/api/webhooks/stripe
```

(If you have a custom domain, use that instead. Otherwise, use your Vercel deployment URL)

### Step 2: Open Stripe Dashboard

1. **Go to Stripe Dashboard**
   - Visit: https://dashboard.stripe.com
   - Login to your Stripe account

2. **Check Your Mode**
   - Look at the toggle in the top right corner
   - Make sure you're in **Test mode** for testing, or **Live mode** for production
   - **Important**: You'll need separate webhooks for Test and Live modes

### Step 3: Navigate to Webhooks

1. **Click "Developers"** in the left sidebar
2. **Click "Webhooks"** (under Developers)
3. You should see a page that says "Add endpoint" or shows existing webhooks

### Step 4: Create New Webhook Endpoint

1. **Click "Add endpoint"** button (usually top right)

2. **Enter Endpoint URL:**
   ```
   https://ntca.vercel.app/api/webhooks/stripe
   ```
   (Replace with your actual Vercel domain if different)

3. **Enter Description** (optional but helpful):
   ```
   NTCA School Registration Webhook
   ```

4. **Select Events to Listen To:**
   
   **CRITICAL - Select these events:**
   
   ✅ **checkout.session.completed** (MOST IMPORTANT - creates user accounts)
   
   ✅ **customer.subscription.created**
   
   ✅ **customer.subscription.updated**
   
   ✅ **customer.subscription.deleted**
   
   ✅ **invoice.payment_succeeded**
   
   ✅ **invoice.payment_failed**
   
   ✅ **invoice.upcoming**
   
   ✅ **customer.subscription.trial_will_end**

5. **Click "Add endpoint"** button

### Step 5: Get Your Webhook Signing Secret

1. **After creating the endpoint**, you'll be taken to the webhook details page

2. **Find "Signing secret" section** (usually near the top)

3. **Click "Reveal"** button to show the secret

4. **Copy the secret** - it will look like:
   ```
   whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   ⚠️ **IMPORTANT**: Copy this immediately - you'll need it for Vercel

### Step 6: Add Secret to Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/george-pierces-projects/ntca/settings/environment-variables

2. **Click "Add New"** button

3. **Enter the following:**
   - **Key**: `STRIPE_WEBHOOK_SECRET`
   - **Value**: Paste the secret you copied from Stripe (whsec_...)
   - **Environments**: Select all three:
     - ✅ Production
     - ✅ Preview
     - ✅ Development

4. **Click "Save"**

### Step 7: Redeploy Application

After adding the webhook secret, you MUST redeploy:

1. **Go to Deployments tab** in Vercel
2. **Click the three dots (⋯)** on the latest deployment
3. **Click "Redeploy"**
4. **Wait for deployment to complete**

### Step 8: Test the Webhook

1. **In Stripe Dashboard**, go back to your webhook endpoint
2. **Click "Send test webhook"** button
3. **Select event**: `checkout.session.completed`
4. **Click "Send test webhook"**
5. **Check the response** - should show 200 OK

## ✅ Verification Checklist

After completing the steps above:

- [ ] Webhook endpoint created in Stripe
- [ ] Endpoint URL is correct
- [ ] `checkout.session.completed` event is selected
- [ ] Webhook signing secret copied
- [ ] `STRIPE_WEBHOOK_SECRET` added to Vercel
- [ ] All environments selected in Vercel
- [ ] Application redeployed
- [ ] Test webhook returns 200 OK

## 🔍 Troubleshooting

### If webhook test fails:
1. Check Vercel function logs for errors
2. Verify `STRIPE_WEBHOOK_SECRET` is correct
3. Make sure application was redeployed after adding secret

### If webhook URL is wrong:
1. Click on webhook endpoint in Stripe
2. Click "Update" or "Edit"
3. Change the URL
4. Save

### If events are missing:
1. Click on webhook endpoint in Stripe
2. Click "Update" or "Edit"
3. Add missing events (especially `checkout.session.completed`)
4. Save

## 📝 Important Notes

1. **Test vs Live Mode**: Create separate webhooks for Test and Live modes
2. **Webhook Secret**: Keep this secret secure - never share it publicly
3. **Redeploy Required**: Always redeploy after adding/updating environment variables
4. **Multiple Environments**: You may want separate webhooks for dev/staging/production

## 🎉 Once Complete

After setting up the webhook:
1. New school registrations will trigger the webhook
2. User accounts will be created automatically after payment
3. Check webhook attempts in Stripe to see activity
4. Check Vercel logs to monitor webhook processing

