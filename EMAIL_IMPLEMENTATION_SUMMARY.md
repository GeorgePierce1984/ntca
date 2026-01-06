# Email System Implementation Summary

## Overview

The NTCA platform now has a fully integrated email system using Resend as the email service provider. This implementation covers all major user interactions including registration, job applications, subscription management, and password resets.

## What Has Been Implemented

### 1. Core Email Service (`/lib/email/email-service.js`)

A comprehensive email service module that includes:

- **Email Templates**: 7 professionally designed, responsive HTML email templates
- **Helper Functions**: Easy-to-use functions for common email scenarios
- **Error Handling**: Graceful error handling that doesn't break core functionality
- **Activity Logging**: All email sends are logged for debugging and analytics

### 2. Email Templates

| Template | Purpose | Trigger |
|----------|---------|---------|
| `teacherWelcome` | Welcome new teachers | Teacher registration |
| `schoolWelcome` | Welcome new schools | School registration |
| `applicationReceived` | Notify schools of new applications | Job application submission |
| `applicationStatusUpdate` | Notify teachers of status changes | Application status update |
| `passwordReset` | Password reset links | Password reset request |
| `subscriptionChanged` | Subscription updates | Stripe subscription events |
| `jobAlert` | New job notifications | Job matching preferences |

### 3. Integration Points

#### User Registration (`/api/auth/register.js`)
```javascript
// Automatically sends welcome email after successful registration
if (userType.toLowerCase() === "school") {
  await emailHelpers.sendSchoolWelcome(result.profile);
} else if (userType.toLowerCase() === "teacher") {
  await emailHelpers.sendTeacherWelcome(result.profile);
}
```

#### Job Applications (`/api/applications/create.js`)
```javascript
// Notifies school when teacher applies
await emailHelpers.notifySchoolOfApplication(
  job.school,
  job,
  teacher,
  application
);
```

#### Application Status Updates (`/api/applications/[id]/status.js`)
```javascript
// Notifies teacher when school updates application
await emailHelpers.notifyTeacherOfStatusUpdate(
  application.teacher,
  application.job,
  school,
  status,
  note
);
```

#### Password Reset (`/api/auth/forgot-password.js`)
```javascript
// Sends password reset email with secure token
await emailHelpers.sendPasswordReset(user, resetToken);
```

#### Stripe Webhooks (`/api/webhooks/stripe.js`)
Handles subscription lifecycle emails:
- Subscription created
- Subscription updated/upgraded/downgraded
- Subscription cancelled
- Trial ending reminders
- Payment reminders

## Configuration

### Environment Variables Required

```bash
# Email Service
RESEND_API_KEY=YOUR_RESEND_API_KEY  # Your Resend API key

# Email Configuration
EMAIL_FROM_ADDRESS=noreply@ntca.com         # Must be verified domain
EMAIL_FROM_NAME=NTCA Platform
EMAIL_REPLY_TO=support@ntca.com
SUPPORT_EMAIL=support@ntca.com
ADMIN_EMAIL=admin@ntca.com

# Email Preferences
SEND_APPLICATION_NOTIFICATIONS=true
SEND_STATUS_UPDATE_NOTIFICATIONS=true
SEND_SUBSCRIPTION_NOTIFICATIONS=true
SEND_JOB_ALERTS=true
EMAIL_RATE_LIMIT_PER_HOUR=100
```

### Setting Up Vercel Environment Variables

A setup script has been created to automatically configure all email environment variables:

```bash
# Make the script executable
chmod +x scripts/setup-email-env.sh

# Run the setup script
./scripts/setup-email-env.sh
```

The script will:
1. Set all required email environment variables for production
2. Optionally set up development environment variables
3. Provide instructions for next steps

## How to Use

### Sending Emails in Your Code

