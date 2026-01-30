#!/bin/bash

# Script to delete a user account using the admin API
# Usage: ./delete-account.sh <email>

set -e

EMAIL="${1:-georgepierce@hotmail.co.uk}"

# Hardcoded token for testing (TODO: Move to secure storage)
TOKEN="Sophia2013"

echo "🔍 Attempting to delete account: $EMAIL"
echo ""

# Make the API call
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "https://www.nt-ca.com/api/admin/delete-user" \
  -H "Content-Type: application/json" \
  -H "x-admin-token: $TOKEN" \
  -d "{\"email\":\"$EMAIL\",\"confirm\":\"DELETE:$EMAIL\"}")

# Split response and HTTP code
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

# Pretty print JSON response
echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"

# Check HTTP status
if [ "$HTTP_CODE" -eq 200 ]; then
  echo ""
  echo "✅ Request completed successfully (HTTP $HTTP_CODE)"
elif [ "$HTTP_CODE" -eq 401 ]; then
  echo ""
  echo "❌ Unauthorized (HTTP $HTTP_CODE) - Check your ADMIN_DELETE_TOKEN"
elif [ "$HTTP_CODE" -eq 400 ]; then
  echo ""
  echo "⚠️  Bad Request (HTTP $HTTP_CODE) - Check the email or confirmation string"
else
  echo ""
  echo "⚠️  Request completed with HTTP $HTTP_CODE"
fi

