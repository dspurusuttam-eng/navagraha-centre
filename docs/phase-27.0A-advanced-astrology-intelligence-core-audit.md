# Phase 27.0A - Advanced Astrology Intelligence Core Audit

## Scope
This audit reviewed the current astrology core, including Swiss Ephemeris integration, chart generation, persistence, retrieval, transit/dasha/predictive layers, AI chart mapping, and rendering compatibility.

## Files Inspected
- `src/lib/astrology/swiss-planetary-service.ts`
- `src/lib/astrology/ephemeris.ts`
- `src/lib/astrology/chart-builder.ts`
- `src/lib/astrology/chart-generator.ts`
- `src/lib/astrology/house-engine.ts`
- `src/lib/astrology/lagna-engine.ts`
- `src/lib/astrology/formatter.ts`
- `src/lib/astrology/transit-engine.ts`
- `src/lib/astrology/birth-context-engine.ts`
- `src/lib/astrology/planetary-verifier.ts`
- `src/lib/astrology/rules/aspects.ts`
- `src/lib/astrology/rules/dasha.ts`
- `src/lib/astrology/rules/yoga-rule-engine.ts`
- `src/modules/astrology/constants.ts`
- `src/modules/astrology/types.ts`
- `src/modules/astrology/provider.ts`
- `src/modules/astrology/service.ts`
- `src/modules/astrology/chart-contract.ts`
- `src/modules/astrology/chart-contract-types.ts`
- `src/modules/astrology/chart-persistence.ts`
- `src/modules/astrology/chart-retrieval.ts`
- `src/modules/astrology/transit-context.ts`
- `src/modules/astrology/predictive-synthesis-context.ts`
- `src/modules/astrology/components/north-indian-chart.tsx`
- `src/modules/astrology/components/chart-contract-panel.tsx`
- `src/modules/ask-chart/chart-context-mapper.ts`
- `src/modules/ask-chart/assistant-response-engine.ts`
- `src/modules/ask-chart/service.ts`
- `src/modules/astrology/providers/swisseph-vedic-provider.ts`
- `src/modules/astrology/providers/circular-natal-horoscope-provider.ts`
- `src/modules/astrology/providers/mock-deterministic-provider.ts`
- `src/modules/astrology/fixtures.ts`
- `prisma/schema.prisma`

## Executive Summary
The current astrology core is production-structured, privacy-safe, and modular, but it is still a **9-body core** in practice:

- Supported in the live calculation stack: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu
- Not yet represented end-to-end: Uranus, Neptune, Pluto

The system already has strong chart validation, saved-chart persistence, transit/dasha scaffolding, and AI mapping. The main gap is that the canonical graha registry, formatter, providers, and downstream consumers do not yet support all 12 requested planetary bodies.

## Swiss Ephemeris Audit
### Strengths
- Swiss Ephemeris is wired into the server-side calculation path.
- Lahiri sidereal mode is consistently configured.
- Birth context validation is strict.
- Coordinates are required for real chart generation.
- The engine has clear error paths instead of silent null output.
- The runtime can use an ephemeris file path when present and a Moshier fallback when not.

### Weaknesses
- The current Swiss planetary service calculates only:
  - Sun
  - Moon
  - Mars
  - Mercury
  - Jupiter
  - Venus
  - Saturn
  - Rahu
  - Ketu derived from Rahu
- Uranus, Neptune, and Pluto are not requested from Swiss Ephemeris anywhere in the production calculation path.
- A mock fallback exists if the Swiss provider fails to load, which is safe for resilience but still means the system can run without the real provider if the environment is incomplete.

### Missing Abstractions
- No shared graha registry that separates:
  - classical Jyotish bodies
  - nodal bodies
  - outer planets
- No unified planetary capability matrix for:
  - sign
  - longitude
  - nakshatra
  - pada
  - house
  - retrograde
  - combustion
  - divisional chart eligibility

## 12-Planet Audit
### Result
The requested 12-body model is **not fully supported yet**.

### Supported Today
- Sun / Ravi
- Moon / Chandra
- Mars / Mangal
- Mercury / Budh
- Jupiter / Brihaspati
- Venus / Shukra
- Saturn / Shani
- Rahu
- Ketu

