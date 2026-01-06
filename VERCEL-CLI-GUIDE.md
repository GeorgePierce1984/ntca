# Vercel CLI Installation & Usage Guide

## ✅ Current Status

**Vercel CLI is already installed!**
- Version: 48.6.0
- Location: Local node_modules

## How Vercel CLI Was Installed

### Method 1: Global Installation (Most Common)

```bash
npm install -g vercel
```

This was done earlier in your session via:
```bash
npm install -g vercel
```

### Method 2: Using Node.js from Project

Since you have Node.js installed locally in the project:
```bash
cd /Users/georgepierce/Desktop/Projects/ntca/ntca
export PATH="$PWD/node-v20.11.0-darwin-x64/bin:$PATH"
# Now vercel command works
vercel --version
```

### Method 3: Using npm install in Project

```bash
cd /Users/georgepierce/Desktop/Projects/ntca/ntca
npm install vercel
# Run with: npx vercel
```

## How to Use Vercel CLI

### Setup Environment

```bash
cd /Users/georgepierce/Desktop/Projects/ntca/ntca
source setup-local-env.sh
```

### Authentication

```bash
# Login (will open browser)
vercel login

# Check who you're logged in as
vercel whoami
```

### Deployment

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# Deploy without prompts
vercel --prod --yes
```

## Common Commands

```bash
# Check version
vercel --version

# Check login status
vercel whoami

# List all deployments
vercel ls

# Get project info
vercel inspect

# Environment variables
vercel env ls
vercel env add

# Domains
vercel domains

# Help
vercel help
```

## Your Setup

Since Vercel CLI is already installed, you can start using it:

1. **Authenticate**:
   ```bash
   cd /Users/georgepierce/Desktop/Projects/ntca/ntca
   source setup-local-env.sh
   vercel login
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

## Troubleshooting

### If vercel command not found:

1. Make sure you're using the project's Node.js:
   ```bash
   export PATH="$PWD/node-v20.11.0-darwin-x64/bin:$PATH"
   ```

2. Or use npx:
   ```bash
   npx vercel --version
   ```

### Install Vercel CLI Fresh (if needed):

```bash
cd /Users/georgepierce/Desktop/Projects/ntca/ntca
export PATH="$PWD/node-v20.11.0-darwin-x64/bin:$PATH"
npm install -g vercel
```

## Quick Reference

```bash
# 1. Navigate to project
cd /Users/georgepierce/Desktop/Projects/ntca/ntca

# 2. Set up environment
source setup-local-env.sh

# 3. Login (first time only)
vercel login

# 4. Deploy
vercel --prod
```

## Alternative: No CLI Needed

You can also deploy via Vercel Dashboard:
1. Go to https://vercel.com/new
2. Import rogit85/ntca
3. Deploy


