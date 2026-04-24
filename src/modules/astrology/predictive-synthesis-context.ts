import { planetLabelMap, planetSortOrder } from "@/lib/astrology/constants";
import type { YogaRuleOutput } from "@/lib/astrology/rules/yoga-rule-engine";
import type { UnifiedSiderealChart } from "@/modules/astrology/chart-contract-types";
import {
  getDashaContextForChart,
  type UnifiedDashaContextOutput,
} from "@/modules/astrology/dasha-context";
import {
  getTransitContextForChart,
  type TransitContextGraha,
  type TransitContextOutput,
} from "@/modules/astrology/transit-context";
import { getYogaRuleContextForChart } from "@/modules/astrology/yoga-rule-context";

export type PredictiveSynthesisConfidence = "high" | "medium" | "low";
export type PredictiveSynthesisFailureCode =
  | "INVALID_CHART_CONTEXT"
  | "UNVERIFIED_CHART_CONTEXT"
  | "MOON_CONTEXT_MISSING"
  | "DASHA_CONTEXT_FAILED"
  | "TRANSIT_CONTEXT_FAILED"
  | "YOGA_RULE_CONTEXT_FAILED";

type PredictiveSynthesisSnapshot = {
  planet: string;
  start_date: string;
  end_date: string;
} | null;

type NatalPlacementSnapshot = {
  planet: string;
  sign: string;
  house: number;
  degree_in_sign: number;
  nakshatra: string;
  pada: number;
  is_retrograde: boolean;
  is_combust: boolean;
};

export type PredictiveSynthesisOutput = {
  as_of: string;
  chart_identity: {
    lagna_sign: string;
    moon_sign: string;
    moon_nakshatra: string;
  };
  natal_context: {
    core_placements: NatalPlacementSnapshot[];
    key_strengths: string[];
    key_pressures: string[];
  };
  dasha_context: {
    mahadasha: PredictiveSynthesisSnapshot;
    antardasha: PredictiveSynthesisSnapshot;
    pratyantar: PredictiveSynthesisSnapshot;
    day_dasha: PredictiveSynthesisSnapshot;
    next_transition_at: string | null;
    next_transition_level:
      | "MAHADASHA"
      | "ANTARDASHA"
      | "PRATYANTAR"
      | "DAY_DASHA"
      | null;
  };
  transit_context: {
    key_active_houses: number[];
    active_transits: TransitContextGraha[];
  };
  yoga_rule_context: {
    dignity_signals: YogaRuleOutput["dignity_signals"];
    conjunctions: YogaRuleOutput["conjunctions"];
    house_lord_rules: YogaRuleOutput["house_lord_rules"];
    yoga_signals: YogaRuleOutput["yoga_signals"];
    structural_summary: YogaRuleOutput["structural_summary"];
  };
  synthesis_summary: {
    dominant_planets: string[];
    dominant_houses: number[];
    active_supportive_factors: string[];
    active_pressure_factors: string[];
    timing_focus: string[];
    confidence: PredictiveSynthesisConfidence;
    confidence_reasons: string[];
  };
};

export type PredictiveSynthesisContextFailure = {
  success: false;
  error: {
    code: PredictiveSynthesisFailureCode;
    message: string;
  };
  details?: unknown;
};

export type PredictiveSynthesisContextSuccess = {
  success: true;
  data: PredictiveSynthesisOutput;
};

export type PredictiveSynthesisContextResult =
  | PredictiveSynthesisContextFailure
  | PredictiveSynthesisContextSuccess;

