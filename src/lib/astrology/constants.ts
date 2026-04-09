import type {
  HouseNumber,
  HouseSystem,
  NakshatraName,
  PlanetaryBody,
  ZodiacSign,
} from "@/modules/astrology/types";

export const zodiacSignOrder: readonly ZodiacSign[] = [
  "ARIES",
  "TAURUS",
  "GEMINI",
  "CANCER",
  "LEO",
  "VIRGO",
  "LIBRA",
  "SCORPIO",
  "SAGITTARIUS",
  "CAPRICORN",
  "AQUARIUS",
  "PISCES",
];

export const zodiacSignLabelMap: Record<ZodiacSign, string> = {
  ARIES: "Aries",
  TAURUS: "Taurus",
  GEMINI: "Gemini",
  CANCER: "Cancer",
  LEO: "Leo",
  VIRGO: "Virgo",
  LIBRA: "Libra",
  SCORPIO: "Scorpio",
  SAGITTARIUS: "Sagittarius",
  CAPRICORN: "Capricorn",
  AQUARIUS: "Aquarius",
  PISCES: "Pisces",
};

export const planetLabelMap: Record<PlanetaryBody, string> = {
  SUN: "Sun",
  MOON: "Moon",
  MARS: "Mars",
  MERCURY: "Mercury",
  JUPITER: "Jupiter",
  VENUS: "Venus",
  SATURN: "Saturn",
  RAHU: "Rahu",
  KETU: "Ketu",
};

export const wholeSignHouseNumbers: readonly HouseNumber[] = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
];

export const houseSystemCodeMap: Record<HouseSystem, string> = {
  WHOLE_SIGN: "W",
  PLACIDUS: "P",
};

export const houseSystemLabelMap: Record<HouseSystem, string> = {
  WHOLE_SIGN: "Whole Sign",
  PLACIDUS: "Placidus",
};

export const signRulerMap: Record<ZodiacSign, PlanetaryBody> = {
  ARIES: "MARS",
  TAURUS: "VENUS",
  GEMINI: "MERCURY",
  CANCER: "MOON",
  LEO: "SUN",
  VIRGO: "MERCURY",
  LIBRA: "VENUS",
  SCORPIO: "MARS",
  SAGITTARIUS: "JUPITER",
  CAPRICORN: "SATURN",
  AQUARIUS: "SATURN",
  PISCES: "JUPITER",
};

export const ownSignsByBody: Partial<Record<PlanetaryBody, readonly ZodiacSign[]>> =
  {
    SUN: ["LEO"],
    MOON: ["CANCER"],
    MARS: ["ARIES", "SCORPIO"],
    MERCURY: ["GEMINI", "VIRGO"],
    JUPITER: ["SAGITTARIUS", "PISCES"],
    VENUS: ["TAURUS", "LIBRA"],
    SATURN: ["CAPRICORN", "AQUARIUS"],
  };

export const exaltationSignsByBody: Partial<Record<PlanetaryBody, ZodiacSign>> = {
  SUN: "ARIES",
  MOON: "TAURUS",
  MARS: "CAPRICORN",
  MERCURY: "VIRGO",
  JUPITER: "CANCER",
  VENUS: "PISCES",
  SATURN: "LIBRA",
  RAHU: "TAURUS",
  KETU: "SCORPIO",
};

export const debilitationSignsByBody: Partial<Record<PlanetaryBody, ZodiacSign>> =
  {
    SUN: "LIBRA",
    MOON: "SCORPIO",
    MARS: "CANCER",
    MERCURY: "PISCES",
    JUPITER: "CAPRICORN",
    VENUS: "VIRGO",
    SATURN: "ARIES",
    RAHU: "SCORPIO",
    KETU: "TAURUS",
  };

