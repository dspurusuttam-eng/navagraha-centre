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
  "URANUS",
  "NEPTUNE",
  "PLUTO",
] as const;

export const classicalPlanetaryBodies = [
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

export const divisionalChartCodes = [
  "D1",
  "D2",
  "D3",
  "D4",
  "D7",
  "D9",
  "D10",
  "D12",
  "D16",
  "D20",
  "D24",
  "D27",
  "D30",
  "D40",
  "D45",
  "D60",
] as const;

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
  "VIPARITA_RAJ_YOGA",
  "NEECH_BHANG_RAJ_YOGA",
  "PANCH_MAHAPURUSH_YOGA",
  "GAJ_KESARI_YOGA",
  "BUDHADITYA_YOGA",
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
