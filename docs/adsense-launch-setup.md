# AdSense Launch Setup

This repo is prepared for AdSense activation but does not include live ad scripts.

## 1) ads.txt Location

- File path: `/public/ads.txt`
- Public URL after deploy: `/ads.txt`

Current file contains a safe placeholder line:

- `google.com, pub-REPLACE_WITH_REAL_PUBLISHER_ID, DIRECT, f08c47fec0942fa0`

Before going live with AdSense, replace `pub-REPLACE_WITH_REAL_PUBLISHER_ID` with the real publisher ID.

## 2) Ad-Ready Placement Zones (No Script Yet)

Prepared UI zones are rendered by:

- `src/components/site/ad-ready-zone.tsx`

Current placements:

- Homepage insights section: `src/app/(marketing)/page.tsx`
- Insights listing support area: `src/app/(marketing)/insights/page.tsx`
- Insight article detail sidebar: `src/app/(marketing)/insights/[slug]/page.tsx`

These zones are layout-safe placeholders for future ad blocks.

## 3) Activation Steps (Manual)

1. Add real AdSense publisher ID in `public/ads.txt`.
2. Deploy and verify `https://<your-domain>/ads.txt` is publicly reachable.
3. Replace selected `AdReadyZone` blocks with your approved ad component.
4. Keep ad placements moderate to preserve readability and trust.
5. Re-run `npm run build` before production deploy.

## 4) Safety Rules

- Do not place ads on protected account-only pages.
- Do not inject ad scripts into payment/auth critical flows.
- Keep content-first structure for approval and user trust.
