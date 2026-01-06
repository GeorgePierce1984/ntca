# Security Guidelines

## ⚠️ NEVER COMMIT SECRETS

This repository uses environment variables for all sensitive data. **Never commit**:
- API keys
- Database connection strings
- Passwords
- Tokens
- Private keys

## Environment Variables

All secrets should be stored in:
- **Vercel**: Project Settings → Environment Variables
- **Local Development**: `.env` file (already in `.gitignore`)

## Required Environment Variables

### Database
- `DATABASE_URL` - PostgreSQL connection string (set in Vercel only)

### Email (Resend)
- `RESEND_API_KEY` - Get from https://resend.com (set in Vercel only)

### Authentication
- `JWT_SECRET` - Random 32+ character string (set in Vercel only)

### Stripe
- `STRIPE_SECRET_KEY` - Get from Stripe Dashboard (set in Vercel only)
- `STRIPE_WEBHOOK_SECRET` - Get from Stripe Dashboard (set in Vercel only)

## If You Accidentally Commit a Secret

1. **Immediately rotate the secret** in the service (database, API, etc.)
2. **Remove from code** and commit the fix
3. **Clean Git history** using `git-filter-repo` or BFG Repo-Cleaner
4. **Force push** to update remote (⚠️ coordinate with team first)

## Scripts and Documentation

- Scripts should prompt for secrets or read from environment variables
- Documentation should use placeholders like `YOUR_PASSWORD` or `YOUR_API_KEY`
- Never hardcode real credentials in any file

