# Phase 28.0A - Multilingual Audit + Architecture

## Scope
This phase audits the current multilingual architecture for Assamese, English, Hindi, and future languages. It does not change translation content, astrology logic, SEO behavior, or route behavior.

## Files inspected
- `src/proxy.ts`
- `src/modules/localization/config.ts`
- `src/modules/localization/runtime.ts`
- `src/modules/localization/request.ts`
- `src/modules/localization/dictionary.ts`
- `src/lib/seo/metadata.ts`
- `src/lib/seo/seo-config.ts`
- `src/app/layout.tsx`
- `src/app/sitemap.ts`
- `src/app/robots.ts`
- `src/components/site/language-switcher.tsx`
- `src/modules/content/types.ts`
- `src/modules/content/seo.ts`
- `src/modules/content/localized-catalog.ts`
- `src/modules/content/adapter.ts`
- `src/modules/content/catalog.ts`
- `src/modules/admin/metadata.ts`
- `src/app/(marketing)/page.tsx`
- `src/app/(marketing)/blog/page.tsx`
- `src/app/(marketing)/articles/page.tsx`
- `src/app/(marketing)/from-the-desk/page.tsx`
- `src/app/(marketing)/daily-rashifal/page.tsx`
- `src/app/(marketing)/rashifal/page.tsx`
- `src/app/(marketing)/panchang/page.tsx`
- `src/app/(marketing)/remedies/page.tsx`
- `src/app/(marketing)/tools/page.tsx`
- `src/app/(marketing)/kundli/page.tsx`
- `src/app/(marketing)/reports/page.tsx`
- `src/app/(marketing)/consultation/page.tsx`
- `src/app/(marketing)/muhurta/page.tsx`
- `src/app/(marketing)/numerology/page.tsx`
- `src/app/(marketing)/navagraha-ai/page.tsx`
- `src/app/(marketing)/ai/page.tsx`
- `src/app/(marketing)/compatibility/page.tsx`
- `src/app/(marketing)/marriage-compatibility/page.tsx`
- `src/app/(marketing)/insights/page.tsx`
- `src/app/(marketing)/insights/[slug]/page.tsx`
- `src/app/(admin)/admin/content/page.tsx`
- `src/app/(admin)/admin/articles/page.tsx`

## Route status
### Existing multilingual/public routes
- `/` is localized through middleware and request locale detection.
- `/as/...` and `/hi/...` are supported through path prefix rewriting in `src/proxy.ts`.
- `/articles`, `/from-the-desk`, `/daily-rashifal`, `/rashifal`, `/rashifal/[sign]`, `/panchang`, `/remedies`, `/tools`, `/kundli`, `/reports`, `/consultation`, `/muhurta`, `/numerology`, `/ai`, and the broader marketing/content surface are present.
- `/blog` exists as a redirect to `/articles`.

### Missing or not yet physical
- There are no dedicated route trees under `src/app/[locale]`, `/en`, `/as`, or `/hi`.
- `/utilities` is not a physical route; `/tools` is the current hub route.
- No route tree duplication exists for localized pages; localization is middleware-driven.

### Broken routes
- No broken public route was identified in static inspection.
- Existing localized paths are resolved by middleware rewriting and locale headers rather than separate route folders.

### Duplicate content risk
- `/blog` and `/articles` overlap intentionally because `/blog` redirects to `/articles`.
- `articles`, `from-the-desk`, and `insights` can surface similar editorial content, so canonical handling and translation-group alternates matter.
- Locale-prefixed and root routes need stable canonical/hreflang pairing to avoid duplicate-language indexing.

### Route naming consistency
- Current naming is consistent at the marketing surface level: `kundli`, `rashifal`, `panchang`, `remedies`, `reports`, `consultation`, `tools`, `ai`.
- The only notable naming mismatch is the absence of a physical `/utilities` alias despite the hub concept using utility language.

