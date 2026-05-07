# Phase 21.2B - Personal Dasha + Today Guidance QA + Production Safety

## Files checked
- `src/modules/account/dashboard-hub.ts`
- `src/modules/account/components/dashboard-personal-hub.tsx`
- `src/app/(app)/dashboard/page.tsx`
- `src/modules/account/components/saved-kundli-manager.tsx`
- `src/app/(app)/dashboard/kundli/page.tsx`
- `src/app/(app)/dashboard/kundli/new/page.tsx`
- `src/app/(app)/dashboard/kundli/[id]/page.tsx`

## Active Kundli ownership status
- The dashboard data contract remains owner-aware through explicit ownership helpers.
- The dashboard uses the current safe active-Kundli summary model.
- No other user&apos;s chart data is rendered in the dashboard cards.
- In this stripped snapshot, a real auth/session-backed persistence layer is not present for runtime verification.

## Dasha card QA status
- Mahadasha, Antardasha, Pratyantar, and timing tone are represented in the contract and dashboard card.
- Missing Dasha data falls back safely.
- No raw calculation dump is shown.
- No guaranteed or fear-based prediction wording was introduced.

## Today Guidance QA status
- Today&apos;s guidance card uses safe focus areas for work/study/business, relationship/family, money/decision caution, and wellness/energy.
- The card falls back safely when personal context is missing.
- The CTA routes safely through the chart-aware fallback path.
- No deterministic daily claim is fabricated.

## Panchang card QA status
- The Panchang snapshot card shows date/day, tithi, nakshatra, yoga, karana, and planning windows when available.
- Planning windows are framed as timing awareness, not danger/fear.
- Missing Panchang data falls back safely.
- CTA remains soft and clear.

## Daily Remedy QA status
- The daily remedy card uses optional spiritual support suggestions only.
- Wording remains non-coercive and non-guaranteed.
- No medical, financial, or legal cure claim is present.

## Dashboard data contract status
- The contract now returns:
  - `dashaSummary`
  - `todayGuidanceSummary`
  - `panchangSnapshot`
  - `dailyRemedySummary`
  - readiness flags
- Safe empty/null values are used when source context is unavailable.
- No raw chart JSON or internal context is exposed by the dashboard layer.

## Privacy / logging status
- Sensitive birth details are not shown unnecessarily.
- Sensitive chart/birth data is not logged by the dashboard surface.
- Errors remain generic and safe for users.

## Mobile UI status
- The dashboard remains a pure white professional UI.
- The new cards stack cleanly on mobile widths.
- Buttons are tap-friendly and text wraps safely.
- No horizontal overflow is introduced by the new card layout.

## Regression status
- The main dashboard page still renders the personal hub.
- Saved Kundli management remains connected.
- Reports summary, Ask NAVAGRAHA AI readiness, and consultation cards remain intact.
- No AI/report/payment/auth logic was rewritten in this phase.

## Fixes made
- Added richer dashboard contract fields for Dasha, guidance, Panchang snapshot, and daily remedy content.
- Added new dashboard cards for each of those sources.
- Added safer fallback-path handling so AI and guidance CTAs do not expose an early route when chart context is missing.

## Validation note
- This workspace snapshot does not include `package.json`, so `npm run typecheck`, `npm run lint`, and `npm run build` cannot be executed here.

## Next phase
- 21.3 Saved Reports + Unlock History
