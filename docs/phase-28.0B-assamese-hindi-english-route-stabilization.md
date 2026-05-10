# Phase 28.0B - Assamese / Hindi / English Route Stabilization

## Files changed
- `src/modules/localization/routes.ts`
- `src/modules/localization/index.ts`
- `src/components/site/language-switcher.tsx`
- `src/components/site/header.tsx`
- `src/components/site/footer.tsx`
- `src/app/(marketing)/blog/page.tsx`
- `src/app/(marketing)/monthly-rashifal/page.tsx`
- `src/app/(marketing)/remedies/page.tsx`
- `src/app/(marketing)/compatibility/page.tsx`
- `src/app/(marketing)/navagraha-ai/page.tsx`
- `docs/phase-28.0B-assamese-hindi-english-route-stabilization.md`

## Language helpers / status
- Assamese: live and selectable as `as`
- English: live and selectable as `en`
- Hindi: live and selectable as `hi`
- Default fallback: English
- Route helper layer: centralized in `src/modules/localization/routes.ts`

## Route stabilization status
- `/as`, `/en`, and `/hi` remain supported through the existing middleware-driven locale rewrite flow.
- The route helper now centralizes locale-aware link generation so navigation, the language switcher, and redirect aliases use the same path logic.
- Locale-preserving redirects are now active for:
  - `/blog -> /articles`
  - `/monthly-rashifal -> /insights/monthly`
  - `/remedies -> /insights/remedies`
  - `/compatibility -> /marriage-compatibility`
  - `/navagraha-ai -> /ai`
- No fake translated pages were introduced.
- No locale route tree was added; stabilization is still middleware-based.

## Assamese rendering safety
- Assamese source text remains valid Unicode.
- No Bengali-style spelling conversion was introduced by code.
- Mobile wrapping remains governed by the existing responsive layout system.
- Locale-aware links preserve Assamese routing without mixing it into English fallbacks unless English is the explicit request path.

## English / Hindi readiness
- English remains the default fallback and canonical language for unsupported cases.
- Hindi is live and selectable, with metadata and content bundles already in place.
- Existing content overrides and localized SEO copy already support English, Assamese, and Hindi.

## Content / admin compatibility
- Content records already support `locale`, `translationGroup`, `seoTitle`, `seoDescription`, and `canonicalUrl`.
- Admin content pages continue to work with the current catalog-backed content model.
- No admin or dashboard route exposure was introduced.

## Metadata / fallback behavior
- Locale-specific SEO copy already exists in `src/lib/seo/seo-config.ts`.
- Canonical and alternate-language metadata continue to be built from the live locale set.
- The route helper now keeps redirect targets aligned with the active locale so canonical drift is less likely.
- Unsupported or missing locale input still falls back to English.

## Known gaps
- There is still no physical `[locale]` route tree under `src/app`.
- A fuller multilingual authoring workflow is not yet present in admin tooling.
- `/utilities` is still not a physical route alias; `/tools` remains the utility hub route.

## Final verdict
Route handling for Assamese, English, and Hindi is stable and consistent. The most important locale-drop redirects have been fixed, and the shared route helper now keeps language-aware navigation centralized.

## Next phase
Phase 28.0C - Multilingual SEO + Hreflang + QA

