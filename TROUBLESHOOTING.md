# Troubleshooting Guide for NTCA Authentication Issues

This guide helps you diagnose and fix common authentication problems in the NTCA platform.

## Quick Diagnosis

Run these scripts to quickly identify issues:

```bash
# Check and setup local environment
node setup-auth.js

# Debug authentication issues
node debug-auth.js
```

## Common Issues and Solutions

### 1. 🚨 "JWT malformed" Error

**Symptoms:**
- Error in browser console: `Error parsing token: InvalidCharacterError`
- 401 errors on `/api/auth/validate`
- Session timeout popup appears immediately after registration

**Root Cause:** Missing or invalid JWT_SECRET environment variable

**Solutions:**

#### For Local Development:
```bash
# Generate a secure JWT secret
openssl rand -hex 32

# Add to your .env file
echo "JWT_SECRET=your_generated_secret_here" >> .env
```

#### For Production (Vercel):
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Environment Variables
4. Add new variable:
   - Name: `JWT_SECRET`
   - Value: (32+ character random string)
   - Environment: Production, Preview, Development
5. **Important:** Redeploy your application after adding the variable

### 2. 🚨 Registration Fails with 400 Error

**Symptoms:**
- Registration form submits but returns 400 status
- Error message about missing or invalid fields

**Common Causes & Solutions:**

#### Missing Required Fields:
- **Schools:** name, contactName, telephone, city, country, estimateJobs
- **Teachers:** firstName, lastName, phone, city, country, qualification, experience

#### Invalid Email Format:
- Ensure email contains @ symbol and valid domain
- No spaces or special characters

#### Weak Password:
- Password must be at least 8 characters long
- Include mix of letters, numbers, and symbols

#### Duplicate Email:
- Check if account already exists with this email
- Try logging in instead of registering

### 3. 🚨 Session Timeout After Registration

**Symptoms:**
- Successfully register (201 response)
- Immediately get session timeout popup
- Redirected to homepage

**Root Cause:** JWT_SECRET not configured in production environment

**Solution:**
1. Add JWT_SECRET to Vercel environment variables
2. Redeploy the application
3. Clear browser localStorage: `localStorage.clear()`
4. Try registering again

### 4. 🚨 "Selected plan is not available" Error

**Symptoms:**
- School registration fails during plan selection
- Error about plan availability

**Root Cause:** Missing Stripe price IDs in environment variables

**Solution:**
Add these to your environment variables:
```env
VITE_STRIPE_BASIC_MONTHLY_USD=price_xxxxxxxxxxxxx
VITE_STRIPE_BASIC_ANNUAL_USD=price_xxxxxxxxxxxxx
VITE_STRIPE_STANDARD_MONTHLY_USD=price_xxxxxxxxxxxxx
VITE_STRIPE_STANDARD_ANNUAL_USD=price_xxxxxxxxxxxxx
VITE_STRIPE_PREMIUM_MONTHLY_USD=price_xxxxxxxxxxxxx
VITE_STRIPE_PREMIUM_ANNUAL_USD=price_xxxxxxxxxxxxx
```

### 5. 🚨 Network/Connection Errors

**Symptoms:**
- "Failed to fetch" errors
- Timeout errors
- Network request failures

**Solutions:**
1. Check internet connection
2. Verify API endpoints are accessible
3. Check for firewall/proxy blocking requests
4. Try different browser or incognito mode

## Step-by-Step Debugging Process

### Step 1: Check Environment Variables

```bash
# Run health check
curl https://your-app.vercel.app/api/health

# Check for warnings in the response
```

### Step 2: Clear Browser Data

```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
// Then refresh the page
```

### Step 3: Test Registration Flow

1. Go to `/signup`
2. Select "Teacher" (free registration)
3. Fill all required fields
4. Open browser DevTools → Network tab
5. Submit registration
6. Check for errors in Console and Network tabs

### Step 4: Verify Token Generation

After successful registration:
```javascript
// In browser console
const token = localStorage.getItem('authToken');
console.log('Token:', token);

// Check if it's a valid JWT format (should have 3 parts)
if (token) {
  console.log('Parts:', token.split('.').length);
  // Should log 3
}
```

## Environment Variables Checklist

### Required for Authentication:
- ✅ `JWT_SECRET` (minimum 32 characters)
- ✅ `DATABASE_URL`

### Required for Stripe Integration:
- ✅ `STRIPE_SECRET_KEY`
- ✅ `STRIPE_WEBHOOK_SECRET`
- ✅ All Stripe price IDs (6 total)

### Security Best Practices:
- ✅ Different JWT_SECRET for dev/prod
- ✅ Use test Stripe keys for development
- ✅ Never commit .env files to git
- ✅ Rotate secrets periodically

## Production Deployment Checklist

Before deploying to production:

1. **Environment Variables Set:**
   - [ ] JWT_SECRET (32+ chars)
   - [ ] DATABASE_URL
   - [ ] STRIPE_SECRET_KEY (live mode)
   - [ ] All VITE_STRIPE_* price IDs

2. **Database Setup:**
   - [ ] Production database created
   - [ ] Prisma migrations applied
   - [ ] Database accessible from Vercel

3. **Stripe Configuration:**
   - [ ] Live mode enabled
   - [ ] Products and prices created
   - [ ] Webhook configured
   - [ ] Price IDs match environment variables

4. **Testing:**
   - [ ] Health check endpoint works
   - [ ] Teacher registration works
   - [ ] School registration with Stripe works
   - [ ] Login/logout flow works

## Getting Help

### Browser Console Errors:
1. Open DevTools (F12)
2. Go to Console tab
3. Look for red error messages
4. Copy exact error text for support

### Network Request Errors:
1. Open DevTools → Network tab
2. Try the failing action
3. Look for failed requests (red status)
4. Click on failed request to see details

### Server Logs (Vercel):
1. Go to Vercel Dashboard
2. Select your project
3. Go to Functions tab
4. Click on failing function
5. Check logs for error details

### Contact Support:
When reporting issues, include:
- Exact error message
- Browser console output
- Network request details
- Steps to reproduce
- Environment (dev/production)

## Useful Commands

```bash
# Generate secure JWT secret
openssl rand -hex 32
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Test local health endpoint
curl http://localhost:5173/api/health

# Test production health endpoint
curl https://your-app.vercel.app/api/health

# Check environment variables (run from project root)
node -e "console.log('JWT_SECRET set:', !!process.env.JWT_SECRET)"

# Clear browser data via console
localStorage.clear(); sessionStorage.clear(); location.reload();
```

## Prevention Tips

1. **Always test in development first**
2. **Set up environment variables before deploying**
3. **Use the health check endpoint to verify configuration**
4. **Keep .env.example file updated with required variables**
5. **Document any new environment variables**
6. **Test both teacher and school registration flows**
7. **Monitor Vercel function logs for errors**