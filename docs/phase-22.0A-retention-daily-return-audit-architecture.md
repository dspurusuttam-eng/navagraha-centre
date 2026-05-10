# Phase 22.0A - Retention + Daily Return System Audit + Architecture

## Overview

This phase audits the current retention surfaces and defines the launch-ready architecture for a daily return system. It does not add new product behavior. The goal is to make NAVAGRAHA CENTRE easier to revisit every day through safe, privacy-aware prompts that reuse existing dashboard, Panchang, Rashifal, content, report, AI, and consultation flows.

## Files Inspected

- `src/app/(app)/dashboard/page.tsx`
- `src/modules/retention/service.ts`
- `src/modules/retention/types.ts`
- `src/modules/retention/index.ts`
- `src/modules/retention/components/retention-surface-panel.tsx`
- `src/modules/retention/components/retention-event-tracker.tsx`
- `src/modules/account/dashboard-hub.ts`
- `src/modules/account/dashboard-ecosystem.ts`
- `src/modules/account/components/dashboard-ecosystem-home.tsx`
- `src/lib/analytics/track-event.ts`
- `src/lib/analytics/types.ts`
- `src/app/(marketing)/daily-rashifal/page.tsx`
- `src/app/(marketing)/rashifal/page.tsx`
- `src/app/(marketing)/rashifal/[sign]/page.tsx`
- `src/app/(marketing)/panchang/page.tsx`
- `src/app/(marketing)/from-the-desk/page.tsx`
- `src/app/(marketing)/articles/page.tsx`
- `src/app/(marketing)/blog/page.tsx`
- `src/app/(marketing)/consultation/page.tsx`
- `src/app/(marketing)/reports/page.tsx`
- `src/app/(marketing)/kundli/page.tsx`
- `src/app/(marketing)/ai/page.tsx`

## Dashboard Retention Audit

The dashboard already has a strong retention base:

- today guidance
- current energy / timing summary
- active Kundli and onboarding state
- Panchang snapshot and return prompt
- recommended next step
- saved reports history
- AI history and continue/resume flows
- consultation history and follow-up flows
- preferences and notification-like settings
- quick actions for common return paths

What is still weak:

- there is no explicit "come back tomorrow" daily return pattern
- there is no dedicated streak or activity indicator yet
- there is no user-selected preferred rashi / zodiac shortcut in the retention layer
- there is no formal notification preference model for reminders
- the return prompts exist, but they are not yet organized as a dedicated retention system with a single architecture layer

## Daily Rashifal Retention Audit

The daily Rashifal / Rashifal surface exists and is publicly reachable through the editorial SEO entry pages.

What is already good:

- date-based editorial structure exists
- Assamese, English, and localized routes are supported by the current editorial system
- the route is public and suitable for daily revisit behavior
- related links to consultation, Panchang, and content hubs already exist through the editorial layer

What is missing or weak:

- there is no persisted preferred sign shortcut surfaced in the retention flow
- there is no explicit archive or "yesterday/tomorrow" revisit flow yet
- clean empty-state handling exists, but it is not yet framed as a daily return habit builder
- there is no reminder-preference layer for daily Rashifal visits yet

## Panchang Retention Audit

Panchang is one of the strongest retention surfaces in the app.

What is already good:

- public daily Panchang route exists
- location-aware timing context exists
- related CTAs already point to Rashifal, AI, and consultation
- the dashboard retention surface already reuses Panchang highlights

What is missing or weak:

- there is no separate Panchang return hub or reminder preference layer
- there is no explicit daily location bookmark/preference surface in the retention layer
- there is no strong "check Panchang every day" CTA loop beyond the existing dashboard panel

## Kundli-Based Return Audit

Saved Kundli and active chart state already drive personalization.

What is already good:

- the dashboard knows whether a chart exists
- active Kundli can feed daily guidance, AI, reports, and consultations
- onboarding and chart setup already connect into the private dashboard flow

What is missing or weak:

- there is no dedicated "continue from saved Kundli" return lane as a first-class retention module
- there is no explicit preference system for which Kundli should anchor the daily view if multiple are stored
- there is no clearly separated inactive/no-Kundli retention journey beyond onboarding

## Reports Retention Audit

Saved reports already support revisit behavior.

What is already good:

- saved report history exists
- ready/preview/locked states are present
- continuation and unlock prompts already exist in the dashboard ecosystem

What is missing or weak:

- there is no explicit "recommended next report" retention path yet
- report previews should remain careful not to leak premium content
- there is no dedicated return rhythm tied to report updates or revisit prompts

## AI Retention Audit

AI history and Ask My Chart already support continuation.

What is already good:

- AI history exists
- continue/resume URLs are present
- recent question snippets are summarized safely

What is missing or weak:

- there is no explicit daily AI prompt layer in the retention system
- safe limits and gating are present, but there is no dedicated "ask again today" prompt architecture yet
- the retention layer should continue to avoid raw prompt/context leakage

## Consultation Retention Audit

Consultation history and booking continuity are already present.

What is already good:

