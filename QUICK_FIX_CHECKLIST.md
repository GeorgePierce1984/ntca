# Quick Fix Checklist - School Registration Not Saving

## 🎯 Immediate Actions

### 1. Deploy the Debug Endpoint
The debug endpoint needs to be deployed to Vercel:
- File: `api/webhook-debug.js`
- After deployment, you can use it to diagnose issues

### 2. Check These 3 Things First

#### A. Verify Webhook is Being Called
1. Go to Stripe Dashboard → Webhooks
2. Click on your webhook
3. Check "Webhook attempts" for recent `checkout.session.completed` events
4. **What to look for:**
   - ✅ **200 OK** = Webhook received (but data might not be saving)
   - ❌ **500 Error** = Webhook failed (check error message)
   - ⚠️ **No attempts** = Webhook not being called

#### B. Check Vercel Function Logs
1. Go to Vercel Dashboard → Your Project → Functions
2. Find `/api/webhooks/stripe`
3. Check recent invocations
4. **Look for:**
   - "Processing successful payment"
   - "Missing metadata in session"
   - "Error parsing formData"
   - "Error handling successful payment"
   - Database connection errors

#### C. Test with Debug Endpoint
1. Get a Session ID from a recent registration:
   - Check URL after checkout: `?session_id=cs_test_xxxxx`
   - Or Stripe Dashboard → Payments → Checkout sessions
2. Visit: `https://your-vercel-url.vercel.app/api/webhook-debug?sessionId=cs_test_xxxxx`
3. **Check the response:**
   - `hasFormData: true` ✅
   - `hasUserType: true` ✅
   - `formDataParsed.email` exists ✅
   - `formDataParsed.password` exists ✅
   - `metadataIssues` array is empty ✅

## 🔧 Common Issues & Quick Fixes

### Issue 1: Webhook Not Being Called
**Check:**
- Webhook URL in Stripe matches your Vercel domain
- `checkout.session.completed` event is selected
- Webhook is enabled (not disabled)

**Fix:**
- Update webhook URL if wrong
- Add missing event
- Enable webhook

### Issue 2: Missing Metadata
**Symptoms:**
- Debug endpoint shows `hasFormData: false`
- `metadataIssues` shows "Missing formData in metadata"

**Possible Causes:**
- Form data not being sent correctly
- Checkout session created without metadata

**Fix:**
- Check browser console for errors when submitting form
- Verify `api/create-checkout-session.js` is receiving `formData`
- Check Vercel function logs for checkout session creation

### Issue 3: Database Connection Error
**Symptoms:**
- Vercel logs show database errors
- `test-db-connection` endpoint fails

**Fix:**
- Verify `DATABASE_URL` in Vercel points to new database
- Check database is accessible
- Redeploy after updating

### Issue 4: User Already Exists
**Symptoms:**
- Debug shows `existingUser` is not null
- Webhook logs "User already exists"

**This is OK if:**
- `existingSchool` also exists
- School profile was created

**If school profile missing:**
- Webhook might have failed partway through
- Check for partial data in database

### Issue 5: Silent Errors in Webhook
**Symptoms:**
- Webhook returns 200 OK
- But no data saved

**Check:**
- Vercel function logs for errors
- Webhook handler catches errors but doesn't throw them
- Look for "Error handling successful payment" in logs

## 📋 Diagnostic Steps

1. **Try a new registration:**
   - Use a unique email address
   - Complete the Stripe checkout
   - Note the session ID from URL

2. **Immediately check:**
   - Stripe webhook attempts (should show 200 OK)
   - Vercel function logs (should show processing)
   - Debug endpoint with session ID

3. **Check database:**
   - Query for the email address
   - Check if User record exists
   - Check if School record exists

4. **If nothing exists:**
   - Check debug endpoint `metadataIssues`
   - Check Vercel logs for errors
   - Verify webhook secret is correct

## 🚨 Most Likely Issues

Based on the code, the most likely issues are:

1. **Metadata not being passed correctly** - Check debug endpoint
2. **Webhook not being called** - Check Stripe webhook attempts
3. **Database connection failing** - Check Vercel logs
4. **Silent error in webhook handler** - Check Vercel function logs

## 📞 Next Steps

After checking the above:

1. **Share the debug endpoint response** for a recent session
2. **Share Vercel function logs** for the webhook
3. **Share Stripe webhook attempt details** (status and response)

This will help identify the exact issue.

