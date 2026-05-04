# Phase 20.0B - Premium Report Context Builder + Formatter Foundation

## Files Changed
- `src/modules/report/report-foundation.ts`
- `src/lib/ai/report-generator.ts`
- `src/modules/report/premium-report-generator.ts`
- `src/app/api/report/premium/generate/route.ts`
- `src/modules/report/index.ts`

## Context Builder Design
- Added a shared report foundation builder in `src/modules/report/report-foundation.ts`.
- The builder collects the report inputs that are already available in the system:
  - birth profile and saved chart presence
  - Lagna / natal chart state
  - house placements
  - planetary summary
  - Dasha / current cycle summary
  - transit / current period summary
  - yoga / rule signal summary when available
  - predictive synthesis context when available
  - chart-level remedy signals
  - report type and access tier
- The builder marks missing context safely instead of fabricating unavailable divisional charts or timing layers.
- D9 / D10 status is detected only when those divisional charts are actually present in the chart payload.

## Formatter Structure
- Added a shared premium report formatter foundation with standard sections:
  - Executive Summary
  - Chart Foundation
  - Key Strengths
  - Caution Areas
  - Timing / Dasha Insight
  - Transit / Current Period Insight
  - House-Based Analysis
  - Yoga / Rule Signals
  - Practical Guidance
  - Optional Remedies
  - Premium Deep-Dive Sections
  - Disclaimer / Safety Note
  - Next Step CTA
- Each section now carries section-level flags:
  - `previewAllowed`
  - `premiumOnly`
  - `requiresUnlockedReport`
- The formatter foundation keeps preview-safe text available while premium-only sections are clearly marked and hidden behind unlocked-state logic.

## Report Type Profiles
- Added report type profiles for:
  - Full Kundli
  - Career
  - Marriage / Compatibility
  - Finance
  - Health / Wellness
  - Education
  - Business
  - Daily Personalized Prediction
  - Yearly Guidance
- Each profile defines:
  - included sections
  - required context
  - optional context
  - safety rules
  - a soft CTA path
  - preview sections
  - premium sections
- Existing premium report generation currently uses the Career / Marriage / Finance / Health subset, while the broader profile set is now available for later report phases.

## Preview / Premium Section Rules
- Preview-safe sections remain available as structured context.
- Premium-only sections are flagged and rendered as teaser content unless the report is unlocked.
- The report generator now carries the section plan forward, so the formatting foundation is available even when premium content remains locked.
- Payment and unlock logic were not changed in this phase.

## Missing Context Behavior
- If a chart or timing layer is missing, the foundation marks the missing state instead of inventing report detail.
- Divisional chart presence is only reported when the chart payload actually contains it.
- Panchang-specific reporting remains unavailable unless the data is present in a later phase.

## Safety Wording Rules
- Reports continue to avoid:
  - guaranteed predictions
  - fear-based claims
  - medical diagnosis or treatment claims
  - investment, legal, or tax certainty
  - coercive relationship advice
  - remedy guarantee language
- The shared foundation keeps disclaimers and next-step CTAs soft and contextual.

## Notes on Integration
- `src/lib/ai/report-generator.ts` now builds the shared report foundation for the base report surface.
- `src/modules/report/premium-report-generator.ts` now uses the same shared foundation to generate preview text, section plans, and full report sections.
- The premium report route now passes predictive context into the report generator so the report foundation can include the timing layer when it exists.
- The report module index exports the new foundation helper for future report phases.

## Next Phase
- Phase 20.0C - Gating + QA + Production Safety
