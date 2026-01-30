import { emailHelpers } from '../../lib/email/email-service.js';

/**
 * Diagnostic endpoint to test email delivery
 * Usage: POST /api/email/diagnose
 * Body: { email: "user@example.com", testType: "verification" }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { email, testType = 'verification' } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check Resend API key
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your-resend-api-key') {
      return res.status(500).json({
        error: 'RESEND_API_KEY not configured',
        diagnostic: {
          apiKeyConfigured: false,
          fromDomain: process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev',
          issue: 'Email service not configured. Please set RESEND_API_KEY in Vercel environment variables.',
        },
      });
    }

    // Generate test code
    const testCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Send test email
    const result = await emailHelpers.sendVerificationEmail(email, testCode);

    if (!result.success) {
      return res.status(500).json({
        error: 'Failed to send email',
        diagnostic: {
          apiKeyConfigured: true,
          fromDomain: process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev',
          resendError: result.error,
          issue: 'Email sending failed. Check Resend dashboard for delivery status.',
          recommendations: [
            'Check Resend dashboard for email delivery status',
            'Verify RESEND_API_KEY is correct',
            'Check if using test domain (onboarding@resend.dev) - Gmail may filter these',
            'Consider verifying a custom domain in Resend for better deliverability',
            'Check spam folder - emails from test domains often go to spam',
          ],
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Test email sent successfully',
      diagnostic: {
        apiKeyConfigured: true,
        fromDomain: process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev',
        messageId: result.messageId,
        emailSent: true,
        recommendations: [
          'Check inbox (and spam folder) for the verification email',
          'If not received, check Resend dashboard for delivery status',
          'Gmail may filter emails from test domains (onboarding@resend.dev)',
          'Consider verifying a custom domain in Resend for better deliverability to Gmail',
          'For Kazakhstan users, emails may take longer or be filtered more aggressively',
        ],
      },
    });
  } catch (error) {
    console.error('Email diagnostic error:', error);
    return res.status(500).json({
      error: 'Diagnostic failed',
      diagnostic: {
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
    });
  }
}

