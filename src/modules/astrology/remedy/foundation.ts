import type { UnifiedSiderealChart } from "@/modules/astrology/chart-contract-types";
import {
  buildAstrologyChartSummary,
  createAstrologyInfrastructureSnapshot,
  type AstrologyChartSummary,
  type AstrologyInfrastructureSnapshot,
} from "@/modules/astrology/core";
import { normalizeUnifiedSiderealChart } from "@/modules/astrology/core/normalize";
import {
  buildDoshaDetectionEngine,
  type DoshaDetectionResult,
  type DoshaInfrastructureSnapshot,
  type DoshaKey,
} from "@/modules/astrology/dosha";
import {
  buildYogaDetectionEngine,
  type YogaDetectionResult,
  type YogaInfrastructureSnapshot,
  type YogaRemedyMapping,
} from "@/modules/astrology/yoga";
import {
  debilitationSignsByBody,
  planetLabelMap,
} from "@/lib/astrology/constants";
import type { HouseNumber, PlanetaryBody, ZodiacSign } from "@/modules/astrology/types";

export type RemedyType =
  | "gemstone"
  | "rudraksha"
  | "mantra"
  | "charity"
  | "discipline"
  | "worship"
  | "lifestyle"
  | "consultation";

export type RemedySuitability = "suitable" | "caution" | "unavailable";
export type RemedyConfidence = "high" | "medium" | "low";

export type PlanetaryWeaknessSignal = {
  planet: PlanetaryBody;
  relatedDoshaOrYoga?: string | null;
  basis: string[];
  strength?: "weak" | "moderate" | "strong" | "supportive";
  house?: HouseNumber | null;
  sign?: ZodiacSign | null;
};

export type RemedyRecommendation = {
  remedyKey: string;
  remedyType: RemedyType;
  title: string;
  relatedPlanet: PlanetaryBody | null;
  relatedDoshaOrYoga: string | null;
  basis: string[];
  suitability: RemedySuitability;
  confidence: RemedyConfidence;
  safeDescription: string;
  instructions: string[];
  cautions: string[];
  optional: true;
  guaranteedResult: false;
  missingReason: string | null;
};

export type RemedyIntelligenceEngineData = {
  chartReady: boolean;
  chartSummary: AstrologyChartSummary;
  remedies: RemedyRecommendation[];
  summary: string;
  highlights: string[];
  cautions: string[];
  next_steps: string[];
  warnings: string[];
  reportSummary: string;
  aiSummary: string;
  missingReason: string | null;
};

export type RemedyInfrastructureSnapshot =
  AstrologyInfrastructureSnapshot<RemedyIntelligenceEngineData>;

export type RemedyMappingLayerData = RemedyIntelligenceEngineData;

export type RemedyIntelligenceInput = {
  chart?: UnifiedSiderealChart | null | undefined;
  doshaSnapshot?: DoshaInfrastructureSnapshot | null | undefined;
  yogaSnapshot?: YogaInfrastructureSnapshot | null | undefined;
  planetSignals?: readonly PlanetaryWeaknessSignal[] | null | undefined;
};

const remedyTypeByDosha: Partial<Record<DoshaKey, RemedyType[]>> = {
  MANGAL_DOSHA: ["mantra", "discipline", "consultation"],
  KAAL_SARP_DOSHA: ["mantra", "charity", "consultation"],
  PITRU_DOSHA: ["charity", "worship", "consultation"],
  GURU_CHANDAL_DOSHA: ["mantra", "worship", "consultation"],
  GRAHAN_DOSHA: ["mantra", "worship", "lifestyle"],
  SHRAPIT_TYPE_DOSHA: ["discipline", "charity", "consultation"],
};

const remedyTypeByYoga: Partial<Record<YogaDetectionResult["yogaKey"], RemedyType[]>> = {
  RAJ_YOGA: ["discipline", "worship", "consultation"] as RemedyType[],
  DHANA_YOGA: ["charity", "discipline", "lifestyle"] as RemedyType[],
  VIPARITA_RAJ_YOGA: ["consultation", "discipline", "worship"] as RemedyType[],
  NEECH_BHANG_RAJ_YOGA: ["mantra", "discipline", "worship"] as RemedyType[],
  PANCH_MAHAPURUSH_YOGA: ["worship", "discipline", "consultation"] as RemedyType[],
  CHANDRA_MANGALA_YOGA: ["lifestyle", "mantra", "consultation"] as RemedyType[],
  GAJ_KESARI_YOGA: ["consultation", "mantra", "worship"] as RemedyType[],
  BUDHADITYA_YOGA: ["discipline", "mantra", "consultation"] as RemedyType[],
};

