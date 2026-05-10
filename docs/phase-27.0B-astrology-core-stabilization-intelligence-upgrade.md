# Phase 27.0B - Astrology Core Stabilization + Intelligence Upgrade

## Files changed
- `src/modules/astrology/constants.ts`
- `src/modules/astrology/types.ts`
- `src/lib/astrology/constants.ts`
- `src/lib/astrology/swiss-planetary-service.ts`
- `src/lib/astrology/ephemeris.ts`
- `src/lib/astrology/formatter.ts`
- `src/lib/astrology/planetary-verifier.ts`
- `src/lib/astrology/current-cycle.ts`
- `src/lib/astrology/rules/aspects.ts`
- `src/lib/astrology/rules/dasha.ts`
- `src/lib/astrology/rules/yoga-rule-engine.ts`
- `src/modules/ask-chart/chart-context-mapper.ts`
- `src/modules/ask-chart/service.ts`
- `src/modules/astrology/providers/mock-deterministic-provider.ts`
- `src/modules/onboarding/service.ts`

## 12-planet normalization status
- The canonical astrology registry now carries all 12 bodies:
  Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu, Uranus, Neptune, Pluto.
- Swiss ephemeris, chart formatting, chart verification, ask-chart mapping, transit priority ordering, mock provider fallback data, and UI-facing label maps now recognize the full registry.
- Classical timing systems remain classical by design:
  Vimshottari dasha continues to use the classical 9-body sequence only.

## Calculation pipeline upgrades
- Swiss ephemeris body mapping now includes Uranus, Neptune, and Pluto.
- Sidereal/Lahiri handling remains unchanged.
- Rahu/Ketu derivation remains derived from the node pair as before.
- No fake values were introduced on calculation failure; existing failure handling remains authoritative.

## Timezone / geo stabilization
- The birth-time conversion and timezone normalization paths remain intact.
- Invalid datetime, timezone, and coordinate inputs still fail safely.
- No new fallback timezone behavior was introduced.

## Serialization / API compatibility
- Chart serialization remains user-scoped and compatible with saved Kundli, dashboard, report, and AI consumers.
- Outer-planet support is preserved in the normalized chart model and related metadata.
- Public-facing chart surfaces do not expose private or internal-only fields.

## Divisional readiness
- The chart core remains reusable for D1 today.
- The registry and body mapping are now more suitable for future D9, D10, and other divisional hooks.
- No divisional chart fabrication was added.

## Security / privacy protections
- No cross-user chart leakage was introduced.
- No raw internal chart dump is exposed publicly.
- Errors remain safe and descriptive without leaking secrets.

## Known non-blocking follow-ups
- Outer planets are normalized across the chart stack, but classical timing systems intentionally remain classical.
- Future work can add explicit capability flags for:
  - display-only bodies
  - transit bodies
  - predictive bodies
  - classical-dasha bodies
- Further refinement may be needed if any downstream UI wants to visually distinguish classical vs outer bodies.

## Next phase
- `27.0C Advanced Astrology Accuracy QA`

## Implementation note
- The working tree still contains earlier uncommitted retention-phase files from previous phases. Those are inherited worktree changes and are not part of the 27.0B stabilization scope.
