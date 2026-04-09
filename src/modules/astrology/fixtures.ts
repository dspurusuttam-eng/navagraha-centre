import {
  houseNumbers,
  signRulers,
  zodiacSigns,
} from "@/modules/astrology/constants";
import type {
  AstrologicalAspect,
  DivisionalChart,
  DivisionalChartCode,
  HousePlacement,
  HouseNumber,
  NatalChartResponse,
  PlanetPosition,
  RemedySignal,
  TransitChartResponse,
  TransitEvent,
  ZodiacSign,
} from "@/modules/astrology/types";

type FixturePlanetPosition = Omit<
  PlanetPosition,
  "longitude" | "speed"
> &
  Partial<
    Pick<PlanetPosition, "longitude" | "speed" | "latitude" | "nakshatra">
  >;

type FixtureDivisionalChart = Omit<DivisionalChart, "planets"> & {
  planets: FixturePlanetPosition[];
};

type FixtureNatalPayload = Omit<
  NatalChartResponse,
  "kind" | "metadata" | "birthDetails" | "houseSystem" | "planets"
> & {
  planets: FixturePlanetPosition[];
};

type FixtureBundle = {
  key: string;
  generatedAtUtc: string;
  natal: FixtureNatalPayload;
  transits: Omit<
    TransitChartResponse,
    "kind" | "metadata" | "birthDetails" | "houseSystem" | "window"
  >;
  divisionalCharts: Record<DivisionalChartCode, FixtureDivisionalChart>;
};

function createWholeSignHouses(ascendantSign: ZodiacSign): HousePlacement[] {
  const startIndex = zodiacSigns.indexOf(ascendantSign);

  return houseNumbers.map((house, index) => {
    const sign = zodiacSigns[(startIndex + index) % zodiacSigns.length];

    return {
      house: house as HouseNumber,
      sign,
      ruler: signRulers[sign],
    };
  });
}

function createDivisionalChart(
  code: DivisionalChartCode,
  title: string,
  focus: string,
  ascendantSign: ZodiacSign,
  planets: FixturePlanetPosition[],
  highlights: string[]
): FixtureDivisionalChart {
  return {
    code,
    title,
    focus,
    ascendantSign,
    planets,
    houses: createWholeSignHouses(ascendantSign),
    highlights,
  };
}

const oceanicPlanets: FixturePlanetPosition[] = [
  {
    body: "SUN",
    sign: "TAURUS",
    degree: 17,
    minute: 12,
    house: 8,
    retrograde: false,
  },
  {
    body: "MOON",
    sign: "CANCER",
    degree: 4,
    minute: 18,
    house: 10,
    retrograde: false,
  },
  {
    body: "MARS",
    sign: "PISCES",
    degree: 22,
    minute: 9,
    house: 6,
    retrograde: false,
  },
  {
    body: "MERCURY",
    sign: "GEMINI",
    degree: 11,
    minute: 42,
    house: 9,
    retrograde: false,
  },
  {
    body: "JUPITER",
    sign: "SAGITTARIUS",
    degree: 6,
    minute: 25,
    house: 3,
    retrograde: false,
  },
  {
    body: "VENUS",
    sign: "ARIES",
    degree: 28,
    minute: 3,
    house: 7,
    retrograde: false,
  },
  {
    body: "SATURN",
    sign: "AQUARIUS",
    degree: 13,
    minute: 14,
    house: 5,
    retrograde: false,
  },
  {
    body: "RAHU",
    sign: "VIRGO",
    degree: 9,
    minute: 51,
    house: 12,
    retrograde: true,
  },
  {
    body: "KETU",
    sign: "PISCES",
    degree: 9,
    minute: 51,
    house: 6,
    retrograde: true,
  },
];

const oceanicAspects: AstrologicalAspect[] = [
  {
    type: "TRINE",
    source: "VENUS",
    target: "MOON",
    orb: 1.8,
    applying: true,
    exact: false,
  },
  {
    type: "SQUARE",
    source: "SATURN",
    target: "SUN",
    orb: 3.4,
    applying: false,
    exact: false,
  },
  {
    type: "OPPOSITION",
    source: "JUPITER",
    target: "MERCURY",
    orb: 2.1,
    applying: true,
    exact: false,
  },
];

const oceanicRemedySignals: RemedySignal[] = [
  {
    key: "discipline-saturn-rhythm",
    title: "Strengthen steady weekly rhythm",
    category: "DISCIPLINE",
    level: "MEDIUM",
    rationale:
      "Saturn prominence in the fifth-house axis suggests long-term gains through consistency rather than urgency.",
    relatedBodies: ["SATURN"],
  },
  {
    key: "venus-moon-devotional-space",
    title: "Protect beauty, rest, and devotional space",
    category: "DEVOTIONAL",
    level: "LOW",
    rationale:
      "Venus and Moon harmony supports softer practices that restore emotional clarity and receptivity.",
    relatedBodies: ["VENUS", "MOON"],
  },
  {
    key: "rahu-boundary-review",
    title: "Review overstimulation and boundaries",
    category: "LIFESTYLE",
    level: "MEDIUM",
    rationale:
      "Rahu emphasis in the twelfth-house zone signals benefit from reducing scattered inputs and preserving calm.",
    relatedBodies: ["RAHU"],
  },
];

