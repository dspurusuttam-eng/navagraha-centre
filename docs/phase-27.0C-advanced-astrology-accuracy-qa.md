# Phase 27.0C - Advanced Astrology Accuracy QA

## Files changed
- `scripts/debug-astro-accuracy-qa.ts`
- `src/modules/astrology/providers/mock-deterministic-provider.ts`
- `package.json`

## Test cases added / checked
- Assam / India birth case
- International timezone birth case
- Midnight birth case
- Leap-year birth case
- Sign-boundary birth case
- Invalid DOB case
- Invalid time case
- Invalid place case
- Missing latitude case
- Missing timezone case

## 12-planet QA status
- Pass.
- All chart outputs checked by the QA script now include:
  - sign/rashi
  - longitude
  - degree
  - nakshatra
  - pada
  - house
  - retrograde flag
- The deterministic fallback provider was updated so Uranus, Neptune, and Pluto are no longer dropped from mock chart output.

## Timezone / geo QA status
- Pass.
- Local birth-time conversion remains stable for India and international timezone cases.
- Invalid local birth details are rejected safely.
- Missing coordinates or timezone values fail validation instead of silently falling back.

## Saved Kundli compatibility
- Pass.
- The 12-body chart output remains compatible with saved chart serialization and user-scoped chart flows.

## Report / dashboard compatibility
- Pass.
- Report, dashboard, and continuity-facing astrology consumers remain compatible with the normalized chart output.

## Bugs found / fixed
- Fixed a real compatibility blocker in the mock deterministic provider:
  - Uranus, Neptune, and Pluto were still being dropped from fallback chart output.
- Fixed the supporting fallback output path so the QA script and downstream consumers now see all 12 bodies.
- Tightened the QA script so it handles optional `nakshatras` safely.

## Remaining non-blocking issues
- Classical timing systems remain classical by design and do not use the outer planets for Vimshottari.
- The QA script uses the deterministic provider for repeatable verification, not the server-only live provider wrapper.

## Next phase
- `27.0D Astrology Intelligence Infrastructure`

## Validation result
- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run build`: passed
