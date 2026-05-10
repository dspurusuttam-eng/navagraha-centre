import {
  exaltationSignsByBody,
  ownSignsByBody,
  planetLabelMap,
  signRulerMap,
} from "@/lib/astrology/constants";
import type { UnifiedSiderealChart } from "@/modules/astrology/chart-contract-types";
import {
  createAstrologyInfrastructureSnapshot,
  type AstrologyInfrastructureSnapshot,
} from "@/modules/astrology/core";
import { nakshatraNames, zodiacSigns } from "@/modules/astrology/constants";
import type { PlanetaryBody, ZodiacSign } from "@/modules/astrology/types";

type MatchmakingSubjectInput = {
  chart?: UnifiedSiderealChart | null | undefined;
  savedKundliId?: string | null;
  label?: string | null;
  sourceLabel?: string | null;
};

type MatchmakingPairInput = {
  personA: MatchmakingSubjectInput;
  personB: MatchmakingSubjectInput;
  asOfDateUtc?: Date | string;
};

export type MatchmakingSubjectSnapshot = {
  label: string;
  sourceLabel: string;
  savedKundliId: string | null;
  chartAvailable: boolean;
  verifiedChart: boolean;
  moonSign: ZodiacSign | null;
  moonNakshatra: string | null;
  moonPada: number | null;
  moonHouse: number | null;
  missingReason: string | null;
};

export type MatchmakingKootaKey =
  | "VARNA"
  | "VASHYA"
  | "TARA"
  | "YONI"
  | "GRAHA_MAITRI"
  | "GANA"
  | "BHAKOOT"
  | "NADI";

export type MatchmakingKootaStatus = "ready" | "partial" | "pending" | "unavailable";

export type MatchmakingKootaBreakdownEntry = {
  key: MatchmakingKootaKey;
  title: string;
  status: MatchmakingKootaStatus;
  score: number | null;
  maxScore: number | null;
  summary: string;
  missingReason: string | null;
};

export type MatchmakingRecommendationLevel =
  | "supportive"
  | "balanced"
  | "review"
  | "insufficient_data";

export type ManglikReferenceKey = "LAGNA" | "MOON" | "VENUS";

export type ManglikReferenceSnapshot = {
  reference: ManglikReferenceKey;
  house: number | null;
  isSensitive: boolean | null;
  status: "ready" | "partial" | "unavailable";
  summary: string;
  missingReason: string | null;
};

export type ManglikAnalysisSnapshot = {
  status: "ready" | "partial" | "unavailable";
  overallStatus: "present" | "absent" | "partial" | "unavailable";
  severity: "low" | "moderate" | "high" | "unavailable";
  marsHouse: number | null;
  marsSign: string | null;
  lagnaCheck: ManglikReferenceSnapshot;
  moonCheck: ManglikReferenceSnapshot;
  venusCheck: ManglikReferenceSnapshot;
  cancellationFlags: string[];
  mitigationFlags: string[];
  summary: string;
  missingReason: string | null;
};

export type MatchmakingCompatibilityInsights = {
  status: "ready" | "partial" | "unavailable";
  emotionalCompatibility: string;
  communicationCompatibility: string;
  familySocialHarmony: string;
  practicalLifeAlignment: string;
  conflictAreas: string[];
  supportiveFactors: string[];
  consultationSuggestion: string | null;
  reportSummary: string;
  aiSummary: string;
  missingReason: string | null;
};

export type MatchmakingFoundationData = {
  comparisonType: "GUNA_MILAN";
  asOfDateUtc: string;
  personA: MatchmakingSubjectSnapshot;
  personB: MatchmakingSubjectSnapshot;
  matchScore: number | null;
  maxScore: number | null;
  kootaBreakdown: MatchmakingKootaBreakdownEntry[];
  summary: string;
  strengths: string[];
  cautions: string[];
  missingData: string[];
  recommendationLevel: MatchmakingRecommendationLevel;
  manglikAnalysis: {
    personA: ManglikAnalysisSnapshot;
    personB: ManglikAnalysisSnapshot;
    summary: string;
    missingReason: string | null;
  };
  compatibilityInsights: MatchmakingCompatibilityInsights;
  safeSummary: string;
  missingReason: string | null;
};

export type MatchmakingFoundationSnapshot =
  AstrologyInfrastructureSnapshot<MatchmakingFoundationData>;

type ChartMoonSnapshot = {
  sign: ZodiacSign;
  nakshatra: string;
  pada: number;
  house: number;
};

type MatchmakingResolvedSubject = {
  snapshot: MatchmakingSubjectSnapshot;
  moon: ChartMoonSnapshot | null;
  chart: UnifiedSiderealChart | null;
};

const nadiSequence = ["AADI", "MADHYA", "ANTYA"] as const;

