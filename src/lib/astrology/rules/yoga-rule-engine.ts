import {
  debilitationSignsByBody,
  exaltationSignsByBody,
  ownSignsByBody,
  planetLabelMap,
  planetSortOrder,
  signRulerMap,
  zodiacSignLabelMap,
} from "@/lib/astrology/constants";
import type { UnifiedSiderealChart } from "@/modules/astrology/chart-contract-types";
import type { HouseNumber, PlanetaryBody, ZodiacSign } from "@/modules/astrology/types";

type SignalConfidence = "high" | "medium" | "low";
type DignityType =
  | "OWN_SIGN"
  | "EXALTED"
  | "DEBILITATED"
  | "MOOLATRIKONA_CANDIDATE"
  | "FRIEND_SIGN"
  | "ENEMY_SIGN"
  | "NEUTRAL_SIGN"
  | "RETROGRADE"
  | "COMBUST";

type ConjunctionType = "SAME_SIGN" | "CLOSE_DEGREE";
type HouseLordClassification =
  | "KENDRA"
  | "TRIKONA"
  | "DUSTHANA"
  | "UPACHAYA"
  | "MARAKA"
  | "NEUTRAL";
type HouseLordCategory = "KENDRA" | "TRIKONA" | "DUSTHANA" | "UPACHAYA" | "MARAKA";
type LordNature = "BENEFIC" | "MALEFIC" | "NEUTRAL";
type YogaCategory =
  | "RAJA_YOGA_CANDIDATE"
  | "DHANA_YOGA_CANDIDATE"
  | "GAJA_KESARI_CANDIDATE"
  | "NEECHA_BHANGA_CANDIDATE"
  | "VIPARITA_RAJA_CANDIDATE"
  | "BUDHA_ADITYA_CANDIDATE"
  | "CHANDRA_MANGALA_CANDIDATE";

export type DignitySignal = {
  planet: PlanetaryBody;
  dignity_type: DignityType;
  sign: string;
  house: number;
  confidence: SignalConfidence;
  notes: string | null;
};

export type ConjunctionSignal = {
  planets: [PlanetaryBody, PlanetaryBody];
  sign: string;
  house: number;
  type: ConjunctionType;
  orb_degrees: number;
  confidence: SignalConfidence;
  notes: string | null;
};

export type HouseLordRuleSignal = {
  house: number;
  lord: PlanetaryBody;
  placed_in_house: number;
  placed_in_sign: string;
  classification: HouseLordClassification;
  categories: HouseLordCategory[];
  lord_nature: LordNature;
  confidence: SignalConfidence;
};

export type YogaSignal = {
  yoga_name: string;
  category: YogaCategory;
  planets_involved: PlanetaryBody[];
  supporting_rules: string[];
  confidence: SignalConfidence;
  notes: string;
};

export type YogaRuleOutput = {
  dignity_signals: DignitySignal[];
  conjunctions: ConjunctionSignal[];
  house_lord_rules: HouseLordRuleSignal[];
  yoga_signals: YogaSignal[];
  structural_summary: {
    key_strengths: string[];
    key_pressures: string[];
    key_relationships: string[];
  };
};

type YogaRuleEngineFailureCode =
  | "INVALID_CHART_CONTEXT"
  | "UNVERIFIED_CHART_CONTEXT"
  | "INVALID_HOUSE_SET"
  | "INVALID_PLANETARY_SET"
  | "INVALID_SIGN_NAME"
  | "INVALID_PLANET_NAME"
  | "HOUSE_LORD_UNRESOLVED";

export type YogaRuleEngineFailure = {
  success: false;
  issue: {
    code: YogaRuleEngineFailureCode;
    message: string;
  };
  details?: unknown;
};

export type YogaRuleEngineSuccess = {
  success: true;
  data: YogaRuleOutput;
};

export type YogaRuleEngineResult = YogaRuleEngineFailure | YogaRuleEngineSuccess;

type NormalizedHouse = {
  house: HouseNumber;
  signCode: ZodiacSign;
  signLabel: string;
};

type NormalizedPlanet = {
  body: PlanetaryBody;
  signCode: ZodiacSign;
  signLabel: string;
  house: HouseNumber;
  longitude: number;
  degreeInSign: number;
  isRetrograde: boolean;
  isCombust: boolean;
};

const KENDRA_HOUSES = new Set<HouseNumber>([1, 4, 7, 10]);
const TRIKONA_HOUSES = new Set<HouseNumber>([1, 5, 9]);
const DUSTHANA_HOUSES = new Set<HouseNumber>([6, 8, 12]);
const UPACHAYA_HOUSES = new Set<HouseNumber>([3, 6, 10, 11]);
const MARAKA_HOUSES = new Set<HouseNumber>([2, 7]);

const PLANET_LABEL_TO_BODY = new Map<string, PlanetaryBody>(
  Object.entries(planetLabelMap).map(([body, label]) => [
    label.toLowerCase(),
    body as PlanetaryBody,
  ])
);

