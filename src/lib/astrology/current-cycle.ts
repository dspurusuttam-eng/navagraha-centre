import "server-only";

import {
  nakshatraLabelMap,
  ownSignsByBody,
  planetLabelMap,
  zodiacSignLabelMap,
} from "@/lib/astrology/constants";
import { calculateCurrentVimshottariDasha } from "@/lib/astrology/rules/dasha";
import type {
  DashaPeriod,
  HouseNumber,
  NatalChartResponse,
  PlanetPosition,
  PlanetaryBody,
  SignalStrength,
  TransitChartResponse,
  TransitEvent,
  TransitWindow,
} from "@/modules/astrology/types";

type CurrentCycleStatus = "ready" | "unavailable";
type CurrentCycleSource = "DASHA" | "TRANSIT" | "SYNTHESIS";

export type CurrentTransitPlanetSnapshot = {
  body: PlanetaryBody;
  sign: string;
  degree: number;
  minute: number;
  longitude: number;
  house: HouseNumber;
  retrograde: boolean;
  nakshatra: string | null;
  intensity: SignalStrength;
  summary: string;
};

export type CurrentCycleFocusArea = {
  key: string;
  title: string;
  summary: string;
  source: CurrentCycleSource;
  intensity: SignalStrength;
  relatedBodies: PlanetaryBody[];
  houses: HouseNumber[];
  lifeAreas: string[];
  timeframeLabel: string;
};

export type CurrentCycleWindow = {
  key: string;
  title: string;
  summary: string;
  intensity: SignalStrength;
  relatedBodies: PlanetaryBody[];
  houses: HouseNumber[];
  lifeAreas: string[];
  timeframeLabel: string;
};

export type CurrentCycleFollowUpTheme = {
  key: string;
  title: string;
  note: string;
  relatedBodies: PlanetaryBody[];
  consultationRecommended: boolean;
};

export type DashaTransitSynthesis = {
  overview: string;
  activeAreas: CurrentCycleFocusArea[];
  supportiveWindows: CurrentCycleWindow[];
  cautionWindows: CurrentCycleWindow[];
  followUpThemes: CurrentCycleFollowUpTheme[];
  timeSensitiveHighlights: string[];
};

export type CurrentCycleAdminSupport = {
  currentFocusAreas: CurrentCycleFocusArea[];
  timingSensitiveCautions: CurrentCycleWindow[];
  followUpWindows: CurrentCycleWindow[];
};

export type CurrentCycleSummary = {
  status: CurrentCycleStatus;
  generatedAtUtc: string;
  unavailableReason: string | null;
  dasha: DashaPeriod | null;
  transitSnapshot: {
    asOfUtc: string | null;
    window: TransitWindow | null;
    planets: CurrentTransitPlanetSnapshot[];
    aspects: {
      source: string;
      type: string;
      target: string;
      orb: number;
      exact: boolean;
    }[];
  };
  synthesis: DashaTransitSynthesis;
  adminSupport: CurrentCycleAdminSupport;
};

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

const houseLifeAreas: Record<HouseNumber, string[]> = {
  1: ["identity", "vitality", "self-direction"],
  2: ["finances", "speech", "family resources"],
  3: ["skills", "communication", "courage"],
  4: ["home", "emotional foundations", "property"],
  5: ["creativity", "study", "children"],
  6: ["work routines", "service", "health discipline"],
  7: ["partnerships", "agreements", "client relationships"],
  8: ["shared assets", "deep change", "vulnerability"],
  9: ["higher learning", "faith", "guidance"],
  10: ["career", "reputation", "public role"],
  11: ["networks", "gains", "community"],
  12: ["rest", "retreat", "expenses"],
};

const transitPriorityOrder: Record<PlanetaryBody, number> = {
  SATURN: 9,
  JUPITER: 8,
  RAHU: 7,
  KETU: 7,
  MARS: 6,
  SUN: 5,
  VENUS: 4,
  MERCURY: 3,
  MOON: 2,
};

const supportiveTransitBodies = new Set<PlanetaryBody>([
  "JUPITER",
  "VENUS",
  "MERCURY",
]);
const cautionTransitBodies = new Set<PlanetaryBody>([
  "SATURN",
  "MARS",
  "RAHU",
  "KETU",
]);
const supportiveTransitHouses = new Set<HouseNumber>([1, 2, 5, 9, 10, 11]);
const cautionTransitHouses = new Set<HouseNumber>([1, 6, 7, 8, 12]);

