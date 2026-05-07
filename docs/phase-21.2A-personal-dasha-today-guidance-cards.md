# Phase 21.2A - Personal Dasha + Today Guidance Cards

## Files changed
- `src/modules/account/dashboard-hub.ts`
- `src/modules/account/components/dashboard-personal-hub.tsx`

## Dasha card implementation
- The dashboard contract now carries a richer Dasha summary with Mahadasha, Antardasha, Pratyantar, and a short timing tone.
- The dashboard card renders safe fallbacks when Dasha data is unavailable.
- No raw calculation dump is exposed.

## Today guidance card implementation
- The guidance card now shows safe daily focus lines for work/study/business, relationship/family, money/decision caution, and wellness/energy balance.
- The card uses fallback-safe copy when active chart context is missing.
- The primary CTA routes to Ask Today&apos;s Guidance when chart context is available and to Kundli generation when it is not.

## Panchang snapshot card implementation
- Added a Panchang snapshot card with date/day, tithi, nakshatra, yoga, karana, and planning windows such as Rahu Kaal, Gulika, Yamaganda, and Abhijit.
- Planning windows are presented as timing awareness, not fear-based warnings.
- The card falls back safely when no Panchang source is available.

## Daily remedy card implementation
- Added a daily remedy / spiritual support card with optional gentle practices.
- Remedies remain optional and non-guaranteed.
- No medical, financial, or legal cure claims are introduced.

## Dashboard data contract updates
- Added `panchangSnapshot`, `dailyRemedy`, and `readiness` to the dashboard contract.
- Expanded Dasha and guidance summaries to include the fields required by the new cards.
- Added readiness flags:
  - `hasActiveKundli`
  - `canAskMyChart`
  - `canViewPanchang`
  - `canGenerateReport`

## Security / privacy behavior
- All rendered data remains summary-level and user-owned.
- No raw chart JSON or internal context is exposed in the dashboard cards.
- Missing chart context falls back safely without fabricating timing or Panchang details.
- Sensitive birth detail exposure remains limited to necessary summaries only.

## Fallback states
- No active Kundli
- Dasha unavailable
- Panchang unavailable
- Daily guidance unavailable
- Daily remedy unavailable
- Safe loading and error handling remain in place

## Validation note
- This workspace snapshot does not include `package.json`, so `npm run typecheck`, `npm run lint`, and `npm run build` cannot be executed here.

## Next phase
- 21.2B Personal Dasha + Today Guidance QA