const SIGN_LABEL_TO_CODE = new Map<string, ZodiacSign>(
  Object.entries(zodiacSignLabelMap).map(([signCode, signLabel]) => [
    signLabel.toLowerCase(),
    signCode as ZodiacSign,
  ])
);

const NATURAL_RELATIONSHIPS: Record<
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
    neutrals: ["MERCURY", "RAHU", "KETU"],
  },
  MOON: {
    friends: ["SUN", "MERCURY"],
    enemies: [],
    neutrals: ["MARS", "JUPITER", "VENUS", "SATURN", "RAHU", "KETU"],
  },
  MARS: {
    friends: ["SUN", "MOON", "JUPITER"],
    enemies: ["MERCURY"],
    neutrals: ["VENUS", "SATURN", "RAHU", "KETU"],
  },
  MERCURY: {
    friends: ["SUN", "VENUS"],
    enemies: ["MOON"],
    neutrals: ["MARS", "JUPITER", "SATURN", "RAHU", "KETU"],
  },
  JUPITER: {
    friends: ["SUN", "MOON", "MARS"],
    enemies: ["MERCURY", "VENUS"],
    neutrals: ["SATURN", "RAHU", "KETU"],
  },
  VENUS: {
    friends: ["MERCURY", "SATURN"],
    enemies: ["SUN", "MOON"],
    neutrals: ["MARS", "JUPITER", "RAHU", "KETU"],
  },
  SATURN: {
    friends: ["MERCURY", "VENUS"],
    enemies: ["SUN", "MOON"],
    neutrals: ["MARS", "JUPITER", "RAHU", "KETU"],
  },
  RAHU: {
    friends: ["VENUS", "SATURN", "MERCURY"],
    enemies: ["SUN", "MOON"],
    neutrals: ["MARS", "JUPITER", "KETU"],
  },
  KETU: {
    friends: ["MARS", "JUPITER", "SATURN"],
    enemies: ["SUN", "MOON"],
    neutrals: ["MERCURY", "VENUS", "RAHU"],
  },
};

const MOOLATRIKONA_SIGN_CANDIDATES: Partial<Record<PlanetaryBody, ZodiacSign>> = {
  SUN: "LEO",
  MOON: "TAURUS",
  MARS: "ARIES",
  MERCURY: "VIRGO",
  JUPITER: "SAGITTARIUS",
  VENUS: "LIBRA",
  SATURN: "AQUARIUS",
};

const BODY_NATURE: Record<PlanetaryBody, LordNature> = {
  SUN: "MALEFIC",
  MOON: "BENEFIC",
  MARS: "MALEFIC",
  MERCURY: "NEUTRAL",
  JUPITER: "BENEFIC",
  VENUS: "BENEFIC",
  SATURN: "MALEFIC",
  RAHU: "MALEFIC",
  KETU: "MALEFIC",
};

const CLOSE_CONJUNCTION_ORB_DEGREES = 8;

function fail(
  code: YogaRuleEngineFailureCode,
  message: string,
  details?: unknown
): YogaRuleEngineFailure {
  return {
    success: false,
    issue: {
      code,
      message,
    },
    details,
  };
}

function roundTo(value: number, digits = 6) {
  return Number(value.toFixed(digits));
}

function isHouseNumber(value: number): value is HouseNumber {
  return Number.isInteger(value) && value >= 1 && value <= 12;
}

function getPlanetPriority(body: PlanetaryBody) {
  return planetSortOrder.get(body) ?? Number.MAX_SAFE_INTEGER;
}

function normalizeLongitude(value: number) {
  const normalized = value % 360;

  return normalized < 0 ? normalized + 360 : normalized;
}

function getAngularSeparation(leftLongitude: number, rightLongitude: number) {
  const separation = Math.abs(
    normalizeLongitude(leftLongitude) - normalizeLongitude(rightLongitude)
  );

  return separation > 180 ? 360 - separation : separation;
}

function getHouseDistance(fromHouse: number, toHouse: number) {
  return ((toHouse - fromHouse + 12) % 12) + 1;
}

function isKendraHouse(house: number) {
  return KENDRA_HOUSES.has(house as HouseNumber);
}

function parsePlanetaryBody(value: string): PlanetaryBody | null {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  const byLabel = PLANET_LABEL_TO_BODY.get(normalized.toLowerCase());

  if (byLabel) {
    return byLabel;
  }

  const upper = normalized.toUpperCase() as PlanetaryBody;

  return Object.prototype.hasOwnProperty.call(planetLabelMap, upper)
    ? upper
    : null;
}

function parseSignCode(value: string): ZodiacSign | null {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  const byLabel = SIGN_LABEL_TO_CODE.get(normalized.toLowerCase());

  if (byLabel) {
    return byLabel;
  }

  const upper = normalized.toUpperCase() as ZodiacSign;

  return Object.prototype.hasOwnProperty.call(zodiacSignLabelMap, upper)
    ? upper
    : null;
}