function formatBody(body: PlanetaryBody) {
  return planetLabelMap[body];
}

function getTimeZoneParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === "year")?.value ?? "0"),
    month: Number(parts.find((part) => part.type === "month")?.value ?? "1"),
    day: Number(parts.find((part) => part.type === "day")?.value ?? "1"),
    hour: Number(parts.find((part) => part.type === "hour")?.value ?? "0"),
    minute: Number(parts.find((part) => part.type === "minute")?.value ?? "0"),
    second: Number(parts.find((part) => part.type === "second")?.value ?? "0"),
  };
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = getTimeZoneParts(date, timeZone);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );

  return asUtc - date.getTime();
}

function convertZonedBirthToUtcDate(
  dateLocal: string,
  timeLocal: string,
  timezone: string
) {
  const [year, month, day] = dateLocal.split("-").map(Number);
  const [hour, minute] = timeLocal.split(":").map(Number);
  const naiveUtcMs = Date.UTC(year, month - 1, day, hour, minute, 0);
  const initialOffset = getTimeZoneOffsetMs(new Date(naiveUtcMs), timezone);
  let utcMs = naiveUtcMs - initialOffset;
  const correctedOffset = getTimeZoneOffsetMs(new Date(utcMs), timezone);

  if (correctedOffset !== initialOffset) {
    utcMs = naiveUtcMs - correctedOffset;
  }

  return new Date(utcMs);
}

function formatSign(sign: PlanetPosition["sign"]) {
  return zodiacSignLabelMap[sign];
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    dateStyle: "medium",
  });
}

function formatTransitWindow(event: Pick<TransitEvent, "startsAtUtc" | "endsAtUtc">) {
  if (event.endsAtUtc) {
    return `${formatDate(event.startsAtUtc)} to ${formatDate(event.endsAtUtc)}`;
  }

  return `Active from ${formatDate(event.startsAtUtc)}`;
}

function formatNakshatra(planet: PlanetPosition) {
  if (!planet.nakshatra) {
    return null;
  }

  return `${nakshatraLabelMap[planet.nakshatra.name]} pada ${planet.nakshatra.pada}`;
}

function getLifeAreas(house: HouseNumber) {
  return houseLifeAreas[house] ?? [];
}

function findTransitEvent(
  transitSnapshot: TransitChartResponse,
  body: PlanetaryBody
) {
  return transitSnapshot.transits.find((entry) => entry.body === body) ?? null;
}

function buildUnavailableSynthesis(): DashaTransitSynthesis {
  return {
    overview:
      "Current timing context will appear after a stored chart and a fresh transit snapshot are both available.",
    activeAreas: [],
    supportiveWindows: [],
    cautionWindows: [],
    followUpThemes: [],
    timeSensitiveHighlights: [],
  };
}

export const fallbackCurrentCycleSummary: CurrentCycleSummary = {
  status: "unavailable",
  generatedAtUtc: new Date(0).toISOString(),
  unavailableReason:
    "A stored natal chart is required before current-cycle timing can be calculated.",
  dasha: null,
  transitSnapshot: {
    asOfUtc: null,
    window: null,
    planets: [],
    aspects: [],
  },
  synthesis: buildUnavailableSynthesis(),
  adminSupport: {
    currentFocusAreas: [],
    timingSensitiveCautions: [],
    followUpWindows: [],
  },
};

export function createCurrentTransitWindow(now = new Date()): TransitWindow {
  return {
    fromDateUtc: new Date(
      now.getTime() - 24 * 60 * 60 * 1000
    ).toISOString(),
    toDateUtc: new Date(
      now.getTime() + 21 * 24 * 60 * 60 * 1000
    ).toISOString(),
  };
}

export function calculateLiveCurrentDasha(
  chart: NatalChartResponse
): DashaPeriod | null {
  const moon = chart.planets.find((planet) => planet.body === "MOON");

  if (!moon) {
    return chart.currentDasha ?? null;
  }

  const utcDate = convertZonedBirthToUtcDate(
    chart.birthDetails.dateLocal,
    chart.birthDetails.timeLocal,
    chart.birthDetails.timezone
  );

  return calculateCurrentVimshottariDasha({
    moonLongitude: moon.longitude,
    birthDateUtc: utcDate,
  });
}

