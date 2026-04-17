import type {
  AstronomyReadyBirthContext,
  BirthContextResolutionResult,
} from "@/lib/astrology/birth-context-engine";

type BirthContextValidationSeverity = "error" | "warning";

type BirthContextValidationCode =
  | "RESOLUTION_FAILED"
  | "MISSING_DATE_LOCAL"
  | "INVALID_DATE_LOCAL"
  | "MISSING_TIME_LOCAL"
  | "INVALID_TIME_LOCAL"
  | "SUSPICIOUS_TIME_VALUE"
  | "MISSING_COORDINATES"
  | "INVALID_COORDINATES"
  | "LOW_LOCATION_CONFIDENCE"
  | "MODERATE_LOCATION_CONFIDENCE"
  | "MISSING_TIMEZONE"
  | "INVALID_TIMEZONE"
  | "MISSING_BIRTH_UTC"
  | "INVALID_BIRTH_UTC"
  | "UTC_LOCAL_MISMATCH";

export type BirthContextValidationIssue = {
  severity: BirthContextValidationSeverity;
  code: BirthContextValidationCode;
  message: string;
};

export type BirthContextTimezoneStatus =
  | "valid"
  | "missing"
  | "invalid"
  | "inconsistent";

export type BirthContextOverallConfidence = "high" | "medium" | "low";

export type BirthContextValidationResult = {
  is_valid_for_chart: boolean;
  normalization_status: "NORMALIZED" | "INVALID";
  location_confidence: "high" | "moderate" | "low" | "unknown";
  timezone_status: BirthContextTimezoneStatus;
  overall_confidence: BirthContextOverallConfidence;
  errors: BirthContextValidationIssue[];
  warnings: BirthContextValidationIssue[];
};

function pushIssue(
  collection: BirthContextValidationIssue[],
  severity: BirthContextValidationSeverity,
  code: BirthContextValidationCode,
  message: string
) {
  collection.push({ severity, code, message });
}

function isValidDateLocal(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isValidTimeLocal(value: string) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

function isValidLatitude(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= -90 &&
    value <= 90
  );
}

function isValidLongitude(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= -180 &&
    value <= 180
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

function getTimeZoneLocalParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = formatter.formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  const hour = parts.find((part) => part.type === "hour")?.value ?? "";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "";

  return {
    dateLocal: `${year}-${month}-${day}`,
    timeLocal: `${hour}:${minute}`,
  };
}

function deriveOverallConfidence(input: {
  hasErrors: boolean;
  hasWarnings: boolean;
  locationConfidence: "high" | "moderate" | "low" | "unknown";
}) {
  if (input.hasErrors || input.locationConfidence === "low") {
    return "low" satisfies BirthContextOverallConfidence;
  }

  if (
    input.hasWarnings ||
    input.locationConfidence === "moderate" ||
    input.locationConfidence === "unknown"
  ) {
    return "medium" satisfies BirthContextOverallConfidence;
  }

  return "high" satisfies BirthContextOverallConfidence;
}

