# Phase 27.5A - Dosha Detection Engine + Focused QA

## Files Changed
- `src/modules/astrology/dosha/foundation.ts`
- `src/modules/astrology/dosha/index.ts`
- `src/modules/astrology/index.ts`
- `scripts/debug-dosha-qa.ts`
- `package.json`

## Doshas Implemented
- Mangal Dosha
- Kaal Sarp Dosha
- Pitru Dosha
- Guru Chandal Dosha
- Grahan Dosha
- Shrapit / Shani-Rahu Pattern

## Detection Basis
- Uses normalized verified D1 chart data only.
- Requires `verification.is_verified_for_chart_logic` to be true.
- Returns calm structural readings using:
  - `doshaKey`
  - `doshaName`
  - `status`
  - `confidence`
  - `basis[]`
  - `affectedPlanets[]`
  - `affectedHouses[]`
  - `severity`
  - `cancellationOrMitigation[]`
  - `safeSummary`
  - `missingReason`

## Unavailable / Fallback Behavior
- Missing required chart data returns `unavailable`.
- No fabricated planet placements or house data are generated.
- Missing Moon / Rahu / Ketu / Saturn / Sun / Mars context is handled safely.
- Kaal Sarp now uses a verified Rahu-Ketu arc check and classifies correctly when the arc is present.

## Report / AI Compatibility
- Output is structured for:
  - report summaries
  - AI context builders
  - consultation follow-up
  - future dosha pages or tools

## Safety Wording Rules
- No fear-based claims.
- No guaranteed bad-event wording.
- No remedies are presented as guaranteed.
- Language stays practical and contextual.

## Known Gaps
- This phase is focused on detection and QA, not full remedy intelligence.
- Broader dosha interpretation and remediation strategy remain for later phases.

## Validation
- `npm run debug:dosha:qa` passed.
- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run build` passed.

## Next Phase
- `27.5B Yoga Detection + Remedy Mapping`
