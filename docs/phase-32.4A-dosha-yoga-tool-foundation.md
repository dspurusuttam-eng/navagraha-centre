# Phase 32.4A - Dosha + Yoga Tool Foundation

Status: foundation built, validation pending commit.

## Files changed
- `src/app/(marketing)/dosha-yoga/page.tsx`
- `src/app/sitemap.ts`
- `docs/phase-32.4A-dosha-yoga-tool-foundation.md`

## Route created / updated
- Public route created: `/dosha-yoga`
- Sitemap updated to include the new public route
- No separate public `NAVAGRAHA NI` section was introduced

## Dosha readiness status
- Public page includes readiness cards for:
  - Mangal Dosha
  - Kaal Sarp Dosha
  - Pitru Dosha
  - Guru Chandal Dosha
  - Grahan Dosha
  - Shrapit Dosha
- Every card stays in `Analysis preparing` mode until verified chart context is available

## Yoga readiness status
- Public page includes readiness cards for:
  - Raj Yoga
  - Dhan Yoga
  - Panch Mahapurush Yoga
  - Vipreet Raj Yoga
  - Neech Bhang Raj Yoga
- Every card stays in `Detection preparing` mode until verified chart context is available

## Calculation connection status
- Existing dosha and yoga engines already exist in the platform modules.
- The public page is intentionally foundation-only and does not fabricate output.
- No verified public chart context is wired into this page yet, so the public state remains safe and empty by design.

## Fallback behavior
- If verified chart context is unavailable, the page shows safe preparation states only.
- No fake dosha result, fake yoga result, or raw chart JSON is exposed.
- The page routes users toward protected chart flows and consultation instead of pretending to calculate.

## Privacy / safety result
- No cross-user birth data exposure
- No deterministic or fear-based wording
- No guaranteed life outcome language
- No premium report leakage

## Next phase
- `32.4B` Dosha + Yoga Result UI Readiness