function uniqueBodies(values: PlanetaryBody[]) {
  return Array.from(new Set(values)).sort(
    (left, right) => getPlanetPriority(left) - getPlanetPriority(right)
  );
}

function normalizeHouses(
  chart: UnifiedSiderealChart
):
  | {
      success: true;
      data: NormalizedHouse[];
    }
  | YogaRuleEngineFailure {
  if (!Array.isArray(chart.houses) || chart.houses.length !== 12) {
    return fail(
      "INVALID_HOUSE_SET",
      "Chart houses must contain a complete 12-house whole-sign set."
    );
  }

  const normalized: NormalizedHouse[] = [];
  const seenHouses = new Set<number>();
  const seenSigns = new Set<string>();

  for (const house of chart.houses) {
    if (!isHouseNumber(house.house)) {
      return fail(
        "INVALID_HOUSE_SET",
        `House value ${String(house.house)} is invalid.`,
        house
      );
    }

    const signCode = parseSignCode(house.sign);

    if (!signCode) {
      return fail(
        "INVALID_SIGN_NAME",
        `House sign ${house.sign} is invalid for yoga rule detection.`,
        house
      );
    }

    normalized.push({
      house: house.house,
      signCode,
      signLabel: zodiacSignLabelMap[signCode],
    });
    seenHouses.add(house.house);
    seenSigns.add(signCode);
  }

  if (seenHouses.size !== 12 || seenSigns.size !== 12) {
    return fail(
      "INVALID_HOUSE_SET",
      "House mapping must provide unique 1-12 houses and unique signs."
    );
  }

  normalized.sort((left, right) => left.house - right.house);

  return {
    success: true,
    data: normalized,
  };
}