export function validateAstronomyReadyBirthContext(
  context: AstronomyReadyBirthContext
): BirthContextValidationResult {
  const errors: BirthContextValidationIssue[] = [];
  const warnings: BirthContextValidationIssue[] = [];
  let timezoneStatus: BirthContextTimezoneStatus = "valid";
  const locationConfidence = context.quality.location_confidence;

  if (!context.birth_input.date_local_normalized) {
    pushIssue(
      errors,
      "error",
      "MISSING_DATE_LOCAL",
      "Birth date is missing from normalized birth context."
    );
  } else if (!isValidDateLocal(context.birth_input.date_local_normalized)) {
    pushIssue(
      errors,
      "error",
      "INVALID_DATE_LOCAL",
      "Birth date format is invalid for chart calculation."
    );
  }

  if (!context.birth_input.time_local_normalized) {
    pushIssue(
      errors,
      "error",
      "MISSING_TIME_LOCAL",
      "Birth time is missing from normalized birth context."
    );
  } else if (!isValidTimeLocal(context.birth_input.time_local_normalized)) {
    pushIssue(
      errors,
      "error",
      "INVALID_TIME_LOCAL",
      "Birth time format is invalid for chart calculation."
    );
  } else if (
    context.birth_input.time_local_normalized === "00:00" ||
    context.birth_input.time_local_normalized === "12:00"
  ) {
    pushIssue(
      warnings,
      "warning",
      "SUSPICIOUS_TIME_VALUE",
      "Birth time appears approximate. Chart precision may be reduced."
    );
  }

  const place = context.normalized_place;

  if (
    place.latitude === undefined ||
    place.longitude === undefined ||
    place.latitude === null ||
    place.longitude === null
  ) {
    pushIssue(
      errors,
      "error",
      "MISSING_COORDINATES",
      "Resolved birthplace is missing latitude/longitude."
    );
  } else if (
    !isValidLatitude(place.latitude) ||
    !isValidLongitude(place.longitude)
  ) {
    pushIssue(
      errors,
      "error",
      "INVALID_COORDINATES",
      "Resolved birthplace coordinates are invalid."
    );
  }

  if (locationConfidence === "low") {
    pushIssue(
      errors,
      "error",
      "LOW_LOCATION_CONFIDENCE",
      "Birthplace confidence is too low for reliable chart generation."
    );
  } else if (locationConfidence === "moderate") {
    pushIssue(
      warnings,
      "warning",
      "MODERATE_LOCATION_CONFIDENCE",
      "Birthplace confidence is moderate. Include a more precise birthplace for higher chart reliability."
    );
  }

  const timezoneIana = context.timezone.iana?.trim() ?? "";

  if (!timezoneIana) {
    timezoneStatus = "missing";
    pushIssue(
      errors,
      "error",
      "MISSING_TIMEZONE",
      "Timezone is missing from resolved birth context."
    );
  } else if (!isValidTimeZone(timezoneIana)) {
    timezoneStatus = "invalid";
    pushIssue(
      errors,
      "error",
      "INVALID_TIMEZONE",
      "Timezone identifier is invalid for UTC conversion."
    );
  }

  if (!context.birth_utc) {
    pushIssue(
      errors,
      "error",
      "MISSING_BIRTH_UTC",
      "UTC birth timestamp is missing from resolved birth context."
    );
  } else {
    const utcDate = new Date(context.birth_utc);

    if (Number.isNaN(utcDate.getTime())) {
      pushIssue(
        errors,
        "error",
        "INVALID_BIRTH_UTC",
        "UTC birth timestamp is invalid."
      );
    } else if (timezoneStatus === "valid") {
      const localFromUtc = getTimeZoneLocalParts(utcDate, timezoneIana);

      if (
        localFromUtc.dateLocal !== context.birth_input.date_local_normalized ||
        localFromUtc.timeLocal !== context.birth_input.time_local_normalized
      ) {
        timezoneStatus = "inconsistent";
        pushIssue(
          errors,
          "error",
          "UTC_LOCAL_MISMATCH",
          "UTC birth timestamp does not match normalized local date/time for the resolved timezone."
        );
      }
    }
  }

  const overallConfidence = deriveOverallConfidence({
    hasErrors: errors.length > 0,
    hasWarnings: warnings.length > 0,
    locationConfidence,
  });

  return {
    is_valid_for_chart: errors.length === 0,
    normalization_status: context.birth_input.normalization_status,
    location_confidence: locationConfidence,
    timezone_status: timezoneStatus,
    overall_confidence: overallConfidence,
    errors,
    warnings,
  };
}

export function validateBirthContextResolutionResult(
  result: BirthContextResolutionResult
): BirthContextValidationResult {
  if (result.success) {
    return validateAstronomyReadyBirthContext(result.data);
  }

  return {
    is_valid_for_chart: false,
    normalization_status: result.partial.birth_input.normalization_status,
    location_confidence: "unknown",
    timezone_status: "missing",
    overall_confidence: "low",
    errors: [
      {
        severity: "error",
        code: "RESOLUTION_FAILED",
        message: result.issue.message,
      },
    ],
    warnings: [],
  };
}
