# From the Desk of J P Sarmah - Manual Daily Rashifal Publishing

This guide defines the manual publishing flow for Daily Rashifal entries under `/from-the-desk`.

## 1) Required article fields

Each Daily Rashifal entry in `src/modules/content/catalog.ts` must include:

- `id`
- `title`
- `slug`
- `path` (format: `/from-the-desk/<slug>`)
- `locale` (optional, defaults to `en`)
- `excerpt`
- `description`
- `category` (`"Daily Rashifal"`)
- `type` (`"DAILY_RASHIFAL"`)
- `status` (`"published"` or `"draft"`)
- `tags`
- `keywords`
- `authorName`
- `authorTitle`
- `publishedAt`
- `updatedAt`
- `readingTime`
- `readingTimeMinutes`
- `seoTitle`
- `seoDescription`
- `isFeatured`

## 2) Daily Rashifal block (mandatory structure)

Use `dailyRashifal` with:

- `date` (`YYYY-MM-DD`)
- `zodiacSections` (exactly 12 objects: Aries to Pisces)
- `remedies` (array of short practical remedy notes)
- `brandFooter` (desk identity line)

Each `zodiacSections` object must include:

- `sign`
- `title`
- `overview`
- `love`
- `career`
- `business`
- `luckyColor`
- `luckyNumber`
- `luckyTime`
- `remedy`

## 3) Safe slug format

Use English transliterated slugs for stability and SEO safety:

- `daily-rashifal-26-april-2026`
- `daily-rashifal-27-april-2026`

Avoid script-specific characters in slug values.

If needed, use `toSeoSafeArticleSlug` from `src/modules/content/slug.ts`.

## 4) Assamese Daily Rashifal manual steps

1. Start from the English published entry.
2. Add Assamese localized override in `src/modules/content/localized-catalog.ts`:
   - `locale: "as"`
   - `localizedSlug`: English transliterated slug
   - localized `title`, `excerpt`, `description`, and `sections`.
3. Keep route stable as `/as/from-the-desk/<localizedSlug>`.
4. Keep all 12 zodiac sections complete in the source `dailyRashifal` structure.
5. Set `status: "published"` only after manual editorial review.

## 5) Publication checklist

- Entry appears on `/from-the-desk`.
- Entry opens at `/from-the-desk/<slug>`.
- `Author`, `Published`, and `Updated` details are visible.
- Remedy blocks and lucky indicators render for all signs.
- Related links include relevant tool/consultation/report paths.
- Metadata fields are present and non-empty.
