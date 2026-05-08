# Phase 24.0A - Google Search Console + Indexing Readiness

## Summary
Phase 24.0A prepares NAVAGRAHA CENTRE for Google Search Console activation by tightening sitemap, robots, canonical, metadata, multilingual, and indexing-safety behavior for the public site.

## Current Root
`D:\PDS BDS\navagraha-centre`

## Files Changed
- `src/app/sitemap.ts`
- `src/app/robots.ts`
- `src/lib/seo/metadata.ts`
- `src/app/(marketing)/blog/page.tsx`
- `src/app/(marketing)/remedies/page.tsx`
- `src/app/(marketing)/monthly-rashifal/page.tsx`
- `docs/phase-24.0A-google-search-console-indexing-readiness.md`

## Sitemap Status
- Sitemap includes public indexable routes such as homepage, `/articles`, `/from-the-desk`, public From the Desk content, `/daily-rashifal`, `/rashifal`, `/panchang`, `/consultation`, `/reports`, shop products, and existing localized content groups.
- `/articles` was added as the canonical blog/article index route.
- Public alias routes `/blog`, `/remedies`, and `/monthly-rashifal` were added as safe redirects for user navigation, but they are not intended to be indexed as separate content surfaces.
- Admin, dashboard, API, and private routes remain excluded.
- Draft/unpublished content is not sourced into sitemap entries because the content adapter only returns published public entries.

## Robots Status
- `robots.txt` allows public content and disallows:
  - `/api/`
  - `/admin/`
  - `/dashboard/`
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
- Private support, auth, dashboard, and admin surfaces are blocked from indexing.
- Sitemap reference remains present.

## Canonical URL Status
- Public pages use canonical URLs derived from the configured site URL in `siteConfig`.
- Canonical generation no longer points to localhost in public metadata paths.
- `/articles` now has canonical-safe listing metadata.
- From the Desk, Daily Rashifal, Rashifal, Panchang, and other public pages continue using the repository’s existing canonical helper patterns.

## Metadata Status
- Public content metadata supports:
  - title
  - description
  - canonical URL
  - Open Graph
  - Twitter card
  - robots index/follow
  - language alternates where locale-aware content exists
- Listing metadata helpers were added for `/articles`.
- Draft/private surfaces remain eligible for noindex behavior through the shared metadata helper.

## Hreflang / Multilingual Status
- Assamese and English localization are already supported by the route and sitemap infrastructure.
- hreflang alternates are generated through the localization helpers already in the repo.
- The new article listing uses the same locale-aware metadata and sitemap flow.
- Hindi and future Indian language routes remain structurally compatible.
- Mixed-language corruption was not introduced.

## Indexing Safety Status
- Draft/unpublished content remains hidden from public content surfaces.
- Admin, dashboard, AI history, private report, and consultation history routes are excluded from sitemap and robots indexing.
- No placeholder-heavy content was published as real public content.
- No unsafe internal data was added to public pages.
- Redirect aliases do not expose private data and do not create new indexable content families.

## Structured Data Status
- Existing structured data support remains in place for:
  - Organization / WebSite foundations via the site and metadata helpers
  - Article schema on public detail pages
  - BreadcrumbList on detail and listing pages
  - CollectionPage for the desk and article listing surfaces
- No fake ratings, reviews, or unsupported claims were introduced.
- No schema was added for private pages.

## Google Search Console Verification Readiness
- No real GSC verification token was added because none was provided.
- Domain property verification through DNS remains the recommended setup.
- URL-prefix verification is also supported if needed.
- The codebase is now ready for manual GSC verification once the user adds the property in Google Search Console.

## Manual GSC Activation Checklist
1. Open Google Search Console.
2. Add the domain property for `navagrahacentre.com`.
3. Verify ownership using DNS TXT records at the domain provider.
4. Submit the sitemap URL from `https://www.navagrahacentre.com/sitemap.xml`.
5. Inspect homepage, `/articles`, `/from-the-desk`, `/daily-rashifal`, `/rashifal`, and `/panchang`.
6. Request indexing for key public pages after verification.
7. Monitor Coverage, Page Experience, and Enhancements reports.
8. Keep private routes excluded from sitemap and robots.

## Known Non-Blocking Follow-Ups
- Add a blog-specific content governance workflow if the editorial team wants `/blog` to become the canonical public root instead of `/articles`.
- Expand multilingual publishing depth beyond Assamese/English when translated content is ready.
- Continue improving structured data coverage for any future category/archive pages.

## Final Verdict
- The site is technically ready for Google Search Console activation.
- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run build`: blocked by Windows `EPERM` while unlinking `.next/app-path-routes-manifest.json`
- Because build did not complete, the codebase is technically SEO-ready but not fully build-verified in this environment.

## Next Phase
- `24.0B Google Search Console QA + Manual Activation Checklist`
