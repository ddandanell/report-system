#!/bin/bash
# PTB Session Tracker — First-time setup
# bash setup.sh

set -e
echo ""
echo "🌿 Private Tutoring Bali — Session Tracker Setup"
echo "=================================================="
echo ""

cd "$(dirname "$0")"

echo "📦 Installing dependencies (this takes ~1 minute)…"
npm install

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "Next steps:"
echo "  1. Open .env.local and paste your Neon DATABASE_URL"
echo "  2. Run: npm run seed"
echo "  3. Run: npm run dev"
echo ""
echo "🌐 Then open: http://localhost:3000"
echo ""
echo "👤 Admin login:"
echo "   Username: admin"
echo "   Password: ptb2024admin"
echo ""
