import {
  buildAstrologyChartSummary,
  createAstrologyInfrastructureSnapshot,
  type AstrologyChartSummary,
  type AstrologyInfrastructureSnapshot,
} from "@/modules/astrology/core";
import { normalizeUnifiedSiderealChart } from "@/modules/astrology/core/normalize";
import { getYogaRuleContextForChart } from "@/modules/astrology/yoga-rule-context";
import type {
  HouseNumber,
  PlanetaryBody,
  YogaKey,
} from "@/modules/astrology/types";
import {
  exaltationSignsByBody,
  ownSignsByBody,
  planetLabelMap,
} from "@/lib/astrology/constants";
import type { UnifiedSiderealChart } from "@/modules/astrology/chart-contract-types";

export type YogaStatus = "present" | "absent" | "partial" | "unavailable";
export type YogaConfidence = "high" | "medium" | "low";
export type YogaImpactStrength = "mild" | "moderate" | "strong" | "unavailable";
export type YogaRemedyType =
  | "mantra"
  | "charity"
  | "discipline"
  | "worship"
  | "gemstone"
  | "rudraksha"
  | "lifestyle"
  | "consultation";

export type YogaDetectionResult = {
  yogaKey: YogaKey;
  yogaName: string;
  status: YogaStatus;
  confidence: YogaConfidence;
  basis: string[];
  involvedPlanets: PlanetaryBody[];
  involvedHouses: HouseNumber[];
  strength: YogaImpactStrength;
  safeSummary: string;
  missingReason: string | null;
};

export type YogaRemedyMapping = {
  relatedYogaOrDoshaKey: YogaKey;
  remedyType: YogaRemedyType;
  title: string;
  safeDescription: string;
  caution: string;
  optional: true;
  guaranteedResult: false;
};

export type YogaDetectionEngineData = {
  chartReady: boolean;
  chartSummary: AstrologyChartSummary;
  yogas: YogaDetectionResult[];
  remedies: YogaRemedyMapping[];
  summary: string;
  highlights: string[];
  cautions: string[];
  next_steps: string[];
  warnings: string[];
  reportSummary: string;
  aiSummary: string;
  missingReason: string | null;
};

export type YogaInfrastructureSnapshot = AstrologyInfrastructureSnapshot<YogaDetectionEngineData>;

type NormalizedPlanet = NonNullable<
  ReturnType<typeof normalizeUnifiedSiderealChart>
>["planets"][number];

type NormalizedHouse = NonNullable<
  ReturnType<typeof normalizeUnifiedSiderealChart>
>["houses"][number];

type YogaContext = {
  chart: NonNullable<ReturnType<typeof normalizeUnifiedSiderealChart>>;
  planets: Map<PlanetaryBody, NormalizedPlanet>;
  houses: Map<HouseNumber, NormalizedHouse>;
  chartSummary: AstrologyChartSummary;
};

type YogaRuleSuccess = Extract<
  ReturnType<typeof getYogaRuleContextForChart>,
  { success: true }
>["data"];

const yogaLabelMap: Record<YogaKey, string> = {
  RAJ_YOGA: "Raj Yoga",
  DHANA_YOGA: "Dhan Yoga",
  VIPARITA_RAJ_YOGA: "Vipreet Raj Yoga",
  NEECH_BHANG_RAJ_YOGA: "Neech Bhang Raj Yoga",
  PANCH_MAHAPURUSH_YOGA: "Panch Mahapurush Yoga",
  CHANDRA_MANGALA_YOGA: "Chandra-Mangal Yoga",
  GAJ_KESARI_YOGA: "Gaj Kesari Yoga",
  BUDHADITYA_YOGA: "Budhaditya Yoga",
};

const remedyTemplates: Record<
  YogaKey,
  Array<Pick<YogaRemedyMapping, "remedyType" | "title" | "safeDescription" | "caution">>
