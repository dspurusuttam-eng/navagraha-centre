import path from "node:path";
import {
  calculateCoreGrahaSiderealLongitudesAtUtc,
  type CoreGrahaSiderealLongitude,
} from "@/lib/astrology/swiss-planetary-service";
import { getSwissEphModule } from "@/lib/astrology/swiss-module";

const FULL_CIRCLE_DEGREES = 360;
const TITHI_SPAN_DEGREES = 12;
const KARANA_SPAN_DEGREES = 6;
const NAKSHATRA_SPAN_DEGREES = FULL_CIRCLE_DEGREES / 27;
const PADA_SPAN_DEGREES = NAKSHATRA_SPAN_DEGREES / 4;

const TITHI_NAMES = [
  "Pratipada",
  "Dwitiya",
  "Tritiya",
  "Chaturthi",
  "Panchami",
  "Shashthi",
  "Saptami",
  "Ashtami",
  "Navami",
  "Dashami",
  "Ekadashi",
  "Dwadashi",
  "Trayodashi",
  "Chaturdashi",
  "Purnima",
  "Pratipada",
  "Dwitiya",
  "Tritiya",
  "Chaturthi",
  "Panchami",
  "Shashthi",
  "Saptami",
  "Ashtami",
  "Navami",
  "Dashami",
  "Ekadashi",
  "Dwadashi",
  "Trayodashi",
  "Chaturdashi",
  "Amavasya",
] as const;

const NAKSHATRA_NAMES = [
  "Ashwini",
  "Bharani",
  "Krittika",
  "Rohini",
  "Mrigashira",
  "Ardra",
  "Punarvasu",
  "Pushya",
  "Ashlesha",
  "Magha",
  "Purva Phalguni",
  "Uttara Phalguni",
  "Hasta",
  "Chitra",
  "Swati",
  "Vishakha",
  "Anuradha",
  "Jyeshtha",
  "Mula",
  "Purva Ashadha",
  "Uttara Ashadha",
  "Shravana",
  "Dhanishta",
  "Shatabhisha",
  "Purva Bhadrapada",
  "Uttara Bhadrapada",
  "Revati",
] as const;

const YOGA_NAMES = [
  "Vishkambha",
  "Priti",
  "Ayushman",
  "Saubhagya",
  "Shobhana",
  "Atiganda",
  "Sukarma",
  "Dhriti",
  "Shoola",
  "Ganda",
  "Vriddhi",
  "Dhruva",
  "Vyaghata",
  "Harshana",
  "Vajra",
  "Siddhi",
  "Vyatipata",
  "Variyana",
  "Parigha",
  "Shiva",
  "Siddha",
  "Sadhya",
  "Shubha",
  "Shukla",
  "Brahma",
  "Indra",
  "Vaidhriti",
] as const;

const REPEATING_KARANAS = [
  "Bava",
  "Balava",
  "Kaulava",
  "Taitila",
  "Garaja",
  "Vanija",
  "Vishti",
] as const;

const WEEKDAY_NAMES = [
  "Sunday (Ravi Vara)",
  "Monday (Soma Vara)",
  "Tuesday (Mangala Vara)",
  "Wednesday (Budha Vara)",
  "Thursday (Guru Vara)",
  "Friday (Shukra Vara)",
  "Saturday (Shani Vara)",
] as const;

const ZODIAC_SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

export type PanchangLocationInput = {
  displayName: string;
  latitude: number;
  longitude: number;
  timezoneIana: string;
  countryCode?: string | null;
  countryName?: string | null;
  region?: string | null;
  city?: string | null;
};

export type PanchangInput = {
  dateLocal: string;
  location: PanchangLocationInput;
};

type PanchangFailureCode =
  | "MISSING_DATE"
  | "INVALID_DATE"
  | "MISSING_LOCATION"
  | "INVALID_COORDINATES"
  | "INVALID_TIMEZONE"
  | "PLANETARY_CALCULATION_FAILED"
  | "MISSING_SUN_OR_MOON"
  | "SUN_EVENT_CALCULATION_FAILED"
  | "SWISSEPH_CALCULATION_ERROR";

type PanchangSummary = {
  spiritual_tone: string[];
  caution_areas: string[];
  suitable_focus: string[];
};

export type PanchangContextOutput = {
  as_of_date: string;
  as_of_utc: string;
  system: {
    zodiac: "sidereal";
    ayanamsha: "LAHIRI";
    ephemeris_mode: "SWISSEPH";
  };
  location: {
    display_name: string;
    latitude: number;
    longitude: number;
    timezone_iana: string;
    country_code: string | null;
    country_name: string | null;
    region: string | null;
    city: string | null;
  };
  tithi: {
    index: number;
    name: string;
    paksha: "Shukla" | "Krishna";
    progress_percent: number;
  };
  vara: string;
  nakshatra: {
    index: number;
    name: string;
    pada: 1 | 2 | 3 | 4;
    progress_percent: number;
  };
  yoga: {
    index: number;
    name: string;
    progress_percent: number;
  };
  karana: {
    index: number;
    name: string;
  };
  sunrise: {
    local_time: string;
    utc: string;
  };
  sunset: {
    local_time: string;
    utc: string;
  };
  moon_sign: string;
  summary: PanchangSummary;
};

