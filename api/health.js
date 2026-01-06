export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Check environment variables (without exposing sensitive values)
    const envChecks = {
      JWT_SECRET: !!process.env.JWT_SECRET,
      DATABASE_URL: !!process.env.DATABASE_URL,
      STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
      NODE_ENV: process.env.NODE_ENV || 'development'
    };

    // Check JWT_SECRET length for security
    const jwtSecretLength = process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0;
    const jwtSecretSecure = jwtSecretLength >= 32;

    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: {
        variables: envChecks,
        jwtSecretConfigured: envChecks.JWT_SECRET,
        jwtSecretSecure,
        jwtSecretLength: jwtSecretLength > 0 ? jwtSecretLength : 'not set'
      },
      warnings: [
        ...(envChecks.JWT_SECRET ? [] : ['JWT_SECRET is not configured']),
        ...(jwtSecretSecure ? [] : ['JWT_SECRET should be at least 32 characters']),
        ...(envChecks.DATABASE_URL ? [] : ['DATABASE_URL is not configured']),
        ...(envChecks.STRIPE_SECRET_KEY ? [] : ['STRIPE_SECRET_KEY is not configured'])
      ]
    });
  } catch (error) {
    console.error('Health check error:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
}
