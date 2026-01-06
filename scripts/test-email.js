#!/usr/bin/env node

import { Resend } from 'resend';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });
dotenv.config({ path: join(__dirname, '../.env.local') });

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY || 'your-resend-api-key');

// Test email template
const testEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #2563eb; margin: 0;">NTCA Email System Test</h1>
    </div>

    <p style="color: #4b5563; line-height: 1.6;">
      Hello Chris,
    </p>

    <p style="color: #4b5563; line-height: 1.6;">
      This is a test email from the NTCA platform to verify that the email system is working correctly with your Resend configuration.
    </p>

    <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 20px; margin: 30px 0;">
      <h3 style="color: #1e40af; margin-top: 0;">Configuration Details:</h3>
      <p style="color: #4b5563; margin: 5px 0;"><strong>API Key:</strong> ${process.env.RESEND_API_KEY ? 'Configured ✓' : 'Not configured ✗'}</p>
      <p style="color: #4b5563; margin: 5px 0;"><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
      <p style="color: #4b5563; margin: 5px 0;"><strong>Environment:</strong> ${process.env.NODE_ENV || 'production'}</p>
    </div>

    <div style="background: #dcfce7; border: 1px solid #86efac; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="color: #166534; margin: 0; font-weight: bold;">✅ If you're reading this, the email system is working!</p>
    </div>

    <div style="background: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #1f2937; margin-top: 0;">Available Email Templates:</h3>
      <ul style="color: #4b5563; line-height: 1.8;">
        <li><strong>teacherWelcome</strong> - Welcome email for new teachers</li>
        <li><strong>schoolWelcome</strong> - Welcome email for new schools</li>
        <li><strong>applicationReceived</strong> - Notification when school receives application</li>
        <li><strong>applicationStatusUpdate</strong> - Updates for teachers on their applications</li>
        <li><strong>passwordReset</strong> - Password reset links</li>
        <li><strong>subscriptionChanged</strong> - Subscription updates for schools</li>
        <li><strong>jobAlert</strong> - New job notifications for teachers</li>
      </ul>
    </div>

    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px;">
        Next steps: Update your domain settings in Resend and configure the production environment variables.
      </p>
      <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
        © ${new Date().getFullYear()} National Teaching Certification Authority. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`;

// Get email from command line or use default
const recipientEmail = process.argv[2] || 'chris.rogers@nt-ca.com';

console.log('🚀 NTCA Email Test Script');
console.log('========================\n');

// Check configuration
if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your-resend-api-key') {
  console.log('❌ ERROR: RESEND_API_KEY is not configured');
  console.log('\nPlease set your Resend API key in the .env file:');
  console.log('RESEND_API_KEY=re_YOUR_API_KEY_HERE\n');
  process.exit(1);
}

console.log(`📧 Sending test email to: ${recipientEmail}`);
console.log(`🔑 Using API key: ${process.env.RESEND_API_KEY.substring(0, 10)}...`);
console.log(`🌐 Environment: ${process.env.NODE_ENV || 'production'}\n`);

// Send test email
async function sendTestEmail() {
  try {
    const data = await resend.emails.send({
      from: 'NTCA Platform <onboarding@resend.dev>', // Use Resend's test domain initially
      to: [recipientEmail],
      subject: 'NTCA Email System Test - ' + new Date().toLocaleString(),
      html: testEmailHtml,
    });

    console.log('✅ SUCCESS! Email sent successfully');
    console.log(`📨 Message ID: ${data.id}`);
    console.log('\n✨ Email system is working correctly!');
    console.log('\nNext steps:');
    console.log('1. Check your inbox for the test email');
    console.log('2. Verify your domain in Resend dashboard');
    console.log('3. Update the from address to use your domain');
    console.log('4. Configure production environment variables');

  } catch (error) {
    console.error('❌ ERROR: Failed to send email');
    console.error(`📝 Error details: ${error.message}`);

    if (error.message.includes('domain')) {
      console.log('\n💡 Tip: Make sure to verify your domain in the Resend dashboard');
    }
    if (error.message.includes('API')) {
      console.log('\n💡 Tip: Check that your API key is valid and has sending permissions');
    }

    process.exit(1);
  }
}

// Run the test
sendTestEmail();
