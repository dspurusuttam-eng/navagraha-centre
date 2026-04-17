import "server-only";

import type { Prisma } from "@prisma/client";
import {
  BirthInputNormalizationError,
  assertNormalizedBirthContextInput,
} from "@/lib/astrology/birth-input-normalizer";
import {
  buildSiderealBirthChart,
  type SiderealBirthChart,
} from "@/lib/astrology/chart-builder";
import type { AstronomyReadyBirthContext } from "@/lib/astrology/birth-context-engine";
import { validateAstronomyReadyBirthContext } from "@/lib/astrology/birth-context-validator";
import { getPrisma } from "@/lib/prisma";
import {
  buildBirthProfileFingerprint,
  saveBirthChartForUser,
} from "@/modules/astrology/chart-persistence";

type ChartContractErrorCode =
  | "MISSING_BIRTH_PROFILE"
  | "INVALID_BIRTH_INPUT"
  | "INVALID_BIRTH_TIMEZONE"
  | "MISSING_COORDINATES"
  | "INVALID_COORDINATES"
  | "UTC_CONVERSION_FAILED"
  | "INVALID_BIRTH_CONTEXT"
  | "CHART_BUILD_FAILED"
  | "CHART_PERSISTENCE_FAILED"
  | "INTERNAL_ERROR";

type BirthProfileRecord = {
  birthDate: string;
  birthTime: string | null;
  timezone: string;
  city: string;
  region: string | null;
  country: string;
  latitude: Prisma.Decimal | null;
  longitude: Prisma.Decimal | null;
};

export type UserChartContractFailure = {
  success: false;
  error: {
    code: ChartContractErrorCode;
    message: string;
  };
  details?: unknown;
};

export type UserChartContractSuccess = {
  success: true;
  data: SiderealBirthChart;
  persistence: {
    fingerprint: string;
    birthProfileFingerprint: string | null;
    createdAtUtc: string;
    updatedAtUtc: string;
    policy: "updated-existing-for-user-profile" | "kept-existing-canonical-chart";
  };
};

export type UserChartContractResult =
  | UserChartContractFailure
  | UserChartContractSuccess;

function toNumber(value: Prisma.Decimal | null) {
  return value === null ? null : Number(value);
}

function isValidLatitude(value: number) {
  return Number.isFinite(value) && value >= -90 && value <= 90;
}

