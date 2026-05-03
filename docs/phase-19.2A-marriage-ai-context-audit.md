# Phase 19.2A - Marriage / Relationship AI Context Audit

## Scope and guardrails followed
- Audit-only phase completed.
- No AI behavior, prompt behavior, astrology calculations, UI, routing, auth, payments, SEO, tools, reports, database, or pricing logic changed.
- Only repository inspection was performed and this audit report was added.

## 1) Files inspected

### Ask NAVAGRAHA AI / Ask My Chart flow
- `src/app/(app)/dashboard/ask-my-chart/page.tsx`
- `src/app/api/ai/ask-chart/sessions/route.ts`
- `src/app/api/ai/ask-chart/sessions/[sessionId]/route.ts`
- `src/app/api/ai/ask-chart/sessions/[sessionId]/messages/route.ts`
- `src/modules/ask-chart/components/ask-my-chart-assistant.tsx`
- `src/modules/ask-chart/service.ts`
- `src/modules/ask-chart/chart-context-mapper.ts`
- `src/modules/ask-chart/assistant-response-engine.ts`
- `src/modules/ask-chart/jyotish-answer-formatter.ts`

### Core Jyotish prompt and formatter baseline
- `src/modules/ai/prompt-registry.ts`
- `src/lib/astrology/accuracy/prompt-builder.ts`
- `src/lib/astrology/accuracy/output-validator.ts`
- `src/lib/astrology/accuracy/prediction-policy.ts`
- `src/lib/astrology/accuracy/remedy-safety.ts`

### Predictive synthesis and report / assistant context
- `src/modules/astrology/predictive-assistant-context.ts`
- `src/modules/astrology/predictive-synthesis-context.ts`
- `src/modules/astrology/predictive-report-context.ts`
- `src/modules/report/chart-context.ts`
- `src/modules/report/service.ts`
- `src/lib/ai/report-generator.ts`

### Compatibility / marriage surfaces
- `src/app/(marketing)/compatibility/page.tsx`
- `src/app/(marketing)/compatibility-hub/page.tsx`
- `src/app/(marketing)/marriage-compatibility/page.tsx`
- `src/modules/calculators/service.ts`
- `src/modules/content/hubs.ts`
- `src/modules/marketing/ai-product-family.ts`
- `src/modules/marketing/seo-entry-pages.ts`
- `src/modules/offers/service.ts`
- `src/modules/report/premium-product-catalog.ts`

### Premium/free gating and safety
- `src/modules/subscriptions/usage-control.ts`
- `src/modules/subscriptions/user-plan.ts`
- `src/modules/ai/policy.ts`
- `src/lib/security/security-config.ts`
- `src/lib/security/rate-limit.ts`
- `src/lib/security/request-guard.ts`
- `src/lib/security/safe-logger.ts`

## 2) Current marriage / relationship AI flow summary

1. User asks a question through the protected Ask My Chart flow.
2. API routes enforce auth, origin guards, payload size checks, and AI rate limits before the message is accepted.
3. `sendAskMyChartMessage` validates the question, checks usage limits, loads the saved chart, validates completeness, and builds the grounded tool bundle.
4. The assistant prompt is assembled from:
   - core Jyotish chart context
   - dasha timing
   - transit snapshot
   - yoga / rule synthesis
   - question classification
5. The response is then normalized through `formatJyotishAnswerForConversation`.
6. Safety policy checks, raw-context leak checks, and free-plan guardrails remain active before the final answer is stored and shown.

## 3) Marriage / relationship context already available to AI

### Directly available in the Ask My Chart prompt payload
- Lagna / Ascendant
- Moon sign
- Sun sign when available
- Planetary positions
- House placements
- House lordship
- Sign lordship
- Dasha chain
- Mahadasha / Antardasha / Pratyantar / Day Dasha
- Next transition timestamp and level
- Transit data
- Yoga / rule synthesis summary
- Supportive / pressure factors
- Predictive confidence
- User question text
- Detected focus areas
- Career intent tags when the question is career related

### Relationship-relevant chart context status
- 7th house and 4th / 5th / 8th / 11th house context is available indirectly through the full house and lordship arrays.
- Venus and Jupiter are present in planetary positions and can be surfaced by the prompt, but there is no dedicated relationship context block yet.
- Compatibility data exists elsewhere in the product, but Ask My Chart does not currently receive a dedicated compatibility packet.