1. **Using Helper Functions** (Recommended):
```javascript
import { emailHelpers } from '../../lib/email/email-service.js';

// Send welcome email
await emailHelpers.sendTeacherWelcome(teacher);

// Send application notification
await emailHelpers.notifySchoolOfApplication(school, job, teacher, application);

// Send status update
await emailHelpers.notifyTeacherOfStatusUpdate(teacher, job, school, 'INTERVIEW', 'Looking forward to meeting you!');
```

2. **Using Core Function** (For custom emails):
```javascript
import { sendEmail } from '../../lib/email/email-service.js';

await sendEmail('templateName', 'recipient@email.com', {
  // Template data
  name: 'John Doe',
  customField: 'value'
});
```

### Best Practices Implemented

1. **Error Handling**: Email failures don't break core functionality
```javascript
try {
  await emailHelpers.sendWelcomeEmail(user);
} catch (error) {
  console.error('Email failed:', error);
  // Process continues normally
}
```

2. **Activity Logging**: All email sends are tracked
3. **Responsive Design**: All templates work on mobile and desktop
4. **Security**: No sensitive data in email content
5. **Rate Limiting**: Respects Resend's rate limits

## Testing

### Local Development
1. Emails will log to console if `RESEND_API_KEY` is not set
2. Use Resend's test mode for development
3. All email templates can be previewed without sending

### Production Testing
1. Verify domain in Resend dashboard
2. Update `EMAIL_FROM_ADDRESS` to use verified domain
3. Test each email flow:
   - User registration (both teacher and school)
   - Job application
   - Status updates
   - Password reset
   - Subscription changes

## What Needs to Be Done

### 1. Domain Verification
- [ ] Verify your sending domain in Resend dashboard
- [ ] Update `EMAIL_FROM_ADDRESS` to use verified domain
- [ ] Configure SPF, DKIM, and DMARC records

### 2. Production API Key
- [ ] Replace the test API key with production key
- [ ] Update environment variables in Vercel

### 3. Email Addresses
- [ ] Set up actual email addresses:
  - `noreply@yourdomain.com`
  - `support@yourdomain.com`
  - `admin@yourdomain.com`

### 4. Testing
- [ ] Test all email flows in staging environment
- [ ] Verify email rendering in major clients (Gmail, Outlook, Apple Mail)
- [ ] Test with real user data

### 5. Monitoring
- [ ] Set up email delivery monitoring in Resend dashboard
- [ ] Configure bounce and complaint handling
- [ ] Set up alerts for failed emails

## Troubleshooting

### Common Issues and Solutions

1. **Emails not sending**
   - Verify `RESEND_API_KEY` is set correctly
   - Check if sender domain is verified
   - Review Resend dashboard for errors

2. **Rate limiting**
   - Implement email queue for bulk sends
   - Upgrade Resend plan if needed

3. **Email formatting issues**
   - Use email testing tools
   - Keep HTML simple with inline CSS
   - Test in multiple clients

## Future Enhancements

1. **Email Queue System**: For better reliability and rate limit handling
2. **Template Management**: UI for editing email templates
3. **Analytics**: Track open rates and engagement
4. **Localization**: Support for multiple languages
5. **Rich Content**: Calendar invites for interviews

## Support

For issues or questions:
1. Check Resend documentation: https://resend.com/docs
2. Review email logs in your database
3. Contact support with error details and timestamps

## Quick Reference

### Email Helper Functions
```javascript
// Teacher emails
emailHelpers.sendTeacherWelcome(teacher)
emailHelpers.notifyTeacherOfStatusUpdate(teacher, job, school, status, note)

// School emails  
emailHelpers.sendSchoolWelcome(school, planDetails)
emailHelpers.notifySchoolOfApplication(school, job, teacher, application)
emailHelpers.sendSubscriptionChanged(school, action, planDetails)

// General emails
emailHelpers.sendPasswordReset(user, resetToken)
emailHelpers.sendJobAlert(teacher, job, school)
```

### Email Template Names
- `teacherWelcome`
- `schoolWelcome`
- `applicationReceived`
- `applicationStatusUpdate`
- `passwordReset`
- `subscriptionChanged`
- `jobAlert`
