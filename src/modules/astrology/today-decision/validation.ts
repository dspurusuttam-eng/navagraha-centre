export const todayDecisionCategories = [
  "general",
  "travel",
  "purchase",
  "business",
  "career",
  "family",
  "puja",
] as const;

export type TodayDecisionCategory = (typeof todayDecisionCategories)[number];

export type TodayDecisionValidationErrorCode =
  | "INVALID_REQUEST"
  | "MISSING_LATITUDE"
  | "INVALID_LATITUDE"
  | "MISSING_LONGITUDE"
  | "INVALID_LONGITUDE"
  | "MISSING_TIMEZONE"
  | "INVALID_TIMEZONE"
  | "INVALID_DATE"
  | "INVALID_CATEGORY"
  | "INVALID_LOCALE";

export type ValidatedTodayDecisionInput = {
  dateLocal: string;
  latitude: number;
  longitude: number;
  timezone: string;
  category: TodayDecisionCategory;
  locale: string;
  locationLabel: string;
};

export type TodayDecisionValidationResult =
  | {
      ok: true;
      data: ValidatedTodayDecisionInput;
    }
  | {
      ok: false;
      error: {
        code: TodayDecisionValidationErrorCode;
        message: string;
      };
    };

function fail(
  code: TodayDecisionValidationErrorCode,
  message: string
): TodayDecisionValidationResult {
  return { ok: false, error: { code, message } };
}

export function isValidDateLocal(value: string) {
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

export function isValidTimeZone(value: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export function resolveTodayInTimezone(timezone: string) {
  // en-CA formats as YYYY-MM-DD, which matches the Panchang date contract.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function normalizeTodayDecisionCategory(
  value: unknown
): TodayDecisionCategory | null {
  if (value === undefined || value === null || value === "") {
    return "general";
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if ((todayDecisionCategories as readonly string[]).includes(normalized)) {
    return normalized as TodayDecisionCategory;
  }

  return null;
}

function readNumeric(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

export function validateTodayDecisionInput(
  payload: Record<string, unknown>
): TodayDecisionValidationResult {
  const timezoneRaw =
    typeof payload.timezone === "string" ? payload.timezone.trim() : "";

  if (!timezoneRaw) {
    return fail("MISSING_TIMEZONE", "Timezone is required (IANA name).");
  }

  if (timezoneRaw.length > 120 || !isValidTimeZone(timezoneRaw)) {
    return fail("INVALID_TIMEZONE", "Timezone must be a valid IANA timezone name.");
  }

  if (payload.latitude === undefined || payload.latitude === null) {
    return fail("MISSING_LATITUDE", "Latitude is required.");
  }

  const latitude = readNumeric(payload.latitude);

  if (latitude === undefined || latitude < -90 || latitude > 90) {
    return fail("INVALID_LATITUDE", "Latitude must be a number between -90 and 90.");
  }

  if (payload.longitude === undefined || payload.longitude === null) {
    return fail("MISSING_LONGITUDE", "Longitude is required.");
  }

  const longitude = readNumeric(payload.longitude);

  if (longitude === undefined || longitude < -180 || longitude > 180) {
    return fail(
      "INVALID_LONGITUDE",
      "Longitude must be a number between -180 and 180."
    );
  }

  let dateLocal: string;

  if (payload.date === undefined || payload.date === null || payload.date === "") {
    dateLocal = resolveTodayInTimezone(timezoneRaw);
  } else if (typeof payload.date === "string" && isValidDateLocal(payload.date.trim())) {
    dateLocal = payload.date.trim();
  } else {
    return fail("INVALID_DATE", "Date must be a valid date in YYYY-MM-DD format.");
  }

  const category = normalizeTodayDecisionCategory(payload.decisionCategory);

  if (category === null) {
    return fail(
      "INVALID_CATEGORY",
      "decisionCategory must be one of: general, travel, purchase, business, career, family, puja."
    );
  }

  let locale = "en";

  if (payload.locale !== undefined && payload.locale !== null) {
    if (typeof payload.locale !== "string" || payload.locale.trim().length > 12) {
      return fail("INVALID_LOCALE", "Locale must be a short language code string.");
    }
    locale = payload.locale.trim().toLowerCase() || "en";
  } else if (typeof payload.language === "string" && payload.language.trim()) {
    locale = payload.language.trim().toLowerCase().slice(0, 12);
  }

  const locationLabelRaw =
    typeof payload.locationLabel === "string" ? payload.locationLabel.trim() : "";
  const locationLabel =
    locationLabelRaw && locationLabelRaw.length <= 160
      ? locationLabelRaw
      : `Selected location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;

  return {
    ok: true,
    data: {
      dateLocal,
      latitude,
      longitude,
      timezone: timezoneRaw,
      category,
      locale,
      locationLabel,
    },
  };
}
