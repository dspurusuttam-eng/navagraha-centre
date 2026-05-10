# Phase 27.8A — Gemstone / Rudraksha / Mantra Remedy Engine

## Files Changed
- `src/modules/astrology/remedy/foundation.ts`
- `src/modules/astrology/remedy/index.ts`
- `scripts/debug-remedy-intelligence-qa.ts`
- `package.json`

## Remedy Categories Supported
- Gemstone recommendation readiness
- Rudraksha recommendation readiness
- Mantra recommendation
- Donation / charity remedy
- Vrat / discipline remedy
- Worship / spiritual practice remedy
- Daily lifestyle / spiritual guidance
- Consultation recommendation

## Output Structure
- `remedyKey`
- `remedyType`
- `title`
- `relatedPlanet`
- `relatedDoshaOrYoga`
- `basis[]`
- `suitability`
- `confidence`
- `safeDescription`
- `instructions[]`
- `cautions[]`
- `optional`
- `guaranteedResult`
- `missingReason`

## Gemstone / Rudraksha Safety Rules
- Gemstone suggestions always include a qualified-astrologer review caution before wearing.
- Rudraksha suggestions are optional and non-forced.
- No purchase pressure is introduced.
- No guaranteed result language is emitted.

## Mantra / Donation / Discipline Behavior
- Mantra suggestions remain calm and practical.
- Donation suggestions are modest and optional.
- Discipline and vrat suggestions stay health-aware and non-extreme.
- Worship and lifestyle suggestions remain gentle and non-fear-based.

## Dosha / Yoga Compatibility
- The engine reuses the 27.5 dosha/yoga layer where possible.
- Remedy suggestions can be built from dosha results, yoga results, or structured planetary weakness signals.
- The legacy remedy mapping wrapper still works for existing consumers.

## Report / AI / Dashboard Compatibility
- The new engine is additive and keeps the existing remedy integration safe.
- Outputs remain suitable for reports, AI context builders, and future dashboard surfaces.

## Fallback Behavior
- If no chart basis or structured remedy input is available, the engine returns `unavailable`.
- Missing or incomplete supporting data never fabricates remedies.
- Safe summary and missingReason are preserved for downstream consumers.

## Known Gaps
- Remedies are readiness-oriented guidance, not a substitute for human review.
- Gemstone and rudraksha choices remain optional and should be reviewed carefully.
- No new public UI surface was added in this phase.

## Next Phase
- Phase 27.8B — Daily Remedy + Safety QA + Production Readiness
