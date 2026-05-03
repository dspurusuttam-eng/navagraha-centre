# Phase 19.0A — Core Jyotish AI Context Audit

## Scope and guardrails followed
- This phase was audit-only.
- No AI behavior, prompt behavior, astrology calculation logic, UI, routing, auth, payments, SEO, or tool logic was changed.
- Only repository inspection was performed and this report was added.

## 1) Files inspected

### Ask My Chart flow and API surface
- `src/app/api/ai/ask-chart/sessions/route.ts`
- `src/app/api/ai/ask-chart/sessions/[sessionId]/route.ts`
- `src/app/api/ai/ask-chart/sessions/[sessionId]/messages/route.ts`
- `src/app/(app)/dashboard/ask-my-chart/page.tsx`
- `src/modules/ask-chart/components/ask-my-chart-assistant.tsx`
- `src/modules/ask-chart/service.ts`
- `src/modules/ask-chart/chart-context-mapper.ts`
- `src/modules/ask-chart/assistant-response-engine.ts`
- `src/modules/ask-chart/types.ts`

### Predictive context stack (Phase 18 lineage)
- `src/modules/astrology/predictive-assistant-context.ts`
- `src/modules/astrology/predictive-synthesis-context.ts`
- `src/modules/astrology/dasha-context.ts`
- `src/modules/astrology/transit-context.ts`
- `src/modules/astrology/yoga-rule-context.ts`
- `src/modules/astrology/predictive-report-context.ts`
- `src/modules/astrology/vimshottari-dasha.ts`
- `src/modules/astrology/chart-contract-types.ts`

### Prompting / provider / policy / safety
- `src/modules/ai/prompt-registry.ts`
- `src/modules/ai/prompt-versioning.ts`
- `src/modules/ai/prompts.ts`
- `src/modules/ai/policy.ts`
- `src/modules/ai/grounded-text-service.ts`
- `src/modules/ai/providers/openai-interpretation-provider.ts`
- `src/modules/ai/providers/mock-interpretation-provider.ts`
- `src/modules/ai/config.ts`
- `src/lib/astrology/accuracy/prompt-builder.ts`
- `src/lib/astrology/accuracy/input-validator.ts`
- `src/lib/astrology/accuracy/output-validator.ts`
- `src/lib/astrology/accuracy/astrology-data-validator.ts`
- `src/lib/astrology/accuracy/prediction-policy.ts`

### Report and cross-surface context references
- `src/lib/ai/report-generator.ts`
- `src/modules/report/chart-context.ts`
- `src/modules/report/service.ts`
- `src/modules/report/premium-report-generator.ts`
- `src/lib/ai/types.ts`

### Gating / abuse protection / logging
- `src/modules/subscriptions/usage-control.ts`
- `src/modules/subscriptions/user-plan.ts`
- `src/lib/security/security-config.ts`
- `src/lib/security/rate-limit.ts`
- `src/lib/security/request-guard.ts`
- `src/lib/security/input-safety.ts`
- `src/lib/security/safe-logger.ts`

---

## 2) Current AI flow summary

1. User opens protected Ask My Chart UI (`/dashboard/ask-my-chart`), sessions/messages are handled by authenticated API routes.
2. API layer enforces:
   - auth (`getSession`)
   - origin/payload guards
   - AI route rate limits (`ai-session-create`, `ai-session-read`, `ai-message`)
3. `sendAskMyChartMessage` flow:
   - validates message input and length
   - checks per-plan usage limits
   - loads/refreshed saved chart contract
   - validates chart completeness and verification status
   - maps chart to AI context
   - builds tool bundle (chart snapshot/facts, transit snapshot, predictive assistant context, remedies/products/insights, consultation context)
4. Assistant generation:
   - prompt template resolved by key `ask-my-chart-copilot`
   - prediction prompt built with safety directives
   - provider call via grounded text service
   - structured output validation and strict retry fallback
5. Persistence and tracking:
   - conversation messages stored
   - AI task runs logged with policy flags
   - usage counters update premium/free nudge behavior

---

## 3) Astrology context currently passed to AI

### Directly passed (Yes)
- Lagna / Ascendant
  - `chartContext.lagna` and chart snapshot ascendant sign.
- Moon sign
  - `chartContext.moonSign` and predictive `chart_identity.moon_sign`.
- Planetary positions
  - `chartContext.rashiPlacements` (body/sign/house/nakshatra/pada/retrograde/combust).
- House placements
  - `chartContext.housePlacements`.
- Dasha chain
  - predictive `active_period_context.active_chain`.
- Antardasha
  - predictive `active_period_context.antardasha`.
- Pratyantar
  - predictive `active_period_context.pratyantar`.
- Day Dasha
  - predictive `active_period_context.day_dasha`.
- Transit data
  - transit snapshot tool (transits + aspects) and predictive transit summary.
- Predictive synthesis summary
  - timing focus, dominant planets/houses, supportive/pressure factors, confidence.
