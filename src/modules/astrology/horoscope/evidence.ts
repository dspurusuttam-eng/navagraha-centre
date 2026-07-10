// Card 8B — Evidence token builders (one per source system).
//
// Each builder is a pure function of the resolved HoroscopeChartContext. Every
// token is created via makeToken(), which resolves basis/provenance from the
// immutable rule registry (getRule throws on an unregistered ruleId). Raw
// evidence only — no band, no averaging. Precedence + dedup happen in aggregate.

import { signRulerMap } from "@/lib/astrology/constants";
import {
  ownSignsByBody,
  exaltationSignsByBody,
  debilitationSignsByBody,
} from "@/lib/astrology/constants";
import { zodiacSigns } from "@/modules/astrology/constants";
import type { ClassicalPlanetaryBody, ZodiacSign } from "@/modules/astrology/types";
import {
  CATEGORY_SIGNIFICATORS,
  getRule,
  type CategorySignificator,
} from "@/modules/astrology/horoscope/rules";
import type { HoroscopeChartContext } from "@/modules/astrology/horoscope/context";
import type {
  EvidenceReference,
  EvidenceTier,
  EvidenceToken,
  HoroscopeCategoryKey,
} from "@/modules/astrology/horoscope/types";

// Parashari graha-drishti as house offsets (1 = same house). Nodes reduced to
// 7th only (product simplification; noted in the rule basis) to avoid mixing
// contested node-aspect traditions.
const ASPECT_HOUSE_OFFSETS: Record<string, number[]> = {
  SUN: [7],
  MOON: [7],
  MERCURY: [7],
  VENUS: [7],
  MARS: [4, 7, 8],
  JUPITER: [5, 7, 9],
  SATURN: [3, 7, 10],
  RAHU: [7],
  KETU: [7],
};

function makeToken(input: {
  ruleId: string;
  category: HoroscopeCategoryKey | "global";
  reference: EvidenceReference;
  conditionKey: string;
  calculationReference: string;
  tier?: EvidenceTier;
}): EvidenceToken {
  const rule = getRule(input.ruleId);
  const tier = input.tier ?? rule.nominalTier;

  return {
    evidenceId: `${input.category}:${input.ruleId}:${input.conditionKey}`,
    ruleId: rule.ruleId,
    sourceSystem: rule.sourceSystem,
    category: input.category,
    tier,
    basis: rule.basis,
    classicalOrProduct: rule.classicalOrProduct,
    reference: input.reference,
    conditionKey: input.conditionKey,
    calculationReference: input.calculationReference,
  };
}

// --- Small pure accessors ----------------------------------------------------

function houseLord(
  ctx: HoroscopeChartContext,
  house: number
): ClassicalPlanetaryBody | null {
  const natal = ctx.natal;

  if (!natal || house < 1 || house > 12) {
    return null;
  }

  const sign = zodiacSigns[natal.houseSign[house - 1]] as ZodiacSign;

  return (signRulerMap[sign] as ClassicalPlanetaryBody) ?? null;
}

function aspectsHouse(
  planet: string,
  fromHouse: number,
  targetHouse: number
): boolean {
  const offsets = ASPECT_HOUSE_OFFSETS[planet] ?? [7];

  return offsets.some(
    (offset) => ((fromHouse - 1 + (offset - 1)) % 12) + 1 === targetHouse
  );
}

function transitEntry(ctx: HoroscopeChartContext, planet: string) {
  if (!ctx.gochar.ready) {
    return null;
  }

  return ctx.gochar.data.transits.find((entry) => entry.graha === planet) ?? null;
}

function bavOfPlanetInSign(
  ctx: HoroscopeChartContext,
  planet: string,
  sign: number
): number | null {
  if (!ctx.ashtakavarga.ready) {
    return null;
  }

  const entry = ctx.ashtakavarga.data.bav.find((row) => row.planet === planet);

  return entry ? entry.signBindus[sign] ?? null : null;
}

function savOfHouse(ctx: HoroscopeChartContext, house: number): number | null {
  if (!ctx.ashtakavarga.ready) {
    return null;
  }

  const entry = ctx.ashtakavarga.data.sav.byHouse.find((row) => row.house === house);

  return entry ? entry.bindus : null;
}