const ganaByNakshatra: Record<string, "DEVA" | "MANUSHYA" | "RAKSHASA"> = {
  ASHWINI: "DEVA",
  BHARANI: "MANUSHYA",
  KRITTIKA: "RAKSHASA",
  ROHINI: "MANUSHYA",
  MRIGASHIRSHA: "DEVA",
  ARDRA: "RAKSHASA",
  PUNARVASU: "DEVA",
  PUSHYA: "DEVA",
  ASHLESHA: "RAKSHASA",
  MAGHA: "RAKSHASA",
  PURVA_PHALGUNI: "MANUSHYA",
  UTTARA_PHALGUNI: "MANUSHYA",
  HASTA: "DEVA",
  CHITRA: "RAKSHASA",
  SWATI: "DEVA",
  VISHAKHA: "DEVA",
  ANURADHA: "DEVA",
  JYESHTHA: "RAKSHASA",
  MOOLA: "RAKSHASA",
  PURVA_ASHADHA: "MANUSHYA",
  UTTARA_ASHADHA: "MANUSHYA",
  SHRAVANA: "DEVA",
  DHANISHTA: "RAKSHASA",
  SHATABHISHA: "RAKSHASA",
  PURVA_BHADRAPADA: "MANUSHYA",
  UTTARA_BHADRAPADA: "MANUSHYA",
  REVATI: "DEVA",
};

const taraFriendlyPositionSet = new Set([0, 2, 4, 6, 8]);

const planetaryFriendshipMap: Record<
  PlanetaryBody,
  {
    friends: PlanetaryBody[];
    enemies: PlanetaryBody[];
    neutrals: PlanetaryBody[];
  }
> = {
  SUN: {
    friends: ["MOON", "MARS", "JUPITER"],
    enemies: ["VENUS", "SATURN"],
    neutrals: ["MERCURY", "RAHU", "KETU", "URANUS", "NEPTUNE", "PLUTO"],
  },
  MOON: {
    friends: ["SUN", "MERCURY"],
    enemies: [],
    neutrals: ["MARS", "JUPITER", "VENUS", "SATURN", "RAHU", "KETU", "URANUS", "NEPTUNE", "PLUTO"],
  },
  MARS: {
    friends: ["SUN", "MOON", "JUPITER"],
    enemies: ["MERCURY"],
    neutrals: ["VENUS", "SATURN", "RAHU", "KETU", "URANUS", "NEPTUNE", "PLUTO"],
  },
  MERCURY: {
    friends: ["SUN", "VENUS"],
    enemies: ["MOON"],
    neutrals: ["MARS", "JUPITER", "SATURN", "RAHU", "KETU", "URANUS", "NEPTUNE", "PLUTO"],
  },
  JUPITER: {
    friends: ["SUN", "MOON", "MARS"],
    enemies: ["MERCURY", "VENUS"],
    neutrals: ["SATURN", "RAHU", "KETU", "URANUS", "NEPTUNE", "PLUTO"],
  },
  VENUS: {
    friends: ["MERCURY", "SATURN"],
    enemies: ["SUN", "MOON"],
    neutrals: ["MARS", "JUPITER", "RAHU", "KETU", "URANUS", "NEPTUNE", "PLUTO"],
  },
  SATURN: {
    friends: ["MERCURY", "VENUS"],
    enemies: ["SUN", "MOON"],
    neutrals: ["MARS", "JUPITER", "RAHU", "KETU", "URANUS", "NEPTUNE", "PLUTO"],
  },
  RAHU: {
    friends: ["VENUS", "SATURN", "MERCURY"],
    enemies: ["SUN", "MOON"],
    neutrals: ["MARS", "JUPITER", "KETU", "URANUS", "NEPTUNE", "PLUTO"],
  },
  KETU: {
    friends: ["MARS", "JUPITER", "SATURN"],
    enemies: ["SUN", "MOON"],
    neutrals: ["MERCURY", "VENUS", "RAHU", "URANUS", "NEPTUNE", "PLUTO"],
  },
  URANUS: {
    friends: [],
    enemies: [],
    neutrals: ["SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN", "RAHU", "KETU", "NEPTUNE", "PLUTO"],
  },
  NEPTUNE: {
    friends: [],
    enemies: [],
    neutrals: ["SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN", "RAHU", "KETU", "URANUS", "PLUTO"],
  },
  PLUTO: {
    friends: [],
    enemies: [],
    neutrals: ["SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN", "RAHU", "KETU", "URANUS", "NEPTUNE"],
  },
};

function normalizeLabel(value: string | null | undefined, fallback: string) {
  const normalized = value?.trim();

  return normalized && normalized.length > 0 ? normalized : fallback;
}

function getMoonPlacement(chart: UnifiedSiderealChart | null | undefined): ChartMoonSnapshot | null {
  if (!chart || !chart.verification?.is_verified_for_chart_logic || !Array.isArray(chart.planets)) {
    return null;
  }

  const moon = chart.planets.find((planet) => planet.name.trim().toUpperCase() === "MOON");

  if (
    !moon ||
    !moon.sign ||
    !moon.nakshatra ||
    !Number.isFinite(moon.pada) ||
    !Number.isInteger(moon.house)
  ) {
    return null;
  }

  return {
    sign: moon.sign as ZodiacSign,
    nakshatra: moon.nakshatra,
    pada: moon.pada,
    house: moon.house,
  };
}

