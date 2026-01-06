#!/usr/bin/env node

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🔍 NTCA Authentication Debug Tool');
console.log('==================================\n');

// Check local environment
function checkLocalEnvironment() {
  console.log('📁 Local Environment Check:');

  const envPath = path.join(__dirname, '.env');
  const envExists = fs.existsSync(envPath);

  console.log(`   .env file exists: ${envExists ? '✅' : '❌'}`);

  if (envExists) {
    try {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));

      const checkVar = (varName, minLength = 0) => {
        const line = lines.find(l => l.startsWith(`${varName}=`));
        if (!line) return { exists: false, length: 0 };

        const value = line.split('=')[1] || '';
        return {
          exists: true,
          length: value.length,
          isPlaceholder: value.includes('your_') || value.includes('xxxxx')
        };
      };

      const jwtSecret = checkVar('JWT_SECRET', 32);
      const dbUrl = checkVar('DATABASE_URL');
      const stripeKey = checkVar('STRIPE_SECRET_KEY');

      console.log(`   JWT_SECRET: ${jwtSecret.exists ? '✅' : '❌'} ${jwtSecret.exists ? `(${jwtSecret.length} chars${jwtSecret.length < 32 ? ' - TOO SHORT!' : ''})` : ''}`);
      console.log(`   DATABASE_URL: ${dbUrl.exists ? '✅' : '❌'}`);
      console.log(`   STRIPE_SECRET_KEY: ${stripeKey.exists ? '✅' : '❌'}`);

      if (jwtSecret.isPlaceholder) {
        console.log('   ⚠️  JWT_SECRET appears to be a placeholder value');
      }

    } catch (error) {
      console.log(`   ❌ Error reading .env file: ${error.message}`);
    }
  }

  console.log('');
}

// Check if running on local development server
function checkLocalServer() {
  return new Promise((resolve) => {
    console.log('🌐 Local Server Check:');

    const req = http.request({
      hostname: 'localhost',
      port: 5173, // Vite default port
      path: '/api/health',
      method: 'GET',
      timeout: 3000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const health = JSON.parse(data);
          console.log(`   Local server: ✅ Running (port 5173)`);
          console.log(`   Health status: ${health.status === 'ok' ? '✅' : '❌'} ${health.status}`);

          if (health.environment) {
            console.log(`   JWT configured: ${health.environment.jwtSecretConfigured ? '✅' : '❌'}`);
            console.log(`   JWT secure: ${health.environment.jwtSecretSecure ? '✅' : '❌'}`);
          }

          if (health.warnings && health.warnings.length > 0) {
            console.log('   ⚠️  Warnings:');
            health.warnings.forEach(warning => console.log(`      - ${warning}`));
          }
        } catch (e) {
          console.log(`   ❌ Invalid health check response`);
        }
        console.log('');
        resolve();
      });
    });

    req.on('error', () => {
      console.log(`   ❌ Local server not running on port 5173`);
      console.log('   💡 Start your dev server with: npm run dev');
      console.log('');
      resolve();
    });

    req.on('timeout', () => {
      console.log(`   ❌ Local server timeout`);
      console.log('');
      req.destroy();
      resolve();
    });

    req.end();
  });
}