const supportiveTransitHouses = new Set<number>([1, 2, 5, 9, 10, 11]);
const pressureTransitHouses = new Set<number>([6, 8, 12]);
const supportiveDignityTypes = new Set([
  "OWN_SIGN",
  "EXALTED",
  "MOOLATRIKONA_CANDIDATE",
  "FRIEND_SIGN",
]);
const pressureDignityTypes = new Set(["DEBILITATED", "COMBUST", "ENEMY_SIGN"]);
const houseFocusMap: Record<number, string> = {
  1: "identity and vitality",
  2: "finances and values",
  3: "effort and communication",
  4: "home and emotional foundations",
  5: "creativity and children",
  6: "work discipline and health routines",
  7: "relationships and agreements",
  8: "transformation and hidden pressures",
  9: "guidance and dharma",
  10: "career and public role",
  11: "gains and networks",
  12: "rest, retreat, and release",
};

const planetLabelToBody = new Map(
  Object.entries(planetLabelMap).map(([body, label]) => [label.toLowerCase(), body])
);

function fail(
  code: PredictiveSynthesisFailureCode,
  message: string,
  details?: unknown
): PredictiveSynthesisContextFailure {
  return {
    success: false,
    error: {
      code,
      message,
    },
    details,
  };
}

function toPlanetBodyName(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  const upper = normalized.toUpperCase();

  if (planetSortOrder.has(upper as keyof typeof planetLabelMap)) {
    return upper;
  }

  return planetLabelToBody.get(normalized.toLowerCase()) ?? null;
}

function getPlanetSortScore(planet: string) {
  const body = toPlanetBodyName(planet);

  if (!body) {
    return Number.MAX_SAFE_INTEGER;
  }

  return planetSortOrder.get(body as keyof typeof planetLabelMap) ?? Number.MAX_SAFE_INTEGER;
}

function dedupeAndSortPlanets(planets: string[]) {
  return Array.from(new Set(planets)).sort((left, right) => {
    const scoreDelta = getPlanetSortScore(left) - getPlanetSortScore(right);

    if (scoreDelta !== 0) {
      return scoreDelta;
    }

    return left.localeCompare(right);
  });
}

function buildChartPlanetMap(chart: UnifiedSiderealChart) {
  const map = new Map<string, UnifiedSiderealChart["planets"][number]>();

  for (const planet of chart.planets) {
    const key = toPlanetBodyName(planet.name);

    if (key) {
      map.set(key, planet);
    }
  }

  return map;
}

function buildCorePlacements(chart: UnifiedSiderealChart): NatalPlacementSnapshot[] {
  return chart.planets
    .slice()
    .sort(
      (left, right) =>
        getPlanetSortScore(left.name) - getPlanetSortScore(right.name)
    )
    .map((planet) => ({
      planet: toPlanetBodyName(planet.name) ?? planet.name.toUpperCase(),
      sign: planet.sign,
      house: planet.house,
      degree_in_sign: Number(planet.degree_in_sign.toFixed(4)),
      nakshatra: planet.nakshatra,
      pada: planet.pada,
      is_retrograde: planet.is_retrograde,
      is_combust: planet.is_combust,
    }));
}

function scoreDominantPlanets(input: {
  dasha: UnifiedDashaContextOutput;
  transit: TransitContextOutput;
  yoga: YogaRuleOutput;
}) {
  const scores = new Map<string, number>();
  const add = (planet: string | null | undefined, points: number) => {
    if (!planet) {
      return;
    }

    const key = toPlanetBodyName(planet) ?? planet.toUpperCase();
    const current = scores.get(key) ?? 0;
    scores.set(key, current + points);
  };

  add(input.dasha.current_dasha_context.mahadasha?.planet, 6);
  add(input.dasha.current_dasha_context.antardasha?.planet, 5);
  add(input.dasha.current_dasha_context.pratyantar?.planet, 4);
  add(input.dasha.current_dasha_context.day_dasha?.planet, 3);

  for (const transit of input.transit.transits) {
    const pressureBoost = pressureTransitHouses.has(transit.house_from_lagna) ? 2 : 1;
    add(transit.planet, pressureBoost);
  }

  for (const signal of input.yoga.dignity_signals) {
    const points = supportiveDignityTypes.has(signal.dignity_type)
      ? 2
      : pressureDignityTypes.has(signal.dignity_type)
        ? 1
        : 0;
    add(signal.planet, points);
  }

  for (const signal of input.yoga.yoga_signals) {
    const points = signal.confidence === "high" ? 3 : signal.confidence === "medium" ? 2 : 1;

    for (const planet of signal.planets_involved) {
      add(planet, points);
    }
  }

  return Array.from(scores.entries())
    .sort((left, right) => {
      if (left[1] !== right[1]) {
        return right[1] - left[1];
      }

      const planetSortDelta = getPlanetSortScore(left[0]) - getPlanetSortScore(right[0]);

      if (planetSortDelta !== 0) {
        return planetSortDelta;
      }

      return left[0].localeCompare(right[0]);
    })
    .slice(0, 5)
    .map(([planet]) => planet);
}

