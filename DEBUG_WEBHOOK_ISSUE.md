# Debug Webhook Issue - School Registration Not Saving

## 🔍 Step-by-Step Diagnosis

### Step 1: Check if Webhook is Being Called

1. **Go to Stripe Dashboard**
   - https://dashboard.stripe.com/webhooks
   - Click on your webhook endpoint
   - Scroll to "Webhook attempts" or "Recent events"
   - Look for recent `checkout.session.completed` events

2. **Check the Status:**
   - ✅ **200 OK** = Webhook received successfully
   - ❌ **500 Error** = Webhook failed (check error message)
   - ⚠️ **No attempts** = Webhook not being called

### Step 2: Get the Session ID

After a school registration attempt:

1. **From Stripe Dashboard:**
   - Go to Payments → Checkout sessions
   - Find the most recent session
   - Copy the Session ID (starts with `cs_test_` or `cs_live_`)

2. **Or from the URL:**
   - After checkout, you're redirected to: `/schools/dashboard?session_id=cs_test_xxxxx`
   - Copy the `session_id` parameter

### Step 3: Debug the Session

1. **Visit the debug endpoint:**
   ```
   https://your-vercel-url.vercel.app/api/webhook-debug?sessionId=cs_test_xxxxx
   ```
   (Replace `cs_test_xxxxx` with your actual session ID)

2. **Check the response for:**
   - ✅ Does `session.metadata.formData` exist?
   - ✅ Does `session.metadata.userType` exist?
   - ✅ Is `formDataParsed.email` present?
   - ✅ Is `formDataParsed.password` present?
   - ✅ Does `existingUser` show null? (should be null for new registrations)
   - ❌ Check `metadataIssues` array for problems

### Step 4: Check Vercel Function Logs

1. **Go to Vercel Dashboard**
   - https://vercel.com/george-pierces-projects/ntca
   - Click "Functions" tab
   - Find `/api/webhooks/stripe`
   - Check recent invocations

2. **Look for errors:**
   - "Webhook signature verification failed"
   - "Missing metadata in session"
   - "Error parsing formData from metadata"
   - "Error handling successful payment"
   - Database connection errors

### Step 5: Common Issues & Fixes

#### Issue 1: Missing Metadata
**Symptoms:**
- `metadataIssues` shows "Missing formData in metadata"
- `hasFormData: false` in debug response

**Fix:**
- Check `api/create-checkout-session.js`
- Ensure `formData` is being passed in the request body
- Verify it's being stringified: `formData: JSON.stringify(formData)`

#### Issue 2: Webhook Not Being Called
**Symptoms:**
- No webhook attempts in Stripe
- No logs in Vercel

**Fix:**
- Verify webhook URL in Stripe matches your Vercel domain
- Check webhook is enabled
- Ensure `checkout.session.completed` event is selected

#### Issue 3: Database Connection Error
**Symptoms:**
- Vercel logs show database connection errors
- `test-db-connection` endpoint fails

**Fix:**
- Verify `DATABASE_URL` in Vercel environment variables
- Check it points to the new Neon database
- Redeploy after updating

#### Issue 4: User Already Exists
**Symptoms:**
- `existingUser` is not null in debug response
- Webhook logs "User already exists"

**Fix:**
- This is expected if email already registered
- Check if school profile was created: `existingSchool` should exist

#### Issue 5: Webhook Secret Mismatch
**Symptoms:**
- "Webhook signature verification failed" in logs
- 400 errors in Stripe webhook attempts

**Fix:**
- Verify `STRIPE_WEBHOOK_SECRET` in Vercel matches Stripe
- Get fresh secret from Stripe webhook details
- Redeploy after updating

### Step 6: Test Manually

1. **Create a test checkout session:**
   ```bash
   # Use Stripe CLI or dashboard
   # Make sure to include metadata with formData
   ```

2. **Trigger webhook manually:**
   - In Stripe Dashboard → Webhooks
   - Click "Send test webhook"
   - Select `checkout.session.completed`
   - Use a real session ID from a recent registration

3. **Check the result:**
   - Should return 200 OK
   - Check Vercel logs for processing
   - Verify user/school created in database

## 📋 Quick Checklist

- [ ] Webhook exists in Stripe Dashboard
- [ ] Webhook URL is correct (points to Vercel)
- [ ] `checkout.session.completed` event is selected
- [ ] `STRIPE_WEBHOOK_SECRET` is set in Vercel
- [ ] `DATABASE_URL` is set in Vercel (new database)
- [ ] Application has been redeployed after adding secrets
- [ ] Recent webhook attempts show in Stripe
- [ ] Debug endpoint shows metadata is present
- [ ] Vercel function logs show no errors

## 🚨 If Still Not Working

1. **Share the debug response:**
   - Visit `/api/webhook-debug?sessionId=YOUR_SESSION_ID`
   - Copy the JSON response
   - Share it for analysis

2. **Check Vercel logs:**
   - Copy recent error logs from Vercel Functions
   - Share for analysis

3. **Verify test registration:**
   - Try a new school registration with a unique email
   - Complete the Stripe checkout
   - Immediately check the debug endpoint with that session ID

