# NAVAGRAHA CENTRE

Production-ready foundation for a luxury astrology platform built with Next.js App Router, TypeScript, Tailwind CSS, Prisma, Better Auth, ESLint, and Prettier.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma ORM with PostgreSQL
- Better Auth email/password authentication
- `circular-natal-horoscope-js` live natal adapter with mock fallback
- AI interpretation provider boundary with mock fallback and optional OpenAI Responses adapter
- ESLint 9
- Prettier 3

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create your local environment file:

```bash
# PowerShell
Copy-Item .env.example .env.local

# macOS / Linux
cp .env.example .env.local
```

3. Add real values for:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `BETTER_AUTH_TRUSTED_ORIGINS`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SITE_NAME`
- `ASTROLOGY_PROVIDER`
- `GEOCODING_PROVIDER` (`opencage`)
- `GEOCODING_API_KEY` (OpenCage API key)
- `OPENCAGE_API_KEY` (optional legacy fallback if `GEOCODING_API_KEY` is unset)
- `AI_PROVIDER`
- `OPENAI_API_KEY` and `OPENAI_MODEL` if enabling live AI interpretation
- commerce/payment vars:
  - `SHOP_CHECKOUT_PROVIDER` (optional, defaults to `draft-order`)
  - `SHOP_DRAFT_WEBHOOK_SECRET` (required for webhook verification)
  - `SHOP_WEBHOOK_SECRET` (optional fallback)
- optional ops monitoring vars:
  - `OPS_ALERTS_ENABLED`
  - `OPS_ALERT_WEBHOOK_URL`
  - `OPS_ALERT_ON_WARNINGS`
  - `OPS_HEALTHCHECK_URL`
  - `OPS_HEALTHCHECK_TIMEOUT_MS`
  - `SMOKE_BASE_URL`

4. Generate the Prisma client and apply the initial schema:

```bash
npm run db:generate
npm run db:migrate -- --name init-foundation
```

5. Seed the starter reference data if desired:

```bash
npm run db:seed:launch
```

6. Start the development server:

```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000).

## Launch Readiness

Before any deployment handoff, run:

```bash
npm run env:check
npm run env:audit
npm run check:images
npm run test:smoke
npm run test:smoke:critical
```

The project also exposes a lightweight health endpoint at `/api/health` and a client web-vitals intake endpoint at `/api/observability/web-vitals`.

## Available Scripts

- `npm run dev` - start the local development server
- `npm run build` - create the production build
- `npm run start` - serve the production build
- `npm run lint` - run ESLint
- `npm run typecheck` - run TypeScript without emitting files
- `npm run db:generate` - generate the Prisma client
- `npm run db:migrate -- --name <migration-name>` - create and apply a local development migration
- `npm run db:migrate:deploy` - apply committed Prisma migrations in deployment environments
- `npm run db:push` - push the schema without creating a migration
- `npm run db:seed` - seed starter admin roles and content
- `npm run db:seed:core` - alias for the core seed
- `npm run db:seed:launch` - generate Prisma client and seed launch data
- `npm run db:setup` - generate Prisma client, push schema, and seed launch data
- `npm run db:studio` - open Prisma Studio
- `npm run qa:seed:user` - create or refresh a safe local QA member account with chart, report, inquiry, and consultation context
- `npm run debug:birth-context -- --date <YYYY-MM-DD> --time <HH:mm> --place "<City, State, Country>"` - print internal normalize/place/timezone/UTC/validation payload for birth-context debugging
- `npm run env:check` - validate launch-critical environment variables
- `npm run env:audit` - audit env/secrets contract for missing or weak values
- `npm run setup:swisseph:windows` - install and patch `swisseph` on Windows without changing package manifests
- `npm run check:images` - fail if raw `<img>` tags are found in `src/`
- `npm run test:smoke` - run smoke checks for launch-critical utilities
- `npm run test:smoke:critical` - run 5 route-level critical flow checks (`/`, `/sign-in`, `/dashboard`, `/dashboard/report`, `/dashboard/ask-my-chart`)
- `npm run ops:health-monitor` - poll `/api/health` and fail fast on unhealthy status (optionally sends webhook alert)
- `npm run ops:follow-up-automation` - run consultation follow-up lifecycle automation (`--dry-run` for preview, `--record-audit` to persist run metadata in admin audit history)
- `npm run launch:check` - run environment, image, and smoke launch checks
- `npm run format` - format the codebase with Prettier
- `npm run format:check` - verify Prettier formatting