export type PanchangContextFailure = {
  success: false;
  error: {
    code: PanchangFailureCode;
    message: string;
  };
};

export type PanchangContextSuccess = {
  success: true;
  data: PanchangContextOutput;
};

export type PanchangContextResult = PanchangContextFailure | PanchangContextSuccess;

function fail(
  code: PanchangFailureCode,
  message: string
): PanchangContextFailure {
  return {
    success: false,
    error: {
      code,
      message,
    },
  };
}

function normalizeLongitude(value: number) {
  const normalized = value % FULL_CIRCLE_DEGREES;

  return normalized < 0 ? normalized + FULL_CIRCLE_DEGREES : normalized;
}

function resolveEphemerisPath() {
  return (
    process.env.SWISSEPH_EPHE_PATH?.trim() ||
    path.join(process.cwd(), "node_modules", "swisseph", "ephe")
  );
}

function isValidDateLocal(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function isValidTimeZone(value: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
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

function convertLocalDateTimeToUtc(
  dateLocal: string,
  timeLocal: string,
  timeZone: string
) {
  const [year, month, day] = dateLocal.split("-").map(Number);
  const [hour, minute] = timeLocal.split(":").map(Number);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    !Number.isInteger(hour) ||
    !Number.isInteger(minute)
  ) {
    return null;
  }

  const naiveUtcMs = Date.UTC(year, month - 1, day, hour, minute, 0);
  const initialOffset = getTimeZoneOffsetMs(new Date(naiveUtcMs), timeZone);
  let utcMs = naiveUtcMs - initialOffset;
  const correctedOffset = getTimeZoneOffsetMs(new Date(utcMs), timeZone);

  if (correctedOffset !== initialOffset) {
    utcMs = naiveUtcMs - correctedOffset;
  }

  return new Date(utcMs);
}

function toJulianDayUt(date: Date, swisseph: ReturnType<typeof getSwissEphModule>) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour =
    date.getUTCHours() +
    date.getUTCMinutes() / 60 +
    date.getUTCSeconds() / 3600 +
    date.getUTCMilliseconds() / 3_600_000;

  return swisseph.swe_julday(year, month, day, hour, swisseph.SE_GREG_CAL);
}

function julianUtToUtcIso(
  julianDayUt: number,
  swisseph: ReturnType<typeof getSwissEphModule>
) {
  const reversed = swisseph.swe_revjul(julianDayUt, swisseph.SE_GREG_CAL);

  if (
    !reversed ||
    !Number.isFinite(reversed.year) ||
    !Number.isFinite(reversed.month) ||
    !Number.isFinite(reversed.day) ||
    !Number.isFinite(reversed.hour)
  ) {
    return null;
  }

  const hourDecimal = reversed.hour;
  const totalMilliseconds = Math.round(hourDecimal * 3_600_000);
  const hours = Math.floor(totalMilliseconds / 3_600_000);
  const minutes = Math.floor((totalMilliseconds % 3_600_000) / 60_000);
  const seconds = Math.floor((totalMilliseconds % 60_000) / 1_000);
  const milliseconds = totalMilliseconds % 1_000;

  return new Date(
    Date.UTC(
      reversed.year,
      reversed.month - 1,
      reversed.day,
      hours,
      minutes,
      seconds,
      milliseconds
    )
  ).toISOString();
}

function getSunEventUtc(input: {
  julianDayStartUt: number;
  longitude: number;
  latitude: number;
  eventFlag: number;
  swisseph: ReturnType<typeof getSwissEphModule>;
}) {
  input.swisseph.swe_set_ephe_path(resolveEphemerisPath());
  input.swisseph.swe_set_topo(input.longitude, input.latitude, 0);

  const flags = input.swisseph.SEFLG_SWIEPH | input.swisseph.SEFLG_TOPOCTR;

  const response = input.swisseph.swe_rise_trans(
    input.julianDayStartUt,
    input.swisseph.SE_SUN,
    "",
    flags,
    input.eventFlag,
    input.longitude,
    input.latitude,
    0,
    1013.25,
    15
  );

  if (!response || typeof response !== "object") {
    return null;
  }

  if (
    ("error" in response && typeof response.error === "string") ||
    !("transitTime" in response) ||
    !Number.isFinite(response.transitTime)
  ) {
    return null;
  }

  return julianUtToUtcIso(response.transitTime, input.swisseph);
}

