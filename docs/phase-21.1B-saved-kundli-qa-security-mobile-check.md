# Phase 21.1B - Saved Kundli QA + Security + Mobile Check

## Files checked
- `src/modules/account/saved-kundli.ts`
- `src/modules/account/components/saved-kundli-manager.tsx`
- `src/modules/account/components/dashboard-personal-hub.tsx`
- `src/app/(app)/dashboard/page.tsx`
- `src/app/(app)/dashboard/kundli/page.tsx`
- `src/app/(app)/dashboard/kundli/new/page.tsx`
- `src/app/(app)/dashboard/kundli/[id]/page.tsx`
- `src/app/(app)/dashboard/kundli/loading.tsx`
- `src/app/(app)/dashboard/kundli/error.tsx`

## CRUD QA status
- Saved Kundli list, create, edit, delete, and set-active UI flows are present.
- Missing fields are validated before save or update.
- Invalid date or time values are rejected with safe messages.
- Deleted records are removed from the local management state.

## Active / default status
- Active/default state is visible in the list and summary views.
- Active/default selection is normalized to a single record in the local manager state.
- Missing active Kundli falls back safely to the empty state.

## Ownership / security status
- The saved-Kundli contract keeps owner identity explicit.
- Ownership helper functions are present for future server-side access checks.
- The UI only renders safe summary fields.
- Raw chart JSON and other users’ records are not exposed in the layout layer.

## Dashboard connection status
- The dashboard active Kundli CTA now points to the Saved Kundli management flow.
- Ask NAVAGRAHA AI and report readiness continue to use the safe hub contract.
- Empty dashboard states remain stable when no Kundli exists.

## Form validation status
- Label, DOB, time, and birth place are required before create/update.
- Date/time input is validated before saving.
- Latitude, longitude, and timezone remain optional.
- Invalid input is blocked with a safe inline message.

## Privacy / logging status
- Birth details are shown only as safe status/summaries.
- No raw chart JSON is surfaced in the UI.
- Error UI remains generic.
- The client scaffold does not add sensitive logging.

## Mobile UI status
- White dashboard style remains intact.
- Saved Kundli cards and forms are responsive.
- Empty, loading, and error states are clean and mobile-safe.
- Delete confirmation is explicit.

## Regression status
- The dashboard page remains connected to the hub contract.
- The saved-Kundli management surface is separate from astrology calculation logic.
- Ask NAVAGRAHA AI and reports remain untouched at the logic layer.

## Fixes made
- Added saved-Kundli management contract and UI scaffold.
- Added dashboard connection to the new Kundli routes.
- Added route loading/error states.
- Added label/date/time validation.
- Added safer active/default behavior.

## Validation note
- This workspace snapshot does not include `package.json`, so `npm run typecheck`, `npm run lint`, and `npm run build` cannot be executed in this environment.

## Next phase
- 21.1C Saved Kundli Production Readiness
