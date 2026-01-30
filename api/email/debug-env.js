/**
 * Debug endpoint to check environment variables (for troubleshooting)
 * GET /api/email/debug-env
 * 
 * WARNING: This exposes environment variable names/prefixes - use only for debugging
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Only allow in development or with admin token
  const adminToken = req.headers['x-admin-token'];
  const isDev = process.env.NODE_ENV === 'development';
  
  if (!isDev && adminToken !== process.env.ADMIN_DELETE_TOKEN) {
    return res.status(403).json({ error: 'Unauthorized - use /api/email/check-config for production' });
  }

  const envVars = {
    RESEND_API_KEY: {
      exists: !!process.env.RESEND_API_KEY,
      length: process.env.RESEND_API_KEY?.length || 0,
      prefix: process.env.RESEND_API_KEY?.substring(0, 5) || 'none',
      value: process.env.RESEND_API_KEY || 'NOT SET',
    },
    EMAIL_FROM_ADDRESS: {
      exists: !!process.env.EMAIL_FROM_ADDRESS,
      value: process.env.EMAIL_FROM_ADDRESS || 'NOT SET (using fallback: onboarding@resend.dev)',
      trimmed: (process.env.EMAIL_FROM_ADDRESS || '').trim(),
      hasNewline: process.env.EMAIL_FROM_ADDRESS?.includes('\n') || false,
    },
    EMAIL_FROM_NAME: {
      exists: !!process.env.EMAIL_FROM_NAME,
      value: process.env.EMAIL_FROM_NAME || 'NOT SET (using fallback: NTCA Platform)',
      trimmed: (process.env.EMAIL_FROM_NAME || '').trim(),
    },
    EMAIL_REPLY_TO: {
      exists: !!process.env.EMAIL_REPLY_TO,
      value: process.env.EMAIL_REPLY_TO || 'NOT SET (using fallback: onboarding@resend.dev)',
      trimmed: (process.env.EMAIL_REPLY_TO || '').trim(),
    },
    NODE_ENV: process.env.NODE_ENV || 'not set',
    VERCEL_ENV: process.env.VERCEL_ENV || 'not set',
  };

  return res.status(200).json({
    message: 'Environment variable debug info',
    envVars,
    recommendations: !envVars.EMAIL_FROM_ADDRESS.exists
      ? [
          'EMAIL_FROM_ADDRESS is not set in Vercel Production environment',
          'Go to Vercel → Settings → Environment Variables',
          'Add EMAIL_FROM_ADDRESS = noreply@nt-ca.com',
          'Make sure Production checkbox is selected',
          'Redeploy after adding',
        ]
      : envVars.EMAIL_FROM_ADDRESS.value.includes('onboarding@resend.dev')
      ? [
          'EMAIL_FROM_ADDRESS is set but still using test domain',
          'Update to noreply@nt-ca.com in Vercel',
          'Redeploy after updating',
        ]
      : ['Environment variables look correct'],
  });
}

