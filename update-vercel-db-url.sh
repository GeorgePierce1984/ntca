#!/bin/bash

# Script to update DATABASE_URL in Vercel
# New database connection string
NEW_DB_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-winter-sound-abyxdvv7-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"

cd "/Users/georgepierce/Desktop/Projects/ntca/ntca"
export PATH="$PWD/node-v20.11.0-darwin-x64/bin:$PATH"

echo "🔗 Updating DATABASE_URL in Vercel..."
echo ""
echo "New connection string:"
echo "$NEW_DB_URL"
echo ""
echo "⚠️  This will require interactive input."
echo "When prompted:"
echo "  1. Type 'y' to confirm"
echo "  2. Paste the connection string above"
echo "  3. Press Enter"
echo ""
read -p "Press Enter to continue..."

vercel env update DATABASE_URL production

echo ""
echo "✅ Update complete!"
echo "📝 Note: You may need to update Preview and Development environments separately"
echo "   Run: vercel env update DATABASE_URL preview"
echo "   Run: vercel env update DATABASE_URL development"

