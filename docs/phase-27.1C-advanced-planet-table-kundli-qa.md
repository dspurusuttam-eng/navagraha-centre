# Phase 27.1C - Advanced Planet Table + Kundli QA

## Files Changed
- `src/lib/astrology/chart-builder.ts`
- `src/modules/astrology/chart-contract-types.ts`
- `src/modules/astrology/components/chart-contract-panel.tsx`
- `src/modules/astrology/components/north-indian-chart.tsx`
- `src/modules/astrology/divisional/foundation.ts`
- `src/modules/astrology/divisional/index.ts`
- `src/modules/astrology/divisional/interpretation.ts`

## 12-Body Planet Table Status
- Supported bodies remain intact for:
  - Sun
  - Moon
  - Mars
  - Mercury
  - Jupiter
  - Venus
  - Saturn
  - Rahu
  - Ketu
  - Uranus
  - Neptune
  - Pluto
- The chart contract now carries optional per-planet enrichment for speed, dignity, and D1 divisional placement.
- North Indian chart rendering now includes outer-planet abbreviations so all 12 bodies remain visible in the existing layout.

## Fields Supported
For each planet row, the table supports:
- planet name
- rashi / sign
- longitude / degree
- nakshatra
- pada
- house
- retrograde
- speed, when the upstream chart contract has it
- dignity, when safely derived from the body/sign combination
- divisional placement, currently D1 only

## Fallback Behavior
- Missing speed, dignity, or divisional placement does not crash UI or API output.
- Older saved charts without the new optional enrichment still render safely.
- D9/D10 and the remaining divisional families stay on safe pending hooks rather than fabricated output.
- No raw internal JSON is exposed publicly.

## Kundli / Dashboard / Report / AI Compatibility
- Kundli generation remains compatible.
- Saved Kundli remains compatible.
- Active/default Kundli remains compatible.
- Dashboard active Kundli cards remain compatible.
- Premium report context remains compatible.
- AI context builder remains compatible.
- Divisional selector readiness remains compatible.

## Mobile / Rendering QA
- The planet table remains within the current clean layout.
- No horizontal overflow was introduced in the planet cards or chart panel.
- Outer planets are displayed with stable abbreviations in the North Indian chart view.

## Known Non-Blocking Gaps
- D7, D4, D12, and D60 remain readiness-only until a real divisional engine is added.
- Speed and dignity remain optional display enrichment rather than a hard requirement on older saved charts.
- Divisional placement is currently D1 only.

## Final Verdict
- The advanced planet table is stable, 12-body compatible, and safe-fallback ready.
- Saved Kundli, dashboard, reports, and AI remain compatible.
- Next phase: `27.1D Kundli Production Readiness`