function categorySignificatorPlanets(
  ctx: HoroscopeChartContext,
  significator: CategorySignificator
): string[] {
  const planets = new Set<string>(significator.karakas);

  for (const house of significator.primaryHouses) {
    const lord = houseLord(ctx, house);

    if (lord) {
      planets.add(lord);
    }
  }

  return [...planets];
}

function dignityTier(planet: string, signIndex: number): EvidenceTier | null {
  const sign = zodiacSigns[signIndex] as ZodiacSign;
  const own = ownSignsByBody[planet as ClassicalPlanetaryBody] ?? [];

  if (own.includes(sign) || exaltationSignsByBody[planet as ClassicalPlanetaryBody] === sign) {
    return 1;
  }

  if (debilitationSignsByBody[planet as ClassicalPlanetaryBody] === sign) {
    return -1;
  }

  return null;
}

/** BAV gate on a Gochar base tier (classical: transit fruit read with bindus). */
export function applyBavGate(baseTier: EvidenceTier, bindu: number): EvidenceTier {
  if (bindu >= 5) {
    return baseTier;
  }

  if (bindu >= 3) {
    // reduce magnitude by 1 toward 0
    if (baseTier > 0) return (baseTier - 1) as EvidenceTier;
    if (baseTier < 0) return (baseTier + 1) as EvidenceTier;
    return 0;
  }

  // bindu <= 2: positive capped to 0; negative unchanged
  return baseTier > 0 ? 0 : baseTier;
}

// --- 1. Dasha evidence (phase driver) ---------------------------------------

export function buildDashaEvidence(
  ctx: HoroscopeChartContext,
  category: HoroscopeCategoryKey
): EvidenceToken[] {
  if (!ctx.dasha.ready || !ctx.natal) {
    return [];
  }

  const significator = CATEGORY_SIGNIFICATORS[category];
  const tokens: EvidenceToken[] = [];
  const lineage = ctx.dasha.data;
  const levels: Array<{ lord: string; primaryEligible: boolean }> = [
    { lord: lineage.mahadasha.planet, primaryEligible: true },
    { lord: lineage.antardasha.planet, primaryEligible: true },
    { lord: lineage.pratyantardasha.planet, primaryEligible: false },
  ];
  const occupancyHouses = new Set([
    ...significator.primaryHouses,
    ...significator.secondaryHouses,
  ]);
  const seenLords = new Set<string>();

  for (const { lord, primaryEligible } of levels) {
    if (seenLords.has(lord)) {
      continue;
    }
    seenLords.add(lord);

    const lordHouse = ctx.natal.planetHouseFromLagna[lord];
    const ownsPrimary = significator.primaryHouses.some(
      (house) => houseLord(ctx, house) === lord
    );
    const occupies =
      typeof lordHouse === "number" && occupancyHouses.has(lordHouse);
    const aspects =
      typeof lordHouse === "number" &&
      significator.primaryHouses.some((house) => aspectsHouse(lord, lordHouse, house));
    const isKaraka = significator.karakas.includes(lord as ClassicalPlanetaryBody);
    const conditionKey = `dasha:${lord}:${category}`;
    const calculationReference = "card5:active-lineage";

    if (primaryEligible && ownsPrimary && occupies) {
      tokens.push(
        makeToken({
          ruleId: "DASHA_LORD_OWNS_AND_OCCUPIES",
          category,
          reference: { frame: "lagna", house: lordHouse, planet: lord },
          conditionKey,
          calculationReference,
        })
      );
      continue;
    }

    if (ownsPrimary) {
      tokens.push(
        makeToken({
          ruleId: "DASHA_LORD_OWNS_PRIMARY_HOUSE",
          category,
          reference: { frame: "lagna", house: significator.primaryHouses[0], planet: lord },
          conditionKey,
          calculationReference,
        })
      );
    } else if (occupies) {
      tokens.push(
        makeToken({
          ruleId: "DASHA_LORD_OCCUPIES_HOUSE",
          category,
          reference: { frame: "lagna", house: lordHouse, planet: lord },
          conditionKey,
          calculationReference,
        })
      );
    } else if (aspects) {
      tokens.push(
        makeToken({
          ruleId: "DASHA_LORD_ASPECTS_HOUSE",
          category,
          reference: { frame: "lagna", house: significator.primaryHouses[0], planet: lord },
          conditionKey,
          calculationReference,
        })
      );
    } else if (isKaraka) {
      tokens.push(
        makeToken({
          ruleId: "DASHA_LORD_IS_KARAKA",
          category,
          reference: { frame: "lagna", planet: lord },
          conditionKey,
          calculationReference,
        })
      );
    }
  }

  return tokens;
}

