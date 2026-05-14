# 31.5B-3 Panchang Route Safety + Utility Action QA

Status: verified, not committed.

## Files checked
- D:/PDS BDS/navagraha-centre/src/app/(marketing)/panchang/page.tsx
- D:/PDS BDS/navagraha-centre/docs/phase-31.5B-1-live-deployment-verification.md
- D:/PDS BDS/navagraha-centre/docs/phase-31.5B-2-panchang-visual-hierarchy-section-polish.md

## Utility card route status
- Daily Panchang uses the verified in-page `#panchang-tool` anchor and does not point to a fake page.
- Monthly Calendar, Hindu Calendar, Hora, Choghadiya, Rahu Kaal, Panchak, Bhadra, Muhurat, Festival Calendar, and Lagna Table are safely disabled as Coming Soon cards.
- Panchang NI routes only to `/tools`, which is the existing safe NAVAGRAHA AI tools path.
- No fake utility pages were created.

## Continue Guidance route status
- Read Daily Rashifal routes to `/rashifal`.
- Generate Kundli routes to `/kundli`.
- Ask NAVAGRAHA AI routes to `/tools`.
- View Reports routes to `/reports`.
- Consult JYOTISH BHASKAR J P SARMAH routes to `/consultation`.
- Explore Panchang NI routes to `/tools`.
- No private/admin/dashboard route was introduced.

## Disabled / fallback behavior
- Coming Soon cards are non-clickable and visually treated as unavailable.
- Safe fallback messaging remains concise: Coming Soon, Feature preparing, and Verified Panchang data will be published soon.
- No fake Panchang values or sample timings appear.

## Panchang NI rule
- Panchang NI remains a sub-tool under NAVAGRAHA AI only.
- There is no separate public NAVAGRAHA NI section.

## No fake data / page confirmation
- No fake Panchang values were added.
- No fake tithi, nakshatra, yoga, karana, sunrise, sunset, Rahu Kaal, or muhurat values were added.
- No fake route pages or mockup text were introduced.

## Mobile tap QA
- Cards remain compact and tap-friendly.
- Disabled cards are visually clear and do not confuse click targets.
- Hover and focus treatment stays subtle and professional.

## Regression result
- `panchang` route remains stable.
- `/rashifal`, `/kundli`, `/reports`, `/consultation`, and homepage routes remain unaffected.
- NAVAGRAHA AI path remains the existing safe destination for AI-adjacent Panchang routing.

## Final verdict
- Panchang utility actions and fallback states are route-safe and content-safe.

## Next recommended phase
- 31.5B-4 Panchang copy refinement or live-only viewport screenshot pass if needed
