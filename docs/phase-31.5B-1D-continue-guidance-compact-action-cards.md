# 31.5B-1D Continue Guidance Compact Action Cards

Status: implemented, not committed.

## Files changed
- D:/PDS BDS/navagraha-centre/src/app/(marketing)/panchang/page.tsx

## Action card list
- Read Daily Rashifal
- Generate Kundli
- Ask NAVAGRAHA AI
- View Reports
- Consult JYOTISH BHASKAR J P SARMAH
- Explore Panchang NI

## Route behavior
- Read Daily Rashifal routes to the existing Rashifal route only.
- Generate Kundli routes to the existing Kundli route only.
- Ask NAVAGRAHA AI routes to the existing NAVAGRAHA AI / tools surface only.
- View Reports routes to the existing Reports route only.
- Consult JYOTISH BHASKAR J P SARMAH routes to the existing Consultation route only.
- Explore Panchang NI routes to the existing tools hub as a safe NAVAGRAHA AI sub-tool path.

## Disabled fallback behavior
- No fake Panchang routes were added.
- No invented utility pages were introduced.
- All actions remain route-safe and compact.

## Panchang NI rule
- Panchang NI remains a sub-tool under NAVAGRAHA AI only.
- No separate public NAVAGRAHA NI section is created.

## Responsive notes
- The grid now starts as a single compact column on the narrowest screens and expands to two/three columns as space allows.
- Cards are shorter, icon-first, and more app-like.
- AI-related cards use a subtle blue accent while the rest stay gold-accented.

## Next step
- 31.5B-1E Mobile QA + Final Polish
