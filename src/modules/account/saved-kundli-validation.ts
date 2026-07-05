export type SavedKundliErrorCode =
  | "INVALID_BIRTH_INPUT"
  | "GEOCODING_FAILED"
  | "LIMIT_REACHED"
  | "NOT_FOUND"
  | "EMPTY_UPDATE"
  | "PRIMARY_EDIT_VIA_ONBOARDING"
  | "CANNOT_DELETE_PRIMARY";

export type SavedKundliServiceFailure = {
  success: false;
  error: {
    code: SavedKundliErrorCode;
    message: string;
    details?: unknown;
  };
};

export type SavedKundliServiceResult<T> =
  | {
      success: true;
      data: T;
    }
  | SavedKundliServiceFailure;

export const savedKundliGenders = ["female", "male", "other"] as const;

export type SavedKundliGender = (typeof savedKundliGenders)[number];

export type ValidatedSavedKundliWriteInput = {
  label?: string;
  gender?: SavedKundliGender | null;
  dateOfBirth?: string;
  timeOfBirth?: string | null;
  birthPlace?: string;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
  notes?: string | null;
};

export const savedKundliBirthInputFieldKeys = [
  "dateOfBirth",
  "timeOfBirth",
  "birthPlace",
  "latitude",
  "longitude",
  "timezone",
] as const;

export function savedKundliErrorStatus(code: SavedKundliErrorCode) {
  switch (code) {
    case "INVALID_BIRTH_INPUT":
    case "GEOCODING_FAILED":
      return 422;
    case "LIMIT_REACHED":
    case "PRIMARY_EDIT_VIA_ONBOARDING":
    case "CANNOT_DELETE_PRIMARY":
      return 409;
    case "NOT_FOUND":
      return 404;
    case "EMPTY_UPDATE":
      return 400;
    default:
      return 500;
  }
}

export function savedKundliFailure(
  code: SavedKundliErrorCode,
  message: string,
  details?: unknown
): SavedKundliServiceFailure {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details === undefined ? {} : { details }),
    },
  };
}

function invalidInput(fieldErrors: Record<string, string>) {
  return savedKundliFailure(
    "INVALID_BIRTH_INPUT",
    "Saved kundli input is invalid. Review the highlighted fields.",
    { fieldErrors }
  );
}

function readOptionalText(value: unknown) {
  if (value === null) {
    return null;
  }

  return typeof value === "string" ? value.trim() : undefined;
}

function isValidDateOfBirth(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (year < 1800) {
    return false;
  }

  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return false;
  }

  return parsed.getTime() <= Date.now();
}

