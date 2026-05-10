import {
  exaltationSignsByBody,
  ownSignsByBody,
  planetLabelMap,
  signRulerMap,
} from "@/lib/astrology/constants";
import type { UnifiedSiderealChart } from "@/modules/astrology/chart-contract-types";
import {
  buildAstrologyChartSummary,
  createAstrologyInfrastructureSnapshot,
  type AstrologyChartSummary,
  type AstrologyInfrastructureSnapshot,
} from "@/modules/astrology/core";
import { normalizeUnifiedSiderealChart } from "@/modules/astrology/core/normalize";
import type { HouseNumber, PlanetaryBody } from "@/modules/astrology/types";

export type DoshaKey =
  | "MANGAL_DOSHA"
  | "KAAL_SARP_DOSHA"
  | "PITRU_DOSHA"
  | "GURU_CHANDAL_DOSHA"
  | "GRAHAN_DOSHA"
  | "SHRAPIT_TYPE_DOSHA";

export type DoshaStatus = "present" | "absent" | "partial" | "unavailable";
export type DoshaConfidence = "high" | "medium" | "low";
export type DoshaSeverity = "mild" | "moderate" | "strong" | "unavailable";

export type DoshaDetectionResult = {
  doshaKey: DoshaKey;
  doshaName: string;
  status: DoshaStatus;
  confidence: DoshaConfidence;
  basis: string[];
  affectedPlanets: PlanetaryBody[];
  affectedHouses: HouseNumber[];
  severity: DoshaSeverity;
  cancellationOrMitigation: string[];
  safeSummary: string;
  missingReason: string | null;
};

export type DoshaDetectionEngineData = {
  chartReady: boolean;
  chartSummary: AstrologyChartSummary;
  doshas: DoshaDetectionResult[];
  summary: string;
  highlights: string[];
  cautions: string[];
  next_steps: string[];
  warnings: string[];
  reportSummary: string;
  aiSummary: string;
  missingReason: string | null;
};

export type DoshaInfrastructureSnapshot =
  AstrologyInfrastructureSnapshot<DoshaDetectionEngineData>;

type NormalizedPlanet = NonNullable<
  ReturnType<typeof normalizeUnifiedSiderealChart>
>["planets"][number];

type NormalizedHouse = NonNullable<
  ReturnType<typeof normalizeUnifiedSiderealChart>
>["houses"][number];

type DoshaContext = {
  chart: NonNullable<ReturnType<typeof normalizeUnifiedSiderealChart>>;
  planets: Map<PlanetaryBody, NormalizedPlanet>;
  houses: Map<HouseNumber, NormalizedHouse>;
};

const sensitiveManglikHouses = new Set<HouseNumber>([1, 2, 4, 7, 8, 12]);

const doshaLabelMap: Record<DoshaKey, string> = {
  MANGAL_DOSHA: "Mangal Dosha",
  KAAL_SARP_DOSHA: "Kaal Sarp Dosha",
  PITRU_DOSHA: "Pitru Dosha",
  GURU_CHANDAL_DOSHA: "Guru Chandal Dosha",
  GRAHAN_DOSHA: "Grahan Dosha",
  SHRAPIT_TYPE_DOSHA: "Shrapit / Shani-Rahu Pattern",
};

function getPlanet(
  context: DoshaContext,
  body: PlanetaryBody
): NormalizedPlanet | null {
  return context.planets.get(body) ?? null;
}

function getHouse(
  context: DoshaContext,
  house: HouseNumber
): NormalizedHouse | null {
  return context.houses.get(house) ?? null;
}

function getRelativeHouse(subjectHouse: number, referenceHouse: number) {
  return ((subjectHouse - referenceHouse + 12) % 12) + 1;
}

function getHouseDistance(leftHouse: number, rightHouse: number) {
  return ((rightHouse - leftHouse + 12) % 12) + 1;
}

function isBetweenExclusive(subjectHouse: number, startHouse: number, endHouse: number) {
  const subjectDistance = getHouseDistance(startHouse, subjectHouse);
  const endDistance = getHouseDistance(startHouse, endHouse);

  return subjectDistance > 1 && subjectDistance < endDistance;
}

