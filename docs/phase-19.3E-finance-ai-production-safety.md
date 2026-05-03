# Phase 19.3E - Finance / Wealth AI Production Safety Check

## Integration status
- Finance / wealth questions are routed through the live Ask My Chart flow.
- Finance intent is detected in `src/modules/ask-chart/service.ts` before career routing.
- Finance context is assembled in `src/modules/ask-chart/assistant-response-engine.ts` as a dedicated `finance_context` block.
- Finance answers are formatted in `src/modules/ask-chart/jyotish-answer-formatter.ts` through a finance-specific branch that runs before career formatting.
- Core Jyotish, Career, and Marriage behavior remain intact.

## Formatter routing status
- Finance formatter applies to finance / money / income / savings / expense / debt / wealth / profit / timing / speculation-risk questions.
- Career formatter still applies to career / job / business questions.
- Marriage formatter still applies to relationship / marriage / compatibility questions.
- General Jyotish formatting still handles broad, non-specialized questions.

## Context usage status
- Finance answers can safely use:
  - Lagna / Ascendant
  - 2nd, 5th, 6th, 8th, 9th, 10th, 11th, and 12th houses
  - Jupiter, Venus, Saturn, and Mercury
  - Dhana / wealth-style rule signals when present in predictive synthesis
  - Dasha chain
  - Transit context
  - Yoga / rule signals
  - predictive synthesis summary
- The finance branch intentionally treats these as tendencies and timing signals, not financial instructions.

## Missing context fallback behavior
- If chart context is missing or incomplete, finance answers stay directional instead of pretending certainty.
- The soft next step invites the user to generate or refresh Kundli context for stronger finance timing interpretation.
- No fabricated wealth forecast is produced when context is weak.

## Financial safety status
- No investment advice is given.
- No guaranteed profit, income, wealth, sudden gain, or debt removal claims are allowed.
- No exact money amount prediction is allowed.
- No fear-based loss or debt framing is allowed.
- No specific stocks, crypto, gambling, betting, or lottery recommendations are allowed.
- No raw chart JSON or internal context is exposed to the user.

## Investment / speculation handling behavior
- Investment, trading, crypto, gambling, betting, and lottery questions are treated as general caution questions only.
- The response stays within astrology-based timing reflection and risk framing.
- Buy / sell / hold recommendations are not produced.
- Qualified financial advice is recommended for high-stakes decisions.

## Remedy safety behavior
- Finance remedies remain optional.
- Remedies are framed as gentle support only.
- Remedies are never presented as required to avoid loss or create wealth.
- Fear-based remedy language is not used.

## Premium gating status
- Free and premium limits remain unchanged.
- Finance answers remain useful in the free tier.
- Finance Report and Consultation CTAs remain soft and relevant.
- No premium bypass is introduced.

## Privacy / logging notes
- No new sensitive birth-data logging surface was added.
- Existing Ask My Chart flow still avoids exposing raw internal chart structures to users.
- Error handling remains bounded to safe assistant output and policy/fallback messaging.

## Manual live QA checklist
1. Seed a QA user with `npm run qa:seed:user`.
2. Start the app with `npm run dev`.
3. Sign in and open `/dashboard/ask-my-chart`.
4. Test finance prompts for income, savings, expenses, debt, business profit, job income, sudden gain/loss, investment risk, remedies, and missing-chart fallback.
5. Confirm the finance formatter appears before career formatting on finance questions.
6. Confirm career, marriage, and general Jyotish answers still route correctly.
7. Confirm no investment advice, profit guarantees, or raw chart leaks appear.
8. Confirm free-tier gating and soft CTAs remain intact.

## Known non-blocking follow-ups
- Add live-response transcript capture for finance QA in a future phase if you want a repeatable artifact trail.
- Consider a future finance report-specific prompt refinement if report output needs more financial terminology.

## Next recommended AI module
- **Phase 19.4 - Health AI Module**
