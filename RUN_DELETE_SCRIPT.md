# How to Run the Delete Account Script

## Quick Run (Easiest)

```bash
cd /Users/georgepierce/Desktop/Projects/ntca/ntca
npx tsx delete-george-account.js
```

## Alternative Methods

### Method 1: Using npx tsx (Recommended)
```bash
npx tsx delete-george-account.js
```

### Method 2: Using Node directly (if installed)
```bash
node delete-george-account.js
```

### Method 3: Add to package.json and run
Add this to your `package.json` scripts:
```json
"delete-george": "tsx delete-george-account.js"
```

Then run:
```bash
npm run delete-george
```

## What It Does

This script will:
1. Find all accounts with a target email (for example: `schoolowner@example.com`)
2. Show you what will be deleted
3. Delete the account(s) and ALL related data:
   - User account
   - School/Teacher profile
   - All job postings
   - All applications
   - All saved jobs
   - All conversations and messages
   - All activity logs

## Requirements

- Make sure you have the DATABASE_URL environment variable set
- The script uses Prisma, so it will connect to your database

## Safety

- The script will show you what it finds before deleting
- It uses database transactions to ensure data integrity
- All deletions are permanent and cannot be undone