> = {
  RAJ_YOGA: [
    {
      remedyType: "discipline",
      title: "Keep a steady leadership routine",
      safeDescription: "Use structure, mentoring, and consistent effort to support the chart's leadership themes.",
      caution: "Optional support only; not a guarantee of recognition or status.",
    },
  ],
  DHANA_YOGA: [
    {
      remedyType: "charity",
      title: "Use regular giving with a budget",
      safeDescription: "Practical, consistent charity or service can keep wealth-oriented themes balanced.",
      caution: "Optional support only; not a guarantee of financial gain.",
    },
  ],
  VIPARITA_RAJ_YOGA: [
    {
      remedyType: "consultation",
      title: "Review pressure periods calmly",
      safeDescription: "Use reflective consultation and timing awareness when dusthana-based themes are active.",
      caution: "Optional support only; not a promise of reversal or success.",
    },
  ],
  NEECH_BHANG_RAJ_YOGA: [
    {
      remedyType: "mantra",
      title: "Keep a stabilizing practice",
      safeDescription: "A simple mantra or daily grounding routine can support cancellation-style readings.",
      caution: "Optional support only; not a guaranteed cancellation.",
    },
  ],
  PANCH_MAHAPURUSH_YOGA: [
    {
      remedyType: "worship",
      title: "Honor the active graha with a calm practice",
      safeDescription: "Appropriate devotion or focused reflection can complement a strong kendra-based planet.",
      caution: "Optional support only; not a guarantee of power or success.",
    },
  ],
  CHANDRA_MANGALA_YOGA: [
    {
      remedyType: "lifestyle",
      title: "Keep emotions and action aligned",
      safeDescription: "A steady routine helps balance Moon-Mars momentum without turning it into impulsiveness.",
      caution: "Optional support only; not a guarantee of wealth or initiative.",
    },
  ],
  GAJ_KESARI_YOGA: [
    {
      remedyType: "consultation",
      title: "Use guidance for timing and communication",
      safeDescription: "Consultation can help you use Jupiter-Moon support with clarity and restraint.",
      caution: "Optional support only; not a guarantee of wisdom or recognition.",
    },
  ],
  BUDHADITYA_YOGA: [
    {
      remedyType: "discipline",
      title: "Keep study and speech disciplined",
      safeDescription: "A structured learning or communication routine supports Sun-Mercury themes.",
      caution: "Optional support only; not a guarantee of intelligence or authority.",
    },
  ],
};

function getPlanet(
  context: YogaContext,
  body: PlanetaryBody
): NormalizedPlanet | null {
  return context.planets.get(body) ?? null;
}

function uniqueBodies(values: PlanetaryBody[]) {
  return [...new Set(values)];
}

function uniqueHouses(values: HouseNumber[]) {
  return [...new Set(values)].filter((house): house is HouseNumber => house >= 1 && house <= 12);
}

function isKendraHouse(house: HouseNumber) {
  return [1, 4, 7, 10].includes(house);
}

function buildUnavailableYogaResult(input: {
  yogaKey: YogaKey;
  missingReason: string;
}): YogaDetectionResult {
  return {
    yogaKey: input.yogaKey,
    yogaName: yogaLabelMap[input.yogaKey],
    status: "unavailable",
    confidence: "low",
    basis: [input.missingReason],
    involvedPlanets: [],
    involvedHouses: [],
    strength: "unavailable",
    safeSummary: input.missingReason,
    missingReason: input.missingReason,
  };
}

function buildSignalDrivenYogaResult(input: {
  yogaKey: YogaKey;
  yogaName: string;
  category: YogaRuleSuccess["yoga_signals"][number]["category"];
  ruleContext: YogaRuleSuccess;
  context: YogaContext;
  fallbackBasis: string[];
  fallbackPlanets?: PlanetaryBody[];
  fallbackHouses?: HouseNumber[];
  requiredBodies?: PlanetaryBody[];
}): YogaDetectionResult {
  if (input.requiredBodies?.some((body) => !getPlanet(input.context, body))) {
    return buildUnavailableYogaResult({
      yogaKey: input.yogaKey,
      missingReason: `${input.yogaName} requires ${input.requiredBodies
        .map((body) => planetLabelMap[body])
        .join(", ")} chart context, which is unavailable.`,
    });
  }

  const signal = input.ruleContext.yoga_signals.find(
    (entry) => entry.category === input.category
  );

  if (!signal) {
    return {
      yogaKey: input.yogaKey,
      yogaName: input.yogaName,
      status: "absent",
      confidence: "low",
      basis: input.fallbackBasis,
      involvedPlanets: input.fallbackPlanets ?? [],
      involvedHouses: input.fallbackHouses ?? [],
      strength: "mild",
      safeSummary: `${input.yogaName} was not confirmed in the verified chart.`,
      missingReason: null,
    };
  }

  const involvedPlanets = uniqueBodies(signal.planets_involved);
  const involvedHouses = uniqueHouses(
    involvedPlanets
      .map((body) => getPlanet(input.context, body)?.house)
      .filter((house): house is HouseNumber => typeof house === "number")
  );
  const status: YogaStatus = "present";
  const strength: YogaImpactStrength =
    signal.confidence === "high" ? "strong" : signal.confidence === "medium" ? "moderate" : "mild";

  return {
    yogaKey: input.yogaKey,
    yogaName: input.yogaName,
    status,
    confidence: signal.confidence,
    basis: signal.supporting_rules,
    involvedPlanets,
    involvedHouses,
    strength,
    safeSummary:
      status === "present"
        ? `${input.yogaName} is present as a calm structural pattern in the verified chart.`
        : `${input.yogaName} is partially supported and should be read as a readiness pattern.`,
    missingReason: null,
  };
}

