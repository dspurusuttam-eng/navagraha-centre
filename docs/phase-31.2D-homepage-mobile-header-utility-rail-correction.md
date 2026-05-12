# Phase 31.2D - Homepage Mobile Header + Utility Rail Correction

## Files changed
- `src/app/(marketing)/page.tsx`
- `src/app/(marketing)/layout.tsx`
- `src/components/homepage/homepage-mobile-rails.tsx`
- `src/components/site/header.tsx`
- `src/components/site/mobile-bottom-action-bar.tsx`

## Header order fix
- The mobile header now appears before any trust chips or other pre-header content.
- The mobile header includes the NAVAGRAHA identity/logo area, Ask AI button, language control, and menu button in the visible header row.
- The pre-header trust chip row is now desktop-only so it does not appear above the real mobile header.

## Floating CTA removal result
- The mobile floating `Consult J P Sarmah` bar was removed from the homepage.
- This removes the content-blocking obstruction that overlapped mobile reading flow.

## Static consultation card result
- A static premium consultation card was added inside the homepage content.
- It uses a cosmic-blue visual treatment and sits in flow rather than floating over the page.
- The CTA links safely to `/consultation`.

## Bottom action bar visibility result
- The mobile bottom action bar remains in place with `Home`, `Ask AI`, `Kundli`, and `Consult`.
- Icon and label contrast were tightened so the bar reads more clearly on mobile.
- Page bottom padding was increased so content is less likely to sit under the fixed bar.

## Quick Access compact grid result
- `Quick Astrology Access` now renders as a compact icon grid rather than tall cards.
- Mobile uses a 4-column app-like grid.
- Labels are shorter and clearer: `Kundli`, `Milan`, `Rashifal`, `Panchang`, `Reports`, `Consult`, `Remedies`, `Shop`.

## Typography correction result
- Utility and service rail typography was simplified for faster scanning.
- Small labels now use stronger sans-serif styling with less tracking.
- The homepage remains premium, but the mobile utility sections are less decorative and easier to read.

## Mobile QA result
- Verified against the current local production server and the target widths 360px, 390px, 430px, and 768px.
- The consultation card appears ahead of the quick-access rail.
- The trust chips no longer appear above the real mobile header.
- The quick-access grid is compact and route-safe.
- The bottom bar remains present and the page padding keeps content clear of it.

## Regression result
- Homepage, `/tools`, `/kundli`, `/rashifal`, `/panchang`, `/reports`, `/consultation`, `/shop`, `/from-the-desk`, sitemap, robots, and language switching remain intact.
- Dashboard and admin surfaces were not changed.

## Next phase
- `31.3C Kundli Page Final Mobile QA + Production Polish`
