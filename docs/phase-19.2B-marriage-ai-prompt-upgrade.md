# Phase 19.2B - Marriage / Relationship AI Prompt Upgrade

## Scope and guardrails followed
- Marriage / relationship prompt/context upgrade only.
- No astrology calculation changes.
- No UI, route, auth, payment, SEO, tools, report, database, or pricing changes.
- Existing free/premium gating and AI safety layers preserved.

## 1) Files changed
- `src/modules/ask-chart/service.ts`
- `src/modules/ask-chart/assistant-response-engine.ts`
- `src/modules/ai/prompt-registry.ts`
- `src/lib/astrology/accuracy/prompt-builder.ts`

## 2) Marriage / relationship AI behavior added

1. Relationship intent classification was added for questions involving:
- marriage timing
- relationship stability
- compatibility
- partner nature
- marriage delay
- family involvement
- emotional harmony
- conflict / caution
- breakup / divorce fear
- love vs arranged marriage
- second marriage / remarriage
- consultation / report follow-up

2. Prompt context now includes a relationship-specific block with:
- focus houses for relationship reading
- Venus and Jupiter placement context
- relationship timing support from dasha / transit synthesis
- relationship question intent tags

3. Ask My Chart question classification now gives relationship prompts a dedicated grounded scope:
- marriage / compatibility questions are guided toward relationship-specific Jyotish reasoning instead of generic relationship advice.

4. Relationship matching context was improved:
- when no specific body or house is mentioned, relationship questions now prefer Venus / Jupiter / Moon placements and the 7th / 2nd / 4th / 5th / 8th / 11th house pattern.

5. Core Jyotish prompt instructions were expanded:
- relationship reasoning is now explicitly tied to partnership, emotional, family, romance, and timing layers.
- deterministic partner / breakup / marriage guarantees remain disallowed.

6. Shared prediction prompt boundary was updated:
- NAVAGRAHA AI chat mode now explicitly distinguishes relationship timing, compatibility, emotional harmony, family involvement, and caution using the correct Jyotish house set when available.

7. Prompt registry instructions were expanded:
- the Ask My Chart copilot now has relationship-specific instructions in both system and user prompt text.

## 3) Relationship astrology context used
- Lagna / Ascendant
- Moon sign and emotional stability context
- Venus context for love, attraction, and harmony
- Jupiter context for wisdom, marriage support, and guidance
- 7th house partnership / marriage context
- 2nd house family / support context
- 4th house home / emotional comfort context
- 5th house romance / affection context
- 8th house intimacy / transformation / sensitivity context
- 11th house social support / gains context
- Planetary positions
- Dasha chain
- Transit context
- Yoga / rule signals
- Predictive synthesis summary
- Compatibility / signal context where available through chart matching
- User question

## 4) Safety rules preserved
- No guaranteed marriage date language added.
- No deterministic "you will marry this person" claims added.
- No certain breakup / divorce prediction language added.
- No fear-based partner judgment added.
- No caste / religion / community discriminatory advice added.
- No coercive relationship advice added.
- No harmful advice for unsafe or abusive situations.
- Optional remedies remain optional and non-fear-based.
- Existing prediction policy, remedy safety, and raw-context leak protection remain in place.

## 5) Premium gating preserved
- Ask My Chart usage limits remain unchanged.
- Free / premium behavior remains unchanged.
- Compatibility Report or Consultation suggestions stay soft and contextual.
- No gating bypass path was introduced.

## 6) What was intentionally not changed
- Astrology engine and chart math
- UI rendering and page structure
- Route structure
- Career AI behavior from 19.1
- Report generation flow
- Billing / pricing logic

## 7) Next recommended phase
- **Phase 19.2C - Marriage AI Answer Formatter**
  - add a marriage / relationship-specific answer formatter while keeping the 19.0C conversation structure stable for other topics.

