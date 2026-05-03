# Phase 19.7A - Advanced Daily Personalized Prediction AI Audit

## Files Inspected
- `src/modules/ask-chart/service.ts`
- `src/modules/ask-chart/assistant-response-engine.ts`
- `src/modules/ask-chart/jyotish-answer-formatter.ts`
- `src/modules/ai/prompt-registry.ts`
- `src/lib/astrology/accuracy/prompt-builder.ts`
- `src/modules/retention/service.ts`
- `src/modules/retention/types.ts`
- `src/modules/account/components/dashboard-ecosystem-home.tsx`
- `src/modules/panchang/engine.ts`
- `src/modules/muhurta-lite/engine.ts`
- `src/modules/rashifal/content.ts`
- `src/modules/content/catalog.ts`

## Current Daily Prediction Flow Summary
NAVAGRAHA CENTRE already has several daily guidance surfaces, but they are split across different product layers rather than unified into a dedicated daily personalized prediction AI flow.

- `Ask My Chart` already supports current-cycle and transit-oriented questions through `TRANSIT_EXPLANATION` handling and timing-aware chart reasoning.
- The retention dashboard already shows daily-style guidance cards such as `Today's Insight`, `Current Energy`, `Recommended Next Step`, and a Panchang return prompt.
- The Panchang and Muhurta tools already provide date/location-based timing context such as Tithi, Nakshatra, Yoga, Karana, Rahu Kaal, Gulika Kaal, Yamaganda, and Abhijit Muhurta.
- The public Rashifal content layer already publishes daily sign-wise guidance with lucky color, lucky number, lucky time, and sign-based daily themes.

The missing piece is a first-class daily personalized prediction path that combines chart identity, dasha, transit, Panchang, and daily timing signals in one coherent Ask My Chart experience.

## Daily Prediction Context Already Available
- Saved chart identity through the user's onboarding and chart snapshot data.
- Lagna / Ascendant and natal chart facts already used throughout Ask My Chart.
- Current dasha chain and next transition data in predictive assistant context.
- Transit snapshot data in Ask My Chart for current-cycle questions.
- Panchang timing data from the calendar engine, including day quality and caution windows.
- Muhurta-lite windows for daily timing emphasis.
- Daily Rashifal lucky indicators:
  - lucky color
  - lucky number
  - lucky time
- Retention dashboard surfaces that can already surface a daily nudge back to the product.

## Missing Daily Prediction Context
- No dedicated `daily_prediction_context` block exists in `Ask My Chart`.
- No Ask My Chart classifier branch specifically identifies questions like "How is my day today?" or "What should I focus on today?" as a daily personalized prediction intent.
- No AI prompt instructions yet explicitly combine dasha + transit + Panchang + daily timing into one daily prediction response.
- No dedicated daily prediction formatter branch exists.
- No direct propagation of Panchang / Muhurta / lucky color-number-time data into the Ask My Chart prompt layer.
- No explicit daily safety framing for avoiding fear-based daily warnings or fake certainty about a single day.

## Dasha / Transit / Panchang Integration Notes
- Dasha and transit are already available in Ask My Chart and are the strongest current timing inputs for a personalized reading.
- Panchang and Muhurta are already available as deterministic timing tools, but they are not yet wired into the assistant prompt path.
- The current state is split:
  - Ask My Chart handles chart-aware life questions and transit timing.
  - Panchang/Muhurta handle daily calendar timing.
  - Retention handles daily dashboard guidance.
- 19.7B should decide whether daily prediction is only an Ask My Chart enhancement or a shared timing layer that also feeds retention.

## Lucky Color / Number / Time Availability
- Available today in `src/modules/rashifal/content.ts` and the manual Rashifal publishing workflow.
- Not yet available as a dedicated personalized answer field in Ask My Chart.
- There is no current logic to reconcile a user's natal chart with daily lucky indicators before presenting them.

## Retention-Readiness Notes
- The retention dashboard already has a clear daily-return pattern:
  - Today’s Insight
  - Current Energy
  - Recommended Next Step
  - Panchang return prompt
- That makes the product retention-ready for daily engagement, but not yet daily-prediction-AI complete.
- If 19.7B extends the AI layer into retention, the dashboard can reuse the same daily timing logic instead of duplicating it.

## Safety / Premium Gating Notes
- Existing safety rules already cover health, finance, relationship, and career domains.
- There is no daily-specific safeguard yet for:
  - fake certainty about the day
  - fear-based daily warnings
  - overconfident lucky color or lucky time claims
  - daily remedy overclaiming
- Premium / free gating is unchanged.
- Daily prediction should stay optional, grounded, and non-deterministic, especially when timing data is partial.

## Audit Conclusion
Daily personalized prediction is not yet a first-class AI module. The codebase already has enough timing and retention infrastructure to support it, but the assistant path still lacks a dedicated daily prediction intent, prompt instructions, and formatter branch.

## Exact Files To Modify In 19.7B
Primary AI path:
- `src/modules/ask-chart/service.ts`
- `src/modules/ask-chart/assistant-response-engine.ts`
- `src/modules/ask-chart/jyotish-answer-formatter.ts`
- `src/modules/ai/prompt-registry.ts`
- `src/lib/astrology/accuracy/prompt-builder.ts`

Optional supporting surfaces, if 19.7B also aligns the daily retention experience:
- `src/modules/retention/service.ts`
- `src/modules/retention/types.ts`
- `src/modules/account/components/dashboard-ecosystem-home.tsx`
- `src/modules/panchang/engine.ts`
- `src/modules/muhurta-lite/engine.ts`
- `src/modules/rashifal/content.ts`
- `src/modules/content/catalog.ts`

## Recommended Next Phase
`19.7B - Advanced Daily Prediction Prompt Upgrade`