function isValidTimeOfBirth(value: string) {
  const match = value.match(/^(\d{2}):(\d{2})$/);

  if (!match) {
    return false;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}

function isValidTimeZone(value: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

function readCoordinate(value: unknown, min: number, max: number) {
  if (value === null) {
    return { provided: true as const, value: null };
  }

  if (value === undefined) {
    return { provided: false as const, value: null };
  }

  if (typeof value !== "number" || !Number.isFinite(value)) {
    return { provided: true as const, value: undefined };
  }

  if (value < min || value > max) {
    return { provided: true as const, value: undefined };
  }

  return { provided: true as const, value };
}

export function validateSavedKundliWriteInput(
  payload: Record<string, unknown>,
  mode: "create" | "update"
): SavedKundliServiceResult<ValidatedSavedKundliWriteInput> {
  const fieldErrors: Record<string, string> = {};
  const input: ValidatedSavedKundliWriteInput = {};

  const label = readOptionalText(payload.label);

  if (label !== undefined) {
    if (label === null || !label || label.length > 80) {
      fieldErrors.label = "Label is required and must be 1-80 characters.";
    } else {
      input.label = label;
    }
  } else if (mode === "create") {
    fieldErrors.label = "Label is required.";
  }

  if (payload.gender !== undefined) {
    if (payload.gender === null) {
      input.gender = null;
    } else if (
      typeof payload.gender === "string" &&
      (savedKundliGenders as readonly string[]).includes(payload.gender)
    ) {
      input.gender = payload.gender as SavedKundliGender;
    } else {
      fieldErrors.gender = "Gender must be female, male, or other.";
    }
  }

  const dateOfBirth = readOptionalText(payload.dateOfBirth);

  if (dateOfBirth !== undefined) {
    if (!dateOfBirth || !isValidDateOfBirth(dateOfBirth)) {
      fieldErrors.dateOfBirth =
        "Date of birth must be a valid past date in YYYY-MM-DD format (year 1800 or later).";
    } else {
      input.dateOfBirth = dateOfBirth;
    }
  } else if (mode === "create") {
    fieldErrors.dateOfBirth = "Date of birth is required.";
  }

  if (payload.timeOfBirth !== undefined) {
    if (payload.timeOfBirth === null) {
      input.timeOfBirth = null;
    } else if (
      typeof payload.timeOfBirth === "string" &&
      isValidTimeOfBirth(payload.timeOfBirth.trim())
    ) {
      input.timeOfBirth = payload.timeOfBirth.trim();
    } else if (
      typeof payload.timeOfBirth === "string" &&
      !payload.timeOfBirth.trim()
    ) {
      input.timeOfBirth = null;
    } else {
      fieldErrors.timeOfBirth = "Time of birth must be HH:MM (24-hour) or null.";
    }
  }

  const birthPlace = readOptionalText(payload.birthPlace);

  if (birthPlace !== undefined) {
    if (!birthPlace || birthPlace.length < 2 || birthPlace.length > 160) {
      fieldErrors.birthPlace = "Birth place must be 2-160 characters.";
    } else {
      input.birthPlace = birthPlace;
    }
  } else if (mode === "create") {
    fieldErrors.birthPlace = "Birth place is required.";
  }

  const latitude = readCoordinate(payload.latitude, -90, 90);
  const longitude = readCoordinate(payload.longitude, -180, 180);

  if (latitude.provided && latitude.value === undefined) {
    fieldErrors.latitude = "Latitude must be a number between -90 and 90.";
  }

  if (longitude.provided && longitude.value === undefined) {
    fieldErrors.longitude = "Longitude must be a number between -180 and 180.";
  }

  const timezone = readOptionalText(payload.timezone);

  if (timezone !== undefined && timezone !== null) {
    if (!timezone || timezone.length > 120 || !isValidTimeZone(timezone)) {
      fieldErrors.timezone = "Timezone must be a valid IANA timezone name.";
    }
  }

  const manualParts = [
    latitude.provided && latitude.value !== null,
    longitude.provided && longitude.value !== null,
    timezone !== undefined && timezone !== null && Boolean(timezone),
  ];
  const manualCount = manualParts.filter(Boolean).length;

  if (manualCount > 0 && manualCount < 3) {
    fieldErrors.coordinates =
      "Manual latitude, longitude, and timezone must be provided together or not at all.";
  }

  if (latitude.provided) {
    input.latitude = latitude.value === undefined ? null : latitude.value;
  }

  if (longitude.provided) {
    input.longitude = longitude.value === undefined ? null : longitude.value;
  }

  if (timezone !== undefined) {
    input.timezone = timezone;
  }

  const notes = readOptionalText(payload.notes);

  if (notes !== undefined) {
    if (notes !== null && notes.length > 500) {
      fieldErrors.notes = "Notes must be 500 characters or fewer.";
    } else {
      input.notes = notes;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return invalidInput(fieldErrors);
  }

  return {
    success: true,
    data: input,
  };
}

export function invalidSavedKundliInput(fieldErrors: Record<string, string>) {
  return invalidInput(fieldErrors);
}

export function parseManualPlaceText(birthPlace: string) {
  const parts = birthPlace
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return null;
  }

  if (parts.length === 1) {
    return { city: parts[0], region: null, country: parts[0] };
  }

  return {
    city: parts[0],
    region: parts.length > 2 ? parts.slice(1, -1).join(", ") : null,
    country: parts[parts.length - 1],
  };
}
