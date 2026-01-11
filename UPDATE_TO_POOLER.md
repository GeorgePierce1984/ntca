# Update DATABASE_URL to Use Neon Connection Pooler

## Why Use Connection Pooler?

- ✅ **Faster connections** - Pre-established pooled connections
- ✅ **Reduces cold start errors** - Better for serverless (Vercel)
- ✅ **Handles high concurrency** - Manages many simultaneous connections
- ✅ **Fewer "Response from Engine was empty" errors**

## How to Update

### Step 1: Get Pooler Connection String from Neon

1. Go to [Neon Console](https://console.neon.tech)
2. Select your project
3. Go to **Dashboard** or **Connection Details**
4. Look for **Connection pooling** section
5. Copy the **Pooled connection** string (not the direct connection)
6. It should look like:
   ```
   postgresql://user:pass@ep-xxx-pooler.eu-west-2.aws.neon.tech/db?sslmode=require
   ```
   Note the `-pooler` in the hostname!

### Step 2: Update in Vercel

#### Option A: Vercel Dashboard (Recommended)

1. Go to: https://vercel.com/george-pierces-projects/ntca/settings/environment-variables
2. Find `DATABASE_URL` in Production
3. Click **Edit**
4. Paste the **pooler connection string** from Step 1
5. Make sure it's selected for: Production, Preview, Development
6. Click **Save**

#### Option B: Vercel CLI

```bash
cd /Users/georgepierce/Desktop/Projects/ntca/ntca

# Update Production
vercel env update DATABASE_URL production
# Paste the pooler connection string when prompted
# Type 'y' to confirm

# Update Preview (optional, same value)
vercel env update DATABASE_URL preview
# Paste the same pooler connection string
# Type 'y' to confirm

# Update Development (optional, same value)
vercel env update DATABASE_URL development
# Paste the same pooler connection string
# Type 'y' to confirm
```

### Step 3: Verify Update

```bash
vercel env ls | grep DATABASE_URL
```

Should show recent timestamp (just now instead of "177d ago").

### Step 4: Redeploy

```bash
vercel --prod
```

Or push a commit to trigger automatic deployment.

## Connection String Format

**Direct connection (NO pooler):**
```
postgresql://user:pass@ep-xxx.eu-west-2.aws.neon.tech/db?sslmode=require
```

**Pooled connection (WITH pooler):**
```
postgresql://user:pass@ep-xxx-pooler.eu-west-2.aws.neon.tech/db?sslmode=require
                                                  ^^^^^^^^
                                                  Notice this!
```

## What to Check

- ✅ Connection string has `-pooler` in the hostname
- ✅ `sslmode=require` is included
- ✅ Updated in all environments (Production, Preview, Development)
- ✅ Timestamp shows "just now" or recent time
- ✅ Redeploy after updating

## Expected Benefits

After updating, you should see:
- ✅ Fewer "Response from Engine was empty" errors
- ✅ Faster initial connections (less cold start impact)
- ✅ Better handling of concurrent requests
- ✅ More reliable database connections

