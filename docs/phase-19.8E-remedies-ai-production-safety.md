# Phase 19.8E - Remedies / Spiritual Guidance AI Production Safety Check

## Integration Status
- Remedies are routed through the live Ask My Chart flow.
- Remedy questions use approved remedy records and the dedicated remedy formatter branch.
- The remedy branch is isolated from the career, marriage, finance, health, education, business, and daily-prediction formatter branches.

## Formatter Routing Status
- Remedy formatting applies to remedy, mantra, prayer, puja, daan, fasting, graha remedy, daily remedy, gemstone, rudraksha, yantra, shop/product guidance, and spiritual-support questions.
- Career, marriage, finance, health, education, business, daily prediction, and general Jyotish formatters remain unchanged.

## Context Usage Status
- Remedy answers can use chart context, graha signals, house context, dasha, transit, Panchang, and relevant module context when available.
- The formatter keeps remedial guidance grounded in approved remedy records and timing cues rather than inventing new ritual claims.

## Missing-Context Fallback
- If chart context is missing, the answer stays general.
- The user is told to generate or refresh Kundli for personalized remedy guidance.
- No fabricated certainty is introduced.

## Remedy Safety Status
- Remedies are optional, calm, and non-fear-based.
- No "must do or bad result will happen" wording is allowed.
- No guaranteed marriage, wealth, job, health, or exam outcomes are claimed.
- No medical, financial, or legal cure claims are introduced.

## Gemstone / Rudraksha / Yantra Safety
- Gemstone, rudraksha, and yantra guidance stays cautious and consultative.
- Expert suitability review is recommended before use.
- No guaranteed result wording is used.
- No aggressive purchase pressure is introduced.

## Shop / Consultation Ethics
- Shop references appear only when a product is genuinely relevant.
- Consultation references stay soft and optional.
- The formatter avoids "buy this to fix your problem" wording.
- No fear-based selling is introduced.

## Premium Gating Status
- Free and premium limits remain unchanged.
- No premium bypass is introduced.
- Remedy replies remain useful even when deeper personalization is gated.

## Privacy / Logging Notes
- No sensitive birth details are logged unnecessarily by this phase.
- No raw chart JSON or internal context is exposed to the user.
- Error handling stays user-safe and does not leak internals.

## Manual Live QA Checklist
1. Seed a local QA user with `npm run qa:seed:user`.
2. Test each remedy category in Ask My Chart with chart context present.
3. Repeat the same prompts without birth details to confirm general fallback behavior.
4. Verify the response uses the remedy formatter sections and does not fall back to daily/finance/business wording.
5. Confirm gemstone and shop wording stays optional and consultative.
6. Check that fear-based and guaranteed-result wording never appears.

Helpful context scripts:
- `npm run debug:predictive-assistant-context`
- `npm run debug:predictive-synthesis`
- `npm run debug:predictive-report-context`
- `npm run debug:transit`
- `npm run debug:panchang`
- `npm run test:smoke`
- `npm run test:smoke:critical`
- `npm run test:smoke:launch`

## Known Non-Blocking Follow-Ups
- The remedy formatter intentionally remains simple and safe; if future product-specific remedy SKUs expand, the CTA copy may need one more review.
- No additional runtime issue was found in this safety phase.

## Next Recommended Phase
- `19.9 - Final AI Integration + Production QA`
