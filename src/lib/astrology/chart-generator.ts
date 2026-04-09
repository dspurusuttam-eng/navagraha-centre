import "server-only";

import {
  debilitationSignsByBody,
  exaltationSignsByBody,
  houseSystemLabelMap,
  nakshatraLabelMap,
  ownSignsByBody,
  planetLabelMap,
  signRulerMap,
  zodiacSignLabelMap,
} from "@/lib/astrology/constants";
import {
  buildJulianDayFromLocal,
  getPlanetPositions,
  getSwissEphemerisRuntime,
} from "@/lib/astrology/ephemeris";
import { calculateHouses } from "@/lib/astrology/houses";
import { calculateAscendant } from "@/lib/astrology/lagna";
import { calculateMajorAspects, calculateVedicAspects } from "@/lib/astrology/rules/aspects";
import { calculateCurrentVimshottariDasha } from "@/lib/astrology/rules/dasha";
import { calculateYogas } from "@/lib/astrology/rules/yogas";
import type {
  AstrologicalAspect,
  BirthDetails,
  HouseNumber,
  HouseSystem,
  NatalChartResponse,
  PlanetPosition,
  PlanetaryBody,
  RemedySignal,
  SignalStrength,
  TransitChartResponse,
  TransitEvent,
} from "@/modules/astrology/types";

const angularHouses = new Set<HouseNumber>([1, 4, 7, 10]);
const trinalHouses = new Set<HouseNumber>([1, 5, 9]);
const challengingHouses = new Set<HouseNumber>([6, 8, 12]);
const ordinalHouseLabels: Record<HouseNumber, string> = {
  1: "1st",
  2: "2nd",
  3: "3rd",
  4: "4th",
  5: "5th",
  6: "6th",
  7: "7th",
  8: "8th",
  9: "9th",
  10: "10th",
  11: "11th",
  12: "12th",
};

type GeneratedNatalChart = NatalChartResponse;

function formatBody(body: PlanetaryBody) {
  return planetLabelMap[body];
}

function formatSign(sign: PlanetPosition["sign"]) {
  return zodiacSignLabelMap[sign];
}

function formatNakshatra(planet: PlanetPosition) {
  if (!planet.nakshatra) {
    return null;
  }

  return `${nakshatraLabelMap[planet.nakshatra.name]} pada ${planet.nakshatra.pada}`;
}

function getPlanet(planetMap: Record<PlanetaryBody, PlanetPosition>, body: PlanetaryBody) {
  return planetMap[body];
}

function isPlanetaryBody(value: PlanetaryBody | "ASCENDANT"): value is PlanetaryBody {
  return value !== "ASCENDANT";
}

function isOwnSign(planet: PlanetPosition) {
  return ownSignsByBody[planet.body]?.includes(planet.sign) ?? false;
}

function isExalted(planet: PlanetPosition) {
  return exaltationSignsByBody[planet.body] === planet.sign;
}

function isDebilitated(planet: PlanetPosition) {
  return debilitationSignsByBody[planet.body] === planet.sign;
}

function isHardAspect(
  aspects: readonly AstrologicalAspect[],
  body: PlanetaryBody
) {
  return aspects.some(
    (aspect) =>
      (aspect.type === "SQUARE" || aspect.type === "OPPOSITION") &&
      (aspect.source === body || aspect.target === body)
  );
}

function getDominantScores(
  planets: readonly PlanetPosition[],
  aspects: readonly AstrologicalAspect[],
  vedicAspectsCount: Map<PlanetaryBody, number>,
  yogaBodies: readonly PlanetaryBody[]
) {
  const yogaBodySet = new Set(yogaBodies);

  return new Map(
    planets.map((planet) => {
      let score = 0;

      if (angularHouses.has(planet.house)) {
        score += 3;
      }

      if (trinalHouses.has(planet.house)) {
        score += 2;
      }

      if (isOwnSign(planet)) {
        score += 3;
      }

      if (isExalted(planet)) {
        score += 4;
      }

      if (planet.retrograde) {
        score += 1;
      }

      if (yogaBodySet.has(planet.body)) {
        score += 2;
      }

      score += vedicAspectsCount.get(planet.body) ?? 0;
      score += aspects.filter(
        (aspect) => aspect.source === planet.body || aspect.target === planet.body
      ).length;

      return [planet.body, score] as const;
    })
  );
}

