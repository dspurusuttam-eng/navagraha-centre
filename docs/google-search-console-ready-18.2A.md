# Google Search Console Ready Checklist (Phase 18.2A)

This checklist is for manual Google Search Console activation after the 18.2A UI/UX polish series. Do not add fake verification tokens or hardcode Google verification IDs in the repository.

## 1. Add Property

1. Open [Google Search Console](https://search.google.com/search-console).
2. Recommended: add a Domain property for `navagrahacentre.com` if DNS TXT access is available.
3. Faster option: add a URL-prefix property for `https://www.navagrahacentre.com`.
4. Keep `https://www.navagrahacentre.com` as the primary operational host for URL Inspection.

## 2. Verify Ownership

Use one of the official verification methods:

1. DNS TXT record for the Domain property.
2. HTML file upload or HTML meta tag for URL-prefix verification.
3. If using a meta tag, wire it through safe configuration such as `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`; do not commit temporary verification IDs.

## 3. Submit Sitemap

Submit:

```text
https://www.navagrahacentre.com/sitemap.xml
```

Expected supporting files:

1. `https://www.navagrahacentre.com/robots.txt`
2. `https://www.navagrahacentre.com/ads.txt`

## 4. Request Indexing For Priority URLs

Use URL Inspection after sitemap submission:

1. `https://www.navagrahacentre.com/`
2. `https://www.navagrahacentre.com/en`
3. `https://www.navagrahacentre.com/en/kundli`
4. `https://www.navagrahacentre.com/en/rashifal`
5. `https://www.navagrahacentre.com/en/panchang`
6. `https://www.navagrahacentre.com/en/numerology`
7. `https://www.navagrahacentre.com/en/ai`
8. `https://www.navagrahacentre.com/en/from-the-desk`

Route notes:

1. `/navagraha-ai` remains a public alias and redirects to `/ai`.
2. `/insights` remains a public alias and redirects to `/from-the-desk`.
3. Use the final canonical URLs in URL Inspection when Google reports a redirect.

## 5. Monitor After 24-72 Hours

Check:

1. Page Indexing report.
2. Sitemap processing status.
3. Mobile usability signals.
4. Core Web Vitals report.
5. hreflang and canonical behavior for `en`, `as`, and `hi`.
6. Coverage for Daily Rashifal and From the Desk article URLs.

## 6. Escalation Rules

Investigate if:

1. Priority URLs are still not crawled after several days.
2. Google selects an unexpected canonical for locale routes.
3. Sitemap processing fails.
4. robots.txt blocks public locale, tool, content, or shop pages.
5. Any page reports `noindex` unexpectedly.
