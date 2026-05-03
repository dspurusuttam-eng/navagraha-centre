# Phase 19.5A - Education / Learning AI Context Audit

## Files Inspected

- [src/modules/ask-chart/service.ts](../src/modules/ask-chart/service.ts)
- [src/modules/ask-chart/assistant-response-engine.ts](../src/modules/ask-chart/assistant-response-engine.ts)
- [src/modules/ask-chart/jyotish-answer-formatter.ts](../src/modules/ask-chart/jyotish-answer-formatter.ts)
- [src/modules/ai/prompt-registry.ts](../src/modules/ai/prompt-registry.ts)
- [src/lib/astrology/accuracy/prompt-builder.ts](../src/lib/astrology/accuracy/prompt-builder.ts)
- [src/modules/astrology/predictive-assistant-context.ts](../src/modules/astrology/predictive-assistant-context.ts)
- [src/modules/astrology/predictive-synthesis-context.ts](../src/modules/astrology/predictive-synthesis-context.ts)
- [src/modules/report/service.ts](../src/modules/report/service.ts)
- [src/modules/report/chart-context.ts](../src/modules/report/chart-context.ts)
- [docs/phase-19.0D-ai-jyotish-qa.md](./phase-19.0D-ai-jyotish-qa.md)
- [docs/phase-19.1D-career-ai-qa.md](./phase-19.1D-career-ai-qa.md)
- [docs/phase-19.2D-marriage-ai-advanced-qa.md](./phase-19.2D-marriage-ai-advanced-qa.md)
- [docs/phase-19.3D-finance-ai-qa.md](./phase-19.3D-finance-ai-qa.md)
- [docs/phase-19.4D-health-ai-qa.md](./phase-19.4D-health-ai-qa.md)
- `package.json`

## Current Education / Learning AI Flow Summary

- Education questions are currently recognized only as a broad domain in the formatter.
- The Ask My Chart service does not yet have a dedicated education intent branch.
- The assistant response engine does not yet pass an `education_context` block.
- Education wording is currently blended into broader Jyotish reasoning and, in some cases, absorbed into the career "study-to-career" path.
- The model prompt and tool-boundary prompt mention career, finance, relationship, and health explicitly, but not education as a first-class reasoning module.

## Education-Related Context Already Available

The current chart and predictive layers can already support education reasoning if a dedicated module is added:

- Lagna / Ascendant
- 4th house foundational learning and academic stability
- 5th house intelligence, memory, creativity, and learning ability
- 9th house higher study, guru, dharma, and guidance
- 2nd house speech, family support, and early learning
- 3rd house effort, skills, communication, and practice
- 6th house exams, discipline, competition, and routine pressure
- 10th house career direction connection
- Mercury for intellect, learning, memory, and communication
- Jupiter for wisdom, higher learning, and guidance
- Moon for concentration and study rhythm
- Saturn for discipline, delay, and sustained effort
- Mars for competitive energy
- Dasha chain
- Transit context
- Yoga / rule signals
- predictive synthesis summary

## Missing Education Context

- No dedicated `education_context` block is passed through the Ask My Chart assistant payload.
- No education-specific question intent list exists yet.
- No education-specific house bundle exists yet in the assistant prompt context.
- No education-only CTA or report guidance was found in the current source tree.
- No education-specific safety language for exam anxiety, failure fear, pass/rank/admission certainty, or subject choice is currently present as a dedicated branch.

## Current AI Flow Observations

1. User asks a question in Ask My Chart.
2. The service classifier currently recognizes education only indirectly through broad question wording.
3. Career classification already includes `study_to_career`, so study-related prompts can drift into career framing.
4. The formatter contains a generic education domain with a short practical line, but no dedicated education answer structure.
5. The prompt registry and chart-prompt builder still prioritize career / finance / relationship / health as explicit modules.

## Prompt Upgrade Points

- Add explicit education reasoning instructions to the Ask My Chart copilot prompt.
- Distinguish:
  - subject choice
  - exam preparation
  - concentration / memory
  - higher study
  - academic timing
  - skill growth
  - study-to-career direction
- Add safety instructions for:
  - exam anxiety
  - failure fear
  - pass / rank / admission certainty
  - pressure from parents or institutions
- Keep guidance non-deterministic and public-friendly.

## Formatter / Output Upgrade Points

- Add a dedicated education formatter branch in `jyotish-answer-formatter.ts`.
- Apply a consistent structure such as:
  - Education Summary
  - Chart-Based Learning Indicators
  - Timing / Study Rhythm Focus
  - Subject / Strength Direction
  - Exam / Competition Caution
  - Practical Study Guidance
  - Soft Next Step
- Keep the branch separate from career formatting so study and exam questions do not default to job/business framing.

## Student Safety / Stress Notes

- Exam stress and academic pressure should be handled calmly and supportively.
- The system should not guarantee pass, rank, admission, or scholarship outcomes.
- The system should not frame academic setbacks as destiny.
- If the user is overwhelmed or anxious, the response should emphasize routine, pacing, and realistic preparation.
- Mental distress should stay non-fatalistic and supportive.

## Premium Gating Notes

- Free / premium behavior is unchanged today.
- Any future education premium path should remain soft and contextual.
- No premium path should imply guaranteed marks, admission, or success.
- Education guidance must remain useful even when deeper report depth is gated.

## What This Audit Confirms

- Education is partially recognized today, but it is not a first-class module.
- Education questions are currently generic or blended with career.
- The repo already has enough Jyotish context to build a safe education module without changing astrology calculations.

## Validation

- `npm run lint` passed
- `npm run build` passed
- `npm run typecheck` passed after build regenerated `.next/types`

## Recommended Next Phase

- **19.5B - Education AI Prompt Upgrade**

## Exact Files to Modify in 19.5B

Primary files:
- `src/modules/ask-chart/service.ts`
- `src/modules/ask-chart/assistant-response-engine.ts`
- `src/modules/ask-chart/jyotish-answer-formatter.ts`
- `src/modules/ai/prompt-registry.ts`
- `src/lib/astrology/accuracy/prompt-builder.ts`

Optional support files if education-specific context should be surfaced more explicitly later:
- `src/modules/astrology/predictive-assistant-context.ts`
- `src/modules/astrology/predictive-synthesis-context.ts`
- `src/modules/report/service.ts`
- `src/modules/report/chart-context.ts`
- `src/lib/ai/report-generator.ts`