function scoreDominantHouses(input: {
  chart: UnifiedSiderealChart;
  dasha: UnifiedDashaContextOutput;
  transit: TransitContextOutput;
  yoga: YogaRuleOutput;
}) {
  const houseScores = new Map<number, number>();
  const add = (house: number | null | undefined, points: number) => {
    if (!house || !Number.isInteger(house) || house < 1 || house > 12) {
      return;
    }

    houseScores.set(house, (houseScores.get(house) ?? 0) + points);
  };
  const chartPlanetMap = buildChartPlanetMap(input.chart);
  const activeChainWeights: Array<{ planet: string | null; points: number }> = [
    { planet: input.dasha.current_dasha_context.mahadasha?.planet ?? null, points: 4 },
    { planet: input.dasha.current_dasha_context.antardasha?.planet ?? null, points: 3 },
    { planet: input.dasha.current_dasha_context.pratyantar?.planet ?? null, points: 2 },
    { planet: input.dasha.current_dasha_context.day_dasha?.planet ?? null, points: 1 },
  ];

  for (const chainEntry of activeChainWeights) {
    if (!chainEntry.planet) {
      continue;
    }

    const key = toPlanetBodyName(chainEntry.planet);
    const natal = key ? chartPlanetMap.get(key) : null;
    add(natal?.house ?? null, chainEntry.points);
  }

  for (const transit of input.transit.transits) {
    add(transit.house_from_lagna, 1);

    if (supportiveTransitHouses.has(transit.house_from_lagna)) {
      add(transit.house_from_lagna, 1);
    }

    if (pressureTransitHouses.has(transit.house_from_lagna)) {
      add(transit.house_from_lagna, 1);
    }
  }

  for (const conjunction of input.yoga.conjunctions) {
    add(conjunction.house, conjunction.type === "CLOSE_DEGREE" ? 2 : 1);
  }

  for (const rule of input.yoga.house_lord_rules) {
    add(rule.placed_in_house, rule.classification === "DUSTHANA" ? 1 : 2);
  }

  return Array.from(houseScores.entries())
    .sort((left, right) => {
      if (left[1] !== right[1]) {
        return right[1] - left[1];
      }

      return left[0] - right[0];
    })
    .slice(0, 5)
    .map(([house]) => house);
}

function buildSupportiveFactors(input: {
  dasha: UnifiedDashaContextOutput;
  transit: TransitContextOutput;
  yoga: YogaRuleOutput;
}) {
  const factors: string[] = [];

  for (const signal of input.yoga.dignity_signals) {
    if (!supportiveDignityTypes.has(signal.dignity_type)) {
      continue;
    }

    factors.push(
      `${signal.planet} shows ${signal.dignity_type.toLowerCase()} support in ${signal.sign} (house ${signal.house}).`
    );
  }

  for (const yoga of input.yoga.yoga_signals) {
    if (yoga.confidence === "low") {
      continue;
    }

    factors.push(
      `${yoga.yoga_name} is active at ${yoga.confidence} confidence via ${yoga.planets_involved.join(", ")}.`
    );
  }

  const dashaChain = dedupeAndSortPlanets(input.dasha.dasha_timeline_summary.active_chain);

  for (const transit of input.transit.transits) {
    if (
      dashaChain.includes(transit.planet) &&
      supportiveTransitHouses.has(transit.house_from_lagna)
    ) {
      factors.push(
        `Active dasha planet ${transit.planet} is transiting house ${transit.house_from_lagna}, supporting current momentum.`
      );
    }
  }

  return Array.from(new Set(factors)).slice(0, 10);
}

