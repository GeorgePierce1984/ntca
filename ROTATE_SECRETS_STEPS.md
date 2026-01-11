# 🔐 Step-by-Step Secret Rotation Guide

## ⚠️ URGENT: Follow these steps in order

---

## Step 1: Rotate Database Password (Neon PostgreSQL)

### Current Production Database
**Exposed password:** `npg_UOXosyWJ1RK7`  
**Database endpoint:** `ep-winter-sound-abyxdvv7-pooler.eu-west-2.aws.neon.tech`

### Steps:

1. **Go to Neon Console**
   - Visit: https://console.neon.tech
   - Log in with your account

2. **Select Your Project**
   - Find the project with endpoint: `ep-winter-sound-abyxdvv7`
   - Click on it

3. **Reset Database Password**
   - Click on the **"Branches"** tab (in the left sidebar or top navigation)
   - Select your branch (usually "main" or the default branch)
   - Click on the **"Roles & Databases"** tab
   - Find the role **"neondb_owner"** in the list
   - Click on the **options menu** (three dots "..." or menu icon) next to the role
   - Select **"Reset password"**
   - Confirm the action in the prompt
   - **A modal will show the new password - COPY IT IMMEDIATELY!** (you won't see it again!)
   - The new connection string will be displayed - **copy the full connection string**

4. **Update Vercel Environment Variable**
   ```bash
   cd /Users/georgepierce/Desktop/Projects/ntca/ntca
   vercel env update DATABASE_URL production
   ```
   - When prompted, paste the **new connection string**
   - Press Enter

5. **Update Other Environments (if needed)**
   ```bash
   vercel env update DATABASE_URL preview
   vercel env update DATABASE_URL development
   ```

6. **Verify the Update**
   ```bash
   vercel env ls | grep DATABASE_URL
   ```

---

## Step 2: Rotate Resend API Key

### Exposed Key
**API Key:** `re_CXEaVAhp_AMJ3WikyKVo1oQkw4rv4TMoJ`

### Steps:

1. **Go to Resend Dashboard**
   - Visit: https://resend.com
   - Log in with your account

2. **Navigate to API Keys**
   - Click on your account/profile icon
   - Go to **"API Keys"** or **"Settings" → "API Keys"**

3. **Revoke the Exposed Key**
   - Find the key: `re_CXEaVAhp_AMJ3WikyKVo1oQkw4rv4TMoJ`
   - Click **"Revoke"** or **"Delete"**
   - Confirm the deletion

4. **Create a New API Key**
   - Click **"Create API Key"** or **"Add API Key"**
   - Give it a name (e.g., "Production - Rotated 2026-01-06")
   - **Copy the new API key immediately** (you won't see it again!)

5. **Update Vercel Environment Variable**
   ```bash
   vercel env update RESEND_API_KEY production
   ```
   - When prompted, paste the **new API key**
   - Press Enter

6. **Update Other Environments (if needed)**
   ```bash
   vercel env update RESEND_API_KEY preview
   vercel env update RESEND_API_KEY development
   ```

7. **Verify the Update**
   ```bash
   vercel env ls | grep RESEND_API_KEY
   ```

---

## Step 3: Redeploy Application

After updating environment variables, redeploy to apply changes:

```bash
# Option 1: Trigger redeploy via Git
git commit --allow-empty -m "Trigger redeploy after secret rotation"
git push origin main

# Option 2: Redeploy via Vercel CLI
vercel --prod
```

---

## Step 4: Verify Everything Works

### Test Database Connection
1. Visit your application
2. Try logging in or accessing database-dependent features
3. Check Vercel logs for any database connection errors

### Test Email Functionality
1. Try registering a new user (if emails are sent on registration)
2. Or trigger a password reset email
3. Check Resend dashboard for email delivery status

### Check Vercel Logs
```bash
vercel logs --follow
```

---

## Step 5: Clean Git History (Optional but Recommended)

After rotating secrets, clean Git history to remove exposed secrets from old commits.

### ⚠️ WARNING: This rewrites Git history
- Coordinate with your team first
- All team members will need to re-clone the repository
- This is a destructive operation

### Using git-filter-repo (Recommended)

```bash
# Install git-filter-repo
pip3 install git-filter-repo

# Create replacement file
cat > /tmp/replacements.txt << 'EOF'
postgresql://neondb_owner:npg_UOXosyWJ1RK7@==>postgresql://neondb_owner:REDACTED@
postgresql://neondb_owner:npg_flMgBpruX3D6@==>postgresql://neondb_owner:REDACTED@
re_CXEaVAhp_AMJ3WikyKVo1oQkw4rv4TMoJ==>REDACTED
EOF

# Clean repository
cd /Users/georgepierce/Desktop/Projects/ntca/ntca
git-filter-repo --replace-text /tmp/replacements.txt

# Force push (⚠️ ONLY after coordinating with team!)
# git push origin --force --all
```

---

## Quick Command Reference

```bash
# Check current environment variables
vercel env ls

# Update database URL
vercel env update DATABASE_URL production

# Update Resend API key
vercel env update RESEND_API_KEY production

# View logs
vercel logs --follow

# Redeploy
vercel --prod
```

---

## ✅ Completion Checklist

- [ ] Database password rotated in Neon
- [ ] New DATABASE_URL updated in Vercel
- [ ] Resend API key revoked and new one created
- [ ] New RESEND_API_KEY updated in Vercel
- [ ] Application redeployed
- [ ] Database connection verified
- [ ] Email functionality verified
- [ ] Git history cleaned (optional)

---

## Need Help?

If you encounter issues:
1. Check Vercel logs: `vercel logs --follow`
2. Verify environment variables: `vercel env ls`
3. Check Neon dashboard for database status
4. Check Resend dashboard for API key status

