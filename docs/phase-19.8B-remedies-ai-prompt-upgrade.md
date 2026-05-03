# Phase 19.8B - Remedies / Spiritual Guidance AI Prompt Upgrade

## Files changed
- `D:\PDS BDS\navagraha-centre\src\lib\astrology\accuracy\remedy-safety.ts`
- `D:\PDS BDS\navagraha-centre\src\lib\astrology\accuracy\prompt-builder.ts`
- `D:\PDS BDS\navagraha-centre\src\modules\ask-chart\assistant-response-engine.ts`
- `D:\PDS BDS\navagraha-centre\src\modules\ai\prompt-registry.ts`
- `D:\PDS BDS\navagraha-centre\src\modules\ai\prompts.ts`

## Remedy behavior added
- Remedy questions now carry explicit remedy context into the prompt payload, including approved remedy records, consultation-preparation context, and related product context when available.
- The Ask My Chart copilot prompt now distinguishes remedy types more clearly:
  - mantra / prayer
  - charity / daan
  - fasting / discipline
  - puja / ritual guidance
  - daily spiritual practice
  - graha-related observance
  - gemstone / rudraksha / yantra guidance
  - lifestyle correction
  - consultation / shop-related guidance
- The prompt now tells the model to ground remedy answers in approved records and chart/timing context rather than free-form advice.
- Consultation-brief prompts were updated so remedy-preparation notes are treated as review material, not purchase instructions.

## Safety rules preserved
- Remedies remain optional.
- No guaranteed result language is allowed for marriage, wealth, health, career, exams, or business.
- No fear-based language is introduced.
- No medical, financial, legal, or business cure claims are allowed.
- The system continues to avoid “must do this or bad result will happen” framing.
- Shop and consultation paths stay soft and optional.

## Gemstone / Rudraksha / Yantra ethics
- Gemstones, rudraksha, and yantra are now explicitly described in prompt text as consultative and optional.
- Expert consultation is recommended before use.
- Purchase pressure is explicitly discouraged.
- The report prompt now says these observances should be taken up only after suitability review or direct consultation.

## Premium gating notes
- Free / premium gating was not changed.
- Consultation or shop references remain soft and context-driven.
- The prompt now avoids implying that premium access guarantees better outcomes or mandatory purchases.

## Next phase
- `19.8C - Remedies Answer Formatter`

## Validation
- `npm run lint` passed
- `npm run typecheck` passed
- `npm run build` passed

## Summary
- The remedy layer is now more explicit, chart-grounded, and ethically constrained in the prompt/context layer.
- No astrology calculations, routes, UI, payments, pricing, or database behavior were changed.