function getDominantBodies(
  planets: readonly PlanetPosition[],
  aspects: readonly AstrologicalAspect[],
  vedicAspects: GeneratedNatalChart["vedicAspects"],
  yogaBodies: readonly PlanetaryBody[]
) {
  const vedicAspectCount = new Map<PlanetaryBody, number>();

  for (const aspect of vedicAspects ?? []) {
    vedicAspectCount.set(
      aspect.source,
      (vedicAspectCount.get(aspect.source) ?? 0) + 1
    );

    if (typeof aspect.target === "string" && isPlanetaryBody(aspect.target)) {
      vedicAspectCount.set(
        aspect.target,
        (vedicAspectCount.get(aspect.target) ?? 0) + 1
      );
    }
  }

  return Array.from(
    getDominantScores(planets, aspects, vedicAspectCount, yogaBodies).entries()
  )
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([body]) => body);
}

function getChallengingPlanets(
  planets: readonly PlanetPosition[],
  aspects: readonly AstrologicalAspect[]
) {
  return planets
    .filter(
      (planet) =>
        challengingHouses.has(planet.house) ||
        isDebilitated(planet) ||
        isHardAspect(aspects, planet.body)
    )
    .slice(0, 3)
    .map((planet) => planet.body);
}

function getChallengeHouses(planets: readonly PlanetPosition[]) {
  return Array.from(
    new Set(
      planets
        .filter((planet) => challengingHouses.has(planet.house))
        .map((planet) => planet.house)
    )
  ).slice(0, 3);
}

function buildRemedySignals(
  planets: readonly PlanetPosition[],
  dominantBodies: readonly PlanetaryBody[],
  aspects: readonly AstrologicalAspect[]
): RemedySignal[] {
  const signals: RemedySignal[] = [];
  const moon = planets.find((planet) => planet.body === "MOON");
  const sun = planets.find((planet) => planet.body === "SUN");
  const saturn = planets.find((planet) => planet.body === "SATURN");
  const jupiter = planets.find((planet) => planet.body === "JUPITER");
  const rahu = planets.find((planet) => planet.body === "RAHU");
  const ketu = planets.find((planet) => planet.body === "KETU");

  if (sun && (dominantBodies.includes("SUN") || angularHouses.has(sun.house))) {
    signals.push({
      key: "solar-clarity",
      title: "Solar clarity deserves a disciplined daily channel.",
      category: "DISCIPLINE",
      level: dominantBodies.includes("SUN") ? "HIGH" : "MEDIUM",
      rationale:
        "The Sun is prominent enough that rhythm, consistency, and cleaner personal direction become useful supports.",
      relatedBodies: ["SUN"],
    });
  }

  if (moon && (dominantBodies.includes("MOON") || isHardAspect(aspects, "MOON"))) {
    signals.push({
      key: "lunar-settling",
      title: "Lunar sensitivity benefits from calming structure.",
      category: "DEVOTIONAL",
      level:
        dominantBodies.includes("MOON") && isHardAspect(aspects, "MOON")
          ? "HIGH"
          : "MEDIUM",
      rationale:
        "Moon emphasis or tension around the Moon responds best to gentler pacing, calmer evenings, and reflective support.",
      relatedBodies: ["MOON"],
    });
  }

  if (
    saturn &&
    (dominantBodies.includes("SATURN") ||
      saturn.retrograde ||
      challengingHouses.has(saturn.house))
  ) {
    signals.push({
      key: "saturn-discipline",
      title: "Saturn asks for steadiness over force.",
      category: "DISCIPLINE",
      level: dominantBodies.includes("SATURN") ? "HIGH" : "MEDIUM",
      rationale:
        "Saturn carries enough weight to favor quieter discipline, modest service, and restrained commitments.",
      relatedBodies: ["SATURN"],
    });
  }

  if (
    jupiter &&
    (dominantBodies.includes("JUPITER") || trinalHouses.has(jupiter.house))
  ) {
    signals.push({
      key: "jupiter-guidance",
      title: "Jupiter themes should stay devotional, not inflated.",
      category: "DEVOTIONAL",
      level: dominantBodies.includes("JUPITER") ? "HIGH" : "MEDIUM",
      rationale:
        "Jupiter is prominent enough that study, prayer, and teacher-guided wisdom become the safer emphasis.",
      relatedBodies: ["JUPITER"],
    });
  }

  if (
    (rahu && [1, 7, 8, 12].includes(rahu.house)) ||
    (ketu && [1, 7, 8, 12].includes(ketu.house))
  ) {
    signals.push({
      key: "nodal-grounding",
      title: "Nodal emphasis benefits from grounding and containment.",
      category: "LIFESTYLE",
      level: "MEDIUM",
      rationale:
        "When Rahu or Ketu lean into angular or more sensitive houses, slower boundaries and calmer devotional structure become more helpful.",
      relatedBodies: ["RAHU", "KETU"],
    });
  }

  if (!signals.length) {
    signals.push({
      key: "devotional-foundation",
      title: "A simple spiritual foundation is the safest start.",
      category: "DEVOTIONAL",
      level: "LOW",
      rationale:
        "When no single pressure dominates, calm repetition and a gentler spiritual rhythm are usually the better first response.",
      relatedBodies: dominantBodies.slice(0, 1),
    });
  }

  return signals;
}

