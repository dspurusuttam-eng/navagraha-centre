# Phase 27.2A - Vimshottari Dasha Engine + Timeline Foundation

## Files Changed
- `src/modules/astrology/dasha/foundation.ts`
- `src/modules/astrology/dasha/index.ts`
- `src/modules/account/dashboard-hub.ts`
- `src/modules/account/components/dashboard-personal-hub.tsx`

## Vimshottari Calculation Status
- Vimshottari Mahadasha calculation is now exposed through a safe foundation wrapper.
- The foundation reuses the existing Moon nakshatra-based engine and does not fabricate timing data.
- Current Mahadasha is derived from the active timeline when the chart context is valid.

## Input Requirements
- Required inputs are:
  - verified chart context
  - Moon longitude / Moon nakshatra context
  - birth UTC or a safely convertible birth date/time/timezone combination
- If Moon or nakshatra context is missing, the foundation returns a safe unavailable state.
- If the chart cannot be converted safely, no fallback Dasha is fabricated.

## Timeline Output Shape
- The new foundation output includes:
  - `dashaType`
  - `currentMahadasha`
  - `timeline[]`
  - `birthBalance`
  - `safeSummary`
  - `missingReason`
  - `asOfDateUtc`
- Timeline entries keep only stable public fields and remain privacy-safe.

## Dashboard / Report / AI Compatibility
- Dashboard now has a lightweight Mahadasha timeline block.
- Existing report and AI compatibility remains intact because the core dasha context contract is unchanged.
- The new foundation is additive and safe to reuse by future Dasha pages or tools.

## Fallback Behavior
- Missing chart context returns an unavailable snapshot.
- Missing Moon nakshatra returns an unavailable snapshot.
- Invalid birth conversion returns an unavailable snapshot.
- No guaranteed prediction language or fear-based wording was introduced.

## Known Gaps
- Antardasha, Pratyantardasha, and daily dasha interpretation remain part of the next phase.
- The dashboard timeline is a foundation view, not a full dedicated Dasha page.

## Final Verdict
- Phase 27.2A is complete as a safe Vimshottari Dasha foundation with timeline output and dashboard integration.

## Next Phase
- `27.2B Antardasha + Pratyantardasha + Interpretation Readiness`

