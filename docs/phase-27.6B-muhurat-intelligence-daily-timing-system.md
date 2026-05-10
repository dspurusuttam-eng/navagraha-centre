# Phase 27.6B - Muhurat Intelligence + Daily Timing System

## Files Changed
- `src/modules/muhurta-lite/engine.ts`
- `src/modules/muhurta-lite/index.ts`
- `src/app/api/astrology/muhurta-lite/route.ts`
- `scripts/debug-muhurat-intelligence-qa.ts`
- `package.json`

## Muhurat Engine Status
The Muhurta-lite engine now acts as a daily timing intelligence layer on top of Panchang data.

It uses the existing Panchang context, preserves the current API contract, and adds a stable readiness layer for activity-specific timing guidance.

## Supported Activity Types
- `general_daily_activity`
- `spiritual_practice`
- `business_work_start`
- `travel_readiness`
- `vehicle_purchase_readiness`
- `griha_pravesh_readiness`
- `naming_ceremony_readiness`
- `marriage_readiness_placeholder`

## Timing / Rating Output Shape
The output now includes:
- `muhuratDate`
- `locationLabel`
- `timezone`
- `activityType`
- `rating`
- `goodWindows[]`
- `cautionWindows[]`
- `avoidWindows[]`
- `basis[]`
- `panchangFactors[]`
- `safeSummary`
- `missingReason`

The existing Panchang-derived payload remains present for compatibility.

## Panchang Factor Usage
The engine uses:
- Abhijit Muhurta
- Brahma Muhurta
- Rahu Kaal
- Gulika Kaal
- Yamaganda
- Tithi
- Nakshatra
- Yoga
- Karana
- weekday / vaar
- sunrise / sunset

## Fallback Behavior
- Missing Panchang data returns `unavailable` with `missingReason`.
- Invalid location or timezone does not crash the engine.
- Exact muhurat is never fabricated when required data is missing.
- Marriage, Griha Pravesh, and Naming Ceremony remain readiness-level placeholders until fuller rules are added.

## Safety Wording Rules
- Rahu Kaal, Gulika Kaal, and Yamaganda are framed as planning caution references, not danger.
- Abhijit Muhurta and Brahma Muhurta are supportive references, not guaranteed success.
- No medical, legal, or financial certainty is claimed.
- No fear-based wording is used.

## Dashboard / Report / AI Compatibility
Compatibility is preserved with:
- public Panchang page
- dashboard today guidance
- Daily Rashifal support
- AI context builder
- reports
- future Muhurat tool page
- retention daily return system

## QA Result
Focused QA script passed for:
- general daily activity
- spiritual practice
- business/work start
- travel readiness
- marriage readiness placeholder
- invalid location fallback

## Known Gaps
- Full classical marriage muhurat rules are not implemented in this phase.
- Griha Pravesh and Naming Ceremony remain readiness-level placeholders.
- This is a safe daily timing layer, not a full ceremonial muhurat engine.

## Next Phase
Phase 27.6C - Panchang/Muhurat QA + Production Readiness
