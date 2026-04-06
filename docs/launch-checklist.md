# NAVAGRAHA CENTRE Launch Checklist

## Environment

- Run `npm run env:check`
- Confirm production values exist for `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_SITE_URL`, and `NEXT_PUBLIC_SITE_NAME`
- If using live AI, confirm `AI_PROVIDER=openai-responses`, `OPENAI_API_KEY`, and `OPENAI_MODEL`
- If using live auth behind multiple origins, set `BETTER_AUTH_TRUSTED_ORIGINS`

## Database

- Run `npm run db:generate`
- Apply schema with `npm run db:migrate -- --name launch-readiness` or `npm run db:push`
- Seed launch data with `npm run db:seed:launch`
- Verify admin roles, remedies, products, consultation packages, slots, and AI prompt templates exist

## Quality Gates

- Run `npm run check:images`
- Run `npm run test:smoke`
- Run `npm run lint`
- Run `npm run typecheck`
- Run `npm run build`

## Security And Platform

- Confirm production HTTPS termination is active before relying on HSTS
- Verify response headers include `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`
- Confirm auth, onboarding, booking, profile update, checkout, and observability endpoints are rate limited
- Verify `/api/health` returns `200` in the configured production environment

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
