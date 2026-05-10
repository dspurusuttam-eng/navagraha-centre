# Phase 28.1B - Language Switcher QA + Git Cleanup

## Files checked
- `src/modules/localization/routes.ts`
- `src/components/site/language-switcher.tsx`
- `src/components/site/header.tsx`
- `src/components/site/footer.tsx`
- `src/app/(marketing)/blog/page.tsx`
- `src/app/(marketing)/monthly-rashifal/page.tsx`
- `src/app/(marketing)/remedies/page.tsx`
- `src/app/(marketing)/compatibility/page.tsx`
- `src/app/(marketing)/navagraha-ai/page.tsx`
- `docs/phase-28.1A-language-switcher-english-default-recovery-fix.md`
- `docs/phase-28.1B-language-switcher-qa-git-cleanup.md`

## English recovery QA
- English is visible in the primary language group in the switcher.
- English is marked as the default recovery language.
- English is shown as the active/default state when selected.
- Assamese and Hindi remain available in the same selector.
- The active language is clearly marked instead of disappearing from the menu.

## Route QA
- `/en` remains safe and reachable as the English route family.
- `/as` remains safe and reachable as the Assamese route family.
- `/hi` remains safe and reachable as the Hindi route family.
- Locale-preserving alias routes continue to resolve safely:
  - `/blog -> /articles`
  - `/monthly-rashifal -> /insights/monthly`
  - `/remedies -> /insights/remedies`
  - `/compatibility -> /marriage-compatibility`
  - `/navagraha-ai -> /ai`
- No 404/500 was introduced by the switcher changes.

## Persistence QA
- The existing locale cookie / request-locale flow remains intact.
- Invalid or stale saved locale values fall back safely to English.
- Clearing preference returns the safe default experience.
- No new localStorage dependency was introduced.

## Mobile / desktop QA
- The switcher remains usable in the header and footer layouts.
- English is visible in the compact and panel variants.
- Dropdown content is not cropped in normal responsive use.
- Existing wrapping rules prevent new horizontal overflow.
- Assamese text continues to wrap safely within the current UI system.

## SEO safety
- Canonical and hreflang behavior remain intact.
- Sitemap and robots behavior remain intact.
- Private/admin/dashboard/API routes remain excluded from public language navigation.
- No metadata regression was introduced.

## Fixes made
- Introduced a shared locale-route helper layer to keep localized navigation and redirects consistent.
- Ensured the primary language selector always exposes English as the recovery path.
- Preserved locale-aware redirects for common alias routes.

## Final verdict
- The language switcher now provides a stable English recovery path from supported languages.
- The multilingual UI remains safe on desktop and mobile.
- Phase 28.1 is ready to be committed cleanly.

## Next phase
- Phase 29 - PWA / Mobile App-like Experience

