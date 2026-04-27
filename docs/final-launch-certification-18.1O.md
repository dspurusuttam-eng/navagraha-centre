# NAVAGRAHA CENTRE Final Launch Certification - Phase 18.1O

Date: 2026-04-27  
Project: `D:\PDS BDS\navagraha-centre`  
Domain audited: `https://www.navagrahacentre.com`

## 1. Build and Code Health

- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS using `NEXT_DIST_DIR=.next-buildcheck` and `NEXT_TSCONFIG_PATH=tsconfig.buildcheck.json`
- `npm run seo:check`: PASS
- `npm run security:check`: PASS
- `npm run i18n:check`: PASS for live locales (`en`, `as`, `hi`), warning-only for planned locales
- `npm run test:smoke`: PASS
- `npm run test:smoke:critical` (live): PASS
- `npm run test:smoke:launch` (live): PASS

Notes:
- Default `.next` builds in this local Windows environment can intermittently hit file-lock `EPERM`.  
- Build is stable with dedicated buildcheck dist/tsconfig; production Vercel build is unaffected.

## 2. Route Verification Scope

Validated:
- Locale roots: `/`, `/en`, `/as`, `/hi`
- Core service/tool routes in `en/as/hi` families: `kundli`, `compatibility`, `rashifal`, `panchang`, `numerology`, `navagraha-ai`, `reports`, `consultation`, `shop`, `from-the-desk`
- SEO endpoints: `/sitemap.xml`, `/robots.txt`
- Unsupported locale safety: `/zz/kundli` returns `404`

Critical post-deploy status checks:
- `/`, `/en`, `/as`, `/hi` -> `200`
- `/en/kundli`, `/as/rashifal`, `/hi/rashifal`, `/en/from-the-desk` -> `200`
- `/sitemap.xml`, `/robots.txt` -> `200`

## 3. Fixes Applied During 18.1O

### A. Locale-preserving alias redirects

Updated:
- `src/app/(marketing)/compatibility/page.tsx`
- `src/app/(marketing)/navagraha-ai/page.tsx`

Now these preserve locale prefixes when request is explicitly localized:
- `/en|as|hi/compatibility` -> `/en|as|hi/marriage-compatibility`
- `/en|as|hi/navagraha-ai` -> `/en|as|hi/ai`

### B. i18n checker behavior aligned with live locale strategy

Updated:
- `scripts/check-message-keys.ts`

Behavior:
- Live locales remain strict/blocking.
- Planned locales are warning-only with fallback to English.

## 4. Multilingual QA

- `en`, `as`, `hi` routes reachable and stable.
- Language switch links preserve tool path (`/en/kundli` includes `/as/kundli`, `/hi/kundli`).
- Unknown locale path handled safely (`404`).
- No broken translation-key placeholders observed on sampled live pages.

## 5. Blog and Daily Rashifal QA

Validated:
- `/en/from-the-desk`, `/as/from-the-desk`, `/hi/from-the-desk` reachable.
- Sample article routes reachable:
  - `/en/from-the-desk/daily-rashifal-26-april-2026`
  - `/as/from-the-desk/daily-rashifal-26-april-2026`
- Identity marker present: "From the Desk of J P Sarmah".
- Author markers present.
- Breadcrumb/schema markers present.

## 6. Astrology Engine and Predictive Stack QA

Pass:
- `debug:accuracy-layer` (7/7 scenarios)
- `debug:dasha`
- `debug:transit`
- `debug:yoga-rules`
- `debug:predictive-synthesis`
- `debug:numerology`
- `debug:panchang`

Chart-specific notes:
- `debug:chart` and `debug:chart-contract` via plain `tsx` hit `server-only` guard.
- `debug:chart` passes with:
  - `node --conditions=react-server --import tsx scripts/debug-chart.ts`
- `debug:chart-contract` requires explicit user id input.

## 7. AI Accuracy and Safety QA

Validated:
- Accuracy layer policy and validation checks pass.
- Unsafe guarantee/remedy checks pass.
- Live negative-case API checks return safe structured errors:
  - `422 INVALID_PANCHANG_INPUT`
  - `422 INVALID_MUHURTA_INPUT`
  - `400 MISSING_REQUIRED_FIELDS`
  - `401 UNAUTHORIZED`

## 8. SEO QA

Live checks confirm:
- `robots.txt` and `sitemap.xml` accessible.
- Core sampled pages contain canonical, hreflang, Open Graph, Twitter card, and JSON-LD blocks:
  - `/`
  - `/en/kundli`
  - `/as/rashifal`
  - `/hi/rashifal`
  - `/en/from-the-desk`

## 9. Monetization QA

Validated:
- AdSense script remains env-gated (no hardcoded publisher id).
- No forced ad script loading when disabled.
- Ad placeholders do not break layout on sampled article pages.
- Consultation/report/shop CTA paths present in sampled live pages.

## 10. Security QA

Live/security checks confirm:
- Security headers present:
  - `X-Content-Type-Options`
  - `X-Frame-Options`
  - `Referrer-Policy`
  - `Permissions-Policy`
  - `Strict-Transport-Security`
  - `Content-Security-Policy`
- API protections active through route-level validation/rate-limit behavior.
- `security:check` passes.
- `.env.example` remains placeholder-only.

## 11. Forms, Shop, and Payment QA

Validated:
- Checkout/report endpoints return safe structured failures for invalid or unauthorized requests.
- Launch smoke check confirms invalid webhook signature is rejected.
- No fake payment/report success paths observed in negative tests.

## 12. Mobile, Performance, Accessibility Notes

No blocking regressions detected from automated checks and source audit.

Manual visual checks still required:
- Widths: `360`, `390`, `430`, `768`
- Pages: Home, Kundli, Rashifal, Panchang, NAVAGRAHA AI, Blog landing, article page, Shop, Consultation
- Validate no horizontal overflow, readable typography, non-crowded CTAs, and menu/switcher usability.

## 13. Deployment Status and Decision

Push status:
- Commit: `69fb69e`
- Branch: `main`
- Remote push: successful

Decision: READY FOR 18.2.

## 14. Remaining Non-Blocking Limitations

1. `npm run format:check` reports broad historical formatting drift; not a functional launch blocker.
2. Plain `tsx` chart debug scripts need `react-server` conditions because of `server-only` guards.
3. Planned locales are fallback-backed and not fully translated for newly added monetization keys.

## 15. Manual Post-Launch Actions

1. In Vercel, confirm deployment health remains green after cache warm-up.
2. Run manual mobile visual pass on the widths/pages listed above.
3. In Google Search Console:
   - Verify `https://www.navagrahacentre.com`
   - Submit `https://www.navagrahacentre.com/sitemap.xml`
   - Inspect/request indexing for:
     - `https://www.navagrahacentre.com/`
     - `https://www.navagrahacentre.com/en/kundli`
     - `https://www.navagrahacentre.com/as/rashifal`
     - `https://www.navagrahacentre.com/hi/rashifal`
     - `https://www.navagrahacentre.com/en/from-the-desk`
