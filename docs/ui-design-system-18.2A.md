# UI Design System Lock (Phase 18.2A)

Scope: shared visual system only.  
Out of scope: page-by-page redesign, backend logic, astrology engine changes.

## 1. Final Visual Direction

1. Backgrounds: white, ivory, pearl, warm cream.
2. Text: charcoal/black primary, warm gray secondary.
3. Accent: antique gold, champagne, muted saffron.
4. Tone: premium editorial astrology with restrained sacred geometry.
5. Avoid: dark blue identity, neon glow, black cosmic panels, clutter.

## 2. Core Tokens

Primary aliases (from `src/styles/tokens.css`):

1. `--color-bg-ivory`, `--color-bg-white`, `--color-bg-pearl`
2. `--color-surface-cream`, `--color-surface-white`
3. `--color-text-primary`, `--color-text-secondary`
4. `--color-border-soft`
5. `--color-accent-gold`, `--color-accent-gold-dark`, `--color-accent-champagne`

Layout/spacing:

1. `--space-section-y-mobile`, `--space-section-y-desktop`
2. `--space-card-padding`, `--space-card-padding-lg`
3. `--space-grid-gap`, `--space-hero-gap`, `--space-cta-gap`

Radius/shadow:

1. `--radius-card`
2. `--shadow-card-soft`
3. `--shadow-card-hover`

## 3. Typography Rules

1. Display/headline: `--font-family-display`, use `.type-display` / `.card-heading`.
2. Body/UI: `--font-family-ui`, use `.type-body`.
3. Section labels/meta: uppercase tracked labels via `.section-label`.
4. Keep metadata smaller, warmer, and readable via `.meta-text`.

## 4. Shared Component Hierarchy

Buttons:

1. Primary: gold gradient fill (`tone="accent"`).
2. Secondary: white/ivory filled with soft gold border (`tone="secondary"`).
3. Tertiary: light neutral action (`tone="tertiary"`).
4. Buttons now allow safe text wrapping by default for multilingual labels.

Cards:

1. Shared card radius uses `--radius-card`.
2. Shared card depth uses `--shadow-card-soft`.
3. Hover interactions stay subtle (`--shadow-card-hover`).

Badges:

1. Unified label typography via `.section-label`.
2. Accent tone uses deeper gold text for clarity.

Forms:

1. Inputs/select/textarea use shared field tokens and warm ring offsets.
2. Keep borders soft and focus states clear.

## 5. Section Category Rules

Category surface classes are defined in `src/app/globals.css`:

1. `.section-category-utilities`
2. `.section-category-ai`
3. `.section-category-services`
4. `.section-category-content`

`Section` component supports `category` prop:

1. `utilities`
2. `ai`
3. `services`
4. `content`

## 6. Reusable Surface Classes

1. `.tool-card` for utility/tool cards.
2. `.cta-block` for premium CTA containers.
3. `.trust-strip-item` for trust/disclosure strips.

## 7. What To Avoid

1. Dark section defaults for public marketing surfaces.
2. Blue/neon glow effects.
3. Heavy black shadows.
4. Low contrast gray text.
5. Ad-hoc one-off button/card styles when shared primitives exist.

## 8. Mobile Base Rules

1. No horizontal overflow from shared wrappers/components.
2. Button labels may wrap for long Assamese/Hindi text.
3. Card content should stack naturally.
4. Inputs/selects/textarea maintain readable sizes and focus states.
5. Language switcher labels should remain functional without layout breaks.

## 9. Implementation Notes

1. This phase locks shared styles only.
2. Page-level visual polish should consume these tokens and primitives in later phases.

## 10. Navigation IA

Header architecture separates discovery by intent:

1. Primary: Kundli, Rashifal, Panchang, NAVAGRAHA AI, Reports, Consultation.
2. Utilities: Tools Hub, Numerology, Calculators, Muhurta / Time Tools, Compatibility.
3. Content: From the Desk, Insights, Daily Rashifal, Monthly Forecast where available, Remedies / Guidance.
4. Commerce: Shop stays visible as a compact standalone destination.
5. Account: Account / Sign in stays separate from public discovery.
6. Primary CTA: Generate Kundli remains the strongest action.

