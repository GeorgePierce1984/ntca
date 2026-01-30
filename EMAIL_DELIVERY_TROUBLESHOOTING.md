# Email Delivery Troubleshooting Guide

## Issue: Verification Emails Not Reaching Gmail Users (Especially in Kazakhstan)

### Root Causes

1. **Test Domain (`onboarding@resend.dev`)**
   - Gmail aggressively filters emails from Resend's test domain
   - No SPF/DKIM/DMARC records for test domains
   - Lower deliverability compared to verified custom domains

2. **Regional Filtering**
   - Gmail may apply stricter filtering for certain regions (e.g., Kazakhstan)
   - Test domains are more likely to be blocked in these regions

3. **Spam Folder Placement**
   - Emails may be delivered but filtered to spam/junk folder
   - Users may not check spam folder

### Immediate Solutions

#### 1. Check Resend Dashboard
- Go to https://resend.com/emails
- Check if emails are being sent successfully
- Look for delivery status (delivered, bounced, failed)
- Check for any error messages

#### 2. Verify Custom Domain (Recommended)
- Add and verify your custom domain in Resend
- Update DNS records (SPF, DKIM, DMARC)
- Change `EMAIL_CONFIG.from.email` to use your verified domain
- This significantly improves deliverability

#### 3. User Instructions
Tell users to:
- Check spam/junk folder
- Wait 5-10 minutes for email delivery
- Check email filters/rules
- Try requesting code again
- Contact support if issue persists

### Diagnostic Tools

#### Test Email Delivery
```bash
curl -X POST https://www.nt-ca.com/api/email/diagnose \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

#### Check Email Logs
- Check Vercel logs: `vercel logs --prod`
- Look for "Email send error" or "Email sent via Resend"
- Check Resend dashboard for delivery status

### Long-term Solutions

1. **Verify Custom Domain**
   - Add `nt-ca.com` or `ntca.com` domain in Resend
   - Configure DNS records
   - Update `EMAIL_CONFIG` to use verified domain

2. **Add Email Authentication**
   - SPF record
   - DKIM signature
   - DMARC policy

3. **Consider Alternative Verification**
   - SMS verification (for Kazakhstan users)
   - WhatsApp verification
   - Manual verification by admin

4. **Improve Email Content**
   - Avoid spam trigger words
   - Use plain text alternative
   - Ensure proper HTML structure

### Monitoring

- Set up Resend webhooks for delivery events
- Monitor bounce rates
- Track delivery rates by region
- Alert on high failure rates

### Code Changes Made

1. **Enhanced Logging** (`lib/email/email-service.js`)
   - Added detailed error logging
   - Log Resend message IDs
   - Log from domain and recipient

2. **Better Error Messages** (`api/auth/send-verification.js`)
   - Added diagnostic information
   - Include recommendations in error responses
   - Log email sending attempts

3. **Diagnostic Endpoint** (`api/email/diagnose.js`)
   - Test email delivery
   - Check configuration
   - Get recommendations

### Next Steps

1. Check Resend dashboard for the Kazakhstan user's email
2. Verify if email was sent but not delivered
3. Consider verifying custom domain if not already done
4. Add user-facing message about checking spam folder
5. Consider SMS verification as fallback for Kazakhstan

