# Phase 21.0A - User Dashboard + Personal Astrology Hub Audit

## Files Inspected
- `D:\PDS BDS\navagraha-centre\src\app\(app)\layout.tsx`
- `D:\PDS BDS\navagraha-centre\src\app\(auth)\layout.tsx`
- `D:\PDS BDS\navagraha-centre\src\app\(app)\dashboard\page.tsx`
- `D:\PDS BDS\navagraha-centre\src\app\(app)\dashboard\report\page.tsx`
- `D:\PDS BDS\navagraha-centre\src\app\(app)\dashboard\chart\page.tsx`
- `D:\PDS BDS\navagraha-centre\src\app\(app)\dashboard\ask-my-chart\page.tsx`
- `D:\PDS BDS\navagraha-centre\src\app\(app)\dashboard\consultations\page.tsx`
- `D:\PDS BDS\navagraha-centre\src\app\(app)\dashboard\orders\page.tsx`
- `D:\PDS BDS\navagraha-centre\src\app\(app)\settings\page.tsx`
- `D:\PDS BDS\navagraha-centre\src\app\(app)\dashboard\onboarding\page.tsx`
- `D:\PDS BDS\navagraha-centre\src\app\(auth)\sign-in\page.tsx`
- `D:\PDS BDS\navagraha-centre\src\app\(auth)\sign-up\page.tsx`
- `D:\PDS BDS\navagraha-centre\src\app\api\astrology\birth-context\resolve\route.ts`
- `D:\PDS BDS\navagraha-centre\src\app\api\ai\ask-chart\sessions\route.ts`
- `D:\PDS BDS\navagraha-centre\src\app\api\report\premium\generate\route.ts`
- `D:\PDS BDS\navagraha-centre\src\modules\auth\server.ts`
- `D:\PDS BDS\navagraha-centre\src\modules\auth\components\sign-in-form.tsx`
- `D:\PDS BDS\navagraha-centre\src\modules\auth\components\sign-up-form.tsx`
- `D:\PDS BDS\navagraha-centre\src\modules\auth\components\sign-out-button.tsx`
- `D:\PDS BDS\navagraha-centre\src\modules\auth\components\auth-form-shell.tsx`
- `D:\PDS BDS\navagraha-centre\src\modules\account\service.ts`
- `D:\PDS BDS\navagraha-centre\src\modules\account\dashboard-ecosystem.ts`
- `D:\PDS BDS\navagraha-centre\src\modules\account\components\dashboard-ecosystem-home.tsx`
- `D:\PDS BDS\navagraha-centre\src\modules\account\components\profile-settings-form.tsx`
- `D:\PDS BDS\navagraha-centre\src\modules\onboarding\service.ts`
- `D:\PDS BDS\navagraha-centre\src\modules\onboarding\components\onboarding-wizard.tsx`
- `D:\PDS BDS\navagraha-centre\src\modules\ask-chart\service.ts`
- `D:\PDS BDS\navagraha-centre\src\modules\ask-chart\components\ask-my-chart-assistant.tsx`
- `D:\PDS BDS\navagraha-centre\src\modules\ask-chart\types.ts`
- `D:\PDS BDS\navagraha-centre\src\modules\report\service.ts`
- `D:\PDS BDS\navagraha-centre\src\modules\report\components\chart-report-page.tsx`
- `D:\PDS BDS\navagraha-centre\src\modules\consultations\service.ts`
- `D:\PDS BDS\navagraha-centre\src\modules\shop\member-orders.ts`
- `D:\PDS BDS\navagraha-centre\prisma\schema.prisma`

## Current Auth / Profile / Dashboard Flow
- Authentication is server-gated through `requireUserSession()` and `redirectIfAuthenticated()` in `src/modules/auth/server.ts`.
- The protected app shell is enforced at the layout level in `src/app/(app)/layout.tsx`.
- The auth shell redirects signed-in users away from auth pages via `src/app/(auth)/layout.tsx`.
- Signup and login are plain email/password flows backed by Better Auth in `src/lib/auth.ts`, with client forms in `src/modules/auth/components/sign-in-form.tsx` and `src/modules/auth/components/sign-up-form.tsx`.
- Logout is a client action via `src/modules/auth/components/sign-out-button.tsx`.
- The account settings page is the only explicit profile-edit surface found; it uses `ProfileSettingsForm` and `getProfileSettings()` from `src/modules/account/service.ts`.
- The dashboard landing page already aggregates multiple account surfaces, but it is still a dashboard shell rather than a dedicated personal astrology hub.

## Saved Kundli Status
- Saved birth details live in `BirthData` and the persisted chart lives in `Chart` in `prisma/schema.prisma`.
- The `Profile` row also has `chartData`, which is used by chart retrieval and dashboard summaries.
- Onboarding writes the primary birth profile and chart foundation through `src/modules/onboarding/service.ts` and `src/modules/onboarding/components/onboarding-wizard.tsx`.
- Saved chart retrieval is handled by `src/modules/astrology/chart-retrieval.ts`, which:
  - reuses a saved chart when valid,
  - refreshes a stale chart,
  - or rebuilds a missing chart.
- The chart page at `src/app/(app)/dashboard/chart/page.tsx` is a protected chart view, not a full chart manager.
- I did not find a dedicated dashboard UI for edit/delete chart management; onboarding is the current update path.
- Missing chart fallback is already present: the dashboard and Ask My Chart routes return safe “needs chart” or empty states when chart data is absent.

