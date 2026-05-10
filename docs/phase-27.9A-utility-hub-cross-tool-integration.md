# Phase 27.9A Utility Hub + Cross-Tool Integration

## Files Changed
- `src/modules/astrology/utilities/hub.ts`
- `src/modules/astrology/utilities/index.ts`
- `src/modules/astrology/index.ts`
- `src/app/(marketing)/tools/page.tsx`
- `src/modules/account/components/dashboard-ecosystem-home.tsx`
- `src/app/(app)/dashboard/page.tsx`
- `scripts/debug-utility-hub-qa.ts`
- `package.json`

## Utility Hub Status
The central utility hub is implemented as a shared registry and consumed by both the public tools page and the dashboard utility shortcuts.

The hub lists:
- Kundli / Birth Chart
- Divisional Charts
- Dasha
- Transit / Gochar
- Matchmaking
- Dosha Detection
- Yoga Detection
- Panchang
- Muhurat
- Numerology
- Remedies
- Reports
- Ask NAVAGRAHA AI
- Consultation

## Cross-Tool Recommendation Behavior
Recommendations are now generated from safe, explicit dashboard context:
- No active Kundli: prioritize `Generate Kundli first`, then `Check Panchang`, then `Explore Numerology`
- Active Kundli: prioritize context-specific follow-ups first
  - Matchmaking -> Marriage Report, Consultation
  - Dosha / Yoga -> Remedies, Reports, AI
  - Panchang -> Rashifal, Daily Remedy, Muhurat
  - Numerology -> Name Numerology, Business Numerology, Reports, AI, Consultation
- Active Kundli fallback still includes Dasha and Transit

The recommendation list deduplicates on stable recommendation keys, and the dashboard surfaces the top recommendations without clutter.

## Dashboard Integration
The dashboard now exposes a compact utility hub block with:
- 3 context-aware recommendation cards
- 10 shortcut actions
- status badges for availability and Kundli requirements

This keeps the dashboard compact while still making the main tool paths easy to reach.

## Report / AI Compatibility
The hub is read-only and additive. It only references existing routes and safe feature labels, so it stays compatible with:
- premium reports
- AI context builders
- retention / daily return surfaces
- existing dashboard chart state

No raw chart JSON, prompts, or private report content is exposed.

## Privacy / Security Behavior
- No new private data model was added
- No raw astrology payloads are exposed through the hub
- No cross-user state is stored
- Safe fallback routing is used when a tool is not the best next step

## Known Gaps
- Some deeper tools still rely on existing route availability
- `Muhurat` uses the current route fallback behavior where relevant
- The hub is discovery and routing only; it does not compute astrology output itself

## Final Verdict
Phase 27.9A is complete as a safe utility hub and cross-tool integration layer.

## Next Phase
27.9B Full Utility QA + Production Readiness
