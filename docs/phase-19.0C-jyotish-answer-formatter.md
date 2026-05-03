# Phase 19.0C - Core Jyotish Answer Formatter

## Scope
- Added a reusable response formatter for Ask NAVAGRAHA AI conversation output.
- Preserved existing astrology engines, routing, auth, payments, SEO, reports, pricing, and database behavior.
- Preserved Phase 19.0B safety constraints and free/premium gating.

## 1) Files changed
- `src/modules/ask-chart/jyotish-answer-formatter.ts`
- `src/modules/ask-chart/service.ts`

## 2) Final answer format
The formatter outputs structured sections in this order:

1. `Direct Summary`
2. `Chart-Based Reasoning`
3. `Timing Insight`
4. `Practical Guidance`
5. `Caution / Safety Note` (only when relevant)
6. `Next Step`

Additional footer lines remain:
- confidence label and localized confidence note
- localized astrology disclaimer (when enabled by caller)

## 3) When formatter applies
- Applied to Ask My Chart conversation replies from:
  - normal model responses
  - unsupported-scope refusal responses
  - missing-chart / incomplete-data / low-verification fallback responses
- Domain-aware behavior is enabled for:
  - career
  - marriage
  - finance
  - health
  - education
  - business
  - family
  - daily guidance
  - life period
- Short conversational flexibility is preserved by a compact mode for simple low-risk questions.

## 4) Safety behavior
- Keeps existing non-guarantee, non-fear-based output behavior.
- Adds contextual caution notes only when relevant (health/finance/relationship/low-confidence/unsupported).
- Avoids raw JSON/context dumps and keeps chart references user-readable.

## 5) Premium behavior
- No paywall bypass added.
- Existing usage limit and plan checks are unchanged.
- Formatter only adjusts response shape; it does not modify billing or gating decisions.

## 6) Next recommended phase
- **19.0D - AI QA Testing**
  - Run intent-wise QA prompts across career/marriage/finance/health/business/family/daily period questions.
  - Verify section consistency, response length control, and safety note correctness per intent.
