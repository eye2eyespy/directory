#!/usr/bin/env bash
set -euo pipefail
npm ci
npx prisma generate
npx prisma db push
npm run build
echo "Build complete. Start with: npm start  or  docker compose up -d"
