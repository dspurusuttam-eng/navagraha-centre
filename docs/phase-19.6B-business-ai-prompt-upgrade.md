# Phase 19.6B - Business / Entrepreneurship AI Prompt Upgrade

## Files Changed
- `src/modules/ask-chart/service.ts`
- `src/modules/ask-chart/assistant-response-engine.ts`
- `src/modules/ai/prompt-registry.ts`
- `src/lib/astrology/accuracy/prompt-builder.ts`
- `docs/phase-19.6B-business-ai-prompt-upgrade.md`

## Business AI Behavior Added
- Business and entrepreneurship questions now have a dedicated routing path instead of collapsing into generic career-only handling.
- The Ask My Chart context now carries a dedicated `business_context` block with relevant houses, timing, and business question intents.
- Business reasoning now explicitly covers business suitability, job vs business, side business, startup timing, partnership, client growth, trade, expansion, foreign business, family business, and risk-aware pacing.
- The shared prompt templates and boundary prompts now instruct NAVAGRAHA AI to use business-specific Jyotish reasoning before generic business advice.

## Business Astrology Context Used
- Lagna / Ascendant
- 7th house for partnership, public dealing, and client-facing business
- 10th house for profession, status, leadership, and business karma
- 11th house for gains, networks, and client growth
- 2nd house for capital, resources, speech, and family support
- 3rd house for sales, communication, initiative, and courage
- 5th house for strategy, creativity, and speculation
- 6th house for competition, debt, service, and pressure
- 8th house for risk, sudden loss/gain, and transformation
- 9th house for guidance, ethics, and mentor support
- 12th house for expenses, loss, and foreign links
- Mercury, Saturn, Mars, Jupiter, and Venus
- Dasha chain, transit context, yoga/rule signals, and predictive synthesis summary

## Safety Rules Preserved
- No guaranteed profit, funding, clients, expansion, or success claims.
- No investment, loan, tax, or legal certainty claims.
- No specific investment or gambling recommendations.
- No fear-based loss or debt language.
- No exact-date promises.
- No raw chart JSON or internal context leaks.
- No bypass of premium gating.

## Premium Gating Preserved
- Free and premium behavior remain unchanged.
- Soft report or consultation suggestions stay contextual only.
- No upsell pressure was introduced.

## Next Recommended Phase
- `19.6C` - Business AI Answer Formatter
