# Phase 19.6A - Business / Entrepreneurship AI Context Audit

## Files inspected
- `src/modules/ask-chart/service.ts`
- `src/modules/ask-chart/assistant-response-engine.ts`
- `src/modules/ask-chart/jyotish-answer-formatter.ts`
- `src/modules/ai/prompt-registry.ts`
- `src/lib/astrology/accuracy/prompt-builder.ts`
- `src/modules/astrology/predictive-assistant-context.ts`
- `src/modules/astrology/predictive-synthesis-context.ts`
- `src/modules/report/service.ts`
- `src/modules/report/chart-context.ts`
- `docs/phase-19.5E-education-ai-production-safety.md`
- `package.json`

## Current business / entrepreneurship AI flow summary
- Business questions are currently not a first-class production module.
- In Ask My Chart, business-related wording is mostly captured through the career and finance pathways.
- The assistant response engine already recognizes business as a general domain and as part of career intent handling, but there is no dedicated business context block.
- The formatter can render a business-style career summary and a generic business practical guidance line, but there is no dedicated business answer structure yet.
- The copilot prompt and NAVAGRAHA boundary prompt mention career, finance, relationship, health, and education explicitly, but not business as a separate reasoning module.

## Business-related context already available
- Lagna / Ascendant
- 7th house for partnership and public dealing
- 10th house for profession, status, and business karma
- 11th house for gains, networks, and client growth
- 2nd house for capital, resources, and speech
- 3rd house for sales, communication, courage, and skills
- 5th house for strategy, intelligence, and speculative tendency
- 6th house for competition, debt, service pressure, and legal friction
- 8th house for risk, sudden loss, and transformation
- 9th house for guidance, fortune, and mentor support
- 12th house for expenses, foreign trade, and loss
- Mercury, Saturn, Mars, Jupiter, and Venus
- Dasha chain, transit context, yoga / rule signals, and predictive synthesis summary

## Missing business context
- No dedicated `business_context` block is present in the Ask My Chart payload.
- No dedicated business intent classifier exists yet.
- No business-specific report context was found in the source tree.
- Business questions are still blended with career, finance, or relationship logic depending on wording.
- There is no clear business-first structure for startup, side-business, client growth, trade, risk, or partnership questions.

## Audit questions
1. Current AI can partly distinguish job vs business vs side business, but it does so through career heuristics rather than a dedicated business module.
2. Timing can be discussed through dasha and transit, but not yet with business-first framing.
3. Risk, debt, and investment-adjacent business questions are handled conservatively, but through finance/career safety framing.
4. Practical discipline is present, but business/legal/financial caution is still generic rather than business-specific.
5. Partnership caution is possible through relationship and career context, but not yet a dedicated business-partnership branch.
6. Business guidance can mention report or consultation softly, but the product path is not business-specific yet.
7. Business answers are currently more blended than chart-module grounded.

## Prompt upgrade points
- Add explicit business reasoning instructions to the Ask My Chart copilot prompt.
- Add business-first house logic for 7th, 10th, 11th, 2nd, 3rd, 5th, 6th, 8th, 9th, and 12th house context.
- Separate startup, side business, client growth, trade, partnership, and scaling questions from general career advice.
- Keep profit, growth, and timing language non-deterministic.

## Formatter / output upgrade points
- Add a dedicated business formatter branch with:
  - Business Summary
  - Business / Partnership Tendency
  - Timing Insight
  - Growth Opportunities
  - Risk / Caution Areas
  - Practical Business Guidance
  - Optional Support
  - Soft Next Step
- Prevent business questions from being reduced to generic career wording when the user clearly asks about entrepreneurship or trade.

## Business / finance / legal safety notes
- No guaranteed profit, revenue, client growth, or startup success claims.
- No investment advice or stock / crypto / gambling recommendations.
- No legal certainty or partnership guarantees.
- No fear-based business failure language.
- No pressure-based remedy claims.
- No raw chart JSON or internal context exposure.

## Premium gating notes
- Free and premium limits remain unchanged.
- No premium bypass should be introduced in the next phase.
- Soft business report or consultation CTAs should stay contextual and not imply guaranteed business success.

## Recommended next phase
- **19.6B - Business / Entrepreneurship AI Prompt Upgrade**

## Likely 19.6B files
- `src/modules/ask-chart/service.ts`
- `src/modules/ask-chart/assistant-response-engine.ts`
- `src/modules/ask-chart/jyotish-answer-formatter.ts`
- `src/modules/ai/prompt-registry.ts`
- `src/lib/astrology/accuracy/prompt-builder.ts`

