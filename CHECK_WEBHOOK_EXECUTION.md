# Check Webhook Execution - Metadata is Correct

Since the debug endpoint shows:
- ✅ `hasFormData: true`
- ✅ `hasUserType: true`  
- ✅ `existingUser` is null (correct for new registration)
- ✅ `metadataIssues` is empty

**The metadata is correct!** The issue must be in webhook execution.

## 🔍 Step 1: Check if Webhook is Being Called

1. **Go to Stripe Dashboard**
   - https://dashboard.stripe.com/webhooks
   - Click on your webhook endpoint

2. **Check "Webhook attempts" or "Recent events"**
   - Look for recent `checkout.session.completed` events
   - **What to look for:**
     - ✅ **200 OK** = Webhook received successfully (but data might not be saving)
     - ❌ **500 Error** = Webhook failed (check error message)
     - ⚠️ **No attempts** = Webhook not being called at all

3. **Click on a recent attempt** to see:
   - Response status code
   - Response body (error messages)
   - Request details

## 🔍 Step 2: Check Vercel Function Logs

1. **Go to Vercel Dashboard**
   - https://vercel.com/george-pierces-projects/ntca
   - Click "Functions" tab
   - Find `/api/webhooks/stripe`

2. **Check recent invocations**
   - Look for the timestamp matching your registration
   - Click on an invocation to see logs

3. **Look for these messages:**
   - ✅ "Processing successful payment: cs_xxxxx"
   - ✅ "Session metadata: {...}"
   - ✅ "Processing registration for: email@example.com"
   - ✅ "Successfully created user from Stripe payment"
   - ❌ "Error handling successful payment"
   - ❌ "Missing metadata in session"
   - ❌ "Error parsing formData from metadata"
   - ❌ Database connection errors

## 🔍 Step 3: Check Database Connection in Webhook

The webhook handler uses Prisma. Let's verify it can connect:

1. **Check the test endpoint:**
   ```
   https://your-vercel-url.vercel.app/api/test-db-connection
   ```
   - Should show database connection successful
   - Should show recent schools/users

2. **If test endpoint works but webhook doesn't:**
   - Could be environment variable issue
   - Could be timing issue (webhook runs before database is ready)
   - Could be transaction issue

## 🔍 Step 4: Common Issues

### Issue A: Webhook Returns 200 but No Data Saved
**Symptoms:**
- Stripe shows 200 OK
- Vercel logs show "Processing successful payment"
- But no user/school in database

**Possible Causes:**
- Silent error in webhook handler (caught but not logged)
- Transaction rollback
- Database constraint violation
- Prisma disconnect happening too early

**Fix:**
- Check Vercel logs for any error messages
- Look for "Error handling successful payment" in logs
- Check if `prisma.$disconnect()` is being called too early

### Issue B: Webhook Not Being Called
**Symptoms:**
- No webhook attempts in Stripe
- No logs in Vercel

**Possible Causes:**
- Webhook URL incorrect
- Webhook disabled
- Event not selected
- Webhook secret mismatch (causing silent failure)

**Fix:**
- Verify webhook URL in Stripe matches Vercel domain
- Ensure `checkout.session.completed` is selected
- Check webhook is enabled

### Issue C: Database Connection Error
**Symptoms:**
- Vercel logs show database errors
- "Error handling successful payment" in logs

**Possible Causes:**
- `DATABASE_URL` incorrect in Vercel
- Database not accessible from Vercel
- Connection timeout

**Fix:**
- Verify `DATABASE_URL` in Vercel environment variables
- Check it points to the new Neon database
- Test with `/api/test-db-connection` endpoint

## 📋 Action Items

1. **Check Stripe webhook attempts** - Is the webhook being called?
2. **Check Vercel function logs** - Are there any errors?
3. **Share the findings** - What do you see in both places?

This will help identify the exact issue!

