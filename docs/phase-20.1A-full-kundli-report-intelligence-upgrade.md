# Phase 20.1A - Full Kundli Report Intelligence Upgrade

## Files Changed
- `src/modules/ai/types.ts`
- `src/modules/ai/prompts.ts`
- `src/modules/report/service.ts`
- `src/lib/ai/report-generator.ts`
- `src/modules/report/report-foundation.ts`
- `src/app/api/report/premium/generate/route.ts`
- `docs/phase-20.1A-full-kundli-report-intelligence-upgrade.md`

## Full Kundli Sections Added / Upgraded
- The Full Kundli report now carries a more premium, chart-aware interpretation path across the existing report page and shared report foundation.
- The AI report prompt now treats `FULL_KUNDLI` as a full-life profile rather than a narrow topic answer.
- The report summary shown on the dashboard now combines:
  - chart foundation
  - current timing tone
  - predictive synthesis focus when available
  - leading strength and caution notes
  - soft next-step guidance
- The shared report foundation now expands the Full Kundli deep-dive layer with:
  - divisional chart availability checks
  - life-area snapshot language
  - planetary emphasis
  - timing snapshot language

## Context Used
- Birth details and saved chart presence
- Lagna / Ascendant
- Rashi / natal chart structure
- Moon sign and Sun sign when available
- Planetary positions
- House placements
- 12 Bhava analysis when available
- Current dasha / timing tone
- Predictive synthesis summary when available
- D9 / Navamsa and D10 / Dashamsa only when actually present
- Phase 19 chart/report signals when available

## Preview vs Premium Section Rules
- Preview remains limited to:
  - Executive Summary
  - Chart Foundation
  - Key Strengths
  - Caution Areas
  - Disclaimer / Safety Note
  - Next Step CTA
- Premium-only sections now cover the deeper layers:
  - Timing / Dasha Insight
  - Transit / Current Period Insight
  - House-Based Analysis
  - Yoga / Rule Signals
  - Practical Guidance
  - Optional Remedies
  - Premium Deep-Dive Sections
- Locked content is masked safely and is not exposed in preview content.

## Missing-Context Behavior
- Missing chart data does not fabricate certainty.
- Missing divisional chart data is treated as unavailable rather than implied.
- If the natal chart is not ready, the report surface remains on the safe fallback state.
- The report summary and AI sections continue to degrade gracefully instead of inventing details.

## Safety Wording Rules
- The Full Kundli report avoids:
  - guaranteed predictions
  - fear-based claims
  - medical, legal, financial, or investment certainty
  - coercive relationship wording
  - remedy guarantee claims
- Divisional chart references are treated as refinement only, not separate destiny.
- Optional remedies remain optional and consultative.

## Next Phase
- Phase 20.1B - Full Kundli Report QA + Safety
