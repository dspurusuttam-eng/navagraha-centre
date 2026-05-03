# Phase 19.7C - Daily Personalized Prediction Answer Formatter

## Files Changed
- `src/modules/ask-chart/jyotish-answer-formatter.ts`
- `src/modules/ask-chart/service.ts`

## Final Daily Answer Structure
Daily personalized prediction answers now follow this structure when the user asks for today/daily guidance:
1. Today's Core Message
2. Personal Timing Insight
3. Work / Study / Business Focus
4. Relationship / Family Focus
5. Money / Decision Caution
6. Health / Energy Balance
7. Lucky Color / Number / Time
8. Daily Remedy / Spiritual Support
9. Soft Next Step

The formatter stays concise for short daily questions, but keeps the same section order.

## When The Daily Formatter Applies
The daily formatter applies only when the question is explicitly daily or today-focused, including:
- today's prediction
- daily guidance
- today / tomorrow / tonight questions
- lucky color / lucky number / lucky time
- auspicious or caution timing for today
- daily work, study, business, relationship, money, health, or remedy guidance

It does not replace the specialized career, marriage, finance, health, education, or business formatters unless the user is clearly asking for daily/today guidance.

## Dasha / Transit / Panchang Usage
Daily timing now combines:
- current dasha chain
- current transit context
- lead transit tone when available
- Panchang day feel and daily quality
- supportive and caution windows from the daily Panchang snapshot

The answer treats these as timing cues, not fixed outcomes. It does not promise events or use fear-based warnings.

## Lucky Color / Number / Time Behavior
Lucky color, number, and time are shown only when the daily Rashifal snapshot is available from the chart context.

If the snapshot is not available, the formatter says so instead of fabricating values. In that case it falls back to Panchang timing windows as the practical daily cue.

## Missing-Chart Behavior
If chart or timing context is incomplete, the formatter keeps the answer general and directs the user to:
- generate or refresh Kundli context
- set location and timezone for sharper daily windows
- ask a follow-up daily question for more precision

## Safety Behavior
The daily formatter preserves the existing safety model:
- no guaranteed event prediction
- no fear-based daily warnings
- no exact medical, financial, or legal certainty
- no deterministic relationship, health, or money claims
- no raw chart or internal context leak
- no fabricated lucky values
- no premium bypass

Symptom or crisis wording still routes to the existing safety note behavior, including medical caution and urgent support language when needed.

## Premium Behavior
Free and premium gating is unchanged.
Soft next steps stay contextual and low-pressure, such as:
- ask one deeper daily follow-up
- return tomorrow for a fresh check-in
- set location/timezone for better daily timing
- continue with Ask My Chart or consultation for important decisions

## Next Recommended Phase
`19.7D` Daily Prediction QA Testing