function buildPressureFactors(input: {
  dasha: UnifiedDashaContextOutput;
  transit: TransitContextOutput;
  yoga: YogaRuleOutput;
}) {
  const factors: string[] = [];

  for (const signal of input.yoga.dignity_signals) {
    if (!pressureDignityTypes.has(signal.dignity_type)) {
      continue;
    }

    factors.push(
      `${signal.planet} carries ${signal.dignity_type.toLowerCase()} pressure in ${signal.sign} (house ${signal.house}).`
    );
  }

  for (const transit of input.transit.transits) {
    if (!pressureTransitHouses.has(transit.house_from_lagna)) {
      continue;
    }

    factors.push(
      `${transit.planet} transit through house ${transit.house_from_lagna} increases pressure around that life domain.`
    );
  }

  const activeChain = input.dasha.dasha_timeline_summary.active_chain;

  if (activeChain.some((planet) => ["SATURN", "MARS", "RAHU", "KETU"].includes(planet))) {
    factors.push(
      "Current active dasha chain includes stricter karmic planets, so pacing and discipline matter more."
    );
  }

  return Array.from(new Set(factors)).slice(0, 10);
}

function buildTimingFocus(dominantHouses: number[]) {
  return dominantHouses
    .slice(0, 3)
    .map((house) => houseFocusMap[house] ?? `house ${house} themes`);
}

function buildConfidence(input: {
  supportiveFactors: string[];
  pressureFactors: string[];
  dominantPlanets: string[];
  dominantHouses: number[];
  dasha: UnifiedDashaContextOutput;
  yogaSignalsCount: number;
}) {
  const reasons: string[] = [];
  const activeChainComplete =
    input.dasha.current_dasha_context.mahadasha &&
    input.dasha.current_dasha_context.antardasha &&
    input.dasha.current_dasha_context.pratyantar &&
    input.dasha.current_dasha_context.day_dasha;

  if (activeChainComplete) {
    reasons.push("Complete active dasha chain is available.");
  } else {
    reasons.push("Active dasha chain is partially available.");
  }

  if (input.yogaSignalsCount >= 3) {
    reasons.push("Multiple yoga/rule signals support pattern stability.");
  } else if (input.yogaSignalsCount > 0) {
    reasons.push("Some yoga/rule signals are available but limited in count.");
  } else {
    reasons.push("Yoga/rule signal count is minimal.");
  }

  if (input.supportiveFactors.length > 0 && input.pressureFactors.length > 0) {
    reasons.push("Both supportive and pressure factors are visible in the current context.");
  } else {
    reasons.push("Support/pressure balance is incomplete and requires cautious interpretation.");
  }

  let confidence: PredictiveSynthesisConfidence = "medium";

  if (
    activeChainComplete &&
    input.yogaSignalsCount >= 3 &&
    input.dominantPlanets.length >= 3 &&
    input.dominantHouses.length >= 3 &&
    input.supportiveFactors.length > 0 &&
    input.pressureFactors.length > 0
  ) {
    confidence = "high";
  } else if (
    !activeChainComplete ||
    input.dominantPlanets.length < 2 ||
    input.dominantHouses.length < 2
  ) {
    confidence = "low";
  }

  return {
    confidence,
    confidence_reasons: reasons,
  };
}

