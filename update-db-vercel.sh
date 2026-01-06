#!/bin/bash

# Update DATABASE_URL in Vercel
# New database connection string
NEW_DB_URL="postgresql://neondb_owner:REDACTED@ep-winter-sound-abyxdvv7-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"

cd "/Users/georgepierce/Desktop/Projects/ntca/ntca"
export PATH="$PWD/node-v20.11.0-darwin-x64/bin:$PATH"

echo "🔗 Updating DATABASE_URL in Vercel..."
echo ""
echo "📋 New Database URL:"
echo "$NEW_DB_URL"
echo ""
echo "⚠️  This requires manual input. Please follow these steps:"
echo ""
echo "1. The command will prompt: 'Are you sure? (y/N)'"
echo "   → Type: y"
echo ""
echo "2. The command will prompt: 'What's the new value' or 'new value of DATABASE_URL'"
echo "   → Paste this exact string:"
echo ""
echo "$NEW_DB_URL"
echo ""
echo "3. Press Enter"
echo ""
echo "Starting update command..."
echo ""

# Run the update command
vercel env update DATABASE_URL production

echo ""
echo "✅ If successful, the DATABASE_URL has been updated!"
echo ""
echo "📝 Next steps:"
echo "   1. Update Preview environment: vercel env update DATABASE_URL preview"
echo "   2. Update Development environment: vercel env update DATABASE_URL development"
echo "   3. Redeploy your application: vercel --prod"
echo ""