function buildSubjectSnapshot(
  input: MatchmakingSubjectInput,
  fallbackLabel: string
): MatchmakingResolvedSubject {
  const chart = input.chart ?? null;
  const moon = getMoonPlacement(chart);
  const label = normalizeLabel(input.label, fallbackLabel);
  const savedKundliId = input.savedKundliId?.trim() || null;
  const sourceLabel =
    normalizeLabel(
      input.sourceLabel,
      savedKundliId ? "Saved Kundli" : "Verified live chart"
    ) ?? fallbackLabel;

  if (!chart) {
    return {
      snapshot: {
        label,
        sourceLabel,
        savedKundliId,
        chartAvailable: false,
        verifiedChart: false,
        moonSign: null,
        moonNakshatra: null,
        moonPada: null,
        moonHouse: null,
        missingReason: "Chart data is missing.",
      },
      moon: null,
      chart: null,
    };
  }

  if (!chart.verification?.is_verified_for_chart_logic) {
    return {
      snapshot: {
        label,
        sourceLabel,
        savedKundliId,
        chartAvailable: true,
        verifiedChart: false,
        moonSign: null,
        moonNakshatra: null,
        moonPada: null,
        moonHouse: null,
        missingReason: "Chart is not verified for compatibility analysis.",
      },
      moon: null,
      chart,
    };
  }

  if (!moon) {
    return {
      snapshot: {
        label,
        sourceLabel,
        savedKundliId,
        chartAvailable: true,
        verifiedChart: true,
        moonSign: null,
        moonNakshatra: null,
        moonPada: null,
        moonHouse: null,
        missingReason: "Moon sign, nakshatra, or house data is unavailable.",
      },
      moon: null,
      chart,
    };
  }

  return {
    snapshot: {
      label,
      sourceLabel,
      savedKundliId,
      chartAvailable: true,
      verifiedChart: true,
      moonSign: moon.sign,
      moonNakshatra: moon.nakshatra,
      moonPada: moon.pada,
      moonHouse: moon.house,
      missingReason: null,
    },
    moon,
    chart,
  };
}

function getNakshatraIndex(value: string) {
  const normalized = value.trim().toUpperCase();
  const index = nakshatraNames.indexOf(normalized as (typeof nakshatraNames)[number]);

  return index >= 0 ? index : null;
}

function getNadiLabel(index: number) {
  return nadiSequence[index % 3] ?? "AADI";
}

function getGana(value: string) {
  const normalized = value.trim().toUpperCase();

  return ganaByNakshatra[normalized] ?? null;
}

function buildTaraResult(input: {
  personA: ChartMoonSnapshot;
  personB: ChartMoonSnapshot;
}): MatchmakingKootaBreakdownEntry {
  const indexA = getNakshatraIndex(input.personA.nakshatra);
  const indexB = getNakshatraIndex(input.personB.nakshatra);

  if (indexA === null || indexB === null) {
    return {
      key: "TARA",
      title: "Tara",
      status: "pending",
      score: null,
      maxScore: 3,
      summary: "Tara koota is pending because one or both nakshatra indices are unavailable.",
      missingReason: "Nakshatra indices are missing or invalid.",
    };
  }

  const distanceA = ((indexB - indexA + nakshatraNames.length) % nakshatraNames.length) + 1;
  const distanceB = ((indexA - indexB + nakshatraNames.length) % nakshatraNames.length) + 1;
  const isFavorableA = taraFriendlyPositionSet.has(distanceA % 9);
  const isFavorableB = taraFriendlyPositionSet.has(distanceB % 9);
  const score = Number((isFavorableA ? 1.5 : 0) + (isFavorableB ? 1.5 : 0));

  return {
    key: "TARA",
    title: "Tara",
    status: "ready",
    score,
    maxScore: 3,
    summary:
      score === 3
        ? "Tara koota is favorable in both directions."
        : score > 0
          ? "Tara koota is partially favorable in the current foundation."
          : "Tara koota is not favorable in the current foundation.",
    missingReason: null,
  };
}

function buildGanaResult(input: {
  personA: ChartMoonSnapshot;
  personB: ChartMoonSnapshot;
}): MatchmakingKootaBreakdownEntry {
  const ganaA = getGana(input.personA.nakshatra);
  const ganaB = getGana(input.personB.nakshatra);

  if (!ganaA || !ganaB) {
    return {
      key: "GANA",
      title: "Gana",
      status: "pending",
      score: null,
      maxScore: 6,
      summary: "Gana koota is pending because one or both nakshatra groups are unavailable.",
      missingReason: "Nakshatra gana mapping is missing or invalid.",
    };
  }

  const matrix: Record<
    "DEVA" | "MANUSHYA" | "RAKSHASA",
    Record<"DEVA" | "MANUSHYA" | "RAKSHASA", number>
  > = {
    DEVA: { DEVA: 6, MANUSHYA: 5, RAKSHASA: 1 },
    MANUSHYA: { DEVA: 5, MANUSHYA: 6, RAKSHASA: 0 },
    RAKSHASA: { DEVA: 1, MANUSHYA: 0, RAKSHASA: 6 },
  };

  const score = matrix[ganaA][ganaB];

  return {
    key: "GANA",
    title: "Gana",
    status: "ready",
    score,
    maxScore: 6,
    summary:
      score === 6
        ? "Gana koota is strongly aligned."
        : score >= 4
          ? "Gana koota is supportive in the current foundation."
          : "Gana koota requires a more careful review.",
    missingReason: null,
  };
}

