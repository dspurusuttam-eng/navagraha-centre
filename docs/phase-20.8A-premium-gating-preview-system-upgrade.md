# Phase 20.8A - Premium Gating + Preview System Upgrade

## Files Changed
- `src/modules/report/report-presentation-types.ts`
- `src/modules/report/report-presentation.ts`
- `src/modules/report/components/report-presentation.tsx`
- `docs/phase-20.8A-premium-gating-preview-system-upgrade.md`

## Preview Behavior
- Preview mode renders only sections that are explicitly marked `previewAllowed` by the shared report foundation.
- Preview cards show the executive-summary/foundation layer and other safe teaser content only.
- Deep timing, Dasha, transit, remedies, house-by-house deep analysis, and premium deep-dive content remain withheld.
- Locked preview sections now render a safe preview teaser instead of any hidden premium content.

## Premium Section Behavior
- `premiumOnly` and `requiresUnlockedReport` are preserved in the shared presentation model.
- Locked sections render as explicit locked preview cards with a lock badge and premium badge.
- Locked section content is replaced with a safe placeholder string.
- Locked preview cards now include a soft unlock CTA.

## Access State Behavior
- Logged-out users remain blocked by the API session guard before report generation.
- Logged-in free users receive preview-locked report state with locked cards and soft CTAs.
- Users with unlocked premium access receive full section content.
- Missing payment/unlock state keeps sections locked rather than exposing content.
- Failed or limit-reached states continue to surface the safe locked experience.

## Locked Section UI / Content Rules
- Locked cards show the section title.
- Locked cards show a lock indicator and premium indicator.
- Locked cards show a safe preview teaser.
- Locked cards show a soft CTA: `Unlock Full Report`.
- Locked cards do not show any hidden premium text.
- Locked cards remain print-safe and export-safe.

## CTA Rules
- Primary soft CTA is `Unlock Full Report`.
- Report-specific unlock destinations come from the report foundation soft CTA path.
- No fear-based urgency, coercive wording, or fake scarcity is used.
- Related follow-up CTAs remain soft and contextual where already present.

## Direct API / Route Leak Prevention Notes
- The premium report API remains session-gated and rate-limited.
- The shared presentation model withholds locked section content in preview and export-ready output.
- The report presentation renderer now uses preview teasers and placeholders for locked cards.
- No raw chart JSON, internal context, or hidden premium content is surfaced by the preview layer.

## Safety Rules Preserved
- No guaranteed prediction wording.
- No fear-based claims.
- No medical, investment, legal, or tax certainty.
- No coercive relationship wording.
- No guaranteed remedy result.
- No sensitive birth data exposure in presentation output.
- No internal error leakage through report cards.

## Next Phase
- 20.8B Payment / Unlock QA + Safety
