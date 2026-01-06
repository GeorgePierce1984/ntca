import { emailHelpers, sendEmail } from '../../lib/email/email-service.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { template, email, testData } = req.body;

    // Basic validation
    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Security check - only allow in development or with special header
    const isAuthorized =
      process.env.NODE_ENV === 'development' ||
      req.headers['x-test-key'] === process.env.EMAIL_TEST_KEY ||
      email === 'chris.rogers@nt-ca.com'; // Allow testing for your email

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Unauthorized to send test emails' });
    }

    let result;

    // If specific template requested, use it
    if (template) {
      const sampleData = getSampleData(template);
      result = await sendEmail(template, email, { ...sampleData, ...testData });
    } else {
      // Send a simple test email
      result = await sendEmail('testEmail', email, {
        name: 'Test User',
        message: 'This is a test email from NTCA platform',
        timestamp: new Date().toISOString()
      });
    }

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Test email sent successfully',
        messageId: result.messageId,
        to: email,
        template: template || 'testEmail'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to send test email',
        details: result.error
      });
    }

  } catch (error) {
    console.error('Test email error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Sample data for different templates
function getSampleData(template) {
  const sampleData = {
    teacherWelcome: {
      firstName: 'John',
      lastName: 'Doe'
    },
    schoolWelcome: {
      schoolName: 'Test International School',
      planName: 'Premium Plan',
      jobLimit: 10
    },
    applicationReceived: {
      jobTitle: 'English Teacher',
      jobLocation: 'Almaty, Kazakhstan',
      teacherName: 'Jane Smith',
      teacherQualification: 'CELTA Certified',
      teacherExperience: '5',
      teacherLocation: 'London, UK',
      coverLetter: 'I am very interested in this position and believe my experience teaching English in international schools makes me an ideal candidate...'
    },
    applicationStatusUpdate: {
      teacherName: 'John',
      jobTitle: 'Senior English Teacher',
      schoolName: 'Almaty International School',
      status: 'INTERVIEW',
      note: 'We would like to schedule an interview with you next week.'
    },
    passwordReset: {
      name: 'John Doe',
      token: 'test-reset-token-123456'
    },
    subscriptionChanged: {
      schoolName: 'Test School',
      action: 'upgraded',
      planName: 'Premium Plan',
      jobLimit: '10',
      price: '$99',
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
    },
    jobAlert: {
      teacherName: 'Sarah',
      jobTitle: 'ESL Teacher',
      schoolName: 'Nur-Sultan Academy',
      location: 'Nur-Sultan, Kazakhstan',
      salary: '$2,500 - $3,500/month',
      jobType: 'Full-time',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      jobId: 'test-job-123'
    }
  };

  return sampleData[template] || {};
}

// Add test email template to the email service
export const testEmailTemplate = {
  subject: 'Test Email from NTCA Platform',
  html: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Email System Test</h1>
        </div>

        <p style="color: #4b5563; line-height: 1.6;">
          Hi ${data.name || 'there'},
        </p>

        <p style="color: #4b5563; line-height: 1.6;">
          This is a test email from the NTCA platform to verify that the email system is working correctly.
        </p>

        <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 20px; margin: 30px 0;">
          <h3 style="color: #1e40af; margin-top: 0;">Test Details:</h3>
          <p style="color: #4b5563; margin: 5px 0;"><strong>Timestamp:</strong> ${data.timestamp}</p>
          <p style="color: #4b5563; margin: 5px 0;"><strong>Environment:</strong> ${process.env.NODE_ENV || 'production'}</p>
          <p style="color: #4b5563; margin: 5px 0;"><strong>Message:</strong> ${data.message || 'Email system is operational'}</p>
        </div>

        <div style="background: #dcfce7; border: 1px solid #86efac; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="color: #166534; margin: 0; font-weight: bold;">✅ Email system is working!</p>
        </div>

        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
          If you received this email, it means the NTCA email system is configured correctly and working as expected.
        </p>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px;">
            This is an automated test email. Please do not reply.
          </p>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 10px;">
            © ${new Date().getFullYear()} National Teaching Certification Authority. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
};

// Usage examples in comments:
/*
// Test simple email:
POST /api/email/test
{
  "email": "your-email@example.com"
}

// Test specific template:
POST /api/email/test
{
  "email": "your-email@example.com",
  "template": "teacherWelcome"
}

// Test with custom data:
POST /api/email/test
{
  "email": "your-email@example.com",
  "template": "applicationReceived",
  "testData": {
    "jobTitle": "Custom Job Title",
    "teacherName": "Your Name"
  }
}
*/
