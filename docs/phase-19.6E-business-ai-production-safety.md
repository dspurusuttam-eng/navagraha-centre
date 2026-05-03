# Phase 19.6E - Business / Entrepreneurship AI Production Safety Check

## Integration Status
- Business / entrepreneurship questions are wired through the live Ask My Chart flow.
- The production classifier now gives business questions their own path before career/finance fallback handling.
- Business prompt context is carried through the assistant payload as `business_context`.
- The business formatter branch in `src/modules/ask-chart/jyotish-answer-formatter.ts` is active and isolated from career, marriage, finance, health, and education formats.

## Formatter Routing Status
- Business formatter applies only to business / entrepreneurship / startup / partnership / trade / commerce / expansion / client-growth / foreign-business style questions.
- Career formatter still handles career-first prompts.
- Marriage formatter still handles relationship prompts.
- Finance formatter still handles money-first prompts.
- Health formatter still handles wellness prompts.
- Education formatter still handles study / exam prompts.
- General Jyotish formatter remains the fallback for broad questions.

## Context Usage Status
- The business path can safely use:
  - Lagna / Ascendant
  - 7th house
  - 10th house
  - 11th house
  - 2nd house
  - 3rd house
  - 5th house
  - 6th house
  - 8th house
  - 9th house
  - 12th house
  - Mercury
  - Saturn
  - Mars
  - Jupiter
  - Venus
  - Dasha chain
  - Transit context
  - Yoga / Rule signals
  - predictive synthesis summary

## Missing Context Fallback Behavior
- If chart context is missing, the response stays directional.
- It tells the user that deeper business guidance needs birth details or a generated Kundli.
- It does not fabricate certainty about profit, clients, funding, or timing.

## Business Safety Status
- No guaranteed profit, success, funding, clients, expansion, or debt removal claims are allowed.
- No exact revenue predictions are allowed.
- No investment advice is allowed.
- No stock, crypto, gambling, betting, or lottery guidance is allowed.
- No legal or tax certainty is allowed.
- No reckless borrowing or overexpansion advice is allowed.
- No fear-based debt or loss language is allowed.
- No raw chart JSON or internal context leaks are allowed.
- No premium bypass is allowed.

## Loan / Investment / Legal / Tax Handling Behavior
- Loan, investment, contract, compliance, partnership agreement, and tax questions are framed as general caution only.
- The answer recommends qualified legal, tax, financial, or business professional advice where needed.
- The answer does not make buy/sell/hold or legal/tax certainty claims.
- The answer does not encourage risky borrowing or speculative commitments.

## Remedy Safety Behavior
- Business remedies remain optional and supportive.
- Remedies are not framed as guaranteed success, profit, or client growth.
- Remedies never replace practical planning, accounting, legal review, or professional financial advice.

## Premium Gating Status
- Free and premium limits remain unchanged.
- Business / Career / Finance report suggestions are soft and contextual.
- Consultation suggestions are soft and contextual.
- No premium path implies guaranteed business success.

## Privacy / Logging Notes
- No sensitive birth details are logged unnecessarily in this phase.
- No raw chart data is exposed to the user.
- Business, legal, and financial errors do not surface internal implementation details.

## Manual Live QA Checklist
1. Seed a local QA user with `npm run qa:seed:user`.
2. Start the app with `npm run dev`.
3. Open `http://localhost:3000/dashboard/ask-my-chart`.
4. Test:
   - business suitability
   - job vs business
   - startup timing
   - side business
   - partnership caution
   - profit timing
   - client growth
   - trade / commerce
   - debt / loan pressure
   - investment / risk
   - foreign / online business
   - family business
   - legal / tax sensitivity
   - remedies
   - missing chart context
5. Confirm:
   - structure is correct
   - no deterministic claims appear
   - no investment / legal / tax advice is given
   - no gating bypass occurs
   - no raw JSON leaks occur

## Known Non-Blocking Follow-Ups
- Optional future refinement: expand business-specific report context if a dedicated report module is added later.
- Optional future refinement: add more granular business sub-intents if the QA set exposes repeated ambiguity.

## Next Recommended AI Module
- The next prioritized AI module in the roadmap.
