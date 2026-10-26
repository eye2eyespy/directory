# Directory Platform

Reusable local business directory. Build the engine once, then configure industry, city, brand, and domain without rewriting the app.

Roofing contractors are the first **configured** vertical. They are not hard-coded into application logic.

## Stack

Next.js App Router · TypeScript · Tailwind CSS · Prisma · SQLite (local) / PostgreSQL (Docker) · Auth.js · Leaflet maps · Stripe-ready packages · CSV/Excel import

## Local setup (Windows)

No Docker or PostgreSQL is required for local development.

```bat
cd C:\Users\WORKSTATION\Projects\directory
npm install
npm run setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

CMS: [http://localhost:3000/login](http://localhost:3000/login)

| | |
|---|---|
| Email | `admin@local` |
| Password | `changeme` |

## What this MVP proves

CMS → create/import business → listing → search + map → business profile → Featured/Sponsored toggle → publish.

## URL map

- `/` homepage (configurable branding)
- `/search` split list + map
- `/roofers` industry
- `/roofers/florida` state
- `/roofers/florida/orlando` city
- `/roofers/florida/sarasota/gmr-metal-roofs-florida` profile
- `/categories/metal-roofing`
- `/cities/orlando-fl`
- `/blog`
- `/advertise` (prices from CMS)
- `/admin` CMS

## Import

Upload CSV or Excel in **CMS → Imports**. Matching uses `external_id` (example `ROOF-000001`). Column aliases such as `Company` → name and `Town` → city are supported.

## Production notes

- Switch Prisma `provider` to `postgresql` and set `DATABASE_URL` when Docker/Postgres is available.
- Keep Stripe, Google, and Auth secrets server-side. See `.env.example`.
- Exclusive city sponsor inventory, Google Sheets sync, Mux video, and the first-run installer are later phases. Schema and CMS navigation already leave room for them.

## Spec

`docs/Master-Development-Specification.txt`
