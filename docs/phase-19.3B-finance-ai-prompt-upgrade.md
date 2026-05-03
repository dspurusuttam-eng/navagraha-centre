# Phase 19.3B - Finance / Wealth AI Prompt Upgrade

## Files changed
- `src/modules/ask-chart/service.ts`
- `src/modules/ask-chart/assistant-response-engine.ts`
- `src/modules/ai/prompt-registry.ts`
- `src/lib/astrology/accuracy/prompt-builder.ts`

## Finance AI behavior added
- Finance questions are now detected separately before career routing in the Ask My Chart service.
- Finance-specific context is now assembled in the Ask My Chart assistant payload.
- Prompt instructions now explicitly tell NAVAGRAHA AI to reason about income, savings, expenses, debt, wealth growth, business profit, investment risk, and financial discipline.
- The assistant prompt now treats finance as a distinct Jyotish area instead of folding it into career framing.

## Finance astrology context used
- Lagna / Ascendant
- 2nd house income, savings, and family resource context
- 11th house gains, income growth, and network support
- 5th house intelligence, speculation, and decision quality
- 8th house sudden gains/losses and uncertainty
- 6th house debt, service, loans, and competition
- 9th house fortune and guidance
- 10th house profession and status
- 12th house expenses and loss patterns
- Jupiter, Venus, Saturn, and Mercury
- Dasha chain
- Transit context
- Yoga / rule signals
- predictive synthesis summary

## Financial safety rules preserved
- No investment advice is provided.
- No profit, income, wealth, lottery, or sudden-gain guarantees are made.
- No specific stocks, crypto, gambling, or risky financial products are recommended.
- No fear-based debt or loss language is introduced.
- Exact-date promises are avoided.
- Incomplete chart context is handled with uncertainty, not fabrication.

## Premium gating preserved
- Free and premium limits remain unchanged.
- Finance guidance stays useful at free tier.
- Finance Report and Consultation CTAs remain soft and contextual, not pushy.

## Next recommended phase: 19.3C Finance AI Answer Formatter
