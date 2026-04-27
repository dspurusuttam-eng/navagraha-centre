# Google Search Console Post-Launch Activation (Phase 18.2)

This checklist is for manual activation only.  
Do not add fake verification tokens in code.

## 1. Open Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console).
2. Sign in with the Google account that will manage NAVAGRAHA CENTRE indexing.

## 2. Add Property

1. Preferred: add **Domain property** `navagrahacentre.com` (DNS verification).
2. Fast operational fallback: add **URL-prefix property** `https://www.navagrahacentre.com`.
3. Keep `https://www.navagrahacentre.com` as the primary canonical host in checks.

## 3. Verify Ownership

Use one of:

1. DNS TXT record at domain provider.
2. HTML meta verification tag in site head (only if managed safely through env/config).

Do not hardcode temporary verification values in repository files.

## 4. Submit Sitemap

1. Open **Sitemaps** in GSC.
2. Submit:
   - `https://www.navagrahacentre.com/sitemap.xml`

## 5. Request Indexing for Priority URLs

Use URL Inspection and request indexing for:

1. `https://www.navagrahacentre.com/`
2. `https://www.navagrahacentre.com/en/kundli`
3. `https://www.navagrahacentre.com/as/rashifal`
4. `https://www.navagrahacentre.com/hi/rashifal`
5. `https://www.navagrahacentre.com/en/from-the-desk`

Route naming note:

1. Blog canonical route is `/from-the-desk`.
2. `/insights` and locale variants currently resolve to `/from-the-desk` equivalents.
3. Request indexing using final canonical URLs.

## 6. Monitor Initial Indexing (24-72 Hours)

Check:

1. **Page indexing** report for crawled/indexed trend.
2. **Sitemaps** report for accepted/processed URLs.
3. **Enhancements** for structured data warnings (if any).

## 7. Post-Submission Quality Checks

1. Mobile usability report.
2. Core Web Vitals report.
3. hreflang signals across `en`, `as`, `hi`.
4. Coverage for blog and Daily Rashifal URLs.

## 8. Escalation Rules

Escalate if:

1. Priority URLs stay **Discovered - currently not indexed** beyond 7 days.
2. Large canonical mismatch trend appears for locale URLs.
3. Sitemap processing fails repeatedly.
