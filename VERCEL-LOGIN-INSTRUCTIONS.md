# Vercel CLI Authentication - Step by Step

## Current Status
✅ Vercel CLI is installed (v48.6.0)
✅ Ready to authenticate

## Authentication Method 1: Browser Login (Recommended)

The CLI is currently waiting for authentication. Here's what to do:

### Step 1: Open the Browser
Visit this URL in your web browser:
```
https://vercel.com/oauth/device?user_code=DZKP-KTKZ
```

### Step 2: Sign In
- If you have a Vercel account: Sign in
- If you don't have an account: Create one (free) at https://vercel.com

### Step 3: Enter the Code
When prompted, enter this code:
```
DZKP-KTKZ
```

### Step 4: Authorize
Click "Authorize" to allow Vercel CLI to access your account

### Step 5: Done!
The terminal will show "Success!" when authentication completes.

---

## Authentication Method 2: Token Login (Alternative)

If browser login doesn't work, use a token:

### Step 1: Get Your Token
1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Name it (e.g., "CLI Access")
4. Copy the token

### Step 2: Login with Token
Run in your terminal:
```bash
cd /Users/georgepierce/Desktop/Projects/ntca/ntca
source setup-local-env.sh
vercel login YOUR_TOKEN_HERE
```

---

## After Authentication

Once authenticated, you can:

```bash
# Check login status
vercel whoami

# Deploy to production
vercel --prod

# See your projects
vercel ls
```

---

## Next Steps After Authentication

1. **Deploy your changes:**
   ```bash
   vercel --prod
   ```

2. **This will deploy your footer changes (© 2025 NTCA)**

3. **Get your live URL** from the deployment output

---

## Troubleshooting

**Problem**: Authentication code expired
**Solution**: Run `vercel login` again to get a new code

**Problem**: Can't access the browser
**Solution**: Use token method instead (see Method 2 above)

**Problem**: Already authenticated?
**Solution**: Run `vercel whoami` to check your status

---

## Summary

Current code: **DZKP-KTKZ**
URL: **https://vercel.com/oauth/device?user_code=DZKP-KTKZ**

Just open the URL in your browser and follow the prompts!


