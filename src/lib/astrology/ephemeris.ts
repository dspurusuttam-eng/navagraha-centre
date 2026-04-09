import "server-only";

import { existsSync } from "node:fs";
import swisseph from "swisseph";
import {
  houseSystemCodeMap,
  nakshatraCatalog,
  nakshatraSpanDegrees,
  padaSpanDegrees,
  signSpanDegrees,
  zodiacSignOrder,
} from "@/lib/astrology/constants";
import type {
  HouseNumber,
  HouseSystem,
  NakshatraPlacement,
  PlanetPosition,
  PlanetaryBody,
  ZodiacSign,
} from "@/modules/astrology/types";

type SwissBodyResult =
  | {
      longitude: number;
      latitude: number;
      distance: number;
      longitudeSpeed: number;
      latitudeSpeed: number;
      distanceSpeed: number;
      rflag: number;
    }
  | {
      error: string;
    };

type SwissHousesResult =
  | {
      house: number[];
      ascendant: number;
      mc: number;
      armc: number;
      vertex: number;
      equatorialAscendant: number;
      kochCoAscendant: number;
      munkaseyCoAscendant: number;
      munkaseyPolarAscendant: number;
    }
  | {
      error: string;
    };

export type SwissEphemerisRuntime = {
  ephemerisFlag: number;
  ephemerisSource: "SWIEPH" | "MOSEPH";
  ayanamsaMode: "LAHIRI";
  calculationVersion: string;
};

export type PlanetPositionMap = Record<PlanetaryBody, PlanetPosition>;

const bodyCodeMap: Record<Exclude<PlanetaryBody, "KETU">, number> = {
  SUN: swisseph.SE_SUN,
  MOON: swisseph.SE_MOON,
  MARS: swisseph.SE_MARS,
  MERCURY: swisseph.SE_MERCURY,
  JUPITER: swisseph.SE_JUPITER,
  VENUS: swisseph.SE_VENUS,
  SATURN: swisseph.SE_SATURN,
  RAHU: swisseph.SE_TRUE_NODE,
};

let cachedRuntime: SwissEphemerisRuntime | null = null;

function getSwissBodyResult(result: SwissBodyResult) {
  if ("error" in result) {
    throw new Error(result.error);
  }

  return result;
}