### Compatibility / marriage product context already present elsewhere
- Compatibility entry surfaces exist in the marketing layer.
- Compatibility quick calculator exists.
- Compatibility consultation and report paths exist.
- These are product flows, not yet a structured assistant context block.

## 4) Missing or weak marriage / relationship context

1. No dedicated `relationship_context` block in the Ask My Chart prompt payload.
2. Compatibility score or compatibility summary is not currently passed into the assistant runtime.
3. Relationship house grouping is not pre-packaged for the model as a clear 7th / 2nd / 4th / 5th / 8th / 11th / Venus / Jupiter packet.
4. There is no explicit distinction layer for:
   - marriage timing
   - relationship harmony
   - compatibility / match quality
   - breakup / separation caution
5. No soft compatibility-report or consultation continuity packet is attached to Ask My Chart beyond generic premium nudges.

## 5) Audit question answers

1. Can current AI distinguish marriage timing vs relationship harmony vs compatibility?
- Partially. The classification sees marriage / relationship keywords, but the context is still generic and not yet pre-grouped by relationship theme.

2. Can it discuss delay / caution without fear-based language?
- Yes. Existing safety policy, prediction policy, and formatter safeguards already avoid fear-driven language and deterministic outcomes.

3. Can it safely answer "will I marry this person?" without deterministic claims?
- Partially. The safety layer will limit certainty, but the prompt does not yet explicitly optimize for this relationship-specific framing.

4. Can it connect to compatibility report or consultation softly?
- Yes at the product layer. Ask My Chart already has premium nudges and consultation paths, but compatibility continuity is still generic rather than relationship-specific.

5. Are relationship answers currently generic or chart-grounded?
- Mixed. They are grounded by chart data, but the relationship-specific reasoning is still not as explicit as it should be for marriage/compatibility questions.

6. What files must be modified in 19.2B?
- See section "Exact 19.2B target files".

## 6) Prompt upgrade points for 19.2B

1. Add relationship-specific intent classification for:
- marriage timing
- relationship harmony
- compatibility / match quality
- breakup / separation caution
- family / emotional stability

2. Add a dedicated relationship context block before prompt generation:
- 7th house
- 2nd house
- 4th house
- 5th house
- 8th house
- 11th house
- Venus
- Jupiter
- relevant lordship and timing emphasis

3. Extend prompt directives:
- distinguish marriage timing from harmony / compatibility / caution
- avoid deterministic "will I / won't I" answers
- keep timing language contextual and non-guaranteed
- keep relationship advice calm, non-fear-based, and public-friendly

4. Preserve all current safety and gating directives.

## 7) Formatter / output upgrade points

1. Add a marriage / relationship output branch in the formatter that can render:
- Relationship Summary
- Marriage / Compatibility Tendency
- Timing Insight
- Harmony Factors
- Caution Areas
- Practical Guidance
- Soft Next Step

2. Keep current 19.0C section structure available for non-relationship questions.
3. Keep compact mode for short questions so responses do not become overly long.
4. Preserve the current confidence and disclaimer lines at the end.

## 8) Safety and premium gating notes

- Safety stack is already active:
  - prompt builder policy constraints
  - AI text policy checks
  - structured output validation
  - raw-context leak detection
  - remedy safety checks
- Relationship questions should continue to avoid:
  - guaranteed marriage claims
  - breakup certainty
  - divorce prediction certainty
  - fear-based wording
  - emotional coercion
  - forced remedy or purchase pressure
- Free / premium gating is already enforced by Ask My Chart usage limits and soft nudges.

## 9) Recommended next phase

- **Phase 19.2B - Marriage / Relationship AI Prompt Upgrade**

## Exact 19.2B target files

- `src/modules/ask-chart/service.ts`
- `src/modules/ask-chart/assistant-response-engine.ts`
- `src/modules/ask-chart/jyotish-answer-formatter.ts`
- `src/modules/ask-chart/chart-context-mapper.ts`
- `src/modules/ai/prompt-registry.ts`
- `src/lib/astrology/accuracy/prompt-builder.ts`

### Optional if compatibility continuity is packaged separately
- `src/modules/calculators/service.ts`
- `src/modules/astrology/predictive-assistant-context.ts`
- `src/modules/astrology/predictive-synthesis-context.ts`
- `src/lib/ai/report-generator.ts`
- `src/modules/report/service.ts`

