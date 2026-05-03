# Phase 19.8A - Remedies / Spiritual Guidance AI Audit

## Files inspected
- `D:\PDS BDS\navagraha-centre\src\modules\ask-chart\service.ts`
- `D:\PDS BDS\navagraha-centre\src\modules\ask-chart\assistant-response-engine.ts`
- `D:\PDS BDS\navagraha-centre\src\modules\ask-chart\jyotish-answer-formatter.ts`
- `D:\PDS BDS\navagraha-centre\src\modules\ai\prompt-registry.ts`
- `D:\PDS BDS\navagraha-centre\src\modules\ai\prompts.ts`
- `D:\PDS BDS\navagraha-centre\src\lib\astrology\accuracy\prompt-builder.ts`
- `D:\PDS BDS\navagraha-centre\src\modules\astrology\predictive-assistant-context.ts`
- `D:\PDS BDS\navagraha-centre\src\lib\monetization\monetization-config.ts`
- `D:\PDS BDS\navagraha-centre\src\lib\seo\seo-config.ts`
- `D:\PDS BDS\navagraha-centre\src\messages\en.json`

## Current remedy AI behavior
- Remedy questions are already detected in the Ask My Chart service by explicit keywords such as `remedy`, `gemstone`, `rudraksha`, `yantra`, `puja`, and `mala`.
- Remedy intent routes to `REMEDY_EXPLANATION`, and the service pulls only approved remedy records from the remedy recommendation service.
- The fallback for remedy intent is conservative: if no approved record is strong enough, the assistant says so instead of inventing a remedy.
- Consultation context can include remedy-preparation notes derived from approved remedy records.
- In the conversation formatter, remedies are not given a dedicated high-level section the way career, finance, health, education, business, relationship, and daily guidance already are. Remedy guidance is currently handled mostly through the service fallback, the generic safety note, and the underlying prompt instructions.

## Available remedy context
- Chart-based grounding from `chartSummaryFacts`, `chartSnapshot`, and `predictiveAssistantContext`.
- Approved remedy records with:
  - title
  - type
  - priority tier
  - confidence label
  - summary
  - caution note
  - why-this-remedy rationale
  - cautions
  - product mapping safety notes
- Consultation preparation context that can surface remedy notes as internal review material.
- Report prompt disclaimers that already tell the report layer to treat remedies, gemstones, and formal observances as review-worthy and not automatic.

## Missing remedy context
- There is no dedicated remedy formatter branch in `jyotish-answer-formatter.ts` yet.
- There is no separate remedy-specific answer structure that consistently distinguishes:
  - mantra
  - prayer
  - puja
  - charity / daan
  - graha discipline
  - gemstone / rudraksha / yantra
  - consultation-only guidance
- Remedy language is safe, but it is still spread across generic safety notes and prompt text rather than a focused remedy layer.

## Safety risks
- The current system is already conservative, but the remaining risk is inconsistency: a remedy answer can still read like generic chart guidance instead of a structured remedy explanation.
- Gemstones, rudraksha, yantra, and shop-linked products are present in the platform, so the remedy layer must keep a hard boundary between optional guidance and purchase pressure.
- The report prompt already warns against automatic remedy claims, but the answer formatter does not yet enforce a remedy-specific structure.
- No evidence was found of fear-based "must do or bad result will happen" wording in the live remedy path, but 19.8B should keep that boundary explicit.

## Premium, shop, and consultation gating notes
- Consultation and shop CTAs are already available in the product UI and monetization config, and the current copy is soft by default.
- The remedy path already has a consultation-preparation bridge, which is a good basis for non-aggressive follow-up guidance.
- `src/lib/seo/seo-config.ts` and `src/messages/en.json` show that consultation, shop, and gemstone guidance are surfaced as platform labels, but they are not themselves proof of remedy behavior.
- The audit did not find aggressive auto-selling in the remedy flow, but the next phase should keep purchase wording clearly optional and separate from spiritual guidance.

## Exact files to edit in 19.8B
Primary AI flow:
- `D:\PDS BDS\navagraha-centre\src\modules\ask-chart\service.ts`
- `D:\PDS BDS\navagraha-centre\src\modules\ask-chart\assistant-response-engine.ts`
- `D:\PDS BDS\navagraha-centre\src\modules\ask-chart\jyotish-answer-formatter.ts`
- `D:\PDS BDS\navagraha-centre\src\modules\ai\prompt-registry.ts`
- `D:\PDS BDS\navagraha-centre\src\lib\astrology\accuracy\prompt-builder.ts`

Support files if remedy guidance needs a dedicated report layer or CTA refinement:
- `D:\PDS BDS\navagraha-centre\src\modules\ai\prompts.ts`
- `D:\PDS BDS\navagraha-centre\src\lib\monetization\monetization-config.ts`
- `D:\PDS BDS\navagraha-centre\src\lib\seo\seo-config.ts`
- `D:\PDS BDS\navagraha-centre\src\modules\astrology\predictive-assistant-context.ts`

## Next phase recommendation
- `19.8B - Remedies / Spiritual Guidance AI Prompt Upgrade`

## Validation
- `npm run typecheck` passed
- `npm run lint` passed
- `npm run build` passed

## Audit summary
- Remedies are currently safe, optional, and approved-record based.
- The missing piece is a dedicated remedy-first formatter and more explicit remedy reasoning instructions.
- No runtime behavior was changed in this audit phase.