## Astrology Provider Setup

- `ASTROLOGY_PROVIDER=mock-deterministic` keeps the local deterministic fixture provider active.
- `ASTROLOGY_PROVIDER=circular-natal-real` switches natal chart essentials to the live `circular-natal-horoscope-js` adapter.
- The live adapter currently covers natal essentials only: ascendant, planetary positions, houses, aspects, and a deterministic summary.
- Natal chart essentials are cached server-side by birth details and house system so repeated chart reads do not recompute unnecessarily.
- Transit snapshots and divisional charts remain on the mock provider until later phases.
- Live natal requests must include birth latitude and longitude in `birthDetails.place`.
- Server code should import the chart boundary from `@/modules/astrology/server` so calculation logic stays isolated from UI code.

## Windows Swiss Ephemeris Setup

If you are preparing for the Swiss Ephemeris adapter on Windows, use the repo helper instead of a plain `npm install swisseph`:

```bash
npm run setup:swisseph:windows
```

What the helper does:

- installs `swisseph` locally with `--ignore-scripts --no-save`
- regenerates the native Visual Studio project with `node-gyp`
- patches the generated Windows project to use MSVC `v143`
- applies the required C++20 setting for Node 24 headers
- builds and verifies the native addon with a runtime load check

Prerequisites:

- Python 3 available in PowerShell
- Visual Studio 2022 Build Tools with Desktop C++ workload
- a Windows 10 SDK component available to `node-gyp` (for example `19041`)

This helper is intentionally local-only and does not change `package.json` or `package-lock.json`.

## Local QA Test User Workflow

For protected-route QA, you can seed a reusable local member account instead of using production credentials:

```bash
npm run qa:seed:user
```

What the workflow does:

- refuses to run if `BETTER_AUTH_URL` or `NEXT_PUBLIC_SITE_URL` does not point to a local host
- creates or refreshes a local Better Auth email/password account
- completes onboarding with a real generated natal chart
- seeds one completed consultation, one upcoming consultation, and one compatibility-focused inquiry
- prints the login credentials and the most useful protected QA routes

Default local credentials:

- email: `qa-member@navagraha.local`
- password: `NavagrahaQA123!`

Optional flags:

- `--keep-existing` preserves the existing QA user instead of recreating it
- `--email <value>` overrides the email
- `--password <value>` overrides the password
- `--name <value>` overrides the display name

Suggested QA flow after seeding:

