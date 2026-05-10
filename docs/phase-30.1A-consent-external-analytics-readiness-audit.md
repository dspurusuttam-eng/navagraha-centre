# Phase 30.1A - Consent + External Analytics Readiness Audit

## Files Inspected
- `src/app/layout.tsx`
- `src/config/env.ts`
- `src/lib/monetization/monetization-config.ts`
- `src/components/monetization/AdSenseScript.tsx`
- `src/lib/analytics/types.ts`
- `src/lib/analytics/event-store.ts`
- `src/app/api/analytics/event/route.ts`
- `src/app/api/analytics/summary/route.ts`
- `src/modules/localization/request.ts`
- `src/proxy.ts`
- `src/app/(marketing)/privacy/page.tsx`
- `src/app/(marketing)/terms/page.tsx`
- `src/app/(marketing)/consultation/page.tsx`
- `src/app/(marketing)/reports/page.tsx`

## Consent Readiness Status
- No dedicated consent or cookie banner exists yet.
- Locale persistence uses a language cookie, but that is not a consent mechanism.
- First-party analytics remains privacy-safe and does not require a third-party consent banner in its current form.
- Any future third-party provider must be gated behind an explicit consent layer.

## External Analytics Readiness
- Google Analytics / GTM / Meta Pixel are not activated.
- Vercel Analytics is not activated.
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` exists in environment config, but there is no provider injection path wired for production use.
- AdSense script loading is present in `src/app/layout.tsx`, but monetization remains controlled by the current environment flags and does not constitute a consent flow.

## Consent Category Architecture
Recommended categories for a future consent manager:
- necessary
- analytics
- advertising
- personalization

Rules for the future layer:
- necessary allowed by default
- analytics and advertising disabled until explicit consent
- preference can be changed later
- third-party providers must not run on private pages unless explicitly approved and policy-covered

## Privacy Policy Alignment
Current policy pages are partial but useful:
- Privacy page explains account, birth-profile, and payment-adjacent data handling.
- Terms page explains service scope, account responsibility, and access boundaries.

Gaps to close later:
- explicit cookie usage disclosure
- explicit analytics disclosure
- explicit advertising partner disclosure
- user choice / consent change explanation
- clearer support/contact path for data and consent requests

## Consent-Safe Event Architecture
- First-party analytics can remain active and privacy-safe.
- Third-party analytics should only fire after analytics consent.
- AdSense personalization should only follow appropriate advertising consent.
- Private pages, raw Kundli data, AI prompt/response content, consultation notes, and payment secrets must never be sent to third-party providers.

## Safe Activation Plan
1. Keep first-party analytics as the default instrumentation layer.
2. Add a dedicated consent state store before any third-party script injection.
3. Gate external analytics and advertising providers behind consent checks.
4. Restrict provider firing to public pages and approved event scopes.
5. Keep a change log of consent decisions for product/legal review.

## Exact Files to Modify in 30.1B
- `src/app/layout.tsx`
- `src/lib/monetization/monetization-config.ts`
- `src/components/monetization/AdSenseScript.tsx`
- `src/lib/analytics/event-store.ts`
- `src/app/api/analytics/event/route.ts`
- `src/app/api/analytics/summary/route.ts`
- `src/lib/consent/*` or equivalent consent-state module if introduced
- `src/components/site/*` only if a consent UI is explicitly approved later

## Known Non-Blocking Gaps
- No consent banner or consent manager yet.
- No third-party analytics provider is configured.
- No advertising consent flow exists yet.
- The current privacy policy does not fully describe cookies, analytics, or advertising partners.

## Final Verdict
Phase 30.1A is complete as an audit and architecture pass.

## Next Phase
Phase 30.1B - Consent-Safe Analytics Activation Layer
