# Phase 18.2 Post-Launch Activation Report

Date: 2026-04-28  
Project: `D:\PDS BDS\navagraha-centre`  
Domain: `https://www.navagrahacentre.com`

## 1. Repository Status

- `git status`: clean working tree at start.
- `git log --oneline -10`: includes latest 18.1O commits:
  - `c00cae0 docs: finalize phase 18.1O launch certification report`
  - `69fb69e chore: complete phase 18.1O launch certification`
- Branch: `main` up to date with `origin/main`.

## 2. Live Site Status

Reachability checks:

- `/` -> `200`
- `/en` -> `200`
- `/as` -> `200`
- `/hi` -> `200`

HTTPS/security:

- Valid HTTPS responses observed.
- No redirect loop observed during route checks.
- Security headers present in live response (including CSP, HSTS, X-Frame-Options).

## 3. Important Route Status

English:

- `/en/kundli` -> `200`
- `/en/compatibility` -> `307` (locale-safe redirect to `/en/marriage-compatibility`)
- `/en/rashifal` -> `200`
- `/en/panchang` -> `200`
- `/en/numerology` -> `200`
- `/en/navagraha-ai` -> `307` (locale-safe redirect to `/en/ai`)
- `/en/reports` -> `200`
- `/en/consultation` -> `200`
- `/en/shop` -> `200`
- `/en/from-the-desk` -> `200`

Assamese:

- `/as/kundli` -> `200`
- `/as/rashifal` -> `200`
- `/as/panchang` -> `200`
- `/as/from-the-desk` -> `200`

Hindi:

- `/hi/kundli` -> `200`
- `/hi/rashifal` -> `200`
- `/hi/panchang` -> `200`
- `/hi/from-the-desk` -> `200`

Safety:

- Unsupported locale test `/zz/kundli` previously validated as `404` safe behavior.

## 3A. Blog Route Naming Consistency

- Canonical live blog route: `/from-the-desk`.
- Legacy/alias route family `/insights` resolves to `/from-the-desk` for:
  - `/insights` -> `/from-the-desk`
  - `/en/insights` -> `/en/from-the-desk`
  - `/as/insights` -> `/as/from-the-desk`
  - `/hi/insights` -> `/hi/from-the-desk`
- Documentation should use `/from-the-desk` as the primary route name.

## 4. Sitemap Status

- `https://www.navagrahacentre.com/sitemap.xml` -> `200`
- Key URLs confirmed present:
  - `/en/kundli`
  - `/as/rashifal`
  - `/hi/rashifal`
  - `/en/from-the-desk`

## 5. Robots.txt Status

- `https://www.navagrahacentre.com/robots.txt` -> `200`
- Contains sitemap pointer to `/sitemap.xml`.
- Important public locale routes are not disallowed.
- Sensitive/internal areas are disallowed (`/api`, `/admin`, `/dashboard`, etc.).

## 6. Canonical and hreflang Status

Verified on sampled pages:

- `/`
- `/en/kundli`
- `/as/rashifal`
- `/hi/rashifal`
- `/en/from-the-desk`

For each sampled page:

- canonical present
- hreflang alternates present
- `x-default` present
- title + description present
- Open Graph metadata present

## 7. Google Search Console Manual Steps

Documented in:

- `docs/google-search-console-post-launch.md`

Includes:

- property add/verify
- sitemap submission
- URL Inspection targets
- indexing monitoring checklist

## 8. Mobile Manual Visual Checklist

Documented in:

- `docs/mobile-visual-check-18.2.md`

Includes widths (`360/390/430/768`) and page-level manual QA checklist.

## 9. Vercel Monitoring Checklist

Documented in:

- `docs/vercel-post-launch-monitoring.md`

Includes deployment status, domain/TLS, logs, API health, cache warm-up, and escalation conditions.

## 10. AdSense Readiness Notes

Documented in:

- `docs/adsense-post-launch-readiness.md`

Includes policy-safe activation guidance and environment flags:

- `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID`
- `NEXT_PUBLIC_ENABLE_ADSENSE`

## 11. Local Validation Results

- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS (local build can require alternate dist config due Windows `.next` file lock behavior)

## 12. Remaining Manual Actions

1. Execute manual mobile visual pass and fill checklist.
2. Execute GSC property verification and sitemap submission.
3. Monitor Vercel deployment/metrics after cache warm-up.
4. Enable AdSense only after Google approval and controlled env rollout.

## 13. Readiness for Phase 19

Status: READY.

All required post-launch activation checks for Phase 18.2 are completed/documented.  
No production-blocking issue identified in this phase.

## 14. Final Recommendation

Proceed to Phase 19 after completing the manual actions listed above (mobile visual pass + GSC activation + monitoring confirmation).
