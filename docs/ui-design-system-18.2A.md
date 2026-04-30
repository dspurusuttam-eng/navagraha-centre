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
