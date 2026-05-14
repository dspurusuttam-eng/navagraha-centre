# 32.0B Priority Utility Implementation Plan

Status: planning only, no source changes.

## Priority framing
The next utility work should follow five filters:
- launch value
- retention value
- monetization value
- SEO value
- technical dependency and effort

The current repo already has strong foundation coverage for:
- Kundli
- Rashifal
- Panchang
- Reports
- Consultation
- NAVAGRAHA AI / tools hub
- Numerology
- multilingual routing

That means the next build order should focus on the largest gaps that also reuse existing foundations.

## Tier 1, Tier 2, Tier 3

| Tier | Priority group | Reason |
| --- | --- | --- |
| Tier 1 | Dasha tool page, Transit / Gochar tool | Highest launch value and high user retention; these are the most natural next chart-aware tools after Kundli and Panchang. |
| Tier 1 | Matchmaking / compatibility | Strong audience demand, high engagement, and clear pathway into reports or consultation. |
| Tier 2 | Dosha / Yoga detector | Good report adjacency and useful for premium upsell, but should follow the main chart/timing tools. |
| Tier 2 | Remedy tools | Monetization-friendly and adjacent to existing remedies/shop surfaces. |
| Tier 2 | Muhurat / calendar depth | Good retention and SEO value, but Panchang already covers the core timing flow. |
| Tier 3 | Numerology expansion, Vastu, Palmistry, Face Reading | Useful later, but lower launch urgency and more dependent on clear content/safety framing. |

## What to build first
Start with:
1. Dasha tool page
2. Transit / Gochar tool
3. Matchmaking / compatibility refinement

These three give the best mix of launch value, retention, and dependency reuse.

## Recommended next micro-phases

### 32.1A Dasha Tool Page Foundation
- Purpose: create a public Dasha entry surface that is simpler than the dashboard path.
- Files likely to change: `src/app/(marketing)/...` new Dasha route, related metadata, shared card/button components if needed, docs.
- Dependencies: Kundli chart context, existing dasha engine, localization paths, safe dashboard fallback.
- Risks: exposing chart-dependent content without a chart, routing confusion with dashboard Dasha surfaces.
- Validation checklist: page loads, no fake dasha values, clear chart-required messaging, mobile-safe layout, typecheck/lint/build.
- Logic needed: real calculation logic already exists; use safe fallback and route gating if chart is absent.

### 32.2A Transit / Gochar Tool Foundation
- Purpose: create a public transit layer with a simple entry point and chart-aware context.
- Files likely to change: `src/app/(marketing)/...` new Transit route or alias, localization config, related utility docs.
- Dependencies: transit engine, Kundli context, existing dashboard transit pieces, tools hub linking.
- Risks: duplicating internal dashboard views, showing transit claims without chart context.
- Validation checklist: route safe, no fake transit data, clear required-chart state, responsive layout, validation pass.
- Logic needed: real transit logic exists; use safe preview or gated copy where needed.

### 32.3A Matchmaking / Compatibility Refinement
- Purpose: make matchmaking easier to discover and more obviously connected to reports and consultation.
- Files likely to change: `src/app/(marketing)/matchmaking/page.tsx`, compatibility route aliases, tools hub recommendations, docs.
- Dependencies: existing compatibility/marriage routes, chart inputs, report funnel.
- Risks: route duplication, confusion between matchmaking and marriage compatibility aliases.
- Validation checklist: route consistency, mobile-friendly discovery, no broken aliases, no fake compatibility output.
- Logic needed: existing matchmaking foundation is available; refine discovery and safe fallback.

### 32.4A Dosha / Yoga Report Entry Layer
- Purpose: surface dosha and yoga as a clear report-linked pathway.
- Files likely to change: report entry pages, tools hub cards, report CTA sections, docs.
- Dependencies: existing reports system, dosha/yoga engines, Kundli context.
- Risks: overstating certainty or creating a duplicate report path.
- Validation checklist: clear premium report positioning, safe chart dependency, no exaggerated claims.
- Logic needed: use existing report/calculation engines.

### 32.5A Remedy + Shop Connection Layer
- Purpose: tighten the path from insight to optional support products and remedies.
- Files likely to change: remedies route, shop entry paths, tools hub cards, content docs.
- Dependencies: existing remedies route, shop catalog, monetization rules.
- Risks: turning optional guidance into guaranteed claims.
- Validation checklist: no fake products, no fake prices, no fake certainty, route-safe CTAs.
- Logic needed: mostly existing route and commerce structures.

### 32.6A Muhurat / Calendar Expansion
- Purpose: expand daily timing content beyond the current compact Panchang surface.
- Files likely to change: Panchang/calendar route additions, timing utility components, docs.
- Dependencies: Panchang engine, current timing UI.
- Risks: duplicating Panchang without clear value or adding fake timing values.
- Validation checklist: no fake data, clear route-safe utilities, mobile app-like presentation.
- Logic needed: real timing logic only, never placeholder timing values.

### 32.7A NI Roadmap Scaffold
- Purpose: define future NAVAGRAHA Intelligence sub-tools after the major public utilities are stable.
- Files likely to change: tools hub catalog, roadmap docs, maybe shared status/badge utilities.
- Dependencies: tools hub status system, existing AI and consultation surfaces.
- Risks: introducing too many placeholders too early or creating a separate public NI section.
- Validation checklist: NI remains a sub-tool system only, no fake live modules, no new public section.
- Logic needed: mostly roadmap and safe fallback presentation.

## What to avoid now
- Do not add Vastu, Palmistry, or Face Reading as live public tools yet.
- Do not expand numerology before Dasha, Transit, and Matchmaking get clearer entry paths.
- Do not create fake calculator pages or fake utility pages.
- Do not move UI energy into more homepage polishing until the next utility group is defined.
- Do not split NAVAGRAHA NI into a separate public section.

## Time-saving execution strategy
- Reuse existing route shells wherever possible.
- Prefer one small public page per utility group instead of building many new standalone pages.
- Use the current white/gold system and card components.
- Keep every new utility tied to a clear route-safe fallback.
- Build only one chart-aware public surface at a time, then validate before moving to the next.

## Final priority table

| Rank | Phase | Outcome |
| --- | --- | --- |
| 1 | 32.1A | Public Dasha tool page foundation |
| 2 | 32.2A | Public Transit / Gochar tool foundation |
| 3 | 32.3A | Matchmaking / compatibility refinement |
| 4 | 32.4A | Dosha / Yoga report entry layer |
| 5 | 32.5A | Remedy + Shop connection layer |
| 6 | 32.6A | Muhurat / calendar expansion |
| 7 | 32.7A | NI roadmap scaffold |

## Next phase
- 32.1A Dasha Tool Page Foundation
