import {
  divisionalChartCodes,
  houseSystems,
} from "@/modules/astrology/constants";
import type {
  AstrologyValidationIssue,
  AstrologyValidationResult,
  BirthDetails,
  BirthDetailsInput,
  BirthPlace,
  DivisionalChartRequest,
  DivisionalChartRequestInput,
  NatalChartRequest,
  NatalChartRequestInput,
  TransitChartRequest,
  TransitChartRequestInput,
  TransitWindow,
} from "@/modules/astrology/types";

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const localTimePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class AstrologyValidationError extends Error {
  constructor(readonly issues: AstrologyValidationIssue[]) {
    super("Astrology validation failed.");
    this.name = "AstrologyValidationError";
  }
}

function trimOrEmpty(value: string | undefined) {
  return value?.trim() ?? "";
}

function pushIssue(
  issues: AstrologyValidationIssue[],
  field: string,
  code: string,
  message: string
) {
  issues.push({ field, code, message });
}

function isValidIsoDate(value: string) {
  if (!isoDatePattern.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const candidate = new Date(Date.UTC(year, month - 1, day));

  return (
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day
  );
}

function isValidLocalTime(value: string) {
  return localTimePattern.test(value);
}

function isValidTimeZone(value: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

function isValidUtcDateTime(value: string) {
  const parsed = Date.parse(value);

  return Number.isFinite(parsed) && value.includes("T");
}

function normalizePlace(
  place: BirthDetailsInput["place"],
  issues: AstrologyValidationIssue[]
): BirthPlace {
  const city = trimOrEmpty(place.city);
  const region = trimOrEmpty(place.region);
  const country = trimOrEmpty(place.country);
  const latitude = place.latitude ?? null;
  const longitude = place.longitude ?? null;

  if (!city) {
    pushIssue(issues, "place.city", "REQUIRED_CITY", "City is required.");
  }

  if (!country) {
    pushIssue(
      issues,
      "place.country",
      "REQUIRED_COUNTRY",
      "Country is required."
    );
  }

  const hasLatitude = latitude !== null;
  const hasLongitude = longitude !== null;

  if (hasLatitude !== hasLongitude) {
    pushIssue(
      issues,
      "place.coordinates",
      "INCOMPLETE_COORDINATES",
      "Latitude and longitude must be provided together."
    );
  }

  if (hasLatitude && (latitude < -90 || latitude > 90)) {
    pushIssue(
      issues,
      "place.latitude",
      "INVALID_LATITUDE",
      "Latitude must be between -90 and 90."
    );
  }

  if (hasLongitude && (longitude < -180 || longitude > 180)) {
    pushIssue(
      issues,
      "place.longitude",
      "INVALID_LONGITUDE",
      "Longitude must be between -180 and 180."
    );
  }

  return {
    city,
    region: region || undefined,
    country,
    latitude,
    longitude,
  };
}

function normalizeWindow(
  window: TransitWindow,
  issues: AstrologyValidationIssue[]
): TransitWindow {
  const fromDateUtc = trimOrEmpty(window.fromDateUtc);
  const toDateUtc = trimOrEmpty(window.toDateUtc);

  if (!isValidUtcDateTime(fromDateUtc)) {
    pushIssue(
      issues,
      "window.fromDateUtc",
      "INVALID_WINDOW_START",
      "Transit window start must be a valid UTC date-time string."
    );
  }

  if (!isValidUtcDateTime(toDateUtc)) {
    pushIssue(
      issues,
      "window.toDateUtc",
      "INVALID_WINDOW_END",
      "Transit window end must be a valid UTC date-time string."
    );
  }

  if (
    isValidUtcDateTime(fromDateUtc) &&
    isValidUtcDateTime(toDateUtc) &&
    Date.parse(toDateUtc) <= Date.parse(fromDateUtc)
  ) {
    pushIssue(
      issues,
      "window",
      "INVALID_WINDOW_RANGE",
      "Transit window end must be later than the start."
    );
  }

  return {
    fromDateUtc,
    toDateUtc,
  };
}

function normalizeRequestId(
  requestId: string,
  issues: AstrologyValidationIssue[]
) {
  const normalizedRequestId = trimOrEmpty(requestId);

  if (!normalizedRequestId) {
    pushIssue(
      issues,
      "requestId",
      "REQUIRED_REQUEST_ID",
      "A requestId is required to keep chart calls traceable."
    );
  }

  return normalizedRequestId;
}

export function validateBirthDetails(
  input: BirthDetailsInput
): AstrologyValidationResult<BirthDetails> {
  const issues: AstrologyValidationIssue[] = [];
  const dateLocal = trimOrEmpty(input.dateLocal);
  const timeLocal = trimOrEmpty(input.timeLocal);
  const timezone = trimOrEmpty(input.timezone);
  const place = normalizePlace(input.place, issues);

  if (!isValidIsoDate(dateLocal)) {
    pushIssue(
      issues,
      "dateLocal",
      "INVALID_DATE",
      "Birth date must use YYYY-MM-DD and represent a real calendar date."
    );
  }

  if (!isValidLocalTime(timeLocal)) {
    pushIssue(
      issues,
      "timeLocal",
      "INVALID_TIME",
      "Birth time must use 24-hour HH:MM format."
    );
  }

  if (!isValidTimeZone(timezone)) {
    pushIssue(
      issues,
      "timezone",
      "INVALID_TIMEZONE",
      "Timezone must be a valid IANA timezone such as Asia/Kolkata."
    );
  }

  if (issues.length > 0) {
    return {
      success: false,
      issues,
    };
  }

  return {
    success: true,
    data: {
      dateLocal,
      timeLocal,
      timezone,
      place,
    },
  };
}

export function assertValidBirthDetails(
  input: BirthDetailsInput
): BirthDetails {
  const result = validateBirthDetails(input);

  if (!result.success) {
    throw new AstrologyValidationError(result.issues);
  }

  return result.data;
}

export function validateNatalChartRequest(
  input: NatalChartRequestInput
): AstrologyValidationResult<NatalChartRequest> {
  const issues: AstrologyValidationIssue[] = [];
  const requestId = normalizeRequestId(input.requestId, issues);
  const birthDetailsResult = validateBirthDetails(input.birthDetails);

  if (!birthDetailsResult.success) {
    issues.push(...birthDetailsResult.issues);
  }

  const houseSystem = input.houseSystem ?? "WHOLE_SIGN";

  if (!houseSystems.includes(houseSystem)) {
    pushIssue(
      issues,
      "houseSystem",
      "INVALID_HOUSE_SYSTEM",
      "Unsupported house system."
    );
  }

  const requestedDivisionalCharts = Array.from(
    new Set(input.requestedDivisionalCharts ?? [])
  ).filter((value) => divisionalChartCodes.includes(value));

  if (issues.length > 0 || !birthDetailsResult.success) {
    return {
      success: false,
      issues,
    };
  }

  return {
    success: true,
    data: {
      kind: "NATAL",
      requestId,
      subjectId: input.subjectId,
      locale: input.locale,
      birthDetails: birthDetailsResult.data,
      houseSystem,
      requestedDivisionalCharts,
    },
  };
}

export function validateTransitChartRequest(
  input: TransitChartRequestInput
): AstrologyValidationResult<TransitChartRequest> {
  const issues: AstrologyValidationIssue[] = [];
  const requestId = normalizeRequestId(input.requestId, issues);
  const birthDetailsResult = validateBirthDetails(input.birthDetails);
  const window = normalizeWindow(input.window, issues);
  const houseSystem = input.houseSystem ?? "WHOLE_SIGN";

  if (!birthDetailsResult.success) {
    issues.push(...birthDetailsResult.issues);
  }

  if (!houseSystems.includes(houseSystem)) {
    pushIssue(
      issues,
      "houseSystem",
      "INVALID_HOUSE_SYSTEM",
      "Unsupported house system."
    );
  }

  if (issues.length > 0 || !birthDetailsResult.success) {
    return {
      success: false,
      issues,
    };
  }

  return {
    success: true,
    data: {
      kind: "TRANSIT_SNAPSHOT",
      requestId,
      subjectId: input.subjectId,
      locale: input.locale,
      birthDetails: birthDetailsResult.data,
      houseSystem,
      window,
    },
  };
}

export function validateDivisionalChartRequest(
  input: DivisionalChartRequestInput
): AstrologyValidationResult<DivisionalChartRequest> {
  const issues: AstrologyValidationIssue[] = [];
  const requestId = normalizeRequestId(input.requestId, issues);
  const birthDetailsResult = validateBirthDetails(input.birthDetails);
  const houseSystem = input.houseSystem ?? "WHOLE_SIGN";

  if (!birthDetailsResult.success) {
    issues.push(...birthDetailsResult.issues);
  }

  if (!divisionalChartCodes.includes(input.chartCode)) {
    pushIssue(
      issues,
      "chartCode",
      "INVALID_DIVISIONAL_CHART",
      "Unsupported divisional chart code."
    );
  }

  if (!houseSystems.includes(houseSystem)) {
    pushIssue(
      issues,
      "houseSystem",
      "INVALID_HOUSE_SYSTEM",
      "Unsupported house system."
    );
  }

  if (issues.length > 0 || !birthDetailsResult.success) {
    return {
      success: false,
      issues,
    };
  }

  return {
    success: true,
    data: {
      kind: "DIVISIONAL",
      requestId,
      subjectId: input.subjectId,
      locale: input.locale,
      birthDetails: birthDetailsResult.data,
      houseSystem,
      chartCode: input.chartCode,
    },
  };
}
