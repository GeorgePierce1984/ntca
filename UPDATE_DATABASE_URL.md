# Update DATABASE_URL to New Neon Database

## New Database Connection String

```
postgresql://neondb_owner:YOUR_PASSWORD@ep-winter-sound-abyxdvv7-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

## Update Vercel Environment Variables

### Option 1: Via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/george-pierces-projects/ntca/settings/environment-variables

2. **Find DATABASE_URL**
   - Scroll to find `DATABASE_URL` in the list
   - Click the **Edit** button (pencil icon)

3. **Update the Value**
   - Replace the existing connection string with:
     ```
     postgresql://neondb_owner:YOUR_PASSWORD@ep-winter-sound-abyxdvv7-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
     ```

4. **Select Environments**
   - Make sure all environments are selected:
     - ✅ Production
     - ✅ Preview
     - ✅ Development

5. **Save**
   - Click **Save**

6. **Redeploy**
   - Go to **Deployments** tab
   - Click the three dots (⋯) on the latest deployment
   - Select **Redeploy**

### Option 2: Via Vercel CLI

Run these commands in your terminal:

```bash
cd /Users/georgepierce/Desktop/Projects/ntca/ntca
source setup-local-env.sh

# Update Production
vercel env update DATABASE_URL production
# When prompted:
#   1. Type: y
#   2. Paste: postgresql://neondb_owner:YOUR_PASSWORD@ep-winter-sound-abyxdvv7-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
#   3. Press Enter

# Update Preview
vercel env update DATABASE_URL preview
# (Same prompts as above)

# Update Development
vercel env update DATABASE_URL development
# (Same prompts as above)

# Redeploy
vercel --prod
```

## Verify Update

After updating, verify the change:

```bash
vercel env ls | grep DATABASE_URL
```

You should see the updated variable listed.

## Database Status

✅ **Database Copy Completed Successfully**

- **Source**: `ep-purple-union-ab9djram-pooler.eu-west-2.aws.neon.tech`
- **Destination**: `ep-winter-sound-abyxdvv7-pooler.eu-west-2.aws.neon.tech`
- **Tables**: 10 tables copied
- **Total Rows**: 242 rows copied

### Tables Copied:
- `_prisma_migrations`: 5 rows
- `activity_logs`: 192 rows
- `application_notes`: 0 rows
- `applications`: 3 rows
- `job_alerts`: 0 rows
- `jobs`: 10 rows
- `saved_jobs`: 0 rows
- `schools`: 8 rows
- `teachers`: 8 rows
- `users`: 16 rows

## Important Notes

1. **After updating DATABASE_URL**, you must **redeploy** your application for the changes to take effect.

2. **All environments** (Production, Preview, Development) should be updated to use the new database.

3. **The old database** (`ep-purple-union-ab9djram-pooler`) is still accessible but should be considered deprecated.

4. **Test the application** after redeployment to ensure everything works correctly with the new database.

## Troubleshooting

If you encounter issues:

1. **Check Vercel Logs**: Go to your deployment → Logs tab
2. **Verify Connection**: Test the connection string directly
3. **Check Environment Variables**: Ensure DATABASE_URL is set for all environments
4. **Redeploy**: Sometimes a fresh deployment is needed

