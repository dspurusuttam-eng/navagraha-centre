# Phase 19.5B - Education / Learning AI Prompt Upgrade

## Files changed
- `src/modules/ask-chart/service.ts`
- `src/modules/ask-chart/assistant-response-engine.ts`
- `src/modules/ai/prompt-registry.ts`
- `src/lib/astrology/accuracy/prompt-builder.ts`

## Education AI behavior added
- Education questions now have a dedicated ask-chart classification path with education-specific grounded scope guidance.
- The Ask My Chart payload now carries an `education_question_intent` field and a dedicated `education_context` block.
- Core prompt instructions now tell NAVAGRAHA AI to reason through education, learning, exam, concentration, subject choice, higher study, admission timing, and study pressure using Jyotish context before generic advice.
- Education questions are now explicitly separated from career, finance, relationship, and health framing at the prompt/context layer.

## Education astrology context used
- Lagna / Ascendant
- 4th house for foundation and basic education
- 5th house for intelligence, memory, creativity, and learning ability
- 9th house for higher study, guru, and academic guidance
- 2nd house for early learning and family support
- 3rd house for effort, communication, and skill-building
- 6th house for exam discipline and competition
- 10th house for career-direction linkage
- Mercury, Jupiter, Moon, Saturn, and Mars
- Dasha chain, transit context, yoga/rule signals, and predictive synthesis summary when available

## Student safety rules preserved
- No guaranteed rank, marks, pass/fail, admission, or scholarship claims.
- No fear-based exam prediction.
- No deterministic success/failure language.
- No pressure-based remedy language.
- If severe distress, hopelessness, or self-harm language appears, the existing health/emergency safety behavior remains the fallback.

## Premium gating preserved
- Free and premium limits were not changed.
- No premium bypass was introduced.
- Education guidance remains useful even when chart depth is limited.
- Any deeper report or consultation suggestion stays soft and contextual.

## Validation
- `npm run build` passed.
- `npm run lint` passed.
- `npm run typecheck` passed.

## Next recommended phase
- Phase 19.5C - Education AI Answer Formatter