const oceanicTransitEvents: TransitEvent[] = [
  {
    id: "transit-jupiter-cancer",
    body: "JUPITER",
    sign: "CANCER",
    house: 10,
    startsAtUtc: "2026-05-14T00:00:00.000Z",
    summary:
      "Jupiter highlights visibility, reputation, and guidance from respected mentors.",
    intensity: "HIGH",
  },
  {
    id: "transit-saturn-pisces",
    body: "SATURN",
    sign: "PISCES",
    house: 6,
    startsAtUtc: "2026-04-20T00:00:00.000Z",
    summary:
      "Saturn asks for patient process improvements and disciplined care around daily obligations.",
    intensity: "MEDIUM",
  },
  {
    id: "transit-venus-taurus",
    body: "VENUS",
    sign: "TAURUS",
    house: 8,
    startsAtUtc: "2026-04-27T00:00:00.000Z",
    endsAtUtc: "2026-05-22T00:00:00.000Z",
    summary:
      "Venus supports gentler financial review, trust-building, and calmer shared conversations.",
    intensity: "LOW",
  },
];

const mercurialPlanets: FixturePlanetPosition[] = [
  {
    body: "SUN",
    sign: "CAPRICORN",
    degree: 9,
    minute: 44,
    house: 4,
    retrograde: false,
  },
  {
    body: "MOON",
    sign: "VIRGO",
    degree: 19,
    minute: 8,
    house: 12,
    retrograde: false,
  },
  {
    body: "MARS",
    sign: "SCORPIO",
    degree: 6,
    minute: 57,
    house: 2,
    retrograde: false,
  },
  {
    body: "MERCURY",
    sign: "AQUARIUS",
    degree: 14,
    minute: 31,
    house: 5,
    retrograde: false,
  },
  {
    body: "JUPITER",
    sign: "GEMINI",
    degree: 23,
    minute: 40,
    house: 9,
    retrograde: true,
  },
  {
    body: "VENUS",
    sign: "PISCES",
    degree: 2,
    minute: 11,
    house: 6,
    retrograde: false,
  },
  {
    body: "SATURN",
    sign: "TAURUS",
    degree: 27,
    minute: 4,
    house: 8,
    retrograde: false,
  },
  {
    body: "RAHU",
    sign: "ARIES",
    degree: 15,
    minute: 22,
    house: 7,
    retrograde: true,
  },
  {
    body: "KETU",
    sign: "LIBRA",
    degree: 15,
    minute: 22,
    house: 1,
    retrograde: true,
  },
];

const mercurialAspects: AstrologicalAspect[] = [
  {
    type: "TRINE",
    source: "MERCURY",
    target: "JUPITER",
    orb: 1.3,
    applying: false,
    exact: false,
  },
  {
    type: "OPPOSITION",
    source: "RAHU",
    target: "KETU",
    orb: 0,
    applying: false,
    exact: true,
  },
  {
    type: "SEXTILE",
    source: "VENUS",
    target: "SUN",
    orb: 2.7,
    applying: true,
    exact: false,
  },
];

const mercurialRemedySignals: RemedySignal[] = [
  {
    key: "mercury-jupiter-study-window",
    title: "Use structured study windows",
    category: "DISCIPLINE",
    level: "HIGH",
    rationale:
      "Mercury and Jupiter links support learning and planning when attention is intentionally bounded.",
    relatedBodies: ["MERCURY", "JUPITER"],
  },
  {
    key: "ketu-identity-grounding",
    title: "Ground identity before major commitments",
    category: "TIMING",
    level: "MEDIUM",
    rationale:
      "Ketu near the ascendant can feel diffused, so decisions benefit from pacing and reflective pauses.",
    relatedBodies: ["KETU"],
  },
  {
    key: "venus-care-routine",
    title: "Keep a graceful care routine",
    category: "LIFESTYLE",
    level: "LOW",
    rationale:
      "Venus in Pisces favors restorative rituals, beauty, and supportive habits over forceful correction.",
    relatedBodies: ["VENUS"],
  },
];

const mercurialTransitEvents: TransitEvent[] = [
  {
    id: "transit-mercury-gemini",
    body: "MERCURY",
    sign: "GEMINI",
    house: 9,
    startsAtUtc: "2026-04-18T00:00:00.000Z",
    endsAtUtc: "2026-05-06T00:00:00.000Z",
    summary:
      "Mercury favors study, guidance, and precise communication with teachers or advisors.",
    intensity: "HIGH",
  },
  {
    id: "transit-mars-leo",
    body: "MARS",
    sign: "LEO",
    house: 11,
    startsAtUtc: "2026-05-03T00:00:00.000Z",
    summary:
      "Mars energizes collaborative circles, requiring tact around timing and leadership tone.",
    intensity: "MEDIUM",
  },
  {
    id: "transit-moon-libra",
    body: "MOON",
    sign: "LIBRA",
    house: 1,
    startsAtUtc: "2026-04-08T00:00:00.000Z",
    endsAtUtc: "2026-04-10T00:00:00.000Z",
    summary:
      "The Moon brings temporary visibility and stronger emotional sensitivity to how others respond.",
    intensity: "LOW",
  },
];

