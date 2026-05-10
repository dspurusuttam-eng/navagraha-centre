# Phase 27.2C - Dasha QA + Production Readiness

## Files Checked / Changed
- `src/modules/astrology/dasha/foundation.ts`
- `src/modules/astrology/vimshottari-dasha.ts`
- `src/modules/astrology/dasha-context.ts`
- `src/modules/account/dashboard-hub.ts`
- `src/modules/account/components/dashboard-personal-hub.tsx`
- `scripts/debug-dasha-qa.ts`
- `package.json`

## Dasha Chain QA Status
- Current Mahadasha resolves correctly when verified Moon/nakshatra context is available.
- Current Antardasha resolves correctly from the nested Vimshottari chain.
- Current Pratyantardasha resolves correctly and is exposed in the foundation snapshot.
- Mahadasha, Antardasha, and Pratyantardasha timelines are stable and renderable.
- Safe unavailable states are returned when required inputs are missing.

## Edge-Case QA
- Missing Moon longitude returns a safe unavailable state.
- Missing Moon nakshatra returns a safe unavailable state.
- Missing birth context returns a safe unavailable state.
- Leap-year, midnight, old-birth, and future-date cases were exercised through the QA script.
- Valid India/Assam timezone input and valid international timezone input both resolve successfully.
- Invalid local-birth input does not fabricate Dasha data.

## Compatibility
- Saved Kundli compatibility is preserved.
- Active Kundli compatibility is preserved.
- Dashboard Current Dasha card compatibility is preserved.
- Full report compatibility is preserved.
- Career / marriage / finance / health report compatibility is preserved through the shared dasha context.
- AI context builder compatibility is preserved.
- Retention daily guidance compatibility is preserved.

## Safety / Fallback Behavior
- No fake Dasha output was introduced.
- No raw chart JSON is exposed publicly.
- No cross-user chart access was introduced.
- No deterministic prediction wording or fear-based wording was added.
- Null and missing input paths return safe unavailable snapshots.
- Invalid timezone conversion now fails safely instead of throwing.

## UI / API Result
- Dasha timeline surfaces render safely when present.
- Unavailable states remain clean.
- Mobile layout remains stable.
- API response shape is stable and still consumed by the dashboard/report/AI layers.

## Bug Fixed
- Local birth-time conversion in the Dasha foundation now catches invalid timezone failures and returns `null` instead of throwing.

## Known Non-Blocking Follow-Ups
- A dedicated public Dasha page is still not required for the current architecture.
- Interpretation copy can be tuned later if the product wants softer or more explicit explanatory language.

## Verdict
- Phase 27.2 is production-ready.
- The Vimshottari chain is safe, accurate enough for the current architecture, and compatible with dashboard/report/AI consumers.

## Next Phase
- `27.3 Transit / Gochar Intelligence`