function uniqueBodies(values: PlanetaryBody[]) {
  return [...new Set(values)];
}

function uniqueHouses(values: HouseNumber[]) {
  return [...new Set(values)];
}

function buildUnavailableDoshaResult(input: {
  doshaKey: DoshaKey;
  missingReason: string;
}): DoshaDetectionResult {
  return {
    doshaKey: input.doshaKey,
    doshaName: doshaLabelMap[input.doshaKey],
    status: "unavailable",
    confidence: "low",
    basis: [input.missingReason],
    affectedPlanets: [],
    affectedHouses: [],
    severity: "unavailable",
    cancellationOrMitigation: [],
    safeSummary: input.missingReason,
    missingReason: input.missingReason,
  };
}

function buildMangalDosha(context: DoshaContext): DoshaDetectionResult {
  const mars = getPlanet(context, "MARS");
  const moon = getPlanet(context, "MOON");
  const venus = getPlanet(context, "VENUS");

  if (!mars) {
    return buildUnavailableDoshaResult({
      doshaKey: "MANGAL_DOSHA",
      missingReason: "Mars placement is unavailable for Mangal Dosha detection.",
    });
  }

  const checks = [
    {
      reference: "Lagna",
      house: mars.house,
      ready: true,
      sensitive: sensitiveManglikHouses.has(mars.house),
      basis: `Mars is placed in the ${mars.house}th house from Lagna.`,
    },
    moon
      ? {
          reference: "Moon",
          house: getRelativeHouse(mars.house, moon.house) as HouseNumber,
          ready: true,
          sensitive: sensitiveManglikHouses.has(getRelativeHouse(mars.house, moon.house) as HouseNumber),
          basis: `Mars is placed in the ${getRelativeHouse(mars.house, moon.house)}th house from Moon.`,
        }
      : {
          reference: "Moon",
          house: null,
          ready: false,
          sensitive: false,
          basis: "Moon-based Manglik check is unavailable.",
        },
    venus
      ? {
          reference: "Venus",
          house: getRelativeHouse(mars.house, venus.house) as HouseNumber,
          ready: true,
          sensitive: sensitiveManglikHouses.has(getRelativeHouse(mars.house, venus.house) as HouseNumber),
          basis: `Mars is placed in the ${getRelativeHouse(mars.house, venus.house)}th house from Venus.`,
        }
      : {
          reference: "Venus",
          house: null,
          ready: false,
          sensitive: false,
          basis: "Venus-based Manglik check is unavailable.",
        },
  ] as const;

  const readyChecks = checks.filter((check) => check.ready);
  const sensitiveCount = readyChecks.filter((check) => check.sensitive).length;
  const missingChecks = checks.filter((check) => !check.ready).map((check) => check.basis);
  const isOwnOrExalted =
    ownSignsByBody.MARS?.includes(mars.sign) || exaltationSignsByBody.MARS === mars.sign;

  const status: DoshaStatus =
    readyChecks.length === checks.length
      ? sensitiveCount > 0
        ? "present"
        : "absent"
      : "partial";

  const severity: DoshaSeverity =
    sensitiveCount === 0
      ? "mild"
      : sensitiveCount === 1
        ? "moderate"
        : "strong";

  const confidence: DoshaConfidence =
    readyChecks.length === checks.length ? "high" : readyChecks.length === 1 ? "low" : "medium";

  const cancellationOrMitigation = uniqueBodies([
    ...((isOwnOrExalted ? ["MARS"] : []) as PlanetaryBody[]),
  ]).map((body) => `${planetLabelMap[body]} dignity softens the reading in this phase.`);

  return {
    doshaKey: "MANGAL_DOSHA",
    doshaName: doshaLabelMap.MANGAL_DOSHA,
    status,
    confidence,
    basis: checks.map((check) => check.basis),
    affectedPlanets: uniqueBodies([
      "MARS" as PlanetaryBody,
      ...((moon ? ["MOON"] : []) as PlanetaryBody[]),
      ...((venus ? ["VENUS"] : []) as PlanetaryBody[]),
    ]),
    affectedHouses: uniqueHouses([
      mars.house,
      ...(moon ? [moon.house] : []),
      ...(venus ? [venus.house] : []),
    ]),
    severity,
    cancellationOrMitigation,
    safeSummary:
      status === "present"
        ? "Mangal Dosha markers are present in the available chart references and should be read as context, not certainty."
        : status === "absent"
          ? "No Mangal Dosha marker was confirmed in the ready chart references."
          : "Mangal Dosha reading is partial because one or more optional reference checks are unavailable.",
    missingReason: missingChecks.length > 0 ? missingChecks.join(" ") : null,
  };
}

