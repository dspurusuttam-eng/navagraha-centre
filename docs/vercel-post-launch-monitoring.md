# Vercel Post-Launch Monitoring (Phase 18.2)

Use this checklist after every production push to `main`.

## 1. Deployment Health

1. Confirm latest production deployment status is `Ready`.
2. Confirm commit hash in Vercel matches latest `main`.
3. Confirm no deployment cancellation/retry loops.

## 2. Domain and TLS

1. Confirm domain aliases are attached:
   - `https://www.navagrahacentre.com`
   - `https://navagrahacentre.com`
2. Confirm apex redirects cleanly to `www` (single hop preferred).
3. Confirm HTTPS certificate is valid and active.
4. Confirm no mixed-content warnings on core pages.

## 3. Build and Runtime Logs

1. Review build output for warnings/errors.
2. Confirm environment variable resolution has no production warnings for required vars.
3. Review function logs for spikes in `4xx`/`5xx`.
4. Confirm no recent unexplained `500` errors on the latest production deployment.

## 4. Route and Redirect Verification

1. Check root and locale routes: `/`, `/en`, `/as`, `/hi`.
2. Check SEO endpoints: `/sitemap.xml`, `/robots.txt`.
3. Check redirect behavior for aliases:
   - `/en|as|hi/compatibility` -> locale-safe destination.
   - `/en|as|hi/navagraha-ai` -> locale-safe destination.
4. Confirm canonical redirects do not create loops (`apex -> www`, `/insights -> /from-the-desk`).

## 5. API and Error Monitoring

1. Check serverless/API error rates for:
   - astrology routes
   - ask-chart routes
   - report routes
   - checkout/webhook routes
2. Verify no increase in unauthorized errors beyond expected baseline.
3. Verify no runtime crash loops after cache warm-up.

## 6. Cache Warm-up Verification

1. Revisit key public routes after 5-15 minutes.
2. Confirm no stale/cold-start anomalies.
3. Confirm response headers remain intact (security + cache policy).

## 7. Security and SEO Safety

1. Verify security headers still present (CSP, HSTS, X-Frame-Options, etc.).
2. Verify robots and sitemap remain accessible.
3. Verify no accidental noindex on important public pages.

## 8. Incident Escalation

Escalate immediately if:

1. Production deployment status is not `Ready`.
2. Root or locale routes return `5xx`.
3. Sitemap or robots becomes inaccessible.
4. Webhook/payment error rates spike.
5. CSP/headers break rendering or scripts unexpectedly.
