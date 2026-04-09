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
- `AI_PROVIDER`
- `OPENAI_API_KEY` and `OPENAI_MODEL` if enabling live AI interpretation

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
npm run check:images
npm run test:smoke
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
- `npm run env:check` - validate launch-critical environment variables
- `npm run setup:swisseph:windows` - install and patch `swisseph` on Windows without changing package manifests
- `npm run check:images` - fail if raw `<img>` tags are found in `src/`
- `npm run test:smoke` - run smoke checks for launch-critical utilities
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
- `NEXT_PUBLIC_ANALYTICS_ENABLED`
- `NEXT_PUBLIC_OBSERVABILITY_ENDPOINT`

Recommended production values:

- `BETTER_AUTH_URL=https://your-domain.com`
- `BETTER_AUTH_TRUSTED_ORIGINS=https://your-domain.com,https://your-project.vercel.app`
- `NEXT_PUBLIC_SITE_URL=https://your-domain.com`

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
