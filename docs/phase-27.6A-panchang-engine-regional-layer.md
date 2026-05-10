# Phase 27.6A - Panchang Engine + Regional Layer

## Files Changed
- `src/modules/panchang/engine.ts`
- `scripts/debug-panchang-qa.ts`
- `package.json`

## Panchang Engine Status
The Panchang engine now returns a stable daily Panchang payload with the existing API contract preserved and a richer reusable layer added on top.

The engine continues to validate required inputs, calculate sunrise/sunset, tithi, nakshatra, yoga, karana, transition windows, and daily guidance using real location and timezone data.

## Supported Panchang Elements
The output now supports:
- `date`
- `weekday / vara`
- `location`
- `timezone`
- `sunrise`
- `sunset`
- `moonrise` when available
- `moonset` when available
- `tithi`
- `nakshatra`
- `yoga`
- `karana`
- `rahuKaal`
- `gulikaKaal`
- `yamaganda`
- `abhijitMuhurat`
- `brahmaMuhurat`
- `dailyTone`
- `recommendedActivities[]`
- `cautionWindows[]`
- `missingReason`

## Regional / Assam Readiness
The engine now carries regional readiness metadata for India and Assam use cases.

It preserves location labels for places such as:
- Guwahati
- North Lakhimpur

It also keeps display-safe regional metadata so Assamese-facing consumers can render location-aware Panchang data without special-case logic.

## Output Structure
The stable output now includes the existing API-facing fields plus reusable aliases:
- `panchangDate`
- `locationLabel`
- `timezone`
- `coordinates`
- `weekday`
- `dailyTone`
- `timingWindows`
- `dailyGuidance`
- `regional`
- `generatedAt`
- `missingReason`

The existing snake_case output remains intact for public API and dashboard compatibility.

## Dashboard / Report / AI Compatibility
Compatibility is preserved with:
- public Panchang page
- dashboard Panchang snapshot
- Daily Rashifal support
- AI context builder
- reports
- retention daily return system
- future Muhurat engine

No UI redesign was introduced.

## Safety / Fallback Behavior
- Missing date returns a safe unavailable state.
- Missing location returns a safe unavailable state.
- Invalid timezone returns a safe unavailable state.
- Invalid coordinates return a safe unavailable state.
- Moonrise and moonset are optional and never fabricated.
- Rahu Kaal, Gulika Kaal, Yamaganda, Abhijit Muhurta, and Brahma Muhurta are framed as planning references, not guarantees.
- No raw internal astronomy dump is exposed in the public surface.
- No private user data is exposed.

## QA Result
Focused QA script:
- Guwahati, Assam, India: ready
- North Lakhimpur, Assam, India: ready
- Invalid timezone: safely unavailable
- Missing location: safely unavailable

## Known Gaps
- Assamese text translation is not a full localization layer in this phase.
- Muhurat-specific intelligence remains a follow-up layer.
- Regional defaults are intentionally conservative; the engine prefers safe failure over guessed location data.

## Next Phase
Phase 27.6B - Muhurat Intelligence + Daily Timing System
