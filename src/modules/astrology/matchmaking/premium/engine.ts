// Card 10.2 — Premium Ashtakoot engine orchestrator (pure; single source of
// truth for all matchmaking scoring). Consumes verified charts via the numeric
// adapter; raw total is always the exact sum of the 8 raw component scores and
// is never mutated by exceptions or Manglik.

import { buildMatchPersonContext } from "@/modules/astrology/matchmaking/premium/chart-context";
import { computeVarna } from "@/modules/astrology/matchmaking/premium/varna";
import { computeVashya } from "@/modules/astrology/matchmaking/premium/vashya";
import { computeTara } from "@/modules/astrology/matchmaking/premium/tara";
import { computeYoni } from "@/modules/astrology/matchmaking/premium/yoni";
import { computeGrahaMaitri } from "@/modules/astrology/matchmaking/premium/graha-maitri";
import { computeGana } from "@/modules/astrology/matchmaking/premium/gana";
import { computeBhakoot } from "@/modules/astrology/matchmaking/premium/bhakoot";
import { computeNadi } from "@/modules/astrology/matchmaking/premium/nadi";
import {
  evaluateBhakootExceptions,
  evaluateNadiExceptions,
} from "@/modules/astrology/matchmaking/premium/exceptions";
import { buildManglikComparison } from "@/modules/astrology/matchmaking/premium/manglik";
import {
  MATCHMAKING_CONTRACT_VERSION,
  MATCHMAKING_CONVENTIONS,
  MATCHMAKING_DISCLAIMER,
  type AshtakootMatchInput,
  type AshtakootMatchSnapshot,
  type ExceptionResult,
  type KootaComponentResult,
} from "@/modules/astrology/matchmaking/premium/types";

export function buildAshtakootMatchSnapshot(
  input: AshtakootMatchInput
): AshtakootMatchSnapshot {
  const roleA = input.calculationRoleA ?? null;
  const roleB = input.calculationRoleB ?? null;
  const personAContext = buildMatchPersonContext({
    chart: input.personAChart,
    calculationRole: roleA,
  });
  const personBContext = buildMatchPersonContext({
    chart: input.personBChart,
    calculationRole: roleB,
  });
  const ashtakootOnly = input.mode === "ashtakoot_only";
  const includeManglik = (input.includeManglik ?? true) && !ashtakootOnly;
  const unavailableReasons: AshtakootMatchSnapshot["unavailableReasons"] = [];

  // --- Components (raw scores) ------------------------------------------------
  const componentResults: KootaComponentResult[] = [
    computeVarna(personAContext, personBContext),
    computeVashya(personAContext, personBContext),
    computeTara(personAContext, personBContext),
    computeYoni(personAContext, personBContext),
    computeGrahaMaitri(personAContext, personBContext),
    computeGana(personAContext, personBContext),
    computeBhakoot(personAContext, personBContext),
    computeNadi(personAContext, personBContext),
  ];

  const bhakoot = componentResults.find((c) => c.koota === "BHAKOOT")!;
  const nadi = componentResults.find((c) => c.koota === "NADI")!;

  // --- Exception overlays (never mutate raw scores) ---------------------------
  const bhakootExceptions = evaluateBhakootExceptions(personAContext, personBContext, bhakoot);
  const nadiExceptions = evaluateNadiExceptions(personAContext, personBContext, nadi);

  bhakoot.exceptionResults = bhakootExceptions;
  bhakoot.exceptionApplicable = bhakootExceptions.length > 0;
  nadi.exceptionResults = nadiExceptions;
  nadi.exceptionApplicable = nadiExceptions.length > 0;

  const exceptionResults: ExceptionResult[] = [...bhakootExceptions, ...nadiExceptions];

  // --- Raw total = exact sum of the 8 raw component scores --------------------
  const rawTotal = componentResults.reduce(
    (sum, component) => sum + (component.rawScore ?? 0),
    0
  );
  const availableMaximumTotal = componentResults.reduce(
    (sum, component) => sum + (component.status === "available" ? component.maximumScore : 0),
    0
  );
  const availableComponents = componentResults.filter(
    (component) => component.status === "available"
  ).length;

  for (const component of componentResults) {
    if (component.status === "unavailable" && component.unavailableReason) {
      unavailableReasons.push({
        system: `koota:${component.koota}`,
        code: component.tableEntry === "ROLE_REQUIRED" ? "ROLE_REQUIRED" : "COMPONENT_UNAVAILABLE",
        message: component.unavailableReason,
      });
    }
  }

  // --- Manglik (separate; never touches rawTotal) -----------------------------
  const manglikComparison = includeManglik
    ? buildManglikComparison(personAContext, personBContext)
    : null;

  if (manglikComparison && manglikComparison.status === "unavailable") {
    unavailableReasons.push({
      system: "manglik",
      code: "MANGLIK_UNAVAILABLE",
      message: manglikComparison.detail,
    });
  }

  const bhakootExceptionStatus: AshtakootMatchSnapshot["bhakootExceptionStatus"] =
    bhakoot.status !== "available"
      ? "unavailable"
      : bhakootExceptions.length > 0
        ? "cancellation_applicable"
        : "not_applicable";
  const nadiExceptionStatus: AshtakootMatchSnapshot["nadiExceptionStatus"] =
    nadi.status !== "available"
      ? "unavailable"
      : nadiExceptions.length > 0
        ? "cancellation_applicable"
        : "not_applicable";

  // --- Overall status ---------------------------------------------------------
  let status: AshtakootMatchSnapshot["status"];

  if (availableComponents === 0) {
    status = "unavailable";
  } else if (availableComponents === 8 && (!includeManglik || manglikComparison?.status !== "unavailable")) {
    status = "ok";
  } else {
    status = "partial";
  }

  const sourceSystemReadiness: AshtakootMatchSnapshot["sourceSystemReadiness"] = {
    personAChart: personAContext.verified ? "ready" : "unavailable",
    personBChart: personBContext.verified ? "ready" : "unavailable",
    ashtakoot: availableComponents === 8 ? "ready" : availableComponents > 0 ? "partial" : "unavailable",
    manglik: !includeManglik
      ? "unavailable"
      : manglikComparison?.status === "unavailable"
        ? "unavailable"
        : manglikComparison?.status === "mixed"
          ? "partial"
          : "ready",
  };

  const calculationReferences = [
    ...new Set(componentResults.map((component) => component.calculationReference)),
    ...(manglikComparison ? ["card10:manglik"] : []),
  ];

  return {
    status,
    contractVersion: MATCHMAKING_CONTRACT_VERSION,
    conventions: MATCHMAKING_CONVENTIONS,
    personAContext,
    personBContext,
    calculationRoles: { personA: roleA, personB: roleB },
    ashtakoot: {
      rawTotal,
      maximumTotal: 36,
      availableMaximumTotal,
      componentResults,
    },
    bhakootExceptionStatus,
    nadiExceptionStatus,
    exceptionResults,
    manglikComparison,
    sourceSystemReadiness,
    completeness: {
      availableComponents,
      totalComponents: 8,
      manglikAvailable: manglikComparison !== null && manglikComparison.status !== "unavailable",
    },
    calculationReferences,
    unavailableReasons,
    flags: {
      rolesProvided: roleA !== null && roleB !== null,
      ashtakootOnlyMode: ashtakootOnly,
      dashaCompatReady: false,
      navamshaReady: false,
      seventhHouseReady: false,
    },
    disclaimer: MATCHMAKING_DISCLAIMER,
  };
}
