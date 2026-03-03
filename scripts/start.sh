#!/bin/sh
set -e

PORT="${PORT:-8080}"
HOSTNAME="${HOSTNAME:-0.0.0.0}"

echo ""
echo "  ███████╗██╗      ██████╗ ███████╗ ██████╗███████╗███╗   ██╗████████╗"
echo "  ██╔════╝██║     ██╔═══██╗██╔════╝██╔════╝██╔════╝████╗  ██║╚══██╔══╝"
echo "  █████╗  ██║     ██║   ██║███████╗██║     █████╗  ██╔██╗ ██║   ██║   "
echo "  ██╔══╝  ██║     ██║   ██║╚════██║██║     ██╔══╝  ██║╚██╗██║   ██║   "
echo "  ██║     ███████╗╚██████╔╝███████║╚██████╗███████╗██║ ╚████║   ██║   "
echo "  ╚═╝     ╚══════╝ ╚═════╝ ╚══════╝ ╚═════╝╚══════╝╚═╝  ╚═══╝   ╚═╝   "
echo ""
echo "  Luxury Perfume Vending Machine Platform"
echo "  Listening on $HOSTNAME:$PORT"
echo ""

# ── 1. Generate Prisma client ──────────────────────────────────────────────
echo "[ 1/4 ] Generating Prisma client..."
npx prisma generate --silent 2>/dev/null || npx prisma generate

# ── 2. Push database schema (idempotent – safe on every start) ────────────
echo "[ 2/4 ] Syncing database schema..."
npx prisma db push --skip-generate --accept-data-loss 2>/dev/null || \
  npx prisma db push --skip-generate

# ── 3. Seed (upsert-based – skips existing records automatically) ─────────
echo "[ 3/4 ] Seeding database..."
npx tsx prisma/seed.ts || echo "        ℹ  Seeding skipped"

# ── 4. Build if .next directory is missing ────────────────────────────────
if [ ! -f ".next/BUILD_ID" ]; then
  echo "[ 4/4 ] Building application (first run – this takes ~60s)..."
  npm run build
  echo "        ✓ Build complete"
else
  echo "[ 4/4 ] Using existing build ✓"
fi

# ── 5. Start ──────────────────────────────────────────────────────────────
echo ""
echo "  ✓ Ready – http://$HOSTNAME:$PORT"
echo ""
exec node_modules/.bin/next start -p "$PORT" -H "$HOSTNAME"