function buildNarrative(input: {
  lagnaSign: PlanetPosition["sign"] | GeneratedNatalChart["ascendantSign"];
  dominantBodies: readonly PlanetaryBody[];
  houseSystem: HouseSystem;
  currentDasha: NonNullable<GeneratedNatalChart["currentDasha"]>;
  yogas: readonly NonNullable<GeneratedNatalChart["yogas"]>[number][];
}) {
  const dominantLabel = input.dominantBodies.map(formatBody).join(", ");
  const dashaLabel = formatBody(input.currentDasha.lord);
  const yogaLabel = input.yogas.length
    ? ` ${input.yogas.map((yoga) => yoga.title).join(", ")} is also present.`
    : "";

  return `${zodiacSignLabelMap[input.lagnaSign]} rising carries the chart through a ${houseSystemLabelMap[input.houseSystem].toLowerCase()} frame, with ${dominantLabel} holding the clearest weight. ${dashaLabel} mahadasha is the current timing backdrop.${yogaLabel}`;
}

function buildThemeLine(planet: PlanetPosition) {
  const nakshatraLine = formatNakshatra(planet);

  if (isExalted(planet)) {
    return `${formatBody(planet.body)} is exalted in ${formatSign(planet.sign)} in the ${ordinalHouseLabels[planet.house]} house${nakshatraLine ? `, in ${nakshatraLine}` : ""}.`;
  }

  if (isOwnSign(planet)) {
    return `${formatBody(planet.body)} is in its own sign of ${formatSign(planet.sign)} in the ${ordinalHouseLabels[planet.house]} house${nakshatraLine ? `, in ${nakshatraLine}` : ""}.`;
  }

  return `${formatBody(planet.body)} is placed in ${formatSign(planet.sign)} in the ${ordinalHouseLabels[planet.house]} house${nakshatraLine ? `, in ${nakshatraLine}` : ""}.`;
}

function getTransitIntensity(planet: PlanetPosition): SignalStrength {
  if (
    angularHouses.has(planet.house) ||
    challengingHouses.has(planet.house) ||
    planet.body === "SATURN" ||
    planet.body === "RAHU" ||
    planet.body === "KETU"
  ) {
    return "HIGH";
  }

  if (trinalHouses.has(planet.house) || planet.body === "JUPITER") {
    return "MEDIUM";
  }

  return "LOW";
}

function buildTransitSummary(planet: PlanetPosition) {
  return `${formatBody(planet.body)} is currently moving through ${formatSign(planet.sign)} in the ${ordinalHouseLabels[planet.house]} house.`;
}

function clampToWindow(window: { fromDateUtc: string; toDateUtc: string }) {
  const now = new Date();
  const fromDate = new Date(window.fromDateUtc);
  const toDate = new Date(window.toDateUtc);

  if (now < fromDate) {
    return fromDate;
  }

  if (now > toDate) {
    return toDate;
  }

  return now;
}

function toUtcDateParts(date: Date) {
  return {
    dateLocal: date.toISOString().slice(0, 10),
    timeLocal: date.toISOString().slice(11, 16),
  };
}

