# Email System Quick Setup Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Set Up Resend Account
1. Go to [Resend.com](https://resend.com) and create an account
2. Get your API key from the dashboard
3. Add and verify your sending domain

### Step 2: Configure Environment Variables

#### Option A: Automatic Setup (Recommended)
```bash
# Run the setup script
chmod +x scripts/setup-email-env.sh
./scripts/setup-email-env.sh
```

#### Option B: Manual Setup
Add these to your Vercel environment:
```bash
vercel env add RESEND_API_KEY production
# Enter: your-resend-api-key-here

vercel env add EMAIL_FROM_ADDRESS production  
# Enter: noreply@yourdomain.com

vercel env add EMAIL_FROM_NAME production
# Enter: NTCA Platform

vercel env add EMAIL_REPLY_TO production
# Enter: support@yourdomain.com
```

### Step 3: Update Email Configuration
Edit `/lib/email/email-service.js`:
```javascript
const EMAIL_CONFIG = {
  from: {
    name: 'Your Platform Name',
    email: 'noreply@yourdomain.com' // Must match verified domain
  },
  replyTo: 'support@yourdomain.com',
  defaultDomain: 'https://yourdomain.com'
};
```

### Step 4: Deploy
```bash
vercel --prod
```

## ✅ Testing Checklist

### Test Each Email Flow:

1. **Teacher Registration**
   - Register as teacher
   - Check welcome email received

2. **School Registration**  
   - Register as school
   - Check welcome email received

3. **Job Application**
   - Apply for a job as teacher
   - Check school receives notification

4. **Status Update**
   - Update application status as school
   - Check teacher receives notification

5. **Password Reset**
   - Request password reset
   - Check reset email with working link

## 🛠️ Troubleshooting

### Emails Not Sending?

1. **Check API Key**
   ```bash
   vercel env ls
   # Verify RESEND_API_KEY is set
   ```

2. **Check Domain Verification**
   - Go to Resend dashboard
   - Verify domain is verified
   - Check DNS records are correct

3. **Check Logs**
   ```bash
   vercel logs --prod
   ```

### Common Issues:

| Issue | Solution |
|-------|----------|
| "Invalid API key" | Double-check RESEND_API_KEY in Vercel |
| "Domain not verified" | Verify domain in Resend dashboard |
| "Rate limit exceeded" | Upgrade Resend plan or implement queue |
| "Email not received" | Check spam folder, verify recipient email |

## 📧 Email Templates Overview

All emails are automatically sent at these points:

- **Sign Up** → Welcome email
- **Job Application** → School notification
- **Status Change** → Teacher notification  
- **Password Reset** → Reset link email
- **Subscription Change** → Plan update email

## 🔧 Advanced Configuration

### Custom Email Templates
To modify email templates, edit `/lib/email/email-service.js`:

```javascript
emailTemplates.yourTemplate = {
  subject: 'Your Subject with {variable}',
  html: (data) => `<html>Your HTML</html>`
}
```

### Add New Integration Point
```javascript
import { emailHelpers } from './lib/email/email-service.js';

// In your API endpoint
await emailHelpers.sendTeacherWelcome(teacherData);
```

## 📱 Contact Support

If you need help:
1. Check the [full documentation](./EMAIL_SYSTEM_DOCUMENTATION.md)
2. Review [implementation details](./EMAIL_IMPLEMENTATION_SUMMARY.md)
3. Contact support with error logs

## 🎉 You're Done!

Your email system is now configured. All emails will be automatically sent when users:
- Register on the platform
- Apply for jobs
- Update application statuses
- Reset passwords
- Change subscriptions

Remember to monitor your Resend dashboard for delivery statistics and any issues.