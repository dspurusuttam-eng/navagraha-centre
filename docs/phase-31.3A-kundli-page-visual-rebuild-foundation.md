# Phase 31.3A — Kundli Page Visual Rebuild Foundation

## Files Changed
- `src/app/(marketing)/layout.tsx`
- `src/app/(marketing)/kundli/page.tsx`
- `src/components/graphics/kundli-page-visual.tsx`
- `src/modules/account/components/saved-kundli-manager.tsx`
- `src/modules/kundli/kundli-foundation.ts`

## Kundli Hero Result
- The public `/kundli` page keeps the requested premium white hero with the exact title and subtitle.
- The hero visual is brighter and cleaner, with lighter gold emphasis and a more premium snapshot presentation.
- The hero still uses the existing chart preview structure without fake Kundli data.
- The shared marketing layout wrapper keeps the mobile bottom bar spacing stable without affecting Kundli logic.

## Form Polish Result
- The saved-Kundli form surface in the dashboard now has a clearer premium card structure.
- Required fields are visually more explicit, and the inputs have stronger borders and cleaner spacing.
- Validation, field names, submit logic, API calls, and chart behavior were not changed.

## Intelligence Preview Result
- The Kundli intelligence preview remains aligned to the requested feature preview items:
  - Lagna Chart
  - 12 Planet Table
  - Nakshatra & Pada
  - Vimshottari Dasha
  - Transit Context
  - NAVAGRAHA AI Guidance
- No fake planetary positions or generated chart output were added.

## Privacy Trust Note Result
- The exact privacy trust note remains in place and is visually separated for clarity.

## After Your Kundli Result
- The post-Kundli actions now point to the safe routes requested for timing, reports, AI, and human consultation.
- All route targets remain aligned to existing public or safe internal paths.

## Mobile QA Result
- The Kundli page and saved-Kundli form remain mobile-friendly across the requested widths.
- The new visual changes preserve readable stacking, visible CTAs, and stable spacing.
- The homepage mobile action bar does not interfere with the Kundli content flow in the marketing layout.

## Regression Result
- `/kundli` still loads.
- The Kundli generation and saved-Kundli flows were not altered functionally.
- Homepage, tools, reports, consultation, multilingual routes, sitemap, robots, dashboard, and admin behavior were not intentionally changed.

## Known Follow-Ups
- None for this phase beyond the existing roadmap items already tracked elsewhere.

## Final Verdict
- Phase 31.3A is a visual foundation pass only. It keeps the Kundli experience bright, premium, white, readable, and calculation-safe.

## Next Phase
- `31.3B Kundli Result / Chart / Planet Table Visual Polish`
