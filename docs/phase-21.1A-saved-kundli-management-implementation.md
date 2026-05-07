# Phase 21.1A - Saved Kundli Management

## Files changed
- `src/modules/account/saved-kundli.ts`
- `src/modules/account/components/saved-kundli-manager.tsx`
- `src/app/(app)/dashboard/kundli/page.tsx`
- `src/app/(app)/dashboard/kundli/new/page.tsx`
- `src/app/(app)/dashboard/kundli/[id]/page.tsx`
- `src/app/(app)/dashboard/kundli/loading.tsx`
- `src/app/(app)/dashboard/kundli/error.tsx`
- `src/modules/account/components/dashboard-personal-hub.tsx`

## Model / service changes
- Added a Saved Kundli data contract with owner-scoped records, safe summaries, default/active flags, and editable birth detail fields.
- Added pure helper functions for list, create, update, delete, and set-active operations.
- Added an ownership helper to keep access checks explicit in the data layer.

## Routes / pages / components added
- Protected saved-Kundli management surface:
  - `/dashboard/kundli`
  - `/dashboard/kundli/new`
  - `/dashboard/kundli/[id]`
- Added loading and error states for the saved-Kundli route group.
- Added a client-side Saved Kundli manager component using the pure white professional dashboard style.

## Ownership / security behavior
- Records are treated as owner-scoped.
- Safe summaries are shown in list cards.
- Raw chart JSON is not exposed in the UI.
- Default/active state is separate from raw birth data.
- Error messages stay generic.

## Dashboard connection
- The dashboard hub now points the Active Kundli and quick-action flows to the saved-Kundli management routes.
- The dashboard empty-state path now routes users toward the management surface.

## Active / default Kundli behavior
- The manager supports setting one record as active/default.
- The active record is highlighted in the list and repeated in the active summary block.
- If no record exists, the empty state points users to create their first Kundli.

## Empty / loading / error states
- Empty state: no saved Kundli yet
- Loading state: route-level skeleton
- Error state: safe generic recovery screen
- Missing Kundli fallback: clear CTA to generate or add birth details

## AI / report readiness notes
- Saved Kundli summaries are future-ready for Ask NAVAGRAHA AI, reports, daily guidance, and dashboard Dasha summaries.
- This phase does not rewrite AI or report logic.

## Next phase
- 21.1B Saved Kundli QA + Security + Mobile Check

## Validation note
- This workspace snapshot does not include `package.json`, so `npm run typecheck`, `npm run lint`, and `npm run build` cannot be executed in this environment.