export const nakshatraCatalog: ReadonlyArray<{
  name: NakshatraName;
  ruler: PlanetaryBody;
}> = [
  { name: "ASHWINI", ruler: "KETU" },
  { name: "BHARANI", ruler: "VENUS" },
  { name: "KRITTIKA", ruler: "SUN" },
  { name: "ROHINI", ruler: "MOON" },
  { name: "MRIGASHIRSHA", ruler: "MARS" },
  { name: "ARDRA", ruler: "RAHU" },
  { name: "PUNARVASU", ruler: "JUPITER" },
  { name: "PUSHYA", ruler: "SATURN" },
  { name: "ASHLESHA", ruler: "MERCURY" },
  { name: "MAGHA", ruler: "KETU" },
  { name: "PURVA_PHALGUNI", ruler: "VENUS" },
  { name: "UTTARA_PHALGUNI", ruler: "SUN" },
  { name: "HASTA", ruler: "MOON" },
  { name: "CHITRA", ruler: "MARS" },
  { name: "SWATI", ruler: "RAHU" },
  { name: "VISHAKHA", ruler: "JUPITER" },
  { name: "ANURADHA", ruler: "SATURN" },
  { name: "JYESHTHA", ruler: "MERCURY" },
  { name: "MOOLA", ruler: "KETU" },
  { name: "PURVA_ASHADHA", ruler: "VENUS" },
  { name: "UTTARA_ASHADHA", ruler: "SUN" },
  { name: "SHRAVANA", ruler: "MOON" },
  { name: "DHANISHTA", ruler: "MARS" },
  { name: "SHATABHISHA", ruler: "RAHU" },
  { name: "PURVA_BHADRAPADA", ruler: "JUPITER" },
  { name: "UTTARA_BHADRAPADA", ruler: "SATURN" },
  { name: "REVATI", ruler: "MERCURY" },
];

export const nakshatraLabelMap: Record<NakshatraName, string> = {
  ASHWINI: "Ashwini",
  BHARANI: "Bharani",
  KRITTIKA: "Krittika",
  ROHINI: "Rohini",
  MRIGASHIRSHA: "Mrigashirsha",
  ARDRA: "Ardra",
  PUNARVASU: "Punarvasu",
  PUSHYA: "Pushya",
  ASHLESHA: "Ashlesha",
  MAGHA: "Magha",
  PURVA_PHALGUNI: "Purva Phalguni",
  UTTARA_PHALGUNI: "Uttara Phalguni",
  HASTA: "Hasta",
  CHITRA: "Chitra",
  SWATI: "Swati",
  VISHAKHA: "Vishakha",
  ANURADHA: "Anuradha",
  JYESHTHA: "Jyeshtha",
  MOOLA: "Moola",
  PURVA_ASHADHA: "Purva Ashadha",
  UTTARA_ASHADHA: "Uttara Ashadha",
  SHRAVANA: "Shravana",
  DHANISHTA: "Dhanishta",
  SHATABHISHA: "Shatabhisha",
  PURVA_BHADRAPADA: "Purva Bhadrapada",
  UTTARA_BHADRAPADA: "Uttara Bhadrapada",
  REVATI: "Revati",
};

export const dashaSequence: readonly PlanetaryBody[] = [
  "KETU",
  "VENUS",
  "SUN",
  "MOON",
  "MARS",
  "RAHU",
  "JUPITER",
  "SATURN",
  "MERCURY",
];

export const dashaYearsByLord: Record<PlanetaryBody, number> = {
  KETU: 7,
  VENUS: 20,
  SUN: 6,
  MOON: 10,
  MARS: 7,
  RAHU: 18,
  JUPITER: 16,
  SATURN: 19,
  MERCURY: 17,
};

const planetSortBodies: readonly PlanetaryBody[] = [
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

export const planetSortOrder = new Map<PlanetaryBody, number>(
  planetSortBodies.map((body, index) => [body, index] as const)
);

export const signSpanDegrees = 30;
export const nakshatraSpanDegrees = 360 / 27;
export const padaSpanDegrees = nakshatraSpanDegrees / 4;
export const daysPerDashaYear = 365.2425;