function getSwissHousesResult(result: SwissHousesResult) {
  if ("error" in result) {
    throw new Error(result.error);
  }

  return result;
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

export function normalizeLongitude(value: number) {
  return ((value % 360) + 360) % 360;
}

export function getZodiacSignFromLongitude(longitude: number): ZodiacSign {
  const index = Math.floor(normalizeLongitude(longitude) / signSpanDegrees);

  return zodiacSignOrder[index] ?? "ARIES";
}

export function getDegreeMinute(longitude: number) {
  const normalized = normalizeLongitude(longitude);
  const degreesWithinSign = normalized % signSpanDegrees;
  let degree = Math.floor(degreesWithinSign);
  let minute = Math.round((degreesWithinSign - degree) * 60);

  if (minute === 60) {
    degree = (degree + 1) % signSpanDegrees;
    minute = 0;
  }

  return { degree, minute };
}

export function getNakshatraPlacement(longitude: number): NakshatraPlacement {
  const normalized = normalizeLongitude(longitude);
  const nakshatraIndex =
    Math.floor(normalized / nakshatraSpanDegrees) % nakshatraCatalog.length;
  const offsetWithinNakshatra =
    normalized - nakshatraIndex * nakshatraSpanDegrees;
  const pada = Math.min(
    4,
    Math.floor(offsetWithinNakshatra / padaSpanDegrees) + 1
  ) as 1 | 2 | 3 | 4;
  const entry = nakshatraCatalog[nakshatraIndex];

  return {
    name: entry.name,
    pada,
    ruler: entry.ruler,
    degreesIntoNakshatra: Number(offsetWithinNakshatra.toFixed(4)),
  };
}

export function convertZonedBirthToUtcDate(
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

export function getSwissEphemerisRuntime(): SwissEphemerisRuntime {
  if (cachedRuntime) {
    return cachedRuntime;
  }

  swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);

  const configuredPath = process.env.SWISSEPH_EPHE_PATH?.trim();
  const hasEphemerisPath = Boolean(configuredPath && existsSync(configuredPath));

  if (hasEphemerisPath && configuredPath) {
    swisseph.swe_set_ephe_path(configuredPath);
  }

  cachedRuntime = {
    ephemerisFlag: hasEphemerisPath
      ? swisseph.SEFLG_SWIEPH
      : swisseph.SEFLG_MOSEPH,
    ephemerisSource: hasEphemerisPath ? "SWIEPH" : "MOSEPH",
    ayanamsaMode: "LAHIRI",
    calculationVersion: hasEphemerisPath
      ? "swisseph-lahiri-v1"
      : "swisseph-lahiri-v1-moshier-fallback",
  };

  return cachedRuntime;
}

export function buildJulianDayFromLocal(
  dateLocal: string,
  timeLocal: string,
  timezone: string
) {
  const utcDate = convertZonedBirthToUtcDate(dateLocal, timeLocal, timezone);
  const hourDecimal =
    utcDate.getUTCHours() +
    utcDate.getUTCMinutes() / 60 +
    utcDate.getUTCSeconds() / 3600;

  return {
    utcDate,
    julianDayUt: swisseph.swe_julday(
      utcDate.getUTCFullYear(),
      utcDate.getUTCMonth() + 1,
      utcDate.getUTCDate(),
      hourDecimal,
      swisseph.SE_GREG_CAL
    ),
  };
}

export function calculateHouseCuspsRaw(
  julianDayUt: number,
  latitude: number,
  longitude: number,
  houseSystem: HouseSystem
) {
  return getSwissHousesResult(
    swisseph.swe_houses_ex(
      julianDayUt,
      swisseph.SEFLG_SIDEREAL,
      latitude,
      longitude,
      houseSystemCodeMap[houseSystem]
    ) as SwissHousesResult
  );
}

export function resolveHouseFromCusps(
  longitude: number,
  houseCusps: readonly number[]
): HouseNumber {
  const normalizedLongitude = normalizeLongitude(longitude);

  for (let index = 0; index < 12; index += 1) {
    const start = normalizeLongitude(houseCusps[index] ?? 0);
    let end = normalizeLongitude(houseCusps[(index + 1) % 12] ?? 0);
    let candidate = normalizedLongitude;

    if (end <= start) {
      end += 360;

      if (candidate < start) {
        candidate += 360;
      }
    }

    if (candidate >= start && candidate < end) {
      return (index + 1) as HouseNumber;
    }
  }

  return 12;
}

function createPlanetPosition(
  body: PlanetaryBody,
  longitude: number,
  latitude: number,
  speed: number,
  houseCusps: readonly number[]
): PlanetPosition {
  const normalizedLongitude = normalizeLongitude(longitude);
  const { degree, minute } = getDegreeMinute(normalizedLongitude);

  return {
    body,
    sign: getZodiacSignFromLongitude(normalizedLongitude),
    longitude: normalizedLongitude,
    degree,
    minute,
    house: resolveHouseFromCusps(normalizedLongitude, houseCusps),
    retrograde: speed < 0,
    speed,
    latitude,
    nakshatra: getNakshatraPlacement(normalizedLongitude),
  };
}

export function getPlanetPositions(
  dateLocal: string,
  timeLocal: string,
  latitude: number,
  longitude: number,
  timezone = "UTC",
  houseSystem: HouseSystem = "WHOLE_SIGN",
  houseCusps?: readonly number[]
): PlanetPositionMap {
  const runtime = getSwissEphemerisRuntime();
  const { julianDayUt } = buildJulianDayFromLocal(
    dateLocal,
    timeLocal,
    timezone
  );
  const activeHouseCusps =
    houseCusps ??
    calculateHouseCuspsRaw(julianDayUt, latitude, longitude, houseSystem).house;
  const flags =
    runtime.ephemerisFlag | swisseph.SEFLG_SIDEREAL | swisseph.SEFLG_SPEED;

  const result = {} as PlanetPositionMap;

  for (const [body, bodyCode] of Object.entries(bodyCodeMap) as Array<
    [Exclude<PlanetaryBody, "KETU">, number]
  >) {
    const rawResult = getSwissBodyResult(
      swisseph.swe_calc_ut(julianDayUt, bodyCode, flags) as SwissBodyResult
    );

    result[body] = createPlanetPosition(
      body,
      rawResult.longitude,
      rawResult.latitude,
      rawResult.longitudeSpeed,
      activeHouseCusps
    );
  }

  const rahuLatitude = result.RAHU.latitude ?? 0;
  const ketuLongitude = normalizeLongitude(result.RAHU.longitude + 180);

  result.KETU = createPlanetPosition(
    "KETU",
    ketuLongitude,
    -rahuLatitude,
    result.RAHU.speed,
    activeHouseCusps
  );
  result.KETU.retrograde = true;
  result.RAHU.retrograde = true;

  return result;
}
