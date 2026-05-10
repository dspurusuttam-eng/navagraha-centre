# Phase 27.4A - Guna Milan + Matchmaking Engine Foundation

## Files Changed

- `src/modules/astrology/matchmaking/foundation.ts`
- `src/modules/astrology/matchmaking/index.ts`
- `src/modules/astrology/index.ts`
- `scripts/debug-matchmaking-qa.ts`
- `package.json`
- `docs/phase-27.4A-guna-milan-matchmaking-engine-foundation.md`

## Input Structure

The foundation accepts:

- person A chart input
- person B chart input
- optional saved Kundli references for each person
- optional user-facing labels for each subject
- optional as-of timestamp

The engine uses verified chart data only. If either chart is missing, unverified, or missing Moon sign / nakshatra context, the foundation returns a safe unavailable state.

## Ashtakoota / Guna Milan Status

Implemented as a structured foundation with partial scoring support.

Ready in this phase:

- Tara
- Graha Maitri
- Gana
- Bhakoot
- Nadi

Pending in this phase:

- Varna
- Vashya
- Yoni

The pending kootas are included in the output structure with safe status and missing-reason fields. No fabricated score is returned for them.

## Output Structure

The foundation now returns:

- `matchScore`
- `maxScore`
- `kootaBreakdown[]`
- `summary`
- `strengths[]`
- `cautions[]`
- `missingData[]`
- `recommendationLevel`
- `safeSummary`
- `missingReason`

The snapshot also includes person-level summaries for A and B:

- label
- source label
- saved Kundli reference
- chart availability
- verification state
- Moon sign
- Moon nakshatra
- Moon pada
- Moon house

## Missing-Data Fallback

- If either chart is absent or unverified, the foundation returns `unavailable`.
- If Moon sign or nakshatra is missing, the foundation returns `unavailable`.
- Pending kootas remain explicitly marked instead of being fabricated.
- No raw chart JSON is exposed publicly.

## Marriage Report / AI Compatibility

The output is designed to feed:

- a future Matchmaking page
- marriage / compatibility report generation
- AI context builders
- consultation CTA flows

The structure is additive and safe to consume from report or AI pipelines later.

## Safety Rules

- No deterministic marriage success/failure claim
- No fear-based mismatch wording
- No caste/discriminatory wording
- No forced rejection advice
- No raw chart JSON leak
- No cross-user data leak

## QA Notes

Validation script:

- `npm run debug:matchmaking:qa`

Verified behavior:

- verified charts with 12-body compatibility input shape are accepted
- partial compatibility output is returned with safe pending sections
- missing Moon context returns a safe unavailable state

## Final Verdict

Phase 27.4A is complete as a safe Guna Milan / matchmaking foundation with partial Ashtakoota support and fallback behavior.

## Next Phase

Phase 27.4B - Manglik + Compatibility Intelligence
