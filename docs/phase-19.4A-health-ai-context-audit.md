# Phase 19.4A - Health / Wellness AI Context Audit

## Scope and guardrails followed
- Audit-only phase completed.
- No AI behavior, prompt behavior, astrology calculations, UI, routing, auth, payments, SEO, tools, reports, database, or pricing logic changed.
- Only repository inspection was performed and this audit report was added.
- Health is treated as a sensitive domain; no diagnosis, treatment, medicine, or emergency behavior was added.

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

### Comparison baselines used for pattern review
- `src/modules/ask-chart/service.ts`
- `src/modules/ask-chart/assistant-response-engine.ts`
- `src/modules/ask-chart/jyotish-answer-formatter.ts`

## 2) Current health / wellness AI flow summary
- Health questions are recognized only as a broad domain in the formatter and core prompt guidance.
- There is no dedicated health-only production branch in the Ask My Chart service comparable to the career, relationship, or finance branches.
- Current health answers still flow through the general Jyotish assistant path, with only high-level health wording in the prompt and formatter layers.
- The formatter already knows health is a special domain and can adjust practical guidance and safety notes, but it lacks a dedicated wellness answer structure.
- The prompt layer mentions health as one of the life areas, but it does not yet give health-specific Jyotish reasoning instructions.

## 3) Health-related context already available
- Lagna / Ascendant is already part of the core chart context.
- Core chart context already exposes planetary positions, house placements, and house/sign lordship.
- Predictive assistant context already exposes timing layers such as active dasha chain, transit, dominant planets, dominant houses, supportive factors, and pressure factors.
- The system can already read relevant wellness indicators from Moon, Sun, Mars, Saturn, Mercury, Jupiter, and Venus placements if they are surfaced in chart facts.
- Health-related timing can already be framed through dasha and transit layers, but that is currently indirect rather than health-specific.

## 4) Missing health context
- No dedicated `health_context` block is being assembled for Ask My Chart responses.
- Health intent is not currently separated into a production branch with its own house/planet emphasis.
- I did not locate a source-side health report context module in `src`; if a health report route exists, it is not represented as a dedicated wellness context builder in the source tree I inspected.
- The predictive synthesis layer does not expose explicit wellness labels such as vitality, stress, sleep, routine, emotional balance, recovery, or energy pacing.
- There is no health-specific formatter branch that separates wellness, stress, sleep, energy, emotional balance, and routine guidance into distinct response patterns.

## 5) Prompt upgrade points
- Add a health-specific reasoning block in the Ask My Chart prompt payload.
- Separate wellness from general life guidance so health questions do not default to generic astrology copy.
- Explicitly instruct the model to reason from 1st, 6th, 8th, and 12th house context, plus Moon, Sun, Mars, Saturn, Mercury, Jupiter, and Venus when available.
- Add clear distinctions between wellness guidance, routine, stress pacing, sleep balance, emotional steadiness, recovery support, and emergency boundary handling.
- Keep the answer tone supportive, non-diagnostic, and medically conservative.

## 6) Formatter / output upgrade points
- Add a health-specific answer formatter branch similar to the career, relationship, and finance branches.
- Structure health answers around:
  - direct wellness summary
  - vitality / routine tendency
  - timing insight
  - stress / energy support factors
  - caution areas
  - practical wellness guidance
  - optional gentle spiritual support
  - soft next step
- Preserve the existing general Jyotish formatter for non-health questions.
- Ensure medicine, diagnosis, and treatment wording stays excluded.

## 7) Medical safety notes
- Health answers must never diagnose a condition.
- Health answers must never recommend treatment or medicine.
- Health answers must never suggest that astrology replaces medical care.
- Health answers should stay limited to wellness, routine, stress, sleep, energy, and emotional balance.
- Any mention of medical risk should direct the user to qualified professional care.

## 8) Mental health / emergency safety notes
- Self-harm, panic, crisis, abuse, or emergency language must trigger immediate supportive, non-fatalistic guidance.
- The system should recommend trusted human, local, or professional support.
- Astrology must never be used to justify harm, delay emergency help, or frame danger as destiny.
- Emotional wellbeing answers should be grounding and non-judgmental.

## 9) Premium gating notes
- Health questions should never bypass free / premium limits.
- Free-tier responses should remain useful but conservative.
- Health Report and Consultation CTAs should stay soft and contextual, not pushy.
- The answer should remain useful even when deeper premium health context is not available.

## 10) Recommended next phase: 19.4B Health / Wellness AI Prompt Upgrade

### Exact files to modify in 19.4B
- `src/modules/ask-chart/service.ts`
- `src/modules/ask-chart/assistant-response-engine.ts`
- `src/modules/ask-chart/jyotish-answer-formatter.ts`
- `src/modules/ai/prompt-registry.ts`
- `src/lib/astrology/accuracy/prompt-builder.ts`

### Optional support files if health/wellness context should be surfaced explicitly
- `src/modules/astrology/predictive-assistant-context.ts`
- `src/modules/astrology/predictive-synthesis-context.ts`
- `src/modules/astrology/predictive-report-context.ts`
- `src/modules/report/chart-context.ts`
- `src/modules/report/service.ts`
- `src/lib/ai/report-generator.ts`
