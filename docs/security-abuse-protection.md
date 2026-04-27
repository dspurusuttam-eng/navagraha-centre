# NAVAGRAHA CENTRE Security + Abuse Protection (Phase 18.1N)

## Scope
This document tracks production hardening across API routes, AI usage, forms, checkout/webhooks, and observability safety.

## Public/Write Endpoint Audit
Detected mutable route surfaces:

- `/api/ai/ask-chart/sessions` (POST)
- `/api/ai/ask-chart/sessions/[sessionId]/messages` (POST)
- `/api/astrology/birth-context/resolve` (POST)
- `/api/astrology/calculators` (POST)
- `/api/astrology/panchang` (POST)
- `/api/astrology/muhurta-lite` (POST)
- `/api/report/premium/generate` (POST)
- `/api/shop/checkout/init` (POST)
- `/api/shop/webhooks/payment` (POST)
- `/api/subscriptions/checkout` (POST)
- `/api/analytics/event` (POST)
- `/api/observability/web-vitals` (POST)
- `/api/admin/astrologer-copilot/snapshots/[snapshotId]/events` (POST)
- `/api/auth/[...all]` (mutations via Better Auth handler)

## Security Controls Added

### Centralized security module
Implemented `src/lib/security/*`:

- `security-config.ts`
- `rate-limit.ts`
- `request-guard.ts`
- `input-safety.ts`
- `safe-error.ts`
- `safe-logger.ts`
- `turnstile.ts`
- `index.ts`

### Rate limiting hardening
Applied centralized policy-based limits on:

- Ask My Chart session create/read/message routes
- Birth-context resolve
- Panchang / Muhurta / Calculators public routes
- Premium report generation
- Admin snapshot events
- Shop checkout init
- Web vitals ingestion

### Input/payload/origin protection
Added guards for:

- payload size limit checks
- trusted-origin validation (with safe allowance for missing origin where needed)
- optional honeypot + form timing checks for public calculation APIs
- optional Turnstile verification hooks with enforce mode support (`TURNSTILE_ENFORCE`)
- safer string normalization and email validation in checkout/report flows

### AI abuse safety
Added route-level protection for Ask My Chart:

- stricter request shaping
- centralized rate policy usage
- localized safe AI temporary-unavailable fallback message

### Privacy-safe logging
Added `safe-logger` redaction helper and integrated into observability event logging path so sensitive fields are masked before logging.

### Security headers
Existing baseline headers retained and extended with:

- `X-Permitted-Cross-Domain-Policies: none`
- environment-controlled CSP mode:
  - `Content-Security-Policy` (default)
  - `Content-Security-Policy-Report-Only` when `SECURITY_CSP_REPORT_ONLY=true`

### Turnstile wiring status
Turnstile verification is now wired for high-abuse public write surfaces:

- `/api/astrology/panchang`
- `/api/astrology/muhurta-lite`
- `/api/astrology/calculators`
- `/api/shop/checkout/init`

Behavior:

- keys missing: verification is skipped (no breakage)
- keys present + enforce false: best-effort validation
- keys present + enforce true: invalid/missing token is rejected

## High-Risk Areas Reviewed

- checkout/init path: server-side amount authority remains in checkout provider flow; client price is not trusted.
- webhook/payment path: signature verification delegated to provider webhook verification logic.
- admin event endpoint: role-gated + new rate guard + payload/origin guard.

## Remaining Security TODOs (non-blocking for this phase)

- Add production WAF/rule-set (Vercel/edge) for abusive user-agent filtering at CDN level.
- Add dedicated webhook replay-window enforcement if provider-specific timestamps are standardized.
- Add structured audit log sink (external) for security events if compliance requirements expand.