function getTransitToNatalAspects(
  transitPlanets: readonly PlanetPosition[],
  natalPlanets: readonly PlanetPosition[]
) {
  const aspects: AstrologicalAspect[] = [];
  const targetBodies = new Set(natalPlanets.slice(0, 5).map((planet) => planet.body));

  for (const transitPlanet of transitPlanets) {
    for (const natalPlanet of natalPlanets) {
      if (!targetBodies.has(natalPlanet.body)) {
        continue;
      }

      const separation = Math.abs(transitPlanet.longitude - natalPlanet.longitude);
      const normalizedSeparation =
        separation > 180 ? 360 - separation : separation;
      const candidates = [
        { type: "CONJUNCTION", angle: 0, maxOrb: 6 },
        { type: "SQUARE", angle: 90, maxOrb: 5 },
        { type: "TRINE", angle: 120, maxOrb: 5 },
        { type: "OPPOSITION", angle: 180, maxOrb: 6 },
      ] as const;

      for (const candidate of candidates) {
        const orb = Number(
          Math.abs(normalizedSeparation - candidate.angle).toFixed(2)
        );

        if (orb > candidate.maxOrb) {
          continue;
        }

        aspects.push({
          type: candidate.type,
          source: transitPlanet.body,
          target: natalPlanet.body,
          orb,
          applying: false,
          exact: orb <= 1,
        });
        break;
      }
    }
  }

  return aspects.slice(0, 8);
}

export function generateBirthChart(input: {
  birthDetails: BirthDetails;
  houseSystem?: HouseSystem;
}): GeneratedNatalChart {
  const houseSystem = input.houseSystem ?? "WHOLE_SIGN";
  const latitude = input.birthDetails.place.latitude;
  const longitude = input.birthDetails.place.longitude;

  if (latitude === null || latitude === undefined) {
    throw new Error("Latitude is required to generate a real sidereal birth chart.");
  }

  if (longitude === null || longitude === undefined) {
    throw new Error(
      "Longitude is required to generate a real sidereal birth chart."
    );
  }

  const runtime = getSwissEphemerisRuntime();
  const houses = calculateHouses(
    input.birthDetails.dateLocal,
    input.birthDetails.timeLocal,
    latitude,
    longitude,
    input.birthDetails.timezone,
    houseSystem
  );
  const lagna = calculateAscendant(
    input.birthDetails.dateLocal,
    input.birthDetails.timeLocal,
    latitude,
    longitude,
    input.birthDetails.timezone,
    houseSystem
  );
  const planetMap = getPlanetPositions(
    input.birthDetails.dateLocal,
    input.birthDetails.timeLocal,
    latitude,
    longitude,
    input.birthDetails.timezone,
    houseSystem,
    houses.houseCusps
  );
  const planets = Object.values(planetMap);
  const aspects = calculateMajorAspects(planets);
  const vedicAspects = calculateVedicAspects(planets);
  const yogas = calculateYogas({
    houses: houses.houses,
    planets,
    vedicAspects,
  });
  const { utcDate } = buildJulianDayFromLocal(
    input.birthDetails.dateLocal,
    input.birthDetails.timeLocal,
    input.birthDetails.timezone
  );
  const currentDasha = calculateCurrentVimshottariDasha({
    moonLongitude: getPlanet(planetMap, "MOON").longitude,
    birthDateUtc: utcDate,
  });
  const dominantBodies = getDominantBodies(
    planets,
    aspects,
    vedicAspects,
    yogas.flatMap((yoga) => yoga.relatedBodies)
  );
  const challengeBodies = getChallengingPlanets(planets, aspects);
  const remedySignals = buildRemedySignals(planets, dominantBodies, aspects);

  return {
    kind: "NATAL",
    metadata: {
      providerKey: "swisseph-vedic",
      fixtureKey: runtime.calculationVersion,
      requestId: "chart-generator",
      generatedAtUtc: new Date().toISOString(),
      deterministic: true,
      disclaimer:
        runtime.ephemerisSource === "SWIEPH"
          ? "Sidereal natal chart calculated through Swiss Ephemeris with Lahiri ayanamsa."
          : "Sidereal natal chart calculated through Swiss Ephemeris bindings with Lahiri ayanamsa and the built-in Moshier fallback because no ephemeris file path is configured.",
    },
    birthDetails: input.birthDetails,
    houseSystem,
    ascendantSign: lagna.sign,
    lagna,
    planets,
    houses: houses.houses,
    aspects,
    vedicAspects,
    divisionalCharts: [],
    remedySignals,
    yogas,
    currentDasha,
    nakshatras: planets.map((planet) => ({
      body: planet.body,
      placement: planet.nakshatra ?? {
        name: "ASHWINI",
        pada: 1,
        ruler: "KETU",
        degreesIntoNakshatra: 0,
      },
    })),
    summary: {
      dominantBodies,
      narrative: buildNarrative({
        lagnaSign: lagna.sign,
        dominantBodies,
        houseSystem,
        currentDasha,
        yogas,
      }),
      strongestPlanets: dominantBodies,
      challengingPlanets: challengeBodies,
      challengingHouses: getChallengeHouses(planets),
      yogaKeys: yogas.map((yoga) => yoga.key),
      currentDashaLord: currentDasha.lord,
    },
  };
}

