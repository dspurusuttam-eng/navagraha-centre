# Phase 30.1B - Consent-Safe Analytics Activation Layer

## Files changed
- `src/lib/consent/consent-preferences.ts`
- `src/lib/consent/consent-client.ts`
- `src/lib/consent/consent-server.ts`
- `src/lib/consent/index.ts`
- `src/components/monetization/AdSenseScript.tsx`

## Consent model status
- Implemented as a versioned consent snapshot with safe defaults:
  - `necessary: true`
  - `analytics: false`
  - `advertising: false`
  - `personalization: false`
- Missing or invalid stored values fall back to the safe default object.
- Old or unsupported versioned consent values normalize back to the current v1 model.

## Storage behavior
- Consent is stored in a non-sensitive first-party cookie only.
- No DOB, birth time, birth place, chart JSON, AI prompts, report content, payment data, tokens, or secrets are stored in consent state.
- The client helpers can read, write, and reset the preference object safely.
- The server helper can read the same consent snapshot from the request cookie, which allows future provider gating without exposing private data.

## Helper functions
- `hasAnalyticsConsent()`
- `hasAdvertisingConsent()`
- `hasPersonalizationConsent()`
- `canLoadExternalAnalytics()`
- `canLoadAds()`
- `canPersonalizeExperience()`
- `getConsentPreferences()`
- `setConsentPreferences()`
- `resetConsentPreferences()`

## Analytics/ad/personalization gating
- First-party privacy-safe analytics continues unchanged.
- External analytics providers are not injected in this phase.
- AdSense rendering is now additionally gated behind advertising consent on the server side.
- Future GA/GTM loading should be gated behind analytics consent.
- Future personalization should be gated behind personalization consent.

## UI readiness
- No consent banner or consent preferences UI was added in this phase.
- That is intentional to avoid introducing an incomplete or premature consent surface.
- A lightweight consent UI shell can be added in Phase 30.1C if product/legal review approves it.

## Third-party activation status
- Google Analytics: not activated
- Google Tag Manager: not activated
- Meta Pixel: not activated
- AdSense: still disabled unless both monetization config and advertising consent are present

## Privacy safety
- Consent storage is limited to preference state only.
- No private astrology payloads or user content are written into consent state.
- Invalid consent data cannot crash the app and cannot force third-party activation.
- Private pages/events are not sent to external providers by this phase.

## Known gaps
- No consent modal/banner exists yet.
- No external analytics provider loader has been turned on.
- No full user-facing consent management screen is exposed yet.

## Next phase
- `30.1C` Consent / Analytics QA + Production Readiness
- If approved, add a small consent preferences UI surface and final end-to-end QA for provider gating.