function buildBhakootResult(input: {
  personA: ChartMoonSnapshot;
  personB: ChartMoonSnapshot;
}): MatchmakingKootaBreakdownEntry {
  const indexA = zodiacSigns.indexOf(input.personA.sign);
  const indexB = zodiacSigns.indexOf(input.personB.sign);

  if (indexA < 0 || indexB < 0) {
    return {
      key: "BHAKOOT",
      title: "Bhakoot",
      status: "pending",
      score: null,
      maxScore: 7,
      summary: "Bhakoot koota is pending because one or both Moon signs are unavailable.",
      missingReason: "Moon sign data is missing or invalid.",
    };
  }

  const distance = Math.abs(indexA - indexB);
  const doshaDistances = new Set([0, 1, 4, 5, 7, 8, 11]);
  const score = doshaDistances.has(distance) ? 0 : 7;

  return {
    key: "BHAKOOT",
    title: "Bhakoot",
    status: "ready",
    score,
    maxScore: 7,
    summary:
      score === 7
        ? "Bhakoot koota is neutral/supportive in the current foundation."
        : "Bhakoot koota indicates a caution area in the current foundation.",
    missingReason: null,
  };
}

function buildNadiResult(input: {
  personA: ChartMoonSnapshot;
  personB: ChartMoonSnapshot;
}): MatchmakingKootaBreakdownEntry {
  const indexA = getNakshatraIndex(input.personA.nakshatra);
  const indexB = getNakshatraIndex(input.personB.nakshatra);

  if (indexA === null || indexB === null) {
    return {
      key: "NADI",
      title: "Nadi",
      status: "pending",
      score: null,
      maxScore: 8,
      summary: "Nadi koota is pending because one or both nakshatra indices are unavailable.",
      missingReason: "Nakshatra indices are missing or invalid.",
    };
  }

  const nadiA = getNadiLabel(indexA);
  const nadiB = getNadiLabel(indexB);
  const score = nadiA === nadiB ? 0 : 8;

  return {
    key: "NADI",
    title: "Nadi",
    status: "ready",
    score,
    maxScore: 8,
    summary:
      score === 8
        ? "Nadi koota is non-conflicting in the current foundation."
        : "Nadi koota is a caution area because both nakshatras share the same nadi group.",
    missingReason: null,
  };
}

function buildGrahaMaitriResult(input: {
  personA: ChartMoonSnapshot;
  personB: ChartMoonSnapshot;
}): MatchmakingKootaBreakdownEntry {
  const lordA = signRulerMap[input.personA.sign];
  const lordB = signRulerMap[input.personB.sign];
  const relationA = planetaryFriendshipMap[lordA];
  const relationB = planetaryFriendshipMap[lordB];

  if (!relationA || !relationB) {
    return {
      key: "GRAHA_MAITRI",
      title: "Graha Maitri",
      status: "pending",
      score: null,
      maxScore: 5,
      summary: "Graha Maitri is pending because one or both sign lords are unavailable.",
      missingReason: "Sign-lord friendship data is missing or invalid.",
    };
  }

  const sameLord = lordA === lordB;
  let score = 0;

  if (sameLord) {
    score = 5;
  } else if (relationA.friends.includes(lordB) && relationB.friends.includes(lordA)) {
    score = 5;
  } else if (
    (relationA.friends.includes(lordB) && relationB.neutrals.includes(lordA)) ||
    (relationB.friends.includes(lordA) && relationA.neutrals.includes(lordB))
  ) {
    score = 4;
  } else if (relationA.neutrals.includes(lordB) && relationB.neutrals.includes(lordA)) {
    score = 3;
  } else if (
    (relationA.enemies.includes(lordB) && relationB.neutrals.includes(lordA)) ||
    (relationB.enemies.includes(lordA) && relationA.neutrals.includes(lordB))
  ) {
    score = 1;
  } else {
    score = 0;
  }

  return {
    key: "GRAHA_MAITRI",
    title: "Graha Maitri",
    status: "ready",
    score,
    maxScore: 5,
    summary:
      score >= 4
        ? "Graha Maitri is supportive in the current foundation."
        : score > 0
          ? "Graha Maitri is workable but needs more careful review."
          : "Graha Maitri indicates a caution area in the current foundation.",
    missingReason: null,
  };
}

