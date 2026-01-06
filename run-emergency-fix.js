#!/usr/bin/env node

// Emergency Database Fix Runner
// This script runs the emergency database fix endpoint to add missing columns

const https = require('https');

const PRODUCTION_URL = 'https://ntca.vercel.app';
const INTERNAL_API_KEY = 'internal_237abfa041067044b2b37180136b562cba4b904e6a7ba2757cde7217';

console.log('🚨 Running Emergency Database Fix...');
console.log('=====================================');
console.log('Target:', PRODUCTION_URL);
console.log('Time:', new Date().toISOString());
console.log('');

const postData = JSON.stringify({});

const options = {
  hostname: 'ntca.vercel.app',
  path: '/api/emergency-db-fix',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Authorization': `Bearer ${INTERNAL_API_KEY}`
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response Status:', res.statusCode);
    console.log('');

    try {
      const result = JSON.parse(data);

      if (res.statusCode === 200) {
        console.log('✅ Emergency fix completed successfully!');
        console.log('');
        console.log('Results:');
        console.log('--------');

        if (result.results) {
          result.results.forEach((r, index) => {
            console.log(`${index + 1}. ${r.query}`);
            console.log(`   Status: ${r.status}`);
            if (r.rows !== undefined) {
              console.log(`   Rows affected: ${r.rows}`);
            }
            if (r.error) {
              console.log(`   Error: ${r.error}`);
            }
            console.log('');
          });
        }

        if (result.schemaTest) {
          console.log('Schema Test:', result.schemaTest.status);
          if (result.schemaTest.message) {
            console.log('Message:', result.schemaTest.message);
          }
        }

        console.log('');
        console.log('🎉 Database schema is now fixed!');
        console.log('Users should be able to register and login successfully.');

      } else if (res.statusCode === 401) {
        console.error('❌ Unauthorized: Internal API key is incorrect or not set');
        console.error('Make sure INTERNAL_API_KEY is set in Vercel environment variables');
      } else {
        console.error('❌ Emergency fix failed');
        console.error('Response:', result);
      }
    } catch (error) {
      console.error('❌ Failed to parse response');
      console.error('Raw response:', data);
      console.error('Error:', error.message);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed');
  console.error('Error:', error.message);
  console.error('');
  console.error('Troubleshooting:');
  console.error('1. Check your internet connection');
  console.error('2. Verify the production URL is correct');
  console.error('3. Make sure the deployment is complete');
});

// Send the request
req.write(postData);
req.end();

console.log('Sending request to fix database schema...');
console.log('This may take a few seconds...');
console.log('');
