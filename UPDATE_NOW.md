# Quick Update: DATABASE_URL and Redeploy

## Current Status
❌ **NOT COMPLETED** - The automated update was interrupted.

## Quick Manual Update (2 minutes)

### Step 1: Update DATABASE_URL via Vercel Dashboard

1. **Open this link**: https://vercel.com/george-pierces-projects/ntca/settings/environment-variables

2. **Find `DATABASE_URL`** in the list

3. **Click the Edit button** (pencil icon) next to it

4. **Replace the value with**:
   ```
   postgresql://neondb_owner:REDACTED@ep-winter-sound-abyxdvv7-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
   ```

5. **Make sure all environments are checked**:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development

6. **Click Save**

### Step 2: Redeploy

1. **Go to Deployments**: https://vercel.com/george-pierces-projects/ntca/deployments

2. **Click the three dots (⋯)** on the latest deployment

3. **Select "Redeploy"**

4. **Confirm the redeploy**

## Alternative: Use Terminal Commands

If you prefer the terminal, run these commands one at a time:

```bash
cd /Users/georgepierce/Desktop/Projects/ntca/ntca
source setup-local-env.sh

# Update Production (you'll need to type 'y' and paste the connection string)
vercel env update DATABASE_URL production

# Update Preview
vercel env update DATABASE_URL preview

# Update Development  
vercel env update DATABASE_URL development

# Redeploy
vercel --prod
```

**When prompted**, you'll need to:
1. Type `y` and press Enter
2. Paste: `postgresql://neondb_owner:REDACTED@ep-winter-sound-abyxdvv7-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require`
3. Press Enter

## New Database Connection String

```
postgresql://neondb_owner:REDACTED@ep-winter-sound-abyxdvv7-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

## Verification

After updating, verify with:
```bash
vercel env ls | grep DATABASE_URL
```

The timestamp should show it was just updated.

