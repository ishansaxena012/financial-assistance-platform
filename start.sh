#!/usr/bin/env bash
set -e

echo ""
echo "  🪔  Lakshmi Didi — starting up..."
echo ""

# ── Backend ─────────────────────────────────────────────
cd "$(dirname "$0")/backend"

if [ ! -d "node_modules" ]; then
  echo "  [backend] Installing npm packages..."
  npm install
fi

echo "  [backend] Starting Node.js on http://localhost:8000 ..."
npm run dev &
BACKEND_PID=$!

echo "  [backend] Waiting for backend to initialize..."
sleep 3

# ── Frontend ─────────────────────────────────────────────
cd "../frontend"

if [ ! -d "node_modules" ]; then
  echo "  [frontend] Installing npm packages..."
  npm install --silent
fi

echo "  [frontend] Starting Vite dev server on http://localhost:5173 ..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "  ✅  Both servers running."
echo "  🌐  Open: http://localhost:5173"
echo ""
echo "  Press Ctrl+C to stop both."
echo ""

# Graceful shutdown
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '  Stopped.'" SIGINT SIGTERM
wait
