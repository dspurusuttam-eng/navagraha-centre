# Google Search Console Setup (NAVAGRAHA CENTRE)

## 1) Add Property

1. Open Google Search Console.
2. Add URL-prefix property: `https://navagrahacentre.com`.

## 2) Verify Ownership

Preferred:
1. DNS TXT verification via domain DNS provider.

Alternative:
1. HTML meta tag verification in Next metadata.
2. Use env var (name only): `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`.

Do not hardcode tokens in source.

## 3) Submit Sitemap

1. Go to **Sitemaps**.
2. Submit: `https://navagrahacentre.com/sitemap.xml`.
3. Confirm successful fetch and indexed URL growth over time.

## 4) Priority URL Inspection (Post Deploy)

Request indexing for:
- `https://navagrahacentre.com/`
- `https://navagrahacentre.com/en/kundli`
- `https://navagrahacentre.com/as/rashifal`
- `https://navagrahacentre.com/hi/rashifal`
- `https://navagrahacentre.com/en/from-the-desk`

## 5) Coverage and Index Health Checks

- Check **Pages** report for:
  - excluded by robots
  - duplicate without user-selected canonical
  - alternate page with proper canonical
- Validate that core public pages are indexed.
- Validate that private/account pages are excluded.

## 6) Hreflang Monitoring

- Validate `en`, `as`, `hi` alternates.
- Confirm no hreflang points to non-existing URLs.
- Fix locale mapping drift if any locale paths are introduced/removed.

## 7) Core Web Vitals Monitoring

- Track mobile CWV first.
- Focus on LCP and CLS on:
  - home
  - rashifal
  - panchang
  - from-the-desk pages

## 8) Ongoing Weekly SEO Ops

1. Publish Daily Rashifal and verify article URL in sitemap.
2. Inspect newly published blog URLs.
3. Watch for sudden increase in excluded/duplicate pages.
4. Revalidate robots/sitemap if route structure changes.
