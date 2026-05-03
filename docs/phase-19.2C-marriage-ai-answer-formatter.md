# Phase 19.2C - Advanced Marriage / Relationship AI Answer Formatter

## Scope and guardrails followed
- Marriage / relationship / compatibility answer formatting only.
- No astrology calculation changes.
- No UI, route, auth, payment, SEO, tools, report, database, or pricing changes.
- Career AI behavior from 19.1 was not altered.
- Existing AI safety and free/premium gating were preserved.

## 1) Files changed
- `src/modules/ask-chart/jyotish-answer-formatter.ts`

## 2) Final marriage answer structure
When the user asks a relationship question, the formatter now shapes the answer as:
1. Direct Relationship Summary
2. Marriage / Partnership Tendency
3. Timing Insight
4. Compatibility & Harmony Factors
5. Caution Areas
6. Practical Relationship Guidance
7. Optional Remedy / Spiritual Support, only when relevant
8. Soft Next Step
9. Caution / Safety Note
10. Confidence and disclaimer lines

## 3) When the marriage formatter applies
Applied only when the question is about:
- marriage timing
- relationship stability
- compatibility
- partner nature
- marriage delay
- love marriage / arranged marriage
- family involvement
- emotional harmony
- conflict / caution
- breakup / divorce fear
- remarriage / second marriage
- spouse / partner tendencies
- relationship remedies

It does not apply to general Jyotish, career, finance, or health questions.

## 4) Safety behavior
- No guaranteed marriage date language.
- No deterministic breakup / divorce claims.
- No fear-based relationship framing.
- No coercive, caste-based, religion-based, or discriminatory advice.
- Unsafe / abusive situations are redirected toward trusted human, local, or professional support.
- Remedies remain optional and non-fear-based.
- Raw chart JSON / internal data is not exposed.

## 5) Missing-chart behavior
- If chart or timing context is limited, the formatter says the answer is directional rather than fixed.
- It softly recommends generating or refreshing Kundli context for stronger relationship reading.
- It does not pretend to have certainty when context is weak.

## 6) Premium behavior
- Free / premium limits remain unchanged.
- Soft next steps may point to Compatibility, Compatibility Report, or Consultation only when relevant.
- No gating bypass was introduced.

## 7) Next recommended phase
- **Phase 19.2D - Marriage AI QA Testing**
  - verify relationship answers are emotionally safe, Jyotish-grounded, concise when needed, and free of guarantee language.

