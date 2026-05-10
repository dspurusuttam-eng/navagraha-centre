# Phase 29.0A - PWA Mobile App Audit + Architecture

## Files inspected

- `src/app/layout.tsx`
- `src/app/icon.svg`
- `src/app/robots.ts`
- `src/app/sitemap.ts`
- `src/components/site/header.tsx`
- `src/components/site/language-switcher.tsx`
- `src/app/(marketing)/tools/page.tsx`
- `src/app/(app)/dashboard/page.tsx`
- `src/modules/localization/config.ts`
- `src/modules/localization/routes.ts`
- `public/favicon.ico`
- `public/apple-touch-icon.png`
- `public/icon-64.png`
- `public/icon-96.png`
- `public/icon-192.png`
- `public/icon-512.png`
- `package.json`

## PWA readiness status

- Manifest: not present yet.
- Service worker: not present yet.
- Offline support: not present yet.
- Installability: not production-ready yet because the manifest and service worker layer are missing.
- App metadata: partially ready through `src/app/layout.tsx` and existing SEO metadata helpers.
- Theme color: already set in `src/app/layout.tsx`.
- Viewport/mobile config: already present in `src/app/layout.tsx`.

## App icon status

- Required icon assets are already present:
  - `apple-touch-icon.png`
  - `favicon.ico`
  - `icon-64.png`
  - `icon-96.png`
  - `icon-192.png`
  - `icon-512.png`
- `src/app/icon.svg` exists as the app icon source.
- Icon coverage is good enough for a manifest phase, but the manifest itself still needs to be added in 29.0B.

## Mobile UX audit

- Header: responsive and mobile-safe. The mobile menu collapses into a details panel with wrapped navigation, and the language switcher is present in both desktop and mobile header flows.
- Language switcher: responsive and compact on mobile, with English recovery visible.
- Tools hub: card grid is responsive and should degrade cleanly from 1 column to wider layouts.
- Dashboard: content is heavily responsive with stacked cards and controlled wrapping.
- Potential risk areas: long labels inside compact language chips and utility cards, but current wrapping and overflow controls reduce the risk.
- Widths reviewed conceptually: 360px, 390px, 430px, 768px. The current component structure is compatible with these widths.

## Safe caching rules

- Safe to cache:
  - public homepage
  - public content pages
  - static assets
  - icons
  - manifest once added
  - public tools pages if they remain anonymous/public
- Do not cache:
  - admin pages
  - dashboard/private data
  - API responses with user data
  - AI history
  - saved Kundli private details
  - reports/private unlock content

## Install architecture recommendation

- `name`: NAVAGRAHA CENTRE
- `short_name`: NAVAGRAHA
- `description`: premium Vedic astrology utilities, chart tools, Panchang, reports, and AI guidance
- `display`: `standalone`
- `start_url`: `/`
- `scope`: `/`
- `orientation`: optional, default to browser behavior unless a future mobile shell needs locking
- `theme_color`: keep aligned with the current warm ivory/gold brand palette
- `background_color`: keep aligned with the current light branded background
- Icons: include at least 192x192 and 512x512, plus Apple touch icon support
- Screenshots: future-ready, optional for the next PWA pass

## Notification readiness

- Push notifications are not implemented yet.
- Future-safe reminder candidates:
  - Daily Rashifal reminder
  - Panchang reminder
  - Saved Kundli daily guidance
  - Consultation reminder
  - Report-ready reminder
- Notification permissions and scheduling should stay opt-in and user-scoped when implemented.

## Exact files to modify in 29.0B

- `src/app/layout.tsx`
- `src/app/manifest.ts` or `src/app/manifest.json`
- `src/app/icon.svg`
- `public/icon-192.png`
- `public/icon-512.png`
- `public/apple-touch-icon.png`
- `next.config.ts` if PWA headers or asset behavior need adjustment
- `src/components/site/header.tsx` only if install CTA or mobile affordance is added
- `src/modules/seo/*` or related metadata helpers if manifest metadata needs centralization

## Known gaps

- No manifest.
- No service worker.
- No offline cache strategy.
- No install prompt handling.
- No notification infrastructure.
- No PWA-specific audit of private-data cache boundaries yet beyond architecture rules.

## Final verdict

- PWA/mobile-app readiness is audited.
- The app is mobile-friendly and icon-ready, but not installable yet in the PWA sense because the manifest and service worker layers are still missing.
- The next implementation step is manifest and install-readiness work in 29.0B.
