# Profile API Test Guide

## API Endpoint
**GET** `/api/schools/profile`

## Authentication
Requires Bearer token in Authorization header:
```
Authorization: Bearer <your-auth-token>
```

## How to Test

### Option 1: Browser Console
1. Open your site in browser
2. Open Developer Console (F12)
3. Run:
```javascript
fetch('/api/schools/profile', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

### Option 2: Using the Test Script
```bash
# Get your token from browser console:
# localStorage.getItem('authToken')

# Then run:
node test-profile-api.js <your-token>
```

### Option 3: Using curl
```bash
# Get token from browser console first
TOKEN="your-token-here"
curl -H "Authorization: Bearer $TOKEN" \
     https://your-site.vercel.app/api/schools/profile
```

## Expected Response (Success)
```json
{
  "school": {
    "id": "...",
    "name": "...",
    "profileComplete": true/false,
    "completionPercentage": 85,
    ...
  },
  "subscriptionStatus": "active",
  ...
}
```

## Common Errors
- **401**: Invalid or missing token
- **403**: User is not a SCHOOL type
- **404**: User not found
- **500**: Server error (check Vercel logs)
