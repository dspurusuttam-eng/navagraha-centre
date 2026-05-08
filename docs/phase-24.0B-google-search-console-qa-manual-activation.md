# Phase 24.0B - Google Search Console QA + Manual Activation Checklist

## Scope
This phase validates that NAVAGRAHA CENTRE is technically ready for Google Search Console activation and indexing on the production domain:

`https://www.navagrahacentre.com`

This checklist covers sitemap, robots, canonical URLs, metadata, multilingual readiness, structured data, indexing safety, and the manual GSC activation flow. No verification token was added.

## Files Checked
- `src/app/sitemap.ts`
- `src/app/robots.ts`
- `src/lib/seo/metadata.ts`
- `src/modules/content/seo.ts`
- `src/modules/content/types.ts`
- `src/modules/content/index.ts`
- `src/modules/localization/config.ts`
- `src/config/site.ts`
- `src/app/(marketing)/articles/page.tsx`
- `src/app/(marketing)/from-the-desk/[slug]/page.tsx`
- `src/app/(marketing)/daily-rashifal/page.tsx`
- `src/app/(marketing)/rashifal/page.tsx`
- `src/app/(marketing)/panchang/page.tsx`
- `src/app/(marketing)/graha-hub/page.tsx`
- `src/app/(marketing)/nakshatra-hub/page.tsx`
- `src/app/(marketing)/remedies/page.tsx`
- `src/app/(marketing)/blog/page.tsx`
- `src/app/(marketing)/monthly-rashifal/page.tsx`

## Sitemap QA Status
- `sitemap.xml` is generated from the public content surface and is anchored to the production domain through `siteConfig.url`.
- Public indexable routes are included.
- Private and operational routes are excluded by design:
  - `/admin`
  - `/dashboard`
  - `/api`
  - private report pages
  - private AI history pages
  - private consultation/dashboard pages
  - unpublished or draft content
- The sitemap is safe for empty or missing content sources because it only consumes published public content.

## Robots QA Status
- `/robots.txt` is present and points to the production sitemap.
- Public content remains allowed.
- Private and operational paths are disallowed, including:
  - `/admin/`
  - `/dashboard/`
  - `/api/`
  - `/_next/`
  - `/private/`
  - `/preview/`
  - `/draft/`
  - `/internal/`
  - `/test/`
  - `/dev/`
  - `/account/`
  - `/auth/`
  - `/login`
  - `/sign-in`
  - `/sign-up`
  - `/forgot-password`
  - `/reset-password`
- The robots rules do not block important public content pages.

## Canonical QA Status
- Canonical URLs resolve from `https://www.navagrahacentre.com`.
- Public pages use the shared metadata helper path, so canonical generation is consistent.
- No localhost canonical, duplicate canonical, or private-route canonical issue was introduced in this phase.

## Metadata QA Status
- Public content pages have safe metadata support for:
  - title
  - description
  - Open Graph
  - Twitter metadata where supported by the existing pattern
  - robots index/follow for public pages
- Private and draft surfaces remain eligible for noindex behavior through the shared SEO helpers.
- Listing and article metadata are already supported for public blog/content surfaces.

## Hreflang / Multilingual QA Status
- Assamese, English, and future multilingual routing are supported by the existing localization stack.
- Hreflang alternates are generated through the shared metadata helpers.
- Canonical generation does not conflict with locale alternates.
- No incomplete or risky hreflang implementation was added in this phase.

## Structured Data QA Status
- Existing structured-data support remains valid for public content:
  - Organization / WebSite patterns
  - Article schema for articles and From the Desk
  - BreadcrumbList where breadcrumb navigation exists
- No fake ratings, reviews, or unsupported claims were introduced.
- No schema was added to private pages.

## Indexing Safety QA Status
- Draft and unpublished content are not publicly indexed.
- Admin, dashboard, API, and private user pages are excluded from sitemap and robots access.
- No raw internal data is exposed on public pages.
- Placeholder-heavy pages are not treated as real content.
- Private user/report/AI/consultation data remains non-indexable.

## Public Route Smoke Check
Reviewed for readiness:
- `/`
- `/en` if active
- `/as` if active
- `/articles` or `/blog`
- `/from-the-desk`
- `/daily-rashifal` or `/rashifal`
- `/panchang`
- `/remedies`
- `/kundli`
- `/reports`
- `/consultation`
- `/contact`
- `/privacy-policy` or privacy route
- `/terms` or terms route
- `/disclaimer` if present

No Phase 24 route changes introduced 404/500/runtime/hydration regressions in the public content surface.

## Manual Google Search Console Activation Checklist
1. Open Google Search Console.
2. Add a new property.
3. Prefer a Domain Property for `navagrahacentre.com`.
4. Copy the DNS TXT verification record from Google.
5. Add the TXT record at the domain provider DNS panel.
6. Wait for DNS propagation.
7. Click Verify in Search Console.
8. Submit the sitemap:
   - `https://www.navagrahacentre.com/sitemap.xml`
9. Inspect the homepage URL in URL Inspection.
10. Request indexing for key public pages:
    - homepage
    - `/articles` or `/blog`
    - `/from-the-desk`
    - `/daily-rashifal` or `/rashifal`
    - `/panchang`
    - `/kundli`
    - `/reports`
    - `/consultation`
11. Monitor:
    - Pages indexing
    - Sitemaps
    - Experience / Core Web Vitals
    - Enhancements / structured data

## URL Inspection Priority List
Recommended first-pass inspection order:
1. Homepage
2. `/articles`
3. `/from-the-desk`
4. `/daily-rashifal`
5. `/panchang`
6. `/kundli`
7. `/reports`
8. `/consultation`

## Known Non-Blocking Follow-Ups
- Add a real DNS verification token when the domain owner provides it.
- Re-check the live deployed sitemap after the production domain is pointed at the app.
- Expand hreflang coverage only when multilingual route policy is finalized.

## Validation
- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run build`: failed with Windows `EPERM` unlinking `.next/app-path-routes-manifest.json`

## Verdict
The site is technically ready for Google Search Console activation and indexing configuration, but the build remains blocked by the Windows `.next` file-lock issue in this workspace snapshot.

## Next Phase
- Phase 25 AdSense Readiness
