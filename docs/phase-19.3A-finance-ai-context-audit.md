# Phase 19.3A - Finance / Wealth AI Context Audit

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

### Career and marriage baselines used for comparison
- `src/modules/ask-chart/service.ts`
- `src/modules/ask-chart/assistant-response-engine.ts`
- `src/modules/ask-chart/jyotish-answer-formatter.ts`

## 2) Current finance AI flow summary
- Finance questions are recognized at the question-classification layer, but there is no finance-only production branch in the Ask My Chart service comparable to the career and relationship branches.
- Finance content currently flows through the same general Jyotish assistant path used by non-specialized questions.
- The formatter already knows finance is a domain and can adjust practical guidance and safety notes, but it still lacks a dedicated finance answer structure.
- The prompt layer already instructs the model to consider finance as one of the important life areas, but it does not yet give finance-specific reasoning instructions.

## 3) Finance-related context already available
- Lagna / Ascendant is already part of the core chart context.
- House placements and lordship context are available through the chart context mapper and core Jyotish context.
- Predictive assistant context already exposes timing layers such as active dasha chain, transit, dominant planets, dominant houses, supportive factors, and pressure factors.
- Jupiter, Venus, Saturn, and Mercury can already be read from the natal chart context and predictive synthesis inputs.
- The system can already ground answers in 2nd, 5th, 6th, 8th, 9th, 10th, 11th, and 12th house patterns, but that is currently indirect rather than finance-specific.

## 4) Missing finance context
- No dedicated `finance_context` block is being assembled for Ask My Chart responses.
- Finance intent is currently folded into career classification in the assistant response engine, which makes the finance path too broad for money-specific questions.
- The predictive synthesis layer does not expose explicit wealth labels such as income, savings, expenses, debt, investment risk, discipline, or wealth timing.
- There is no finance-specific formatter branch that separates income, savings, debt, business profit, and investment-risk answers into distinct response patterns.
- I did not locate a source-side finance report context module in `src`; if a finance report route exists, it appears to be represented indirectly rather than through a dedicated finance context builder.

## 5) Prompt upgrade points
- Add a finance-specific reasoning block in the Ask My Chart prompt payload.
- Separate finance from career/business in classification so money questions do not always inherit career-focused framing.
- Explicitly instruct the model to reason from 2nd, 5th, 6th, 8th, 9th, 10th, 11th, and 12th house patterns, plus Jupiter, Venus, Saturn, Mercury, dasha, transit, and yoga/rule signals.
- Add clear distinctions between income, savings, spending, debt, business profit, speculation, and financial discipline.
- Keep the answer tone public-friendly, conservative, and non-advisory for high-stakes financial topics.

## 6) Formatter / output upgrade points
- Add a finance-specific answer formatter branch similar to the career and relationship branches.
- Structure finance answers around:
  - direct financial summary
  - wealth / income / expense tendency
  - timing insight
  - growth and discipline factors
  - caution areas
  - practical financial guidance
  - optional soft next step
- Preserve the existing general Jyotish formatter for non-finance questions.
- Ensure investment, debt, and business-profit wording stays cautious and non-deterministic.

## 7) Safety / premium gating notes
- Finance questions should never guarantee income, profit, recovery, or investment outcomes.
- Advice should not read like regulated financial advice.
- Business profit questions should stay framed as tendencies and timing, not certainty.
- Premium or report CTAs should remain soft and only appear when deeper continuity genuinely helps.
- Free-tier responses should still be useful and should not be blocked by hidden finance requirements.

## 8) Recommended next phase: 19.3B Finance / Wealth AI Prompt Upgrade

### Exact files to modify in 19.3B
- `src/modules/ask-chart/service.ts`
- `src/modules/ask-chart/assistant-response-engine.ts`
- `src/modules/ask-chart/jyotish-answer-formatter.ts`
- `src/modules/ai/prompt-registry.ts`
- `src/lib/astrology/accuracy/prompt-builder.ts`

### Optional support files if finance-specific wealth context needs to be surfaced explicitly
- `src/modules/astrology/predictive-assistant-context.ts`
- `src/modules/astrology/predictive-synthesis-context.ts`
- `src/modules/astrology/predictive-report-context.ts`
