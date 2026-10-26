#!/usr/bin/env bash
set -euo pipefail
npm install
npx prisma db push
npx tsx prisma/seed.ts
echo "Install complete. Run: npm run dev"
echo "CMS login: admin@local / changeme"
