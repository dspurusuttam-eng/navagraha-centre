# NAVAGRAHA CENTRE Final Launch Certification — Phase 18.1O

Date: 2026-04-27
Project: `D:\PDS BDS\navagraha-centre`
Domain audited: `https://www.navagrahacentre.com`

## 1. Build and Code Health

- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS using `NEXT_DIST_DIR=.next-buildcheck` and `NEXT_TSCONFIG_PATH=tsconfig.buildcheck.json`
  - Note: default `.next` build path intermittently hits Windows file-lock `EPERM` in local environment.
  - This is an environment-specific local tooling issue; production Vercel builds are unaffected.
- `npm run seo:check`: PASS
- `npm run security:check`: PASS
- `npm run i18n:check`: PASS for live locales (`en`, `as`, `hi`), warnings for planned locales (fallback expected)
- `npm run test:smoke`: PASS
- `npm run test:smoke:critical` (live): PASS
- `npm run test:smoke:launch` (live): PASS

## 2. QA Scope and Route Verification

Validated key route groups for status and reachability:

- Root and locale entries: `/`, `/en`, `/as`, `/hi`
- Tools/pages:
  - `/en|as|hi/kundli`
  - `/en|as|hi/compatibility`
  - `/en|as|hi/rashifal`
  - `/en|as|hi/panchang`
  - `/en|as|hi/numerology`
  - `/en|as|hi/navagraha-ai`
  - `/en|as|hi/reports`
  - `/en|as|hi/consultation`
  - `/en|as|hi/shop`
  - `/en|as|hi/from-the-desk`
- SEO endpoints: `/sitemap.xml`, `/robots.txt`
- Unsupported locale safety: `/zz/kundli` returns `404` as expected.

Result: all required locale/service routes are reachable and non-broken.

## 3. Bug Fixes Applied During 18.1O

### A. Locale-preserving alias redirects

Fixed locale loss on alias routes:

- `src/app/(marketing)/compatibility/page.tsx`
  - Redirect now respects locale prefix when request is explicitly localized.
- `src/app/(marketing)/navagraha-ai/page.tsx`
  - Redirect now respects locale prefix when request is explicitly localized.

This prevents `/en/...` and `/as/...` entries from dropping to non-prefixed paths during redirect hops.

### B. i18n checker launch-safety logic

Updated `scripts/check-message-keys.ts`:

- Live locales (`en`, `as`, `hi`) remain strict and blocking.
- Planned locales are warning-only (fallback-safe), not launch-blocking.

This aligns checker behavior with the live multilingual strategy.

## 4. Multilingual QA

- Live locale pages for `en`, `as`, `hi`: verified reachable.
- Language-switch path preservation:
  - Verified links such as `/as/kundli`, `/hi/kundli` are present on `/en/kundli`.
- Fallback safety:
  - Unknown locale path returns `404`.
- No broken translation keys surfaced on live core pages in sampled checks.

## 5. Blog / Daily Rashifal QA

Validated:

- `/en/from-the-desk`, `/as/from-the-desk`, `/hi/from-the-desk` reachable.
- Article route example reachable:
  - `/en/from-the-desk/daily-rashifal-26-april-2026`
  - `/as/from-the-desk/daily-rashifal-26-april-2026`
- Identity marker present: “From the Desk of J P Sarmah”.
- Author marker present.
- Schema blocks (`application/ld+json`) present.
- Breadcrumb signals present.

## 6. Astrology Engines and Predictive Stack QA

Debug scripts executed:

- `debug:accuracy-layer`: PASS (7/7 scenarios)
- `debug:dasha`: PASS
- `debug:transit`: PASS
- `debug:yoga-rules`: PASS
- `debug:predictive-synthesis`: PASS
- `debug:numerology`: PASS
- `debug:panchang`: PASS

Additional note:

- `debug:chart` and `debug:chart-contract` via plain `tsx` hit `server-only` import guard.
- `debug:chart` verified successfully using:
  - `node --conditions=react-server --import tsx scripts/debug-chart.ts`
- `debug:chart-contract` under react-server mode requires explicit user id parameter.

