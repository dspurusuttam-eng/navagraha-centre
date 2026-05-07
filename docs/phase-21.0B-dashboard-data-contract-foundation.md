# Phase 21.0B - Dashboard Data Contract Foundation

## Files Changed
- `src/modules/account/dashboard-hub.ts`
- `src/modules/account/service.ts`
- `src/app/(app)/dashboard/page.tsx`

## Dashboard Data Contract
Created a server-only reusable dashboard hub contract that normalizes the authenticated member dashboard into safe summary objects instead of passing raw source payloads through the page layer.

Contract sections:
- `profile`
- `activeKundli`
- `dasha`
- `dailyGuidance`
- `reports`
- `ai`
- `consultations`
- `shop`
- `access`
- `security`

The contract stays summary-only and does not expose raw chart JSON, raw AI payloads, or hidden report data.

## Active Kundli Summary Behavior
- Shows whether a primary saved Kundli exists.
- Provides Lagna and Moon sign labels only when chart data is available.
- Exposes a short chart narrative and dominant body labels when present.
- Falls back to a safe "pending" state when the chart is missing.
- Keeps ownership server-side and user-scoped.

## Dasha Summary Behavior
- Surfaces the currently available cycle summary from the generated user report.
- Includes Mahadasha details when present.
- Leaves Antardasha and Pratyantar as nullable placeholders when they are not safely surfaced yet.
- Uses safe fallback wording when cycle data is unavailable.
- Does not dump raw calculation output.

## Daily Guidance Source
- Connects the dashboard to existing retention guidance and Panchang sources.
- Uses the current cycle summary when available.
- Falls back to placeholder-safe guidance when no personalized source exists yet.
- Does not fabricate personalized guidance.

## Report Summary Behavior
- Summarizes the active report surface and saved report history.
- Distinguishes ready, preview, and locked states.
- Keeps premium/report unlock state summary-only.
- Includes recent saved report summaries without exposing raw report payloads.

## AI Summary Behavior
- Shows Ask NAVAGRAHA AI availability and Ask My Chart readiness.
- Includes safe session summaries for recent AI usage.
- Uses placeholder-safe fallback states when no chart or history exists.
- Does not expose raw conversation context or internal prompts.

## Consultation and Shop Summary Behavior
- Consultation history is summarized into upcoming/past buckets with safe copy.
- Shop/orders are represented as a safe count/status summary only.
- Missing data returns empty states instead of fabricated content.

## Ownership and Security Checks
- Dashboard sources remain scoped to the current authenticated `userId`.
- Server-side auth remains the real access control.
- The contract includes explicit security flags for user-only ownership, server-side enforcement, and raw-payload exclusion.
- Error handling remains fallback-safe instead of leaking internals.

## Fallback and Empty States
- Added reusable empty dashboard hub data for setup-pending or error fallback states.
- Empty states keep the dashboard readable without showing sensitive or unsupported data.
- The contract returns safe placeholders for profile, Kundli, Dasha, guidance, reports, AI, consultations, and orders.

## Validation
- `npm run typecheck` passed
- `npm run lint` passed
- `npm run build` passed

## Next Phase
`21.0C - Dashboard UI Hub Layout`
