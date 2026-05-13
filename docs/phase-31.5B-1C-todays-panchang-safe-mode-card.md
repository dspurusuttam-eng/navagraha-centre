# 31.5B-1C Today’s Panchang Safe Mode Card

Status: implemented, not committed.

## Files changed
- D:/PDS BDS/navagraha-centre/src/app/(marketing)/panchang/page.tsx

## Safe mode behavior
- The Today’s Panchang section now renders as a single compact safe-mode card.
- The card shows the title, a Safe Mode badge, and the verified-data placeholder message only.
- Optional navigation is omitted because no additional verified Panchang data route is exposed here.

## Data / no-data behavior
- No fake Panchang values were added.
- No sample times were added.
- No raw JSON or internal API output is shown.
- If verified Panchang data is available later, the safe-mode shell can be replaced without changing the surrounding layout.

## No fake data confirmation
- The section uses only the safe fallback message: `Verified Panchang data will be published soon.`
- No tithi, nakshatra, yoga, karana, sunrise, sunset, Rahu Kaal, or muhurat placeholders were fabricated.

## Responsive notes
- Card height is compact and mobile-friendly.
- Gold accent, white background, and short copy keep the section readable on narrow screens.
- The safe-mode card remains in the normal page flow and should not introduce horizontal overflow.

## Next step
- 31.5B-1D Continue Guidance Compact Action Cards
