# Phase 18.2A Post-Launch Activation Final Report

Date: 2026-04-28  
Project: `D:\PDS BDS\navagraha-centre`  
Domain: `https://www.navagrahacentre.com`

## 1. Final Verdict

READY EXCEPT MANUAL ITEMS

Rationale:

1. Live routes, utility pages, and APIs passed smoke checks.
2. Protected APIs fail safely with `401` when unauthenticated.
3. SEO endpoints and metadata checks pass.
4. Remaining items are external/manual operations (GSC + Vercel dashboard checks).

## 2. Live Route Status

Core reachability:

1. `https://www.navagrahacentre.com/` -> `200`
2. `https://www.navagrahacentre.com/en` -> `200`
3. `https://www.navagrahacentre.com/as` -> `200`
4. `https://www.navagrahacentre.com/hi` -> `200`

Blog route naming verification:

1. `https://www.navagrahacentre.com/from-the-desk` -> `200` (canonical)
2. `https://www.navagrahacentre.com/insights` -> `200`, resolves to `/from-the-desk`
3. `https://www.navagrahacentre.com/en/insights` -> `200`, resolves to `/en/from-the-desk`
4. `https://www.navagrahacentre.com/as/insights` -> `200`, resolves to `/as/from-the-desk`
5. `https://www.navagrahacentre.com/hi/insights` -> `200`, resolves to `/hi/from-the-desk`

## 3. Utility Page Status

Locale routes:

1. `/en/tools` -> `200` -> final `/en/tools`
2. `/en/calculators` -> `200` -> final `/en/calculators`
3. `/en/muhurta` -> `200` -> final `/en/muhurta`
4. `/en/panchang` -> `200` -> final `/en/panchang`
5. `/en/numerology` -> `200` -> final `/en/numerology`

Root/non-locale routes:

1. `/tools` -> `200` -> final `/tools`
2. `/calculators` -> `200` -> final `/calculators`
3. `/muhurta` -> `200` -> final `/muhurta`
4. `/panchang` -> `200` -> final `/panchang`
5. `/numerology` -> `200` -> final `/numerology`

Content sanity:

1. No sampled utility page returned obvious `"This page could not be found"` or `"Internal Server Error"` markers.

## 4. Utility API Status

Public endpoint checks:

1. `POST /api/astrology/calculators` valid payload (`birth-number`) -> `200`
2. `POST /api/astrology/calculators` invalid payload -> `422` (`INVALID_INPUT`)
3. `POST /api/astrology/panchang` valid sample payload -> `200`
4. `POST /api/astrology/panchang` invalid payload -> `422` (`INVALID_PANCHANG_INPUT`)
5. `POST /api/astrology/muhurta-lite` valid sample payload -> `200`
6. `POST /api/astrology/muhurta-lite` invalid payload -> `422` (`INVALID_MUHURTA_INPUT`)
7. `GET /api/numerology` -> `404` (endpoint not present; numerology is served via calculators contract)

## 5. Protected API Guard Status

Unauthenticated checks:

1. `POST /api/astrology/chart` -> `401` (`UNAUTHORIZED`)
2. `GET /api/ai/ask-chart/sessions` -> `401`
3. `POST /api/ai/ask-chart/sessions` -> `401`
4. `GET /api/ai/ask-chart/sessions/demo-session` -> `401`
5. `POST /api/ai/ask-chart/sessions/demo-session/messages` -> `401`
6. `POST /api/report/premium/generate` -> `401`
7. `POST /api/subscriptions/checkout` -> `401`

Related public checkout route:

1. `POST /api/shop/checkout/init` (guest/empty payload) -> `400` (`BILLING_NAME_REQUIRED`) which is expected for validation failure, not auth failure.

## 6. Sitemap / Robots Status

1. `https://www.navagrahacentre.com/sitemap.xml` -> `200`
2. `https://www.navagrahacentre.com/robots.txt` -> `200`
3. `robots.txt` includes:
   - `Sitemap: https://www.navagrahacentre.com/sitemap.xml`
   - disallow rules for sensitive/internal paths
4. Important locale routes are not blocked.

## 7. Canonical / hreflang Status

Sampled pages:

1. `/`
2. `/en/kundli`
3. `/as/rashifal`
4. `/hi/rashifal`
5. `/en/from-the-desk`

Checks passed for sampled pages:

1. canonical present
2. hreflang alternates present
3. `x-default` present
4. title/description present
5. Open Graph tags present

## 8. Google Search Console Manual Actions

Documented in:

1. `docs/google-search-console-post-launch.md`

Operational recommendation:

1. Prefer Domain property (`navagrahacentre.com`) when DNS verification is available.
2. URL-prefix property (`https://www.navagrahacentre.com`) is acceptable for faster activation.
3. Submit sitemap and request indexing for priority URLs after property verification.

## 9. Vercel Live Health Checklist

Documented in:

1. `docs/vercel-post-launch-monitoring.md`

Additional verified items:

1. `https://navagrahacentre.com/` -> `308` to `https://www.navagrahacentre.com/`
2. `www` host serves `200` with HTTPS and security headers.

Manual-only items (dashboard access required):

1. latest deployment status
2. recent `500` function log scan
3. production environment warning scan

## 10. AdSense Manual Actions

Documented in:

1. `docs/adsense-post-launch-readiness.md`

Confirmed repo state:

1. `public/ads.txt` exists with placeholder guidance.
2. No fake publisher ID was added.

## 11. Remaining Manual Actions

1. Complete GSC property verification and submit sitemap.
2. Run Vercel dashboard checks (deployment status, runtime logs, env warnings).
3. Execute manual mobile visual sign-off using `docs/mobile-visual-check-18.2.md`.
4. Enable AdSense only after real publisher ID + policy readiness.

## 12. Proceed-to-Retention Decision

Safe to proceed to **Phase 18.2B Retention Foundation** after the manual external-platform checks above are completed.
