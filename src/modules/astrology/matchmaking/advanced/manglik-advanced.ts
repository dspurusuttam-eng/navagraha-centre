// Card 10A.2 — Advanced Manglik layer.
//
// Consumes Card 10 raw Manglik flags UNCHANGED. Adds only the approved
// mitigation subset (own/exalted Mars, Jupiter conjunct/aspect, mutual balance;
// D9 Mars contextual). Contested per-house sign tables and Moon/Venus-reference
// cancellation variants are NOT used. No severity percentage; no fear language.

import type { ManglikComparison } from "@/modules/astrology/matchmaking/premium";
import { aspectsHouse } from "@/modules/astrology/matchmaking/advanced/constants";
import type { AdvancedChartContext } from "@/modules/astrology/matchmaking/advanced/chart-context";
import type {
  AdvancedManglikResult,
  ManglikMitigation,
} from "@/modules/astrology/matchmaking/advanced/types";

function rawStatusOf(
  comparison: ManglikComparison,
  which: "personA" | "personB"
): "flagged" | "clear" | "unavailable" {
  const chart = comparison[which];
  if (chart.status === "unavailable" || chart.flaggedReferenceCount === null) {
    return "unavailable";
  }
  return chart.flaggedReferenceCount > 0 ? "flagged" : "clear";
}

/** Mitigations from a chart context (Mars dignity + Jupiter conjunct/aspect). */
function mitigationsFor(
  scope: "personA" | "personB",
  ctx: AdvancedChartContext
): ManglikMitigation[] {
  const result: ManglikMitigation[] = [];
  const natal = ctx.natal;
  if (!natal) return result;

  const marsDignity = natal.mars.dignity;
  if (marsDignity === "own") {
    result.push({
      ruleId: "MANGLIK_ADV_MARS_OWN_SIGN",
      personScope: scope,
      detail: "Mars is in its own sign in D1.",
      effect: "mitigation",
      calculationReference: "card10a:manglik-mars-dignity",
    });
  }
  if (marsDignity === "exalted") {
    result.push({
      ruleId: "MANGLIK_ADV_MARS_EXALTED",
      personScope: scope,
      detail: "Mars is exalted in D1.",
      effect: "mitigation",
      calculationReference: "card10a:manglik-mars-dignity",
    });
  }

  // Jupiter conjunct Mars (same D1 sign).
  if (
    natal.jupiter.signIndex !== null &&
    natal.mars.signIndex !== null &&
    natal.jupiter.signIndex === natal.mars.signIndex
  ) {
    result.push({
      ruleId: "MANGLIK_ADV_JUPITER_CONJUNCT_MARS",
      personScope: scope,
      detail: "Jupiter conjoins Mars in D1.",
      effect: "mitigation",
      calculationReference: "card10a:manglik-jupiter",
    });
  } else if (
    natal.jupiter.house !== null &&
    natal.mars.house !== null &&
    aspectsHouse("JUPITER", natal.jupiter.house, natal.mars.house)
  ) {
    // Jupiter Parashari aspect (5/7/9) onto Mars's house.
    result.push({
      ruleId: "MANGLIK_ADV_JUPITER_ASPECTS_MARS",
      personScope: scope,
      detail: "Jupiter casts a Parashari aspect (5/7/9) on Mars.",
      effect: "mitigation",
      calculationReference: "card10a:manglik-jupiter",
    });
  }

  // D9 Mars dignity -> contextual confirmation only (never a cancellation).
  if (ctx.d9 && (ctx.d9.d9Mars.dignity === "own" || ctx.d9.d9Mars.dignity === "exalted")) {
    result.push({
      ruleId: "MANGLIK_ADV_D9_MARS_DIGNIFIED",
      personScope: scope,
      detail: "Mars is dignified in D9 (contextual confirmation only).",
      effect: "contextual",
      calculationReference: "card10a:manglik-d9",
    });
  }

  return result;
}

export function buildAdvancedManglik(input: {
  comparison: ManglikComparison | null;
  contextA: AdvancedChartContext;
  contextB: AdvancedChartContext;
}): AdvancedManglikResult {
  const ruleId = "MANGLIK_ADV_MUTUAL_BALANCE";

  if (!input.comparison || input.comparison.status === "unavailable") {
    return {
      status: "unavailable",
      rawStatusA: "unavailable",
      rawStatusB: "unavailable",
      finalStatus: "unavailable",
      mutualComparison: input.comparison?.status ?? "unavailable",
      mitigations: [],
      d9Context: [],
      ruleId,
      detail: "Advanced Manglik is unavailable because raw Manglik data is missing.",
    };
  }

  const rawA = rawStatusOf(input.comparison, "personA");
  const rawB = rawStatusOf(input.comparison, "personB");
  const mitigations = [
    ...mitigationsFor("personA", input.contextA),
    ...mitigationsFor("personB", input.contextB),
  ];
  const realMitigations = mitigations.filter((m) => m.effect === "mitigation");
  const d9Context = mitigations
    .filter((m) => m.effect === "contextual")
    .map((m) => m.detail);

  // Final status (raw flags never mutated).
  const flaggedA = rawA === "flagged";
  const flaggedB = rawB === "flagged";
  let finalStatus: AdvancedManglikResult["finalStatus"];

  if (input.comparison.status === "mixed") {
    finalStatus = "mixed";
  } else if (!flaggedA && !flaggedB) {
    finalStatus = "balanced"; // both clear -> no imbalance (mirrors Card 10 balanced)
  } else if (flaggedA && flaggedB) {
    finalStatus = "balanced"; // mutual Manglik balance
  } else {
    // Exactly one chart flagged: mitigated only if a real mitigation applies to
    // the FLAGGED chart; otherwise unbalanced.
    const flaggedScope = flaggedA ? "personA" : "personB";
    const mitigatedFlagged = realMitigations.some((m) => m.personScope === flaggedScope);
    finalStatus = mitigatedFlagged ? "mitigated" : "unbalanced";
  }

  return {
    status: "available",
    rawStatusA: rawA,
    rawStatusB: rawB,
    finalStatus,
    mutualComparison: input.comparison.status,
    mitigations,
    d9Context,
    ruleId,
    detail:
      "Advanced Manglik overlays the Card 10 raw flags with the approved mitigation subset; raw flags are unchanged and no cancellation percentage is produced.",
  };
}