function buildPanchMahapurushYoga(context: YogaContext): YogaDetectionResult {
  const bodies: PlanetaryBody[] = ["MARS", "MERCURY", "JUPITER", "VENUS", "SATURN"];
  const missingBodies = bodies.filter((body) => !getPlanet(context, body));

  if (missingBodies.length > 0) {
    return buildUnavailableYogaResult({
      yogaKey: "PANCH_MAHAPURUSH_YOGA",
      missingReason: `Panch Mahapurush yoga requires ${missingBodies
        .map((body) => planetLabelMap[body])
        .join(", ")} chart context, which is unavailable.`,
    });
  }

  const basis: string[] = [];
  const qualifyingBodies: PlanetaryBody[] = [];
  const qualifyingHouses: HouseNumber[] = [];
  const partialBodies: PlanetaryBody[] = [];
  const partialHouses: HouseNumber[] = [];

  for (const body of bodies) {
    const planet = getPlanet(context, body);

    if (!planet) {
      basis.push(`${planetLabelMap[body]} placement is unavailable.`);
      continue;
    }

    const ownSign = ownSignsByBody[body]?.includes(planet.sign) ?? false;
    const exalted = exaltationSignsByBody[body] === planet.sign;
    const kendra = isKendraHouse(planet.house);

    if (ownSign || exalted) {
      const descriptor = ownSign ? "own sign" : "exalted sign";
      basis.push(
        `${planetLabelMap[body]} occupies ${planet.sign} (${descriptor}) in house ${planet.house}.`
      );

      if (kendra) {
        qualifyingBodies.push(body);
        qualifyingHouses.push(planet.house);
      } else {
        partialBodies.push(body);
        partialHouses.push(planet.house);
      }
    } else {
      basis.push(`${planetLabelMap[body]} is not in own or exalted sign.`);
    }
  }

  if (qualifyingBodies.length > 0) {
    return {
      yogaKey: "PANCH_MAHAPURUSH_YOGA",
      yogaName: yogaLabelMap.PANCH_MAHAPURUSH_YOGA,
      status: "present",
      confidence: "high",
      basis,
      involvedPlanets: uniqueBodies(qualifyingBodies),
      involvedHouses: uniqueHouses(qualifyingHouses),
      strength: "strong",
      safeSummary:
        "Panch Mahapurush yoga support is present through one or more strong graha-kendra combinations.",
      missingReason: null,
    };
  }

  if (partialBodies.length > 0) {
    return {
      yogaKey: "PANCH_MAHAPURUSH_YOGA",
      yogaName: yogaLabelMap.PANCH_MAHAPURUSH_YOGA,
      status: "partial",
      confidence: "medium",
      basis,
      involvedPlanets: uniqueBodies(partialBodies),
      involvedHouses: uniqueHouses(partialHouses),
      strength: "moderate",
      safeSummary:
        "Panch Mahapurush readiness is partial because a qualifying graha has dignity support but not a confirmed kendra placement.",
      missingReason: null,
    };
  }

  return {
    yogaKey: "PANCH_MAHAPURUSH_YOGA",
    yogaName: yogaLabelMap.PANCH_MAHAPURUSH_YOGA,
    status: "absent",
    confidence: "low",
    basis,
    involvedPlanets: [],
    involvedHouses: [],
    strength: "mild",
    safeSummary:
      "Panch Mahapurush yoga was not confirmed in the verified chart context.",
    missingReason: null,
  };
}

