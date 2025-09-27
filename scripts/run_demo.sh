#!/usr/bin/env bash
set -euo pipefail

# NotiVet one-command demo starter (macOS)
# - Requires: Docker Desktop running, ngrok installed and authenticated (ngrok config add-authtoken ...)
# - Starts Docker Postgres on host port 6543
# - Runs Prisma generate/push/seed
# - Starts Next.js production server on 127.0.0.1:3000
# - Starts ngrok and prints the public HTTPS URL

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

log() { echo "[demo] $*"; }

# Check Docker
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required. Please install Docker Desktop and try again." >&2
  exit 1
fi
if ! docker info >/dev/null 2>&1; then
  echo "Docker daemon is not running. Please start Docker Desktop and re-run this script." >&2
  exit 1
fi

# Ensure .env exists with DATABASE_URL; Next.js/Prisma reads it
if [ ! -f .env ]; then
  cat >&2 <<EOF
.warning: .env not found. Create .env with at least:
  DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:6543/notivet?schema=public
  JWT_SECRET=<random string>
  NEXTAUTH_SECRET=<random string>
EOF
fi

# Start or create Postgres container (mapped to host 6543 to avoid local 5432 conflicts)
if ! docker ps -a --format '{{.Names}}' | grep -qx notivet-postgres; then
  log "Creating postgres container notivet-postgres (host port 6543)"
  docker run -d --name notivet-postgres \
    -e POSTGRES_PASSWORD=postgres \
    -e POSTGRES_DB=notivet \
    -p 6543:5432 \
    postgres:16 >/dev/null
else
  log "Starting postgres container notivet-postgres"
  docker start notivet-postgres >/dev/null || true
fi

# Wait until Postgres is ready
log "Waiting for postgres to be ready..."
until docker exec notivet-postgres pg_isready -U postgres >/dev/null 2>&1; do
  sleep 1
done

# Prisma: generate, push schema, seed demo data
log "Running Prisma generate/push/seed"
npm run -s db:generate
npm run -s db:push
npm run -s db:seed

# Start Next.js server if not already listening on 3000
HOST=127.0.0.1
PORT=3000
if lsof -iTCP:${PORT} -sTCP:LISTEN -nP >/dev/null 2>&1; then
  log "Next.js already running on ${HOST}:${PORT}"
else
  log "Starting Next.js on ${HOST}:${PORT} (logs: /tmp/notivet-start.log)"
  nohup npm run start -- --hostname ${HOST} --port ${PORT} >/tmp/notivet-start.log 2>&1 &
  for i in {1..30}; do
    if curl -sSf http://${HOST}:${PORT} >/dev/null 2>&1; then break; fi
    sleep 1
  done
fi

# Start ngrok and print the public URL
if ! command -v ngrok >/dev/null 2>&1; then
  echo "ngrok is required. Install: brew install ngrok/ngrok/ngrok and run: ngrok config add-authtoken <token>" >&2
  exit 1
fi

if ! pgrep -f "ngrok http 3000" >/dev/null 2>&1; then
  log "Starting ngrok (logs: /tmp/ngrok.log)"
  nohup ngrok http 3000 --log=stdout >/tmp/ngrok.log 2>&1 &
  # Wait for ngrok API
  for i in {1..30}; do
    if curl -s localhost:4040/api/tunnels >/dev/null 2>&1; then break; fi
    sleep 1
  done
fi

PUBLIC_URL=$(curl -s localhost:4040/api/tunnels | sed -n 's/.*"public_url":"\(https:[^"]*\)".*/\1/p' | head -n1)
if [ -z "${PUBLIC_URL}" ]; then
  echo "Could not obtain ngrok public URL. Check /tmp/ngrok.log" >&2
  exit 1
fi

log "Demo is live at: ${PUBLIC_URL}"
cat <<EOF

Open this URL on both laptops:
  ${PUBLIC_URL}

Demo users:
  Pharma: contact@pharmaco.com / password123
  HCP:    dr.smith@vetclinic.com / password123

To stop:
  docker stop notivet-postgres   # stops DB (or docker rm -f notivet-postgres to remove)
  pkill -f "ngrok http 3000"     # stops ngrok
  pkill -f "next start --hostname ${HOST} --port ${PORT}"  # stops Next.js
EOF