function normalizePlanets(
  chart: UnifiedSiderealChart
):
  | {
      success: true;
      data: NormalizedPlanet[];
    }
  | YogaRuleEngineFailure {
  if (!Array.isArray(chart.planets) || chart.planets.length < 7) {
    return fail(
      "INVALID_PLANETARY_SET",
      "Chart planets are missing or incomplete for yoga rule detection."
    );
  }

  const normalized: NormalizedPlanet[] = [];

  for (const planet of chart.planets) {
    const body = parsePlanetaryBody(planet.name);

    if (!body) {
      return fail(
        "INVALID_PLANET_NAME",
        `Planet name ${planet.name} is invalid for yoga rule detection.`,
        planet
      );
    }

    const signCode = parseSignCode(planet.sign);

    if (!signCode) {
      return fail(
        "INVALID_SIGN_NAME",
        `Planet sign ${planet.sign} is invalid for yoga rule detection.`,
        planet
      );
    }

    if (!isHouseNumber(planet.house)) {
      return fail(
        "INVALID_PLANETARY_SET",
        `Planet ${planet.name} has invalid house ${String(planet.house)}.`,
        planet
      );
    }

    normalized.push({
      body,
      signCode,
      signLabel: zodiacSignLabelMap[signCode],
      house: planet.house,
      longitude: normalizeLongitude(planet.longitude),
      degreeInSign: planet.degree_in_sign,
      isRetrograde: planet.is_retrograde,
      isCombust: planet.is_combust,
    });
  }

  const requiredBodies: PlanetaryBody[] = [
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
  const presentBodies = new Set(normalized.map((planet) => planet.body));
  const missingBodies = requiredBodies.filter((body) => !presentBodies.has(body));

  if (missingBodies.length > 0) {
    return fail(
      "INVALID_PLANETARY_SET",
      `Required planets missing from chart for yoga rule detection: ${missingBodies.join(", ")}.`
    );
  }

  normalized.sort(
    (left, right) => getPlanetPriority(left.body) - getPlanetPriority(right.body)
  );

  return {
    success: true,
    data: normalized,
  };
}

function getNaturalRelationship(left: PlanetaryBody, right: PlanetaryBody) {
  const entry = NATURAL_RELATIONSHIPS[left];

  if (entry.friends.includes(right)) {
    return "FRIEND";
  }

  if (entry.enemies.includes(right)) {
    return "ENEMY";
  }

  return "NEUTRAL";
}

function detectDignitySignals(planets: NormalizedPlanet[]) {
  const signals: DignitySignal[] = [];

  for (const planet of planets) {
    const ownSigns = ownSignsByBody[planet.body] ?? [];
    const exaltedSign = exaltationSignsByBody[planet.body];
    const debilitatedSign = debilitationSignsByBody[planet.body];
    const signLord = signRulerMap[planet.signCode];
    const relationship = getNaturalRelationship(planet.body, signLord);
    const moolatrikonaCandidate = MOOLATRIKONA_SIGN_CANDIDATES[planet.body];

    if (ownSigns.includes(planet.signCode)) {
      signals.push({
        planet: planet.body,
        dignity_type: "OWN_SIGN",
        sign: planet.signLabel,
        house: planet.house,
        confidence: "high",
        notes: "Planet occupies one of its own signs.",
      });
    }

    if (exaltedSign === planet.signCode) {
      signals.push({
        planet: planet.body,
        dignity_type: "EXALTED",
        sign: planet.signLabel,
        house: planet.house,
        confidence: "high",
        notes: "Planet occupies its exaltation sign.",
      });
    }

    if (debilitatedSign === planet.signCode) {
      signals.push({
        planet: planet.body,
        dignity_type: "DEBILITATED",
        sign: planet.signLabel,
        house: planet.house,
        confidence: "high",
        notes: "Planet occupies its debilitation sign.",
      });
    }

    if (moolatrikonaCandidate && moolatrikonaCandidate === planet.signCode) {
      signals.push({
        planet: planet.body,
        dignity_type: "MOOLATRIKONA_CANDIDATE",
        sign: planet.signLabel,
        house: planet.house,
        confidence: "medium",
        notes:
          "Sign-level moolatrikona candidate detected. Degree-specific refinement is not applied in this pass.",
      });
    }

    if (!ownSigns.includes(planet.signCode)) {
      signals.push({
        planet: planet.body,
        dignity_type:
          relationship === "FRIEND"
            ? "FRIEND_SIGN"
            : relationship === "ENEMY"
              ? "ENEMY_SIGN"
              : "NEUTRAL_SIGN",
        sign: planet.signLabel,
        house: planet.house,
        confidence: relationship === "NEUTRAL" ? "low" : "medium",
        notes: `Natural relationship to sign lord ${signLord} is ${relationship.toLowerCase()}.`,
      });
    }

    if (planet.isRetrograde) {
      signals.push({
        planet: planet.body,
        dignity_type: "RETROGRADE",
        sign: planet.signLabel,
        house: planet.house,
        confidence: "high",
        notes: "Retrograde state sourced directly from natal chart payload.",
      });
    }

    if (planet.isCombust) {
      signals.push({
        planet: planet.body,
        dignity_type: "COMBUST",
        sign: planet.signLabel,
        house: planet.house,
        confidence: "medium",
        notes: "Combustion state sourced directly from natal chart payload.",
      });
    }
  }

  return signals;
}

function detectConjunctionSignals(planets: NormalizedPlanet[]) {
  const conjunctions: ConjunctionSignal[] = [];

  for (let leftIndex = 0; leftIndex < planets.length; leftIndex += 1) {
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < planets.length;
      rightIndex += 1
    ) {
      const left = planets[leftIndex];
      const right = planets[rightIndex];

      if (left.signCode !== right.signCode || left.house !== right.house) {
        continue;
      }

      const orb = roundTo(getAngularSeparation(left.longitude, right.longitude), 4);
      const isClose = orb <= CLOSE_CONJUNCTION_ORB_DEGREES;
      const orderedBodies = [left.body, right.body].sort(
        (first, second) =>
          getPlanetPriority(first) - getPlanetPriority(second)
      ) as [PlanetaryBody, PlanetaryBody];

      conjunctions.push({
        planets: orderedBodies,
        sign: left.signLabel,
        house: left.house,
        type: isClose ? "CLOSE_DEGREE" : "SAME_SIGN",
        orb_degrees: orb,
        confidence: isClose ? "high" : "medium",
        notes: isClose
          ? `Close conjunction candidate with ${orb.toFixed(2)}° orb.`
          : "Same-sign co-presence conjunction candidate.",
      });
    }
  }

  return conjunctions.sort((left, right) => {
    if (left.house !== right.house) {
      return left.house - right.house;
    }

    if (left.orb_degrees !== right.orb_degrees) {
      return left.orb_degrees - right.orb_degrees;
    }

    const leftA = getPlanetPriority(left.planets[0]);
    const rightA = getPlanetPriority(right.planets[0]);

    return leftA - rightA;
  });
}

function classifyHouseCategories(house: HouseNumber): HouseLordCategory[] {
  const categories: HouseLordCategory[] = [];

  if (KENDRA_HOUSES.has(house)) {
    categories.push("KENDRA");
  }

  if (TRIKONA_HOUSES.has(house)) {
    categories.push("TRIKONA");
  }

  if (DUSTHANA_HOUSES.has(house)) {
    categories.push("DUSTHANA");
  }

  if (UPACHAYA_HOUSES.has(house)) {
    categories.push("UPACHAYA");
  }

  if (MARAKA_HOUSES.has(house)) {
    categories.push("MARAKA");
  }

  return categories;
}

