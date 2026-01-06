# Fix DATABASE_URL Error

## The Error

```
Error validating datasource `db`: the URL must start with the protocol `postgresql://` or `postgres://`
```

This means `DATABASE_URL` in Vercel is either:
- ❌ Not set
- ❌ Empty
- ❌ Malformed (doesn't start with `postgresql://`)
- ❌ Has encoding/formatting issues

## Your Correct Connection String

```
postgresql://neondb_owner:REDACTED@ep-winter-sound-abyxdvv7-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

## Step-by-Step Fix

### 1. Go to Vercel Environment Variables

Visit: https://vercel.com/george-pierces-projects/ntca/settings/environment-variables

### 2. Check if DATABASE_URL Exists

- Look for `DATABASE_URL` in the list
- Check all environments (Production, Preview, Development)

### 3. If DATABASE_URL Doesn't Exist

1. Click **"Add New"** button
2. Enter:
   - **Key**: `DATABASE_URL`
   - **Value**: Paste your connection string:
     ```
     postgresql://neondb_owner:REDACTED@ep-winter-sound-abyxdvv7-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
     ```
   - **Environments**: Select ALL three:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
3. Click **"Save"**

### 4. If DATABASE_URL Exists

1. Click **"Edit"** (pencil icon) next to `DATABASE_URL`
2. **Delete** the current value
3. **Paste** your connection string:
   ```
   postgresql://neondb_owner:REDACTED@ep-winter-sound-abyxdvv7-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
   ```
4. **Verify** it starts with `postgresql://`
5. **No quotes** around it
6. **No extra spaces** before or after
7. Click **"Save"**

### 5. Redeploy

After updating, you MUST redeploy:

1. Go to **Deployments** tab
2. Click the **three dots (⋯)** on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

## Important Notes

- ⚠️ **No quotes**: Don't wrap the connection string in quotes
- ⚠️ **No spaces**: No leading or trailing spaces
- ⚠️ **Exact match**: Should start with `postgresql://`
- ⚠️ **All environments**: Make sure it's set for Production, Preview, AND Development

## Verify It's Working

After redeploying, test the connection:

1. Visit: `https://your-vercel-url.vercel.app/api/test-db-connection`
2. Should show: `"message": "Database connection successful"`
3. Should show your database version
4. Should show recent schools/users

## Alternative: Use Vercel CLI

If you prefer command line:

```bash
cd /Users/georgepierce/Desktop/Projects/ntca/ntca
export PATH="$PWD/node-v20.11.0-darwin-x64/bin:$PATH"

# Add/update DATABASE_URL
vercel env add DATABASE_URL production
# When prompted, paste: postgresql://neondb_owner:REDACTED@ep-winter-sound-abyxdvv7-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require

# Repeat for other environments
vercel env add DATABASE_URL preview
vercel env add DATABASE_URL development

# Redeploy
vercel --prod --yes
```

