# Phase 30.0A - Analytics Audit + Event Architecture

## Files inspected

- `src/lib/analytics/types.ts`
- `src/lib/analytics/track-event.ts`
- `src/lib/analytics/event-store.ts`
- `src/lib/analytics/revenue-events.ts`
- `src/components/analytics/page-view-tracker.tsx`
- `src/components/analytics/event-tracker.tsx`
- `src/components/analytics/tracked-link.tsx`
- `src/components/analytics/web-vitals-reporter.tsx`
- `src/app/api/analytics/event/route.ts`
- `src/app/api/analytics/summary/route.ts`
- `src/app/api/observability/web-vitals/route.ts`
- `src/lib/observability.ts`
- `src/config/env.ts`
- `src/lib/monetization/monetization-config.ts`
- `src/modules/shop/analytics-audit.ts`
- `src/modules/conversion/events.ts`
- `src/app/layout.tsx`

## Existing analytics status

- Client-side analytics exists as a lightweight event system built around `trackEvent`, `PageViewTracker`, `AnalyticsEventTracker`, and `TrackedLink`.
- Server-side observability exists through `trackServerEvent`, `trackBrowserMetric`, and the web-vitals route.
- There is no GA/GTM script currently injected in the app layout.
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` is available in config, but it is only configuration at this stage, not an active browser analytics embed.
- Vercel Analytics is not present in the audited code paths.
- Analytics summary data is server-scoped and protected by session access.

## Privacy risk audit

- Safe by design:
  - no DOB tracking in the current analytics payload model
  - no latitude/longitude tracking in the current analytics payload model
  - no raw Kundli/chart JSON tracking
  - no AI prompts or responses tracked
  - no report content tracked
  - no consultation private notes tracked
  - no payment secrets tracked
  - no admin/private data tracked
- Existing safeguards:
  - analytics payload sanitization removes keys matching sensitive patterns such as birth/dob/latitude/longitude/password/token/secret/cookie/authorization
  - analytics routes are rate-limited and origin-guarded
  - analytics summary requires sign-in
- Residual caution:
  - any future event schema must keep values behavioral and non-sensitive, because the transport accepts arbitrary string/number/boolean payload values.

## Safe event architecture

Recommended event names for Phase 30.0B and beyond:

- `page_view`
- `homepage_cta_click`
- `kundli_generate_click`
- `dashboard_checkin`
- `rashifal_view`
- `panchang_view`
- `tools_hub_view`
- `report_preview_click`
- `report_unlock_click`
- `ai_start_click`
- `consultation_book_click`
- `language_switch`
- `pwa_install_prompt`
- `pwa_install_success`

## Funnel architecture

- Visitor -> Kundli generation
- Visitor -> Rashifal / Panchang return
- Kundli -> report preview
- Report preview -> unlock
- Dashboard -> AI
- Dashboard -> consultation
- Content -> tool usage
- Multilingual page -> engagement

## Consent readiness

- No dedicated consent/cookie banner was found in the audited code paths.
- Locale cookies exist for language persistence, but that is not analytics consent.
- A proper analytics consent model is still required before enabling any optional browser analytics providers.
- Do not enable GA/GTM until consent behavior, retention policy, and privacy copy are explicitly defined.

## Automation / monitoring readiness

Future monitoring should cover:

- build/deploy checks
- sitemap/robots checks
- broken route checks
- GSC monitoring reminders
- content publishing checklist
- AdSense readiness checks
- analytics event-volume anomaly checks

## Exact files to modify in 30.0B

- `src/lib/analytics/types.ts`
- `src/lib/analytics/event-store.ts`
- `src/lib/analytics/track-event.ts`
- `src/components/analytics/page-view-tracker.tsx`
- `src/components/analytics/event-tracker.tsx`
- `src/components/analytics/tracked-link.tsx`
- `src/components/analytics/web-vitals-reporter.tsx`
- `src/app/api/analytics/event/route.ts`
- `src/app/api/analytics/summary/route.ts`
- `src/app/api/observability/web-vitals/route.ts`
- `src/lib/observability.ts`
- `src/config/env.ts`
- `src/lib/monetization/monetization-config.ts`
- `src/app/layout.tsx` only if provider injection or consent gating is added

## Known gaps

- No consent system.
- No browser analytics provider script.
- No event taxonomy specifically named for the new PWA/mobile funnel yet.
- No monitoring automations are wired, only documented as a future phase.

## Final verdict

- Analytics is audited.
- The current stack is privacy-aware and already blocks obvious sensitive keys.
- The next step is to formalize the safe event taxonomy, consent gating, and optional provider wiring in Phase 30.0B.