- User question
  - explicitly passed in prediction prompt payload.
- User/chart identity context
  - user name, chart id/snapshot, lagna/moon identity packet.

### Partial / indirect
- Sun sign
  - not an explicit dedicated field; derivable from planetary placements.
- House lordship
  - available partially in `matchingHouses.ruler` for selected houses; not consistently full 12-house matrix in assistant payload.
- Yoga / Rule signals
  - assistant receives summarized synthesis factors, not full raw yoga/rule signal structures.

### Not currently connected (for Ask My Chart runtime)
- Numerology context
  - no direct numerology computation context in assistant tool bundle/prompt payload.
- Full report-context sharing into assistant
  - report interpretation/premium report context is generated in report flows, but not injected into Ask My Chart response generation.

---

## 4) Context missing or under-exposed for 19.0B

1. Explicit Sun-sign field (currently implicit via placements).
2. Full sign-lordship matrix (not explicitly represented in assistant context).
3. Full house-lordship matrix and rule reasoning packet (currently only partial/derived exposure).
4. Raw yoga/rule details in assistant tool payload (currently compressed to summary outputs).
5. Structured Dasha date windows (start/end for all active levels) surfaced to assistant prompt payload in a predictable shape.
6. Direct numerology context bridge for mixed chart+numerology questions (currently absent).
7. Optional report-to-assistant continuity packet (report summary signals not currently attached to Ask My Chart runtime input).

---

## 5) Where prompt upgrades should happen (19.0B)

Primary files:
- `src/modules/ask-chart/assistant-response-engine.ts`
  - `createPromptBundle`
  - structured instruction assembly and strict retry directives
- `src/modules/ai/prompt-registry.ts`
  - `ask-my-chart-copilot` default version content
- `src/lib/astrology/accuracy/prompt-builder.ts`
  - shared policy/tone/tool-boundary directives for `NAVAGRAHA_CHAT`

Supporting file:
- `src/modules/ask-chart/service.ts`
  - `groundedScope` generation/classification guidance if prompt intent routing needs deeper granularity.

---

## 6) Where an answer formatter should be added (19.0B)

Primary insertion point:
- `src/modules/ask-chart/service.ts`
  - `formatStructuredReplyForConversation` (current join-based formatter)

Recommended direction:
- Add a dedicated assistant output formatter utility (new module under `src/modules/ask-chart/`) to normalize:
  - section order
  - locale-specific confidence/disclaimer lines
  - stable compact/free and detailed/premium output shapes
  - deterministic rendering for UI and logging consistency

Validation tie-in:
- keep `src/lib/astrology/accuracy/output-validator.ts` aligned with any new structured output schema.

---

## 7) Safety and premium-gating notes

### Safety controls observed
- Input validation with max question length and normalized text.
- Chart completeness and verification checks before grounded interpretation.
- Unsupported scope classifier refuses high-risk categories (medical/legal/financial certainty, harmful/fear categories).
- Structured output validation against prediction policy and remedy safety checks.
- Fallback responses when context/provider/policy validation fails.
- Origin guard, payload-size guard, and route-level rate limiting for AI endpoints.

### Gating controls observed
- Plan usage limits enforced before response generation.
- Free plan:
  - daily question limit
  - response-length guardrails
  - confidence cap from high to medium in free response normalization
- Premium nudges and upgrade copy are surfaced contextually after usage/intent events.

### Privacy/logging
- Safe logger redacts sensitive keys in security logs.
- AI task logging stores structured payloads for runs; operationally useful, but should remain under existing private storage controls.

---

## 8) Recommended next phase: 19.0B

Recommended title:
- **Phase 19.0B — Core Jyotish AI Context Expansion + Prompt Upgrade**

Recommended implementation focus:
1. Expand assistant context contract with explicit Sun/sign-lordship/house-lordship and richer timing windows.
2. Pass raw yoga/rule evidence packets (bounded size) alongside current summaries.
3. Add optional numerology context bridge when relevant inputs exist.
4. Add optional report-to-assistant continuity context (safe summary only).
5. Upgrade `ask-my-chart-copilot` prompt template and builder directives to consume expanded context deterministically.
6. Introduce a dedicated answer formatter module and keep validator rules synchronized.

---

## 19.0B target file list (exact)

- `src/modules/ask-chart/chart-context-mapper.ts`
- `src/modules/ask-chart/service.ts`
- `src/modules/ask-chart/assistant-response-engine.ts`
- `src/modules/astrology/predictive-assistant-context.ts`
- `src/modules/astrology/predictive-synthesis-context.ts`
- `src/modules/ai/prompt-registry.ts`
- `src/lib/astrology/accuracy/prompt-builder.ts`
- `src/lib/astrology/accuracy/output-validator.ts`

Optional (if report/numerology bridge is included):
- `src/lib/ai/report-generator.ts`
- `src/lib/ai/types.ts`
- `src/modules/numerology/*` (read-only context export utility only)

