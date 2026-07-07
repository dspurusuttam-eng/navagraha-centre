import { divisionalChartCodes, zodiacSigns } from "@/modules/astrology/constants";
import type {
  DivisionalChartCode,
  ZodiacSign,
} from "@/modules/astrology/types";

// Shodashvarga calculation engine (BPHS / Parashara standard).
// Pure math over sidereal (Lahiri) longitudes already computed and verified
// by the existing chart pipeline — no astronomy, no fabrication.
//
// Locked classical variants (Card 4A contract, PO-approved):
// - D2  : classical Sun/Moon hora (Cancer/Leo only)
// - D3  : Parashara drekkana (1st/5th/9th)
// - D16 : movable->Aries, fixed->Leo, dual->Sagittarius
// - D20 : movable->Aries, fixed->Sagittarius, dual->Leo
// - D45 : movable->Aries, fixed->Leo, dual->Sagittarius
// - D60 : floor rule from the sign itself
// Boundary precision: longitudes convert to integer arc-seconds before any
// part-index math, so exact part boundaries deterministically belong to the
// next part.

export const vargaCodes = divisionalChartCodes;
export type VargaCode = DivisionalChartCode;

const ARC_SECONDS_PER_SIGN = 108_000; // 30deg * 3600
const ARC_SECONDS_PER_CIRCLE = 1_296_000; // 360deg * 3600

const SIGN_INDEX = {
  ARIES: 0,
  TAURUS: 1,
  GEMINI: 2,
  CANCER: 3,
  LEO: 4,
  VIRGO: 5,
  LIBRA: 6,
  SCORPIO: 7,
  SAGITTARIUS: 8,
  CAPRICORN: 9,
  AQUARIUS: 10,
  PISCES: 11,
} as const;

export const vargaDivisionCountByCode: Record<VargaCode, number> = {
  D1: 1,
  D2: 2,
  D3: 3,
  D4: 4,
  D7: 7,
  D9: 9,
  D10: 10,
  D12: 12,
  D16: 16,
  D20: 20,
  D24: 24,
  D27: 27,
  D30: 5, // unequal spans; part index 0..4 within a sign
  D40: 40,
  D45: 45,
  D60: 60,
};

export type VargaPlacement = {
  code: VargaCode;
  signIndex: number;
  sign: ZodiacSign;
  partIndex: number;
};

function isOddSign(signIndex: number) {
  // "Odd" in the classical sense: 1st, 3rd, 5th ... sign (Aries, Gemini, ...).
  return signIndex % 2 === 0;
}

type Modality = "movable" | "fixed" | "dual";

function signModality(signIndex: number): Modality {
  const mod = signIndex % 3;

  if (mod === 0) {
    return "movable";
  }

  return mod === 1 ? "fixed" : "dual";
}

export function toNormalizedArcSeconds(longitudeDegrees: number): number | null {
  if (!Number.isFinite(longitudeDegrees)) {
    return null;
  }

  const normalizedDegrees =
    ((longitudeDegrees % 360) + 360) % 360;
  const arcSeconds = Math.round(normalizedDegrees * 3600);

  return ((arcSeconds % ARC_SECONDS_PER_CIRCLE) + ARC_SECONDS_PER_CIRCLE) %
    ARC_SECONDS_PER_CIRCLE;
}

// D30 Trimshamsha unequal bands, in arc-seconds within the sign.
// Odd signs:  0-5 Aries, 5-10 Aquarius, 10-18 Sagittarius, 18-25 Gemini, 25-30 Libra.
// Even signs: 0-5 Taurus, 5-12 Virgo, 12-20 Pisces, 20-25 Capricorn, 25-30 Scorpio.
const TRIMSHAMSHA_ODD_BANDS: ReadonlyArray<{ endExclusive: number; signIndex: number }> = [
  { endExclusive: 5 * 3600, signIndex: SIGN_INDEX.ARIES },
  { endExclusive: 10 * 3600, signIndex: SIGN_INDEX.AQUARIUS },
  { endExclusive: 18 * 3600, signIndex: SIGN_INDEX.SAGITTARIUS },
  { endExclusive: 25 * 3600, signIndex: SIGN_INDEX.GEMINI },
  { endExclusive: 30 * 3600, signIndex: SIGN_INDEX.LIBRA },
];

const TRIMSHAMSHA_EVEN_BANDS: ReadonlyArray<{ endExclusive: number; signIndex: number }> = [
  { endExclusive: 5 * 3600, signIndex: SIGN_INDEX.TAURUS },
  { endExclusive: 12 * 3600, signIndex: SIGN_INDEX.VIRGO },
  { endExclusive: 20 * 3600, signIndex: SIGN_INDEX.PISCES },
  { endExclusive: 25 * 3600, signIndex: SIGN_INDEX.CAPRICORN },
  { endExclusive: 30 * 3600, signIndex: SIGN_INDEX.SCORPIO },
];