Rules:

1. Do not mix utilities, services, content, and commerce randomly in the same group.
2. Keep NAVAGRAHA AI visible as a product differentiator, not buried under tools.
3. Use locale-aware route helpers for all public links.
4. Do not expose protected dashboard routes as public nav destinations unless they are expected account entry points.
5. Hide planned routes until real pages exist.
6. Active states should be subtle: gold-accented surface, readable charcoal text, no neon or heavy glow.

## 11. Footer IA

Footer architecture is organized into these groups:

1. NAVAGRAHA CENTRE brand statement and trust line.
2. Core Utilities: Kundli, Rashifal, Panchang, Numerology, Calculators, Muhurta / Time Tools, Compatibility.
3. NAVAGRAHA AI: NAVAGRAHA AI, Ask My Chart entry, Kundli AI, Numerology AI.
4. Services: Reports, Consultation, Pricing where available, Shop.
5. Content: From the Desk, Insights, Daily Rashifal, Monthly Forecast, Remedies / Guidance.
6. Trust / Legal: About, Contact, Privacy Policy, Terms, Refund Policy, Disclaimer.
7. Languages: compact language selector with non-breaking planned-language behavior.

Rules:

1. Footer links must point only to existing public routes or safe public hubs.
2. Legal and trust links stay grouped away from conversion and utility links.
3. The footer should remain premium, calm, readable, and uncluttered.
4. Do not add shipping/support links until those routes exist.

## 12. Mobile Navigation Rules

Mobile menu order:

1. Primary.
2. Utilities.
3. NAVAGRAHA AI.
4. Services.
5. Content.
6. Shop.
7. Language, Account, and secondary CTAs.

Rules:

1. Menu panels must fit within the viewport and scroll internally if needed.
2. Long Assamese/Hindi labels must wrap without horizontal scrolling.
3. Buttons and links need visible focus states.
4. Keep the first mobile CTA focused on Kundli generation.
5. Do not create popovers that overlap the phone status/top safe area.

## 13. Homepage Section Order

Homepage recomposition follows this public platform order:

1. Hero.
2. Trust Strip.
3. Core Astrology Utilities.
4. NAVAGRAHA AI Flagship.
5. Predictive Intelligence Core.
6. Daily Astrology Dashboard.
7. Premium Reports.
8. Consultation.
9. From the Desk / Insights.
10. Shop Preview.
11. FAQ.
12. Final CTA.

Rules:

1. Utilities contain free practical tools only: Kundli, Rashifal, Panchang, Numerology, Calculators, Muhurta / Time Tools, Compatibility.
2. NAVAGRAHA AI is treated as the flagship interpretation layer, separate from free utilities and premium services.
3. Predictive Intelligence should explain Dasha, transit, rule, and synthesis capabilities in user-friendly language without exaggerated certainty.
4. Reports and consultation are service sections, not utility cards.
5. Content belongs under From the Desk / Insights and should support authority, SEO, and return visits.
6. Shop remains lower on the homepage as an optional spiritual product pathway.

## 14. Homepage CTA Hierarchy

1. Hero primary CTA: Generate Your Kundli.
2. Hero secondary CTA: Explore NAVAGRAHA AI.
3. Hero tertiary link: Book Consultation only when spacing remains clean.
4. Utility cards use one practical CTA each.
5. NAVAGRAHA AI section uses Try NAVAGRAHA AI plus Generate Kundli First.
6. Reports, consultation, content, and shop sections use section-specific CTAs only.
7. Final CTA returns to Generate Your Kundli and Explore NAVAGRAHA AI.

## 15. Homepage Graphics Rules