- upcoming and past consultation states exist
- history and follow-up prompts are already represented in the dashboard ecosystem
- booking continuation and book-again paths are already possible

What is missing or weak:

- there is no explicit consultation follow-up reminder framework yet
- status-based return prompts can be made more visible
- there is no distinct post-consultation retention lane yet

## Blog / From the Desk Retention Audit

Editorial content already contributes to repeat visits.

What is already good:

- `/from-the-desk` exists as a public reading hub
- `/articles` exists as the canonical editorial index
- related links to Rashifal, Panchang, consultation, and tools already exist

What is missing or weak:

- the retention system does not yet treat editorial content as a first-class return engine
- there is no dedicated "new post" or "read tomorrow" prompt architecture
- there is no notification-preference model for editorial updates yet

## PWA / Notification Readiness

No real PWA or push-notification system was found in this phase.

Current status:

- no manifest-driven PWA flow was identified
- no service worker-based notification flow was identified
- no subscription-preference model was identified

Recommended next step:

- design notification preferences first
- only add PWA / push mechanics later if the repo already supports them safely
- keep reminders optional and privacy-safe

## Analytics Readiness

The app already has a safe analytics foundation.

Existing safe event families include:

- `page_view`
- `page_visit`
- `cta_click`
- `consultation_click`
- `report_view`
- `ai_opened`
- `ai_question_submitted`
- `daily_insight_view`
- `return_prompt_shown`
- `chart_incomplete_nudge`
- `premium_followup_nudge`
- `panchang_view`
- `daily_panchang_view`
- `panchang_return_prompt_shown`

Safe retention events to keep or extend later:

- `dashboard_daily_checkin`
- `daily_rashifal_view`
- `panchang_view`
- `kundli_continue_click`
- `report_history_click`
- `ai_continue_click`
- `consultation_status_view`
- `from_the_desk_read`

Analytics constraints:

- never include raw chart JSON
- never include private birth details
- never include AI prompt/context
- never include premium report content
- never include consultation private notes
- never include admin data or other-user data

## Privacy / Security Risks

The retention system must stay privacy-safe.

Do not expose:

- raw birth details
- raw chart JSON
- AI prompts or internal context
- premium report content
- consultation private notes
- admin/internal data
- another user's data

Analytics and nudges should remain behavioral and summary-only.

## Recommended Phase 22 Architecture

Recommended modules for the next implementation phase:

- Daily Return Hub
- Dashboard Check-In Card
- Preferred Rashi / Zodiac Preference
- Today Guidance CTA Layer
- Panchang Return Block
- Continue Where You Left Off
- Recommended Next Action
- Retention Analytics Events
- Future Notification Preferences

Implementation principle:

- reuse the existing dashboard ecosystem and retention service
- keep prompts summary-only
- keep the return flow modular so it can later support reminders and PWA notifications

## Launch-Critical vs Post-Launch Features

Launch-critical for Phase 22:

- daily dashboard check-in surface
- strong Panchang return prompt
- better "continue where you left off" behavior
- safer preferred-sign or preferred-Kundli return path
- retention analytics events

Post-launch:

- streaks
- push notifications
- PWA installation prompts
- richer reminder preferences
- reminder scheduling

## Exact Files to Modify in Phase 22.0B

- `src/modules/retention/service.ts`
- `src/modules/retention/types.ts`
- `src/modules/retention/components/retention-surface-panel.tsx`
- `src/modules/retention/components/retention-event-tracker.tsx`
- `src/modules/account/dashboard-hub.ts`
- `src/modules/account/dashboard-ecosystem.ts`
- `src/modules/account/components/dashboard-ecosystem-home.tsx`
- `src/app/(app)/dashboard/page.tsx`
- `src/lib/analytics/types.ts`
- `src/lib/analytics/track-event.ts`
- `src/app/(marketing)/daily-rashifal/page.tsx`
- `src/app/(marketing)/rashifal/page.tsx`
- `src/app/(marketing)/panchang/page.tsx`
- `src/app/(marketing)/from-the-desk/page.tsx`
- `src/app/(marketing)/articles/page.tsx`

## Exact 22.0B Implementation Plan

1. Introduce a dedicated retention return module in the dashboard home.
2. Add a clear daily check-in callout that uses the existing retention snapshot.
3. Promote preferred Kundli or preferred sign as the main return anchor if the user has one.
4. Expand the next-step layer into a reusable "continue where you left off" pattern.
5. Keep Panchang return prompts prominent without adding invasive tracking.
6. Add safe analytics events for retention behavior using summary-only payloads.
7. Keep all prompts private-user scoped and summary-only.
8. Leave notifications/PWA for a later phase unless the repo already has a safe pattern.

## Validation

- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run build`: passed after clearing the generated `.next` tree and rerunning with elevated permissions to bypass the Windows file-lock issue

## Final Verdict

Phase 22.0A is complete as an audit and architecture phase. The retention system has a strong existing foundation, but the dedicated daily-return architecture still needs implementation in Phase 22.0B.

## Next Phase

- `22.0B Retention + Daily Return Implementation`
