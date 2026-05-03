# Phase 19.1A - Career AI Context Audit

## Scope and guardrails followed
- Audit-only phase completed.
- No AI behavior, prompt logic, astrology calculations, UI, routing, auth, payments, SEO, tools, reports, database, or pricing logic changed.
- Only repository inspection and this audit report were added.

## 1) Files inspected

### Ask NAVAGRAHA AI / Ask My Chart flow
- `src/app/(marketing)/ai/page.tsx`
- `src/app/(app)/dashboard/ask-my-chart/page.tsx`
- `src/app/api/ai/ask-chart/sessions/route.ts`
- `src/app/api/ai/ask-chart/sessions/[sessionId]/route.ts`
- `src/app/api/ai/ask-chart/sessions/[sessionId]/messages/route.ts`
- `src/modules/ask-chart/components/ask-my-chart-assistant.tsx`
- `src/modules/ask-chart/service.ts`

### Prompt, context, and formatter pipeline
- `src/modules/ask-chart/assistant-response-engine.ts`
- `src/modules/ask-chart/chart-context-mapper.ts`
- `src/modules/ask-chart/jyotish-answer-formatter.ts`
- `src/modules/ai/prompt-registry.ts`
- `src/lib/astrology/accuracy/prompt-builder.ts`
- `src/lib/astrology/accuracy/output-validator.ts`

### Predictive synthesis and report/assistant context
- `src/modules/astrology/predictive-assistant-context.ts`
- `src/modules/astrology/predictive-synthesis-context.ts`
- `src/modules/astrology/predictive-report-context.ts`
- `src/lib/ai/report-generator.ts`
- `src/modules/report/chart-context.ts`
- `src/modules/report/service.ts`

### Premium/free gating and policy safety
- `src/modules/subscriptions/usage-control.ts`
- `src/modules/subscriptions/user-plan.ts`
- `src/modules/ai/policy.ts`

## 2) Current Career AI flow summary

1. Public AI discovery is available on `/ai`, while chart-aware answering is protected in `/dashboard/ask-my-chart`.
2. Message flow goes through authenticated API route `POST /api/ai/ask-chart/sessions/[sessionId]/messages` with origin guard, payload guard, and AI rate limiting.
3. `sendAskMyChartMessage` validates input, checks usage limits, retrieves/refreshed chart, validates completeness, maps chart context, builds tool bundle, and then calls `generateAstrologyResponse`.
4. Output is normalized through `formatJyotishAnswerForConversation`, then stored in conversation history and AI run logs.
5. Free-plan guardrails trim length and downgrade high confidence to medium for free responses.

## 3) Career-related context already available to AI

### Directly available in prompt payload
- Lagna / Ascendant
- Moon sign
- Sun sign (if present)
- Planetary positions
- House placements (all 12)
- House lordship (all 12)
- Sign lordship (all 12)
- Dasha chain (active chain)
- Mahadasha / Antardasha / Pratyantar / Day dasha
- Next dasha transition timestamp/level
- Transit snapshot (transits and key aspects)
- Yoga/rule synthesis summary (dominant planets/houses, supportive/pressure factors, timing focus, confidence)
- User question text
- Detected focus areas including `career`, `finance`, and `business`

### Career-relevant house context status
- 10th, 6th, 2nd, 11th, 5th, 9th, 7th are available indirectly via full house and lordship arrays.
- They are not currently exposed as a dedicated career context block (job/service/business/income/mentor/partnership framing).

## 4) Missing or weak Career AI context

1. No dedicated `career_context` object in prompt input (career houses and significations are not pre-grouped for the model).
2. Query match fallback in `getMatchingHouses` defaults to houses `<= 4` when house numbers are not mentioned, which is weak for career questions.
3. No explicit job/service vs business tendency resolver at context stage (domain detection exists, but chart-factor mapping is generic).
4. No career-specific timing framing packet that binds active dasha/transit directly to 10th/6th/2nd/11th/7th themes before generation.
5. Report context exists, but no explicit career report continuity packet is passed into Ask My Chart runtime flow.

## 5) Audit question answers

1. Can current AI distinguish job/service vs business tendency?
- Partially. It detects `career` and `business` domains by keywords, but lacks a dedicated chart-factor layer to explicitly separate service-job vs independent business tendency.

2. Can current AI discuss career growth timing using dasha/transit?
- Yes, partially to strong. Dasha chain and transit context are present, but career-specific timing framing is not explicitly pre-structured.

3. Can current AI safely discuss obstacles/work pressure without fear?
- Yes. Safety constraints are present in prompt builder, policy checks, and output validation; pressure is framed conservatively.

4. Can current AI connect career answers to report/consultation path softly?
- Yes. Free-plan nudges and formatter next-step guidance exist, including career-oriented CTA labeling.

5. Are career answers currently generic or chart-grounded?
- Mixed. Baseline is chart-grounded, but career specificity can still drift to generic phrasing because career context is not explicitly assembled as a dedicated block.

6. What files must be modified in 19.1B?
- See section "Exact 19.1B target files".

## 6) Prompt upgrade points for 19.1B

1. Add explicit career-context packaging before prompt generation:
- House clusters for career: 10/6/2/11/5/9/7.
- Clear labels for service-work, business, income, gains/network, intelligence, mentor/fortune, partnership.

2. Upgrade query matching for career prompts:
- Replace default `house <= 4` fallback with career-aware fallback for career/business/finance questions.

3. Strengthen career directives:
- Require model to differentiate service-job tendency vs business tendency using explicit house/lordship and timing context.
- Require conservative timing language with no guarantees.

4. Keep existing safety and gating directives unchanged.

## 7) Formatter/output upgrade points (for follow-up phase, not 19.1B)

1. Add optional career-specific chart reasoning line templates in formatter:
- Example: "10th/6th supports service rhythm", "7th/11th favors partnership/network-led growth", etc.

2. Keep current sectioned format:
- Direct Summary
- Chart-Based Reasoning
- Timing Insight
- Practical Guidance
- Caution/Safety
- Next Step

3. Preserve compact mode for simple questions and keep response length controlled.

## 8) Safety and premium gating notes

- Safety stack is active:
  - Prompt-level policy constraints (`prompt-builder`)
  - AI text policy checks (`modules/ai/policy.ts`)
  - Structured output validation and raw-context leak checks (`output-validator.ts`)
- Unsupported scopes are refused safely in Ask My Chart classification.
- Free/premium gating is active:
  - Daily question limits in `checkAskMyChartUsageLimit`
  - Free-response length and confidence guardrails
  - Soft premium nudges and upgrade paths
- No evidence of raw JSON/context leak in intended conversation formatter path.

## 9) Recommended next phase

- **Phase 19.1B - Career AI Prompt Upgrade**

## Exact 19.1B target files

- `src/modules/ask-chart/service.ts`
- `src/modules/ask-chart/assistant-response-engine.ts`
- `src/modules/ask-chart/chart-context-mapper.ts`
- `src/modules/ai/prompt-registry.ts`
- `src/lib/astrology/accuracy/prompt-builder.ts`

### Optional (only if needed during implementation)
- `src/modules/astrology/predictive-assistant-context.ts`
- `src/lib/astrology/accuracy/output-validator.ts`