function getFocusAreaIntensity(planet: PlanetPosition): SignalStrength {
  if (
    planet.house === 1 ||
    planet.house === 10 ||
    planet.house === 8 ||
    ownSignsByBody[planet.body]?.includes(planet.sign)
  ) {
    return "HIGH";
  }

  if (planet.house === 5 || planet.house === 7 || planet.house === 9) {
    return "MEDIUM";
  }

  return "LOW";
}

function buildDashaFocusArea(
  chart: NatalChartResponse,
  dasha: DashaPeriod | null
): CurrentCycleFocusArea[] {
  if (!dasha) {
    return [];
  }

  const dashaPlanet = chart.planets.find((planet) => planet.body === dasha.lord);

  if (!dashaPlanet) {
    return [];
  }

  const nakshatraLine = formatNakshatra(dashaPlanet);

  return [
    {
      key: `dasha-${dasha.lord.toLowerCase()}`,
      title: `${formatBody(dasha.lord)} mahadasha is the primary timing backdrop.`,
      summary: `${formatBody(dasha.lord)} is placed in ${formatSign(dashaPlanet.sign)} in the ${ordinalHouseLabels[dashaPlanet.house]} house${nakshatraLine ? `, in ${nakshatraLine}` : ""}. This keeps ${getLifeAreas(dashaPlanet.house).join(", ")} active as the main timing emphasis without turning it into a guarantee.`,
      source: "DASHA",
      intensity: getFocusAreaIntensity(dashaPlanet),
      relatedBodies: [dasha.lord],
      houses: [dashaPlanet.house],
      lifeAreas: getLifeAreas(dashaPlanet.house),
      timeframeLabel: `Active until ${formatDate(dasha.endAtUtc)}`,
    },
  ];
}

function buildTransitPlanets(
  transitSnapshot: TransitChartResponse
): CurrentTransitPlanetSnapshot[] {
  return transitSnapshot.planets
    .map((planet) => {
      const event = findTransitEvent(transitSnapshot, planet.body);

      return {
        body: planet.body,
        sign: formatSign(planet.sign),
        degree: planet.degree,
        minute: planet.minute,
        longitude: planet.longitude,
        house: planet.house,
        retrograde: planet.retrograde,
        nakshatra: formatNakshatra(planet),
        intensity: event?.intensity ?? "LOW",
        summary:
          event?.summary ??
          `${formatBody(planet.body)} is currently moving through ${formatSign(planet.sign)} in the ${ordinalHouseLabels[planet.house]} house.`,
      };
    })
    .sort((left, right) => {
      const priorityDelta =
        transitPriorityOrder[right.body] - transitPriorityOrder[left.body];

      if (priorityDelta !== 0) {
        return priorityDelta;
      }

      return right.house - left.house;
    });
}

function buildTransitFocusAreas(
  transitSnapshot: TransitChartResponse
): CurrentCycleFocusArea[] {
  return buildTransitPlanets(transitSnapshot)
    .slice(0, 3)
    .map((planet) => ({
      key: `transit-focus-${planet.body.toLowerCase()}`,
      title: `${formatBody(planet.body)} is highlighting ${getLifeAreas(planet.house).join(", ")}.`,
      summary: `${planet.summary} This brings more attention to ${getLifeAreas(planet.house).join(", ")} for the current cycle, while still needing the natal chart and dasha context around it.`,
      source: "TRANSIT",
      intensity: planet.intensity,
      relatedBodies: [planet.body],
      houses: [planet.house],
      lifeAreas: getLifeAreas(planet.house),
      timeframeLabel:
        findTransitEvent(transitSnapshot, planet.body)?.startsAtUtc
          ? formatTransitWindow(
              findTransitEvent(transitSnapshot, planet.body) as TransitEvent
            )
          : "Current cycle",
    }));
}

function buildSupportiveWindows(
  transitSnapshot: TransitChartResponse
): CurrentCycleWindow[] {
  return buildTransitPlanets(transitSnapshot)
    .filter(
      (planet) =>
        supportiveTransitBodies.has(planet.body) &&
        supportiveTransitHouses.has(planet.house)
    )
    .slice(0, 3)
    .map((planet) => {
      const event = findTransitEvent(transitSnapshot, planet.body);

      return {
        key: `supportive-${planet.body.toLowerCase()}`,
        title: `${formatBody(planet.body)} offers a softer opening around ${getLifeAreas(planet.house).join(", ")}.`,
        summary: `${planet.summary} Use this as a supportive window for thoughtful progress rather than as a promise of results.`,
        intensity: planet.intensity,
        relatedBodies: [planet.body],
        houses: [planet.house],
        lifeAreas: getLifeAreas(planet.house),
        timeframeLabel: event ? formatTransitWindow(event) : "Current cycle",
      };
    });
}

