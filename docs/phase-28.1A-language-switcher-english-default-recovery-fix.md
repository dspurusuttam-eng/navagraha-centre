# Phase 28.1A - Language Switcher + English Default Recovery Fix

## Files changed
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

## Language switcher behavior
- The switcher now always exposes the primary live languages together as a stable set:
  - English
  - Assamese
  - Hindi
- The active language is shown as an explicit active state in the selector.
- English is labeled as the default recovery language so users can identify it quickly.
- The mobile compact switcher and the panel switcher now use the same route helper layer.

## English recovery behavior
- English is always visible as a route option in the primary language group.
- When English is active, it remains visible as the current/default language instead of disappearing from the selector.
- This prevents users from getting stuck in Assamese or Hindi views.

## Default language fallback
- English remains the safe fallback language.
- Invalid locale input resolves back to English through the existing localization runtime.
- Missing translation values fall back to the English copy bundle.
- No blank UI is introduced because of missing translation keys.

## Persistence behavior
- The existing locale cookie flow remains intact.
- Invalid or stale saved locale values are normalized and fall back safely to English.
- Switching back to English updates the request locale path/cookie flow through the same localization helpers.
- There is no new localStorage dependency in this phase.

## Route behavior
- `/en` continues to work as the English/default route family.
- `/as` continues to work as the Assamese route family.
- `/hi` continues to work as the Hindi route family.
- Switching language keeps the user on the equivalent page where the route exists.
- Alias routes now preserve locale correctly:
  - `/blog -> /articles`
  - `/monthly-rashifal -> /insights/monthly`
  - `/remedies -> /insights/remedies`
  - `/compatibility -> /marriage-compatibility`
  - `/navagraha-ai -> /ai`
- Unsupported or invalid locale input falls back to English safely.

## Mobile behavior
- The switcher remains usable in the header and footer on mobile.
- English is visible in the compact selector and in the panel selector.
- Existing wrapping and max-width constraints prevent horizontal overflow in normal use.

## SEO safety
- Canonical and hreflang handling remains unchanged and intact.
- Sitemap and robots behavior are not broken by this fix.
- Admin, dashboard, API, and private routes remain excluded from public language navigation.

## Known gaps
- There is still no physical `[locale]` route tree under `src/app`.
- The language system is middleware-driven rather than route-tree-driven.
- This phase fixes recovery and visibility, not full multilingual content authoring.

## Final verdict
- Users can now always switch back to English/default from the live language selector.
- Language visibility is stable on desktop and mobile.
- Fallback behavior stays safe and English remains the recovery path.

## Next phase
- Phase 29 - PWA / Mobile App-like Experience

