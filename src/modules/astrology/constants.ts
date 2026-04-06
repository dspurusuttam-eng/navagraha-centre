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

export const divisionalChartCodes = ["D1", "D7", "D9", "D10", "D12"] as const;

export const remedySignalCategories = [
  "DISCIPLINE",
  "DEVOTIONAL",
  "LIFESTYLE",
  "TIMING",
] as const;

export const signalStrengths = ["LOW", "MEDIUM", "HIGH"] as const;

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
