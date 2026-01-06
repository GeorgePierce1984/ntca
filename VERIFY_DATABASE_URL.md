# Verify DATABASE_URL in Vercel

## Your Connection String

```
postgresql://neondb_owner:YOUR_PASSWORD@ep-winter-sound-abyxdvv7-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

✅ **Good:** Uses pooler connection (`-pooler` in hostname)

## Steps to Verify in Vercel

1. **Go to Vercel Dashboard**
   - https://vercel.com/george-pierces-projects/ntca/settings/environment-variables

2. **Find `DATABASE_URL`**
   - Look for the environment variable
   - Check all environments (Production, Preview, Development)

3. **Verify it matches your connection string**
   - Should be exactly the same
   - Should have `-pooler` in the hostname
   - Should have `sslmode=require`

4. **If it's different:**
   - Click "Edit" (pencil icon)
   - Paste your connection string
   - Save
   - **Redeploy** the application

## Alternative Connection String (if issues persist)

If you're still getting connection errors, try removing `channel_binding=require`:

```
postgresql://neondb_owner:YOUR_PASSWORD@ep-winter-sound-abyxdvv7-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

Some serverless environments don't support channel binding.

## After Updating

1. **Redeploy** the application
2. **Try a new school registration**
3. **Check Vercel logs** for connection errors

## Quick Test

You can test the connection using the test endpoint:
```
https://your-vercel-url.vercel.app/api/test-db-connection
```

This will show:
- Database connection status
- Current DATABASE_URL (first 40 chars)
- Recent schools/users

