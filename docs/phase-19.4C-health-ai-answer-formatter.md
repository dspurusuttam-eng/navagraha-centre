# Phase 19.4C - Health / Wellness AI Answer Formatter

## Files Changed

- [src/modules/ask-chart/jyotish-answer-formatter.ts](../src/modules/ask-chart/jyotish-answer-formatter.ts)

## Final Health Answer Structure

When the user asks about health or wellness, NAVAGRAHA AI now formats the answer as:

1. Wellness Summary
2. Chart-Based Wellness Indicators
3. Timing / Routine Focus
4. Practical Lifestyle Guidance
5. Medical Safety Note
6. Optional Spiritual Support
7. Soft Next Step

## When the Health Formatter Applies

- health
- wellness
- stress
- sleep
- energy / vitality
- emotional balance
- routine discipline
- health caution periods
- lifestyle support
- spiritual health remedies
- mental distress
- symptoms / medical concern

The formatter does not apply to career, marriage, finance, or general Jyotish questions.

## Medical Safety Behavior

- No diagnosis is provided.
- No medicine, cure, or treatment advice is provided.
- No instruction to stop medicine is provided.
- No prediction of hospitalization, death, or exact medical events is provided.
- Medical symptoms are framed as a reason to consult a qualified healthcare professional.

## Mental-Health / Emergency Behavior

- If the user mentions self-harm, hopelessness, violence, abuse, or immediate danger, the answer becomes support-forward and directs the user to local emergency services or trusted immediate support.
- Astrology is not used to justify crisis, unsafe conditions, or delay urgent help.

## Missing-Chart Behavior

- If chart context is weak or missing, the answer stays general and supportive.
- The user is guided to generate Kundli or provide birth details for deeper wellness context.
- The formatter does not fabricate chart-specific certainty.

## Premium Behavior

- Free / premium limits remain unchanged.
- Health Report and Consultation suggestions remain soft and contextual only.
- No implication is added that premium output can diagnose or cure illness.

## Validation

- `npm run typecheck` passed
- `npm run lint` passed
- `npm run build` passed

## Next Recommended Phase

- Phase 19.4D - Health AI QA Testing

