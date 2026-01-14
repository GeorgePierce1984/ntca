# Delete User Account Instructions

## Account to Delete
**Email (example):** schoolowner@example.com

## Method 1: Using the API Endpoint (Recommended)

I've created an API endpoint that you can call to delete the account(s).

### Step 1: Check what will be deleted
```bash
curl -X POST https://ntca.vercel.app/api/admin/delete-user \
  -H "Content-Type: application/json" \
  -d '{"check": true}'
```

### Step 2: Delete the account(s)
```bash
curl -X POST https://ntca.vercel.app/api/admin/delete-user \
  -H "Content-Type: application/json" \
  -d '{"confirm": "DELETE_ALL_ACCOUNTS"}'
```

## Method 2: Using Node Script (Local)

If you have Node.js installed locally:

```bash
cd /Users/georgepierce/Desktop/Projects/ntca/ntca
node scripts/delete-user-by-email.js --confirm
```

## Method 3: Direct Database Query (Advanced)

If you have direct database access, you can run:

```sql
-- First, find the user(s)
SELECT id, email, "userType", "createdAt" 
FROM users 
WHERE email = 'schoolowner@example.com';

-- Then delete (cascade will handle related data)
DELETE FROM users 
WHERE email = 'schoolowner@example.com';
```

## What Gets Deleted

When you delete a user account, the following related data is automatically deleted (via database cascades):

- ✅ User account
- ✅ School profile (if school account)
- ✅ Teacher profile (if teacher account)
- ✅ All job postings (if school)
- ✅ All job applications (if teacher)
- ✅ All saved jobs (if teacher)
- ✅ All conversations and messages
- ✅ Activity logs

## Security Note

The API endpoint requires a confirmation string to prevent accidental deletions. Make sure you really want to delete the account before proceeding!

