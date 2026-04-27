# AdSense Post-Launch Readiness (Phase 18.2)

This is a post-launch readiness checklist.  
Do not inject real ad code unless environment configuration is approved.

## 1. Account and Property Setup

1. Create/confirm Google AdSense account ownership.
2. Add website property: `https://www.navagrahacentre.com`.
3. Complete site ownership verification in AdSense.

## 2. Content and Policy Readiness

1. Ensure site has enough useful, original public content.
2. Confirm trust/legal pages are accessible:
   - Privacy
   - Terms
   - Contact
3. Confirm blog and service pages are indexable and not thin placeholders.
4. Confirm no policy-violating click encouragement text.

## 3. SEO Baseline Before AdSense Review

1. Sitemap submitted in Google Search Console.
2. `robots.txt` and `sitemap.xml` accessible.
3. Key public pages return `200`.
4. No accidental noindex on main monetizable pages.

## 4. Environment Flags for Controlled Rollout

Required env variables:

1. `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID`
2. `NEXT_PUBLIC_ENABLE_ADSENSE`

Optional operational flags:

1. `NEXT_PUBLIC_ADSENSE_DEFAULT_SLOT_ID`
2. `NEXT_PUBLIC_ENABLE_AD_PLACEHOLDERS`

Activation safety:

1. Keep AdSense disabled until a real `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` is available.
2. Do not ship fake/test publisher identifiers in production.

## 5. ads.txt Handling

1. Keep `public/ads.txt` placeholder comments until publisher onboarding is complete.
2. Replace placeholder publisher line only with the real Google AdSense publisher ID.
3. Do not publish guessed or temporary publisher IDs.

## 6. Placement Safety Rules

1. Keep ad density moderate.
2. Do not place ads above critical headings in a deceptive way.
3. Do not place ads in checkout/payment-sensitive flows.
4. Keep forms and result cards readable.
5. Do not ask users to click ads.
6. Follow Google Publisher Policies for ad behavior and placement.

## 7. Post-Enable Verification

1. Enable AdSense only after approval.
2. Verify script loads once.
3. Verify no layout shift or broken mobile cards.
4. Verify analytics/tracking does not capture sensitive personal astrology details.
5. Confirm the site has enough original, useful public content before AdSense review.
