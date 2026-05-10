# Phase 29.0B - Manifest / App Icons / Install Readiness

## Files changed

- `src/app/layout.tsx`
- `src/app/manifest.ts`

## Manifest status

- A web app manifest is now present at `manifest.webmanifest`.
- Manifest fields configured:
  - `name`: NAVAGRAHA CENTRE
  - `short_name`: NAVAGRAHA
  - `description`: AI-powered Vedic astrology, Kundli, Rashifal, Panchang, reports and guidance
  - `start_url`: `/`
  - `scope`: `/`
  - `display`: `standalone`
  - `background_color`: `#FFFFFF`
  - `theme_color`: `#fffdf8`
  - `orientation`: `portrait-primary`
  - `lang`: `en`

## Icon status

- Existing public icon assets are reused:
  - `public/icon-192.png`
  - `public/icon-512.png`
  - `public/apple-touch-icon.png`
  - `public/favicon.ico`
- No new icon files were invented.
- Maskable icon support is not yet added because no dedicated maskable asset exists in the repo.

## Metadata connection

- Root metadata now references the manifest from `src/app/layout.tsx`.
- Existing favicon and Apple touch icon metadata remain intact.
- Theme color remains aligned with the current brand palette.

## Install readiness

- Installability is now structurally ready:
  - manifest route exists
  - icon references resolve to existing assets
  - start URL and scope are rooted at `/`
  - standalone display mode is configured
- This phase does not add service-worker/offline caching behavior.

## Private cache safety

- No service worker cache rules were added.
- No dashboard, admin, API, AI history, saved Kundli, or private report caching changes were introduced.
- Private-data caching remains out of scope until a dedicated offline/cache phase.

## Missing asset follow-ups

- Add a dedicated maskable icon asset if the design system wants explicit maskable coverage.
- Add a service worker and safe public-only cache strategy in a later phase.
- Add optional install prompt UX only after manifest verification is stable.

## Final verdict

- PWA install readiness is implemented at the manifest and icon metadata layer.
- Safe install support is now available without touching private caching or offline logic.
- Next phase: `29.0C Mobile UX + PWA QA + Production Readiness`.
