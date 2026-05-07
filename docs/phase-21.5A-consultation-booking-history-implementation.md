# Phase 21.5A - Consultation + Booking History Implementation

## Files changed
- `src/modules/consultations/service.ts`
- `src/modules/account/dashboard-ecosystem.ts`
- `src/modules/account/dashboard-hub.ts`
- `src/modules/account/components/dashboard-personal-hub.tsx`
- `src/modules/consultations/components/consultation-dashboard-list.tsx`
- `src/app/(app)/dashboard/consultations/loading.tsx`
- `src/app/(app)/dashboard/consultations/error.tsx`
- `src/app/(app)/dashboard/consultations/[consultationId]/loading.tsx`
- `src/app/(app)/dashboard/consultations/[consultationId]/error.tsx`

## Consultation data source status
- Reused the existing protected consultation storage and service layer.
- Dashboard history is sourced from `getUserConsultations(userId)` and stays owner-scoped.
- Safe history fields now include:
  - consultation id
  - confirmation code
  - consultation type / service label
  - related Kundli id / label
  - astrologer name
  - scheduled time
  - status
  - created / updated timestamps
  - safe topic / intake summary
- No admin-only notes or another user&apos;s booking data are surfaced.

## Dashboard consultation card upgrade
- Upgraded the consultation card on the personal hub to show:
  - consultation summary
  - upcoming consultation status
  - latest booking status badge
  - total / upcoming / past counts
  - recent consultation snippets
  - related Kundli labels when available
- CTAs remain soft:
  - Book Consultation
  - View Consultation History
  - View Details
- The card keeps the pure white professional dashboard style.

## Consultation history route/page status
- The protected history route exists at `/dashboard/consultations`.
- The protected detail route exists at `/dashboard/consultations/[consultationId]`.
- Loading and error states were added for both the history route and the detail route.
- The list page continues to show only user-owned consultation records.

## Ownership / security behavior
- Consultation data is queried with the current authenticated user id.
- Another user&apos;s consultation cannot be loaded through the dashboard service layer.
- Direct route access remains protected by `requireUserSession()`.
- Safe 401/403/404-style handling remains in the protected route flow.

## Privacy / internal-note protection
- Internal notes are not exposed in the dashboard summary/history layers.
- Only safe booking summaries, labels, and timing metadata are shown.
- No raw chart JSON or internal admin state is surfaced.

## Empty / loading / error states
- Empty consultation state is handled in the list component.
- Loading states were added for the history and detail routes.
- Error states were added for the history and detail routes.
- Safe fallback messaging is used when consultation history is unavailable.

## Mobile UI notes
- The consultation surfaces use the existing pure white dashboard system.
- Cards, badges, and action buttons remain mobile-safe.
- The history list and dashboard card are responsive and keep summaries compact.

## Validation
- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run build` passed after clearing the generated `.next` artifact tree and rerunning the build with elevated permissions to bypass the Windows spawn restriction.

## Next phase
- 21.5B Consultation History QA + Security + Production Safety