function buildPendingKoota(key: MatchmakingKootaKey, title: string): MatchmakingKootaBreakdownEntry {
  return {
    key,
    title,
    status: "pending",
    score: null,
    maxScore:
      key === "VARNA"
        ? 1
        : key === "VASHYA"
          ? 2
          : key === "YONI"
            ? 4
            : 0,
    summary: `${title} scoring is pending in this foundation and will be added only when a safe rule table is available.`,
    missingReason: `${title} scoring is not implemented in the foundation layer yet.`,
  };
}

type PlanetPlacementSnapshot = {
  sign: ZodiacSign;
  house: number;
  degreeInSign: number;
  nakshatra: string;
  pada: number;
  isRetrograde: boolean;
};

const manglikSensitiveHouses = new Set([1, 2, 4, 7, 8, 12]);

function getPlanetPlacement(
  chart: UnifiedSiderealChart | null | undefined,
  body: PlanetaryBody
): PlanetPlacementSnapshot | null {
  if (!chart || !Array.isArray(chart.planets)) {
    return null;
  }

  const planet = chart.planets.find((entry) => entry.name.trim().toUpperCase() === body);

  if (
    !planet ||
    !planet.sign ||
    !Number.isInteger(planet.house) ||
    !Number.isFinite(planet.degree_in_sign) ||
    !Number.isFinite(planet.pada)
  ) {
    return null;
  }

  return {
    sign: planet.sign as ZodiacSign,
    house: planet.house,
    degreeInSign: planet.degree_in_sign,
    nakshatra: planet.nakshatra,
    pada: planet.pada,
    isRetrograde: planet.is_retrograde,
  };
}

function getRelativeHouse(targetHouse: number, referenceHouse: number) {
  return ((targetHouse - referenceHouse + 12) % 12) + 1;
}

function buildManglikReferenceSnapshot(input: {
  reference: ManglikReferenceKey;
  marsPlacement: PlanetPlacementSnapshot | null;
  referencePlacement: PlanetPlacementSnapshot | null;
}): ManglikReferenceSnapshot {
  if (!input.marsPlacement) {
    return {
      reference: input.reference,
      house: null,
      isSensitive: null,
      status: "unavailable",
      summary: `${planetLabelMap.MARS} placement is unavailable for the ${input.reference.toLowerCase()}-based Manglik check.`,
      missingReason: `${planetLabelMap.MARS} placement is missing or invalid.`,
    };
  }

  if (input.reference !== "LAGNA" && !input.referencePlacement) {
    return {
      reference: input.reference,
      house: null,
      isSensitive: null,
      status: "unavailable",
      summary: `${input.reference === "MOON" ? "Moon" : "Venus"} reference is unavailable for the Manglik check.`,
      missingReason: `${input.reference === "MOON" ? "Moon" : "Venus"} placement is missing or invalid.`,
    };
  }

  const house =
    input.reference === "LAGNA"
      ? input.marsPlacement.house
      : getRelativeHouse(input.marsPlacement.house, input.referencePlacement!.house);
  const isSensitive = manglikSensitiveHouses.has(house);

  return {
    reference: input.reference,
    house,
    isSensitive,
    status: "ready",
    summary:
      input.reference === "LAGNA"
        ? isSensitive
          ? `${planetLabelMap.MARS} is in a Manglik-sensitive house from the Lagna reference.`
          : `${planetLabelMap.MARS} is not in a Manglik-sensitive house from the Lagna reference.`
        : isSensitive
          ? `${planetLabelMap.MARS} is in a Manglik-sensitive house from the ${input.reference === "MOON" ? "Moon" : "Venus"} reference.`
          : `${planetLabelMap.MARS} is not in a Manglik-sensitive house from the ${input.reference === "MOON" ? "Moon" : "Venus"} reference.`,
    missingReason: null,
  };
}

