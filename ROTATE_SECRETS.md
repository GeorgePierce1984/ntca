# 🔐 Secret Rotation Guide

## ⚠️ URGENT: Rotate These Exposed Secrets

The following secrets were exposed in Git history and must be rotated immediately:

### 1. Database Passwords (Neon PostgreSQL)

**Exposed passwords:**
- `REDACTED` (current production database)
- `REDACTED` (old database)

**Steps to rotate:**

1. **Log into Neon Console**: https://console.neon.tech
2. **Select your project** (ep-winter-sound-abyxdvv7 or ep-purple-union-ab9djram)
3. **Go to Settings → Connection Details**
4. **Click "Reset Password"** for the database user
5. **Copy the new connection string**
6. **Update Vercel environment variables:**
   ```bash
   vercel env update DATABASE_URL production
   # Paste the new connection string when prompted
   ```
7. **Redeploy** your application

### 2. Resend API Key

**Exposed key:** `REDACTED`

**Steps to rotate:**

1. **Log into Resend**: https://resend.com
2. **Go to API Keys** section
3. **Revoke the exposed key** (`REDACTED`)
4. **Create a new API key**
5. **Update Vercel environment variables:**
   ```bash
   vercel env update RESEND_API_KEY production
   # Paste the new API key when prompted
   ```
6. **Redeploy** your application

### 3. Verify Rotation

After rotating, verify everything works:
- Database connections are working
- Email sending is working
- Application is functioning normally

## Clean Git History

After rotating secrets, clean Git history to remove exposed secrets:

### Option 1: Using git-filter-repo (Recommended)

```bash
# Install git-filter-repo
pip install git-filter-repo

# Remove database passwords from history
git-filter-repo --replace-text <(echo 'postgresql://neondb_owner:REDACTED@==>postgresql://neondb_owner:REDACTED@')
git-filter-repo --replace-text <(echo 'postgresql://neondb_owner:REDACTED@==>postgresql://neondb_owner:REDACTED@')

# Remove Resend API key from history
git-filter-repo --replace-text <(echo 'REDACTED==>REDACTED')

# Force push (⚠️ coordinate with team first!)
git push origin --force --all
```

### Option 2: Using BFG Repo-Cleaner

```bash
# Download BFG: https://rtyley.github.io/bfg-repo-cleaner/

# Create passwords file
echo 'postgresql://neondb_owner:REDACTED@' > passwords.txt
echo 'postgresql://neondb_owner:REDACTED@' >> passwords.txt
echo 'REDACTED' >> passwords.txt

# Clean repository
java -jar bfg.jar --replace-text passwords.txt

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (⚠️ coordinate with team first!)
git push origin --force --all
```

### ⚠️ Important Notes

- **Coordinate with your team** before force pushing
- **Backup your repository** before cleaning history
- **All team members** will need to re-clone after history rewrite
- **GitHub/GitGuardian** may still show alerts until history is cleaned

## Prevention

- ✅ Never commit secrets to Git
- ✅ Use environment variables only
- ✅ Add `.env` to `.gitignore` (already done)
- ✅ Review files before committing
- ✅ Use pre-commit hooks to scan for secrets

