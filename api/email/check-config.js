/**
 * Check email service configuration
 * GET /api/email/check-config
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const config = {
    resendApiKeyConfigured: !!process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your-resend-api-key',
    resendApiKeyLength: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.trim().length : 0,
    resendApiKeyPrefix: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.trim().substring(0, 5) : 'none',
    fromEmail: (process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev').trim(),
    fromName: (process.env.EMAIL_FROM_NAME || 'NTCA Platform').trim(),
    nodeEnv: process.env.NODE_ENV || 'production',
  };

  // Check if API key looks valid (should start with 're_')
  const isValidFormat = config.resendApiKeyConfigured && process.env.RESEND_API_KEY.startsWith('re_');

  return res.status(200).json({
    configured: config.resendApiKeyConfigured && isValidFormat,
    details: {
      ...config,
      isValidFormat,
      issue: !config.resendApiKeyConfigured 
        ? 'RESEND_API_KEY is not set in environment variables'
        : !isValidFormat
        ? 'RESEND_API_KEY does not appear to be a valid Resend API key (should start with "re_")'
        : 'Email service appears to be configured correctly',
    },
    recommendations: !config.resendApiKeyConfigured || !isValidFormat
      ? [
          'Go to https://resend.com and create/get your API key',
          'Add RESEND_API_KEY to Vercel environment variables',
          'Make sure the key starts with "re_"',
          'Redeploy after adding the key',
        ]
      : [
          'Configuration looks correct',
          'If emails still not sending, check Resend dashboard for delivery status',
          'Check Vercel logs for email sending errors',
        ],
  });
}