function buildYogaRemedies(yogas: YogaDetectionResult[]): YogaRemedyMapping[] {
  return yogas
    .filter((yoga) => yoga.status === "present" || yoga.status === "partial")
    .flatMap((yoga) =>
      (remedyTemplates[yoga.yogaKey] ?? []).map((template) => ({
        relatedYogaOrDoshaKey: yoga.yogaKey,
        remedyType: template.remedyType,
        title: template.title,
        safeDescription: template.safeDescription,
        caution: template.caution,
        optional: true as const,
        guaranteedResult: false as const,
      }))
    );
}

function buildEngineSummary(yogas: YogaDetectionResult[]) {
  const present = yogas.filter((yoga) => yoga.status === "present");
  const partial = yogas.filter((yoga) => yoga.status === "partial");
  const absent = yogas.filter((yoga) => yoga.status === "absent");
  const unavailable = yogas.filter((yoga) => yoga.status === "unavailable");

  return {
    summary: `Yoga detection reviewed ${yogas.length} focused patterns with ${present.length} present, ${partial.length} partial, and ${absent.length} absent.`,
    highlights: present.map((yoga) => `${yoga.yogaName}: ${yoga.safeSummary}`),
    cautions: [
      ...partial.map((yoga) => `${yoga.yogaName}: ${yoga.safeSummary}`),
      ...present
        .filter((yoga) => yoga.strength === "strong")
        .map((yoga) => `${yoga.yogaName}: strong structural support is present; keep interpretation practical.`),
    ],
    next_steps: [
      "Read yoga patterns as structural support, not guaranteed outcomes.",
      "Use report and AI layers to explain the pattern in practical language.",
      "Re-run the engine when fuller chart context becomes available for partial or unavailable yogas.",
    ],
    warnings: [
      ...(unavailable.length > 0
        ? ["Some yoga checks are unavailable because the required chart context is incomplete."]
        : []),
      "Yoga detection is pattern-based and should not be treated as certainty language.",
    ],
    reportSummary:
      "The yoga engine returns calm, structured pattern readings that can be consumed by reports, AI context, and consultation flows without turning the result into a certainty claim.",
    aiSummary:
      "Use the yoga output as context for a balanced explanation, not as a deterministic prediction or success guarantee.",
  };
}

