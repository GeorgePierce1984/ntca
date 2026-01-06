# Email System Documentation

## Overview

The NTCA platform uses [Resend](https://resend.com) as the email service provider to send transactional emails. The email system is fully integrated with all major platform features including user registration, job applications, subscription management, and password resets.

## Email Templates

### 1. Teacher Welcome Email (`teacherWelcome`)
- **Trigger**: When a teacher successfully registers on the platform
- **Recipients**: Newly registered teacher
- **Content**: Welcome message, next steps, profile completion CTA

### 2. School Welcome Email (`schoolWelcome`)
- **Trigger**: When a school successfully registers on the platform
- **Recipients**: Newly registered school admin
- **Content**: Welcome message, subscription details, job posting CTA

### 3. Application Received (`applicationReceived`)
- **Trigger**: When a teacher applies for a job
- **Recipients**: School contact email
- **Content**: Applicant details, qualification summary, cover letter preview, review CTA

### 4. Application Status Update (`applicationStatusUpdate`)
- **Trigger**: When a school updates an application status
- **Recipients**: Teacher who applied
- **Content**: New status, school message (if any), special messages for interview/hired status

### 5. Password Reset (`passwordReset`)
- **Trigger**: When a user requests a password reset
- **Recipients**: User who requested reset
- **Content**: Reset link (expires in 1 hour), security notice

### 6. Subscription Changed (`subscriptionChanged`)
- **Trigger**: When a school's subscription is modified
- **Recipients**: School admin
- **Content**: Plan details, billing information, next steps

### 7. Job Alert (`jobAlert`)
- **Trigger**: When a new job matches teacher preferences
- **Recipients**: Teachers with matching alerts
- **Content**: Job details, school information, application CTA

## Configuration

### Email Service Setup

The email service is configured in `/lib/email/email-service.js` with the following structure:

```javascript
const EMAIL_CONFIG = {
  from: {
    name: 'NTCA Platform',
    email: 'noreply@ntca.com' // Must be verified domain
  },
  replyTo: 'support@ntca.com',
  defaultDomain: process.env.NEXT_PUBLIC_APP_URL || 'https://ntca.vercel.app'
};
```

### Environment Variables

Required environment variables for email functionality:

| Variable | Description | Example |
|----------|-------------|---------|
| `RESEND_API_KEY` | Resend API key for authentication | `re_xxxxx` |
| `EMAIL_FROM_ADDRESS` | Verified sender email address | `noreply@ntca.com` |
| `EMAIL_FROM_NAME` | Sender display name | `NTCA Platform` |
| `EMAIL_REPLY_TO` | Reply-to email address | `support@ntca.com` |
| `SUPPORT_EMAIL` | Support team email | `support@ntca.com` |
| `ADMIN_EMAIL` | Admin notification email | `admin@ntca.com` |

### Setting Up Environment Variables

1. **Local Development**:
   ```bash
   # Add to .env.local
   RESEND_API_KEY=your_resend_api_key
   EMAIL_FROM_ADDRESS=noreply@yourdomain.com
   EMAIL_FROM_NAME=NTCA Platform
   EMAIL_REPLY_TO=support@yourdomain.com
   ```

2. **Vercel Production**:
   ```bash
   # Run the setup script
   ./scripts/setup-email-env.sh
   
   # Or manually set each variable
   vercel env add RESEND_API_KEY production
   ```

## Integration Points

### 1. User Registration
- **File**: `/api/auth/register.js`
- **Implementation**:
  ```javascript
  // Send welcome email after successful registration
  if (userType.toLowerCase() === "school") {
    await emailHelpers.sendSchoolWelcome(result.profile);
  } else if (userType.toLowerCase() === "teacher") {
    await emailHelpers.sendTeacherWelcome(result.profile);
  }
  ```

### 2. Job Applications
- **File**: `/api/applications/create.js`
- **Implementation**:
  ```javascript
  // Notify school of new application
  await emailHelpers.notifySchoolOfApplication(
    job.school,
    job,
    teacher,
    application
  );
  ```

### 3. Application Status Updates
- **File**: `/api/applications/[id]/status.js`
- **Implementation**:
  ```javascript
  // Notify teacher of status change
  await emailHelpers.notifyTeacherOfStatusUpdate(
    application.teacher,
    application.job,
    school,
    status,
    note
  );
  ```

### 4. Password Reset
- **File**: `/api/auth/forgot-password.js`
- **Implementation**:
  ```javascript
  // Send password reset email
  await emailHelpers.sendPasswordReset(user, resetToken);
  ```

### 5. Stripe Webhook Events
- **File**: `/api/webhooks/stripe.js`
- **Triggers**:
  - Subscription created
  - Subscription updated
  - Subscription cancelled
  - Trial ending
  - Payment reminders

## Usage Examples

### Sending a Welcome Email
```javascript
import { emailHelpers } from '../../lib/email/email-service.js';

// For a teacher
await emailHelpers.sendTeacherWelcome({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com'
});

// For a school
await emailHelpers.sendSchoolWelcome({
  name: 'Example School',
  email: 'admin@school.com'
}, {
  name: 'Premium Plan',
  jobLimit: 10
});
```

### Sending Custom Emails
```javascript
import { sendEmail } from '../../lib/email/email-service.js';

// Use a predefined template
await sendEmail('passwordReset', 'user@example.com', {
  name: 'John',
  token: 'reset_token_here'
});
```

## Email Templates Customization

All email templates are defined in `/lib/email/email-service.js`. Each template includes:

1. **Subject**: Can include dynamic placeholders using `{variable}` syntax
2. **HTML Content**: Full HTML email with inline styles for maximum compatibility

Example template structure:
```javascript
templateName: {
  subject: 'Welcome to NTCA, {firstName}!',
  html: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="...">
      <h1>Welcome ${data.firstName}!</h1>
      <!-- Email content -->
    </body>
    </html>
  `
}
```

## Testing

### Local Testing

1. **Test Mode**: When `RESEND_API_KEY` is not configured, emails are logged but not sent
2. **Development**: Use Resend's test API key to validate email formatting without sending

### Testing Checklist

- [ ] Verify all environment variables are set
- [ ] Test each email template with sample data
- [ ] Verify links in emails point to correct URLs
- [ ] Check email rendering in different clients
- [ ] Test error handling when email service fails

### Email Preview

To preview emails during development:

1. Create a test endpoint:
```javascript
// /api/email/preview.js
import { emailTemplates } from '../../lib/email/email-service.js';

