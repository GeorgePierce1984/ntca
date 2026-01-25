# How to Add Resend API Key to Vercel

## Quick Steps:

1. **Get your Resend API Key:**
   - Go to https://resend.com
   - Login (or create account if needed)
   - Navigate to **API Keys** in the dashboard
   - Click **Create API Key** (or copy existing one)
   - Copy the key (starts with `re_`)

2. **Add to Vercel via Dashboard:**
   - Go to https://vercel.com/dashboard
   - Select your `ntca` project
   - Click **Settings** → **Environment Variables**
   - Click **Add New**
   - Name: `RESEND_API_KEY`
   - Value: Paste your Resend API key (starts with `re_`)
   - Select all environments: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**

3. **Redeploy:**
   - Go to **Deployments** tab
   - Click the three dots (⋯) on the latest deployment
   - Click **Redeploy**

## Or via Command Line:

```bash
# Make sure you're in the project directory
cd /Users/georgepierce/Desktop/Projects/ntca/ntca

# Add the API key (it will prompt you to paste it)
vercel env add RESEND_API_KEY production
vercel env add RESEND_API_KEY preview
vercel env add RESEND_API_KEY development

# Verify it was added
vercel env ls | grep RESEND_API_KEY
```

## Test It:

After redeploying, try the email verification step again. The code should now be sent via email instead of showing an error.


