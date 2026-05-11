# Phase 31.0C - Homepage Trust Strip + Tools Preview

## Files changed
- `src/app/(marketing)/page.tsx`
- `docs/phase-31.0C-homepage-trust-strip-tools-preview.md`

## Trust strip changes
- Added a slim white trust strip directly below the hero.
- Included the requested trust messages:
  - Trusted Vedic Guidance
  - 12-Planet Calculations
  - Kundli + Dasha + Transit
  - Assamese / English / Hindi Ready
  - Secure & Privacy-Safe
- Kept the presentation compact with black text, gold dots, subtle border, and soft shadow.

## Tools preview changes
- Reworked the homepage utility area into a clearer tools preview.
- Added 12 public tool cards:
  - Free Kundli
  - Daily Rashifal
  - Panchang Today
  - Dasha Timeline
  - Transit / Gochar
  - Matchmaking
  - Dosha & Yoga
  - Numerology
  - Remedies
  - Reports
  - Ask NAVAGRAHA AI
  - Consultation
- Each card stays on a white background with a premium border/shadow treatment, a gold-accent visual, a short description, and a safe CTA.
- Cards fall back to the tools hub where a direct public route is not the right choice.

## Mobile QA
- Trust strip wraps cleanly on small widths.
- Tool cards stack cleanly on mobile.
- CTAs remain tap-friendly.
- The section is designed to avoid horizontal overflow at 360px, 390px, 430px, and 768px.

## Regression notes
- Homepage header and hero from Phase 31.0B remain intact.
- Language switcher behavior was not changed.
- SEO, sitemap, robots, dashboard, admin, and astrology logic were not modified.
- The new section stays within the homepage and uses the existing routing surface.

## Known follow-ups
- The rest of the homepage still uses older visual blocks and will need later harmonization.
- Some preview cards intentionally route to the tools hub as a safe fallback.

## Next phase
- `31.0D Homepage NAVAGRAHA AI + Daily Guidance Blocks`