// Check production server
function checkProductionServer() {
  return new Promise((resolve) => {
    console.log('☁️  Production Server Check:');

    // Try to detect Vercel URL from .vercel directory or ask user
    let productionUrl = 'ntca.vercel.app'; // Default from the logs

    try {
      const vercelPath = path.join(__dirname, '.vercel', 'project.json');
      if (fs.existsSync(vercelPath)) {
        const project = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
        if (project.projectId) {
          // This is a guess - user should replace with actual URL
          console.log(`   💡 Detected Vercel project: ${project.projectId}`);
        }
      }
    } catch (e) {
      // Ignore
    }

    const req = https.request({
      hostname: productionUrl,
      path: '/api/health',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const health = JSON.parse(data);
          console.log(`   Production server: ✅ Accessible (${productionUrl})`);
          console.log(`   Health status: ${health.status === 'ok' ? '✅' : '❌'} ${health.status}`);

          if (health.environment) {
            console.log(`   JWT configured: ${health.environment.jwtSecretConfigured ? '✅' : '❌'}`);
            console.log(`   JWT secure: ${health.environment.jwtSecretSecure ? '✅' : '❌'}`);
            console.log(`   Environment: ${health.environment.variables.NODE_ENV}`);
          }

          if (health.warnings && health.warnings.length > 0) {
            console.log('   ⚠️  Production Warnings:');
            health.warnings.forEach(warning => console.log(`      - ${warning}`));
          }
        } catch (e) {
          console.log(`   ❌ Invalid production health check response`);
        }
        console.log('');
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log(`   ❌ Cannot reach production server: ${error.message}`);
      console.log(`   💡 Check if ${productionUrl} is the correct URL`);
      console.log('');
      resolve();
    });

    req.on('timeout', () => {
      console.log(`   ❌ Production server timeout`);
      console.log('');
      req.destroy();
      resolve();
    });

    req.end();
  });
}

// Check browser localStorage
function checkBrowserStorage() {
  console.log('💾 Browser Storage Check:');
  console.log('   Open browser DevTools and run:');
  console.log('   > localStorage.getItem("authToken")');
  console.log('   ');
  console.log('   If you see a token, check if it looks like a valid JWT:');
  console.log('   - Should have 3 parts separated by dots (xxx.yyy.zzz)');
  console.log('   - Should not be "undefined" or "null"');
  console.log('   ');
  console.log('   To clear a bad token:');
  console.log('   > localStorage.removeItem("authToken")');
  console.log('');
}

// Provide solutions
function provideSolutions() {
  console.log('🔧 Common Solutions:');
  console.log('');

  console.log('1. ❌ JWT_SECRET not configured in production:');
  console.log('   → Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
  console.log('   → Add: JWT_SECRET = (generate with: openssl rand -hex 32)');
  console.log('   → Redeploy your application');
  console.log('');

  console.log('2. ❌ "JWT malformed" errors:');
  console.log('   → Clear browser localStorage: localStorage.removeItem("authToken")');
  console.log('   → Try registering again');
  console.log('   → Check that JWT_SECRET is properly set in production');
  console.log('');

  console.log('3. ❌ Registration fails with 400 errors:');
  console.log('   → Check all required fields are filled');
  console.log('   → Ensure password is at least 8 characters');
  console.log('   → Verify email format is valid');
  console.log('');

  console.log('4. ❌ Session timeout immediately after registration:');
  console.log('   → This indicates JWT_SECRET is missing in production');
  console.log('   → Add JWT_SECRET to Vercel environment variables');
  console.log('   → Redeploy the application');
  console.log('');

  console.log('5. 🔄 Quick fix for current issues:');
  console.log('   → Run: node setup-auth.js (to setup local environment)');
  console.log('   → Add JWT_SECRET to Vercel (minimum 32 characters)');
  console.log('   → Clear browser cache and localStorage');
  console.log('   → Try registration again');
  console.log('');
}

// Generate JWT secret
function generateJWTSecret() {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}

// Main execution
async function main() {
  checkLocalEnvironment();
  await checkLocalServer();
  await checkProductionServer();
  checkBrowserStorage();
  provideSolutions();

  console.log('🎯 Quick Actions:');
  console.log('');
  console.log('Generate new JWT_SECRET:');
  console.log(`   ${generateJWTSecret()}`);
  console.log('');
  console.log('Test registration after fixes:');
  console.log('   1. Clear browser localStorage');
  console.log('   2. Go to /signup');
  console.log('   3. Register as teacher (free registration)');
  console.log('   4. Check browser console for errors');
  console.log('');
  console.log('📞 Still having issues?');
  console.log('   → Check browser DevTools Console for specific errors');
  console.log('   → Check Vercel Functions logs for server-side errors');
  console.log('   → Ensure all environment variables are deployed');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkLocalEnvironment, checkLocalServer, checkProductionServer };
