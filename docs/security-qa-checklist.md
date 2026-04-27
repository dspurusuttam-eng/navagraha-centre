# Security QA Checklist (Phase 18.1N)

## Build + static checks

- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run build` passes
- [ ] `npm run security:check` passes

## Environment safety

- [ ] No secret values committed
- [ ] Server-only secrets are not exposed as `NEXT_PUBLIC_*`
- [ ] `.env.example` contains placeholders only

## API protections

- [ ] Write endpoints enforce rate limiting
- [ ] AI routes enforce stricter rate limits
- [ ] Public calculation APIs enforce payload-size validation
- [ ] Sensitive write endpoints enforce trusted-origin checks

## AI abuse protection

- [ ] Oversized/invalid requests are rejected safely
- [ ] AI temporary failure returns localized safe fallback message
- [ ] No full prompts/responses with personal details are logged in production

## Forms + spam

- [ ] Optional honeypot/timing checks are active for public tool POST routes
- [ ] Turnstile verification works when keys are configured (or safely skips when disabled)
- [ ] Server-side validation remains active for checkout/report flows
- [ ] Duplicate rapid submissions trigger rate-limited responses

## Payment + webhook safety

- [ ] Checkout amount comes from server-side catalog/config
- [ ] Payment webhook signature verification is enabled
- [ ] Unsupported/malformed webhook payloads fail safely
- [ ] Duplicate webhook event handling is idempotent

## Admin/private protection

- [ ] Admin pages require auth + role checks
- [ ] Admin pages remain noindex
- [ ] Admin API routes enforce rate limiting and input guards

## Error + logging safety

- [ ] No stack traces rendered to public UI in production
- [ ] Security/observability logs redact sensitive fields
- [ ] Email/phone or birth-data composites are not logged raw in production
- [ ] CSP mode is intentional (`SECURITY_CSP_REPORT_ONLY` set as desired for rollout)

## SEO + public stability regressions

- [ ] `sitemap.xml` still accessible
- [ ] `robots.txt` still accessible
- [ ] `/`, `/en`, `/as`, `/hi` routes still render
- [ ] Blog and Daily Rashifal pages still render
- [ ] Monetization CTAs/ad slots still render safely
