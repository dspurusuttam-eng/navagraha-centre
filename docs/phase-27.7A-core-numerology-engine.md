# Phase 27.7A - Core Numerology Engine

## Files Changed
- `src/modules/numerology/engine.ts`
- `src/modules/numerology/index.ts`
- `scripts/debug-numerology-core-qa.ts`
- `package.json`

## Core Numerology Status
The numerology module now includes a strict core numerology entry point alongside the existing backward-compatible numerology context.

The strict core engine supports:
- Life Path Number
- Destiny / Expression Number
- Soul Urge Number
- Personality Number
- Birth Day Number
- Basic lucky number set

The existing legacy calculator output remains intact for the current dashboard, calculator, report, and AI consumers.

## Supported Calculations
- `life_path_number`
- `destiny_expression_number`
- `soul_urge_number`
- `personality_number`
- `birth_day_number`
- `lucky_number_set`

## Output Structure
Each core calculation now uses a stable record shape:
- `calculationType`
- `inputSummary`
- `number`
- `numberLabel`
- `basis[]`
- `strengths[]`
- `cautions[]`
- `safeSummary`
- `missingReason`

The wider context output also carries:
- `coreCalculations[]`
- `luckyNumbers[]`

## Input Validation
- Missing DOB returns an unavailable state.
- Invalid DOB returns an unavailable state.
- Missing full name returns an unavailable state for the strict core engine.
- Empty or non-letter names return an unavailable state for the strict core engine.
- Legacy numerology output remains compatible with the older DOB + optional name flow.

## Non-English Name Handling
- Unicode letters are accepted safely.
- Assamese and other non-English names do not crash the engine.
- Destiny / Expression calculation uses a Unicode-safe fallback when needed.
- Soul Urge and Personality calculations require a safe vowel/consonant split; when that cannot be done cleanly, they return unavailable rather than guessing.

## Report / AI / Dashboard Compatibility
Compatibility is preserved with:
- calculators service
- numerology tool panel
- report and AI consumers
- dashboard surfaces that reference numerology guidance

No UI redesign was introduced.

## Safety / Fallback Behavior
- No fake numerology claims are added.
- No guaranteed wealth, marriage, or career outcome is claimed.
- No fear-based wording is used.
- No private data leak is introduced.
- Missing or invalid input returns safe unavailable states.

## QA Result
Focused QA script passed for:
- valid DOB + valid name
- invalid DOB
- empty name
- Assamese name
- legacy compatibility path

## Next Phase
Phase 27.7B - Name / Business / Vehicle Numerology
