# Phase 20.0C - Premium Report Gating + QA + Production Safety

## Gating Status
- Preview sections remain accessible in the premium report foundation.
- Premium-only sections are marked with `premiumOnly` and `requiresUnlockedReport` flags.
- Locked reports return preview-safe text for premium sections instead of exposing full section content.
- The premium report route remains authenticated and rate-limited.
- No premium bypass path was found in the report API or route flow.

## API / Direct Route Safety
- The premium report API continues to require a valid session.
- The response path does not expose unlocked premium content when the report is locked.
- Premium-only section content is replaced with a safe teaser message until the report is unlocked.
- Soft unlock CTAs remain present and clear, but they do not reveal hidden report text.

## Report Context Safety
- The shared report foundation continues to use the saved chart, current cycle, predictive context, and approved remedy data already present in the system.
- Raw chart JSON is not surfaced in the report response.
- Missing divisional-chart context is marked as unavailable rather than fabricated.
- D9 / D10 are only reported when they actually exist in the chart payload.
- Birth details are handled through the existing chart pipeline and are not introduced into user-facing report copy.
- Error handling remains routed through the existing safe server-side fallback paths.

## Missing Context Behavior
- If chart context is incomplete, the report foundation falls back to safe neutral text.
- If timing context is unavailable, the report uses a clear unavailable notice instead of making up timing detail.
- If no remedy records match, the report states that clearly and keeps the guidance optional.

## Wording Safety
- The report foundation and premium report generator avoid:
  - guaranteed predictions
  - fear-based claims
  - medical diagnosis or treatment claims
  - investment, legal, or tax certainty
  - coercive relationship advice
  - guaranteed remedy results
- Disclaimer language remains visible in the report foundation and full report output.

## Report Type QA Summary
- Full Kundli:
  - profile exists
  - preview/premium section flags are defined
  - soft CTA path is defined
  - safety rules are defined
- Career:
  - profile exists
  - report-specific required context is defined
  - preview/premium separation is defined
- Marriage / Compatibility:
  - profile exists
  - relationship safety rules are defined
  - D9/Navamsa is only referenced as optional when available
- Finance:
  - profile exists
  - finance safety rules are defined
  - no investment certainty is introduced
- Health / Wellness:
  - profile exists
  - non-medical safety rules are defined
- Education:
  - profile exists
  - exam/admission certainty is explicitly disallowed
- Business:
  - profile exists
  - legal/tax/investment certainty is explicitly disallowed
- Daily Personalized Prediction:
  - profile exists
  - timing-window caution is explicit
- Yearly Guidance:
  - profile exists
  - directional guidance only, not deterministic output

## PDF / Export Status
- No PDF/export pipeline was found in the inspected report stack.
- PDF/export remains pending and is not implemented in this phase.

## Fixes Made
- No additional runtime fix was required during 20.0C.
- The 20.0B foundation already masked premium-only section content in locked states and preserved preview-safe sections.

## Known Non-Blocking Follow-Ups
- Add PDF/export later if report delivery needs a downloadable artifact.
- Expand dedicated report surfaces for education, business, daily, and yearly report products in a later phase.
- Surface divisional-chart explanations more explicitly if a later report phase needs deeper D9/D10 detail.

## Next Phase
- Phase 20.1 - Full Kundli Report Upgrade
