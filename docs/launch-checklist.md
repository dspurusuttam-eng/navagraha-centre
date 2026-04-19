# NAVAGRAHA CENTRE Launch Checklist (Phase 16.0A)

This checklist is the final execution runbook for production launch readiness.

## 1) Production Environment Contract (names only)

### Core Required
- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `BETTER_AUTH_TRUSTED_ORIGINS`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SITE_NAME`

### Geocoding / Birth Context
- `GEOCODING_PROVIDER`
- `GEOCODING_API_KEY`
- `OPENCAGE_API_KEY` (legacy fallback only)

### Password Reset Email
- `RESEND_API_KEY`
- `AUTH_RESET_FROM_EMAIL`

### Commerce / Payments
- `SHOP_CHECKOUT_PROVIDER`
- `SHOP_DRAFT_WEBHOOK_SECRET`
- `SHOP_WEBHOOK_SECRET` (optional fallback)
- `RAZORPAY_KEY_ID` (required only if `SHOP_CHECKOUT_PROVIDER=razorpay`)
- `RAZORPAY_KEY_SECRET` (required only if `SHOP_CHECKOUT_PROVIDER=razorpay`)
- `RAZORPAY_WEBHOOK_SECRET` (required only if `SHOP_CHECKOUT_PROVIDER=razorpay`)

### AI / Assistant
- `AI_PROVIDER`
- `AI_USAGE_LOGGING`
- `OPENAI_API_KEY` (required only if `AI_PROVIDER=openai-responses`)
- `OPENAI_MODEL` (required only if `AI_PROVIDER=openai-responses`)

### Observability / Smoke
- `NEXT_PUBLIC_ANALYTICS_ENABLED`
- `NEXT_PUBLIC_OBSERVABILITY_ENDPOINT`
- `OPS_ALERTS_ENABLED`
- `OPS_ALERT_WEBHOOK_URL`
- `OPS_ALERT_ON_WARNINGS`
- `OPS_HEALTHCHECK_URL`
- `OPS_HEALTHCHECK_TIMEOUT_MS`
- `SMOKE_BASE_URL`

## 2) Pre-Deploy Verification

1. Run env checks locally:
   - `npm run env:check`
   - `npm run env:audit`
2. For production strict audit:
   - `ENV_AUDIT_MODE=production npm run env:audit`
3. Run quality gates:
   - `npm run check:images`
   - `npm run test:smoke`
   - `npm run test:smoke:critical`
   - `npm run test:smoke:launch`
   - `npm run lint`
   - `npm run typecheck`
   - `npm run build`

## 3) Deploy Order

1. Confirm all production env variables in Vercel.
2. Take DB backup (`pg_dump`) before schema changes.
3. Push release commit to `main`.
4. Wait for Vercel production deployment to become `Ready`.
5. Apply DB migrations:
   - `npm run db:migrate:deploy`
6. Seed launch data if needed:
   - `npm run db:seed:launch`
7. Verify production health:
   - `GET /api/health` must return `200`.

## 4) Post-Deploy Smoke Tests

Use `SMOKE_BASE_URL=https://www.navagrahacentre.com`.

### Public + Auth Surfaces
- `/`
- `/kundli-ai`
- `/pricing`
- `/sign-up`
- `/sign-in`
- `/forgot-password`

### Protected / Fallback Safety
- `/dashboard` (redirect to sign-in if anonymous)
- `/dashboard/ask-my-chart`
- `/dashboard/chart`
- `/dashboard/report`

### API Safety (no raw crashes)
- `/api/astrology/chart` anonymous -> structured `401`
- `/api/ai/ask-chart/sessions` anonymous -> structured `401`
- `/api/subscriptions/checkout` anonymous -> structured `401`
- `/api/report/premium/generate` anonymous -> structured `401`
- `/api/shop/webhooks/payment` invalid signature -> `401 invalid-signature`

## 5) Payment Verification

1. Create checkout via `/api/shop/checkout/init`.
2. Send signed webhook (`payment.paid`) to `/api/shop/webhooks/payment`.
3. Confirm order/payment state transition in:
   - `/dashboard/orders`
   - `/dashboard/orders/[orderNumber]`
   - `/admin/orders`
4. Send invalid signature webhook and confirm safe `401`.
5. Send duplicate webhook and confirm replay-safe behavior (no double finalize).

Reference: [COMMERCE_SETUP.md](./COMMERCE_SETUP.md)

## 6) Email Verification

1. Open `/forgot-password`.
2. Request reset for known account.
3. Confirm:
   - API responds safely (no stack traces),
   - reset email is delivered from configured sender,
   - reset link opens `/reset-password` and can update password.
4. Confirm behavior for unknown email remains non-enumerating.

## 7) Fallback/Degrade Safety Verification

Validate graceful behavior in each dependency failure path:
- Geocoding unavailable -> onboarding allows manual timezone/coordinates path.
- Email provider unavailable -> forgot-password failure is safe and non-technical.
- Assistant provider unavailable -> assistant route returns safe retry guidance.
- Payment callback mismatch -> webhook path returns safe handled outcome.

## 8) Rollback Notes

1. Promote previous healthy Vercel deployment.
2. If payment webhooks misbehave, rotate webhook secret and redeploy.
3. If auth origin issues appear, restore previous `BETTER_AUTH_URL` / `BETTER_AUTH_TRUSTED_ORIGINS` values.
4. If DB migration causes breakage, restore from backup using:
   - [database-backup-restore.md](./database-backup-restore.md)

## 9) Known External Dependencies

- Vercel (hosting/runtime/deploy)
- Neon/PostgreSQL (database)
- Better Auth (auth runtime)
- OpenCage (geocoding)
- Resend (password reset email delivery)
- OpenAI (only when live AI provider is enabled)
- Payment provider boundary (`draft-order` default; Razorpay optional)