function buildKaalSarpDosha(context: DoshaContext): DoshaDetectionResult {
  const rahu = getPlanet(context, "RAHU");
  const ketu = getPlanet(context, "KETU");

  if (!rahu || !ketu) {
    return buildUnavailableDoshaResult({
      doshaKey: "KAAL_SARP_DOSHA",
      missingReason: "Rahu/Ketu axis is unavailable for Kaal Sarp detection.",
    });
  }

  const nodesOpposed = getHouseDistance(rahu.house, ketu.house) === 7;
  const otherPlanets = context.chart.planets.filter(
    (planet) => planet.body !== "RAHU" && planet.body !== "KETU"
  );
  const houseBandFromRahu = otherPlanets.every((planet) =>
    isBetweenExclusive(planet.house, rahu.house, ketu.house)
  );
  const houseBandFromKetu = otherPlanets.every((planet) =>
    isBetweenExclusive(planet.house, ketu.house, rahu.house)
  );
  const inBand = nodesOpposed && (houseBandFromRahu || houseBandFromKetu);
  const hasEnoughContext = otherPlanets.length > 0;
  const status: DoshaStatus = inBand ? "present" : hasEnoughContext ? "absent" : "partial";
  const severity: DoshaSeverity =
    status === "present" ? "strong" : status === "partial" ? "moderate" : "mild";
  const confidence: DoshaConfidence =
    status === "present" ? "high" : hasEnoughContext ? "medium" : "low";

  const affectedPlanets = uniqueBodies([
    ...otherPlanets.map((planet) => planet.body),
    "RAHU" as PlanetaryBody,
    "KETU" as PlanetaryBody,
  ]);
  const affectedHouses = uniqueHouses([
    ...otherPlanets.map((planet) => planet.house),
    rahu.house,
    ketu.house,
  ]);

  const basis = [
    `Rahu is in the ${rahu.house}th house and Ketu is in the ${ketu.house}th house.`,
    inBand
      ? "All tracked planets fall within a single Rahu-Ketu arc in the verified chart."
      : "At least one tracked planet falls outside the Rahu-Ketu arc in the verified chart.",
  ];

  const cancellationOrMitigation = inBand
    ? ["No mitigation layer is applied in this phase; the pattern is reported as a calm structural reading."]
    : [];

  return {
    doshaKey: "KAAL_SARP_DOSHA",
    doshaName: doshaLabelMap.KAAL_SARP_DOSHA,
    status,
    confidence,
    basis,
    affectedPlanets,
    affectedHouses,
    severity,
    cancellationOrMitigation,
    safeSummary:
      status === "present"
        ? "Kaal Sarp pattern is present in the current chart band and should be read calmly as a structural pattern."
        : status === "absent"
          ? "Kaal Sarp pattern was not confirmed in the verified chart band."
          : "Kaal Sarp reading is partial because the chart context is incomplete.",
    missingReason: hasEnoughContext ? null : "One or more planetary placements are unavailable.",
  };
}