export function buildYogaDetectionEngine(input: {
  chart: UnifiedSiderealChart | null | undefined;
}): YogaInfrastructureSnapshot {
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
        message: "Verified chart context is required for yoga detection.",
      },
    });
  }

  const ruleContext = getYogaRuleContextForChart({
    chart: input.chart,
  });

  if (!ruleContext.success) {
    return createAstrologyInfrastructureSnapshot({
      status: "unavailable",
      data: null,
      error: {
        code: ruleContext.issue.code,
        message: ruleContext.issue.message,
        details: ruleContext.issue,
      },
    });
  }

  const context: YogaContext = {
    chart: normalizedChart,
    planets: new Map(normalizedChart.planets.map((planet) => [planet.body, planet] as const)),
    houses: new Map(normalizedChart.houses.map((house) => [house.house, house] as const)),
    chartSummary: buildAstrologyChartSummary(normalizedChart, {
      chartKind: "NATAL",
      note:
        "Yoga detection uses calm structural pattern recognition over the verified D1 chart.",
    }),
  };

  const rajYoga = buildSignalDrivenYogaResult({
    yogaKey: "RAJ_YOGA",
    yogaName: yogaLabelMap.RAJ_YOGA,
    category: "RAJA_YOGA_CANDIDATE",
    ruleContext: ruleContext.data,
    context,
    fallbackBasis: [
      "No kendra-trikona lord linkage was confirmed in the verified chart.",
    ],
  });
  const dhanYoga = buildSignalDrivenYogaResult({
    yogaKey: "DHANA_YOGA",
    yogaName: yogaLabelMap.DHANA_YOGA,
    category: "DHANA_YOGA_CANDIDATE",
    ruleContext: ruleContext.data,
    context,
    fallbackBasis: [
      "No wealth-fortune lord linkage was confirmed in the verified chart.",
    ],
  });
  const viparitaRajYoga = buildSignalDrivenYogaResult({
    yogaKey: "VIPARITA_RAJ_YOGA",
    yogaName: yogaLabelMap.VIPARITA_RAJ_YOGA,
    category: "VIPARITA_RAJA_CANDIDATE",
    ruleContext: ruleContext.data,
    context,
    fallbackBasis: [
      "No dusthana-lord-in-dusthana structure was confirmed in the verified chart.",
    ],
  });
  const neechBhangRajYoga = buildSignalDrivenYogaResult({
    yogaKey: "NEECH_BHANG_RAJ_YOGA",
    yogaName: yogaLabelMap.NEECH_BHANG_RAJ_YOGA,
    category: "NEECHA_BHANGA_CANDIDATE",
    ruleContext: ruleContext.data,
    context,
    fallbackBasis: [
      "No first-pass Neech Bhanga support was confirmed in the verified chart.",
    ],
  });
  const chandraMangalaYoga = buildSignalDrivenYogaResult({
    yogaKey: "CHANDRA_MANGALA_YOGA",
    yogaName: yogaLabelMap.CHANDRA_MANGALA_YOGA,
    category: "CHANDRA_MANGALA_CANDIDATE",
    ruleContext: ruleContext.data,
    context,
    fallbackBasis: [
      "No Moon-Mars structural link was confirmed in the verified chart.",
    ],
    fallbackPlanets: ["MOON", "MARS"],
    fallbackHouses: [
      ...new Set([
        getPlanet(context, "MOON")?.house,
        getPlanet(context, "MARS")?.house,
      ].filter((house): house is HouseNumber => typeof house === "number")),
    ],
    requiredBodies: ["MOON", "MARS"],
  });
  const gajKesariYoga = buildSignalDrivenYogaResult({
    yogaKey: "GAJ_KESARI_YOGA",
    yogaName: yogaLabelMap.GAJ_KESARI_YOGA,
    category: "GAJA_KESARI_CANDIDATE",
    ruleContext: ruleContext.data,
    context,
    fallbackBasis: [
      "No Moon-Jupiter kendra structure was confirmed in the verified chart.",
    ],
    fallbackPlanets: ["MOON", "JUPITER"],
    fallbackHouses: [
      ...new Set([
        getPlanet(context, "MOON")?.house,
        getPlanet(context, "JUPITER")?.house,
      ].filter((house): house is HouseNumber => typeof house === "number")),
    ],
    requiredBodies: ["MOON", "JUPITER"],
  });
  const budhadityaYoga = buildSignalDrivenYogaResult({
    yogaKey: "BUDHADITYA_YOGA",
    yogaName: yogaLabelMap.BUDHADITYA_YOGA,
    category: "BUDHA_ADITYA_CANDIDATE",
    ruleContext: ruleContext.data,
    context,
    fallbackBasis: [
      "No Sun-Mercury structural link was confirmed in the verified chart.",
    ],
    fallbackPlanets: ["SUN", "MERCURY"],
    fallbackHouses: [
      ...new Set([
        getPlanet(context, "SUN")?.house,
        getPlanet(context, "MERCURY")?.house,
      ].filter((house): house is HouseNumber => typeof house === "number")),
    ],
    requiredBodies: ["SUN", "MERCURY"],
  });
  const panchMahapurushYoga = buildPanchMahapurushYoga(context);

  const yogas = [
    rajYoga,
    dhanYoga,
    viparitaRajYoga,
    neechBhangRajYoga,
    panchMahapurushYoga,
    chandraMangalaYoga,
    gajKesariYoga,
    budhadityaYoga,
  ];
  const remedies = buildYogaRemedies(yogas);

  const hasPartial = yogas.some((yoga) => yoga.status === "partial");
  const hasUnavailable = yogas.some((yoga) => yoga.status === "unavailable");
  const overallStatus = hasPartial ? "partial" : hasUnavailable ? "partial" : "ready";
  const engineSummary = buildEngineSummary(yogas);

  return createAstrologyInfrastructureSnapshot({
    status: overallStatus,
    data: {
      chartReady: true,
      chartSummary: context.chartSummary,
      yogas,
      remedies,
      summary: engineSummary.summary,
      highlights: engineSummary.highlights,
      cautions: engineSummary.cautions,
      next_steps: engineSummary.next_steps,
      warnings: engineSummary.warnings,
      reportSummary: engineSummary.reportSummary,
      aiSummary: engineSummary.aiSummary,
      missingReason:
        hasUnavailable || hasPartial
          ? "One or more yoga checks are partial or unavailable in the foundation layer."
          : null,
    },
    error: null,
  });
}

export const buildYogaInfrastructureSnapshot = buildYogaDetectionEngine;
