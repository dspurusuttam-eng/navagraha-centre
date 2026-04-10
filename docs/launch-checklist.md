# NAVAGRAHA CENTRE Launch Checklist

## Environment

- Run `npm run env:check`
- Run `npm run env:audit`
- Confirm production values exist for `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_SITE_URL`, and `NEXT_PUBLIC_SITE_NAME`
- If using live AI, confirm `AI_PROVIDER=openai-responses`, `OPENAI_API_KEY`, and `OPENAI_MODEL`
- If using live auth behind multiple origins, set `BETTER_AUTH_TRUSTED_ORIGINS`
- Freeze the env contract before launch (no undocumented keys, no placeholder secrets)

## Database

- Take a production backup before migrations (`pg_dump`)
- Run `npm run db:generate`
- Apply schema with `npm run db:migrate -- --name launch-readiness` or `npm run db:push`
- Seed launch data with `npm run db:seed:launch`
- Verify admin roles, remedies, products, consultation packages, slots, and AI prompt templates exist
- Follow [database-backup-restore.md](./database-backup-restore.md) for restore drill and incident recovery steps

## Quality Gates

- Run `npm run check:images`
- Run `npm run test:smoke`
- Run `npm run test:smoke:critical` (with `SMOKE_BASE_URL` set or local server running)
- Run `npm run lint`
- Run `npm run typecheck`
- Run `npm run build`

## Security And Platform

- Confirm production HTTPS termination is active before relying on HSTS
- Verify response headers include `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`
- Confirm auth, onboarding, booking, profile update, checkout, and observability endpoints are rate limited
- Verify `/api/health` returns `200` in the configured production environment
- Configure uptime monitor to poll `/api/health` every minute
- Configure ops alert webhook via `OPS_ALERTS_ENABLED=true` + `OPS_ALERT_WEBHOOK_URL`
- Verify `npm run ops:health-monitor` succeeds in deployment environment

## Product Readiness

- Confirm public metadata, sitemap, and robots outputs match the intended launch domain
- Review consultation slots and packages for Joy Prakash Sarmah
- Review approved remedy records and product relationships
- Confirm the active AI prompt version is correct
- Confirm admin users and role assignments are correct

## Post-Deploy Checks

- Visit `/`
- Visit `/services`
- Visit `/insights`
- Visit `/shop`
- Sign in and load `/dashboard`
- Complete onboarding and confirm `/dashboard/chart`
- Open `/dashboard/report`
- Open `/dashboard/consultations`
- Open `/admin`
- Check `/api/health`
- Run `npm run test:smoke:critical` against production (`SMOKE_BASE_URL=https://www.navagrahacentre.com`)
