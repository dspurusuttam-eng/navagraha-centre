# NAVAGRAHA CENTRE AI Astrology Accuracy Layer (Phase 18.1K)

## Purpose
The accuracy layer is a centralized safety gate for astrology-facing AI outputs.  
It enforces input correctness, chart/data completeness, prompt policy hardening, output validation, remedy safety, and confidence signaling before content is shown to users.

## Core Module
`src/lib/astrology/accuracy/`

- `input-validator.ts`
  - Validates inputs for birth details, assistant questions, rashifal, panchang, numerology, compatibility.
- `astrology-data-validator.ts`
  - Validates completeness for Kundli/chart, report chart context, panchang, muhurta-lite, compatibility context.
- `prediction-policy.ts`
  - Blocks deterministic/fear-based/high-risk claims and manipulative language.
- `prompt-builder.ts`
  - Builds policy-constrained prompts for tool types (`KUNDLI`, `DAILY_RASHIFAL`, `PANCHANG`, `NUMEROLOGY`, `COMPATIBILITY`, `REMEDIES`, `REPORT`, `NAVAGRAHA_CHAT`).
- `output-validator.ts`
  - Validates generated output structure, policy compliance, locale script compatibility, and remedy safety.
- `remedy-safety.ts`
  - Restricts unsafe/coercive remedy language.
- `confidence-score.ts`
  - Computes confidence level (`HIGH`, `MEDIUM`, `LOW`, `INCOMPLETE`) from data quality.
- `astrology-disclaimers.ts`
  - Locale-aware disclaimer and fallback copy (`en`, `as`, `hi` currently first-class).
- `index.ts`
  - Central exports + locale resolver + dev-only safe logging helper.

## Current Integrations

### Ask My Chart / NAVAGRAHA AI chat
- `src/modules/ask-chart/service.ts`
  - Assistant question validation.
  - Chart completeness validation before AI response.
  - Confidence snapshot generation.
  - Locale-aware fallback + disclaimer injection.
- `src/modules/ask-chart/assistant-response-engine.ts`
  - Central prompt builder usage.
  - Output validation with one strict retry.
  - Safe fallback on validation failure.
- `src/app/api/ai/ask-chart/sessions/[sessionId]/messages/route.ts`
  - Locale forwarded into assistant pipeline.

### Report interpretation
- `src/modules/ai/prompts.ts`
  - Report prompt now uses centralized prediction prompt builder.
- `src/modules/ai/service.ts`
  - Post-generation report output validation and safe fallback.
- `src/modules/report/service.ts`
  - Natal report completeness validation.
  - Confidence + disclaimer generation.
  - Safe fallback for incomplete or invalid interpretation outputs.
- `src/modules/report/components/chart-report-page.tsx`
  - Confidence line + incomplete-data notice surfaced.
  - Reusable disclaimer rendered.

### Astrology utility APIs
- `src/app/api/astrology/chart/route.ts`
  - Chart completeness check before response.
- `src/app/api/astrology/panchang/route.ts`
  - Panchang input validation + output completeness validation.
- `src/app/api/astrology/muhurta-lite/route.ts`
  - Shared date/place validation + muhurta completeness validation.
- `src/app/api/astrology/calculators/route.ts`
  - Tool-specific input validation for numerology, compatibility, and date-check.
- `src/modules/calculators/service.ts`
  - Safety validators reused server-side for deterministic tool execution.

## Confidence + Disclaimer UI
- Confidence and disclaimer are currently surfaced in report and assistant outputs.
- Reusable component:
  - `src/components/astrology/astrology-disclaimer.tsx`

## Logging and Privacy
- Uses `logAccuracyEvent(...)` from the accuracy layer.
- Dev-only output (`NODE_ENV !== "production"`).
- No raw API keys or payment data.
- No full user PII logging is added by this layer.

## Known Scope Boundaries (18.1K)
- This phase enforces safety/accuracy structure, not full prose localization for all languages.
- Long-form blog/manual content remains editorially controlled.
- Deterministic astrology math remains unchanged; this layer only validates and governs usage/output.
