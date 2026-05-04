# Phase 20.2B - Career Report QA + Safety

## Sections Checked
- Career Executive Summary
- Career Foundation
- Job vs Business Tendency
- Professional Strengths
- Work Pressure / Obstacles
- Income / Gains Connection
- Dasha / Career Timing
- Transit / Current Period Insight
- Career Yoga / Rule Signals
- Practical Career Guidance
- Optional Career Remedies
- Disclaimer / Safety Note

## Gating Status
- Preview sections stay limited to the summary/foundation layer.
- Premium-only career sections remain locked when the report is not unlocked.
- Locked sections are masked in the section plan and do not leak through the premium report API.
- Unlock CTA remains soft and contextual.
- No premium bypass was found.

## Raw-Context Leak Status
- No raw chart JSON or internal context is exposed in the report flow.
- D10 / Dashamsa is only mentioned when it is actually present in the saved chart context.
- Missing career-houses, Dasha, transit, or yoga data falls back to safe unavailable text.
- Birth details are not logged unnecessarily in the user-facing report path.

## Missing-Context Fallback
- If chart context is unavailable, the report falls back to summary-safe language rather than fabricating career certainty.
- Missing timing context is surfaced as unavailable timing context instead of a false prediction.

## Wording Safety
- The report avoids guaranteed job, promotion, salary, or role-change claims.
- The report avoids deterministic success/failure language.
- The report avoids fear-based career prediction wording.
- The report avoids medical, financial, legal, and investment certainty.
- Optional remedies remain optional and non-guaranteed.

## D10 Availability Behavior
- D10 / Dashamsa is only referenced when present in the saved chart context.
- If D10 is unavailable, the report stays with the natal career foundation and does not fabricate a divisional reading.

## PDF / Export Status
- No PDF/export pipeline was found for the Career Report.
- PDF/export remains pending and is documented as non-blocking follow-up work.

## Fixes Made
- No runtime fixes were required in this phase.
- The Career report foundation from 20.2A already enforced the required preview/premium separation and safe fallback behavior.

## Next Phase
- `20.2C` Career Report Production Readiness