// --- 2. Sade Sati / Saturn evidence (caution overlay) -----------------------

export function buildSadeSatiEvidence(
  ctx: HoroscopeChartContext,
  category: HoroscopeCategoryKey
): EvidenceToken[] {
  const significator = CATEGORY_SIGNIFICATORS[category];

  if (!ctx.gochar.ready || !significator.sadeSatiCapped) {
    return [];
  }

  const sadeSati = ctx.gochar.data.sadeSati;
  const affliction = ctx.gochar.data.saturnAffliction;
  // Single Saturn-derived token per category (strongest condition), sharing a
  // conditionKey with any Saturn gochar token so Saturn is never double-counted.
  const conditionKey = `saturn:${category}`;
  const calculationReference = "card6:sade-sati";
  const reference: EvidenceReference = {
    frame: "moon",
    house: sadeSati.saturnHouseFromMoon,
    planet: "SATURN",
  };

  let ruleId: string | null = null;

  if (affliction === "ashtama_8th") {
    ruleId = "SATURN_ASHTAMA_8TH";
  } else if (sadeSati.active && sadeSati.phase === "peak") {
    ruleId = "SADE_SATI_PEAK";
  } else if (sadeSati.active && sadeSati.phase === "rising") {
    ruleId = "SADE_SATI_RISING";
  } else if (sadeSati.active && sadeSati.phase === "setting") {
    ruleId = "SADE_SATI_SETTING";
  } else if (affliction === "kantaka_4th") {
    ruleId = "SATURN_KANTAKA_4TH";
  }

  if (!ruleId) {
    return [];
  }

  return [makeToken({ ruleId, category, reference, conditionKey, calculationReference })];
}

// --- 3. Gochar evidence (current window; gated by BAV) ----------------------

export function buildGocharEvidence(
  ctx: HoroscopeChartContext,
  category: HoroscopeCategoryKey
): EvidenceToken[] {
  if (!ctx.gochar.ready || !ctx.natal) {
    return [];
  }

  const significator = CATEGORY_SIGNIFICATORS[category];
  const tokens: EvidenceToken[] = [];

  for (const planet of categorySignificatorPlanets(ctx, significator)) {
    const entry = transitEntry(ctx, planet);

    if (!entry) {
      continue;
    }

    const benefic = entry.transitResult === "benefic";
    const occupiesPrimaryFromLagna = significator.primaryHouses.includes(
      entry.houseFromLagna
    );
    let baseTier: EvidenceTier = benefic ? 1 : -1;

    // Saturn shares its conditionKey with Sade Sati so it is counted once.
    const conditionKey =
      planet === "SATURN" ? `saturn:${category}` : `gochar:${planet}:${category}`;

    // BAV gate (only for the 7 classical planets that have a BAV).
    const bindu = bavOfPlanetInSign(ctx, planet, entry.rashi);

    if (bindu !== null) {
      baseTier = applyBavGate(baseTier, bindu);
      tokens.push(
        makeToken({
          ruleId: "BAV_GATE_APPLIED",
          category,
          tier: 0,
          reference: { frame: "sign", sign: entry.rashi, planet },
          conditionKey: `bav:${planet}:${category}`,
          calculationReference: "card7:bav",
        })
      );
    }

    const ruleId = occupiesPrimaryFromLagna
      ? "GOCHAR_LAGNA_HOUSE_OCCUPANCY"
      : benefic
        ? "GOCHAR_MOON_BENEFIC"
        : "GOCHAR_MOON_NON_BENEFIC";

    tokens.push(
      makeToken({
        ruleId,
        category,
        tier: baseTier,
        reference: occupiesPrimaryFromLagna
          ? { frame: "lagna", house: entry.houseFromLagna, planet }
          : { frame: "moon", house: entry.houseFromMoon, planet },
        conditionKey,
        calculationReference: "card6:gochar",
      })
    );
  }

  return tokens;
}

