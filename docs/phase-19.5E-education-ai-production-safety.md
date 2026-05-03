# Phase 19.5E - Education / Learning AI Production Safety Check

## Integration status
- Education / learning questions are wired through the live Ask My Chart production flow.
- The Ask My Chart service now detects explicit education questions and routes them into the education explanation path.
- The assistant response engine passes a dedicated `education_question_intent` field and `education_context` block.
- The formatter renders education answers with a dedicated student-safe structure.

## Formatter routing status
- Education formatter applies to explicit education / learning / exam / subject-choice / higher-study / concentration / admission / remedy questions.
- Career formatter still handles explicit career questions.
- Marriage, finance, health, and general Jyotish formatters remain unchanged.
- Small routing fix applied in this phase:
  - education-to-career bridge questions such as study-to-career direction now stay in the education path even when the word `career` appears.

## Context usage status
Education answers can safely use:
- Lagna / Ascendant
- 4th house
- 5th house
- 9th house
- 2nd house
- 3rd house
- 6th house
- 10th house
- Mercury
- Jupiter
- Moon
- Saturn
- Mars
- Dasha chain
- Transit context
- Yoga / Rule signals
- predictive synthesis summary

## Missing context fallback behavior
- If chart context is missing, the answer stays directional and general.
- The user is guided to generate or refresh Kundli context before expecting stronger academic timing depth.
- The response never fabricates marks, rank, admission, or pass/fail certainty.

## Student safety status
- No guaranteed marks, rank, admission, scholarship, pass/fail, or exam-success claims are allowed.
- No deterministic failure language is allowed.
- No student-shaming or fear-based education language is allowed.
- No fear-based remedy language is allowed.
- No raw chart JSON or internal context is exposed to the user.
- No premium bypass exists.

## Exam stress / failure anxiety handling behavior
- Exam pressure, failure fear, panic, hopelessness, or inability to cope are answered in a calm and supportive tone.
- The formatter encourages routine, revision, mentor guidance, and practical study steps.
- If severe distress appears, the existing health/emergency safety behavior is the fallback.
- Distress is never framed as destiny.

## Remedy safety behavior
- Education remedies are optional and supportive.
- Remedies do not guarantee success.
- Remedies do not replace real study effort, mentor support, or mental-health support when needed.
- Fear-based remedy wording is excluded.

## Premium gating status
- Free and premium limits remain unchanged.
- No premium bypass was introduced.
- Soft CTAs stay contextual:
  - Generate Kundli first if chart context is missing
  - Ask a deeper education question
  - View Education/Career Report if available
  - Book Consultation for academic guidance
- Premium output does not imply guaranteed academic success.

## Privacy / logging notes
- No sensitive birth details are logged unnecessarily in this phase.
- No raw chart data is exposed to the user.
- Student-distress handling does not leak internal implementation details.

## Manual live QA checklist
1. Seed a QA user with `npm run qa:seed:user`.
2. Start the app with `npm run dev`.
3. Open `http://localhost:3000/dashboard/ask-my-chart`.
4. Test:
   - subject choice
   - competitive exam
   - higher studies
   - concentration
   - memory
   - study routine
   - admission timing
   - exam pressure
   - learning obstacles
   - study-to-career direction
   - education remedy
   - missing chart context
   - failure anxiety
   - severe student distress
5. Confirm the structure:
   - Education Summary
   - Learning / Subject Tendency
   - Timing Insight
   - Strengths & Opportunities
   - Study Challenges / Caution
   - Practical Study Guidance
   - Optional Spiritual Support only when relevant
   - Soft Next Step only when relevant
6. Confirm no guaranteed result language, no fear language, and no raw context leak.

## Known non-blocking follow-ups
- A dedicated education-specific automated QA harness does not exist yet.
- Live-provider QA should still be repeated in the production-like environment whenever model configuration changes.
- Education answers could later get a more specialized report path if the product roadmap needs it.

## Next recommended AI module
- Next production-safety phase for Education / Learning AI is complete.
- Continue with the next prioritized AI module in the roadmap.