1. Use white, ivory, pearl, warm cream, antique gold, champagne, and muted saffron.
2. Use refined sacred geometry, zodiac wheel, mandala, or chart-line motifs.
3. Do not use black cosmic panels, blue glows, robot graphics, or generic tech-dashboard imagery.
4. Do not show fabricated planetary positions, fake birth data, or fake predictive certainty in decorative previews.
5. Keep mobile layouts stacked, readable, and free from horizontal overflow.

## 16. Utility Page Pattern

All public utility pages should follow this structure:

1. Utility Hero: clear title, short user explanation, primary tool/form CTA, and a concise trust/helper note.
2. Input / Tool Form Area: premium light card, readable labels, minimum required inputs, and non-technical validation messages.
3. Result / Output Area: hierarchy-first result cards, strong readable text, compact metadata chips, and no raw debug fields.
4. Related Tools / Next Step: limited relevant internal links, with one primary continuation path and one secondary premium path only when useful.
5. Trust / FAQ Support: compact, practical, and not repeated across the page.

Shared utility classes:

1. `.utility-page-flow` wraps client tool panels and defines local utility surface variables.
2. `.utility-form-card` is used for input surfaces.
3. `.utility-result-card` is used for primary generated outputs.
4. `.utility-panel-card` is used for secondary result sections.
5. `.utility-data-chip` is used for date, location, timezone, and compact metadata.
6. `.utility-time-block` is used for Panchang/Muhurta timing values and number highlights.
7. `.utility-related-card` is used for related tool cards.
8. `.utility-error` is used for user-facing validation and request errors.

## 17. Tool Result Card Rules

1. Primary result cards use warm ivory/gold surfaces and should appear immediately after successful calculation.
2. Labels stay small, uppercase, and gold/neutral.
3. Values must use charcoal/black text, never washed-out gray.
4. Time windows must show start and end clearly on one readable line where possible.
5. Panchang values, numerology numbers, and calculator outputs should use compact grids that collapse cleanly on mobile.
6. Result cards may contain contextual CTAs only after the useful result has been shown.

## 18. Utility Related Tools + CTA Rules

1. Kundli: Ask My Chart / Reports / Consultation.
2. Rashifal: Panchang / Muhurta / Kundli / NAVAGRAHA AI.
3. Panchang: Rashifal / Muhurta / Daily Guidance / Consultation.
4. Numerology: Numerology AI / Calculators / Consultation.
5. Calculators: Kundli / Panchang / Numerology / Muhurta.
6. Muhurta: Panchang / Calculators / Consultation.
7. Compatibility: Compatibility Report / Consultation.
8. Avoid overlinking. Keep related tools limited, relevant, and non-spammy.

## 19. Utility Mobile Rules

1. Forms must stack into one column on small screens.
2. Inputs, buttons, and error messages must use full width on mobile where needed.
3. Result grids should collapse before text becomes cramped.
4. Long Assamese/Hindi labels must wrap safely.
5. Time blocks and lucky indicators should not require horizontal scrolling.
6. Tool CTAs should be vertically stacked on mobile and become inline only when enough width exists.

## 20. NAVAGRAHA AI Flagship Rules

Positioning:

1. NAVAGRAHA AI is the premium intelligence layer, not a generic chatbot.
2. Copy must reference chart-aware context, Dasha timing, transit context, Yoga / Rule signals, predictive synthesis, and safe guidance only where those layers are available.
3. Do not claim guaranteed outcomes, certainty, or replacement of human consultation.
4. Do not show fake personal chart data in decorative previews.

Visual rules:

1. AI sections use `category="ai"` and stay within the premium light palette.
2. Use gold chart nodes, line connectors, layered ivory cards, and subtle sacred-geometry motifs.
3. Avoid robots, blue tech gradients, neon glows, black cosmic panels, or dense dashboard graphics.
4. AI cards should feel slightly more premium than utility cards through stronger gold borders, clearer labels, and chart-context language.

AI card pattern:

1. Icon or gold line-art motif.
2. Title.
3. Best-for label.
4. Short chart-aware description.
5. One clear CTA.
6. If a specific AI route does not exist, route to `/ai`, `/kundli-ai`, or the relevant existing hub. Never create broken links.

CTA hierarchy:

1. Primary: Ask My Chart or Generate Kundli.
2. Secondary: Explore AI Tools, View Predictive Reports, or Book Consultation.
3. One dominant action per section; avoid equal-weight CTA clusters.
4. Protected Ask My Chart surfaces must clarify that saved chart context is required.

Predictive intelligence explanation:

1. Use a simple stack: Birth Chart -> Dasha Timing -> Transit Context -> Yoga / Rule Signals -> Predictive Synthesis -> AI Guidance.
2. Keep descriptions user-friendly and non-technical.
3. Sample output panels must be generic demo structure, not fabricated personal predictions.
4. Always preserve safety language around health, finance, legal, and major life decisions.

## 21. Services Page Pattern

Service pages cover Reports, Consultation, Shop, product detail, and cart/order-request surfaces.

Structure:

1. Service Hero: service category, clear title, trust-building description, primary CTA, secondary CTA, and a subtle gold chart/service visual.
2. Trust Strip: concise markers such as chart-aware, expert-reviewed, privacy, secure access, and support.
3. Service Cards: offerings, duration or price where supported, short description, and one clear CTA.
4. How It Works: three simple steps for trust and conversion.
5. Why Choose This: concise non-repetitive trust points.
6. FAQ / Safety Notes: expectations, privacy, refund/terms, and shop/order guidance.
7. Final CTA: one strong action with one optional secondary action.

Shared service classes:

1. `.service-card` for premium service CTA and authority blocks.
2. `.service-offering-card` for report packages, consultation tiers, product cards, and cart cards.
3. `.service-trust-chip` for compact service trust notes.
4. `.service-price-label` for readable price/value labels.
5. `.service-portrait-frame` for the astrologer portrait placeholder or future approved photo.

## 22. Reports Design Rules

1. Reports are premium services, not free utility cards.
2. Use preview-first language: “Get Free Preview”, “deeper guidance”, “report depth”.
3. Preserve pricing, access, paywall, and report-generation logic.
4. Report cards should use ivory/white cards, gold labels, readable copy, and one CTA.
5. Trust points should mention chart-based analysis, predictive intelligence, privacy, and optional consultation follow-up.
6. Avoid aggressive sales copy or guaranteed outcomes.

## 23. Consultation Design Rules

1. Consultation should feel human, calm, and premium.
2. Use Joy Prakash Sarmah / J P Sarmah consistently where already established.
3. Explain AI vs human guidance clearly: AI helps organize questions; consultation handles nuance.
4. Session cards should present duration, fit, and booking CTA without pressure.
5. Include privacy/confidentiality and expectation boundaries.
6. Do not promise guaranteed life outcomes or fear-led urgency.

## 24. Astrologer Photo Replacement Rule

1. Do not hardcode a final astrologer photo assumption.
2. Use one replaceable profile asset object with `imageSrc`, `alt`, and `monogram`.
3. If `imageSrc` is available, display the approved local asset with accurate alt text.
4. If no approved image exists, use the premium monogram placeholder.
5. Do not use random external images or generated identity imagery.
6. Default placeholder alt text should remain generic, for example “Astrologer profile portrait placeholder”.

## 25. Shop Design Rules

1. Shop products are optional spiritual supports, not mandatory remedies.
2. Product cards should use high-quality placeholder/merchandising art when real images are unavailable.
3. Price, category, material, and ritual focus must be readable and calm.
4. Gemstone copy must recommend proper chart review before wearing.
5. Cart/order-request language must be honest and must not fake payment success.
6. Do not imply a product prevents harm or guarantees success.

## 26. Ethical Remedy + Product Wording

Allowed:

1. “Supportive spiritual product.”
2. “Optional practice companion.”
3. “Best selected after proper chart analysis.”
4. “Consultation can help clarify suitability.”