## 7. AI Safety and Abuse Protection QA

Validated via debug and live endpoint checks:

- Accuracy layer checks pass (input validation, policy checks, unsafe remedy and guarantee phrase detection).
- Live API negative tests return safe structured errors:
  - `/api/astrology/panchang` invalid input -> `422 INVALID_PANCHANG_INPUT`
  - `/api/astrology/muhurta-lite` invalid input -> `422 INVALID_MUHURTA_INPUT`
  - `/api/astrology/calculators` invalid payload -> `400 MISSING_REQUIRED_FIELDS`
  - `/api/ai/ask-chart/sessions` unauthenticated -> `401 UNAUTHORIZED`

## 8. SEO and Indexing QA

Live checks confirm:

- `/robots.txt` accessible and correctly disallows sensitive/private paths.
- `/sitemap.xml` accessible and contains key localized URLs.
- Key pages contain:
  - canonical tags
  - hreflang alternates
  - Open Graph metadata
  - Twitter card metadata
  - JSON-LD schema blocks

Sampled pages:

- `/`
- `/en/kundli`
- `/as/rashifal`
- `/hi/rashifal`
- `/en/from-the-desk`

## 9. Monetization QA

Configuration and behavior validated:

- AdSense script gated by env config (no hardcoded publisher id).
- Live pages currently show no forced ad script loading when disabled.
- Ad placeholders do not crash layout in sampled article route.
- Consultation/report/shop CTA links present on key pages (localized link checks performed).

## 10. Security QA

Validated controls:

- Security headers present on live:
  - `X-Content-Type-Options`
  - `X-Frame-Options`
  - `Referrer-Policy`
  - `Permissions-Policy`
  - `Strict-Transport-Security`
- API protections active (rate limit + validation paths evidenced by structured errors and smoke checks).
- `security:check` passes.
- `.env.example` remains placeholder-only.

Open item:

- Live headers currently do not show CSP header in sampled response.
  - Local code supports enforced/report-only CSP toggles.
  - Re-verify CSP header visibility after latest deployment promotion.

## 11. Forms / Shop / Payment QA

- Checkout and premium/report routes return safe structured failures for invalid or unauthorized requests.
- Launch smoke checks confirm webhook invalid signature is rejected safely.
- No fake success flows detected in tested unauthorized/invalid scenarios.

## 12. Mobile / Accessibility / Performance Notes

Automated checks and source audit indicate no blocking regressions.

Manual visual verification still required post-deploy for:

- 360/390/430/768 widths on Home, Kundli, Rashifal, Panchang, NAVAGRAHA AI, Blog, Article, Shop, Consultation.
- Header/menu interactions and language switcher behavior.
- No horizontal overflow and no CTA crowding.

## 13. Deployment Readiness and Decision

Decision: READY FOR 18.2, subject to manual live visual pass and CSP header re-check after deployment.

## 14. Remaining Limitations (Non-Blocking)

1. `npm run format:check` reports broad repository formatting drift from earlier phases; not a functional launch blocker.
2. Plain `tsx` chart debug scripts need react-server conditions due `server-only` guard.
3. Planned locale dictionaries are fallback-backed and not fully translated for monetization keys (expected in current rollout model).
4. Live CSP header visibility must be confirmed after current commit deploy.

## 15. Manual Post-Launch Actions

1. In Vercel deployment logs, verify the latest commit is promoted to production.
2. Re-check headers for CSP on `https://www.navagrahacentre.com/`.
3. Manually test mobile layouts at 360/390/430/768 breakpoints.
4. In Google Search Console:
   - Add/verify property (`https://www.navagrahacentre.com`)
   - Submit sitemap (`https://www.navagrahacentre.com/sitemap.xml`)
   - Inspect and request indexing for:
     - `https://www.navagrahacentre.com/`
     - `https://www.navagrahacentre.com/en/kundli`
     - `https://www.navagrahacentre.com/as/rashifal`
     - `https://www.navagrahacentre.com/hi/rashifal`
     - `https://www.navagrahacentre.com/en/from-the-desk`