function buildPitruDosha(context: DoshaContext): DoshaDetectionResult {
  const sun = getPlanet(context, "SUN");
  const rahu = getPlanet(context, "RAHU");
  const saturn = getPlanet(context, "SATURN");
  const house9 = getHouse(context, 9);

  if (!sun || !rahu || !saturn || !house9) {
    return buildUnavailableDoshaResult({
      doshaKey: "PITRU_DOSHA",
      missingReason: "Sun, Rahu, Saturn, or the 9th house context is unavailable for Pitru Dosha detection.",
    });
  }

  const ninthLord = signRulerMap[house9.sign];
  const ninthLordPlacement = getPlanet(context, ninthLord);
  if (!ninthLordPlacement) {
    return buildUnavailableDoshaResult({
      doshaKey: "PITRU_DOSHA",
      missingReason: "The 9th house lord placement is unavailable for Pitru Dosha detection.",
    });
  }

  const basis: string[] = [];
  const affectedPlanets = uniqueBodies([sun.body, rahu.body, saturn.body, ninthLordPlacement.body]);
  const affectedHouses = uniqueHouses([sun.house, rahu.house, saturn.house, ninthLordPlacement.house, 9]);
  let signalCount = 0;

  if (sun.house === rahu.house || sun.house === saturn.house) {
    basis.push("Sun shares a house with Rahu or Saturn.");
    signalCount += 1;
  }

  if (rahu.house === 9 || saturn.house === 9) {
    basis.push("The 9th house is occupied by Rahu or Saturn.");
    signalCount += 1;
  }

  if (
    ninthLordPlacement.house === 6 ||
    ninthLordPlacement.house === 8 ||
    ninthLordPlacement.house === 12 ||
    ninthLordPlacement.house === rahu.house ||
    ninthLordPlacement.house === saturn.house
  ) {
    basis.push("The 9th house lord is placed in a sensitive house or with a shadow-leaning graha.");
    signalCount += 1;
  }

  const status: DoshaStatus =
    signalCount >= 2 ? "present" : signalCount === 1 ? "partial" : "absent";
  const severity: DoshaSeverity =
    signalCount >= 3 ? "strong" : signalCount === 2 ? "moderate" : "mild";
  const confidence: DoshaConfidence =
    signalCount >= 2 ? "high" : signalCount === 1 ? "medium" : "low";

  const cancellationOrMitigation = [
    ...(ownSignsByBody[sun.body]?.includes(sun.sign) || exaltationSignsByBody[sun.body] === sun.sign
      ? ["Sun dignity is supportive in the current chart."]
      : []),
    ...(ownSignsByBody[ninthLordPlacement.body]?.includes(ninthLordPlacement.sign) ||
    exaltationSignsByBody[ninthLordPlacement.body] === ninthLordPlacement.sign
      ? ["The 9th house lord has supportive dignity in the current chart."]
      : []),
  ];

  return {
    doshaKey: "PITRU_DOSHA",
    doshaName: doshaLabelMap.PITRU_DOSHA,
    status,
    confidence,
    basis:
      basis.length > 0
        ? basis
        : ["No Pitru Dosha style signal was confirmed in the verified chart."],
    affectedPlanets,
    affectedHouses,
    severity,
    cancellationOrMitigation,
    safeSummary:
      status === "present"
        ? "Pitru Dosha style signals are present in the current chart context and should be read as a practical family-lineage pattern."
        : status === "absent"
          ? "No Pitru Dosha style signal was confirmed in the verified chart context."
          : "Pitru Dosha reading is partial and should be revisited with fuller chart context.",
    missingReason: null,
  };
}