export function getPredictiveSynthesisContextForChart(input: {
  chart: UnifiedSiderealChart | null | undefined;
  asOfDateUtc?: Date | string;
}): PredictiveSynthesisContextResult {
  if (!input.chart) {
    return fail(
      "INVALID_CHART_CONTEXT",
      "Chart context is required for predictive synthesis."
    );
  }

  if (!input.chart.verification?.is_verified_for_chart_logic) {
    return fail(
      "UNVERIFIED_CHART_CONTEXT",
      "Predictive synthesis requires a verified chart context."
    );
  }

  const dasha = getDashaContextForChart({
    chart: input.chart,
    asOfDateUtc: input.asOfDateUtc,
  });

  if (!dasha.success) {
    return fail("DASHA_CONTEXT_FAILED", dasha.error.message, dasha.error);
  }

  const transit = getTransitContextForChart({
    chart: input.chart,
    asOfDateUtc: input.asOfDateUtc,
  });

  if (!transit.success) {
    return fail("TRANSIT_CONTEXT_FAILED", transit.error.message, transit.error);
  }

  const yoga = getYogaRuleContextForChart({
    chart: input.chart,
  });

  if (!yoga.success) {
    return fail("YOGA_RULE_CONTEXT_FAILED", yoga.issue.message, yoga.issue);
  }

  const moon = input.chart.planets.find(
    (planet) => toPlanetBodyName(planet.name) === "MOON"
  );

  if (!moon) {
    return fail(
      "MOON_CONTEXT_MISSING",
      "Predictive synthesis requires Moon sign/nakshatra context."
    );
  }

  const dominantPlanets = scoreDominantPlanets({
    dasha: dasha.data,
    transit: transit.data,
    yoga: yoga.data,
  });
  const dominantHouses = scoreDominantHouses({
    chart: input.chart,
    dasha: dasha.data,
    transit: transit.data,
    yoga: yoga.data,
  });
  const supportiveFactors = buildSupportiveFactors({
    dasha: dasha.data,
    transit: transit.data,
    yoga: yoga.data,
  });
  const pressureFactors = buildPressureFactors({
    dasha: dasha.data,
    transit: transit.data,
    yoga: yoga.data,
  });
  const timingFocus = buildTimingFocus(dominantHouses);
  const confidence = buildConfidence({
    supportiveFactors,
    pressureFactors,
    dominantPlanets,
    dominantHouses,
    dasha: dasha.data,
    yogaSignalsCount: yoga.data.yoga_signals.length,
  });

  return {
    success: true,
    data: {
      as_of: transit.data.as_of,
      chart_identity: {
        lagna_sign: input.chart.lagna.sign,
        moon_sign: moon.sign,
        moon_nakshatra: dasha.data.moon_nakshatra,
      },
      natal_context: {
        core_placements: buildCorePlacements(input.chart),
        key_strengths: yoga.data.structural_summary.key_strengths,
        key_pressures: yoga.data.structural_summary.key_pressures,
      },
      dasha_context: {
        mahadasha: dasha.data.current_dasha_context.mahadasha,
        antardasha: dasha.data.current_dasha_context.antardasha,
        pratyantar: dasha.data.current_dasha_context.pratyantar,
        day_dasha: dasha.data.current_dasha_context.day_dasha,
        next_transition_at: dasha.data.dasha_timeline_summary.next_transition_at,
        next_transition_level:
          dasha.data.dasha_timeline_summary.next_transition_level,
      },
      transit_context: {
        key_active_houses: transit.data.transit_summary.key_active_houses,
        active_transits: transit.data.transits,
      },
      yoga_rule_context: {
        dignity_signals: yoga.data.dignity_signals,
        conjunctions: yoga.data.conjunctions,
        house_lord_rules: yoga.data.house_lord_rules,
        yoga_signals: yoga.data.yoga_signals,
        structural_summary: yoga.data.structural_summary,
      },
      synthesis_summary: {
        dominant_planets: dominantPlanets,
        dominant_houses: dominantHouses,
        active_supportive_factors: supportiveFactors,
        active_pressure_factors: pressureFactors,
        timing_focus: timingFocus,
        confidence: confidence.confidence,
        confidence_reasons: confidence.confidence_reasons,
      },
    },
  };
}
