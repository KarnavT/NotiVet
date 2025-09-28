# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project: NotiVet — Veterinary Drug Information Platform (Next.js + Prisma + PostgreSQL)

Commands

- Install dependencies
  ```bash path=null start=null
  npm install
  ```

- Development server (Next.js App Router)
  ```bash path=null start=null
  npm run dev
  ```

- Build and run in production
  ```bash path=null start=null
  npm run build
  npm run start -- --hostname 127.0.0.1 --port 3000
  ```

- Lint
  ```bash path=null start=null
  npm run lint
  ```

- Database (Prisma + PostgreSQL)
  ```bash path=null start=null
  # Generate Prisma client
  npm run db:generate

  # Push schema to the database (safe for dev)
  npm run db:push

  # Create & apply a migration during development (interactive)
  npm run db:migrate

  # Prisma Studio (DB browser)
  npm run db:studio

  # Seed demo data (creates HCP/Pharma users and sample drugs; may also import CSV)
  npm run db:seed

  # Import USDA drug CSV (data/AnimalDrugs.csv)
  npm run db:import-drugs
  ```

- One-command local demo (macOS)
  ```bash path=null start=null
  bash scripts/run_demo.sh
  ```
  What it does: starts a local Postgres in Docker (port 6543), runs Prisma generate/push/seed, starts Next.js on 127.0.0.1:3000, starts ngrok, and prints a public HTTPS URL. Demo users after seeding: Pharma (contact@pharmaco.com/password123), HCP (dr.smith@vetclinic.com/password123).

- Authenticated API usage from the terminal
  ```bash path=null start=null
  # 1) Login (returns JWT). Change userType to HCP or PHARMA as needed.
  TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
    -H 'Content-Type: application/json' \
    -d '{"email":"dr.smith@vetclinic.com","password":"password123","userType":"HCP"}' \
    | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')

  # 2) Use the token to call a protected endpoint
  curl -s 'http://localhost:3000/api/drugs?q=canine' -H "Authorization: Bearer $TOKEN" | jq . | head -100
  ```

Environment

- Required environment variables (see .env.example and next.config.js):
  - DATABASE_URL — PostgreSQL connection string
  - JWT_SECRET — JWT signing secret (used by custom auth)
  - NEXTAUTH_SECRET — carried through env config (not used by NextAuth in this codebase, but present)
- Optional (enables email delivery for pharma notifications):
  - SMTP_HOST, SMTP_PORT, [SMTP_USER, SMTP_PASS], SMTP_SECURE, SMTP_FROM
- Optional (enables the Chat endpoint):
  - OPENAI_API_KEY

High-level architecture and structure

- Framework and language
  - Next.js 14 (App Router) + React + TypeScript + Tailwind CSS
  - TypeScript strict mode, with path alias @/* to ./src/* (see tsconfig.json)

- Backend/API (Next.js route handlers under src/app/api)
  - Authentication: JWT-based custom auth in src/lib/auth.ts
    - hash/verify via bcryptjs; token issue/verify via jsonwebtoken; Authorization: Bearer header
  - Authorization middleware: src/lib/middleware.ts
    - withAuth decorates route handlers to inject req.user; withRole composes role checks (HCP/PHARMA)
  - Representative endpoints:
    - POST /api/auth/login — validates with zod, issues JWT, returns user + profile
    - POST /api/auth/register/hcp and /api/auth/register/pharma — create users with profiles
    - GET /api/drugs — search across multiple fields; returns parsed species/delivery arrays
    - HCP Saved drugs: GET/POST /api/drugs/saved — manages SavedDrug join table
    - Notifications (pharma outbound, hcp inbound):
      - GET/POST /api/notifications — pharma POST creates a Drug then a Notification, targets HCPs by specialties, creates NotificationActivity rows (SENT), and attempts email delivery (nodemailer). GET returns received (HCP) or sent (PHARMA) with basic analytics.
      - POST /api/notifications/[id]/track — HCP marks OPENED/CLICKED (unique per user/status)
      - POST /api/notifications/[id]/unread — HCP removes OPENED to mark as unread
      - GET /api/notifications/count — HCP counts total vs unread (based on activities)
    - GET /api/analytics — pharma overview from NotificationActivity aggregation (open/click rates)
    - POST /api/chat — optional; tokenizes query, searches Drug data, and calls OpenAI chat completions; requires OPENAI_API_KEY

- Data layer (Prisma + PostgreSQL)
  - Schema: prisma/schema.prisma models User, HCPProfile, PharmaProfile, Drug, SavedDrug, Notification, NotificationActivity, Analytics
  - Many “list” fields are stored as JSON-encoded strings (species, deliveryMethods, targetSpecies, etc.); API handlers parse/stringify as needed
  - NotificationActivity tracks status transitions (SENT, OPENED, CLICKED) with a compound unique to avoid duplicates
  - Seed script (prisma/seed.ts) creates demo users and drugs; conditionally runs scripts/import-drugs.ts if data/AnimalDrugs.csv exists and only seed drugs are present

- Frontend (App Router pages under src/app)
  - Public entry: src/app/page.tsx
  - Role-specific areas: src/app/hcp/* and src/app/pharma/* (login, register, dashboard)
  - Shared components in src/components (e.g., DrugCard, CampaignDetailsModal)
  - Styling: Tailwind (tailwind.config.ts), global styles in src/app/globals.css

- Configuration
  - next.config.js exposes env vars (DATABASE_URL, JWT_SECRET, NEXTAUTH_SECRET) and marks prisma/bcrypt as external server components packages
  - tsconfig.json sets strict, bundler resolution, incremental, and @/* path alias

Notes from repository docs

- README.md includes the one-command demo (scripts/run_demo.sh), demo users, and a clear “Development Commands” section that matches the npm scripts here.
- data/README.md documents the USDA/APHIS CSV import, schema fields added, species mapping, cleaning, and reimport/reset process.

Testing

- No test runner or scripts are defined in package.json, and no tests directory exists. If tests are added later, include commands here (e.g., to run a single test) and hook them into npm scripts.
