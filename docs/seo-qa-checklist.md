# SEO QA Checklist (Phase 18.1L)

## Technical Endpoints

- [ ] `https://navagrahacentre.com/sitemap.xml` returns valid XML.
- [ ] `https://navagrahacentre.com/robots.txt` returns expected allow/disallow.
- [ ] Sitemap URL is declared inside robots.txt.

## Canonical + Hreflang

- [ ] Home canonical is correct.
- [ ] Core tools have canonical URLs.
- [ ] Core pages expose `en`, `as`, `hi` alternates.
- [ ] `x-default` is present where expected.
- [ ] No hreflang links point to broken URLs.

## Index / Noindex Control

- [ ] Public marketing pages are indexable.
- [ ] Blog desk and published articles are indexable.
- [ ] Daily Rashifal articles are indexable.
- [ ] Admin/dashboard/private/test routes are not indexable.
- [ ] Auth/account/cart/system routes are controlled correctly.

## Page Metadata Quality

- [ ] Core pages have non-empty unique title and description.
- [ ] Open Graph metadata is present.
- [ ] Twitter card metadata is present.
- [ ] Locale-aware metadata resolves correctly for `/en`, `/as`, `/hi`.

## Schema Validation

- [ ] Organization schema present globally.
- [ ] WebSite schema present globally.
- [ ] LocalBusiness/ProfessionalService schema present globally.
- [ ] Service/Breadcrumb schemas present on core service pages.
- [ ] Article/BlogPosting schema present on content detail pages.
- [ ] Schema JSON-LD validates in Rich Results test (sample URLs).
- [ ] No fake review/rating schema fields are present.

## Content and Blog SEO

- [ ] Blog landing shows authority identity: From the Desk of J P Sarmah.
- [ ] Article pages include author/date context.
- [ ] Daily Rashifal slugs are stable and date based.
- [ ] Internal links connect article-to-tool and tool-to-service paths.

## Image SEO

- [ ] Key images include descriptive alt text.
- [ ] Above-the-fold images have sensible loading behavior.
- [ ] Non-critical images are lazy loaded where possible.

## Validation Commands

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run seo:check`
- [ ] `npm run build`

## Search Console Readiness

- [ ] Property verified for `https://navagrahacentre.com`.
- [ ] Sitemap submitted.
- [ ] Core URLs manually inspected.
- [ ] Hreflang and indexing reports reviewed after deployment.
