// Card 9.2 — Premium Panchang / Hora / Choghadiya engine orchestrator.
//
// Extends Card 2 (authoritative foundation) with: query-instant support,
// sunrise-anchored Panchang day (pre-sunrise -> previous vara), element
// start/end times, full-day transition enumeration (<= 1 s), planetary Hora,
// Choghadiya, and provenance on every emitted value. Honest unavailable /
// degraded states — no fabricated event, window, hora or choghadiya, ever.
//
// Engine-only: no route, no persistence, no migration. Card 2's public route
// and output are untouched.

import {
  calculateCoreGrahaSiderealLongitudesAtUtc,
} from "@/lib/astrology/swiss-planetary-service";
import { getSwissEphModule } from "@/lib/astrology/swiss-module";
import {
  convertLocalDateTimeToUtc,
  getMoonEventUtc,
  getSunAndMoon,
  getSunEventUtc,
  getTithi,
  toJulianDayUt,
} from "@/modules/panchang/engine";
import {
  enumerateTransitions,
  makeKeysResolver,
} from "@/modules/panchang/premium/transitions";
import {
  resolveElementState,
  resolveVara,
  toPremiumTransitions,
} from "@/modules/panchang/premium/panchang-elements";
import { buildHoraSchedule } from "@/modules/panchang/premium/hora";
import {
  buildDayChoghadiya,
  buildNightChoghadiya,
} from "@/modules/panchang/premium/choghadiya";
import { buildDailyPeriods } from "@/modules/panchang/premium/daily-periods";
import { toLocalMinute } from "@/modules/panchang/premium/intervals";
import type {
  PremiumNakshatraState,
  PremiumPanchangFailureCode,
  PremiumPanchangInput,
  PremiumPanchangResult,
  PremiumPanchangSnapshot,
  PremiumSunEvent,
  PremiumUnavailableReason,
  RiseSetBundle,
  RiseSetProvider,
  SunMoonSampler,
} from "@/modules/panchang/premium/types";
import {
  PREMIUM_PANCHANG_CONTRACT_VERSION,
  PREMIUM_PANCHANG_CONVENTIONS,
} from "@/modules/panchang/premium/types";

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MIN_DATE = "1900-01-01";
const MAX_DATE = "2100-12-31";

export type BuildPremiumPanchangInput = PremiumPanchangInput & {
  injected?: {
    sampler?: SunMoonSampler;
    riseSet?: RiseSetProvider;
  };
};

function fail(
  code: PremiumPanchangFailureCode,
  message: string
): PremiumPanchangResult {
  return { success: false, error: { code, message } };
}

function isValidDateLocal(value: string): boolean {
  const match = value.match(DATE_RE);

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

function isValidTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

/** Civil local calendar date (YYYY-MM-DD) of a UTC instant in an IANA zone. */
export function civilDateOf(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

function shiftDate(dateLocal: string, days: number): string {
  const [year, month, day] = dateLocal.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));

  return shifted.toISOString().slice(0, 10);
}

function timezoneOffsetHours(instant: Date, timeZone: string): number {
  const asLocal = new Date(
    instant.toLocaleString("en-US", { timeZone, hour12: false })
  );

  return (asLocal.getTime() - instant.getTime()) / 3_600_000;
}

// --- Real providers (Swiss Ephemeris; Node 22) --------------------------------

export const realSunMoonSampler: SunMoonSampler = (utc) => {
  const planetary = calculateCoreGrahaSiderealLongitudesAtUtc({ asOfUtc: utc });

  if (!planetary.success) {
    return null;
  }

  return getSunAndMoon(planetary.data.planets);
};

export const realRiseSetProvider: RiseSetProvider = (input) => {
  const empty: RiseSetBundle = {
    sunriseUtc: null,
    sunsetUtc: null,
    nextSunriseUtc: null,
    moonriseUtc: null,
    moonsetUtc: null,
  };

  let swisseph: ReturnType<typeof getSwissEphModule>;

  try {
    swisseph = getSwissEphModule();
  } catch {
    return empty;
  }

  const localMidnightUtc = convertLocalDateTimeToUtc(
    input.dateLocal,
    "00:00",
    input.timezoneIana
  );

  if (!localMidnightUtc) {
    return empty;
  }

  const julianDayStartUt = toJulianDayUt(localMidnightUtc, swisseph);
  const common = {
    longitude: input.longitude,
    latitude: input.latitude,
    swisseph,
  };
  const sunriseUtc = getSunEventUtc({
    julianDayStartUt,
    eventFlag: swisseph.SE_CALC_RISE,
    ...common,
  });
  const sunsetUtc = getSunEventUtc({
    julianDayStartUt,
    eventFlag: swisseph.SE_CALC_SET,
    ...common,
  });
  let nextSunriseUtc: string | null = null;

  const nextSeed = sunsetUtc ?? sunriseUtc;

  if (nextSeed) {
    nextSunriseUtc = getSunEventUtc({
      julianDayStartUt: toJulianDayUt(
        new Date(new Date(nextSeed).getTime() + 60_000),
        swisseph
      ),
      eventFlag: swisseph.SE_CALC_RISE,
      ...common,
    });
  }

  const moonriseUtc = getMoonEventUtc({
    julianDayStartUt,
    eventFlag: swisseph.SE_CALC_RISE,
    ...common,
  });
  const moonsetUtc = getMoonEventUtc({
    julianDayStartUt,
    eventFlag: swisseph.SE_CALC_SET,
    ...common,
  });

  return { sunriseUtc, sunsetUtc, nextSunriseUtc, moonriseUtc, moonsetUtc };
};

