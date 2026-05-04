# Phase 20.1B - Full Kundli Report QA + Safety

## Sections Checked
- Executive Summary
- Birth Chart Foundation
- Personality & Nature
- 12 Bhava / House Analysis
- Planetary Strength & Influence
- Dasha / Timing Overview
- Transit / Current Period Insight
- Yoga / Rule Signals
- Life Area Snapshot
- Practical Guidance
- Optional Remedies
- Disclaimer / Safety Note

## Gating Status
- Preview content remains limited to the safe summary layer.
- Premium-only sections remain locked when the report is not unlocked.
- Locked report content is masked in the shared section plan and is not exposed as full content in the premium report API response.
- Unlock CTAs remain soft and contextual.
- No premium bypass was introduced.

## Raw-Context Leak Status
- No raw chart JSON is surfaced in the report page or premium section plan.
- D9 / Navamsa is only referenced when it is actually present in the chart payload.
- D10 / Dashamsa is only referenced when it is actually present in the chart payload.
- Missing Dasha, transit, yoga, or predictive context falls back to safe fallback text instead of fabricating detail.
- Birth details are handled inside the chart/report layer and are not added to user-facing error text.

## Missing-Context Fallback
- If the natal chart is unavailable, the report surface stays on the safe fallback state.
- If timing layers are unavailable, the report uses neutral fallback wording rather than claiming certainty.
- If divisional charts are unavailable, the report says they are unavailable instead of implying they exist.

## D9 / D10 Availability Behavior
- Full Kundli now mentions D9 / D10 only as optional refinement when present.
- The shared report foundation marks D9 / D10 availability from the saved chart payload only.
- No fabricated divisional-chart detail is shown in preview or locked responses.

## Wording Safety
- The report avoids:
  - guaranteed events
  - fear-based claims
  - medical diagnosis or treatment claims
  - investment, legal, or tax certainty
  - coercive relationship wording
  - guaranteed remedy results
- The report uses interpretive, premium, and user-friendly language without making deterministic claims.

## PDF / Export Status
- No PDF or export pipeline was found for the Full Kundli report in the current implementation.
- PDF/export is pending and remains a non-blocking follow-up.

## Fixes Made
- Upgraded the Full Kundli report prompt path so the interpretation layer receives report-type-aware guidance.
- Added safe chart foundation enrichment for Lagna, Moon sign, Sun sign, and available divisional charts.
- Tightened the Full Kundli preview/premium split so deeper timing and house detail is reserved for premium sections.
- Improved the dashboard report summary so it reads like a broader Full Kundli narrative instead of a narrow summary stub.

## Next Phase
- Phase 20.1C - Full Kundli Report Production Readiness
