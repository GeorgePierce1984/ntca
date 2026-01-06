# Environment Variables Setup Guide

This guide will help you set up the required environment variables for the NTCA platform.

## Required Environment Variables

The following environment variables are required for the application to work properly:

### Authentication & Security

```env
JWT_SECRET=your_super_secure_jwt_secret_here_minimum_32_characters
INTERNAL_API_KEY=your_internal_api_key_for_email_system_32_chars
```

### Database

```env
DATABASE_URL=your_database_connection_string
```

### Email Service (Critical for Production)

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
# Alternative: Use SendGrid, Mailgun, or similar
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### File Upload & Storage

```env
# For local development (not recommended for production)
UPLOAD_PATH=/uploads
# For production - use cloud storage
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=your_bucket_name
AWS_REGION=us-east-1
# Alternative: Cloudinary
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Application URLs

```env
NEXT_PUBLIC_APP_URL=https://ntca.vercel.app
NEXT_PUBLIC_API_URL=https://ntca.vercel.app/api
```

### Stripe Configuration

```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Stripe Price IDs

```env
VITE_STRIPE_BASIC_MONTHLY_USD=price_xxxxxxxxxxxxx
VITE_STRIPE_BASIC_ANNUAL_USD=price_xxxxxxxxxxxxx
VITE_STRIPE_STANDARD_MONTHLY_USD=price_xxxxxxxxxxxxx
VITE_STRIPE_STANDARD_ANNUAL_USD=price_xxxxxxxxxxxxx
VITE_STRIPE_PREMIUM_MONTHLY_USD=price_xxxxxxxxxxxxx
VITE_STRIPE_PREMIUM_ANNUAL_USD=price_xxxxxxxxxxxxx
```

## Local Development Setup

1. **Create a `.env` file** in the root directory of your project if it doesn't exist.