function buildManglikAnalysis(input: {
  chart: UnifiedSiderealChart | null;
}): ManglikAnalysisSnapshot {
  const marsPlacement = getPlanetPlacement(input.chart, "MARS");
  const moonPlacement = getPlanetPlacement(input.chart, "MOON");
  const venusPlacement = getPlanetPlacement(input.chart, "VENUS");

  const lagnaCheck = buildManglikReferenceSnapshot({
    reference: "LAGNA",
    marsPlacement,
    referencePlacement: null,
  });
  const moonCheck = buildManglikReferenceSnapshot({
    reference: "MOON",
    marsPlacement,
    referencePlacement: moonPlacement,
  });
  const venusCheck = buildManglikReferenceSnapshot({
    reference: "VENUS",
    marsPlacement,
    referencePlacement: venusPlacement,
  });

  const readyChecks = [lagnaCheck, moonCheck, venusCheck].filter(
    (check) => check.status === "ready"
  );
  const sensitiveCount = readyChecks.filter((check) => check.isSensitive).length;
  const availableCount = readyChecks.length;
  const hasMissingReferences = [lagnaCheck, moonCheck, venusCheck].some(
    (check) => check.status !== "ready"
  );
  const marsStrongBySign =
    marsPlacement &&
    ((ownSignsByBody.MARS ?? []).includes(marsPlacement.sign) ||
      exaltationSignsByBody.MARS === marsPlacement.sign);

  let overallStatus: ManglikAnalysisSnapshot["overallStatus"] = "unavailable";
  let severity: ManglikAnalysisSnapshot["severity"] = "unavailable";
  let summary = "Manglik analysis is unavailable until Mars placement is available.";
  const cancellationFlags: string[] = [];
  const mitigationFlags: string[] = [];

  if (marsPlacement) {
    if (availableCount === 0) {
      overallStatus = "unavailable";
      severity = "unavailable";
    } else {
      if (sensitiveCount === 0) {
        overallStatus = hasMissingReferences ? "partial" : "absent";
        severity = "low";
        summary =
          "Manglik analysis is currently light in the available references, with no Manglik-sensitive placement confirmed from the ready checks.";
      } else if (sensitiveCount === 1) {
        overallStatus = hasMissingReferences ? "partial" : "present";
        severity = "moderate";
        summary =
          "Manglik analysis shows a single reference view with Manglik-sensitive placement, so the reading should be kept context-aware.";
      } else {
        overallStatus = hasMissingReferences ? "partial" : "present";
        severity = "high";
        summary =
          "Manglik analysis shows Manglik-sensitive placement in multiple reference views, so the reading should stay practical and consultation-ready.";
      }

      if (marsStrongBySign) {
        mitigationFlags.push(
          `${planetLabelMap.MARS} is strengthened by own or exalted sign placement.`
        );
      }

      if (!lagnaCheck.isSensitive && lagnaCheck.status === "ready") {
        mitigationFlags.push("Lagna-based Manglik check is not sensitive.");
      }

      if (!moonCheck.isSensitive && moonCheck.status === "ready") {
        mitigationFlags.push("Moon-based Manglik check is not sensitive.");
      }

      if (!venusCheck.isSensitive && venusCheck.status === "ready") {
        mitigationFlags.push("Venus-based Manglik check is not sensitive.");
      }

      if (sensitiveCount > 0 && marsStrongBySign) {
        cancellationFlags.push(
          `${planetLabelMap.MARS} dignity supports a softer reading in the current chart context.`
        );
      }
    }
  }

  const missingReason =
    availableCount > 0
      ? hasMissingReferences
        ? "Some Manglik reference checks are unavailable in the foundation layer."
        : null
      : "Mars placement is unavailable for Manglik analysis.";

  return {
    status: marsPlacement
      ? hasMissingReferences
        ? "partial"
        : "ready"
      : "unavailable",
    overallStatus,
    severity,
    marsHouse: marsPlacement?.house ?? null,
    marsSign: marsPlacement?.sign ?? null,
    lagnaCheck,
    moonCheck,
    venusCheck,
    cancellationFlags,
    mitigationFlags,
    summary,
    missingReason,
  };
}