Avoid:

1. “Must buy.”
2. “Guaranteed result.”
3. “Avoid danger by purchasing.”
4. “Cure”, “fix”, or medical/financial/legal certainty.

## 27. Service CTA Hierarchy

Reports:

1. Primary: View Reports / Get Report / Get Free Preview.
2. Secondary: Generate Kundli.

Consultation:

1. Primary: Book Consultation.
2. Secondary: View Consultation Options.

Shop:

1. Primary: Explore Spiritual Shop.
2. Secondary: Book Consultation for Guidance.

Rules:

1. Avoid crowded button clusters.
2. Primary CTA must be visually stronger.
3. Secondary CTA should support the decision, not compete with it.
4. Mobile service CTAs should stack full-width when space is limited.

## 28. Content Publishing + Rashifal Rules

Editorial identity:

1. Public content uses the authority identity "From the Desk of J P Sarmah".
2. "Insights" can remain as a route/category label, but the page masthead and article trust language should point back to the Desk identity.
3. Article cards should show category, reading time, publish date, and clear editorial attribution.
4. Do not publish fake placeholders, crawl-visible loading text, or unsupported review claims.

Article readability:

1. Article shells use `.content-article-shell` with strong charcoal body text.
2. Body copy uses `.content-body` for comfortable line height and readable color.
3. Metadata uses `.content-meta-chip` with warm neutral/gold treatment.
4. Related articles and category cards use `.content-card`.
5. Keep ad-ready zones hidden or neutral until real AdSense configuration is enabled.

Rashifal publishing:

1. Daily Rashifal must keep a consistent structure across all 12 signs.
2. Each sign keeps exactly five descriptive lines when the source data provides five lines.
3. Love, Career, and Business sections are separated into readable blocks.
4. Lucky Color, Lucky Number, and Lucky Time use `.rashifal-lucky-chip`.
5. Do not make deterministic, fear-based, or guaranteed prediction claims.
6. Public sign-level Rashifal should route users to Kundli, Panchang, NAVAGRAHA AI, reports, or consultation only when contextually useful.

Internal linking:

1. Rashifal articles may link to Rashifal, Panchang, Kundli, NAVAGRAHA AI, Reports, and Consultation.
2. Panchang articles may link to Panchang, Muhurta / Time Tools, Rashifal, and Consultation.
3. Compatibility articles may link to Compatibility, Reports, and Consultation.
4. Gemstone/remedy articles may link to Shop and Consultation only with optional, non-pressure wording.
5. Avoid repeated commerce links inside the same article body.

Ad-ready content rules:

1. Do not show public text such as "ad placeholder" or "reserved for ads".
2. If ads are disabled, editorial pages should collapse legacy content ad slots.
3. Real AdSense activation remains environment-controlled; never hardcode publisher IDs.

## 29. Mobile + Multilingual QA Rules

Target viewport checklist:

1. Public pages must remain usable at 360px, 390px, 430px, 768px, and desktop large widths.
2. No public marketing, utility, content, service, or shop page should require horizontal scrolling.
3. Cards, result panels, forms, and CTA clusters should stack before text becomes cramped.
4. Mobile buttons should be full-width when grouped vertically and may become inline only with enough width.
5. Product cards and service cards should avoid side-by-side button clusters on narrow screens.

Multilingual wrapping rules:

1. Assamese, Hindi, Urdu, Arabic, Chinese, Japanese, Korean, and long English labels must wrap or truncate safely.
2. Shared buttons, badges, cards, fields, and containers must use `min-width: 0` or equivalent responsive behavior.
3. Heading, body, metadata, and chip text should use `mobile-safe-text` or component-level break behavior where overflow is possible.
4. Do not clip language labels, article titles, form labels, result labels, or footer links.
5. Do not force `whitespace-nowrap` on public navigation labels unless the component has a width cap.

Language switcher rules:

1. English remains the default experience.
2. Live locales should link to the same page path with the selected locale prefix.
3. Planned locales stay visible but disabled and non-breaking.
4. Compact language menus must have a viewport-safe max height and internal scrolling.
5. Language labels should use their own `lang` and `dir` metadata where rendered.
6. RTL planned languages must not flip the current LTR page unexpectedly.

RTL readiness notes:

1. Arabic and Urdu metadata remain `rtl`.
2. Root `dir` follows the resolved locale.
3. Form controls are prepared for RTL text alignment through global CSS.
4. Full RTL visual redesign is still outside this mobile QA phase.

Pages and surfaces checked for this phase:

1. Header, mobile menu, language switcher, footer.
2. Homepage shared section patterns and CTA clusters.
3. Kundli, Rashifal landing, Rashifal sign pages, Panchang, Numerology, Calculators, Muhurta / Time Tools.
4. NAVAGRAHA AI, Reports, Consultation, Shop, product cards, cart/order request surfaces.
5. From the Desk landing, article detail, Insights category/landing cards.
6. About, Contact, Privacy, Terms, and legal/trust page wrappers.

## 30. Final UI + Search Readiness Rules

Final 18.2A public QA rules:

1. Public sections should not show unfinished terms such as "ad placeholder", "reserved for ads", "demo only", or fake test content.
2. Ad slots must collapse in production unless real AdSense configuration is active.
3. `ads.txt` must stay seller-free until the real Google publisher record is available.
4. `/ai` is the primary NAVAGRAHA AI route; `/navagraha-ai` remains an alias.
5. `/from-the-desk` is the primary editorial route; `/insights` remains an alias/category discovery path where supported.
6. Google Search Console submission should use canonical final URLs and the generated sitemap.
7. Manual mobile and browser visual sign-off remains required after production deployment.

## 31. Approved Homepage Demo Implementation

Homepage visual target:

1. Root `/` and English `/en` must render the same shared refined homepage component.
2. Approved order: Header, Premium Hero, Hero Trust Icons, Authority / Legacy Strip, Core Astrology Utilities, NAVAGRAHA AI light panel, Premium Services Cards, Credibility Strip, Final CTA, Footer.
3. The homepage uses ivory, white, warm cream, charcoal text, antique gold, champagne, and muted saffron only.
4. Do not reintroduce dark cosmic panels, neon glow, blue tech gradients, robot imagery, or highly colorful icon systems.
5. Homepage decorative visuals should use CSS/SVG-style gold line art when approved local assets are not available.

Hero graphics rules:

1. Use golden zodiac wheel, sun mandala, sacred geometry, open scripture, or chart-line motifs.
2. Decorative chart visuals must not show fake planetary positions, fake birth data, or fake predictions.
3. The hero CTA hierarchy is Generate Your Kundli, Explore NAVAGRAHA AI, then Book Consultation only as a softer tertiary action.
4. Hero trust icons should use concise labels such as accurate calculations, privacy, available tools, and guidance tradition without hard-number claims.

Authority strip rules:

1. The authority strip may mention Joy Prakash Sarmah and the legacy of Hemeswar Sarmah when used as brand/editorial context.
2. Astrologer portraits remain replaceable assets. If no approved local portrait exists, use monogram or premium silhouette placeholders.
3. Placeholder alt text must stay generic, for example "Astrologer profile portrait placeholder".
4. Do not use random external portraits, generated identity imagery, or final-photo assumptions.

Homepage section separation rules:

1. Core Astrology Utilities contains only free/practical tools: Kundli, Compatibility, Rashifal, Panchang, Numerology, Calculators, and Muhurta / Time Tools.
2. NAVAGRAHA AI appears as a light premium intelligence panel, not as a dark chatbot or tech block.
3. Premium Services Cards contain Reports, Consultation, From the Desk, and Spiritual Support Shop.
4. Services, content, and shop must not appear inside the utility section.
5. Shop copy must stay optional and non-fear-based.

Final CTA rules:

1. The closing action should return users to Kundli generation first.
2. Consultation can be offered as the second CTA.
3. NAVAGRAHA AI may remain as a tertiary text-style path.
4. Keep CTA groups stacked and tap-friendly on mobile.

## 32. Homepage Premium Graphics Refinement

Homepage graphics implementation notes:

1. The hero graphic should be visual, not explanatory. Do not show public design-note text such as "golden zodiac wheel", "motif", "demo", or "placeholder" inside the graphic.
2. Use CSS/SVG-safe line art for the homepage unless approved local images are available.
3. Preferred visual elements: gold zodiac or sun mandala, sacred geometry, North Indian chart-line structure, open scripture/book forms, gold particles, and soft parchment-like ivory depth.
4. Do not use random external images, fake astrologer/product photos, black cosmic imagery, blue/purple cyber panels, neon effects, or robot graphics.
5. Decorative visuals must stay mobile-safe at 360px, 390px, 430px, 768px, and desktop widths.

Hero visual asset rules:

1. The hero may use an abstract NAVAGRAHA CENTRE monogram or chart emblem.
2. Decorative chart art must not imply real calculated positions until a user generates a chart.
3. Open-book/scripture shapes may be CSS/SVG line art and should not contain fake text content.
4. Future approved assets should be introduced through a replaceable local asset path, not external URLs.

Authority and service visual rules:

1. Authority portraits remain replaceable monogram/silhouette frames until approved real photos exist.
2. Service cards may use report, consultation, editorial desk, and spiritual product line-art motifs.
3. Consultation visuals must not use fake human photos.
4. Shop visuals must not imply guaranteed remedy outcomes or final product certification beyond current product data.

Locale consistency rules:

1. English pages should use coherent English labels for footer and navigation groups.
2. Assamese and Hindi pages may use their localized labels where dictionaries are complete.
3. Do not duplicate "From the Desk" and "Insights" labels in English unless they intentionally point to different editorial concepts.
4. Language switcher labels may use native language names, but navigation/footer labels should follow the active page locale.

## 33. Premium Graphics System (18.2A-10C)

Approved reusable graphics primitives:

1. `GoldZodiacWheel`: gold SVG zodiac/sun mandala line art for hero and decorative astrology surfaces.
2. `SacredGeometryPattern`: faint responsive geometry accents for section and card backgrounds.
3. `VedicHeroIllustration`: composed hero visual with mandala, manuscript/book shapes, diya glow, and warm parchment depth.
4. `AiMandalaGraphic`: light gold chart-node and predictive-flow visual for NAVAGRAHA AI.
5. `ConsultationPlaceholderGraphic`: replaceable monogram portrait frame for astrologer and legacy profiles.
6. `ServiceVisualGraphic`: report book, consultation, editorial desk, and shop/product line-art variants.
7. `FinalCtaOrnament`: lotus/diya/sacred-geometry corner accents for the closing CTA.

Hero visual rules:

1. Keep the hero image-rich but CSS/SVG-first for performance.
2. Hero art must not contain explanatory placeholder text.
3. The hero should stack below copy on mobile and stay within its card boundary at 360px.
4. Do not add large raster images unless they are optimized, local, and approved.

AI visual rules:

1. AI graphics remain light, gold, and chart-aware.
2. The predictive flow may show generic system stages such as Birth Chart, Dasha, Transit, Yoga / Rules, and AI Guidance.
3. Do not show robots, blue/purple cyber effects, fabricated personal outputs, or fake chart data.

Service card visual rules:

1. Reports use document/book line art.
2. Consultation uses profile/authority line art or approved replaceable portrait assets only.
3. From the Desk uses notebook, pen, or manuscript-style visuals.
4. Shop uses rudraksha, yantra, diya, or product-style line art without guaranteed remedy claims.

Mobile graphics/action rules:

1. Graphics should enrich the mobile experience without adding sticky UI that covers content.
2. Bottom quick navigation remains a future follow-up unless it can be tested across key pages without overlap.
3. Homepage CTA groups should remain full-width stacked on narrow screens.
4. Decorative graphics should be `aria-hidden` unless they communicate meaningful content.

Performance and accessibility rules:

1. Prefer inline SVG/CSS over heavy raster assets.
2. Avoid external image hotlinking.
3. Keep decorative graphics pointer-event safe and non-interactive.
4. Maintain strong text contrast over all patterned backgrounds.
5. Respect reduced-motion settings already defined in global CSS.

Prohibited graphics:

1. Blue/neon/cosmic-dark graphics.
2. Fake human or astrologer photos.
3. Random external stock images.
4. Visible placeholder or demo text.
5. Product visuals that imply guaranteed outcomes.

## 34. Approved Demo Homepage Refinement

Homepage structure for the approved visual direction:

1. Header.
2. Premium hero.
3. Authority / legacy strip.
4. Core Astrology Utilities.
5. NAVAGRAHA AI dark premium section.
6. Reports + Consultation.
7. From the Desk + Spiritual Shop.
8. Trust / credibility strip.
9. Final CTA.
10. Footer.

Approved exceptions for the homepage demo:

1. The NAVAGRAHA AI homepage block may use a dark cosmic, deep navy, or purple-glow treatment when it remains premium, readable, and isolated to that section.
2. The footer may use a dark premium treatment when link contrast remains strong and columns remain clean.
3. Utility icons may use richer visual energy when icon style remains polished and consistent.

Homepage graphics rules:

1. Hero visuals must be actual SVG/CSS graphics, not public descriptive text.
2. Use local SVG/CSS motifs for zodiac wheel, sun mandala, sacred geometry, open scripture, rudraksha, diya, and gold mist.
3. Consultation and legacy portraits use replaceable monogram placeholders unless approved local portrait assets exist.
4. Service visuals must remain ethical: reports, consultation, editorial content, and shop are visually separated from free utilities.
5. The shop can present optional spiritual support tools, but must not imply guaranteed outcomes or fear-based remedy pressure.

Mobile and footer rules:

1. Header navigation may collapse before desktop width to prevent overflow.
2. Homepage CTA groups should remain stacked and tap-friendly at 360px, 390px, and 430px.
3. Dark footer links must use warm ivory/champagne text, gold headings, and visible hover/focus contrast.
4. Decorative dark AI graphics remain `aria-hidden` unless they communicate meaningful content.

## 35. G7 Final Graphics QA Notes

Mobile graphics rules:

1. Hero and AI artwork blocks must scale down on narrow screens before text becomes cramped.
2. Graphics should stay inside card boundaries with `overflow-hidden` and responsive `max-width`.
3. Decorative layers must never push CTA buttons below comfortable tap zones.
4. Footer logo should use a reduced mobile width to keep the link columns readable.

SVG/image sizing rules:

1. Prefer SVG for emblem, utility icon, hero, AI, and service graphics.
2. Keep brand/image components on explicit intrinsic dimensions plus responsive CSS width classes.
3. Use responsive `sizes` on `next/image` variants to avoid unnecessary payload on mobile.
4. Avoid fixed large heights on decorative graphics without smaller mobile breakpoints.

Watermark and pattern opacity rules:

1. Sacred geometry overlays should stay subtle (`--pattern-opacity-geometry` low enough for body text contrast).
2. Om watermark opacity should be very low and decorative only.
3. Parchment and glow layers should support depth without competing with content.
4. Section dividers should remain visible but restrained on both light and dark surfaces.

Performance and accessibility rules:

1. Decorative graphics must be `aria-hidden` and non-interactive (`pointer-events-none`) by default.
2. Meaningful brand marks must retain descriptive alt text.
3. Avoid external image hotlinks and oversized raster artwork for decorative sections.
4. Respect reduced-motion settings and keep visual animation minimal.
5. Keep contrast strong in dark AI panels and on patterned light backgrounds.
