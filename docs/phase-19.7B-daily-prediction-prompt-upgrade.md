# Phase 19.7B - Advanced Daily Personalized Prediction Prompt Upgrade

## Files Changed
- `src/modules/ask-chart/service.ts`
- `src/modules/ask-chart/assistant-response-engine.ts`
- `src/modules/ai/prompt-registry.ts`
- `src/lib/astrology/accuracy/prompt-builder.ts`

## Daily Prediction Behavior Added
- Daily-focused Ask My Chart questions now carry a daily Panchang snapshot when the question is about today, tomorrow, daily focus, lucky timing, or similar daily timing language.
- The assistant prompt mapping now includes a dedicated `daily_prediction_context` block that combines chart identity, current dasha, transit influence, Panchang rhythm, and optional sign-level daily indicators.
- The shared prompt instructions now explicitly distinguish personalized daily prediction from public Rashifal so the answer stays chart-aware instead of generic horoscope language.

## Daily Astrology Context Used
- Saved Kundli identity through the existing chart context.
- Lagna / Ascendant.
- Moon sign and Sun sign when available.
- Current dasha chain and transition timing.
- Transit and timing influence.
- Panchang daily rhythm, including day feel, daily quality, suitable focus, caution areas, sunrise, sunset, and transition windows.

## Dasha / Transit / Panchang Handling
- Dasha remains the background timing layer.
- Transit remains the near-term timing layer.
- Panchang adds the day-level rhythm and supportive/caution windows.
- Daily questions now instruct the model to combine those layers rather than treating the day as a detached horoscope read.

## Lucky Color / Number / Time Handling
- The prompt now allows lucky color, lucky number, and lucky time to be used only when approved daily context is available.
- Those indicators are framed as optional support, not guarantees.
- Public daily Rashifal-style indicators remain distinguishable from personalized chart-based daily guidance.

## Retention-Readiness Notes
- The daily prediction prompt now aligns more closely with the retention dashboard’s existing “Today’s Insight”, “Current Energy”, and return-prompt pattern.
- The retention experience itself was not changed in this phase.

## Safety Rules Preserved
- No guaranteed event prediction.
- No fear-based daily warnings.
- No exact medical, financial, or legal certainty.
- No deterministic relationship, health, or money claims.
- No raw chart/context leakage.
- Missing context still falls back to general guidance and chart generation guidance.

## Premium Gating Preserved
- Free and premium limits were not changed.
- Daily guidance may softly suggest Ask My Chart, a deeper report, or consultation only when that is contextually relevant.
- No aggressive upsell was added.

## Next Recommended Phase
`19.7C - Daily Prediction Answer Formatter`