function buildGuruChandalDosha(context: DoshaContext): DoshaDetectionResult {
  const jupiter = getPlanet(context, "JUPITER");
  const rahu = getPlanet(context, "RAHU");
  const ketu = getPlanet(context, "KETU");

  if (!jupiter || (!rahu && !ketu)) {
    return buildUnavailableDoshaResult({
      doshaKey: "GURU_CHANDAL_DOSHA",
      missingReason: "Jupiter and Rahu/Ketu context is unavailable for Guru Chandal detection.",
    });
  }

  const associations = [
    rahu && (jupiter.house === rahu.house || jupiter.sign === rahu.sign)
      ? { node: rahu.body, label: "Rahu" }
      : null,
    ketu && (jupiter.house === ketu.house || jupiter.sign === ketu.sign)
      ? { node: ketu.body, label: "Ketu" }
      : null,
  ].filter((item): item is { node: PlanetaryBody; label: string } => Boolean(item));

  const status: DoshaStatus =
    associations.length > 0 ? "present" : rahu || ketu ? "absent" : "partial";
  const severity: DoshaSeverity =
    associations.length > 0 ? (associations.length > 1 ? "strong" : "moderate") : "mild";
  const confidence: DoshaConfidence = associations.length > 0 ? "high" : "medium";

  return {
    doshaKey: "GURU_CHANDAL_DOSHA",
    doshaName: doshaLabelMap.GURU_CHANDAL_DOSHA,
    status,
    confidence,
    basis: [
      `Jupiter is placed in the ${jupiter.house}th house.`,
      ...(rahu ? [`Rahu is placed in the ${rahu.house}th house.`] : ["Rahu placement is unavailable."]),
      ...(ketu ? [`Ketu is placed in the ${ketu.house}th house.`] : ["Ketu placement is unavailable."]),
      ...(associations.length > 0
        ? associations.map((item) => `Jupiter is associated with ${item.label}.`)
        : ["No Jupiter-Rahu/Ketu association was confirmed in the verified chart."]),
    ],
    affectedPlanets: uniqueBodies([
      "JUPITER" as PlanetaryBody,
      ...((rahu && (jupiter.house === rahu.house || jupiter.sign === rahu.sign)
        ? ["RAHU"]
        : []) as PlanetaryBody[]),
      ...((ketu && (jupiter.house === ketu.house || jupiter.sign === ketu.sign)
        ? ["KETU"]
        : []) as PlanetaryBody[]),
    ]),
    affectedHouses: uniqueHouses([
      jupiter.house,
      ...(rahu && (jupiter.house === rahu.house || jupiter.sign === rahu.sign) ? [rahu.house] : []),
      ...(ketu && (jupiter.house === ketu.house || jupiter.sign === ketu.sign) ? [ketu.house] : []),
    ]),
    severity,
    cancellationOrMitigation:
      jupiter.sign &&
      (ownSignsByBody.JUPITER?.includes(jupiter.sign) || exaltationSignsByBody.JUPITER === jupiter.sign)
        ? ["Jupiter dignity softens the reading in the current chart."]
        : [],
    safeSummary:
      status === "present"
        ? "Guru Chandal pattern is present as a contextual reading around Jupiter and the shadow nodes."
        : status === "absent"
          ? "No Guru Chandal pattern was confirmed in the verified chart."
          : "Guru Chandal reading is partial because some required node context is unavailable.",
    missingReason: null,
  };
}

function buildGrahanDosha(context: DoshaContext): DoshaDetectionResult {
  const sun = getPlanet(context, "SUN");
  const moon = getPlanet(context, "MOON");
  const rahu = getPlanet(context, "RAHU");
  const ketu = getPlanet(context, "KETU");

  if (!sun || !moon || (!rahu && !ketu)) {
    return buildUnavailableDoshaResult({
      doshaKey: "GRAHAN_DOSHA",
      missingReason: "Sun, Moon, and Rahu/Ketu context is unavailable for Grahan Dosha detection.",
    });
  }

  const sunAssociation =
    (rahu && (sun.house === rahu.house || sun.sign === rahu.sign)) ||
    (ketu && (sun.house === ketu.house || sun.sign === ketu.sign));
  const moonAssociation =
    (rahu && (moon.house === rahu.house || moon.sign === rahu.sign)) ||
    (ketu && (moon.house === ketu.house || moon.sign === ketu.sign));
  const signalCount = Number(sunAssociation) + Number(moonAssociation);
  const status: DoshaStatus =
    signalCount > 0 ? "present" : rahu || ketu ? "absent" : "partial";
  const severity: DoshaSeverity =
    signalCount >= 2 ? "strong" : signalCount === 1 ? "moderate" : "mild";
  const confidence: DoshaConfidence = signalCount > 0 ? "high" : "medium";

  return {
    doshaKey: "GRAHAN_DOSHA",
    doshaName: doshaLabelMap.GRAHAN_DOSHA,
    status,
    confidence,
    basis: [
      `Sun is placed in the ${sun.house}th house.`,
      `Moon is placed in the ${moon.house}th house.`,
      ...(sunAssociation ? ["Sun is associated with Rahu or Ketu in the verified chart."] : []),
      ...(moonAssociation ? ["Moon is associated with Rahu or Ketu in the verified chart."] : []),
      ...(signalCount === 0
        ? ["No Grahan style association was confirmed in the verified chart."]
        : []),
    ],
    affectedPlanets: uniqueBodies([
      "SUN" as PlanetaryBody,
      "MOON" as PlanetaryBody,
      ...((sunAssociation && rahu ? ["RAHU"] : []) as PlanetaryBody[]),
      ...((sunAssociation && ketu ? ["KETU"] : []) as PlanetaryBody[]),
      ...((moonAssociation && rahu ? ["RAHU"] : []) as PlanetaryBody[]),
      ...((moonAssociation && ketu ? ["KETU"] : []) as PlanetaryBody[]),
    ]),
    affectedHouses: uniqueHouses([
      sun.house,
      moon.house,
      ...(sunAssociation && rahu ? [rahu.house] : []),
      ...(sunAssociation && ketu ? [ketu.house] : []),
      ...(moonAssociation && rahu ? [rahu.house] : []),
      ...(moonAssociation && ketu ? [ketu.house] : []),
    ]),
    severity,
    cancellationOrMitigation: [],
    safeSummary:
      status === "present"
        ? "Grahan pattern is present as a calm association-based reading around the luminaries and shadow nodes."
        : status === "absent"
          ? "No Grahan pattern was confirmed in the verified chart."
          : "Grahan reading is partial because some required node context is unavailable.",
    missingReason: null,
  };
}