### Missing Today
- Uranus
- Neptune
- Pluto

### Downstream Gaps
- `PlanetaryBody` type only includes 9 bodies.
- `planetaryBodies`, `planetLabelMap`, `planetSortOrder`, dasha sequencing, and many label maps are 9-body only.
- Swiss planetary generation only emits 9 bodies.
- Transit generation only emits 9 bodies.
- AI and dashboard mapping only know the 9-body set.
- Fixture data is also 9-body only.

### Serialization / Storage
- The Prisma `chartData` JSON envelope is flexible enough to store more fields.
- The application contracts still narrow the data to 9 bodies, so new bodies would be lost or rejected unless the type layer is widened.

## Astronomy Intelligence Audit
### Strengths
- Ascendant and house logic are separated from planet generation.
- Rahu/Ketu are derived consistently.
- Retrograde logic is explicit.
- Combustion logic is explicit for classical planets.
- Sign boundary and nakshatra computations are deterministic.
- Dasha, transit, yoga, and predictive synthesis are modular.

### Weaknesses
- Outer planets are absent from the core intelligence model.
- Transit-to-natal mapping currently uses only the core bodies.
- Several downstream ranking and explanation routines are built around the 9-body registry.
- There is no shared feature flag or capability flag to distinguish core Jyotish bodies from auxiliary astronomical bodies.

### Time / Boundary Handling
- UTC conversion uses explicit timezone-aware conversion.
- Midnight and DST boundary handling are present in the birth-context path.
- No evidence of fake fallback timestamps was found.

## Geo + Timezone Audit
### Strengths
- Timezone resolution is explicit.
- Geocoding is provider-based with clear error codes.
- India / Assam-style local inputs are compatible with the existing IANA timezone flow.
- Timezone conversion is not silently guessed; it fails with structured errors when invalid.

### Weaknesses
- The system depends on external geocoding providers for place resolution when coordinates are not already known.
- Historical timezone consistency is only as strong as the geocoder / timezone source.

## House + Bhava Audit
### Strengths
- Whole-sign house generation is complete and stable.
- House count is validated to 12.
- Lagna and house computation are separated.
- Planet-to-house mapping is deterministic.

### Weaknesses
- Lagna calculation uses Placidus for ascendant resolution, while the main chart contract is whole-sign based.
- This is not necessarily incorrect, but it is a conceptually mixed model that should be documented and stabilized before adding more advanced chart variants.

### Readiness
- House/Bhava logic is sound for the current 9-body core.
- It is ready for a registry-driven upgrade, but not yet ready for a broad 12-body expansion without shared abstractions.

## Divisional Chart Readiness
### Current State
- D1 support is the only real chart-path exposed by the Swiss provider.
- Other divisional charts are still fixture / fallback driven.
- `generateBirthChart()` currently returns an empty `divisionalCharts` array.

### Readiness Assessment
- The architecture can carry divisional charts.
- The implementation is not yet complete enough for D9 / D10 / D7 / D4 / D12 / D60 as a production-grade engine.

## Prediction Intelligence Readiness
### Current State
- Dasha engine exists and is stable.
- Transit engine exists and is stable.
- Yoga detection exists and is stable.
- Predictive synthesis has a modular architecture.

### Limitations
- Prediction scoring currently assumes the 9-body model.
- Outer planets are not part of dasha timing, transit scoring, or yoga/rule context.
- Remedy / AI layers are built around the current 9-body registry.

## API + Data Model Audit
### Strengths
- Chart contracts and persistence are JSON-flexible.
- Saved chart fingerprints and profile fingerprints are explicit.
- Retrieval protects against stale or invalid payload reuse.
- User-scoped persistence is isolated by user ID.

### Gaps
- The application model still serializes a 9-body chart vocabulary everywhere the typed contracts matter.
- AI context mapping drops any graha not present in the current canonical registry.

## Mobile + Rendering Audit
### Strengths
- `NorthIndianChart` renders safely on the client.
- Chart rendering uses a simple responsive grid.
- Fallback labels are present if a house is missing.

### Gaps
- Planet abbreviations are hardcoded to the 9-body set.
- The chart UI can tolerate more planets only if the core types and registry are expanded first.