function isValidLongitude(value: number) {
  return Number.isFinite(value) && value >= -180 && value <= 180;
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

function formatUtcOffset(totalOffsetSeconds: number) {
  const sign = totalOffsetSeconds >= 0 ? "+" : "-";
  const absolute = Math.abs(totalOffsetSeconds);
  const hours = Math.floor(absolute / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((absolute % 3600) / 60)
    .toString()
    .padStart(2, "0");

  return `${sign}${hours}:${minutes}`;
}

function convertLocalToUtcDate(
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
    throw new Error("Invalid local birth date/time format.");
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

function normalizeCountryCode(country: string) {
  const compact = country.trim().toUpperCase();

  if (compact.length === 2 && /^[A-Z]{2}$/.test(compact)) {
    return compact;
  }

  if (compact === "INDIA") {
    return "IN";
  }

  if (compact === "UNITED STATES" || compact === "USA") {
    return "US";
  }

  return "UN";
}

function buildBirthContextFromProfile(
  profile: BirthProfileRecord
): UserChartContractFailure | { success: true; data: AstronomyReadyBirthContext } {
  const latitude = toNumber(profile.latitude);
  const longitude = toNumber(profile.longitude);
  const timeLocal = profile.birthTime?.trim() || "00:00";
  const timezoneIana = profile.timezone.trim();
  const placeText = [profile.city, profile.region, profile.country]
    .filter((value) => Boolean(value && value.trim()))
    .join(", ");

  if (latitude === null || longitude === null) {
    return {
      success: false,
      error: {
        code: "MISSING_COORDINATES",
        message:
          "Birth profile is missing coordinates. Please update onboarding birth details.",
      },
    };
  }

  if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
    return {
      success: false,
      error: {
        code: "INVALID_COORDINATES",
        message:
          "Birth profile coordinates are invalid. Please review onboarding birth details.",
      },
    };
  }

  if (!timezoneIana || !isValidTimeZone(timezoneIana)) {
    return {
      success: false,
      error: {
        code: "INVALID_BIRTH_TIMEZONE",
        message:
          "Birth profile timezone is missing or invalid. Please update onboarding details.",
      },
    };
  }

  let normalizedInput;

  try {
    normalizedInput = assertNormalizedBirthContextInput({
      dateLocalInput: profile.birthDate,
      timeLocalInput: timeLocal,
      placeTextInput: placeText,
    });
  } catch (error) {
    if (error instanceof BirthInputNormalizationError) {
      return {
        success: false,
        error: {
          code: "INVALID_BIRTH_INPUT",
          message:
            "Stored birth profile is not valid for chart generation. Please update onboarding details.",
        },
        details: error.issues,
      };
    }

    return {
      success: false,
      error: {
        code: "INVALID_BIRTH_INPUT",
        message:
          "Birth profile normalization failed. Please review onboarding details.",
      },
    };
  }

  let utcDate: Date;

  try {
    utcDate = convertLocalToUtcDate(
      normalizedInput.date_local_normalized,
      normalizedInput.time_local_normalized,
      timezoneIana
    );
  } catch (error) {
    return {
      success: false,
      error: {
        code: "UTC_CONVERSION_FAILED",
        message:
          error instanceof Error
            ? `UTC conversion failed: ${error.message}`
            : "UTC conversion failed for stored birth profile.",
      },
    };
  }

  const offsetMs = getTimeZoneOffsetMs(utcDate, timezoneIana);

  return {
    success: true,
    data: {
      birth_input: normalizedInput,
      normalized_place: {
        display_name: placeText,
        latitude,
        longitude,
        country_code: normalizeCountryCode(profile.country),
        country_name: profile.country,
        region: profile.region ?? null,
        city: profile.city || null,
      },
      timezone: {
        iana: timezoneIana,
        utc_offset_at_birth: formatUtcOffset(Math.round(offsetMs / 1000)),
      },
      birth_utc: utcDate.toISOString(),
      quality: {
        location_confidence: "moderate",
        normalization_status: "ok",
      },
    },
  };
}

export async function buildSiderealChartContractForUser(
  userId: string
): Promise<UserChartContractResult> {
  const profile = await getPrisma().birthData.findFirst({
    where: {
      userId,
      isPrimary: true,
    },
    orderBy: [{ updatedAt: "desc" }],
    select: {
      birthDate: true,
      birthTime: true,
      timezone: true,
      city: true,
      region: true,
      country: true,
      latitude: true,
      longitude: true,
    },
  });

  if (!profile) {
    return {
      success: false,
      error: {
        code: "MISSING_BIRTH_PROFILE",
        message:
          "Primary birth profile is missing. Complete onboarding before requesting chart data.",
      },
    };
  }

  const contextResult = buildBirthContextFromProfile(profile);

  if (!contextResult.success) {
    return contextResult;
  }

  const contextValidation = validateAstronomyReadyBirthContext(
    contextResult.data
  );

  if (!contextValidation.is_valid_for_chart) {
    return {
      success: false,
      error: {
        code: "INVALID_BIRTH_CONTEXT",
        message:
          "Birth context validation failed. Update onboarding birth details and try again.",
      },
      details: contextValidation,
    };
  }

  const chart = buildSiderealBirthChart(contextResult.data);

  if (!chart.success) {
    return {
      success: false,
      error: {
        code: "CHART_BUILD_FAILED",
        message: chart.issue.message,
      },
      details: chart,
    };
  }
  const birthProfileFingerprint = buildBirthProfileFingerprint({
    birthDate: profile.birthDate,
    birthTime: profile.birthTime,
    timezone: profile.timezone,
    city: profile.city,
    region: profile.region,
    country: profile.country,
    latitude: toNumber(profile.latitude),
    longitude: toNumber(profile.longitude),
  });

  const persistence = await saveBirthChartForUser({
    userId,
    chart: chart.data,
    birthProfileFingerprint,
  });

  if (!persistence.success) {
    return {
      success: false,
      error: {
        code: "CHART_PERSISTENCE_FAILED",
        message: persistence.error.message,
      },
      details: persistence.error,
    };
  }

  return {
    success: true,
    data: chart.data,
    persistence: persistence.data,
  };
}