function formatLocalTime(utcIso: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(utcIso));
}

function getSunAndMoon(planets: CoreGrahaSiderealLongitude[]) {
  const sun = planets.find((planet) => planet.graha === "SUN");
  const moon = planets.find((planet) => planet.graha === "MOON");

  if (!sun || !moon) {
    return null;
  }

  return {
    sunLongitude: normalizeLongitude(sun.sidereal_longitude),
    moonLongitude: normalizeLongitude(moon.sidereal_longitude),
  };
}

function getTithi(input: { sunLongitude: number; moonLongitude: number }) {
  const phase = normalizeLongitude(input.moonLongitude - input.sunLongitude);
  const tithiIndex = Math.floor(phase / TITHI_SPAN_DEGREES) + 1;
  const progress = ((phase % TITHI_SPAN_DEGREES) / TITHI_SPAN_DEGREES) * 100;

  return {
    index: tithiIndex,
    name: TITHI_NAMES[tithiIndex - 1] ?? "Pratipada",
    paksha: (tithiIndex <= 15 ? "Shukla" : "Krishna") as "Shukla" | "Krishna",
    progress_percent: Number(progress.toFixed(2)),
    phase,
  };
}

function getNakshatra(moonLongitude: number) {
  const index = Math.floor(moonLongitude / NAKSHATRA_SPAN_DEGREES) + 1;
  const offset = moonLongitude - (index - 1) * NAKSHATRA_SPAN_DEGREES;
  const pada = Math.floor(offset / PADA_SPAN_DEGREES) + 1;
  const progress = (offset / NAKSHATRA_SPAN_DEGREES) * 100;

  return {
    index,
    name: NAKSHATRA_NAMES[index - 1] ?? "Ashwini",
    pada: Math.min(4, Math.max(1, pada)) as 1 | 2 | 3 | 4,
    progress_percent: Number(progress.toFixed(2)),
  };
}

function getYoga(input: { sunLongitude: number; moonLongitude: number }) {
  const sum = normalizeLongitude(input.sunLongitude + input.moonLongitude);
  const index = Math.floor(sum / NAKSHATRA_SPAN_DEGREES) + 1;
  const offset = sum - (index - 1) * NAKSHATRA_SPAN_DEGREES;
  const progress = (offset / NAKSHATRA_SPAN_DEGREES) * 100;

  return {
    index,
    name: YOGA_NAMES[index - 1] ?? "Vishkambha",
    progress_percent: Number(progress.toFixed(2)),
  };
}

function getKarana(phaseDegrees: number) {
  const halfTithiIndex = Math.floor(phaseDegrees / KARANA_SPAN_DEGREES) + 1;

  if (halfTithiIndex === 1) {
    return {
      index: halfTithiIndex,
      name: "Kimstughna",
    };
  }

  if (halfTithiIndex >= 58) {
    const fixedNames = ["Shakuni", "Chatushpada", "Naga"] as const;

    return {
      index: halfTithiIndex,
      name: fixedNames[halfTithiIndex - 58] ?? "Naga",
    };
  }

  return {
    index: halfTithiIndex,
    name: REPEATING_KARANAS[(halfTithiIndex - 2) % REPEATING_KARANAS.length],
  };
}

function getMoonSign(moonLongitude: number) {
  const signIndex = Math.floor(moonLongitude / 30);

  return ZODIAC_SIGNS[signIndex] ?? "Aries";
}

function getVara(dateLocal: string) {
  const [year, month, day] = dateLocal.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return WEEKDAY_NAMES[date.getUTCDay()] ?? WEEKDAY_NAMES[0];
}

function buildSummary(input: {
  tithiName: string;
  paksha: "Shukla" | "Krishna";
  yogaName: string;
  karanaName: string;
  vara: string;
  moonSign: string;
}): PanchangSummary {
  const cautionByKarana = input.karanaName === "Vishti"
    ? "Vishti Karana often prefers patience over impulsive commitments."
    : input.karanaName === "Naga"
      ? "Naga Karana supports introspection; avoid rushed conflict decisions."
      : "Keep decisions measured and context-aware through the day.";

  const focusByPaksha =
    input.paksha === "Shukla"
      ? "Shukla Paksha generally supports growth-oriented planning and constructive starts."
      : "Krishna Paksha generally supports review, closure, and refinement work.";

  return {
    spiritual_tone: [
      `${input.tithiName} with ${input.yogaName} suggests a reflective and disciplined daily rhythm.`,
      focusByPaksha,
    ],
    caution_areas: [
      cautionByKarana,
      "Use astrology as timing guidance, then verify major choices with practical judgment.",
    ],
    suitable_focus: [
      `Prioritize ${input.vara} responsibilities with steady pacing.`,
      `Moon in ${input.moonSign} supports emotionally aware communication and clear boundaries.`,
    ],
  };
}