function buildCompatibilityInsights(input: {
  matchScore: number;
  maxScore: number;
  recommendationLevel: MatchmakingRecommendationLevel;
  kootaBreakdown: MatchmakingKootaBreakdownEntry[];
  manglikAnalysis: {
    personA: ManglikAnalysisSnapshot;
    personB: ManglikAnalysisSnapshot;
  };
  missingData: string[];
}): MatchmakingCompatibilityInsights {
  const readyKootas = input.kootaBreakdown.filter((entry) => entry.status === "ready");
  const supportiveKootas = readyKootas.filter((entry) => (entry.score ?? 0) > 0);
  const cautionKootas = input.kootaBreakdown.filter(
    (entry) => entry.status === "pending" || entry.score === 0
  );
  const manglikSensitiveCount =
    (input.manglikAnalysis.personA.overallStatus === "present" ? 1 : 0) +
    (input.manglikAnalysis.personB.overallStatus === "present" ? 1 : 0);
  const manglikModerateCount =
    (input.manglikAnalysis.personA.overallStatus === "partial" ? 1 : 0) +
    (input.manglikAnalysis.personB.overallStatus === "partial" ? 1 : 0);

  const emotionalCompatibility =
    supportiveKootas.some((entry) => entry.key === "TARA" || entry.key === "GANA")
      ? input.recommendationLevel === "supportive"
        ? "Emotional rhythm looks supportive in the current foundation, with the Moon-centered kootas leaning stable."
        : "Emotional rhythm looks workable, with supportive Moon-centered kootas and a few areas that still benefit from careful reading."
      : "Emotional compatibility is available only as a partial reading until the Moon-centered kootas mature further.";

  const communicationCompatibility =
    readyKootas.some((entry) => entry.key === "GRAHA_MAITRI" && (entry.score ?? 0) >= 4)
      ? "Communication compatibility looks constructive, with sign-lord friendship supporting easier dialogue."
      : readyKootas.some((entry) => entry.key === "GRAHA_MAITRI")
        ? "Communication compatibility is workable, though the sign-lord pattern suggests a slower and more deliberate tone."
        : "Communication compatibility is pending until Graha Maitri is fully available.";

  const familySocialHarmony =
    readyKootas.some(
      (entry) =>
        (entry.key === "BHAKOOT" || entry.key === "NADI") &&
        entry.status === "ready" &&
        (entry.score ?? 0) > 0
    )
      ? "Family and social harmony looks balanced when the charts are read with patience and context."
      : "Family and social harmony needs a more careful review because some related kootas remain pending or cautious.";

  const practicalLifeAlignment =
    input.recommendationLevel === "supportive"
      ? "Practical alignment looks steady enough for collaborative planning."
      : input.recommendationLevel === "balanced"
        ? "Practical alignment looks workable with attention to timing and expectations."
        : "Practical alignment should be reviewed carefully rather than treated as a yes/no result.";

  const supportiveFactors = Array.from(
    new Set([
      ...supportiveKootas.map((entry) => `${entry.title}: ${entry.summary}`),
      ...(input.manglikAnalysis.personA.mitigationFlags.length
        ? input.manglikAnalysis.personA.mitigationFlags
        : []),
      ...(input.manglikAnalysis.personB.mitigationFlags.length
        ? input.manglikAnalysis.personB.mitigationFlags
        : []),
    ])
  ).slice(0, 6);

  const conflictAreas = Array.from(
    new Set([
      ...cautionKootas.map((entry) => `${entry.title}: ${entry.summary}`),
      ...(input.manglikAnalysis.personA.severity === "moderate" ||
      input.manglikAnalysis.personA.severity === "high"
        ? ["Person A shows a Manglik-sensitive pattern in one or more ready reference views."]
        : []),
      ...(input.manglikAnalysis.personB.severity === "moderate" ||
      input.manglikAnalysis.personB.severity === "high"
        ? ["Person B shows a Manglik-sensitive pattern in one or more ready reference views."]
        : []),
    ])
  ).slice(0, 6);

  const consultationSuggestion =
    input.recommendationLevel === "review" ||
    input.manglikAnalysis.personA.severity === "high" ||
    input.manglikAnalysis.personB.severity === "high"
      ? "A consultation can help review timing, emotional rhythm, and family context without reducing the match to a simple yes/no verdict."
      : null;

  const reportSummary =
    `Compatibility reading remains ${input.recommendationLevel}. ` +
    `${emotionalCompatibility} ${communicationCompatibility} ${familySocialHarmony}`;

  const aiSummary =
    `Use the current compatibility reading as context, not certainty. ` +
    `Supportive factors are available, while ${conflictAreas.length} caution area(s) remain visible for careful review.`;

  const missingReason =
    input.missingData.length > 0
      ? "Some compatibility and Manglik details are still pending or unavailable in the foundation layer."
      : null;

  return {
    status:
      input.recommendationLevel === "insufficient_data"
        ? "unavailable"
        : input.missingData.length > 0
          ? "partial"
          : "ready",
    emotionalCompatibility,
    communicationCompatibility,
    familySocialHarmony,
    practicalLifeAlignment,
    conflictAreas,
    supportiveFactors,
    consultationSuggestion,
    reportSummary,
    aiSummary,
    missingReason:
      missingReason ??
      (manglikSensitiveCount + manglikModerateCount > 0
        ? "Manglik signals are partial and should be read in context."
        : null),
  };
}

function computeRecommendationLevel(input: {
  matchScore: number | null;
  maxScore: number | null;
  missingData: string[];
}): MatchmakingRecommendationLevel {
  if (input.matchScore === null || input.maxScore === null || input.maxScore === 0) {
    return "insufficient_data";
  }

  const ratio = input.matchScore / input.maxScore;

  if (ratio >= 0.75 && input.missingData.length === 0) {
    return "supportive";
  }

  if (ratio >= 0.55) {
    return "balanced";
  }

  return "review";
}

function buildSubjectMissingData(subject: MatchmakingSubjectSnapshot) {
  const missing: string[] = [];

  if (!subject.chartAvailable) {
    missing.push(`${subject.label}: chart data missing`);
  } else if (!subject.verifiedChart) {
    missing.push(`${subject.label}: chart not verified for matching`);
  } else if (!subject.moonSign || !subject.moonNakshatra) {
    missing.push(`${subject.label}: Moon sign/nakshatra unavailable`);
  }

  return missing;
}

function normalizeAsOfDateUtc(value?: Date | string) {
  if (!value) {
    return new Date().toISOString();
  }

  const normalized = value instanceof Date ? new Date(value.getTime()) : new Date(value);

  return Number.isNaN(normalized.getTime()) ? new Date().toISOString() : normalized.toISOString();
}