## Report Connection Status
- Protected report generation is routed through `src/app/(app)/dashboard/report/page.tsx` and `src/modules/report/service.ts`.
- Saved report history in the dashboard is currently derived from `AiTaskRun` records in `src/modules/account/dashboard-ecosystem.ts`, not from a separate report history table.
- User-specific ownership is enforced by `userId` filters in the dashboard report and history queries.
- Payment/unlock connection is already server-gated in the premium report API at `src/app/api/report/premium/generate/route.ts`.
- Report preview/full-access behavior is already separated in the Phase 20 report foundation and presentation stack.

## AI Connection Status
- Ask NAVAGRAHA AI is routed through `src/app/(app)/dashboard/ask-my-chart/page.tsx`, `src/modules/ask-chart/service.ts`, and `src/modules/ask-chart/components/ask-my-chart-assistant.tsx`.
- AI session history is user-scoped by `userId` and `channelKey = ask-my-chart`.
- `getAskMyChartPageData()` falls back to `needs-chart` when the saved chart is missing.
- The assistant already carries session continuity, usage limits, and premium nudges.
- Saved AI conversations are present and resumable.
- Daily personalized prediction hooks are partially present through `src/modules/retention` and the dashboard “Today’s Personalized Guidance” card, but this is not yet a single personal astrology hub.

## Daily Hub Readiness
- The dashboard already shows:
  - today’s personalized guidance,
  - current energy,
  - recommended next step,
  - saved Kundli,
  - AI history,
  - saved reports,
  - compatibility history,
  - consultation history,
  - quick actions.
- The hub is not yet consolidated into a single daily personal astrology surface.
- Existing readiness components are fragmented across:
  - retention snapshots,
  - report generation,
  - Ask My Chart,
  - onboarding/chart state,
  - panchang,
  - consultations.
- A Phase 21 hub can already be built from these sources without changing astrology calculations.

## Security / Privacy Findings
- Protected routes use `requireUserSession()` and user-scoped queries throughout the inspected services.
- Consultation, order, report, and Ask My Chart histories are all filtered by `userId`.
- The auth and dashboard surfaces do not expose cross-user data in the inspected code paths.
- No raw chart JSON is rendered directly in the dashboard UI.
- Some dashboard aggregation code does select raw payloads server-side (`chartPayload`, `inputPayload`, `outputPayload`) and reduces them to summaries. That is acceptable today, but Phase 21 should keep the personal hub summary-only and avoid exposing raw payloads to the client.
- Error handling is generally safe and falls back to empty/fallback states, though several server paths still log errors with `console.error`. That is not a user-facing leak, but it is a cleanup target for a future privacy pass.

## UX Gaps
- No dedicated “personal astrology hub” page exists yet as a distinct product surface.
- The dashboard is broad, but not organized around daily astrology primitives such as:
  - today’s guidance,
  - current Dasha summary,
  - Moon sign / Lagna summary,
  - Panchang snapshot,
  - daily remedy,
  - report recommendations,
  - consultation CTA.
- Empty, loading, and error states exist in the individual surfaces, but the dashboard landing page is still a server-rendered aggregation page rather than a hub with a single shared view model.
- Mobile layout is generally responsive through the existing card/grid system, but the dashboard hub itself has not been purpose-built for mobile-first daily use.
- Multilingual readiness exists at the profile level (`preferredLanguage`) and through localization helpers, but a consolidated localized dashboard hub is not yet in place.

## Exact Files to Modify in 21.0B
- `D:\PDS BDS\navagraha-centre\src\app\(app)\dashboard\page.tsx`
- `D:\PDS BDS\navagraha-centre\src\modules\account\dashboard-ecosystem.ts`
- `D:\PDS BDS\navagraha-centre\src\modules\account\components\dashboard-ecosystem-home.tsx`
- `D:\PDS BDS\navagraha-centre\src\modules\account\service.ts`
- `D:\PDS BDS\navagraha-centre\src\modules\onboarding\service.ts`
- `D:\PDS BDS\navagraha-centre\src\modules\report\service.ts`
- `D:\PDS BDS\navagraha-centre\src\modules\ask-chart\service.ts`
- `D:\PDS BDS\navagraha-centre\src\modules\ask-chart\components\ask-my-chart-assistant.tsx`
- `D:\PDS BDS\navagraha-centre\src\app\(app)\dashboard\report\page.tsx`
- `D:\PDS BDS\navagraha-centre\src\app\(app)\dashboard\ask-my-chart\page.tsx`
- `D:\PDS BDS\navagraha-centre\src\app\(app)\dashboard\chart\page.tsx`
- `D:\PDS BDS\navagraha-centre\src\app\(app)\dashboard\consultations\page.tsx`
- `D:\PDS BDS\navagraha-centre\src\app\(app)\dashboard\orders\page.tsx`
- `D:\PDS BDS\navagraha-centre\src\app\(app)\settings\page.tsx`

## Recommended Dashboard Architecture
- Keep `src/app/(app)/dashboard/page.tsx` as the protected entrypoint.
- Introduce a single server-side dashboard hub snapshot that aggregates:
  - profile readiness,
  - primary birth profile,
  - chart overview,
  - current retention/daily guidance,
  - panchang snapshot,
  - current Dasha / Moon / Lagna summary,
  - report history,
  - AI session history,
  - consultation history,
  - commerce/order status.
- Keep the page component presentational; move data assembly into a dedicated service layer.
- Keep all data summaries server-side and summary-only.
- Do not pass raw chart payloads or report payloads to the client.
- Reuse the existing auth/session, onboarding, ask-my-chart, report, consultation, and order services instead of duplicating logic.
- Use `userId`-scoped queries everywhere and preserve the current server-side access boundaries.

## Next Phase Recommendation
- `21.0B - User Dashboard + Personal Astrology Hub Foundation`

## Validation
- No behavior changed in this audit phase.
- Validation has not been run yet for this phase output because this turn is still the audit/documentation step.
