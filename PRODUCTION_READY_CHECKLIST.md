# NAVAGRAHA CENTRE Production Ready Checklist

Generated: 2026-04-24

## 1. Release Summary

- Scope: final pre-Phase 18.2 production readiness audit and blocker cleanup.
- Verified surfaces:
  - Public routes, tool discovery routes, metadata routes.
  - Core predictive engines and utility engines.
  - Auth, paywall/checkout/webhook guard paths (code audit + build safety).
- Build health:
  - `npm run env:check` PASS
  - `npm run typecheck` PASS
  - `npm run lint` PASS
  - `npm run build` PASS
- Route/link consistency:
  - App routes discovered: 81
  - Internal `href` targets discovered: 36
  - Missing route targets: 0

## 2. Completed Phase Summary (Verified)

- Core chart + sidereal stack: integrated and build-safe.
- Predictive Intelligence Core:
  - Dasha (Maha/Antar/Pratyantar/Day) + synthesis layers present.
  - Transit and Yoga/Rule layers present.
  - Predictive report + assistant context wiring present.
- Utility Expansion:
  - Numerology, Panchang, calculators bundle, Muhurta-lite routes and APIs present.
  - Tools hub and utility discovery links integrated into homepage/nav/footer/AI/Panchang/Numerology surfaces.
- Public website:
  - Light premium UI remains consistent; no dark/blue identity regressions found in major public surfaces audited.
  - No unfinished public loading placeholders found for prior blocked strings.
- SEO + AdSense readiness:
  - `robots.ts`, `sitemap.ts`, public trust/legal routes, and `public/ads.txt` present.

## 3. Required Environment Variables (Names Only)

### Required for Production

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SITE_NAME`
- `SHOP_CHECKOUT_PROVIDER`
- `SHOP_DRAFT_WEBHOOK_SECRET` (required when `SHOP_CHECKOUT_PROVIDER=draft-order`)
- `RESEND_API_KEY`
- `AUTH_RESET_FROM_EMAIL`

### Conditional Production Requirements

- `BETTER_AUTH_TRUSTED_ORIGINS` (required in production runtime by env validation)
- `OPENAI_API_KEY` (required when `AI_PROVIDER=openai-responses`)
- `OPENAI_MODEL` (required when `AI_PROVIDER=openai-responses`)
- `GEOCODING_API_KEY` or `OPENCAGE_API_KEY` (required when `GEOCODING_PROVIDER=opencage`)
- `RAZORPAY_KEY_ID` (required when `SHOP_CHECKOUT_PROVIDER=razorpay`)
- `RAZORPAY_KEY_SECRET` (required when `SHOP_CHECKOUT_PROVIDER=razorpay`)
- `RAZORPAY_WEBHOOK_SECRET` (required when `SHOP_CHECKOUT_PROVIDER=razorpay`)

### Required for Local Development

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SITE_NAME`

### Optional / Future / Ops

- `NEXT_PUBLIC_ANALYTICS_ENABLED`
- `NEXT_PUBLIC_OBSERVABILITY_ENDPOINT`
- `OPS_ALERTS_ENABLED`
- `OPS_ALERT_WEBHOOK_URL`
- `OPS_ALERT_ON_WARNINGS`
- `OPS_HEALTHCHECK_URL`
- `OPS_HEALTHCHECK_TIMEOUT_MS`
- `SMOKE_BASE_URL`
- `SWISSEPH_EPHE_PATH`
- `SHOP_WEBHOOK_SECRET`
- `GEOCODING_PROVIDER`

### External Manual Setup

- Vercel project env sync for all production variables above.
- Payment provider dashboard webhook setup (provider-specific endpoint + secret).
- Resend domain/sender verification for `AUTH_RESET_FROM_EMAIL`.
- AdSense publisher record finalization in `public/ads.txt` before ad activation.

## 4. Final Manual Test Checklist (Post Deploy)

- Public pages:
  - `/`, `/kundli`, `/compatibility`, `/rashifal`, `/ai`, `/reports`, `/consultation`, `/shop`, `/insights`, `/tools`, `/calculators`, `/panchang`, `/muhurta`.
- Rashifal sign detail:
  - Verify all sign pages load and show 5 descriptive lines + Love/Career/Business + Lucky fields.
- Utilities:
  - Numerology form + result.
  - Panchang date/place flow + transitions + advanced timings.
  - Calculators API-backed forms (all cards).
  - Muhurta-lite API-backed flow.
- Auth:
  - Sign-up, sign-in, sign-out.
  - Forgot/reset password (valid + expired token behavior).
- Monetization:
  - Free vs premium gating surfaces.
  - Upgrade CTA navigation.
  - Checkout init flow and post-payment success route.
- Webhook safety:
  - Invalid signature returns safe non-200 outcome.
  - Duplicate event handling remains idempotent.

## 5. Live Smoke Test Steps

1. Set `SMOKE_BASE_URL` to production domain.
2. Run:
   - `npm run test:smoke`
   - `npm run test:smoke:critical`
   - `npm run test:smoke:launch`
3. Confirm no failed checks for:
   - Public route availability.
   - Protected route auth guard behavior.
   - Unauthorized API behavior (`401` + structured error).
   - Webhook invalid-signature response behavior.

## 6. Vercel Deploy Checklist

- Confirm production branch: `main`.
- Confirm all required env vars are present in Vercel Production scope.
- Trigger deployment from latest commit.
- Validate deployment summary has:
  - successful build
  - successful route generation
  - no runtime init errors
- Post-deploy verify:
  - `/api/health`
  - `/robots.txt`
  - `/sitemap.xml`
  - key public pages above.

## 7. AdSense Readiness Checklist

- `public/ads.txt` exists.
- Placeholder publisher line remains non-live until real publisher ID is ready.
- Article ad-ready zones are script-free and neutral (no broken/unfinished language).
- No aggressive ad injection in public UI.
- Layout stability preserved without ad scripts.

## 8. Known Non-Blocking Follow-Ups

- Chart debug scripts (`debug:birth-context`, `debug:chart`, `debug:planetary`, `debug:lagna`, `debug:houses`, `debug:bhava`, `debug:chart-contract`) currently fail in standalone `tsx` context due `server-only` import guards.
  - This does not block production runtime/build.
  - Keep as a tooling follow-up: migrate those scripts to server-safe harness or API-based debug entrypoints.
- Smoke scripts require reachable `SMOKE_BASE_URL` or local running server; failure in isolated local run without target is expected.

## 9. Rollback Notes

- Rollback path:
  1. In Vercel, promote previous successful production deployment.
  2. Revert the latest commit on `main` if code rollback is needed.
  3. Re-run build checks and smoke checks before re-promoting.
- Focus rollback candidates:
  - utility discovery/nav additions
  - tools/calculators/muhurta route additions
  - env validation geocoding-provider compatibility update
