# Phase 21.4A - AI Chat / Ask My Chart History

## Files changed
- `src/modules/account/ai-history.ts`
- `src/modules/account/dashboard-hub.ts`
- `src/modules/account/components/dashboard-personal-hub.tsx`
- `src/modules/account/components/dashboard-ai-history.tsx`
- `src/modules/account/components/dashboard-ai-history-detail.tsx`
- `src/app/(app)/dashboard/ai-history/page.tsx`
- `src/app/(app)/dashboard/ai-history/loading.tsx`
- `src/app/(app)/dashboard/ai-history/error.tsx`
- `src/app/(app)/dashboard/ai-history/[id]/page.tsx`
- `src/app/(app)/dashboard/ai-history/[id]/loading.tsx`
- `src/app/(app)/dashboard/ai-history/[id]/error.tsx`

## AI history data source status
- Added a repo-consistent AI history helper in `src/modules/account/ai-history.ts`.
- The helper is summary-safe and owner-scoped:
  - session id
  - owner id
  - related Kundli id / label
  - module label
  - first question
  - safe snippet
  - created / updated timestamps
- The helper does not store or expose raw prompt text, system instructions, raw chart JSON, or internal reasoning content.
- The dashboard hub now carries a safe AI history contract with history counts, recent snippets, continuation links, and readiness flags.

## Dashboard AI card upgrade
- The `Ask NAVAGRAHA AI` dashboard card now shows:
  - Ask My Chart readiness
  - active Kundli label when available
  - recent session count
  - latest topic summary
  - latest safe question snippets
- The card links to:
  - `Ask NAVAGRAHA AI`
  - `Continue Conversation`
  - `View AI History`
  - `Generate Kundli` when no active Kundli exists
- The card remains summary-only and does not render full AI answers.

## AI history route / page status
- Added protected dashboard AI history routes:
  - `/dashboard/ai-history`
  - `/dashboard/ai-history/[id]`
- Added loading and error states for both routes.
- The list page shows safe titles, module badges, related Kundli labels, dates, and short snippets.
- The detail page shows metadata only and never exposes raw prompts or raw chart context.

## Ownership / security behavior
- AI history is scoped to the current user through the owner-aware helper contract.
- The dashboard and history pages only render user-owned summary data.
- No another-user chat/session data is surfaced in the dashboard layer.
- Safe fallback states are used when history is missing or unavailable.

## Raw context leak prevention
- Raw prompt text is not displayed.
- System instructions are not displayed.
- Raw chart JSON is not displayed.
- Internal AI context is not displayed.
- The dashboard only shows safe snippets and metadata intended for user visibility.

## Active Kundli connection
- The dashboard AI readiness now reflects active/default Kundli state.
- If an active Kundli exists, the AI card shows ready state and history continuity.
- If no active Kundli exists, the card falls back to a clear `Generate Kundli` CTA.

## Empty / loading / error states
- No AI history yet
- No active Kundli
- Loading state for the history routes
- Safe error state for the history routes
- Unavailable history source fallback

## Mobile UI notes
- The AI history UI follows the pure white dashboard system:
  - white background
  - charcoal typography
  - controlled gold accents
  - light borders
  - subtle shadow
- The history cards and filters are mobile-first and avoid exposing dense conversation data.

## Next phase
- 21.4B AI Chat History QA + Security + Production Safety

