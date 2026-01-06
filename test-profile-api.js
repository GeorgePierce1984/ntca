#!/usr/bin/env node
/**
 * Test script for the school profile API endpoint
 * 
 * Usage:
 *   node test-profile-api.js <your-auth-token>
 * 
 * Or get token from browser console:
 *   localStorage.getItem("authToken")
 */

const token = process.argv[2];

if (!token) {
  console.error("❌ Error: Auth token required");
  console.log("\nUsage: node test-profile-api.js <your-auth-token>");
  console.log("\nTo get your token:");
  console.log("  1. Open browser console on your site");
  console.log("  2. Run: localStorage.getItem('authToken')");
  console.log("  3. Copy the token and run this script");
  process.exit(1);
}

const API_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}/api/schools/profile`
  : "http://localhost:3000/api/schools/profile";

console.log("🔍 Testing School Profile API");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(`URL: ${API_URL}`);
console.log(`Token: ${token.substring(0, 20)}...`);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

fetch(API_URL, {
  method: "GET",
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  },
})
  .then(async (response) => {
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Headers:`, Object.fromEntries(response.headers.entries()));
    console.log("\n");

    const text = await response.text();
    let data;
    
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("❌ Response is not valid JSON:");
      console.log(text);
      return;
    }

    if (response.ok) {
      console.log("✅ Success!");
      console.log("\nResponse data:");
      console.log(JSON.stringify(data, null, 2));
      
      if (data.school) {
        console.log("\n📊 Profile Summary:");
        console.log(`   School Name: ${data.school.name}`);
        console.log(`   Profile Complete: ${data.school.profileComplete}`);
        console.log(`   Completion: ${data.school.completionPercentage}%`);
        console.log(`   Subscription Status: ${data.subscriptionStatus || "N/A"}`);
      }
    } else {
      console.error("❌ Error Response:");
      console.log(JSON.stringify(data, null, 2));
    }
  })
  .catch((error) => {
    console.error("❌ Request failed:");
    console.error(error.message);
    if (error.stack) {
      console.error("\nStack trace:");
      console.error(error.stack);
    }
  });