function getPrimaryClassification(categories: HouseLordCategory[]) {
  if (categories.includes("DUSTHANA")) {
    return "DUSTHANA";
  }

  if (categories.includes("KENDRA")) {
    return "KENDRA";
  }

  if (categories.includes("TRIKONA")) {
    return "TRIKONA";
  }

  if (categories.includes("UPACHAYA")) {
    return "UPACHAYA";
  }

  if (categories.includes("MARAKA")) {
    return "MARAKA";
  }

  return "NEUTRAL";
}

function detectHouseLordRules(input: {
  houses: NormalizedHouse[];
  planetsByBody: Map<PlanetaryBody, NormalizedPlanet>;
}): HouseLordRuleSignal[] | YogaRuleEngineFailure {
  const rules: HouseLordRuleSignal[] = [];

  for (const house of input.houses) {
    const lord = signRulerMap[house.signCode];
    const placement = input.planetsByBody.get(lord);

    if (!placement) {
      return fail(
        "HOUSE_LORD_UNRESOLVED",
        `Could not resolve placement for house lord ${lord} of house ${house.house}.`
      );
    }

    const categories = classifyHouseCategories(placement.house);

    rules.push({
      house: house.house,
      lord,
      placed_in_house: placement.house,
      placed_in_sign: placement.signLabel,
      classification: getPrimaryClassification(categories),
      categories,
      lord_nature: BODY_NATURE[lord],
      confidence: "high",
    });
  }

  return rules;
}

function conjunctionLookup(conjunctions: ConjunctionSignal[]) {
  const map = new Map<string, ConjunctionSignal>();

  for (const conjunction of conjunctions) {
    const key = `${conjunction.planets[0]}:${conjunction.planets[1]}`;
    map.set(key, conjunction);
  }

  return map;
}

function findConjunction(
  lookup: Map<string, ConjunctionSignal>,
  left: PlanetaryBody,
  right: PlanetaryBody
) {
  const ordered = [left, right].sort(
    (first, second) => getPlanetPriority(first) - getPlanetPriority(second)
  ) as [PlanetaryBody, PlanetaryBody];

  return lookup.get(`${ordered[0]}:${ordered[1]}`) ?? null;
}

function buildLordshipIndexes(houseLordRules: HouseLordRuleSignal[]) {
  const houseToLord = new Map<HouseNumber, PlanetaryBody>();
  const lordToHouses = new Map<PlanetaryBody, HouseNumber[]>();
  const lordToPlacement = new Map<PlanetaryBody, HouseLordRuleSignal>();

  for (const rule of houseLordRules) {
    const houseNumber = rule.house as HouseNumber;
    houseToLord.set(houseNumber, rule.lord);

    const existing = lordToHouses.get(rule.lord) ?? [];
    existing.push(houseNumber);
    lordToHouses.set(rule.lord, existing);
    lordToPlacement.set(rule.lord, rule);
  }

  return {
    houseToLord,
    lordToHouses,
    lordToPlacement,
  };
}

function isDebilitatedPlanet(planet: NormalizedPlanet) {
  return debilitationSignsByBody[planet.body] === planet.signCode;
}