function buildAspectCautionWindow(
  transitSnapshot: TransitChartResponse
): CurrentCycleWindow[] {
  const hardAspect = transitSnapshot.aspects.find(
    (aspect) =>
      (aspect.type === "SQUARE" || aspect.type === "OPPOSITION") &&
      typeof aspect.source === "string" &&
      ["SATURN", "MARS", "RAHU", "KETU"].includes(aspect.source)
  );

  if (!hardAspect) {
    return [];
  }

  return [
    {
      key: `aspect-caution-${hardAspect.source.toLowerCase()}-${hardAspect.target.toLowerCase()}`,
      title: `${formatBody(hardAspect.source as PlanetaryBody)} adds pressure to ${hardAspect.target.toLowerCase()} themes.`,
      summary: `${hardAspect.source} forms a ${hardAspect.type.toLowerCase()} to ${hardAspect.target} within ${hardAspect.orb.toFixed(2)} degrees. That makes steadier pacing and clearer boundaries more useful than overstatement.`,
      intensity: hardAspect.exact ? "HIGH" : "MEDIUM",
      relatedBodies: [hardAspect.source as PlanetaryBody],
      houses: [],
      lifeAreas: [],
      timeframeLabel: "Current transit contact",
    },
  ];
}

function buildCautionWindows(
  transitSnapshot: TransitChartResponse
): CurrentCycleWindow[] {
  const transitCautions = buildTransitPlanets(transitSnapshot)
    .filter(
      (planet) =>
        cautionTransitBodies.has(planet.body) &&
        (cautionTransitHouses.has(planet.house) || planet.intensity === "HIGH")
    )
    .slice(0, 3)
    .map((planet) => {
      const event = findTransitEvent(transitSnapshot, planet.body);

      return {
        key: `caution-${planet.body.toLowerCase()}`,
        title: `${formatBody(planet.body)} needs slower handling around ${getLifeAreas(planet.house).join(", ")}.`,
        summary: `${planet.summary} Treat this as a caution window that benefits from cleaner pacing, realistic expectations, and human judgement where needed.`,
        intensity: planet.intensity,
        relatedBodies: [planet.body],
        houses: [planet.house],
        lifeAreas: getLifeAreas(planet.house),
        timeframeLabel: event ? formatTransitWindow(event) : "Current cycle",
      };
    });

  return [...transitCautions, ...buildAspectCautionWindow(transitSnapshot)].slice(
    0,
    4
  );
}

function buildFollowUpThemes(
  chart: NatalChartResponse,
  dasha: DashaPeriod | null,
  supportiveWindows: CurrentCycleWindow[],
  cautionWindows: CurrentCycleWindow[]
): CurrentCycleFollowUpTheme[] {
  const themes: CurrentCycleFollowUpTheme[] = [];

  if (chart.remedySignals[0]) {
    themes.push({
      key: `remedy-${chart.remedySignals[0].key}`,
      title: chart.remedySignals[0].title,
      note: `${chart.remedySignals[0].rationale} Keep the response devotional, practical, and free from pressure.`,
      relatedBodies: chart.remedySignals[0].relatedBodies,
      consultationRecommended: chart.remedySignals[0].level === "HIGH",
    });
  }

  if (dasha) {
    themes.push({
      key: `dasha-follow-up-${dasha.lord.toLowerCase()}`,
      title: `Review how ${formatBody(dasha.lord)} themes are showing up in daily life.`,
      note: `The current dasha runs until ${formatDate(dasha.endAtUtc)}, so it is worth tracking how ${formatBody(dasha.lord).toLowerCase()} topics are actually unfolding before drawing stronger conclusions.`,
      relatedBodies: [dasha.lord],
      consultationRecommended: false,
    });
  }

  const topCaution = cautionWindows[0];

  if (topCaution) {
    themes.push({
      key: `caution-follow-up-${topCaution.key}`,
      title: "Use consultation for the more sensitive timing questions.",
      note: `${topCaution.title} If the question carries higher stakes, a manual consultation is safer than making the timing more absolute.`,
      relatedBodies: topCaution.relatedBodies,
      consultationRecommended: true,
    });
  } else if (supportiveWindows[0]) {
    themes.push({
      key: `support-follow-up-${supportiveWindows[0].key}`,
      title: "Use the current opening for steady, not dramatic, movement.",
      note: `${supportiveWindows[0].summary} Use the opening for measured progress instead of urgency.`,
      relatedBodies: supportiveWindows[0].relatedBodies,
      consultationRecommended: false,
    });
  }

  return themes.slice(0, 3);
}