## Security + Privacy Audit
### Passed
- No cross-user chart leakage was found in the audited paths.
- No public route exposes raw private astrology JSON.
- No admin-only data is exposed in the chart stack.
- Saved charts stay user-scoped.

### Risks to Preserve
- Any future registry expansion must keep user-scoped persistence and chart retrieval boundaries intact.
- API responses should continue to avoid raw internal provider details unless intentionally needed for debugging.

## Scalability + Performance Audit
### Strengths
- Chart generation is server-side and cacheable.
- The service layer has provider abstraction and memoized resolution.
- Retrieval and persistence are separated from generation.

### Bottlenecks / Risks
- The current planet registry is too narrow for a broader astrology intelligence roadmap.
- Dasha / transit / predictive layers need a shared canonical graha registry before scaling into more advanced systems.
- Outer planets would require a clear decision on whether they are:
  - display-only
  - analytical
  - predictive
  - or all three

## Recommended Core Architecture
### Core Design
Introduce a canonical graha registry with:
- body key
- display label
- calculation category
- supported capabilities
- provider source
- chart serialization policy

### Suggested Capability Groups
- Classical Jyotish core: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu
- Extended astronomical bodies: Uranus, Neptune, Pluto

### Architectural Principles
- Keep classical Jyotish logic authoritative.
- Treat outer planets as first-class only after their meaning, display policy, and predictive role are explicitly defined.
- Do not collapse chart intelligence into a single loose string map.
- Use one registry for:
  - providers
  - formatting
  - transit
  - AI mapping
  - rendering
  - persistence

## Exact Files / Modules to Modify in 27.0B
Primary candidates:
- `src/modules/astrology/constants.ts`
- `src/modules/astrology/types.ts`
- `src/lib/astrology/constants.ts`
- `src/lib/astrology/swiss-planetary-service.ts`
- `src/lib/astrology/formatter.ts`
- `src/lib/astrology/chart-generator.ts`
- `src/lib/astrology/transit-engine.ts`
- `src/lib/astrology/planetary-verifier.ts`
- `src/lib/astrology/rules/aspects.ts`
- `src/lib/astrology/rules/yoga-rule-engine.ts`
- `src/lib/astrology/rules/dasha.ts`
- `src/modules/astrology/providers/swisseph-vedic-provider.ts`
- `src/modules/astrology/providers/circular-natal-horoscope-provider.ts`
- `src/modules/astrology/providers/mock-deterministic-provider.ts`
- `src/modules/astrology/chart-contract.ts`
- `src/modules/astrology/chart-persistence.ts`
- `src/modules/astrology/chart-retrieval.ts`
- `src/modules/astrology/transit-context.ts`
- `src/modules/astrology/predictive-synthesis-context.ts`
- `src/modules/ask-chart/chart-context-mapper.ts`
- `src/modules/ask-chart/assistant-response-engine.ts`
- `src/modules/astrology/components/north-indian-chart.tsx`
- `src/modules/astrology/fixtures.ts`

Potential new module for 27.0B:
- `src/lib/astrology/graha-registry.ts`

## Launch-Critical vs Post-Launch Improvements
### Launch-Critical for 27.0B
- Canonical graha registry
- Type widening for any supported 12-body model
- Provider mapping updates
- Formatter and serialization alignment
- AI / dashboard consumers updated to avoid dropping bodies

### Post-Launch
- Full divisional chart expansion beyond D1
- Expanded predictive weighting for auxiliary planets
- Chart visualization improvements for extended body sets

## Phase 27.0B Stabilization Plan
1. Define the canonical graha registry.
2. Decide whether Uranus, Neptune, and Pluto are:
   - display-only
   - analytical
   - predictive
   - or all three
3. Widen the body types and label maps.
4. Update Swiss Ephemeris / provider mapping.
5. Update formatter and verification layers.
6. Update persistence and retrieval contracts.
7. Update AI and dashboard mappings.
8. Update chart rendering abbreviations and fallbacks.
9. Re-run typecheck, lint, and build.

## Verdict
The astrology core is solid but not yet 12-body complete. The current production stack is best described as a **well-structured 9-body Jyotish engine with strong scaffolding for future expansion**. Phase 27.0B should focus on stabilization through a canonical graha registry and type-safe expansion before any new visualization or advanced utility work.