function detectYogaSignals(input: {
  planetsByBody: Map<PlanetaryBody, NormalizedPlanet>;
  houseLordRules: HouseLordRuleSignal[];
  conjunctions: ConjunctionSignal[];
  dignitySignals: DignitySignal[];
}) {
  const signals: YogaSignal[] = [];
  const conjunctionByPair = conjunctionLookup(input.conjunctions);
  const indexes = buildLordshipIndexes(input.houseLordRules);
  const kendraLords = uniqueBodies(
    input.houseLordRules
      .filter((rule) => [1, 4, 7, 10].includes(rule.house))
      .map((rule) => rule.lord)
  );
  const trikonaLords = uniqueBodies(
    input.houseLordRules
      .filter((rule) => [1, 5, 9].includes(rule.house))
      .map((rule) => rule.lord)
  );
  const wealthLords = uniqueBodies(
    input.houseLordRules
      .filter((rule) => [2, 11].includes(rule.house))
      .map((rule) => rule.lord)
  );
  const fortuneLords = uniqueBodies(
    input.houseLordRules
      .filter((rule) => [5, 9].includes(rule.house))
      .map((rule) => rule.lord)
  );

  const overlappingRajaLords = kendraLords.filter((lord) =>
    trikonaLords.includes(lord)
  );
  const linkedRajaPairs: Array<[PlanetaryBody, PlanetaryBody]> = [];

  for (const kendraLord of kendraLords) {
    for (const trikonaLord of trikonaLords) {
      if (kendraLord === trikonaLord) {
        continue;
      }

      if (findConjunction(conjunctionByPair, kendraLord, trikonaLord)) {
        linkedRajaPairs.push([kendraLord, trikonaLord]);
      }
    }
  }

  if (overlappingRajaLords.length > 0 || linkedRajaPairs.length > 0) {
    signals.push({
      yoga_name: "Raja Yoga Candidate",
      category: "RAJA_YOGA_CANDIDATE",
      planets_involved: uniqueBodies([
        ...overlappingRajaLords,
        ...linkedRajaPairs.flat(),
      ]),
      supporting_rules: [
        ...overlappingRajaLords.map((lord) => {
          const houses = indexes.lordToHouses.get(lord) ?? [];
          return `${lord} rules both kendra and trikona houses (${houses.join(", ")}).`;
        }),
        ...linkedRajaPairs.map(
          ([first, second]) =>
            `${first} and ${second} are linked through same-sign conjunction.`
        ),
      ],
      confidence:
        overlappingRajaLords.length > 0 || linkedRajaPairs.length > 1
          ? "high"
          : "medium",
      notes:
        "This pass marks structural Raja Yoga candidates from kendra-trikona lord linkages without final outcome claims.",
    });
  }

  const overlappingDhanaLords = wealthLords.filter((lord) =>
    fortuneLords.includes(lord)
  );
  const linkedDhanaPairs: Array<[PlanetaryBody, PlanetaryBody]> = [];
  const wealthPairConjunction = findConjunction(
    conjunctionByPair,
    indexes.houseToLord.get(2 as HouseNumber) ?? "VENUS",
    indexes.houseToLord.get(11 as HouseNumber) ?? "SATURN"
  );

  for (const wealthLord of wealthLords) {
    for (const fortuneLord of fortuneLords) {
      if (wealthLord === fortuneLord) {
        continue;
      }

      if (findConjunction(conjunctionByPair, wealthLord, fortuneLord)) {
        linkedDhanaPairs.push([wealthLord, fortuneLord]);
      }
    }
  }

  if (
    overlappingDhanaLords.length > 0 ||
    linkedDhanaPairs.length > 0 ||
    wealthPairConjunction
  ) {
    signals.push({
      yoga_name: "Dhana Yoga Candidate",
      category: "DHANA_YOGA_CANDIDATE",
      planets_involved: uniqueBodies([
        ...overlappingDhanaLords,
        ...linkedDhanaPairs.flat(),
        ...(wealthPairConjunction ? wealthPairConjunction.planets : []),
      ]),
      supporting_rules: [
        ...overlappingDhanaLords.map((lord) => {
          const houses = indexes.lordToHouses.get(lord) ?? [];
          return `${lord} carries both wealth and fortune lordship (${houses.join(", ")}).`;
        }),
        ...(wealthPairConjunction
          ? [
              `${wealthPairConjunction.planets[0]} and ${wealthPairConjunction.planets[1]} join across the 2nd/11th wealth axis.`,
            ]
          : []),
        ...linkedDhanaPairs.map(
          ([first, second]) =>
            `${first} and ${second} are linked through same-sign conjunction between wealth and fortune lords.`
        ),
      ],
      confidence:
        overlappingDhanaLords.length > 0 || linkedDhanaPairs.length > 1
          ? "high"
          : "medium",
      notes:
        "This pass marks Dhana Yoga candidates from structural wealth-lord and fortune-lord connectivity.",
    });
  }

  const moon = input.planetsByBody.get("MOON");
  const jupiter = input.planetsByBody.get("JUPITER");

  if (moon && jupiter) {
    const moonToJupiter = getHouseDistance(moon.house, jupiter.house);
    const isKendraFromMoon = [1, 4, 7, 10].includes(moonToJupiter);

    if (isKendraFromMoon) {
      const moonDebilitated = isDebilitatedPlanet(moon);
      const jupiterDebilitated = isDebilitatedPlanet(jupiter);

      signals.push({
        yoga_name: "Gaja Kesari Candidate",
        category: "GAJA_KESARI_CANDIDATE",
        planets_involved: ["MOON", "JUPITER"],
        supporting_rules: [
          `Moon-Jupiter house distance is ${moonToJupiter} (kendra relation from Moon).`,
        ],
        confidence: moonDebilitated || jupiterDebilitated ? "medium" : "high",
        notes:
          "Marked as a structural candidate from Moon-Jupiter kendra relation.",
      });
    }
  }

  const debilitatedPlanets = Array.from(input.planetsByBody.values()).filter(
    (planet) => isDebilitatedPlanet(planet)
  );

  for (const debilitated of debilitatedPlanets) {
    const dispositor = signRulerMap[debilitated.signCode];
    const dispositorPlacement = input.planetsByBody.get(dispositor);
    const exaltationSign = exaltationSignsByBody[debilitated.body];
    const exaltationLord = exaltationSign ? signRulerMap[exaltationSign] : null;
    const exaltationLordPlacement = exaltationLord
      ? input.planetsByBody.get(exaltationLord)
      : null;
    const debilitatedWithDispositorConjunction = dispositorPlacement
      ? findConjunction(conjunctionByPair, debilitated.body, dispositor)
      : null;
    const supportingRules: string[] = [];
    let supportCount = 0;

    if (dispositorPlacement && isKendraHouse(dispositorPlacement.house)) {
      supportCount += 1;
      supportingRules.push(
        `Dispositor ${dispositor} is placed in kendra house ${dispositorPlacement.house}.`
      );
    }

    if (exaltationLord && exaltationLordPlacement && isKendraHouse(exaltationLordPlacement.house)) {
      supportCount += 1;
      supportingRules.push(
        `Exaltation lord ${exaltationLord} is placed in kendra house ${exaltationLordPlacement.house}.`
      );
    }

    if (debilitatedWithDispositorConjunction) {
      supportCount += 1;
      supportingRules.push(
        `${debilitated.body} is conjunct dispositor ${dispositor} in ${debilitatedWithDispositorConjunction.sign}.`
      );
    }

    if (supportCount > 0) {
      signals.push({
        yoga_name: "Neecha Bhanga Candidate",
        category: "NEECHA_BHANGA_CANDIDATE",
        planets_involved: uniqueBodies(
          [
            debilitated.body,
            dispositor,
            ...(exaltationLord ? [exaltationLord] : []),
          ].filter(
            (body): body is PlanetaryBody =>
              typeof body === "string" && Boolean(body)
          )
        ),
        supporting_rules: supportingRules,
        confidence: supportCount >= 2 ? "high" : "medium",
        notes:
          "Marked as cancellation candidate from first-pass Neecha Bhanga structural checks.",
      });
    }
  }

  const viparitaSupport: string[] = [];
  const viparitaBodies: PlanetaryBody[] = [];

  for (const dusthanaHouse of [6, 8, 12] as const) {
    const lord = indexes.houseToLord.get(dusthanaHouse as HouseNumber);

    if (!lord) {
      continue;
    }

    const placement = input.planetsByBody.get(lord);

    if (!placement) {
      continue;
    }

    if (DUSTHANA_HOUSES.has(placement.house)) {
      viparitaBodies.push(lord);
      viparitaSupport.push(
        `${lord} (lord of house ${dusthanaHouse}) is placed in dusthana house ${placement.house}.`
      );
    }
  }

  if (viparitaBodies.length > 0) {
    signals.push({
      yoga_name: "Viparita Raja Candidate",
      category: "VIPARITA_RAJA_CANDIDATE",
      planets_involved: uniqueBodies(viparitaBodies),
      supporting_rules: viparitaSupport,
      confidence: viparitaBodies.length >= 2 ? "high" : "medium",
      notes:
        "Marked as candidate from dusthana-lord-in-dusthana structural placements.",
    });
  }

  const budhaAdityaConjunction = findConjunction(conjunctionByPair, "SUN", "MERCURY");

  if (budhaAdityaConjunction) {
    signals.push({
      yoga_name: "Budha-Aditya Candidate",
      category: "BUDHA_ADITYA_CANDIDATE",
      planets_involved: ["SUN", "MERCURY"],
      supporting_rules: [
        `Sun and Mercury share ${budhaAdityaConjunction.sign} in house ${budhaAdityaConjunction.house}.`,
      ],
      confidence:
        budhaAdityaConjunction.type === "CLOSE_DEGREE" ? "high" : "medium",
      notes:
        "Marked as conjunction-based Budha-Aditya candidate.",
    });
  }

  const chandraMangalaConjunction = findConjunction(
    conjunctionByPair,
    "MOON",
    "MARS"
  );
  const moonPlanet = input.planetsByBody.get("MOON");
  const marsPlanet = input.planetsByBody.get("MARS");

  if (chandraMangalaConjunction) {
    signals.push({
      yoga_name: "Chandra-Mangala Candidate",
      category: "CHANDRA_MANGALA_CANDIDATE",
      planets_involved: ["MOON", "MARS"],
      supporting_rules: [
        `Moon and Mars share ${chandraMangalaConjunction.sign} in house ${chandraMangalaConjunction.house}.`,
      ],
      confidence:
        chandraMangalaConjunction.type === "CLOSE_DEGREE" ? "high" : "medium",
      notes:
        "Marked as conjunction-based Chandra-Mangala candidate.",
    });
  } else if (moonPlanet && marsPlanet) {
    const moonMarsDistance = getHouseDistance(moonPlanet.house, marsPlanet.house);

    if ([4, 7, 10].includes(moonMarsDistance)) {
      signals.push({
        yoga_name: "Chandra-Mangala Candidate",
        category: "CHANDRA_MANGALA_CANDIDATE",
        planets_involved: ["MOON", "MARS"],
        supporting_rules: [
          `Moon and Mars hold a kendra relationship with house distance ${moonMarsDistance}.`,
        ],
        confidence: "medium",
        notes:
          "Marked as relationship candidate from kendra Moon-Mars positioning.",
      });
    }
  }

  const debilitationSignals = input.dignitySignals.filter(
    (signal) => signal.dignity_type === "DEBILITATED"
  );

  return signals
    .map((signal) => {
      if (signal.category === "GAJA_KESARI_CANDIDATE" && debilitationSignals.length > 1) {
        return {
          ...signal,
          confidence: signal.confidence === "high" ? "medium" : signal.confidence,
        };
      }

      return signal;
    })
    .sort((left, right) => {
      if (left.yoga_name !== right.yoga_name) {
        return left.yoga_name.localeCompare(right.yoga_name);
      }

      const leftScore = left.planets_involved.reduce(
        (sum, body) => sum + getPlanetPriority(body),
        0
      );
      const rightScore = right.planets_involved.reduce(
        (sum, body) => sum + getPlanetPriority(body),
        0
      );

      return leftScore - rightScore;
    });
}