function buildShrapitDosha(context: DoshaContext): DoshaDetectionResult {
  const saturn = getPlanet(context, "SATURN");
  const rahu = getPlanet(context, "RAHU");
  const ketu = getPlanet(context, "KETU");

  if (!saturn || (!rahu && !ketu)) {
    return buildUnavailableDoshaResult({
      doshaKey: "SHRAPIT_TYPE_DOSHA",
      missingReason: "Saturn and Rahu/Ketu context is unavailable for Shrapit-type detection.",
    });
  }

  const saturnAssociation =
    (rahu && (saturn.house === rahu.house || saturn.sign === rahu.sign)) ||
    (ketu && (saturn.house === ketu.house || saturn.sign === ketu.sign));
  const status: DoshaStatus =
    saturnAssociation ? "present" : rahu || ketu ? "absent" : "partial";
  const severity: DoshaSeverity = saturnAssociation ? "moderate" : "mild";
  const confidence: DoshaConfidence = saturnAssociation ? "high" : "medium";

  return {
    doshaKey: "SHRAPIT_TYPE_DOSHA",
    doshaName: doshaLabelMap.SHRAPIT_TYPE_DOSHA,
    status,
    confidence,
    basis: [
      `Saturn is placed in the ${saturn.house}th house.`,
      ...(rahu ? [`Rahu is placed in the ${rahu.house}th house.`] : ["Rahu placement is unavailable."]),
      ...(ketu ? [`Ketu is placed in the ${ketu.house}th house.`] : ["Ketu placement is unavailable."]),
      ...(saturnAssociation
        ? ["Saturn is associated with Rahu or Ketu in the verified chart."]
        : ["No Shrapit-type Saturn-Rahu/Ketu association was confirmed in the verified chart."]),
    ],
    affectedPlanets: uniqueBodies([
      "SATURN" as PlanetaryBody,
      ...((saturnAssociation && rahu ? ["RAHU"] : []) as PlanetaryBody[]),
      ...((saturnAssociation && ketu ? ["KETU"] : []) as PlanetaryBody[]),
    ]),
    affectedHouses: uniqueHouses([
      saturn.house,
      ...(saturnAssociation && rahu ? [rahu.house] : []),
      ...(saturnAssociation && ketu ? [ketu.house] : []),
    ]),
    severity,
    cancellationOrMitigation: [],
    safeSummary:
      status === "present"
        ? "Shrapit / Shani-Rahu pattern is present as a calm association-based reading around Saturn and the shadow nodes."
        : status === "absent"
          ? "No Shrapit / Shani-Rahu pattern was confirmed in the verified chart."
          : "Shrapit / Shani-Rahu reading is partial because some required node context is unavailable.",
    missingReason: null,
  };
}