export function calculateDailyPanchangContext(
  input: PanchangInput
): PanchangContextResult {
  const dateLocal = input.dateLocal?.trim();

  if (!dateLocal) {
    return fail("MISSING_DATE", "Date is required for Panchang calculation.");
  }

  if (!isValidDateLocal(dateLocal)) {
    return fail("INVALID_DATE", "Date must be in valid YYYY-MM-DD format.");
  }

  const location = input.location;

  if (!location?.displayName?.trim()) {
    return fail(
      "MISSING_LOCATION",
      "Resolved location is required for Panchang calculation."
    );
  }

  if (
    !Number.isFinite(location.latitude) ||
    !Number.isFinite(location.longitude) ||
    location.latitude < -90 ||
    location.latitude > 90 ||
    location.longitude < -180 ||
    location.longitude > 180
  ) {
    return fail(
      "INVALID_COORDINATES",
      "Resolved location coordinates are invalid."
    );
  }

  if (!isValidTimeZone(location.timezoneIana)) {
    return fail(
      "INVALID_TIMEZONE",
      "Resolved timezone is invalid for Panchang calculation."
    );
  }

  let swisseph: ReturnType<typeof getSwissEphModule>;

  try {
    swisseph = getSwissEphModule();
  } catch (error) {
    return fail(
      "SWISSEPH_CALCULATION_ERROR",
      error instanceof Error
        ? `Swiss Ephemeris module is unavailable: ${error.message}`
        : "Swiss Ephemeris module is unavailable."
    );
  }

  const localMidnightUtc = convertLocalDateTimeToUtc(
    dateLocal,
    "00:00",
    location.timezoneIana
  );

  if (!localMidnightUtc) {
    return fail(
      "INVALID_DATE",
      "Date could not be converted to UTC for Panchang calculation."
    );
  }

  const julianDayStartUt = toJulianDayUt(localMidnightUtc, swisseph);
  const sunriseUtc = getSunEventUtc({
    julianDayStartUt,
    longitude: location.longitude,
    latitude: location.latitude,
    eventFlag: swisseph.SE_CALC_RISE,
    swisseph,
  });
  const sunsetUtc = getSunEventUtc({
    julianDayStartUt,
    longitude: location.longitude,
    latitude: location.latitude,
    eventFlag: swisseph.SE_CALC_SET,
    swisseph,
  });

  if (!sunriseUtc || !sunsetUtc) {
    return fail(
      "SUN_EVENT_CALCULATION_FAILED",
      "Sunrise/Sunset could not be calculated for the selected date and place."
    );
  }

  const planetary = calculateCoreGrahaSiderealLongitudesAtUtc({
    asOfUtc: sunriseUtc,
  });

  if (!planetary.success) {
    return fail("PLANETARY_CALCULATION_FAILED", planetary.issue.message);
  }

  const sunAndMoon = getSunAndMoon(planetary.data.planets);

  if (!sunAndMoon) {
    return fail(
      "MISSING_SUN_OR_MOON",
      "Sun/Moon longitudes are required for Panchang factors."
    );
  }

  const tithi = getTithi(sunAndMoon);
  const nakshatra = getNakshatra(sunAndMoon.moonLongitude);
  const yoga = getYoga(sunAndMoon);
  const karana = getKarana(tithi.phase);
  const moonSign = getMoonSign(sunAndMoon.moonLongitude);
  const vara = getVara(dateLocal);

  return {
    success: true,
    data: {
      as_of_date: dateLocal,
      as_of_utc: sunriseUtc,
      system: {
        zodiac: "sidereal",
        ayanamsha: "LAHIRI",
        ephemeris_mode: "SWISSEPH",
      },
      location: {
        display_name: location.displayName.trim(),
        latitude: Number(location.latitude.toFixed(6)),
        longitude: Number(location.longitude.toFixed(6)),
        timezone_iana: location.timezoneIana,
        country_code: location.countryCode?.trim() || null,
        country_name: location.countryName?.trim() || null,
        region: location.region?.trim() || null,
        city: location.city?.trim() || null,
      },
      tithi: {
        index: tithi.index,
        name: tithi.name,
        paksha: tithi.paksha,
        progress_percent: tithi.progress_percent,
      },
      vara,
      nakshatra,
      yoga,
      karana,
      sunrise: {
        local_time: formatLocalTime(sunriseUtc, location.timezoneIana),
        utc: sunriseUtc,
      },
      sunset: {
        local_time: formatLocalTime(sunsetUtc, location.timezoneIana),
        utc: sunsetUtc,
      },
      moon_sign: moonSign,
      summary: buildSummary({
        tithiName: tithi.name,
        paksha: tithi.paksha,
        yogaName: yoga.name,
        karanaName: karana.name,
        vara,
        moonSign,
      }),
    },
  };
}
