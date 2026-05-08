# Phase 25.0A - AdSense Readiness Audit + Monetization Architecture

## Scope
This phase audits NAVAGRAHA CENTRE for AdSense readiness and documents a safe monetization architecture without enabling live ad units, adding a publisher ID, or introducing fake ads.txt data.

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
- `src/app/(marketing)/from-the-desk/[slug]/page.tsx`
- `src/app/(marketing)/rashifal/page.tsx`
- `src/app/(marketing)/rashifal/[sign]/page.tsx`
- `src/app/(marketing)/panchang/page.tsx`
- `src/app/(marketing)/numerology/page.tsx`
- `src/app/(marketing)/shop/page.tsx`
- `src/app/(marketing)/consultation/page.tsx`
- `src/app/sitemap.ts`
- `src/app/robots.ts`
- `src/lib/seo/metadata.ts`
- `src/modules/content/components/ad-slot.tsx`

## AdSense Eligibility Readiness
- The site already has a useful original content structure.
- Public blog/content routes exist and are indexable.
- The From the Desk structure exists.
- Daily Rashifal publishing structure exists.
- Public pages are mobile-friendly and use the established white editorial layout.
- Navigation and trust/legal pages exist, which supports AdSense review readiness.
- No fake or auto-generated content was introduced in this phase.

## Policy Page Readiness
Public pages checked:
- Privacy Policy: `/privacy`
- Terms and Conditions: `/terms`
- Contact: `/contact`
- Disclaimer: `/disclaimer`
- About / authority: `/about`

Status:
- All required policy surfaces exist and are publicly accessible.
- The Privacy Policy mentions account, birth-profile, and payment-adjacent handling in a safe, high-level way.
- The Terms page describes account, payment, and service boundaries.
- The Disclaimer page keeps guidance boundaries explicit.
- The About page provides public authority and brand context.
- No false legal or compliance claims were added.

## ads.txt Readiness
- `public/ads.txt` exists and is publicly reachable at `/ads.txt`.
- It intentionally contains guidance only and does not include a fake publisher ID.
- This is the correct state until a real AdSense publisher record is issued.
- Required final line format after approval:
  - `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`
- No real publisher ID was added in this phase.

## Ad Placement Architecture
Safe future ad placements should be limited to public editorial and utility pages with sufficient content density:
- blog/article detail pages
- From the Desk articles
- Daily Rashifal pages
- Panchang pages
- Remedies / Graha / Nakshatra pages

Recommended placement pattern:
- after intro
- mid-article
- before related links
- optional sidebar on desktop only

Avoid placements on:
- dashboard pages
- admin pages
- private AI history pages
- report unlock or premium access pages
- payment/checkout flows
- pages with thin or placeholder content

## Invalid Traffic Prevention Rules
- Do not click your own ads.
- Do not ask friends, family, or staff to click ads.
- Do not place ads too close to critical action buttons.
- Do not test live ads by clicking them.
- Monitor traffic quality after approval.
- Avoid bot, automation, or incentivized traffic sources.

## Cookie / Consent Readiness
- A browser-side monetization configuration exists, but no personalized ads flow was activated in this phase.
- A dedicated consent banner is not implemented here.
- If personalized ads or region-specific consent requirements become necessary, add consent support in a later phase after legal review.

## AdSense Application Checklist
1. Confirm domain connectivity.
2. Confirm Search Console access and sitemap submission.
3. Verify public content pages are available and indexable.
4. Ensure policy pages are live and linked in the footer.
5. Confirm `ads.txt` is reachable at `/ads.txt`.
6. Apply with a real Google account.
7. Add the AdSense site in the Google account.
8. Add the real publisher ID only after account/site setup.
9. Wait for review and approval.
10. Enable ads only after policy and publisher setup is complete.

## Monetization Architecture Notes
- `AdSlot` is already env-gated and returns nothing unless AdSense is explicitly enabled and a real publisher ID exists.
- `AdSenseScript` does not load unless AdSense is enabled with a publisher ID.
- `AdDisclosure` and other trust components are available for future public placements.
- Existing monetization CTAs are isolated from ad network activation.
- Public editorial pages already carry the right content structure for future monetization placement.

## Exact Files to Modify in 25.0B
- `public/ads.txt` for the real Google-provided publisher record
- `src/lib/monetization/monetization-config.ts` for activation flags and slot settings if a real publisher ID is approved
- `src/components/monetization/AdSenseScript.tsx` if activation wiring needs review
- `src/components/monetization/AdSlot.tsx` if placement policy or responsive behavior needs a final pass
- public article and content templates if one or two safe ad slots need to be introduced later

## Launch-Critical vs Post-Approval Ad Work
Launch-critical:
- policy pages
- clean public content
- `ads.txt` readiness
- consent documentation
- site quality and indexing safety

Post-approval:
- real publisher ID
- real ad unit IDs
- selective ad slot activation
- traffic monitoring and placement tuning

## Known Non-Blocking Follow-Ups
- Add a real publisher ID only after AdSense approval.
- Add a consent banner only if the legal/privacy rollout requires it.
- Recheck placement density after public content growth.

## Validation
- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run build`: failed with Windows `EPERM` unlinking `.next/app-path-routes-manifest.json`

## Verdict
The site is AdSense-ready in architecture and policy posture, but live monetization is intentionally not enabled in this phase.

## Next Phase
- Phase 25.0B - AdSense QA + Application Readiness