1. Run `npm run dev`
2. Open [http://localhost:3000/sign-in](http://localhost:3000/sign-in)
3. Sign in with the printed QA credentials
4. Verify:
   - `/dashboard`
   - `/dashboard/report`
   - `/dashboard/consultations`
   - the seeded completed consultation detail route printed by the script

For live production verification, use the canonical domain:

- [https://www.navagrahacentre.com/sign-in](https://www.navagrahacentre.com/sign-in)
- [https://www.navagrahacentre.com/dashboard/onboarding](https://www.navagrahacentre.com/dashboard/onboarding)

## AI Interpretation Setup

- `AI_PROVIDER=mock-curated` keeps interpretation deterministic and local while the report UI is being built.
- `AI_PROVIDER=openai-responses` enables the OpenAI-backed explanation provider.
- `AI_USAGE_LOGGING=true` enables structured server-side usage hook logs for AI task runs.
- `OPENAI_API_KEY` and `OPENAI_MODEL` are both required before enabling `openai-responses`.
- If OpenAI is not fully configured, the server automatically falls back to the curated mock provider so protected report pages still render.
- The AI layer only interprets structured chart data that has already been calculated by the astrology provider. It does not calculate chart math, invent remedies, or power open-ended chat in this phase.

## AI Orchestration Foundation

The AI module now includes a reusable orchestration foundation in `src/modules/ai`:

- provider registry and runtime model config abstraction
- prompt template registry with prompt version resolution (database active version with registry fallback)
- task contracts for chart explanation, transit explanation, remedy explanation, consultation brief generation, and content draft generation
- tool contracts for future grounded actions:
  - `get_user_chart_snapshot`
  - `get_approved_remedies`
  - `get_related_products`
  - `get_published_insights`
  - `get_consultation_context`
- response normalization and policy guardrails that block:
  - chart math generation by AI
  - unsupported remedy/commerce invention
  - medical/legal/financial claims
  - fear-based output
- usage logging hooks and typed conversation/session/task-run domain contracts for future assistant workflows

Current behavior remains compatible with the existing report flow: `/dashboard/report` still calls the chart interpretation boundary, and the service now applies normalization, policy checks, and safe fallback handling internally.

## Route Map

- `/`
- `/about`
- `/services`
- `/consultation`
- `/shop`
- `/insights`
- `/sign-in`
- `/sign-up`
- `/dashboard`
- `/dashboard/report`
- `/settings`
- `/admin`
- `/api/health`

## Folder Structure

```text
src/
  app/
    (marketing)/
    (app)/
    (admin)/
  components/
  config/
  lib/
  modules/
  styles/
prisma/
public/
```

## Notes

- Public pages are server-rendered App Router routes.
- The current phase includes a protected dashboard shell, account settings page, and seed-ready data models.
- The current report page combines stored natal chart facts, an AI explanation boundary, and deterministic remedy mapping from approved remedy records.
- Launch readiness now includes environment validation, request throttling on sensitive flows, global and segment fallback states, security headers, a basic web-vitals ingestion path, smoke-test scripts, and a launch checklist.
- Future integrations for astrology, AI, commerce, and operations should follow the boundaries described in `AGENTS.md`.

## Deploy to Vercel

Set these environment variables in Vercel before the first production deploy:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `BETTER_AUTH_TRUSTED_ORIGINS`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SITE_NAME`
- `ASTROLOGY_PROVIDER`
- `AI_PROVIDER`
- `AI_USAGE_LOGGING` (optional)
- `OPENAI_API_KEY` and `OPENAI_MODEL` only if `AI_PROVIDER=openai-responses`
- `SHOP_CHECKOUT_PROVIDER` (optional, defaults to `draft-order`)
- `SHOP_DRAFT_WEBHOOK_SECRET` (required for webhook verification)
- `SHOP_WEBHOOK_SECRET` (optional fallback)
- `NEXT_PUBLIC_ANALYTICS_ENABLED`
- `NEXT_PUBLIC_OBSERVABILITY_ENDPOINT`
- `GEOCODING_PROVIDER` (recommended: `opencage`)
- `GEOCODING_API_KEY` (required for birth place resolution)

Recommended production values:

- `BETTER_AUTH_URL=https://www.navagrahacentre.com`
- `BETTER_AUTH_TRUSTED_ORIGINS=https://www.navagrahacentre.com,https://navagrahacentre.com`
- `NEXT_PUBLIC_SITE_URL=https://www.navagrahacentre.com`

Deployment flow:

1. Push committed Prisma migrations with your release so Vercel can apply them.
2. Let Vercel install dependencies normally. The `postinstall` script runs `prisma generate`.
3. Apply database migrations in the deployment environment:

```bash
npm run db:migrate:deploy
```

4. Seed launch data if this environment needs it:

```bash
npm run db:seed:launch
```

5. Run the final checks before promoting production:

```bash
npm run env:check
npm run lint
npm run typecheck
npm run build
```

6. After deployment, verify:

- `/api/health`
- `/robots.txt`
- `/sitemap.xml`

Use `docs/launch-checklist.md` as the final release checklist.
Use `docs/database-backup-restore.md` for production backup/restore operations.
Use `docs/phase-9-completion.md` for consultation conversion, lifecycle, retention, and follow-up automation QA coverage.
Use `docs/COMMERCE_SETUP.md` for checkout, webhook, and order-finalization production setup/validation.