function buildStructuralSummary(input: {
  dignitySignals: DignitySignal[];
  conjunctions: ConjunctionSignal[];
  houseLordRules: HouseLordRuleSignal[];
  yogaSignals: YogaSignal[];
}) {
  const strengths = new Set<string>();
  const pressures = new Set<string>();
  const relationships = new Set<string>();

  for (const signal of input.dignitySignals) {
    if (
      signal.dignity_type === "OWN_SIGN" ||
      signal.dignity_type === "EXALTED" ||
      signal.dignity_type === "MOOLATRIKONA_CANDIDATE"
    ) {
      strengths.add(
        `${signal.planet} shows ${signal.dignity_type.toLowerCase()} support in ${signal.sign} (house ${signal.house}).`
      );
    }

    if (
      signal.dignity_type === "DEBILITATED" ||
      signal.dignity_type === "COMBUST" ||
      signal.dignity_type === "ENEMY_SIGN"
    ) {
      pressures.add(
        `${signal.planet} carries ${signal.dignity_type.toLowerCase()} pressure in ${signal.sign} (house ${signal.house}).`
      );
    }
  }

  for (const rule of input.houseLordRules) {
    if (rule.lord_nature === "BENEFIC" && rule.categories.includes("DUSTHANA")) {
      pressures.add(
        `Benefic lord ${rule.lord} is placed in dusthana house ${rule.placed_in_house}.`
      );
    }

    if (rule.categories.includes("KENDRA") || rule.categories.includes("TRIKONA")) {
      strengths.add(
        `House ${rule.house} lord ${rule.lord} occupies ${rule.placed_in_sign} (house ${rule.placed_in_house}).`
      );
    }
  }

  for (const conjunction of input.conjunctions) {
    relationships.add(
      `${conjunction.planets[0]}-${conjunction.planets[1]} conjunction in ${conjunction.sign} house ${conjunction.house} (${conjunction.type.toLowerCase()}).`
    );
  }

  for (const yoga of input.yogaSignals) {
    if (yoga.confidence === "high") {
      strengths.add(`${yoga.yoga_name} detected with high confidence.`);
    } else {
      relationships.add(`${yoga.yoga_name} detected as ${yoga.confidence} confidence candidate.`);
    }
  }

  return {
    key_strengths: Array.from(strengths).slice(0, 8),
    key_pressures: Array.from(pressures).slice(0, 8),
    key_relationships: Array.from(relationships).slice(0, 8),
  };
}

