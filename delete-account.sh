#!/bin/bash

# Script to delete a user account using the admin API
# Usage: ./delete-account.sh <email>

set -e

EMAIL="${1:-georgepierce@hotmail.co.uk}"

# Read admin token from a local gitignored file.
# Create `./.admin-token` containing ONLY the token value (no quotes, no whitespace).
# This avoids hardcoding secrets in the repository.
TOKEN_FILE=".admin-token"
if [ ! -f "$TOKEN_FILE" ]; then
  echo "❌ Error: $TOKEN_FILE not found."
  echo "Create $TOKEN_FILE and paste your ADMIN_DELETE_TOKEN (from Vercel) into it."
  exit 1
fi

# Strip whitespace/newlines
TOKEN="$(cat "$TOKEN_FILE" | tr -d '[:space:]')"
if [ -z "$TOKEN" ]; then
  echo "❌ Error: ADMIN_DELETE_TOKEN is empty in $TOKEN_FILE."
  exit 1
fi

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