## Content language audit
- English content is live and acts as the fallback language.
- Assamese content is live and loaded from `src/messages/as.json` and localized catalog overrides.
- Hindi content is live and loaded from `src/messages/hi.json` and localized catalog overrides.
- Future languages are already listed in localization config as planned locales.
- Mixed-language risk exists where catalog content uses explicit localized overrides and where editorial records are shared across locales by translation group.
- Fallback behavior is explicit: unsupported or missing locale values resolve to English.
- Hardcoded text still exists in marketing and admin surfaces, so a later content normalization pass will be needed if full CMS-driven multilingual publishing is desired.

## Assamese quality safety
- Assamese Unicode text is stored correctly in source and is not corrupted.
- I verified the underlying code points for Assamese labels; the terminal display mojibake was only an encoding issue in console output.
- `dir` and `lang` are set per locale in the document shell and language switcher, which helps rendering and accessibility.
- The current white UI system uses responsive wrapping and card layouts, so the main mobile overflow risk is low, but Assamese copy length still needs QA during any route stabilization work.

## SEO / hreflang audit
- `src/lib/seo/metadata.ts` already builds canonical URLs and alternates for all live locales.
- `src/app/sitemap.ts` already emits localized alternates and `x-default` entries for live locales.
- `src/app/robots.ts` is conservative and points to `/sitemap.xml`; it does not block localized public routes.
- Canonical and hreflang handling is ready for live locales, but the architecture still relies on middleware-based prefix handling rather than explicit locale route trees.

## Admin / content readiness
- The content model already supports `locale`, `translationGroup`, `seoTitle`, `seoDescription`, and `canonicalUrl`.
- The content adapter already expands localized entries and resolves per-locale alternates.
- Admin content pages currently inspect article and catalog records, but there is no dedicated multilingual editor surface in the inspected admin pages.
- This is sufficient for audit-stage localization, but a richer authoring workflow will be needed if each language is to be published independently at scale.

## Translation architecture recommendation
- Keep `src/modules/localization/config.ts` as the single source of truth for live/planned locales, prefix strategy, and locale metadata.
- Keep middleware/proxy rewriting as the routing backbone for now.
- Add a content translation model based on `locale` + `translationGroup`.
- Keep `en` as fallback, with explicit locale-specific overrides for Assamese and Hindi.
- Centralize metadata generation in the existing SEO helpers so canonical/hreflang logic stays consistent.
- Keep sitemap localization language-aware and translation-group aware.
- Add a later route-stabilization layer only if a dedicated `/en`, `/as`, `/hi` route tree becomes a product requirement.

## Exact files to modify in 28.0B
- `src/proxy.ts`
- `src/modules/localization/config.ts`
- `src/modules/localization/runtime.ts`
- `src/modules/localization/request.ts`
- `src/modules/localization/dictionary.ts`
- `src/lib/seo/metadata.ts`
- `src/app/layout.tsx`
- `src/app/sitemap.ts`
- `src/app/robots.ts`
- `src/components/site/language-switcher.tsx`
- `src/modules/content/types.ts`
- `src/modules/content/seo.ts`
- `src/modules/content/localized-catalog.ts`
- `src/modules/admin/metadata.ts`
- `src/app/(admin)/admin/content/page.tsx`
- `src/app/(admin)/admin/articles/page.tsx`
- `src/app/(marketing)/blog/page.tsx` only if a cleaner alias policy is required

## Known gaps
- There is no physical locale route tree yet.
- Admin content tooling is not yet a true multilingual authoring UI.
- Some editorial content is shared through translation groups rather than fully independent per-language records.
- `/utilities` is not a route alias yet; `/tools` is the current hub.

## Final verdict
The multilingual system is already structurally sound for Assamese, English, and Hindi, with planned support for more locales. The main remaining work is route stabilization and editorial workflow hardening in Phase 28.0B, not translation logic itself.

## Next phase
Phase 28.0B - Assamese / Hindi / English Route Stabilization