export const mockAstrologyFixtures = [
  {
    key: "oceanic-balance",
    generatedAtUtc: "2026-04-04T00:00:00.000Z",
    natal: {
      ascendantSign: "LIBRA",
      planets: oceanicPlanets,
      houses: createWholeSignHouses("LIBRA"),
      aspects: oceanicAspects,
      divisionalCharts: [],
      remedySignals: oceanicRemedySignals,
      summary: {
        dominantBodies: ["VENUS", "MOON", "SATURN"],
        narrative:
          "This fixture emphasizes relational grace, emotional refinement, and long-horizon discipline.",
      },
    },
    transits: {
      transits: oceanicTransitEvents,
      aspects: oceanicAspects,
      remedySignals: oceanicRemedySignals,
    },
    divisionalCharts: {
      D1: createDivisionalChart(
        "D1",
        "Rasi Chart",
        "Overall life structure and core expression.",
        "LIBRA",
        oceanicPlanets,
        [
          "Relational intelligence remains a central organizing force.",
          "Steady discipline supports creative confidence.",
        ]
      ),
      D7: createDivisionalChart(
        "D7",
        "Saptamsa",
        "Legacy, continuity, and stewardship themes.",
        "CANCER",
        oceanicPlanets.slice(0, 5),
        [
          "Emotional steadiness deepens care-based responsibilities.",
          "Gentle routines support long-range continuity.",
        ]
      ),
      D9: createDivisionalChart(
        "D9",
        "Navamsa",
        "Inner maturity, devotion, and deeper alignment.",
        "TAURUS",
        oceanicPlanets.slice(1, 7),
        [
          "Values ripen through calm persistence.",
          "Devotional structure refines the relational field.",
        ]
      ),
      D10: createDivisionalChart(
        "D10",
        "Dasamsa",
        "Work, visibility, and professional responsibility.",
        "CAPRICORN",
        oceanicPlanets.slice(0, 6),
        [
          "Visible work grows through patient authority.",
          "Public trust strengthens when pace stays measured.",
        ]
      ),
      D12: createDivisionalChart(
        "D12",
        "Dvadasamsa",
        "Ancestral patterns and inherited tone.",
        "PISCES",
        oceanicPlanets.slice(2),
        [
          "Inherited sensitivity benefits from grounded boundaries.",
          "Restorative rituals support intergenerational steadiness.",
        ]
      ),
    },
  },
  {
    key: "mercurial-compass",
    generatedAtUtc: "2026-04-04T00:00:00.000Z",
    natal: {
      ascendantSign: "LIBRA",
      planets: mercurialPlanets,
      houses: createWholeSignHouses("LIBRA"),
      aspects: mercurialAspects,
      divisionalCharts: [],
      remedySignals: mercurialRemedySignals,
      summary: {
        dominantBodies: ["MERCURY", "JUPITER", "VENUS"],
        narrative:
          "This fixture emphasizes study, discernment, and graceful pacing around identity and commitments.",
      },
    },
    transits: {
      transits: mercurialTransitEvents,
      aspects: mercurialAspects,
      remedySignals: mercurialRemedySignals,
    },
    divisionalCharts: {
      D1: createDivisionalChart(
        "D1",
        "Rasi Chart",
        "Overall life structure and baseline themes.",
        "LIBRA",
        mercurialPlanets,
        [
          "Discernment and diplomacy are central stabilizers.",
          "Growth comes through thoughtful sequencing rather than haste.",
        ]
      ),
      D7: createDivisionalChart(
        "D7",
        "Saptamsa",
        "Legacy, contribution, and continuity.",
        "AQUARIUS",
        mercurialPlanets.slice(0, 5),
        [
          "Contribution deepens when ideals are paired with patient craft.",
          "Steady mentorship strengthens continuity.",
        ]
      ),
      D9: createDivisionalChart(
        "D9",
        "Navamsa",
        "Deeper alignment, values, and inner ripening.",
        "SAGITTARIUS",
        mercurialPlanets.slice(1, 7),
        [
          "Study and meaning-making refine inner direction.",
          "Grace grows when attention stays uncluttered.",
        ]
      ),
      D10: createDivisionalChart(
        "D10",
        "Dasamsa",
        "Work, role, and professional contribution.",
        "GEMINI",
        mercurialPlanets.slice(0, 6),
        [
          "Professional growth favors clarity, adaptability, and restraint.",
          "Visible work gains force when communication stays deliberate.",
        ]
      ),
      D12: createDivisionalChart(
        "D12",
        "Dvadasamsa",
        "Inherited patterns and ancestral tone.",
        "VIRGO",
        mercurialPlanets.slice(2),
        [
          "Inherited habits become strengths through refinement.",
          "Orderly care reduces diffuse pressure.",
        ]
      ),
    },
  },
] satisfies readonly FixtureBundle[];
