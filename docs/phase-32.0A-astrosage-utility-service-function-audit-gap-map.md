# 32.0A AstroSage Utility / Service / Function Audit + NAVAGRAHA Gap Map

Status: audit and roadmap only, no source changes.

## Audit basis
- Current route inventory in `src/app/(marketing)`.
- Current utility catalog in `src/modules/astrology/utilities`.
- Current public page composition and existing docs.
- Note: the requested `docs/project-memory/*` files were not present in this checkout, so this audit uses the live repo sources and docs that are available here.

## AstroSage-style utility categories

| Category | What users expect | NAVAGRAHA coverage today | Status |
| --- | --- | --- | --- |
| Kundli / birth chart | Birth chart, divisional context, saved chart journey, chart-aware next steps | `/kundli`, `/free-kundli-online`, dashboard Kundli, saved Kundli, reports, AI follow-up | Strong |
| Horoscope / Rashifal | Daily, monthly, yearly sign guidance and reading depth | `/rashifal`, `/daily-rashifal`, `/monthly-rashifal`, `/daily-horoscope`, `/love-horoscope`, `/career-prediction`, insights routes | Strong |
| Panchang / calendar / muhurat | Daily timing, tithi, nakshatra, yoga, karana, Rahu Kaal, muhurat | `/panchang`, `/muhurta`, compact Panchang utilities, daily safe mode shell | Strong |
| Matchmaking | Compatibility, Guna Milan, relationship guidance | `/matchmaking`, `/compatibility`, `/compatibility-hub`, `/marriage-compatibility` | Strong / partial |
| Reports | Premium report depth, packages, preview, consultation follow-up | `/reports`, report subpages, premium generation APIs | Strong |
| AI astrologer / consultation | AI help plus human-guided escalation | `/ai`, `/navagraha-ai`, `/consultation`, consultation docs and page | Strong |
| Numerology | Core numbers, supporting interpretations | `/numerology` | Strong |
| Gemstone / remedies | Optional support pathways, product-linked remedies | `/remedies`, remedies insights, shop support surface | Partial |
| Dosha / yoga | Dosha detection and yoga interpretation | Tools hub, report layers, internal astrology engines | Partial |
| Transit / Gochar | Personal transit and movement-aware timing | Internal astrology modules, dashboard flow, tools hub references | Partial |
| Dasha | Mahadasha and sub-cycle guidance | Internal dasha engine, dashboard/chart continuity | Partial |
| Vastu | Space/direction guidance | NI roadmap only | Weak / missing |
| Palmistry / face reading | Hand/face interpretation surfaces | NI roadmap only | Weak / missing |
| Festivals / spiritual calendar | Festival calendar and holiday-aware planning | Panchang context only, no dedicated public module | Weak |
| Calculators | Fast utility calculators and quick checks | `/calculators`, related quick tools | Partial |
| Multilingual content | Clear Assamese / Hindi / English access and SEO-safe routes | Locale routing, hreflang, language switcher, localized paths | Strong |
| Mobile/app-like engagement | Compact rails, quick actions, fixed bottom actions, utility cards | Homepage rails, bottom action bar, compact Panchang tools, tools hub filters | Strong |

## NAVAGRAHA current coverage

### Strong utilities
- Kundli and saved Kundli journey.
- Rashifal and daily guidance journey.
- Panchang and Muhurat surfaces.
- Reports and report generation.
- Consultation and human escalation.
- AI entry points.
- Numerology.
- Multilingual routing and SEO-safe locale paths.
- Mobile-first quick actions and utility rails.

### Partially implemented utilities
- Matchmaking and compatibility depth.
- Dasha and transit public-facing surfaces.
- Remedies and gemstone support pathways.
- Dosha and yoga interpretation surfaces.
- Calculators breadth.
- Festival and spiritual calendar depth.

### Coming soon / roadmap placeholders
- NAVAGRAHA Intelligence sub-tools in the tools hub.
- Panchang NI, Dasha NI, Transit NI, Remedy NI, Numerology NI, Career NI, Finance NI, Marriage NI, Business NI, Vastu NI, Palmistry NI, Face Reading NI.

### Missing or weak utility surfaces
- Dedicated Vastu public utility.
- Dedicated Palmistry public utility.
- Dedicated Face Reading public utility.
- Festival calendar as a first-class public utility.
- A clearer public calculators hub beyond current quick checks.

## Gap map

| Area | Current state | Gap | Priority class |
| --- | --- | --- | --- |
| Dasha public surface | Internal engine exists, public surface is indirect | No clear lightweight public Dasha entry | Launch-critical |
| Transit public surface | Internal engine exists, public surface is indirect | No dedicated public Transit utility | Launch-critical |
| Matchmaking flow | Exists, but still narrower than major market expectation | Needs clearer public discovery and progression | High-retention |
| Panchang calendar breadth | Strong daily surface, limited calendar depth | Monthly/calendar/festival views are still thin | High-retention |
| Reports packaging | Strong backbone, several routes already exist | Needs clearer package hierarchy and cross-links | High-monetization |
| Consultation funnel | Strong route exists, but conversion depth can be improved | Needs more compact entry and guidance rails | High-monetization |
| Remedies and gemstone support | Route exists, support story is present | Dedicated product/service depth is still limited | High-monetization |
| Festival / spiritual calendar | Weak or missing | No first-class calendar surface yet | SEO-content opportunity |
| Vastu | Missing | No public Vastu utility yet | Later expansion |
| Palmistry / face reading | Missing | No public palmistry or face reading utility yet | Later expansion |
| Calculators hub | Partial | Missing more discoverable quick calculations | SEO-content opportunity |
| NI roadmap | Placeholders exist | Needs phased delivery order and launch gating | Later expansion |

## Recommended next phases
1. 32.0B Priority Utility Implementation Plan.
2. 32.1A Public Dasha and Transit discovery layer.
3. 32.2A Matchmaking and compatibility flow depth.
4. 32.3A Reports and consultation conversion refinement.
5. 32.4A Panchang/calendar/festival content expansion.
6. 32.5A Learning and From the Desk SEO expansion.
7. 32.6A NI roadmap scaffold for Vastu, Palmistry, and Face Reading.

## What not to build now
- Do not add fake astrology tools.
- Do not create a separate public NAVAGRAHA NI section.
- Do not redesign the whole site.
- Do not duplicate route trees that already exist.
- Do not ship placeholder tools as live features.
- Do not loosen content safety rules for Panchang, Rashifal, or reports.

## Next phase
- 32.0B Priority Utility Implementation Plan
