# Phase 20.6A - Education + Business Report Intelligence Upgrade

## Files Changed
- `src/modules/report/report-foundation.ts`

## Education Report Sections Upgraded
- Education Executive Summary
- Learning Foundation
- Subject / Field Tendency
- Concentration & Memory Pattern
- Competitive Exam / Discipline Indicators
- Higher Studies & Mentor Support
- Study-to-Career Connection
- Dasha / Education Timing
- Transit / Current Study Period
- Practical Study Guidance
- Optional Education Remedies
- Student Safety Disclaimer

## Business Report Sections Upgraded
- Business Executive Summary
- Business / Job / Partnership Tendency
- Entrepreneurship Strengths
- Client / Customer Growth Pattern
- Partnership & Public Dealing
- Risk / Debt / Legal Caution
- Trade / Online / Foreign Business Support
- Dasha / Business Timing
- Transit / Current Business Period
- Practical Business Guidance
- Optional Business Remedies
- Business Safety Disclaimer

## Context Used
- Birth details
- Lagna / Ascendant
- Planetary positions
- House placements
- Education context: 4th, 5th, 9th, 2nd, 3rd, 6th, and 10th houses; Mercury; Jupiter; Moon; Saturn; Mars; Dasha; transit; yoga / rule signals; predictive synthesis; Phase 19 education insights when available
- Business context: 7th, 10th, 11th, 2nd, 3rd, 5th, 6th, 8th, 9th, and 12th houses; Mercury; Saturn; Mars; Jupiter; Venus; Dasha; transit; yoga / rule signals; predictive synthesis; Phase 19 business insights when available
- D10 / Dashamsa only when actually available for business refinement

## Preview vs Premium Rules
- Education preview:
  - Executive Summary
  - Learning Foundation
  - Student Safety Disclaimer
  - Next Step CTA
- Business preview:
  - Executive Summary
  - Business Foundation
  - Business Safety Disclaimer
  - Next Step CTA
- Premium-only sections:
  - Education: subject tendency, memory/concentration, exam discipline, higher studies, timing, practical guidance, remedies, deep dive
  - Business: business tendency, strengths, growth, risk, timing, practical guidance, remedies, deep dive
- Locked content is not exposed in preview/API/export responses.

## Missing-Context Behavior
- If saved chart context is missing, the report stays on the safe fallback state.
- Missing education or business houses, timing, yoga, or transit data is handled as unavailable rather than fabricated.
- The report avoids guessing marks, admission, profit, funding, or client outcomes.

## Student / Business Safety Rules
- Education:
  - no guaranteed marks, rank, pass/fail, or admission claims
  - no student shaming
  - no fear-based exam language
  - no remedy guarantee
- Business:
  - no guaranteed profit, success, funding, or client claims
  - no exact revenue prediction
  - no investment, legal, tax, or funding certainty
  - no reckless risk encouragement
  - no remedy guarantee

## Next Phase
- `20.6B` Education + Business Report QA + Safety
