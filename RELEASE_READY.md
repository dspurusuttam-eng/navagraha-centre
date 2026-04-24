# NAVAGRAHA CENTRE Release Readiness

Generated: 2026-04-24

## Release Summary

- Repository is in a deployable state for Vercel Git-based production deployment.
- Latest verification in this pass:
  - `npm run env:check` PASS
  - `npm run typecheck` PASS
  - `npm run lint` PASS
  - `npm run build` PASS
  - `npm run debug:panchang` PASS
- Recent changes in working tree are focused on:
  - Panchang advanced timing utilities and UI presentation
  - Panchang retention integration and related analytics events

## Required Production Environment Variables (Names Only)

Core required:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `BETTER_AUTH_TRUSTED_ORIGINS`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SITE_NAME`
- `GEOCODING_PROVIDER`
- `GEOCODING_API_KEY`
- `SHOP_DRAFT_WEBHOOK_SECRET`

Conditionally required:

- `OPENAI_API_KEY` (required when `AI_PROVIDER=openai-responses`)
- `OPENAI_MODEL` (required when `AI_PROVIDER=openai-responses`)
- `RAZORPAY_KEY_ID` (required when `SHOP_CHECKOUT_PROVIDER=razorpay`)
- `RAZORPAY_KEY_SECRET` (required when `SHOP_CHECKOUT_PROVIDER=razorpay`)
- `RAZORPAY_WEBHOOK_SECRET` (required when `SHOP_CHECKOUT_PROVIDER=razorpay`)
- `RESEND_API_KEY` (required in production for password reset delivery)
- `AUTH_RESET_FROM_EMAIL` (required in production for password reset delivery)

Operational/recommended:

- `NEXT_PUBLIC_ANALYTICS_ENABLED`
- `NEXT_PUBLIC_OBSERVABILITY_ENDPOINT`
- `ASTROLOGY_PROVIDER`
- `AI_PROVIDER`
- `AI_USAGE_LOGGING`
- `SHOP_CHECKOUT_PROVIDER`
- `SHOP_WEBHOOK_SECRET`
- `OPS_ALERTS_ENABLED`
- `OPS_ALERT_WEBHOOK_URL`
- `OPS_ALERT_ON_WARNINGS`
- `OPS_HEALTHCHECK_URL`
- `OPS_HEALTHCHECK_TIMEOUT_MS`

## Manual Production Checks After Deploy

1. Confirm deployment is successful in Vercel and no build/runtime errors.
2. Verify core public routes:
- `/`
- `/ai`
- `/rashifal`
- `/insights`
- `/reports`
- `/consultation`
- `/shop`
- `/panchang`
3. Verify key system routes:
- `/robots.txt`
- `/sitemap.xml`
- `/api/health`
4. Verify Panchang flow on production:
- submit date + place
- check core values, transitions, advanced timings (Rahu Kaal, Gulika Kaal, Yamaganda, Abhijit Muhurta)
- confirm no UI overlap on mobile
5. Verify auth and dashboard basics:
- sign in
- dashboard load
- ask-my-chart/report entry routes
6. Verify analytics ingestion:
- confirm events are accepted by `/api/analytics/event`
- spot-check analytics summary endpoint
7. Verify legal/trust pages:
- `/privacy`
- `/terms`
- `/disclaimer`
- `/refund-cancellation`
- `/contact`

## Known Non-Blocking Follow-Ups

- Run full launch smoke bundle (`npm run launch:check`) in a production-like environment with all required secrets and accessible endpoints.
- Perform live click-through QA on real domain after deployment (desktop + mobile).
- If AdSense is being activated now, replace publisher placeholder in `public/ads.txt` before final monetization enablement.
