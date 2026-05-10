# Phase 27.5B - Yoga Detection + Remedy Mapping

## Files Changed
- `src/modules/astrology/constants.ts`
- `src/modules/astrology/index.ts`
- `src/modules/astrology/yoga/foundation.ts`
- `src/modules/astrology/yoga/index.ts`
- `src/modules/astrology/remedy/foundation.ts`
- `src/modules/astrology/remedy/index.ts`
- `scripts/debug-yoga-remedy-qa.ts`
- `package.json`

## Yogas Implemented
- Raj Yoga
- Dhan Yoga
- Vipreet Raj Yoga
- Neech Bhang Raj Yoga readiness
- Panch Mahapurush Yoga
- Chandra-Mangal Yoga
- Gaj Kesari Yoga
- Budhaditya Yoga

## Detection Basis
- Uses verified normalized chart data only.
- Leverages the existing yoga rule engine for structural candidates.
- Uses kendra / trikona / dusthana lord relationships, conjunctions, dignity checks, and Moon/Mars / Moon/Jupiter / Sun/Mercury links where safely available.
- Panch Mahapurush is detected from own-sign or exalted-sign graha placement in kendra houses.

## Remedy Mapping Structure
- `relatedYogaOrDoshaKey`
- `remedyType`
- `title`
- `safeDescription`
- `caution`
- `optional: true`
- `guaranteedResult: false`

## Unavailable / Fallback Behavior
- Missing required bodies return `unavailable` with a clear `missingReason`.
- Missing Moon data does not fabricate Chandra-Mangal or Gaj Kesari output.
- Missing chart context returns a safe unavailable snapshot.

## Report / AI Compatibility
- Output is structured for:
  - report summaries
  - AI context builders
  - consultation follow-up
  - future yoga / remedy pages

## Safety Wording Rules
- No guaranteed wealth/power/success claims.
- No fear-based language.
- No medical, legal, or financial claims.
- Remedies remain optional and advisory only.

## Known Gaps
- This phase is detection and mapping only, not a full remedy execution system.
- More detailed yoga interpretation can be added later without changing the chart contract.

## Validation
- `npm run debug:yoga:qa` passed.
- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run build` passed.

## Next Phase
- `27.5C Dosha/Yoga QA + Production Readiness`
