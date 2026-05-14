# 32.1A Dasha Tool Page Foundation

Status: implemented, not committed.

## Files changed
- D:/PDS BDS/navagraha-centre/src/app/(marketing)/dasha/page.tsx

## Route created / updated
- Public route created: `/dasha`
- No prior public Dasha route existed in `src/app/(marketing)`.

## Dasha engine connection status
- Real Vimshottari foundation already exists in:
  - `src/modules/astrology/dasha/foundation.ts`
  - `src/modules/astrology/dasha/index.ts`
  - `src/modules/astrology/vimshottari-dasha.ts`
  - `src/modules/astrology/dasha-context.ts`
- The public `/dasha` foundation page does not fabricate calculation output.
- The page currently uses safe readiness states because no shared public birth form is exposed here.

## Fallback behavior
- If verified chart context is missing, the page shows safe empty-state cards instead of timing values.
- Mahadasha, Antardasha, and Pratyantardasha are presented as readiness states, not predictions.
- Timeline content is intentionally explanatory until verified chart data is available.

## Privacy / safety result
- No raw chart JSON is shown.
- No fake Dasha values are shown.
- No fear-based or guaranteed prediction language is used.
- Birth details are routed through the protected chart path rather than exposed in a fake public calculator.

## Notes on birth input
- A reusable public birth form was not found in the current codebase.
- The page therefore uses safe guidance cards and links into the protected Kundli/onboarding flow.

## Next phase
- 32.1B Dasha Tool Result UI + Timeline QA