// --- 4. Ashtakavarga SAV context --------------------------------------------

export function buildSavEvidence(
  ctx: HoroscopeChartContext,
  category: HoroscopeCategoryKey
): EvidenceToken[] {
  if (!ctx.ashtakavarga.ready || !ctx.natal) {
    return [];
  }

  const significator = CATEGORY_SIGNIFICATORS[category];
  const house = significator.primaryHouses[0];
  const bindus = savOfHouse(ctx, house);

  if (bindus === null) {
    return [];
  }

  const sign = ctx.natal.houseSign[house - 1];
  const reference: EvidenceReference = { frame: "sign", house, sign };
  const conditionKey = `sav:${category}:${house}`;
  const calculationReference = "card7:sav-byhouse";

  if (bindus >= 30) {
    return [makeToken({ ruleId: "SAV_STRONG_HOUSE", category, reference, conditionKey, calculationReference })];
  }

  if (bindus <= 24) {
    return [makeToken({ ruleId: "SAV_WEAK_HOUSE", category, reference, conditionKey, calculationReference })];
  }

  return [];
}

// --- 5. Panchang evidence (general_day_quality only) ------------------------

export function buildPanchangEvidence(
  ctx: HoroscopeChartContext,
  category: HoroscopeCategoryKey
): EvidenceToken[] {
  if (category !== "general_day_quality" || !ctx.panchang.ready) {
    return [];
  }

  const tone = ctx.panchang.data.dailyTone.trim().toLowerCase();
  const reference: EvidenceReference = { frame: "day" };
  const conditionKey = "panchang:tone:general";
  const calculationReference = "card2:panchang-daily-tone";

  if (tone === "supportive") {
    return [makeToken({ ruleId: "PANCHANG_TONE_SUPPORTIVE", category, reference, conditionKey, calculationReference })];
  }

  if (tone === "balanced" || tone === "neutral") {
    return [];
  }

  return [makeToken({ ruleId: "PANCHANG_TONE_REFLECTIVE", category, reference, conditionKey, calculationReference })];
}

// --- 6. Divisional evidence (natal potential modifier) ----------------------

export function buildDivisionalEvidence(
  ctx: HoroscopeChartContext,
  category: HoroscopeCategoryKey
): EvidenceToken[] {
  const significator = CATEGORY_SIGNIFICATORS[category];

  if (!significator.varga) {
    return [];
  }

  const state = ctx.divisional[significator.varga];

  if (!state || !state.ready) {
    return [];
  }

  const karaka = significator.karakas[0];

  if (!karaka) {
    return [];
  }

  const placement = state.data.planets.find((row) => row.body === karaka);

  if (!placement) {
    return [];
  }

  const tier = dignityTier(karaka, placement.signIndex);

  if (tier === null) {
    return [];
  }

  const reference: EvidenceReference = {
    frame: "sign",
    sign: placement.signIndex,
    planet: karaka,
  };
  const conditionKey = `varga:${significator.varga}:${karaka}:${category}`;
  const calculationReference = `card4:${significator.varga}`;

  return [
    makeToken({
      ruleId: tier > 0 ? "VARGA_KARAKA_DIGNIFIED" : "VARGA_KARAKA_DEBILITATED",
      category,
      reference,
      conditionKey,
      calculationReference,
    }),
  ];
}

export function buildAllCategoryEvidence(
  ctx: HoroscopeChartContext,
  category: HoroscopeCategoryKey
): EvidenceToken[] {
  return [
    ...buildDashaEvidence(ctx, category),
    ...buildSadeSatiEvidence(ctx, category),
    ...buildGocharEvidence(ctx, category),
    ...buildSavEvidence(ctx, category),
    ...buildPanchangEvidence(ctx, category),
    ...buildDivisionalEvidence(ctx, category),
  ];
}
