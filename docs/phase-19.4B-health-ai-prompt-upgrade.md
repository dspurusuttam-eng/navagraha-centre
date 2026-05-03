# Phase 19.4B - Health / Wellness AI Prompt Upgrade

## Files Changed

- [src/modules/ask-chart/service.ts](../src/modules/ask-chart/service.ts)
- [src/modules/ask-chart/assistant-response-engine.ts](../src/modules/ask-chart/assistant-response-engine.ts)
- [src/modules/ai/prompt-registry.ts](../src/modules/ai/prompt-registry.ts)
- [src/lib/astrology/accuracy/prompt-builder.ts](../src/lib/astrology/accuracy/prompt-builder.ts)

## Health / Wellness Behavior Added

- Health and wellness questions now route with an explicit health guidance branch instead of relying on only generic chart reasoning.
- The Ask My Chart prompt payload now carries a dedicated `health_context` block with health-relevant houses, planet context, timing context, and question intent.
- Health question detection now covers wellness, stress, sleep, energy, vitality, routine, fatigue, burnout, anxiety, emotional balance, and mental health phrasing.
- The copilot prompt now instructs the model to answer in wellness mode only: routine, sleep, stress, energy, vitality, emotional balance, and caution periods.

## Wellness Astrology Context Used

- Lagna / Ascendant
- 1st house vitality context
- 6th house routine, illness pressure, and health caution context
- 8th house vulnerability and chronic-pressure context
- 12th house sleep, isolation, recovery, and rest context
- Moon for emotional balance
- Sun for vitality
- Mars for energy and inflammation themes
- Saturn for chronic pressure and discipline
- Mercury for nervous activity and mental load
- Jupiter for recovery and support
- Venus for comfort and lifestyle balance
- Dasha chain
- Transit context
- Yoga / rule signals
- predictive synthesis summary

## Medical Safety Rules Preserved

- No diagnosis behavior was added.
- No treatment, medicine, or cure advice was added.
- No instruction to stop medicine was added.
- No astrology-based emergency or hospitalization prediction was added.
- Health answers remain spiritual and lifestyle-oriented, with professional care recommended when symptoms are present.

## Emergency / Mental-Health Safety

- Health prompts now explicitly instruct the model to escalate to qualified healthcare or emergency support when symptoms, urgent warning signs, self-harm, abuse, or immediate danger are mentioned.
- The response should remain supportive and non-fatalistic.
- Health questions must not be framed as destiny or as a reason to avoid urgent human help.

## Premium Gating Preserved

- Free / premium limits were not changed.
- Health Report and Consultation guidance remains soft and contextual only.
- No claim was introduced that premium output can diagnose or cure illness.

## What This Phase Did Not Change

- Astrology calculations
- Routes
- UI
- Auth
- Payments
- SEO
- Tools
- Reports
- Database
- Pricing
- Career, marriage, and finance AI behavior
- Health formatter structure, which is reserved for Phase 19.4C

## Validation

- `npm run typecheck` passed
- `npm run lint` passed
- `npm run build` passed

## Next Recommended Phase

- Phase 19.4C - Health AI Answer Formatter

