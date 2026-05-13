# 31.5B-1B Panchang Compact Utility Cards

Status: implemented, not committed.

## Files changed
- D:/PDS BDS/navagraha-centre/src/app/(marketing)/panchang/page.tsx

## Utility card list
- Daily Panchang
- Monthly Calendar
- Hindu Calendar
- Hora
- Choghadiya
- Rahu Kaal
- Panchak
- Bhadra
- Muhurat
- Festival Calendar
- Lagna Table
- Panchang NI

## Badge behavior
- Daily Panchang shows `Open` and routes to the existing Panchang timing panel anchor.
- Monthly Calendar, Hindu Calendar, Hora, Choghadiya, Rahu Kaal, Panchak, Bhadra, Muhurat, Festival Calendar, and Lagna Table show `Coming Soon`.
- Panchang NI shows `AI Tool` and routes to the existing tools hub.

## Disabled / coming soon behavior
- Coming Soon cards are rendered as safe static cards.
- They do not link to fake or invented pages.
- Only real safe navigation paths remain interactive.

## Panchang NI rule
- Panchang NI remains a sub-tool under NAVAGRAHA AI only.
- No separate public NAVAGRAHA NI section is introduced.

## Responsive notes
- Utility cards are now compact and app-like.
- Mobile layout remains two-column first and scales upward on tablet and desktop.
- Card height, icon size, and CTA sizing were reduced to make the grid easier to scan.

## Next step
- 31.5B-1C Today’s Panchang Safe Mode Card
