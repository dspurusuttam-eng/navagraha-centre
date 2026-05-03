# Phase 19.1B - Career AI Prompt Upgrade

## Scope and guardrails followed
- Career prompt/context upgrade only.
- No astrology calculation changes.
- No UI redesign or route/auth/payment/SEO/tools/report/database/pricing changes.
- Existing free/premium gating and safety layers preserved.

## 1) Files changed
- `src/modules/ask-chart/assistant-response-engine.ts`
- `src/modules/ask-chart/service.ts`
- `src/modules/ai/prompt-registry.ts`
- `src/lib/astrology/accuracy/prompt-builder.ts`

## 2) Career AI behavior added

1. Career intent classification was added inside prompt context mapping for:
- job/service
- business
- career growth
- job change
- promotion
- government/private job
- study-to-career direction
- obstacles/work pressure
- income/gains
- professional reputation

2. Career context block was added to assistant prompt payload:
- explicit career house focus mapping (10th, 6th, 2nd, 11th, 5th, 9th, 7th)
- question intent tags
- dominant houses and timing focus
- supportive/pressure factors
- dasha chain snippet

3. Core Jyotish directives were upgraded for career answers:
- prioritize career houses/lordship context
- differentiate job/service vs business tendency when context supports it
- use dasha/transit timing framing (growth/discipline/wait/change/stability)
- include practical actions (skills, communication, networking, preparation, risk-aware pacing)

4. Ask My Chart question guidance was upgraded for career prompts:
- career-specific grounded scope now explicitly asks for career-house and timing reasoning with non-deterministic phrasing.

5. Career query-match house fallback improved:
- for career-focused questions, matching house context now defaults to 10/6/2/11/5/9/7 instead of generic 1–4 fallback.

## 3) Career astrology context used
- Lagna / Ascendant
- Moon sign / Sun sign (if available)
- Planetary positions
- House placements
- House lordship / sign lordship
- Career houses: 10, 6, 2, 11, 5, 9, 7
- Dasha chain (including sub-period layers when present)
- Transit context
- Yoga/rule synthesis summary
- Predictive support/pressure/timing focus
- User question intent

## 4) Safety rules preserved
- No deterministic success/failure guarantees added.
- No exact-date guarantee framing added.
- No fear-based language instructions added.
- Existing high-risk policy constraints remain in prompt builder and output validator.

## 5) Premium gating preserved
- Existing plan checks and free-tier guardrails were not changed.
- Existing usage limits and nudges were not bypassed.
- Prompt now keeps career premium path mention soft and contextual.

## 6) What was intentionally not changed
- Astrology engine and chart math
- API contracts and route structure
- UI rendering and component layout
- Billing/paywall logic
- Report generation flow

## 7) Next recommended phase
- **Phase 19.1C - Career AI Answer Formatter**
  - add career-specific output shaping in the formatter while preserving the 19.0C section structure.

