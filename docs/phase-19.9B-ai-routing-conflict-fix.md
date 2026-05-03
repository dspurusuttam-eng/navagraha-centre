# Phase 19.9B - Final AI Routing + Conflict Fix

## Files Changed
- `src/modules/ask-chart/service.ts`

## Routing Priority Rules
- Emergency / health safety remains the highest-priority override.
- Explicit remedy or spiritual-guidance questions route to the remedy flow.
- Explicit daily / today questions route to the daily-prediction flow.
- Explicit career / job questions route to the career flow.
- Explicit business / startup / partnership questions route to the business flow.
- Explicit finance / income / debt / investment questions route to the finance flow.
- Explicit relationship / marriage questions route to the marriage flow.
- Explicit education / exam / study questions route to the education flow.
- Otherwise the core Jyotish flow remains the fallback.

## Conflicts Fixed
- Remedy detection was broadened so prayer, daan, fasting, spiritual support, and shop/product-related remedy prompts route correctly instead of falling back to generic chart handling.
- Remedy CTA labeling now stays aligned with the stronger remedy classification path.
- Daily prediction, career, business, finance, education, marriage, and health routing remain unchanged in order and scope.

## Safety Rules Preserved
- No raw chart/context leakage.
- No guaranteed outcomes.
- No fear-based prediction.
- No medical diagnosis or treatment claims.
- No investment, legal, or tax certainty.
- No coercive relationship advice.
- No aggressive shop/product selling.

## Gating Status
- Free and premium limits remain unchanged.
- No premium bypass was introduced.
- Remedy guidance remains useful even when deeper personalization is gated.

## Next Phase
- `19.9C - Final AI Regression QA`

## Validation
- `npm run lint` passed
- `npm run build` passed
- `npm run typecheck` passed after build regenerated route types
