# Phase 25.0B - Advanced AdSense QA + Application Readiness

## Scope
This phase verifies that NAVAGRAHA CENTRE is ready to apply for AdSense without enabling live ads, adding fake publisher IDs, or introducing unsafe placements.

## Files Checked
- `public/ads.txt`
- `src/lib/monetization/monetization-config.ts`
- `src/components/monetization/AdSlot.tsx`
- `src/components/monetization/AdSenseScript.tsx`
- `src/components/monetization/AdDisclosure.tsx`
- `src/components/monetization/index.ts`
- `src/app/(marketing)/privacy/page.tsx`
- `src/app/(marketing)/terms/page.tsx`
- `src/app/(marketing)/contact/page.tsx`
- `src/app/(marketing)/about/page.tsx`
- `src/app/(marketing)/disclaimer/page.tsx`
- `src/app/(marketing)/articles/page.tsx`
- `src/app/(marketing)/from-the-desk/page.tsx`
- `src/app/(marketing)/from-the-desk/[slug]/page.tsx`
- `src/app/(marketing)/rashifal/page.tsx`
- `src/app/(marketing)/rashifal/[sign]/page.tsx`
- `src/app/(marketing)/panchang/page.tsx`
- `src/app/(marketing)/kundli/page.tsx`
- `src/app/(marketing)/reports/page.tsx`
- `src/app/(marketing)/consultation/page.tsx`
- `src/app/(marketing)/ai/page.tsx`
- `src/app/sitemap.ts`
- `src/app/robots.ts`
- `src/lib/seo/metadata.ts`

## Public Content Quality QA
- Public content routes exist for the launch-critical surfaces: homepage, articles, From the Desk, Daily Rashifal / Rashifal, Panchang, Remedies, Kundli, Reports, NAVAGRAHA AI, Consultation, Contact, About, Privacy Policy, Terms, and Disclaimer.
- The article listing uses published content only and supports category/tag filtering, author/source display, related links, and safe empty states.
- From the Desk keeps authority-led editorial structure and related links to practical astrology tools.
- Daily Rashifal and Rashifal are public, structured, and support the 12-sign reading pattern without fabricating missing content.
- The Remedies and Monthly Rashifal routes are redirects to canonical content surfaces, which is safe for SEO and avoids duplicate thin content.
- Assamese text and multilingual rendering are supported by the existing localization stack.
- No placeholder-heavy page was introduced as a real public article or horoscope entry.

## Policy Page Readiness
Public policy and trust pages exist and are accessible:
- Privacy Policy: `/privacy`
- Terms and Conditions: `/terms`
- Contact: `/contact`
- Disclaimer: `/disclaimer`
- About / authority: `/about`

Readiness notes:
- The Privacy Policy is structurally ready to mention cookies, analytics, advertising partners, third-party ads, user data handling, and contact methods.
- The Terms page covers account ownership, service scope, and access boundaries.
- The Disclaimer page keeps guidance limits explicit.
- The About page provides public authority context.
- The policy pages do not contain misleading legal claims.

## ads.txt Readiness
- `public/ads.txt` exists and is reachable at `/ads.txt`.
- It intentionally contains guidance only.
- No fake publisher ID was added.
- No real publisher ID was committed because none was provided.
- Required final format after AdSense approval:
  - `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`
- The file is plain text and does not contain HTML wrappers or conflicting seller records.

## Future Ad Placement Plan
Safe future placements should be limited to public editorial and utility pages:
- article detail pages
- From the Desk articles
- Daily Rashifal pages
- Panchang pages
- Remedies / Graha / Nakshatra pages

Placement guidance:
- after introductory content
- mid-article in long-form editorial pages
- before related links
- optional desktop sidebar when the layout supports it

Avoid placements on:
- dashboard pages
- admin pages
- login/signup forms
- payment pages
- report unlock pages
- private reports
- private AI history pages
- consultation booking forms where accidental clicks are likely
- near primary action buttons
- thin or empty pages

## Invalid Traffic Prevention Readiness
- Never click your own ads.
- Never ask friends, family, or staff to click ads.
- Never buy bot traffic.
- Do not place ads too close to buttons.
- Do not test live ads by clicking them.
- Monitor traffic quality after approval.
- Keep ads away from misleading or accidental-click UI patterns.
- Avoid popups and overlays that force ad interaction.

## Cookie / Consent Readiness
- There is no separate consent banner implementation in this phase.
- The site is ready to document consent requirements before any personalized ads expansion.
- If future ad personalization or region-specific consent is required, add consent support in a later phase with legal review.

## AdSense Application Checklist
1. Deploy the latest site.
2. Verify the live domain loads.
3. Confirm Google Search Console setup and sitemap submission.
4. Confirm the sitemap is public and valid.
5. Confirm robots does not block public content.
6. Ensure Privacy, Terms, Contact, and Disclaimer are public and linked.
7. Publish enough original useful content.
8. Remove or noindex thin placeholder pages if any exist.
9. Check mobile layout and usability.
10. Confirm major routes load without errors.
11. Create and use one correct AdSense account.
12. Add the site in AdSense.
13. Add the real publisher ID and ads.txt record only after AdSense provides them.
14. Wait for review.
15. Do not click your own ads after approval.

## AdSense Safety Smoke Check
- No live ad script with a fake client ID was added.
- No fake ads.txt publisher ID was added.
- No dashboard/admin/private ad placements were introduced.
- No layout was added that encourages accidental clicks.
- No “click ads to support us” language was introduced.
- No misleading ad/content blending was added.
- No unsafe popups were introduced.
- No empty content route was added to the sitemap as if it were real content.

## Manual Steps After Deployment
1. Verify the live domain is stable.
2. Submit the sitemap in Google Search Console.
3. Confirm robots and canonical URLs are correct on production.
4. Confirm policy pages are visible from the footer.
5. Request indexing for the primary public content pages.
6. Apply for AdSense using a real Google account.
7. Add the real publisher ID to `ads.txt` only after approval.
8. Activate real ad units only after publisher/site setup is complete.

## Known Non-Blocking Follow-Ups
- Add a real publisher ID only after AdSense approval.
- Add a consent banner only if the final privacy/legal rollout requires it.
- Re-evaluate ad density after content volume grows.

## Validation
- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run build`: failed with Windows `EPERM` unlinking `.next/app-path-routes-manifest.json`

## Verdict
NAVAGRAHA CENTRE is ready to apply for AdSense from a technical and policy-preparation perspective, but live monetization remains intentionally disabled in this phase.

## Next Phase
- Phase 24/25 Deployment + GSC Activation + AdSense Application Preparation
