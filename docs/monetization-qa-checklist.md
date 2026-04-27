# Monetization QA Checklist

## Config + environment
- [ ] App boots with monetization env vars missing (no crash).
- [ ] `NEXT_PUBLIC_ENABLE_ADSENSE=false` shows placeholders only (or hides slots if disabled).
- [ ] `NEXT_PUBLIC_ENABLE_MONETIZATION_TRACKING=false` disables revenue-event emission.

## Ad slot behavior
- [ ] Blog page ad placements render with stable spacing.
- [ ] Rashifal ad placements render after intro and mid-content.
- [ ] Panchang ad placement renders after summary/tool context.
- [ ] Homepage soft slot is below hero and non-intrusive.
- [ ] No ads appear in checkout/cart or private routes.

## CTA behavior
- [ ] Consultation CTA works on Kundli/Rashifal/Panchang/Numerology/Reports/SEO tool pages.
- [ ] Report CTA links to `/reports`.
- [ ] Gemstone guidance CTA links to consultation + shop.
- [ ] Premium AI CTA shows a non-aggressive coming-soon state.

## Tracking behavior
- [ ] `consultation_cta_click` event emitted on consultation CTA click.
- [ ] `report_cta_click` event emitted on report CTA click.
- [ ] `shop_cta_click` and `gemstone_guidance_click` emitted from gemstone CTA.
- [ ] `adsense_slot_view` / `article_ad_slot_rendered` emitted from ad slots.
- [ ] Events contain only safe metadata (no personal chart/birth payloads).

## UX + trust
- [ ] CTA cards use calm premium copy (no fear/urgency pressure).
- [ ] Sponsored/ad disclosures are visible but unobtrusive.
- [ ] Mobile spacing remains clean around ads and monetization cards.

## Build validation
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run build`

