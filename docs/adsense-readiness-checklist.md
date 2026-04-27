# AdSense Readiness Checklist

## Account + domain
- [ ] AdSense account approved.
- [ ] Domain ownership verified for `navagrahacentre.com`.
- [ ] Google Search Console property verified.
- [ ] `sitemap.xml` submitted in Search Console.

## Environment variables
- [ ] `NEXT_PUBLIC_ENABLE_ADSENSE=true` (production only).
- [ ] `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` configured.
- [ ] `NEXT_PUBLIC_ADSENSE_DEFAULT_SLOT_ID` configured.
- [ ] `NEXT_PUBLIC_ENABLE_AD_PLACEHOLDERS=true` (recommended fallback).

## Policy-safe page rules
- [ ] No ads on auth routes.
- [ ] No ads on dashboard/private account routes.
- [ ] No ads on cart/checkout/payment routes.
- [ ] No ad labels that imply required clicks.
- [ ] No ad placement inside forms/results where it can confuse user intent.
- [ ] No excessive ad density on article pages.

## Content quality
- [ ] Blog/article pages show useful non-thin content.
- [ ] Daily Rashifal pages keep structured, readable content.
- [ ] Author attribution remains visible on content pages.
- [ ] Privacy, terms, and refund policy are publicly accessible.

## Technical checks
- [ ] Ad script loads once.
- [ ] Slots reserve space to reduce CLS.
- [ ] Mobile layout remains readable after ad rendering.
- [ ] Ad slot fallback does not break page rendering when env vars are missing.

## Final pre-submit
- [ ] Crawl key routes manually (`/`, `/from-the-desk`, `/rashifal`, `/panchang`, `/tools`).
- [ ] Validate no accidental ad injection in restricted routes.
- [ ] Re-run `npm run lint`, `npm run typecheck`, `npm run build`.

