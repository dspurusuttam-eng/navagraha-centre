export const zodiacSigns = [
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
] as const;

export const planetaryBodies = [
  "SUN",
  "MOON",
  "MARS",
  "MERCURY",
  "JUPITER",
  "VENUS",
  "SATURN",
  "RAHU",
  "KETU",
] as const;

export const chartPoints = ["ASCENDANT"] as const;

export const houseSystems = ["WHOLE_SIGN", "PLACIDUS"] as const;

export const aspectTypes = [
  "CONJUNCTION",
  "SEXTILE",
  "SQUARE",
  "TRINE",
  "OPPOSITION",
] as const;

export const vedicAspectRelations = [
  "SEVENTH",
  "MARS_FOURTH",
  "MARS_EIGHTH",
  "JUPITER_FIFTH",
  "JUPITER_NINTH",
  "SATURN_THIRD",
  "SATURN_TENTH",
] as const;

export const divisionalChartCodes = ["D1", "D7", "D9", "D10", "D12"] as const;

export const remedySignalCategories = [
  "DISCIPLINE",
  "DEVOTIONAL",
  "LIFESTYLE",
  "TIMING",
] as const;

export const signalStrengths = ["LOW", "MEDIUM", "HIGH"] as const;

export const nakshatraNames = [
  "ASHWINI",
  "BHARANI",
  "KRITTIKA",
  "ROHINI",
  "MRIGASHIRSHA",
  "ARDRA",
  "PUNARVASU",
  "PUSHYA",
  "ASHLESHA",
  "MAGHA",
  "PURVA_PHALGUNI",
  "UTTARA_PHALGUNI",
  "HASTA",
  "CHITRA",
  "SWATI",
  "VISHAKHA",
  "ANURADHA",
  "JYESHTHA",
  "MOOLA",
  "PURVA_ASHADHA",
  "UTTARA_ASHADHA",
  "SHRAVANA",
  "DHANISHTA",
  "SHATABHISHA",
  "PURVA_BHADRAPADA",
  "UTTARA_BHADRAPADA",
  "REVATI",
] as const;

export const dashaSystems = ["VIMSHOTTARI"] as const;

export const yogaKeys = [
  "RAJ_YOGA",
  "DHANA_YOGA",
  "CHANDRA_MANGALA_YOGA",
] as const;

export const yogaStrengths = ["PRESENT", "STRONG"] as const;

export const houseNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export const signRulers = {
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
} as const;