const classicalBodies: readonly PlanetaryBody[] = [
  "SUN",
  "MOON",
  "MARS",
  "MERCURY",
  "JUPITER",
  "VENUS",
  "SATURN",
  "RAHU",
  "KETU",
];

function buildUnavailableRemedySnapshot(message: string): RemedyInfrastructureSnapshot {
  return createAstrologyInfrastructureSnapshot({
    status: "unavailable",
    data: null,
    error: {
      code: "INVALID_CHART_CONTEXT",
      message,
    },
  });
}

function createFallbackChartSummary(note: string): AstrologyChartSummary {
  return {
    version: "2026-05",
    chart_kind: "READINESS",
    ascendant_sign: null,
    moon_sign: null,
    dominant_bodies: [],
    supportive_bodies: [],
    challenging_bodies: [],
    active_houses: [],
    note,
  };
}

function buildRemedyKey(parts: Array<string | null | undefined>) {
  return parts
    .filter((part): part is string => Boolean(part))
    .map((part) => part.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_"))
    .filter(Boolean)
    .join("_");
}

function createRecommendation(input: {
  remedyKey: string;
  remedyType: RemedyType;
  title: string;
  relatedPlanet: PlanetaryBody | null;
  relatedDoshaOrYoga: string | null;
  basis: string[];
  suitability: RemedySuitability;
  confidence: RemedyConfidence;
  safeDescription: string;
  instructions: string[];
  cautions: string[];
  missingReason?: string | null;
}): RemedyRecommendation {
  return {
    remedyKey: input.remedyKey,
    remedyType: input.remedyType,
    title: input.title,
    relatedPlanet: input.relatedPlanet,
    relatedDoshaOrYoga: input.relatedDoshaOrYoga,
    basis: [...input.basis],
    suitability: input.suitability,
    confidence: input.confidence,
    safeDescription: input.safeDescription,
    instructions: [...input.instructions],
    cautions: [...input.cautions],
    optional: true,
    guaranteedResult: false,
    missingReason: input.missingReason ?? null,
  };
}

function scoreConfidence(
  hasChart: boolean,
  sourceStatus: "present" | "partial" | "absent" | "unavailable"
): RemedyConfidence {
  if (hasChart && sourceStatus === "present") {
    return "high";
  }

  if (sourceStatus === "partial") {
    return "medium";
  }

  return "low";
}

function buildDoshaRemedies(dosha: DoshaDetectionResult): RemedyRecommendation[] {
  if (dosha.status === "absent" || dosha.status === "unavailable") {
    return [];
  }

  const remedyTypes = remedyTypeByDosha[dosha.doshaKey] ?? ["consultation"];
  const primaryPlanet: PlanetaryBody | null =
    dosha.affectedPlanets[0] ?? null;

  return remedyTypes.map((remedyType, index) =>
    createRecommendation({
      remedyKey: buildRemedyKey(["dosha", dosha.doshaKey, remedyType, String(index)]),
      remedyType,
      title:
        remedyType === "mantra"
          ? `Gentle mantra support for ${dosha.doshaName}`
          : remedyType === "charity"
            ? `Optional charity support for ${dosha.doshaName}`
          : remedyType === "discipline"
              ? `Daily discipline support for ${dosha.doshaName}`
              : remedyType === "worship"
                ? `Calm worship support for ${dosha.doshaName}`
                : `Consultation support for ${dosha.doshaName}`,
      relatedPlanet: primaryPlanet,
      relatedDoshaOrYoga: dosha.doshaKey,
      basis: [
        ...dosha.basis,
        `Source status: ${dosha.status}.`,
      ],
      suitability: dosha.status === "present" ? "caution" : "suitable",
      confidence: scoreConfidence(dosha.status !== "absent", dosha.status),
      safeDescription:
        remedyType === "consultation"
          ? "Optional consultation can help frame this pattern calmly and practically."
          : remedyType === "charity"
            ? "A small, regular act of giving can be used as a gentle support practice."
          : remedyType === "discipline"
              ? "Use a simple discipline or fasting routine only if it fits your health and routine."
              : remedyType === "worship"
                ? "A simple worship or reflection practice may help create steadiness."
                : "A mantra practice can be used as a quiet, optional support routine.",
      instructions:
        remedyType === "consultation"
          ? [
              "Review the pattern with a qualified astrologer if you want human context.",
              "Treat the reading as guidance, not a warning label.",
            ]
          : remedyType === "charity"
            ? [
                "Choose a modest, sustainable act of charity or service.",
                "Keep the practice regular and practical rather than extreme.",
              ]
            : remedyType === "discipline"
              ? [
                  "Use a light discipline, routine, or fasting pattern only when it is safe for you.",
                  "Keep the practice simple and consistent.",
                ]
              : remedyType === "worship"
                ? [
                    "Use a calm worship or reflection routine that fits your tradition.",
                    "Keep the focus on steadiness rather than fear.",
                  ]
                : [
                    "Repeat the mantra calmly and consistently if you choose to use it.",
                    "Use the practice as a grounding routine, not as a guarantee.",
                  ],
      cautions: [
        "Remedy suggestions are optional and non-guaranteed.",
        "Do not treat this as a cure, certainty, or forced action.",
      ],
    })
  );
}

function buildYogaRemedies(
  yoga: YogaDetectionResult,
  sourceRemedies: YogaRemedyMapping[]
): RemedyRecommendation[] {
  if (yoga.status === "absent" || yoga.status === "unavailable") {
    return [];
  }

  const primaryPlanet: PlanetaryBody | null = yoga.involvedPlanets[0] ?? null;
  const sourceLabel = yoga.yogaKey;
  const mappedTypes = remedyTypeByYoga[yoga.yogaKey] ?? ["consultation"];

  const fromYogaTemplates = sourceRemedies.map((template, index) =>
    createRecommendation({
      remedyKey: buildRemedyKey(["yoga", sourceLabel, template.remedyType, String(index)]),
      remedyType: template.remedyType,
      title: template.title,
      relatedPlanet: primaryPlanet,
      relatedDoshaOrYoga: sourceLabel,
      basis: [...yoga.basis, template.safeDescription],
      suitability: yoga.status === "present" ? "caution" : "suitable",
      confidence: scoreConfidence(true, yoga.status),
      safeDescription: template.safeDescription,
      instructions: [
        "Use this remedy as an optional support practice.",
        "Keep the interpretation practical and non-deterministic.",
      ],
      cautions: [template.caution],
    })
  );

  const additionalSupport = mappedTypes
    .filter((remedyType) => !sourceRemedies.some((template) => template.remedyType === remedyType))
    .map((remedyType, index) =>
      createRecommendation({
        remedyKey: buildRemedyKey(["yoga", sourceLabel, remedyType, "support", String(index)]),
        remedyType,
        title:
          remedyType === "mantra"
            ? `Mantra support for ${yoga.yogaName}`
            : remedyType === "charity"
              ? `Charity support for ${yoga.yogaName}`
              : remedyType === "worship"
                ? `Worship support for ${yoga.yogaName}`
                : remedyType === "discipline"
                  ? `Discipline support for ${yoga.yogaName}`
                  : remedyType === "lifestyle"
                    ? `Lifestyle support for ${yoga.yogaName}`
                    : `Consultation support for ${yoga.yogaName}`,
        relatedPlanet: primaryPlanet,
        relatedDoshaOrYoga: sourceLabel,
        basis: [...yoga.basis, `Support category: ${remedyType}.`],
        suitability: yoga.status === "present" ? "caution" : "suitable",
        confidence: scoreConfidence(true, yoga.status),
        safeDescription:
          remedyType === "consultation"
            ? "Optional consultation can help keep this yoga reading grounded and practical."
            : remedyType === "charity"
              ? "A modest charity or service routine may complement the yoga reading."
              : remedyType === "discipline"
                ? "A light discipline or fasting routine may be used only if it suits your health."
                : remedyType === "worship"
                  ? "A calm worship or reflection routine may complement the yoga reading."
                  : remedyType === "lifestyle"
                    ? "A stable daily routine may help you use the yoga themes constructively."
                    : "A mantra routine may help support the yoga themes in a calm way.",
        instructions:
          remedyType === "consultation"
            ? [
                "Use consultation for clarification, not for certainty claims.",
                "Keep the conversation practical and grounded.",
              ]
            : [
                "Use the practice only if it fits your routine and beliefs.",
                "Keep it gentle, optional, and non-forced.",
              ],
        cautions: [
          "Remedy support is optional and should not be treated as a guarantee.",
          "Do not use this as a substitute for practical planning.",
        ],
      })
    );

  return [...fromYogaTemplates, ...additionalSupport];
}

function buildPlanetSignalRemedies(
  signal: PlanetaryWeaknessSignal
): RemedyRecommendation[] {
  const basis = [...signal.basis];
  const isClassical = classicalBodies.includes(signal.planet);
  const isLikelyWeak =
    signal.strength === "weak" ||
    signal.strength === "moderate" ||
    basis.some((item) => /debil|combust|dusthana|afflict/i.test(item));

  if (!isLikelyWeak) {
    return [
      createRecommendation({
        remedyKey: buildRemedyKey(["planet", signal.planet, "lifestyle", "support"]),
        remedyType: "lifestyle",
        title: `${planetLabelMap[signal.planet]} balance support`,
        relatedPlanet: signal.planet,
        relatedDoshaOrYoga: signal.relatedDoshaOrYoga ?? `PLANET:${signal.planet}`,
        basis,
        suitability: "suitable",
        confidence: "low",
        safeDescription:
          "A practical lifestyle adjustment can be used as a gentle support reference.",
        instructions: [
          "Keep the adjustment small and sustainable.",
          "Use it as a refinement, not a forced change.",
        ],
        cautions: [
          "This is optional guidance only.",
          "Do not treat the suggestion as a guaranteed remedy.",
        ],
      }),
    ];
  }

  const recommendations: RemedyRecommendation[] = [];

  if (isClassical) {
    recommendations.push(
      createRecommendation({
        remedyKey: buildRemedyKey(["planet", signal.planet, "gemstone", "support"]),
        remedyType: "gemstone",
        title: `${planetLabelMap[signal.planet]} gemstone readiness`,
        relatedPlanet: signal.planet,
        relatedDoshaOrYoga: signal.relatedDoshaOrYoga ?? `PLANET:${signal.planet}`,
        basis: [
          ...basis,
          "Gemstone support is only a readiness suggestion in this phase.",
        ],
        suitability: "caution",
        confidence: signal.strength === "weak" ? "high" : "medium",
        safeDescription:
          "Gemstone support can be considered only after checking suitability with a qualified astrologer. It is optional and not a guaranteed fix.",
        instructions: [
          "Consult a qualified astrologer before wearing any gemstone.",
          "Check tradition, budget, comfort, and personal preference first.",
        ],
        cautions: [
          "Do not treat a gemstone as a guaranteed outcome tool.",
          "Do not buy or wear a gemstone without human review if you are unsure.",
        ],
      })
    );
  }

  if (signal.planet === "MARS" || signal.planet === "SATURN" || signal.planet === "RAHU" || signal.planet === "KETU") {
    recommendations.push(
      createRecommendation({
        remedyKey: buildRemedyKey(["planet", signal.planet, "rudraksha", "support"]),
        remedyType: "rudraksha",
        title: `${planetLabelMap[signal.planet]} rudraksha readiness`,
        relatedPlanet: signal.planet,
        relatedDoshaOrYoga: signal.relatedDoshaOrYoga ?? `PLANET:${signal.planet}`,
        basis: [...basis, "Rudraksha support is optional in this phase."],
        suitability: "caution",
        confidence: "medium",
        safeDescription:
          "Rudraksha support is an optional, non-forced practice that should be selected only if it fits your tradition and comfort.",
        instructions: [
          "Treat the suggestion as optional support, not a requirement.",
          "Prefer a guided choice if you want to explore this path.",
        ],
        cautions: [
          "Do not force a purchase or treat the item as a guaranteed remedy.",
          "If you are unsure, ask a qualified human guide first.",
        ],
      })
    );
  }

  recommendations.push(
    createRecommendation({
      remedyKey: buildRemedyKey(["planet", signal.planet, "mantra", "support"]),
      remedyType: "mantra",
      title: `${planetLabelMap[signal.planet]} mantra support`,
      relatedPlanet: signal.planet,
      relatedDoshaOrYoga: signal.relatedDoshaOrYoga ?? `PLANET:${signal.planet}`,
      basis,
      suitability: "suitable",
      confidence: signal.strength === "weak" ? "high" : "medium",
      safeDescription:
        "A calm mantra practice can be used as a gentle support routine without any promise of outcome.",
      instructions: [
        "Repeat the mantra consistently if it fits your beliefs.",
        "Keep the practice simple and grounded.",
      ],
      cautions: [
        "This is optional guidance only.",
        "Do not treat the mantra as a guaranteed fix.",
      ],
    })
  );

  return recommendations;
}

function derivePlanetSignalsFromChart(chart: NonNullable<ReturnType<typeof normalizeUnifiedSiderealChart>>) {
  return chart.planets
    .filter((planet) => {
      const debilitation = debilitationSignsByBody[planet.body];
      const isDignityWeak = debilitation === planet.sign;
      const isDusthana = [6, 8, 12].includes(planet.house);
      const isCombust = Boolean(planet.is_combust);

      return isDignityWeak || isDusthana || isCombust;
    })
    .map<PlanetaryWeaknessSignal>((planet) => {
      const reasons = [];

      if (debilitationSignsByBody[planet.body] === planet.sign) {
        reasons.push(`${planetLabelMap[planet.body]} is in a debilitated sign.`);
      }

      if ([6, 8, 12].includes(planet.house)) {
        reasons.push(`${planetLabelMap[planet.body]} is in a dusthana house.`);
      }

      if (planet.is_combust) {
        reasons.push(`${planetLabelMap[planet.body]} is combust.`);
      }

      return {
        planet: planet.body,
        relatedDoshaOrYoga: null,
        basis: reasons,
        strength: planet.is_combust || debilitationSignsByBody[planet.body] === planet.sign ? "weak" : "moderate",
        house: planet.house,
        sign: planet.sign,
      };
    });
}

function dedupeRemedies(remedies: RemedyRecommendation[]) {
  const map = new Map<string, RemedyRecommendation>();

  for (const remedy of remedies) {
    if (!map.has(remedy.remedyKey)) {
      map.set(remedy.remedyKey, remedy);
      continue;
    }

    const existing = map.get(remedy.remedyKey)!;
    map.set(remedy.remedyKey, {
      ...existing,
      basis: [...new Set([...existing.basis, ...remedy.basis])],
      instructions: [...new Set([...existing.instructions, ...remedy.instructions])],
      cautions: [...new Set([...existing.cautions, ...remedy.cautions])],
      optional: true,
      guaranteedResult: false,
      missingReason: existing.missingReason ?? remedy.missingReason,
    });
  }

  return Array.from(map.values());
}

function buildRemedySummary(remedies: RemedyRecommendation[]) {
  const gemstoneCount = remedies.filter((remedy) => remedy.remedyType === "gemstone").length;
  const rudrakshaCount = remedies.filter((remedy) => remedy.remedyType === "rudraksha").length;
  const consultCount = remedies.filter((remedy) => remedy.remedyType === "consultation").length;

  return {
    summary: `Remedy intelligence prepared ${remedies.length} optional support items with cautious guidance for gemstones and sacred practices.`,
    highlights: remedies.slice(0, 3).map((remedy) => remedy.title),
    cautions: [
      "Remedies are optional and not guaranteed.",
      ...(gemstoneCount > 0
        ? ["Gemstone suggestions require qualified human review before wearing."]
        : []),
      ...(rudrakshaCount > 0
        ? ["Rudraksha suggestions remain optional and should never be forced."]
        : []),
    ],
    next_steps: [
      "Keep remedy choices practical, calm, and optional.",
      "Use consultation for clarification where human review is better.",
      "Re-run the engine when fuller chart context or better planet signals are available.",
    ],
    warnings: [
      ...(consultCount > 0
        ? ["Consultation suggestions are soft and do not imply a required intervention."]
        : []),
      "No remedy here should be treated as a medical, legal, or financial cure.",
    ],
    reportSummary:
      "The remedy engine returns calm, optional, and non-guaranteed support suggestions that can be consumed by reports, dashboard explanations, and AI context layers.",
    aiSummary:
      "Use the remedy output as practical support guidance only; do not convert it into a certainty claim or forced purchase advice.",
  };
}

function resolveChartSummary(input: {
  chart: NonNullable<ReturnType<typeof normalizeUnifiedSiderealChart>> | null;
  doshaSnapshot?: DoshaInfrastructureSnapshot | null;
  yogaSnapshot?: YogaInfrastructureSnapshot | null;
}) {
  if (input.chart) {
    return buildAstrologyChartSummary(input.chart, {
      chartKind: "NATAL",
      note:
        "Remedy intelligence reads the verified chart and keeps all suggestions optional, practical, and non-guaranteed.",
    });
  }

  if (input.doshaSnapshot?.data?.chartSummary) {
    return input.doshaSnapshot.data.chartSummary;
  }

  if (input.yogaSnapshot?.data?.chartSummary) {
    return input.yogaSnapshot.data.chartSummary;
  }

  return createFallbackChartSummary(
    "Remedy intelligence is running in readiness mode using structured signals only."
  );
}

function hasInputBasis(input: RemedyIntelligenceInput) {
  return Boolean(
    input.chart ||
      input.doshaSnapshot?.data ||
      input.yogaSnapshot?.data ||
      (input.planetSignals?.length ?? 0) > 0
  );
}

export function buildRemedyIntelligenceEngine(input: RemedyIntelligenceInput): RemedyInfrastructureSnapshot {
  const normalizedChart = input.chart ? normalizeUnifiedSiderealChart(input.chart) : null;
  const doshaSnapshot =
    input.doshaSnapshot ?? (input.chart ? buildDoshaDetectionEngine({ chart: input.chart }) : null);
  const yogaSnapshot =
    input.yogaSnapshot ?? (input.chart ? buildYogaDetectionEngine({ chart: input.chart }) : null);

  if (!hasInputBasis(input)) {
    return buildUnavailableRemedySnapshot(
      "Chart basis or structured remedy inputs are required for remedy intelligence."
    );
  }

  if (
    input.chart &&
    normalizedChart &&
    !normalizedChart.verification?.is_verified_for_chart_logic &&
    !doshaSnapshot?.data &&
    !yogaSnapshot?.data
  ) {
    return buildUnavailableRemedySnapshot(
      "Verified chart context is required for remedy intelligence."
    );
  }

  const derivedPlanetSignals = normalizedChart ? derivePlanetSignalsFromChart(normalizedChart) : [];
  const providedPlanetSignals = Array.from(input.planetSignals ?? []);
  const combinedPlanetSignals = [...derivedPlanetSignals, ...providedPlanetSignals];

  const remedies: RemedyRecommendation[] = [];

  for (const dosha of doshaSnapshot?.data?.doshas ?? []) {
    remedies.push(...buildDoshaRemedies(dosha));
  }

  for (const yoga of yogaSnapshot?.data?.yogas ?? []) {
    const sourceRemedies = yogaSnapshot?.data?.remedies.filter(
      (remedy) => remedy.relatedYogaOrDoshaKey === yoga.yogaKey
    ) ?? [];
    remedies.push(...buildYogaRemedies(yoga, sourceRemedies));
  }

  for (const signal of combinedPlanetSignals) {
    remedies.push(...buildPlanetSignalRemedies(signal));
  }

  const uniqueRemedies = dedupeRemedies(remedies);
  const chartReady =
    normalizedChart?.verification?.is_verified_for_chart_logic ??
    doshaSnapshot?.data?.chartReady ??
    yogaSnapshot?.data?.chartReady ??
    false;
  const chartSummary = resolveChartSummary({
    chart: normalizedChart,
    doshaSnapshot,
    yogaSnapshot,
  });
  const summaryPack = buildRemedySummary(uniqueRemedies);

  const hasPartial =
    doshaSnapshot?.status === "partial" || yogaSnapshot?.status === "partial";
  const hasUnavailable =
    doshaSnapshot?.status === "unavailable" ||
    yogaSnapshot?.status === "unavailable";

  return createAstrologyInfrastructureSnapshot({
    status: hasUnavailable && uniqueRemedies.length === 0 ? "partial" : hasPartial ? "partial" : "ready",
    data: {
      chartReady,
      chartSummary,
      remedies: uniqueRemedies,
      summary: summaryPack.summary,
      highlights: summaryPack.highlights,
      cautions: summaryPack.cautions,
      next_steps: summaryPack.next_steps,
      warnings: summaryPack.warnings,
      reportSummary: summaryPack.reportSummary,
      aiSummary: summaryPack.aiSummary,
      missingReason:
        hasUnavailable || hasPartial
          ? "One or more supporting remedy sources are partial or unavailable in the foundation layer."
          : null,
    },
    error: null,
  });
}

export function buildRemedyMappingLayer(input: {
  chart: UnifiedSiderealChart | null | undefined;
}): RemedyInfrastructureSnapshot {
  return buildRemedyIntelligenceEngine({ chart: input.chart });
}

export const buildRemedyInfrastructureSnapshot = buildRemedyIntelligenceEngine;