function trimshamshaPlacement(signIndex: number, arcSecondsInSign: number) {
  const bands = isOddSign(signIndex)
    ? TRIMSHAMSHA_ODD_BANDS
    : TRIMSHAMSHA_EVEN_BANDS;

  for (let partIndex = 0; partIndex < bands.length; partIndex += 1) {
    if (arcSecondsInSign < bands[partIndex].endExclusive) {
      return { signIndex: bands[partIndex].signIndex, partIndex };
    }
  }

  const lastIndex = bands.length - 1;

  return { signIndex: bands[lastIndex].signIndex, partIndex: lastIndex };
}

function uniformPartIndex(arcSecondsInSign: number, divisions: number) {
  return Math.floor((arcSecondsInSign * divisions) / ARC_SECONDS_PER_SIGN);
}

function modalityStart(
  signIndex: number,
  starts: { movable: number; fixed: number; dual: number }
) {
  return starts[signModality(signIndex)];
}

export function calculateVargaPlacement(
  longitudeDegrees: number,
  code: VargaCode
): VargaPlacement | null {
  const arcSeconds = toNormalizedArcSeconds(longitudeDegrees);

  if (arcSeconds === null) {
    return null;
  }

  const signIndex = Math.floor(arcSeconds / ARC_SECONDS_PER_SIGN);
  const arcSecondsInSign = arcSeconds % ARC_SECONDS_PER_SIGN;
  const odd = isOddSign(signIndex);
  let vargaSignIndex: number;
  let partIndex: number;

  switch (code) {
    case "D1": {
      vargaSignIndex = signIndex;
      partIndex = 0;
      break;
    }
    case "D2": {
      partIndex = uniformPartIndex(arcSecondsInSign, 2);
      const firstHalf = partIndex === 0;
      // Classical Sun/Moon hora: only Leo and Cancer occur.
      vargaSignIndex = odd
        ? firstHalf
          ? SIGN_INDEX.LEO
          : SIGN_INDEX.CANCER
        : firstHalf
          ? SIGN_INDEX.CANCER
          : SIGN_INDEX.LEO;
      break;
    }
    case "D3": {
      partIndex = uniformPartIndex(arcSecondsInSign, 3);
      vargaSignIndex = (signIndex + 4 * partIndex) % 12;
      break;
    }
    case "D4": {
      partIndex = uniformPartIndex(arcSecondsInSign, 4);
      vargaSignIndex = (signIndex + 3 * partIndex) % 12;
      break;
    }
    case "D7": {
      partIndex = uniformPartIndex(arcSecondsInSign, 7);
      vargaSignIndex = odd
        ? (signIndex + partIndex) % 12
        : (signIndex + 6 + partIndex) % 12;
      break;
    }
    case "D9": {
      partIndex = uniformPartIndex(arcSecondsInSign, 9);
      vargaSignIndex = (signIndex * 9 + partIndex) % 12;
      break;
    }
    case "D10": {
      partIndex = uniformPartIndex(arcSecondsInSign, 10);
      vargaSignIndex = odd
        ? (signIndex + partIndex) % 12
        : (signIndex + 8 + partIndex) % 12;
      break;
    }
    case "D12": {
      partIndex = uniformPartIndex(arcSecondsInSign, 12);
      vargaSignIndex = (signIndex + partIndex) % 12;
      break;
    }
    case "D16": {
      partIndex = uniformPartIndex(arcSecondsInSign, 16);
      vargaSignIndex =
        (modalityStart(signIndex, {
          movable: SIGN_INDEX.ARIES,
          fixed: SIGN_INDEX.LEO,
          dual: SIGN_INDEX.SAGITTARIUS,
        }) +
          partIndex) %
        12;
      break;
    }
    case "D20": {
      partIndex = uniformPartIndex(arcSecondsInSign, 20);
      vargaSignIndex =
        (modalityStart(signIndex, {
          movable: SIGN_INDEX.ARIES,
          fixed: SIGN_INDEX.SAGITTARIUS,
          dual: SIGN_INDEX.LEO,
        }) +
          partIndex) %
        12;
      break;
    }
    case "D24": {
      partIndex = uniformPartIndex(arcSecondsInSign, 24);
      vargaSignIndex = odd
        ? (SIGN_INDEX.LEO + partIndex) % 12
        : (SIGN_INDEX.CANCER + partIndex) % 12;
      break;
    }
    case "D27": {
      partIndex = uniformPartIndex(arcSecondsInSign, 27);
      vargaSignIndex = (signIndex * 27 + partIndex) % 12;
      break;
    }
    case "D30": {
      const placement = trimshamshaPlacement(signIndex, arcSecondsInSign);
      vargaSignIndex = placement.signIndex;
      partIndex = placement.partIndex;
      break;
    }
    case "D40": {
      partIndex = uniformPartIndex(arcSecondsInSign, 40);
      vargaSignIndex = odd
        ? partIndex % 12
        : (SIGN_INDEX.LIBRA + partIndex) % 12;
      break;
    }
    case "D45": {
      partIndex = uniformPartIndex(arcSecondsInSign, 45);
      vargaSignIndex =
        (modalityStart(signIndex, {
          movable: SIGN_INDEX.ARIES,
          fixed: SIGN_INDEX.LEO,
          dual: SIGN_INDEX.SAGITTARIUS,
        }) +
          partIndex) %
        12;
      break;
    }
    case "D60": {
      partIndex = uniformPartIndex(arcSecondsInSign, 60);
      vargaSignIndex = (signIndex + partIndex) % 12;
      break;
    }
    default: {
      return null;
    }
  }

  return {
    code,
    signIndex: vargaSignIndex,
    sign: zodiacSigns[vargaSignIndex],
    partIndex,
  };
}