// --- Engine --------------------------------------------------------------------

export function buildPremiumPanchangSnapshot(
  input: BuildPremiumPanchangInput
): PremiumPanchangResult {
  // --- Validation -------------------------------------------------------------
  if (
    !Number.isFinite(input.latitude) ||
    !Number.isFinite(input.longitude) ||
    input.latitude < -90 ||
    input.latitude > 90 ||
    input.longitude < -180 ||
    input.longitude > 180
  ) {
    return fail("INVALID_COORDINATES", "latitude/longitude out of range.");
  }

  if (!input.timezoneIana || !isValidTimeZone(input.timezoneIana)) {
    return fail("INVALID_TIMEZONE", "timezoneIana must be a valid IANA zone.");
  }

  const hasDate = typeof input.localDate === "string" && input.localDate.length > 0;
  const hasInstant =
    typeof input.queryInstant === "string" && input.queryInstant.length > 0;

  if (!hasDate && !hasInstant) {
    return fail(
      "MISSING_DATE_OR_INSTANT",
      "Provide localDate or queryInstant."
    );
  }

  if (hasDate && !isValidDateLocal(input.localDate!)) {
    return fail("INVALID_DATE", "localDate must be a valid YYYY-MM-DD date.");
  }

  let queryInstant: Date | null = null;

  if (hasInstant) {
    queryInstant = new Date(input.queryInstant!);

    if (Number.isNaN(queryInstant.getTime())) {
      return fail("INVALID_QUERY_INSTANT", "queryInstant must be a valid UTC ISO instant.");
    }
  }

  const sampler = input.injected?.sampler ?? realSunMoonSampler;
  const riseSet = input.injected?.riseSet ?? realRiseSetProvider;
  const unavailableReasons: PremiumUnavailableReason[] = [];

  // --- Resolve the Panchang day (sunrise-anchored) ----------------------------
  // Candidate civil date: from the instant's local calendar date, else localDate.
  let panchangDayDate = hasInstant
    ? civilDateOf(queryInstant!, input.timezoneIana)
    : input.localDate!;
  let preSunriseInstant = false;

  let events = riseSet({
    dateLocal: panchangDayDate,
    latitude: input.latitude,
    longitude: input.longitude,
    timezoneIana: input.timezoneIana,
  });

  if (hasInstant && events.sunriseUtc) {
    const sunriseMs = new Date(events.sunriseUtc).getTime();

    if (queryInstant!.getTime() < sunriseMs) {
      // Pre-sunrise: the instant belongs to the PREVIOUS Panchang day/vara.
      preSunriseInstant = true;
      panchangDayDate = shiftDate(panchangDayDate, -1);
      events = riseSet({
        dateLocal: panchangDayDate,
        latitude: input.latitude,
        longitude: input.longitude,
        timezoneIana: input.timezoneIana,
      });
    }
  }

  if (hasDate && hasInstant && panchangDayDate !== input.localDate) {
    return fail(
      "DATE_INSTANT_MISMATCH",
      `queryInstant belongs to Panchang day ${panchangDayDate}, not ${input.localDate}.`
    );
  }

  if (panchangDayDate < MIN_DATE || panchangDayDate > MAX_DATE) {
    return fail(
      "UNSUPPORTED_DATE_RANGE",
      `Supported date range is ${MIN_DATE}..${MAX_DATE}.`
    );
  }

  const sunriseMs = events.sunriseUtc ? new Date(events.sunriseUtc).getTime() : null;
  const sunsetMs = events.sunsetUtc ? new Date(events.sunsetUtc).getTime() : null;
  const nextSunriseMs = events.nextSunriseUtc
    ? new Date(events.nextSunriseUtc).getTime()
    : null;

  // Default query instant = sunrise of the Panchang day.
  const queryMs = hasInstant ? queryInstant!.getTime() : sunriseMs;

  if (queryMs === null) {
    unavailableReasons.push({
      system: "sunEvents",
      code: "SUN_EVENT_CALCULATION_FAILED",
      message:
        "Sunrise could not be calculated for this date/location and no explicit queryInstant was provided.",
    });
  }

  // --- Elements + transitions --------------------------------------------------
  const keysAt = makeKeysResolver(sampler);
  let tithi: PremiumPanchangSnapshot["tithi"] = null;
  let nakshatra: PremiumPanchangSnapshot["nakshatra"] = null;
  let yoga: PremiumPanchangSnapshot["yoga"] = null;
  let karana: PremiumPanchangSnapshot["karana"] = null;
  let paksha: PremiumPanchangSnapshot["paksha"] = null;
  let transitions: PremiumPanchangSnapshot["transitions"] = [];
  let longitudesReady = false;
  let transitionsReady = false;

  if (queryMs !== null) {
    const ctx = { sampler, keysAt, queryMs };
    const sample = sampler(new Date(queryMs));

    if (sample) {
      longitudesReady = true;
      tithi = resolveElementState(ctx, "tithi");
      nakshatra = resolveElementState(ctx, "nakshatra") as PremiumNakshatraState | null;
      yoga = resolveElementState(ctx, "yoga");
      karana = resolveElementState(ctx, "karana");
      paksha = getTithi(sample).paksha;
    } else {
      unavailableReasons.push({
        system: "longitudes",
        code: "EPHEMERIS_UNAVAILABLE",
        message: "Sidereal Sun/Moon longitudes are unavailable at the query instant.",
      });
    }

    if (longitudesReady && sunriseMs !== null && nextSunriseMs !== null) {
      const raw = enumerateTransitions({
        keysAt,
        fromMs: sunriseMs,
        toMs: nextSunriseMs,
      });
      const mapped = raw
        ? toPremiumTransitions({
            sampler,
            transitions: raw,
            timezoneIana: input.timezoneIana,
          })
        : null;

      if (mapped) {
        transitions = mapped;
        transitionsReady = true;
      } else {
        unavailableReasons.push({
          system: "transitions",
          code: "TRANSITION_CALCULATION_FAILED",
          message: "Panchang-day transition enumeration failed.",
        });
      }
    } else if (longitudesReady) {
      unavailableReasons.push({
        system: "transitions",
        code: "SUN_EVENT_CALCULATION_FAILED",
        message:
          "Panchang-day boundaries are unavailable; full-day transitions were not enumerated.",
      });
    }
  }

  // --- Sunrise-derived structures (never fabricated) ---------------------------
  const vara = queryMs !== null ? resolveVara(panchangDayDate) : null;
  const weekdayIndex = vara?.index ?? 0;
  let horas: PremiumPanchangSnapshot["horas"] = [];
  let choghadiyaDay: PremiumPanchangSnapshot["choghadiyaDay"] = [];
  let choghadiyaNight: PremiumPanchangSnapshot["choghadiyaNight"] = [];
  let rahuKaal: PremiumPanchangSnapshot["rahuKaal"] = null;
  let yamaganda: PremiumPanchangSnapshot["yamaganda"] = null;
  let gulika: PremiumPanchangSnapshot["gulika"] = null;
  let abhijit: PremiumPanchangSnapshot["abhijit"] = null;
  let brahmaMuhurta: PremiumPanchangSnapshot["brahmaMuhurta"] = null;

  if (sunriseMs !== null && sunsetMs !== null && vara) {
    const periods = buildDailyPeriods({
      weekdayIndex,
      sunriseMs,
      sunsetMs,
      timezoneIana: input.timezoneIana,
    });

    rahuKaal = periods.rahuKaal;
    yamaganda = periods.yamaganda;
    gulika = periods.gulika;
    abhijit = periods.abhijit;
    brahmaMuhurta = periods.brahmaMuhurta;
    horas = buildHoraSchedule({
      weekdayIndex,
      sunriseMs,
      sunsetMs,
      nextSunriseMs,
      timezoneIana: input.timezoneIana,
    });
    choghadiyaDay = buildDayChoghadiya({
      weekdayIndex,
      sunriseMs,
      sunsetMs,
      timezoneIana: input.timezoneIana,
    });

    if (nextSunriseMs !== null) {
      choghadiyaNight = buildNightChoghadiya({
        weekdayIndex,
        sunsetMs,
        nextSunriseMs,
        timezoneIana: input.timezoneIana,
      });
    }
  } else if (sunriseMs === null || sunsetMs === null) {
    unavailableReasons.push({
      system: "dailyPeriods",
      code: "SUN_EVENT_CALCULATION_FAILED",
      message:
        "Sunrise/sunset unavailable; Hora, Choghadiya and sunrise-derived periods are not calculated (never fabricated).",
    });
  }

  const nightSpanUnavailable =
    sunriseMs !== null && sunsetMs !== null && nextSunriseMs === null;

  if (nightSpanUnavailable) {
    unavailableReasons.push({
      system: "nightSpan",
      code: "SUN_EVENT_CALCULATION_FAILED",
      message:
        "Next sunrise unavailable; night Horas and night Choghadiya are not calculated.",
    });
  }

  // --- Readiness + status -------------------------------------------------------
  const sunEventsReady =
    sunriseMs !== null && sunsetMs !== null && nextSunriseMs !== null
      ? "ready"
      : sunriseMs !== null && sunsetMs !== null
        ? "degraded"
        : "unavailable";
  const moonEventsReady =
    events.moonriseUtc !== null && events.moonsetUtc !== null
      ? "ready"
      : events.moonriseUtc !== null || events.moonsetUtc !== null
        ? "degraded"
        : "unavailable";
  const sourceSystemReadiness: PremiumPanchangSnapshot["sourceSystemReadiness"] = {
    sunEvents: sunEventsReady,
    moonEvents: moonEventsReady,
    longitudes: longitudesReady ? "ready" : "unavailable",
    transitions: transitionsReady ? "ready" : "unavailable",
  };

  const elementsReady = Boolean(tithi && nakshatra && yoga && karana);
  let status: PremiumPanchangSnapshot["status"];

  if (!elementsReady || queryMs === null) {
    status = elementsReady ? "degraded" : "unavailable";
  } else if (sunEventsReady === "ready" && transitionsReady) {
    status = "ok";
  } else {
    status = "degraded";
  }

  const toEvent = (utcIso: string | null): PremiumSunEvent | null =>
    utcIso
      ? { utc: utcIso, local: toLocalMinute(utcIso, input.timezoneIana) }
      : null;

  const offset = timezoneOffsetHours(
    new Date(queryMs ?? Date.parse(`${panchangDayDate}T12:00:00Z`)),
    input.timezoneIana
  );
  const timezoneCoordinateSuspect =
    Math.abs(input.longitude / 15 - offset) > 3;

  const calculationReferences = [
    ...new Set(
      [
        "card2:panchang-foundation",
        tithi?.calculationReference,
        nakshatra?.calculationReference,
        yoga?.calculationReference,
        karana?.calculationReference,
        rahuKaal?.calculationReference,
        abhijit?.calculationReference,
        brahmaMuhurta?.calculationReference,
        horas[0]?.calculationReference,
        choghadiyaDay[0]?.calculationReference,
        choghadiyaNight[0]?.calculationReference,
      ].filter((ref): ref is string => Boolean(ref))
    ),
  ];

  return {
    success: true,
    data: {
      status,
      contractVersion: PREMIUM_PANCHANG_CONTRACT_VERSION,
      conventions: PREMIUM_PANCHANG_CONVENTIONS,
      queryInstant: queryMs !== null ? new Date(queryMs).toISOString() : null,
      localDate: panchangDayDate,
      timezone: input.timezoneIana,
      coordinates: {
        latitude: Number(input.latitude.toFixed(6)),
        longitude: Number(input.longitude.toFixed(6)),
      },
      panchangDay:
        events.sunriseUtc && events.nextSunriseUtc
          ? { startUtc: events.sunriseUtc, endUtc: events.nextSunriseUtc }
          : null,
      sunrise: toEvent(events.sunriseUtc),
      sunset: toEvent(events.sunsetUtc),
      nextSunrise: toEvent(events.nextSunriseUtc),
      moonrise: toEvent(events.moonriseUtc),
      moonset: toEvent(events.moonsetUtc),
      vara,
      paksha,
      tithi,
      nakshatra,
      yoga,
      karana,
      transitions,
      rahuKaal,
      yamaganda,
      gulika,
      abhijit,
      brahmaMuhurta,
      horas,
      choghadiyaDay,
      choghadiyaNight,
      sourceSystemReadiness,
      calculationReferences,
      unavailableReasons,
      flags: {
        preSunriseInstant,
        moonEventsPartial: moonEventsReady !== "ready",
        nightSpanUnavailable,
        elevationApplied: false,
        timezoneCoordinateSuspect,
      },
    },
  };
}