2. **Add your Stripe Price IDs** to the `.env` file. You can get these from your Stripe Dashboard:
   - Go to [Stripe Dashboard](https://dashboard.stripe.com)
   - Navigate to Products
   - Create products for each plan tier (Starter, Professional, Enterprise)
   - Create both monthly and annual prices for each product
   - Copy the price IDs (they start with `price_`)

3. **Example `.env` file**:
```env
# Authentication & Security
JWT_SECRET=your_super_secure_jwt_secret_here_minimum_32_characters_long
INTERNAL_API_KEY=your_internal_api_key_for_email_system_32_chars_long

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/ntca_db

# Email Service (CRITICAL for production)
RESEND_API_KEY=re_1ABCDEFGHIJKLMNOPQRSTUVWXYZabcd
# OR use SendGrid/SMTP
SENDGRID_API_KEY=SG.1ABCDEFGHIJKLMNOPQRSTUVWXYZabcd
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notifications@yourdomain.com
SMTP_PASS=your_app_password

# File Upload (CRITICAL for CV/photo uploads)
AWS_ACCESS_KEY_ID=AKIA1ABCDEFGHIJKLMNOP
AWS_SECRET_ACCESS_KEY=1ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijk
AWS_S3_BUCKET=ntca-uploads
AWS_REGION=us-east-1
# OR use Cloudinary
CLOUDINARY_URL=cloudinary://123456789012345:abcdefghijklmnopqrstuvwxyz1234567890abcd@your-cloud

# Application URLs
NEXT_PUBLIC_APP_URL=https://ntca.vercel.app
NEXT_PUBLIC_API_URL=https://ntca.vercel.app/api

# Stripe Configuration  
STRIPE_SECRET_KEY=sk_test_1ABCDEFGHIJKLMNOPQRSTUVWXYZabcd
STRIPE_WEBHOOK_SECRET=whsec_1ABCDEFGHIJKLMNOPQRSTUVWXYZabcd

# Stripe Price IDs for School Plans
VITE_STRIPE_BASIC_MONTHLY_USD=price_1ABCDEFGHIJKLMNOPQRSTUVWXYZabcd
VITE_STRIPE_BASIC_ANNUAL_USD=price_2ABCDEFGHIJKLMNOPQRSTUVWXYZabcd
VITE_STRIPE_STANDARD_MONTHLY_USD=price_3ABCDEFGHIJKLMNOPQRSTUVWXYZabcd
VITE_STRIPE_STANDARD_ANNUAL_USD=price_4ABCDEFGHIJKLMNOPQRSTUVWXYZabcd
VITE_STRIPE_PREMIUM_MONTHLY_USD=price_5ABCDEFGHIJKLMNOPQRSTUVWXYZabcd
VITE_STRIPE_PREMIUM_ANNUAL_USD=price_6ABCDEFGHIJKLMNOPQRSTUVWXYZabcd
```

## Vercel Production Setup

1. **Go to your Vercel project settings**:
   - Visit [Vercel Dashboard](https://vercel.com/dashboard)
   - Select your project
   - Go to Settings → Environment Variables

2. **Add each environment variable** (CRITICAL - all must be added):
   
   **Authentication & Security:**
   - `JWT_SECRET` = Generate a secure random string (minimum 32 characters)
   - `INTERNAL_API_KEY` = Secure key for internal API calls (32+ characters)
   
   **Database:**
   - `DATABASE_URL` = Your production database connection string
   
   **Email Service (CRITICAL):**
   - `RESEND_API_KEY` = Your Resend API key for email notifications
   - OR `SENDGRID_API_KEY` = Your SendGrid API key
   - OR SMTP configuration for custom email service
   
   **File Storage (CRITICAL):**
   - AWS S3 credentials for CV/photo uploads in production
   - OR Cloudinary URL for image and document management
   
   **Application URLs:**
   - `NEXT_PUBLIC_APP_URL` = Your production domain (https://ntca.vercel.app)
   - `NEXT_PUBLIC_API_URL` = Your API endpoint URL
   
   **Stripe Configuration:**
   - `STRIPE_SECRET_KEY` = Your live Stripe secret key (sk_live_...)
   - `STRIPE_WEBHOOK_SECRET` = Your Stripe webhook endpoint secret
   
   **Stripe Price IDs:**
   - `VITE_STRIPE_BASIC_MONTHLY_USD` = Your Basic monthly price ID
   - `VITE_STRIPE_BASIC_ANNUAL_USD` = Your Basic annual price ID
   - `VITE_STRIPE_STANDARD_MONTHLY_USD` = Your Standard monthly price ID
   - `VITE_STRIPE_STANDARD_ANNUAL_USD` = Your Standard annual price ID
   - `VITE_STRIPE_PREMIUM_MONTHLY_USD` = Your Premium monthly price ID
   - `VITE_STRIPE_PREMIUM_ANNUAL_USD` = Your Premium annual price ID

3. **For each variable**:
   - Click "Add New"
   - Enter the variable name exactly as shown
   - Enter the value
   - Select the environments where it should be available (Production, Preview, Development)
   - Click "Save"

4. **After adding all variables**, redeploy your application for changes to take effect.

## Important Notes

### Vite Environment Variables
- All environment variables must be prefixed with `VITE_` to be accessible in the client-side code
- Access them in your code using `import.meta.env.VITE_VARIABLE_NAME`

### Security
- Never commit your `.env` file to version control
- The `.env` file is already included in `.gitignore`
- Keep your Stripe price IDs secure

### Test vs Production
- Use test mode price IDs from Stripe for development
- Use live mode price IDs for production
- You can toggle between test and live mode in the Stripe Dashboard

## Troubleshooting

### Environment variables not working?

1. **Check the prefix**: Make sure all variables start with `VITE_`
2. **Restart the dev server**: After adding or changing environment variables, restart your development server
3. **Check for typos**: Variable names are case-sensitive
4. **Verify in code**: You can log the variables to check if they're loaded:
   ```typescript
   console.log(import.meta.env.VITE_STRIPE_STARTER_MONTHLY_PRICE_ID);
   ```

### Authentication errors (JWT malformed, 401 errors)?

These errors typically occur when:
1. **JWT_SECRET is missing**: Ensure `JWT_SECRET` is set in your environment variables
2. **JWT_SECRET is too short**: Use a minimum of 32 characters for security
3. **Environment variables not deployed**: After adding variables in Vercel, redeploy the application

### File upload failures (CV/photo uploads not working)?

This occurs when file storage is not configured:
1. **Missing storage configuration**: Set up AWS S3 or Cloudinary credentials
2. **Upload directory permissions**: Ensure upload directories exist and are writable
3. **File size limits**: Check Vercel function limits (10MB max)
4. **CORS issues**: Configure proper CORS settings for file uploads

### Email notifications not sending?

This happens when email service is not configured:
1. **Missing email service**: Configure Resend, SendGrid, or SMTP settings
2. **Invalid API keys**: Verify email service API keys are correct
3. **Domain verification**: Ensure sending domain is verified with email provider
4. **Rate limits**: Check if you've exceeded email service rate limits

### "Selected plan is not available" error?

This error occurs when the Stripe price IDs are not properly configured. Check that:
1. All price IDs are correctly set in your environment variables
2. The price IDs are valid and exist in your Stripe account
3. You're using the correct mode (test/live) price IDs

### Registration/login failures?

If users can't register or login:
1. Check that `JWT_SECRET` is properly set
2. Verify `DATABASE_URL` is configured and accessible
3. Ensure the database schema is up to date (run Prisma migrations)

## Creating Stripe Products and Prices

If you haven't created your Stripe products yet:

1. **Log in to Stripe Dashboard**
2. **Go to Products** section
3. **Create products** for each tier:
   - **Basic/Starter Plan**: $49/month or $470/year
   - **Standard/Professional Plan**: $99/month or $950/year
   - **Premium/Enterprise Plan**: $199/month or $1910/year
4. **For each product**, create two prices:
   - Monthly recurring price
   - Annual recurring price (with the discounted amount)
5. **Copy the price IDs** and add them to your environment variables

## Security Notes

### Critical Key Generation

**JWT_SECRET Generation:**
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32

# Python
python -c "import secrets; print(secrets.token_hex(32))"
```

**INTERNAL_API_KEY Generation:**
```bash
# For internal API authentication
node -e "console.log('internal_' + require('crypto').randomBytes(28).toString('hex'))"
```

### Production Security Checklist
- [ ] JWT_SECRET is minimum 32 characters and unique per environment
- [ ] INTERNAL_API_KEY is set for email API authentication
- [ ] All email credentials are configured and tested
- [ ] File upload storage (AWS S3/Cloudinary) is configured
- [ ] Database backups are automated
- [ ] SSL certificates are properly configured
- [ ] Rate limiting is enabled for API endpoints

### Important Security Rules
- Never commit your `.env` file to version control
- Use different secrets for development and production
- Rotate secrets periodically (every 90 days recommended)
- Monitor for unauthorized access attempts
- Use strong, unique secrets for each environment
- Enable 2FA on all service accounts (AWS, Stripe, email providers)

## Migration from React to Vite

If you're migrating from a Create React App setup:
- Change all `REACT_APP_*` prefixes to `VITE_*`
- Change all `process.env.*` to `import.meta.env.*` in your code
- Run the provided `update-env-vars.sh` script to automatically update your `.env` files