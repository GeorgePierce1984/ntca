# 🧹 Clean Git History - Remove Exposed Secrets

## ⚠️ WARNING: This Rewrites Git History

**Before proceeding:**
- ✅ This will rewrite ALL Git history
- ✅ You'll need to force push to GitHub
- ✅ Anyone who cloned the repo will need to re-clone
- ✅ Make sure you have a backup or are okay with this

## Method 1: Using git-filter-repo (Recommended)

### Step 1: Install git-filter-repo

```bash
# Install using pip
pip3 install git-filter-repo

# Or using homebrew (macOS)
brew install git-filter-repo
```

### Step 2: Create Replacement File

```bash
cd /Users/georgepierce/Desktop/Projects/ntca/ntca

# Create a file with the replacements
cat > /tmp/git-secrets-replacements.txt << 'EOF'
postgresql://neondb_owner:npg_UOXosyWJ1RK7@==>postgresql://neondb_owner:REDACTED@
postgresql://neondb_owner:npg_flMgBpruX3D6@==>postgresql://neondb_owner:REDACTED@
re_CXEaVAhp_AMJ3WikyKVo1oQkw4rv4TMoJ==>REDACTED
EOF
```

### Step 3: Clean the Repository

```bash
# Make sure you're in the repo directory
cd /Users/georgepierce/Desktop/Projects/ntca/ntca

# Clean the history
git-filter-repo --replace-text /tmp/git-secrets-replacements.txt

# Clean up Git references
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### Step 4: Force Push to GitHub

```bash
# ⚠️ WARNING: This will overwrite GitHub history
git push origin --force --all
git push origin --force --tags
```

## Method 2: Using BFG Repo-Cleaner

### Step 1: Download BFG

1. Go to: https://rtyley.github.io/bfg-repo-cleaner/
2. Download the JAR file
3. Save it somewhere accessible (e.g., `~/bfg.jar`)

### Step 2: Create Passwords File

```bash
cat > /tmp/passwords.txt << 'EOF'
postgresql://neondb_owner:npg_UOXosyWJ1RK7@
postgresql://neondb_owner:npg_flMgBpruX3D6@
re_CXEaVAhp_AMJ3WikyKVo1oQkw4rv4TMoJ
EOF
```

### Step 3: Clean Repository

```bash
cd /Users/georgepierce/Desktop/Projects/ntca/ntca

# Clone a fresh copy (BFG needs a clean repo)
cd ..
git clone --mirror ntca ntca-backup.git

# Run BFG
java -jar ~/bfg.jar --replace-text /tmp/passwords.txt ntca-backup.git

# Clean up
cd ntca-backup.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push --force
```

## Method 3: Manual Clean (Simpler but Less Complete)

If the above methods seem complex, you can:

1. **Create a new repository** on GitHub
2. **Copy current code** (without secrets)
3. **Push to new repo**
4. **Update Vercel** to point to new repo

This is simpler but loses all Git history.

## After Cleaning History

1. **Verify secrets are gone:**
   ```bash
   git log --all --source -S "npg_UOXosyWJ1RK7"
   git log --all --source -S "re_CXEaVAhp"
   ```
   (Should return no results)

2. **Team members need to:**
   ```bash
   # Delete local repo
   rm -rf ntca
   
   # Re-clone
   git clone https://github.com/GeorgePierce1984/ntca.git
   ```

3. **GitGuardian should stop showing alerts** after history is cleaned

## Quick Start (git-filter-repo)

If you want to do it now, run these commands:

```bash
# 1. Install
pip3 install git-filter-repo

# 2. Create replacements file
cat > /tmp/git-secrets-replacements.txt << 'EOF'
postgresql://neondb_owner:npg_UOXosyWJ1RK7@==>postgresql://neondb_owner:REDACTED@
postgresql://neondb_owner:npg_flMgBpruX3D6@==>postgresql://neondb_owner:REDACTED@
re_CXEaVAhp_AMJ3WikyKVo1oQkw4rv4TMoJ==>REDACTED
EOF

# 3. Clean (run from repo directory)
cd /Users/georgepierce/Desktop/Projects/ntca/ntca
git-filter-repo --replace-text /tmp/git-secrets-replacements.txt

# 4. Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. Force push (⚠️ only after reviewing!)
# git push origin --force --all
```

