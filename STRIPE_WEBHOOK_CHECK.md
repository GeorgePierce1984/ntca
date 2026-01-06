# Quick Stripe Webhook Check Guide

## 🎯 Quick Steps to Verify Stripe Webhook

### 1. Go to Stripe Dashboard
**Link**: https://dashboard.stripe.com/webhooks

### 2. Check if Webhook Exists
Look for a webhook endpoint with URL containing:
- `/api/webhooks/stripe`
- Your Vercel domain (ntca.vercel.app or similar)

### 3. If Webhook Exists - Check These:
- ✅ **Status**: Should be "Enabled"
- ✅ **Events**: Must include `checkout.session.completed`
- ✅ **Recent attempts**: Check if there are any recent webhook calls
- ✅ **Success rate**: Should show 200 OK responses

### 4. If Webhook Does NOT Exist - Create It:

**Endpoint URL**: 
```
https://ntca.vercel.app/api/webhooks/stripe
```
(Or your actual Vercel production URL)

**Required Events** (select these):
- ✅ `checkout.session.completed` (MOST IMPORTANT)
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

### 5. Get the Webhook Secret
1. Click on your webhook endpoint
2. Find "Signing secret" section
3. Click "Reveal"
4. Copy the secret (starts with `whsec_`)

### 6. Add Secret to Vercel
1. Go to: https://vercel.com/george-pierces-projects/ntca/settings/environment-variables
2. Find or add: `STRIPE_WEBHOOK_SECRET`
3. Paste the secret from Step 5
4. Select all environments (Production, Preview, Development)
5. Save

### 7. Redeploy
After adding/updating the secret, redeploy:
- Go to Deployments → Latest → Redeploy

## 🔍 What to Look For

### In Stripe Dashboard:
- **Webhook attempts**: Should show recent activity if registrations happened
- **Status codes**: Should be 200 (success) not 500 (error)
- **Response time**: Should be reasonable (< 2 seconds)

### In Vercel:
- **STRIPE_WEBHOOK_SECRET**: Should be set
- **Function logs**: Check `/api/webhooks/stripe` for errors

## ⚠️ Common Issues

1. **No webhook endpoint** → Create one (Step 4)
2. **Wrong URL** → Update to match your Vercel domain
3. **Missing events** → Add `checkout.session.completed`
4. **Secret not set** → Add `STRIPE_WEBHOOK_SECRET` to Vercel
5. **Webhook failing** → Check Vercel logs for errors

## 📞 Need Help?

If you find issues, check:
1. Stripe webhook attempt details (click on failed attempts)
2. Vercel function logs for `/api/webhooks/stripe`
3. Database connection (DATABASE_URL)