export function buildGunaMilanFoundation(input: MatchmakingPairInput): MatchmakingFoundationSnapshot {
  const resolvedA = buildSubjectSnapshot(input.personA, "Person A");
  const resolvedB = buildSubjectSnapshot(input.personB, "Person B");
  const missingData = [
    ...buildSubjectMissingData(resolvedA.snapshot),
    ...buildSubjectMissingData(resolvedB.snapshot),
  ];

  if (!resolvedA.moon || !resolvedB.moon) {
    return createAstrologyInfrastructureSnapshot({
      status: "unavailable",
      data: null,
      error: {
        code: "MATCHMAKING_CONTEXT_MISSING",
        message:
          "Guna Milan foundation requires verified Moon sign and nakshatra context for both charts.",
      },
    });
  }

  const varna = buildPendingKoota("VARNA", "Varna");
  const vashya = buildPendingKoota("VASHYA", "Vashya");
  const tara = buildTaraResult({
    personA: resolvedA.moon,
    personB: resolvedB.moon,
  });
  const yoni = buildPendingKoota("YONI", "Yoni");
  const grahaMaitri = buildGrahaMaitriResult({
    personA: resolvedA.moon,
    personB: resolvedB.moon,
  });
  const gana = buildGanaResult({
    personA: resolvedA.moon,
    personB: resolvedB.moon,
  });
  const bhakoot = buildBhakootResult({
    personA: resolvedA.moon,
    personB: resolvedB.moon,
  });
  const nadi = buildNadiResult({
    personA: resolvedA.moon,
    personB: resolvedB.moon,
  });

  const kootaBreakdown = [varna, vashya, tara, yoni, grahaMaitri, gana, bhakoot, nadi];
  const supported = kootaBreakdown.filter((entry) => entry.status === "ready");
  const matchScore = supported.reduce((total, entry) => total + (entry.score ?? 0), 0);
  const maxScore = supported.reduce((total, entry) => total + (entry.maxScore ?? 0), 0);
  const strengths = kootaBreakdown
    .filter((entry) => entry.status === "ready" && (entry.score ?? 0) > 0)
    .map((entry) => `${entry.title}: ${entry.summary}`);
  const cautions = kootaBreakdown
    .filter((entry) => entry.status === "pending" || entry.score === 0)
    .map((entry) => `${entry.title}: ${entry.summary}`);
  const recommendationLevel = computeRecommendationLevel({
    matchScore: maxScore > 0 ? matchScore : null,
    maxScore: maxScore > 0 ? maxScore : null,
    missingData,
  });
  const manglikAnalysis = {
    personA: buildManglikAnalysis({
      chart: resolvedA.chart,
    }),
    personB: buildManglikAnalysis({
      chart: resolvedB.chart,
    }),
  };
  const compatibilityInsights = buildCompatibilityInsights({
    matchScore,
    maxScore,
    recommendationLevel,
    kootaBreakdown,
    manglikAnalysis,
    missingData,
  });
  const scoreLabel =
    maxScore > 0 ? `${matchScore} / ${maxScore}` : "Unavailable";
  const summary =
    maxScore > 0
      ? `Guna Milan and Manglik compatibility are available for ${resolvedA.snapshot.label} and ${resolvedB.snapshot.label}. Supported kootas total ${scoreLabel}, with Manglik context and pending areas kept in a safe review frame.`
      : "Guna Milan foundation is unavailable until both verified Moon contexts are present.";

  return createAstrologyInfrastructureSnapshot({
    status: supported.length > 0 ? "partial" : "unavailable",
    data:
      supported.length > 0
        ? {
            comparisonType: "GUNA_MILAN",
            asOfDateUtc: normalizeAsOfDateUtc(input.asOfDateUtc),
            personA: resolvedA.snapshot,
            personB: resolvedB.snapshot,
            matchScore,
            maxScore,
            kootaBreakdown,
            summary,
            strengths,
            cautions,
            missingData: [
              ...missingData,
              ...kootaBreakdown
                .filter((entry) => entry.status === "pending")
                .map((entry) => `${entry.title}: pending in foundation`),
            ],
            recommendationLevel,
            manglikAnalysis: {
              personA: manglikAnalysis.personA,
              personB: manglikAnalysis.personB,
              summary: manglikAnalysis.personA.summary === manglikAnalysis.personB.summary
                ? manglikAnalysis.personA.summary
                : `${manglikAnalysis.personA.summary} ${manglikAnalysis.personB.summary}`,
              missingReason:
                manglikAnalysis.personA.missingReason || manglikAnalysis.personB.missingReason
                  ? "Some Manglik reference checks remain unavailable in the foundation layer."
                  : null,
            },
            compatibilityInsights,
            safeSummary: summary,
            missingReason:
              missingData.length > 0 || compatibilityInsights.missingReason
                ? "Some compatibility and Manglik details are pending or unavailable in the foundation."
                : null,
          }
        : null,
    error:
      supported.length > 0
        ? null
        : {
            code: "MATCHMAKING_CONTEXT_MISSING",
            message:
              "Guna Milan foundation requires verified Moon sign and nakshatra context for both charts.",
          },
  });
}
