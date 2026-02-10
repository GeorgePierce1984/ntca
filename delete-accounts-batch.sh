#!/bin/bash

# Batch delete script for multiple accounts
# Usage: ./delete-accounts-batch.sh

set -e

# List of emails to delete
EMAILS=(
  "sarah.johnson@example.com"
  "ahmed.hassan@example.com"
  "chris@3-2-1.io"
  "chris@starsite.digital"
  "gp@gp.com"
  "chris2@starsite.digital"
  "dave1@dave.com"
  "dave@dave.com"
  "prospectfarmlivery@gmail.com"
  "geoff@geoff.com"
  "Henrypierce@henrypierce.com"
  "mynames@geoff.com"
  "chris@test.com"
  "simsail@hotmail.com"
  "p1test@hotmail.com"
  "germtest@hotmail.com"
  "trevtrev@hotmail.co.uk"
  "georgepierce@hotmail.cofy"
  "georgepierce@hotmail.corn"
)

# Read admin token from a local gitignored file.
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

echo "🗑️  Batch deleting ${#EMAILS[@]} accounts..."
echo ""

SUCCESS_COUNT=0
FAILED_COUNT=0
NOT_FOUND_COUNT=0

for EMAIL in "${EMAILS[@]}"; do
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔍 Processing: $EMAIL"
  
  # Make the API call
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "https://www.nt-ca.com/api/admin/delete-user" \
    -H "Content-Type: application/json" \
    -H "x-admin-token: $TOKEN" \
    -d "{\"email\":\"$EMAIL\",\"confirm\":\"DELETE:$EMAIL\"}")
  
  # Split response and HTTP code
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  
  if [ "$HTTP_CODE" -eq 200 ]; then
    # Check if account was actually found and deleted
    if echo "$BODY" | grep -q '"deleted".*"users":[1-9]'; then
      echo "✅ Deleted successfully"
      SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    elif echo "$BODY" | grep -q "No accounts found"; then
      echo "⚠️  No account found"
      NOT_FOUND_COUNT=$((NOT_FOUND_COUNT + 1))
    else
      echo "✅ Request completed (HTTP $HTTP_CODE)"
      SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    fi
  elif [ "$HTTP_CODE" -eq 401 ]; then
    echo "❌ Unauthorized - Check ADMIN_DELETE_TOKEN"
    FAILED_COUNT=$((FAILED_COUNT + 1))
  elif [ "$HTTP_CODE" -eq 400 ]; then
    echo "⚠️  Bad Request"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    FAILED_COUNT=$((FAILED_COUNT + 1))
  else
    echo "⚠️  HTTP $HTTP_CODE"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    FAILED_COUNT=$((FAILED_COUNT + 1))
  fi
  
  echo ""
  sleep 0.5  # Small delay between requests
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary:"
echo "   ✅ Deleted: $SUCCESS_COUNT"
echo "   ⚠️  Not found: $NOT_FOUND_COUNT"
echo "   ❌ Failed: $FAILED_COUNT"
echo "   📧 Total processed: ${#EMAILS[@]}"

