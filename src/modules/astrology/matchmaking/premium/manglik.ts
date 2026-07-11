// Card 10.2 — Manglik / Kuja Dosha (raw detection only; cancellation DEFERRED).
//
// Mars whole-sign house is counted separately from Lagna, Moon and Venus.
// Counted houses: {1,2,4,7,8,12}. Kept ENTIRELY separate from the 36-point
// Ashtakoot score. Structural mutual comparison only — no cancellation rules,
// no fear/rejection language.

import { MANGLIK_HOUSES } from "@/modules/astrology/matchmaking/premium/constants";
import { houseFromSign } from "@/modules/astrology/matchmaking/premium/chart-context";
import { getMatchRule } from "@/modules/astrology/matchmaking/premium/rule-registry";
import type {
  ManglikChartResult,
  ManglikComparison,
  ManglikReferenceResult,
  MatchPersonContext,
} from "@/modules/astrology/matchmaking/premium/types";

function referenceResult(input: {
  reference: "LAGNA" | "MOON" | "VENUS";
  marsSignIndex: number | null;
  referenceSignIndex: number | null;
}): ManglikReferenceResult {
  const rule = getMatchRule("MANGLIK_HOUSE_PLACEMENT");

  if (input.marsSignIndex === null || input.referenceSignIndex === null) {
    return {
      reference: input.reference,
      marsHouse: null,
      flagged: null,
      ruleId: rule.ruleId,
      status: "unavailable",
      unavailableReason: `${input.reference} reference or Mars position is unavailable.`,
    };
  }

  const marsHouse = houseFromSign(input.marsSignIndex, input.referenceSignIndex);

  return {
    reference: input.reference,
    marsHouse,
    flagged: MANGLIK_HOUSES.has(marsHouse),
    ruleId: rule.ruleId,
    status: "available",
    unavailableReason: null,
  };
}

export function buildManglikChartResult(person: MatchPersonContext): ManglikChartResult {
  const severityRule = getMatchRule("PRODUCT_PRESENTATION_SEVERITY");
  const references: ManglikReferenceResult[] = [
    referenceResult({
      reference: "LAGNA",
      marsSignIndex: person.marsSignIndex,
      referenceSignIndex: person.lagnaSignIndex,
    }),
    referenceResult({
      reference: "MOON",
      marsSignIndex: person.marsSignIndex,
      referenceSignIndex: person.moonSignIndex,
    }),
    referenceResult({
      reference: "VENUS",
      marsSignIndex: person.marsSignIndex,
      referenceSignIndex: person.venusSignIndex,
    }),
  ];
  const available = references.filter((ref) => ref.status === "available");

  if (person.marsSignIndex === null || available.length === 0) {
    return {
      status: "unavailable",
      references,
      flaggedReferenceCount: null,
      productSeverityLabel: "unavailable",
      unavailableReason: "Mars placement is unavailable for Manglik detection.",
    };
  }

  const flaggedCount = available.filter((ref) => ref.flagged).length;
  const someUnavailable = references.some((ref) => ref.status !== "available");
  // ruleId referenced for provenance/registry integrity.
  void severityRule;

  return {
    status: someUnavailable ? "partial" : "available",
    references,
    flaggedReferenceCount: flaggedCount,
    productSeverityLabel:
      flaggedCount === 0
        ? "none"
        : flaggedCount === 1
          ? "single_reference"
          : "multi_reference",
    unavailableReason: someUnavailable
      ? "Some Manglik reference checks are unavailable."
      : null,
  };
}

export function buildManglikComparison(
  personA: MatchPersonContext,
  personB: MatchPersonContext
): ManglikComparison {
  const rule = getMatchRule("MANGLIK_MUTUAL_COMPARISON");
  const resultA = buildManglikChartResult(personA);
  const resultB = buildManglikChartResult(personB);

  let status: ManglikComparison["status"];
  let detail: string;

  if (resultA.status === "unavailable" || resultB.status === "unavailable") {
    status = "unavailable";
    detail = "Manglik comparison is unavailable because Mars data is missing for at least one chart.";
  } else {
    const flaggedA = (resultA.flaggedReferenceCount ?? 0) > 0;
    const flaggedB = (resultB.flaggedReferenceCount ?? 0) > 0;

    if (flaggedA === flaggedB) {
      // Both flagged or both clear on the raw-count basis.
      const partial = resultA.status === "partial" || resultB.status === "partial";

      status = partial ? "mixed" : "balanced";
      detail = flaggedA
        ? "Both charts show Manglik-sensitive Mars placement on the raw reference basis."
        : "Neither chart shows Manglik-sensitive Mars placement on the ready reference basis.";
    } else {
      status = "unbalanced";
      detail = "One chart shows Manglik-sensitive Mars placement while the other does not, on the raw reference basis.";
    }
  }

  return { status, personA: resultA, personB: resultB, ruleId: rule.ruleId, detail };
}