function buildOverview(input: {
  dasha: DashaPeriod | null;
  activeAreas: CurrentCycleFocusArea[];
  supportiveWindows: CurrentCycleWindow[];
  cautionWindows: CurrentCycleWindow[];
}) {
  const leadingActiveArea = input.activeAreas[0];
  const supportiveWindow = input.supportiveWindows[0];
  const cautionWindow = input.cautionWindows[0];
  const dashaLine = input.dasha
    ? `${formatBody(input.dasha.lord)} mahadasha remains the main timing backdrop.`
    : "The natal chart is available, but the current dasha could not be refreshed.";
  const supportiveLine = supportiveWindow
    ? `A softer opening is visible through ${supportiveWindow.title.toLowerCase()}`
    : "No especially supportive transit window is standing out more than the broader chart pattern.";
  const cautionLine = cautionWindow
    ? `The main caution right now is ${cautionWindow.title.toLowerCase()}`
    : "No single transit is calling for a strong caution beyond general steady judgement.";

  return [
    dashaLine,
    leadingActiveArea?.summary ??
      "Current timing context is being read from the stored chart and fresh transits.",
    supportiveLine,
    cautionLine,
  ].join(" ");
}

export function buildDashaTransitSynthesis(input: {
  chart: NatalChartResponse;
  transitSnapshot: TransitChartResponse;
}): {
  dasha: DashaPeriod | null;
  transitPlanets: CurrentTransitPlanetSnapshot[];
  synthesis: DashaTransitSynthesis;
} {
  const dasha = calculateLiveCurrentDasha(input.chart);
  const dashaAreas = buildDashaFocusArea(input.chart, dasha);
  const transitAreas = buildTransitFocusAreas(input.transitSnapshot);
  const supportiveWindows = buildSupportiveWindows(input.transitSnapshot);
  const cautionWindows = buildCautionWindows(input.transitSnapshot);
  const followUpThemes = buildFollowUpThemes(
    input.chart,
    dasha,
    supportiveWindows,
    cautionWindows
  );
  const activeAreas = [...dashaAreas, ...transitAreas].slice(0, 4);

  return {
    dasha,
    transitPlanets: buildTransitPlanets(input.transitSnapshot),
    synthesis: {
      overview: buildOverview({
        dasha,
        activeAreas,
        supportiveWindows,
        cautionWindows,
      }),
      activeAreas,
      supportiveWindows,
      cautionWindows,
      followUpThemes,
      timeSensitiveHighlights: [
        activeAreas[0]?.title,
        supportiveWindows[0]?.title,
        cautionWindows[0]?.title,
      ].filter((line): line is string => Boolean(line)),
    },
  };
}

export function buildCurrentCycleSummary(input: {
  chart: NatalChartResponse;
  transitSnapshot: TransitChartResponse;
}): CurrentCycleSummary {
  const generatedAtUtc = new Date().toISOString();
  const { dasha, transitPlanets, synthesis } = buildDashaTransitSynthesis(input);

  return {
    status: "ready",
    generatedAtUtc,
    unavailableReason: null,
    dasha,
    transitSnapshot: {
      asOfUtc: input.transitSnapshot.asOfUtc,
      window: input.transitSnapshot.window,
      planets: transitPlanets,
      aspects: input.transitSnapshot.aspects.slice(0, 5).map((aspect) => ({
        source: aspect.source,
        type: aspect.type,
        target: aspect.target,
        orb: aspect.orb,
        exact: aspect.exact,
      })),
    },
    synthesis,
    adminSupport: {
      currentFocusAreas: synthesis.activeAreas,
      timingSensitiveCautions: synthesis.cautionWindows,
      followUpWindows: synthesis.supportiveWindows,
    },
  };
}
