# Phase 21.3A - Saved Reports + Unlock History

## Files changed
- `src/modules/account/dashboard-hub.ts`
- `src/modules/account/components/dashboard-personal-hub.tsx`
- `src/modules/account/components/dashboard-reports-history.tsx`
- `src/modules/account/components/dashboard-report-detail.tsx`
- `src/app/(app)/dashboard/report/page.tsx`
- `src/app/(app)/dashboard/report/loading.tsx`
- `src/app/(app)/dashboard/report/error.tsx`
- `src/app/(app)/dashboard/report/[id]/page.tsx`
- `src/app/(app)/dashboard/report/[id]/loading.tsx`
- `src/app/(app)/dashboard/report/[id]/error.tsx`
- `src/app/(app)/dashboard/reports/page.tsx`
- `src/app/(app)/dashboard/reports/[id]/page.tsx`

## Report summary data source
- The dashboard contract now carries richer report metadata:
  - report id
  - report type
  - related Kundli id
  - report title
  - preview status
  - unlocked / locked access status
  - generated date
  - last viewed date
  - payment state
  - safe CTA targets
- The data is still summary-only and does not expose report body content.
- In this workspace snapshot, a real persisted report store is not present, so the dashboard uses the safe hub contract and empty-state fallbacks.

## Dashboard reports card upgrade
- The dashboard Saved Reports card now shows:
  - total saved reports
  - unlocked report count
  - preview / locked split
  - recent safe report summaries
  - per-report preview / continue actions
- Report metadata is shown without exposing premium report content.

## Reports history page / section status
- Added a protected dashboard reports history surface at:
  - `/dashboard/reports`
  - `/dashboard/reports/[id]`
- Added compatibility aliases at:
  - `/dashboard/report`
  - `/dashboard/report/[id]`
- History cards include type badges, status badges, dates, related Kundli, payment state, and safe actions.

## Ownership / access checks
- The dashboard contract remains user-owned and summary-only.
- No other user&apos;s report content is exposed in the dashboard summary layer.
- Missing or unavailable payment and report state fall back safely.
- This snapshot does not contain the real auth/session/report persistence layer needed for runtime verification.

## Preview / premium behavior
- Preview, locked, and unlocked states remain visible only as metadata.
- No locked premium report body content is rendered in the dashboard.
- Safe actions route to history, preview, or unlock flows without exposing raw report content.

## Empty / loading / error states
- No saved reports yet
- No unlocked reports
- Missing active Kundli
- Report access unavailable
- Payment / unlock state unavailable
- Loading state for report routes
- Safe report history and detail error states

## Mobile UI notes
- The reports surface keeps the pure white dashboard style.
- Cards use light borders, soft shadows, and charcoal typography.
- The layout remains mobile-safe and avoids horizontal overflow in summary renderings.

## Fixes made
- Expanded the dashboard report contract to carry safe metadata and readiness flags.
- Added a dedicated dashboard reports history page.
- Added a safe report detail scaffold that never exposes report body content.
- Added dashboard report CTA refinements and history list badges.

## Validation note
- This workspace snapshot does not include `package.json`, so `npm run typecheck`, `npm run lint`, and `npm run build` cannot be executed here.

## Next phase
- 21.3B Saved Reports + Unlock History QA + Security + Production Safety