export function calculateJyotishYogaRuleEngine(input: {
  chart: UnifiedSiderealChart | null | undefined;
}): YogaRuleEngineResult {
  if (!input.chart) {
    return fail(
      "INVALID_CHART_CONTEXT",
      "Chart context is required for yoga/rule engine detection."
    );
  }

  if (!input.chart.verification?.is_verified_for_chart_logic) {
    return fail(
      "UNVERIFIED_CHART_CONTEXT",
      "Chart context must be verified for yoga/rule engine detection."
    );
  }

  const normalizedHouses = normalizeHouses(input.chart);

  if (!normalizedHouses.success) {
    return normalizedHouses;
  }

  const normalizedPlanets = normalizePlanets(input.chart);

  if (!normalizedPlanets.success) {
    return normalizedPlanets;
  }

  const planetsByBody = new Map<PlanetaryBody, NormalizedPlanet>(
    normalizedPlanets.data.map((planet) => [planet.body, planet])
  );
  const dignitySignals = detectDignitySignals(normalizedPlanets.data);
  const conjunctions = detectConjunctionSignals(normalizedPlanets.data);
  const houseLordRules = detectHouseLordRules({
    houses: normalizedHouses.data,
    planetsByBody,
  });

  if (!Array.isArray(houseLordRules)) {
    return houseLordRules;
  }

  const yogaSignals = detectYogaSignals({
    planetsByBody,
    houseLordRules,
    conjunctions,
    dignitySignals,
  });

  return {
    success: true,
    data: {
      dignity_signals: dignitySignals,
      conjunctions,
      house_lord_rules: houseLordRules,
      yoga_signals: yogaSignals,
      structural_summary: buildStructuralSummary({
        dignitySignals,
        conjunctions,
        houseLordRules,
        yogaSignals,
      }),
    },
  };
}
