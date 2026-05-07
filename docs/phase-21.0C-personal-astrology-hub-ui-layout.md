# Phase 21.0C - Personal Astrology Hub UI Layout

## Files changed
- `src/components/ui/badge.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/modules/account/dashboard-hub.ts`
- `src/modules/account/components/dashboard-personal-hub.tsx`
- `src/app/(app)/dashboard/page.tsx`
- `src/app/(app)/dashboard/loading.tsx`
- `src/app/(app)/dashboard/error.tsx`

## Dashboard cards added
- Welcome / Profile Summary Card
- Active Kundli Card
- Current Dasha Card
- Today’s Personal Guidance Card
- Saved Reports Card
- Ask NAVAGRAHA AI Card
- Consultation Card
- Quick Actions Card

## Data contract usage
- The dashboard uses the secure `DashboardHubData` contract from `src/modules/account/dashboard-hub.ts`.
- The contract keeps raw chart data and raw AI payloads out of the UI surface.
- Ownership checks stay explicit in the data layer.

## Empty / loading / error states
- Loading state added at `src/app/(app)/dashboard/loading.tsx`.
- Safe empty states are returned by `createEmptyDashboardHubData()`.
- Missing chart, Dasha, guidance, report, AI, consultation, and shop data degrade to placeholder-safe summaries.

## Security / privacy behavior
- Only user-owned summary data is rendered.
- No raw chart JSON is exposed in the hub layout.
- Another user’s reports or charts are not surfaced.
- Errors are handled at the data-contract layer without internal leakage.

## Mobile layout notes
- The hub is card-based and mobile-first.
- Cards stack vertically on small screens and expand into a multi-column grid on larger screens.
- The quick actions section remains readable without horizontal overflow.

## Pure white visual direction
- The dashboard shell uses a pure white `#FFFFFF` page background.
- Cards are white with very light borders and subtle shadow.
- Typography is rendered in black / charcoal.
- Gold is used only as a controlled accent.

## Next phase
- 21.0D Dashboard QA + Production Safety

## Validation note
- This workspace snapshot does not include `package.json`, so `npm run typecheck`, `npm run lint`, and `npm run build` cannot be executed in this environment.