export function generateTransitSnapshot(input: {
  birthDetails: BirthDetails;
  houseSystem?: HouseSystem;
  window: {
    fromDateUtc: string;
    toDateUtc: string;
  };
}) {
  const houseSystem = input.houseSystem ?? "WHOLE_SIGN";
  const latitude = input.birthDetails.place.latitude;
  const longitude = input.birthDetails.place.longitude;

  if (latitude === null || latitude === undefined) {
    throw new Error("Latitude is required to calculate transits.");
  }

  if (longitude === null || longitude === undefined) {
    throw new Error("Longitude is required to calculate transits.");
  }

  const natalChart = generateBirthChart({
    birthDetails: input.birthDetails,
    houseSystem,
  });
  const transitDate = clampToWindow(input.window);
  const utcParts = toUtcDateParts(transitDate);
  const transitPlanetMap = getPlanetPositions(
    utcParts.dateLocal,
    utcParts.timeLocal,
    latitude,
    longitude,
    "UTC",
    houseSystem,
    natalChart.houses
      .map((house) => house.cuspLongitude)
      .filter((value): value is number => typeof value === "number")
  );
  const transitPlanets = Object.values(transitPlanetMap);
  const transits: TransitEvent[] = transitPlanets.map((planet) => ({
    id: `transit-${planet.body.toLowerCase()}`,
    body: planet.body,
    sign: planet.sign,
    house: planet.house,
    startsAtUtc: transitDate.toISOString(),
    summary: buildTransitSummary(planet),
    intensity: getTransitIntensity(planet),
  }));

  return {
    kind: "TRANSIT_SNAPSHOT",
    metadata: {
      providerKey: "swisseph-vedic",
      fixtureKey: natalChart.metadata.fixtureKey,
      requestId: "transit-generator",
      generatedAtUtc: new Date().toISOString(),
      deterministic: true,
      disclaimer:
        "Transit snapshot calculated from current sidereal graha positions and mapped against the stored natal house framework.",
    },
    birthDetails: input.birthDetails,
    houseSystem,
    window: input.window,
    transits,
    aspects: getTransitToNatalAspects(transitPlanets, natalChart.planets),
    remedySignals: natalChart.remedySignals,
    currentDasha: natalChart.currentDasha,
  } satisfies TransitChartResponse;
}

export function buildChartSummaryInsights(chart: GeneratedNatalChart) {
  const strongestPlanetLines = (chart.summary.strongestPlanets ?? [])
    .map((body) => getPlanet(chart.planets.reduce((accumulator, planet) => {
      accumulator[planet.body] = planet;
      return accumulator;
    }, {} as Record<PlanetaryBody, PlanetPosition>), body))
    .filter((planet): planet is PlanetPosition => Boolean(planet))
    .slice(0, 3)
    .map((planet) => buildThemeLine(planet));

  const cautionLines = (chart.summary.challengingPlanets ?? [])
    .map((body) => {
      const planet = chart.planets.find((entry) => entry.body === body);

      if (!planet) {
        return null;
      }

      if (isDebilitated(planet)) {
        return `${formatBody(body)} is debilitated in ${formatSign(planet.sign)}, so that area benefits from more patience and humility than force.`;
      }

      if (challengingHouses.has(planet.house)) {
        return `${formatBody(body)} is working through the ${ordinalHouseLabels[planet.house]} house, so that topic is better handled carefully and without overstatement.`;
      }

      return `${formatBody(body)} carries some tension in the current chart and benefits from slower judgement.`;
    })
    .filter((line): line is string => Boolean(line))
    .slice(0, 3);

  const recommendationLines = [
    chart.currentDasha
      ? `The current ${formatBody(chart.currentDasha.lord)} mahadasha remains the main timing backdrop for interpretation and practical follow-through.`
      : null,
    chart.yogas?.length
      ? `${chart.yogas.map((yoga) => yoga.title).join(", ")} should be read as potential patterns, not guaranteed outcomes.`
      : null,
    chart.remedySignals[0]
      ? chart.remedySignals[0].rationale
      : "A measured spiritual routine is the safest baseline until more nuanced context is added through consultation.",
  ].filter((line): line is string => Boolean(line));

  return {
    strengths: strongestPlanetLines,
    challenges: cautionLines,
    recommendations: recommendationLines,
  };
}