// --- Varga chart assembly over the existing D1 source shape -----------------

export type VargaSourceChart = {
  lagna: {
    sign: ZodiacSign | string;
    longitude: number;
    degree_in_sign: number;
  };
  planets: Array<{
    name: string;
    sign: ZodiacSign | string;
    longitude: number;
    degree_in_sign: number;
    nakshatra: string;
    pada: number;
    is_retrograde: boolean;
    house: number;
  }>;
};

const classicalBodySet = new Set([
  "SUN",
  "MOON",
  "MARS",
  "MERCURY",
  "JUPITER",
  "VENUS",
  "SATURN",
  "RAHU",
  "KETU",
]);

export function isClassicalVargaBody(name: string) {
  return classicalBodySet.has(name.trim().toUpperCase());
}

export type VargaChartPlanet = {
  body: string;
  sign: ZodiacSign;
  signIndex: number;
  partIndex: number;
  house: number;
  retrograde: boolean;
  natalLongitude: number;
  natalDegreeInSign: number;
};

export type VargaChart = {
  code: VargaCode;
  ascendant: {
    sign: ZodiacSign;
    signIndex: number;
    partIndex: number;
  };
  planets: VargaChartPlanet[];
  houses: Array<{ house: number; sign: ZodiacSign }>;
};

export function buildVargaChart(
  source: VargaSourceChart,
  code: VargaCode
): VargaChart | null {
  const lagnaPlacement = calculateVargaPlacement(source.lagna.longitude, code);

  if (!lagnaPlacement) {
    return null;
  }

  const planets: VargaChartPlanet[] = [];

  for (const planet of source.planets) {
    if (!isClassicalVargaBody(planet.name)) {
      continue;
    }

    const placement = calculateVargaPlacement(planet.longitude, code);

    if (!placement) {
      return null;
    }

    planets.push({
      body: planet.name,
      sign: placement.sign,
      signIndex: placement.signIndex,
      partIndex: placement.partIndex,
      house:
        ((placement.signIndex - lagnaPlacement.signIndex + 12) % 12) + 1,
      retrograde: planet.is_retrograde,
      natalLongitude: planet.longitude,
      natalDegreeInSign: planet.degree_in_sign,
    });
  }

  const houses = Array.from({ length: 12 }, (_, index) => ({
    house: index + 1,
    sign: zodiacSigns[(lagnaPlacement.signIndex + index) % 12],
  }));

  return {
    code,
    ascendant: {
      sign: lagnaPlacement.sign,
      signIndex: lagnaPlacement.signIndex,
      partIndex: lagnaPlacement.partIndex,
    },
    planets,
    houses,
  };
}

// Vargottama: same sign in D1 and D9 (classical strength marker; a factual
// sign comparison, not an interpretation).
export function listVargottamaBodies(source: VargaSourceChart): string[] {
  const result: string[] = [];
  const lagnaD1 = calculateVargaPlacement(source.lagna.longitude, "D1");
  const lagnaD9 = calculateVargaPlacement(source.lagna.longitude, "D9");

  if (lagnaD1 && lagnaD9 && lagnaD1.signIndex === lagnaD9.signIndex) {
    result.push("LAGNA");
  }

  for (const planet of source.planets) {
    if (!isClassicalVargaBody(planet.name)) {
      continue;
    }

    const d1 = calculateVargaPlacement(planet.longitude, "D1");
    const d9 = calculateVargaPlacement(planet.longitude, "D9");

    if (d1 && d9 && d1.signIndex === d9.signIndex) {
      result.push(planet.name.trim().toUpperCase());
    }
  }

  return result;
}
