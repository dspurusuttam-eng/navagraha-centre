# Phase 19.2E - Advanced Marriage / Relationship AI Production Safety Check

## Scope and guardrails followed
- Production integration and safety verification for marriage / relationship AI only.
- No astrology calculation changes.
- No UI, route, auth, payment, SEO, tool, report, pricing, or database changes.
- Career AI behavior from 19.1 remains unchanged.
- Free / premium gating remains unchanged.

## 1) Integration status
- Marriage / relationship detection is wired into the Ask My Chart production flow.
- Relationship prompts are classified in `src/modules/ask-chart/service.ts`.
- Relationship context is assembled in `src/modules/ask-chart/assistant-response-engine.ts`.
- Relationship answers are formatted in `src/modules/ask-chart/jyotish-answer-formatter.ts`.
- Relationship prompt guidance is reinforced in:
  - `src/modules/ai/prompt-registry.ts`
  - `src/lib/astrology/accuracy/prompt-builder.ts`

## 2) Formatter routing status
- Relationship formatter applies only to relationship / marriage / compatibility / remarriage / breakup / divorce / remedy questions.
- Career formatter still applies to career-related questions.
- General Jyotish formatter still applies to non-career, non-relationship questions.
- Mixed questions such as business-with-partner should continue to resolve through career/business reasoning rather than forcing marriage formatting.

## 3) Context usage status
Relationship answers can safely use available:
- Lagna / Ascendant
- Moon sign
- Venus
- Jupiter
- 7th house
- 2nd house
- 4th house
- 5th house
- 8th house
- 11th house
- Dasha chain
- Transit context
- Yoga / rule signals
- predictive synthesis summary
- compatibility / chart-match context when available

## 4) Missing context fallback behavior
- If chart context is missing or weak, the answer is framed as directional rather than fixed.
- The user is softly guided to generate or refresh Kundli context.
- Compatibility / Consultation next steps stay soft and contextual.
- The formatter does not invent relationship certainty from missing data.

## 5) Safety status
- No guaranteed marriage date.
- No guaranteed marriage with a specific person.
- No certain breakup / divorce prediction.
- No caste / religion / community / gender-shaming / partner-shaming language.
- No coercive relationship advice.
- No fear-based remedy wording.
- No raw chart JSON or internal context exposure.

## 6) Abuse / distress handling behavior
- Abuse, coercion, violence, or unsafe-relationship language is handled with supportive and calm framing.
- The response should recommend trusted human, local, or professional support.
- Astrology must never be used to justify harm, coercion, or staying in danger.
- Hopelessness / distress language should be answered with grounding, non-fatalistic support.

## 7) Remedy safety behavior
- Marriage remedies remain optional.
- Remedies are framed as gentle spiritual support, not a required fix.
- No “must do or the relationship will fail” framing.
- Optional supports can include prayer, mantra, devotional discipline, or calm communication ritual.

## 8) Premium gating status
- No premium bypass was introduced.
- Compatibility Report and Consultation CTAs remain soft and relevant only.
- Free responses remain useful even when deeper continuity is gated.

## 9) Privacy / logging notes
- No new logging of sensitive birth details was introduced in this phase.
- Existing Ask My Chart flow still validates input and logs only operational accuracy metadata.
- Internal chart structures are kept in server-side context and are not exposed directly to the user.
- Error handling should remain on the safe, user-facing layer without leaking internals.

## 10) Manual live QA checklist
Run the marriage QA set from `docs/phase-19.2D-marriage-ai-advanced-qa.md` in `/dashboard/ask-my-chart` and confirm:
- relationship-specific answers use the marriage formatter
- career questions still use the career formatter
- general questions still use the core Jyotish formatter
- missing chart context does not fabricate certainty
- abuse / distress responses are supportive and non-fatalistic
- remedies stay optional
- soft CTAs remain soft
- no raw internal context leaks

## 11) Known non-blocking follow-ups
- Run a live provider QA pass with real model credentials and save sample outputs for the marriage test set.
- If desired later, add dedicated telemetry for formatter selection counts without exposing user birth data.
- Review whether any future relationship report module should surface the same safety wording for consistency.

## 12) Next recommended AI module
- **Phase 19.3 - Finance AI Module**
  - begin finance-specific prompt/context audit after marriage production safety is confirmed.

