# Monetization Readiness (Phase 18.1M)

## Revenue channels
1. Google AdSense (controlled placements, environment-gated).
2. Consultation funnel.
3. Report funnel.
4. Shop + gemstone guidance funnel.
5. NAVAGRAHA AI premium-readiness CTA layer.

## Components added
- `src/components/monetization/AdSenseScript.tsx`
- `src/components/monetization/AdSlot.tsx`
- `src/components/monetization/AdDisclosure.tsx`
- `src/components/monetization/SponsoredDisclosure.tsx`
- `src/components/monetization/TrustNote.tsx`
- `src/components/monetization/ConsultationCTA.tsx`
- `src/components/monetization/ReportCTA.tsx`
- `src/components/monetization/GemstoneGuidanceCTA.tsx`
- `src/components/monetization/PremiumAICTA.tsx`

## Central config
- `src/lib/monetization/monetization-config.ts`

Primary flags:
- `NEXT_PUBLIC_ENABLE_ADSENSE`
- `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID`
- `NEXT_PUBLIC_ADSENSE_DEFAULT_SLOT_ID`
- `NEXT_PUBLIC_ENABLE_MONETIZATION_TRACKING`
- `NEXT_PUBLIC_ENABLE_AD_PLACEHOLDERS`
- `NEXT_PUBLIC_ENABLE_CONSULTATION_CTA`
- `NEXT_PUBLIC_ENABLE_REPORT_CTA`
- `NEXT_PUBLIC_ENABLE_SHOP_CTA`
- `NEXT_PUBLIC_ENABLE_PREMIUM_AI_CTA`
- `NEXT_PUBLIC_ENABLE_AFFILIATE_LINKS`
- `NEXT_PUBLIC_SUPPORTED_CURRENCIES`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`

## Placement strategy
- Blog/article pages:
  - `blog_after_intro`
  - `blog_mid_article`
  - `blog_before_related`
- Rashifal:
  - `rashifal_after_intro`
  - `rashifal_mid_content`
- Panchang:
  - `panchang_after_summary`
- Utility surfaces:
  - `tool_result_bottom`
- Homepage:
  - `homepage_soft_slot`
- Desktop aside:
  - `sidebar_desktop`

Guardrails:
- No ads above hero heading.
- No ad insertion inside form inputs.
- No ad placement in checkout/cart/payment flows.
- No ad placement around core consultation booking CTA.

## CTA strategy
- Consultation CTA: trust-first, calm copy, no urgency pressure.
- Report CTA: category progression, no fake instant guarantee.
- Gemstone CTA: explicitly optional, requires chart analysis.
- Premium AI CTA: readiness layer with "Coming soon" framing.

## Tracking strategy
Revenue events helper:
- `src/lib/analytics/revenue-events.ts`

Tracked monetization events:
- `consultation_cta_click`
- `report_cta_click`
- `shop_cta_click`
- `gemstone_guidance_click`
- `premium_ai_cta_click`
- `adsense_slot_view`
- `article_ad_slot_rendered`
- `report_purchase_start`
- `checkout_start`
- `payment_success`
- `payment_failed`

Payload policy:
- Track only behavioral metadata (`page`, `placement`, `cta`, `locale`).
- Do not track birth details, chart content, or payment secrets.

## AdSense integration steps
1. Enable AdSense account + verify domain ownership.
2. Set `NEXT_PUBLIC_ENABLE_ADSENSE=true`.
3. Set `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID`.
4. Set `NEXT_PUBLIC_ADSENSE_DEFAULT_SLOT_ID` (or extend to slot-specific IDs later).
5. Deploy and verify:
   - script loads once
   - slot renders without layout shift
   - no ads in checkout/auth/private routes

## Remaining limitations
- Slot ID mapping is currently single-default-slot driven; per-placement slot IDs are a follow-up.
- Some legacy CTA copy remains English-first while locale dictionaries are now prepared for monetization keys.
- Contact/about public pages should be verified before AdSense review submission (see legal TODO doc).

