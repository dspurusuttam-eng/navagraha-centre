# Phase 31.0D - Homepage NAVAGRAHA AI + Daily Guidance Blocks

## Files changed
- `src/app/(marketing)/page.tsx`
- `docs/phase-31.0D-homepage-ai-daily-guidance-blocks.md`

## NAVAGRAHA AI block changes
- Replaced the previous dark AI section with a pure-white premium split layout.
- Kept the section focused on context-led guidance, not fabricated chat output.
- Added the requested context chips:
  - Kundli Context
  - Dasha
  - Transit
  - Panchang
  - Remedies
- Added the requested CTAs:
  - Start AI Guidance
  - Generate Kundli First
- Added a safe preview card that communicates guidance layers without exposing raw prompts or fake dialogue.

## Daily guidance block changes
- Added a new daily-return section directly below the AI block.
- Included the requested cards:
  - Today’s Rashifal
  - Panchang Today
  - Daily Remedy
  - Current Transit
- Each card uses a white surface, subtle shadow/border treatment, gold-accented icon styling, a short practical description, and a safe CTA.
- Routes are real and existing; no fake daily content was added.

## Visual direction applied
- Pure white `#FFFFFF` page treatment for the new sections.
- Black/charcoal typography.
- Controlled gold accents.
- Premium, calm, future-expandable card layouts.
- No dark/cosmic background in the new sections.

## Mobile QA
- The new AI and daily guidance layouts are built with responsive grids and stacked CTA behavior.
- Local rendering confirmed the AI block and daily guidance text are present and the section is structurally stable.
- The design is intended to remain usable at 360px, 390px, 430px, and 768px without horizontal overflow.

## Regression notes
- Homepage header, hero, trust strip, and tools preview remain intact.
- Language switcher behavior was not changed.
- SEO, sitemap, robots, dashboard, admin, payment, and astrology logic were not changed.
- The AI route is still the existing `/ai` route; the block only links to it.

## Known follow-ups
- The remaining lower homepage sections still reflect the older visual system and will need harmonization in later microphases.
- This section is intentionally preview-oriented and does not try to show fake AI conversation or live planetary data.

## Next phase
- `31.0E Homepage Reports + Consultation + From the Desk Blocks`
