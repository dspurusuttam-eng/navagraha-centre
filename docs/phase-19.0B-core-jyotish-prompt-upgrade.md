# Phase 19.0B — Core Jyotish Prompt Upgrade

## Scope
- Upgraded Ask NAVAGRAHA AI prompt/context behavior to be more Jyotish-grounded.
- Preserved existing assistant flow, safety layer, and free/premium gating.
- No astrology calculation logic changed.

## 1) Files changed
- `src/modules/ask-chart/chart-context-mapper.ts`
- `src/modules/ask-chart/assistant-response-engine.ts`
- `src/lib/astrology/accuracy/prompt-builder.ts`
- `src/modules/ai/prompt-registry.ts`

## 2) Prompt behavior added
- Added explicit Core Jyotish reasoning directives for NAVAGRAHA chat:
  - reason through natal context → dasha timing → transit influence → yoga/rule signals → practical guidance
  - detect likely question focus areas (career, marriage, finance, health, education, business, family, spiritual growth, current period)
  - keep output public-friendly, grounded, and non-generic
- Added explicit answer sequencing guidance:
  - short direct summary first
  - chart-based reasoning
  - timing insight
  - practical guidance + safe caution
- Updated Ask My Chart default prompt template text to reinforce Jyotish-grounded behavior.

## 3) Astrology context used in prompt payload
- Added and explicitly exposed:
  - Lagna / Ascendant
  - Moon sign
  - Sun sign (if available)
  - Planetary positions
  - House placements
  - House lordship
  - Sign lordship
  - Dasha chain, Mahadasha, Antardasha, Pratyantar, Day Dasha
  - Next dasha transition timing
  - Transit snapshot (active transits + key aspects)
  - Predictive synthesis summary (timing focus, dominant planets/houses, supportive/pressure factors, confidence)
  - User question + detected focus areas

## 4) Safety rules preserved
- Existing constraints remain active:
  - no chart-math invention
  - no guaranteed predictions
  - no fear-based language
  - no medical/legal/financial certainty claims
  - remedy safety and non-coercive phrasing
- Strict retry mode remains in place for unsafe/invalid output.

## 5) Premium gating preserved
- No changes to usage limits/paywall logic.
- Existing free-plan response guardrails remain intact.
- Soft premium/deeper-path mention is instruction-only and does not bypass gating.

## 6) What was not changed
- No route changes
- No UI redesign
- No auth/payment/SEO/report/database schema changes
- No astrology engine/calculation changes

## 7) Recommended next phase
- **19.0C — Jyotish Answer Formatter**
  - formalize response formatting/output sections at a dedicated formatter layer while keeping current safety validation.