function buildEngineSummary(doshas: DoshaDetectionResult[]) {
  const present = doshas.filter((dosha) => dosha.status === "present");
  const partial = doshas.filter((dosha) => dosha.status === "partial");
  const absent = doshas.filter((dosha) => dosha.status === "absent");
  const unavailable = doshas.filter((dosha) => dosha.status === "unavailable");

  return {
    summary: `Dosha detection reviewed ${doshas.length} focused patterns with ${present.length} present, ${partial.length} partial, and ${absent.length} absent.`,
    highlights: present.map((dosha) => `${dosha.doshaName}: ${dosha.safeSummary}`),
    cautions: [
      ...partial.map((dosha) => `${dosha.doshaName}: ${dosha.safeSummary}`),
      ...present
        .filter((dosha) => dosha.severity === "strong")
        .map((dosha) => `${dosha.doshaName}: stronger pattern detected; keep the reading practical and contextual.`),
    ],
    next_steps: [
      "Read present patterns with consultation and timing context rather than a binary verdict.",
      "Use the report and AI layers to frame practical follow-up instead of fear-based interpretation.",
      "Re-run the engine when fuller chart context becomes available for partial or unavailable doshas.",
    ],
    warnings: [
      ...(unavailable.length > 0
        ? ["Some dosha checks are unavailable because the required chart context is incomplete."]
        : []),
      "Dosha detection is pattern-based and should not be treated as guaranteed outcome language.",
    ],
    reportSummary:
      "The dosha engine returns calm, structured pattern readings that can be consumed by reports, AI context, and consultation flows without turning the result into a certainty claim.",
    aiSummary:
      "Use the dosha output as context for a balanced explanation, not as a deterministic prediction or fear-based conclusion.",
  };
}

export function buildDoshaDetectionEngine(input: {
  chart: UnifiedSiderealChart | null | undefined;
}): DoshaInfrastructureSnapshot {
  let normalizedChart: NonNullable<ReturnType<typeof normalizeUnifiedSiderealChart>> | null = null;

  if (input.chart) {
    normalizedChart = normalizeUnifiedSiderealChart(input.chart);
  }

  if (!normalizedChart || !normalizedChart.verification?.is_verified_for_chart_logic) {
    return createAstrologyInfrastructureSnapshot({
      status: "unavailable",
      data: null,
      error: {
        code: "INVALID_CHART_CONTEXT",
        message: "Verified chart context is required for dosha detection.",
      },
    });
  }

  const context: DoshaContext = {
    chart: normalizedChart,
    planets: new Map(normalizedChart.planets.map((planet) => [planet.body, planet] as const)),
    houses: new Map(normalizedChart.houses.map((house) => [house.house, house] as const)),
  };

  const doshas = [
    buildMangalDosha(context),
    buildKaalSarpDosha(context),
    buildPitruDosha(context),
    buildGuruChandalDosha(context),
    buildGrahanDosha(context),
    buildShrapitDosha(context),
  ];

  const hasPartial = doshas.some((dosha) => dosha.status === "partial");
  const hasUnavailable = doshas.some((dosha) => dosha.status === "unavailable");
  const overallStatus = hasPartial ? "partial" : hasUnavailable ? "partial" : "ready";
  const engineSummary = buildEngineSummary(doshas);
  const chartSummary = buildAstrologyChartSummary(normalizedChart, {
    chartKind: "NATAL",
    note:
      "Focused dosha detection uses calm, non-deterministic pattern recognition over the verified D1 chart.",
  });

  return createAstrologyInfrastructureSnapshot({
    status: overallStatus,
    data: {
      chartReady: true,
      chartSummary,
      doshas,
      summary: engineSummary.summary,
      highlights: engineSummary.highlights,
      cautions: engineSummary.cautions,
      next_steps: engineSummary.next_steps,
      warnings: engineSummary.warnings,
      reportSummary: engineSummary.reportSummary,
      aiSummary: engineSummary.aiSummary,
      missingReason:
        hasUnavailable || hasPartial
          ? "One or more dosha checks are partial or unavailable in the foundation layer."
          : null,
    },
    error: null,
  });
}

export const buildDoshaInfrastructureSnapshot = buildDoshaDetectionEngine;
