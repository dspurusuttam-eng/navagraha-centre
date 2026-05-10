# Phase 30.0B - Privacy-Safe Analytics + Conversion Event Setup

## Files Changed
- `src/lib/analytics/types.ts`
- `src/lib/analytics/event-store.ts`
- `src/lib/analytics/conversion-events.ts`
- `src/components/analytics/tracked-link.tsx`
- `src/components/site/language-switcher.tsx`
- `src/modules/account/components/dashboard-ecosystem-home.tsx`

## Event Registry Status
The analytics registry now includes safe first-party conversion events for:
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

Existing legacy names remain available for backward compatibility.

## Conversion Helpers Added
New client-side helpers live in `src/lib/analytics/conversion-events.ts`:
- `trackHomepageCtaClick`
- `trackKundliGenerateClick`
- `trackDashboardCheckin`
- `trackRashifalView`
- `trackPanchangView`
- `trackToolsHubView`
- `trackReportPreviewClick`
- `trackReportUnlockClick`
- `trackAiStartClick`
- `trackConsultationBookClick`
- `trackLanguageSwitch`
- `trackPwaInstallPrompt`
- `trackPwaInstallSuccess`

Helpers only accept safe fields:
- `route`
- `locale`
- `toolKey`
- `section`
- `cta`
- `source`
- `status`
- `planKey`

## Sanitizer Rules
Server-side payload sanitization now blocks keys matching sensitive astrology, account, and payment data patterns, including:
- birth / dob / dateOfBirth / birthTime / birthPlace
- latitude / longitude / lat / lng / coordinates
- chart / kundliRaw
- prompt / aiResponse / reportContent / consultationNotes
- token / secret / cookie / authorization / password
- paymentKey / webhookSecret

Unsafe keys are dropped before event storage. The handler does not crash on rejected fields.

## Components Wired
- `TrackedLink` now emits the new conversion events alongside the existing event stream where the link target makes sense.
- `LanguageSwitcher` now records `language_switch` when users change locale.
- `DashboardEcosystemHome` now records a privacy-safe `dashboard_checkin` on mount.
- `tools_hub_view` remains on the existing tools page tracker.

## API Safety Result
- The analytics event API still rejects invalid event names and rate-limits input.
- The analytics summary response now redacts `userId` from recent events.
- No raw Kundli JSON, birth data, AI prompt/response text, consultation notes, or payment secrets are stored by the analytics path.

## Consent Limitation
No third-party analytics provider was added.
No consent banner was introduced in this phase.
External analytics must wait until a separate consent layer exists.

## Privacy Guarantees
- First-party only
- Server-side sanitization in place
- No DOB / birth place / coordinates tracking
- No raw chart JSON tracking
- No AI prompt or response tracking
- No premium report content tracking
- No consultation private-note tracking
- No payment secret / token / cookie tracking

## Known Gaps
- `trackToolsHubView`, `trackPwaInstallPrompt`, and `trackPwaInstallSuccess` are architecture-ready, but there is no dedicated PWA prompt flow yet.
- A formal consent banner is still required before any optional third-party analytics can be enabled.
- The analytics summary remains intentionally high-level and aggregate-first.

## Next Phase
Phase 30.0C - Automation / Monitoring / Production QA
