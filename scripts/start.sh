#!/bin/sh
set -e

PORT="${PORT:-8080}"

echo ""
echo "  ███████╗██╗      ██████╗ ███████╗ ██████╗███████╗███╗   ██╗████████╗"
echo "  ██╔════╝██║     ██╔═══██╗██╔════╝██╔════╝██╔════╝████╗  ██║╚══██╔══╝"
echo "  █████╗  ██║     ██║   ██║███████╗██║     █████╗  ██╔██╗ ██║   ██║   "
echo "  ██╔══╝  ██║     ██║   ██║╚════██║██║     ██╔══╝  ██║╚██╗██║   ██║   "
echo "  ██║     ███████╗╚██████╔╝███████║╚██████╗███████╗██║ ╚████║   ██║   "
echo "  ╚═╝     ╚══════╝ ╚═════╝ ╚══════╝ ╚═════╝╚══════╝╚═╝  ╚═══╝   ╚═╝   "
echo ""
echo "  Luxury Perfume Vending Machine Platform"
echo "  Port: $PORT"
echo ""

# ── 1. Generate Prisma client ──────────────────────────────────────────────
echo "[ 1/4 ] Generating Prisma client..."
npx prisma generate

# ── 2. Run database migrations ────────────────────────────────────────────
echo "[ 2/4 ] Running database migrations..."
if [ -d "prisma/migrations" ]; then
  npx prisma migrate deploy
else
  # Fallback: push schema directly (no migration history)
  npx prisma db push --skip-generate --accept-data-loss
fi

# ── 3. Seed database (upsert-based – safe on every boot) ─────────────────
echo "[ 3/4 ] Seeding database..."
npx tsx prisma/seed.ts || echo "        ℹ  Seeding skipped"

# ── 4. Build if .next directory is missing ────────────────────────────────
if [ ! -f ".next/BUILD_ID" ]; then
  echo "[ 4/4 ] Building application (first run)..."
  npm run build
  echo "        ✓ Build complete"
else
  echo "[ 4/4 ] Using existing build ✓"
fi

# ── 5. Start ──────────────────────────────────────────────────────────────
echo ""
echo "  ✓ Ready – http://0.0.0.0:$PORT"
echo ""
exec node_modules/.bin/next start -p "$PORT" -H "0.0.0.0"