export default function handler(req, res) {
  const { template } = req.query;
  const sampleData = getSampleData(template);
  const html = emailTemplates[template].html(sampleData);
  
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
}
```

2. Visit: `http://localhost:3000/api/email/preview?template=teacherWelcome`

## Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check if `RESEND_API_KEY` is set correctly
   - Verify sender domain is verified in Resend
   - Check API key permissions

2. **Email formatting issues**
   - Use inline CSS for styling
   - Test in multiple email clients
   - Avoid complex layouts

3. **Rate limiting**
   - Resend has rate limits based on your plan
   - Implement queue system for bulk emails
   - Monitor usage in Resend dashboard

### Debug Mode

Enable email debugging by adding to your environment:
```bash
EMAIL_DEBUG=true
```

This will log all email attempts without sending them.

## Best Practices

1. **Always use try-catch**: Email sending should never break core functionality
   ```javascript
   try {
     await emailHelpers.sendWelcomeEmail(user);
   } catch (error) {
     console.error('Email failed:', error);
     // Continue with process
   }
   ```

2. **Log email activity**: Track all email sends for debugging and analytics

3. **Provide fallbacks**: Show important information in the UI even if email fails

4. **Test thoroughly**: Use Resend's test mode during development

5. **Monitor deliverability**: Check Resend dashboard for bounce rates and issues

6. **Keep templates simple**: Use tables for layout, inline CSS, avoid JavaScript

## Security Considerations

1. **Never expose API keys**: Keep `RESEND_API_KEY` in environment variables only
2. **Validate email addresses**: Always validate before sending
3. **Rate limit**: Implement rate limiting to prevent abuse
4. **Sanitize user input**: When including user data in emails, sanitize HTML
5. **Use secure links**: All links should use HTTPS

## Future Enhancements

1. **Email queuing**: Implement job queue for better reliability
2. **Template versioning**: Track email template changes
3. **A/B testing**: Test different email formats
4. **Analytics**: Track open rates and click-through rates
5. **Localization**: Support multiple languages
6. **Rich notifications**: Add calendar invites for interviews