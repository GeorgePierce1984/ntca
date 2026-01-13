# Recover/Replace Resend API Key

## Problem:
You created a Resend API key before, but forgot it. Resend only shows keys once for security, so you can't see it again.

## Solution:
Create a NEW API key and replace the old one.

## Steps:

### 1. Login to Resend
- Go to https://resend.com/login
- Login with your account (or reset password if needed)

### 2. Create a New API Key
- Go to **API Keys** in the dashboard
- Click **Create API Key** button
- Give it a name (e.g., "NTCA Production" or "Vercel Production")
- Copy the key immediately (it starts with `re_` and you'll only see it once!)
- **IMPORTANT:** Save it somewhere safe before closing the page

### 3. (Optional) Delete Old Key
- If you see the old key listed, you can delete it for security
- Click the trash icon next to the old key
- This is optional - having multiple keys is fine

### 4. Add New Key to Vercel

**Option A: Via Vercel Dashboard (Easiest)**
1. Go to https://vercel.com/dashboard
2. Select your `ntca` project
3. Go to **Settings** → **Environment Variables**
4. Find `RESEND_API_KEY` in the list
5. Click the **Edit** (pencil icon) or **Delete** and recreate
6. Paste your NEW API key
7. Make sure all environments are selected (Production, Preview, Development)
8. Click **Save**

**Option B: Via Command Line**
```bash
cd /Users/georgepierce/Desktop/Projects/ntca/ntca

# Update the existing key (will prompt for new value)
vercel env rm RESEND_API_KEY production
vercel env add RESEND_API_KEY production

vercel env rm RESEND_API_KEY preview  
vercel env add RESEND_API_KEY preview

vercel env rm RESEND_API_KEY development
vercel env add RESEND_API_KEY development

# Verify it was updated
vercel env ls | grep RESEND_API_KEY
```

### 5. Redeploy
- Go to Vercel Dashboard → **Deployments**
- Click the three dots (⋯) on latest deployment
- Click **Redeploy**

## Test It:
After redeploying, try the email verification step again. Emails should now send successfully!

## Security Tip:
- Store your API key in a password manager for future reference
- You can create multiple keys for different purposes (dev, staging, production)
- Each key can be named and revoked independently

