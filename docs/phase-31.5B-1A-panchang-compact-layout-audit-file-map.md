# 31.5B-1A Panchang Compact Utility Layout Audit & File Map

Status: audit only, no source UI changes.

## Files inspected
- D:/PDS BDS/navagraha-centre/src/app/(marketing)/panchang/page.tsx
- D:/PDS BDS/navagraha-centre/src/modules/panchang/components/panchang-tool-panel.tsx
- D:/PDS BDS/navagraha-centre/src/components/site/page-hero.tsx
- D:/PDS BDS/navagraha-centre/src/components/ui/section.tsx
- D:/PDS BDS/navagraha-centre/src/components/ui/card.tsx
- D:/PDS BDS/navagraha-centre/src/components/ui/badge.tsx
- D:/PDS BDS/navagraha-centre/src/components/ui/button.tsx
- D:/PDS BDS/navagraha-centre/src/components/analytics/tracked-link.tsx

## Exact files to edit next
- D:/PDS BDS/navagraha-centre/src/app/(marketing)/panchang/page.tsx

## Current layout problems
- Panchang utility cards are still visually tall for a mobile-app-like scan.
- The utility card descriptions are a little text-heavy for small screens.
- The page still includes a broken encoding string in the Today’s Panchang section label in source: `Todayâ€™s Panchang`.
- Section backgrounds still lean into soft gradient treatment instead of a fully flat white app-style rail feel.
- The current card defaults use broad minimum heights, which can make the grid feel heavier than the app-like pattern we want next.
- The current Daily Panchang content shell is safe, but it is verbose and can be tightened later.
- The current guidance cards are route-safe, but the row can be condensed for faster mobile scanning.

## Approved utility card list
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

## Badge system plan
- Available / Open for live or existing route-safe actions.
- Coming Soon only for future or unavailable utilities.
- AI Tool only for NAVAGRAHA AI sub-tools.
- Keep badges short, single-line, and readable on mobile.

## Safe mode rules
- No fake Panchang values.
- No sample times.
- No raw JSON.
- No API error strings exposed publicly.
- Any unavailable Panchang detail should remain a safe fallback state.

## Panchang NI rule
- Panchang NI stays a sub-tool under NAVAGRAHA AI only.
- Do not create a separate public NAVAGRAHA NI section.
- Panchang NI should continue routing into the tools hub, not a fake standalone Panchang subdomain.

## Next step
- 31.5B-1B Compact Panchang Utility Cards
