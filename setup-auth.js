#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🔧 NTCA Authentication Setup Script');
console.log('=====================================\n');

// Generate a secure JWT secret
const generateJWTSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

console.log('📋 Environment Setup Status:');
console.log(`   .env file exists: ${envExists ? '✅' : '❌'}`);

if (!envExists) {
  console.log('\n⚠️  No .env file found. Creating one for you...');

  const jwtSecret = generateJWTSecret();

  const envTemplate = `# Authentication & Security
JWT_SECRET=${jwtSecret}

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/ntca_db

# Stripe Configuration (Replace with your actual keys)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Price IDs for School Plans (Replace with your actual price IDs)
VITE_STRIPE_BASIC_MONTHLY_USD=price_your_basic_monthly_price_id
VITE_STRIPE_BASIC_ANNUAL_USD=price_your_basic_annual_price_id
VITE_STRIPE_STANDARD_MONTHLY_USD=price_your_standard_monthly_price_id
VITE_STRIPE_STANDARD_ANNUAL_USD=price_your_standard_annual_price_id
VITE_STRIPE_PREMIUM_MONTHLY_USD=price_your_premium_monthly_price_id
VITE_STRIPE_PREMIUM_ANNUAL_USD=price_your_premium_annual_price_id
`;

  try {
    fs.writeFileSync(envPath, envTemplate);
    console.log('✅ Created .env file with secure JWT secret');
    console.log(`   JWT_SECRET: ${jwtSecret}`);
  } catch (error) {
    console.error('❌ Failed to create .env file:', error.message);
  }
} else {
  // Check existing .env file for JWT_SECRET
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasJWTSecret = envContent.includes('JWT_SECRET=') && !envContent.includes('JWT_SECRET=your_super_secure');

    console.log(`   JWT_SECRET configured: ${hasJWTSecret ? '✅' : '❌'}`);

    if (!hasJWTSecret) {
      console.log('\n🔑 Generating new JWT secret...');
      const newJWTSecret = generateJWTSecret();
      console.log(`   Add this to your .env file: JWT_SECRET=${newJWTSecret}`);

      // Try to add JWT_SECRET to existing .env
      if (!envContent.includes('JWT_SECRET=')) {
        const updatedContent = `# Authentication & Security\nJWT_SECRET=${newJWTSecret}\n\n${envContent}`;
        fs.writeFileSync(envPath, updatedContent);
        console.log('✅ Added JWT_SECRET to your .env file');
      } else {
        console.log('⚠️  JWT_SECRET exists but appears to be a placeholder. Please update it manually.');
      }
    }
  } catch (error) {
    console.error('❌ Failed to read .env file:', error.message);
  }
}

console.log('\n🚀 Next Steps:');
console.log('1. Update your .env file with actual Stripe keys and price IDs');
console.log('2. Configure your DATABASE_URL for your database');
console.log('3. For Vercel deployment, add ALL environment variables to your project settings:');
console.log('   https://vercel.com/dashboard → Your Project → Settings → Environment Variables');
console.log('\n📖 For detailed setup instructions, see ENV_SETUP.md');

console.log('\n🔒 Security Reminders:');
console.log('- Never commit your .env file to version control');
console.log('- Use different secrets for development and production');
console.log('- Keep your Stripe keys secure and use test keys for development');

// Check for common JWT authentication issues
console.log('\n🔍 Troubleshooting Authentication Issues:');
console.log('If you\'re experiencing "JWT malformed" or 401 errors:');
console.log('1. Ensure JWT_SECRET is set in both local .env and Vercel environment');
console.log('2. Redeploy your Vercel application after adding environment variables');
console.log('3. Clear browser localStorage and try registering again');
console.log('4. Check browser console for specific error messages');

console.log('\n✨ Setup complete! Run your application and try registering a new account.');
