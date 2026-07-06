import { todayDecisionCategories } from "@/modules/astrology/today-decision";

export const decisionRecordStatuses = ["planned", "done", "skipped"] as const;
export type DecisionRecordStatusInput = (typeof decisionRecordStatuses)[number];

export const decisionRecordRatings = [
  "favourable",
  "mixed",
  "avoid_for_now",
  "consult_recommended",
] as const;
export type DecisionRecordRating = (typeof decisionRecordRatings)[number];

export type DecisionDeskErrorCode =
  | "INVALID_REQUEST"
  | "INVALID_INPUT"
  | "NOT_FOUND"
  | "EMPTY_UPDATE";

export type DecisionDeskValidationFailure = {
  ok: false;
  error: {
    code: DecisionDeskErrorCode;
    message: string;
    details?: unknown;
  };
};

export type DecisionDeskValidationSuccess<T> = {
  ok: true;
  data: T;
};

export type DecisionDeskValidationResult<T> =
  | DecisionDeskValidationSuccess<T>
  | DecisionDeskValidationFailure;

export function decisionDeskErrorStatus(code: DecisionDeskErrorCode) {
  switch (code) {
    case "INVALID_INPUT":
      return 422;
    case "NOT_FOUND":
      return 404;
    case "EMPTY_UPDATE":
    case "INVALID_REQUEST":
      return 400;
    default:
      return 500;
  }
}

export type DecisionRecordWriteInput = {
  title?: string;
  decisionCategory?: string;
  status?: DecisionRecordStatusInput;
  decisionRating?: DecisionRecordRating | null;
  date?: string;
  timezone?: string;
  latitude?: number | null;
  longitude?: number | null;
  locationLabel?: string | null;
  panchangSnapshot?: unknown;
  goodTimeBlocks?: unknown[];
  avoidTimeBlocks?: unknown[];
  horaAvailable?: boolean;
  userNote?: string | null;
  outcomeNote?: string | null;
  followUpDate?: string | null;
};

export type DecisionRecordListQuery = {
  page: number;
  pageSize: number;
  status: DecisionRecordStatusInput | null;
  decisionCategory: string | null;
};

const MAX_TITLE = 160;
const MAX_LABEL = 160;
const MAX_NOTE = 2000;
const MAX_SNAPSHOT_BYTES = 20_000;
const MAX_BLOCKS = 50;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

function invalid(fieldErrors: Record<string, string>): DecisionDeskValidationFailure {
  return {
    ok: false,
    error: {
      code: "INVALID_INPUT",
      message: "Decision desk record input is invalid. Review the highlighted fields.",
      details: { fieldErrors },
    },
  };
}

function readText(value: unknown) {
  if (value === null) {
    return null;
  }
  return typeof value === "string" ? value.trim() : undefined;
}

export function isValidDateString(value: string) {
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

function readCoordinate(value: unknown, min: number, max: number) {
  if (value === null) {
    return { provided: true as const, value: null };
  }
  if (value === undefined) {
    return { provided: false as const, value: null };
  }
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num) || num < min || num > max) {
    return { provided: true as const, value: undefined };
  }
  return { provided: true as const, value: num };
}

function byteLength(value: unknown) {
  try {
    return Buffer.byteLength(JSON.stringify(value) ?? "", "utf8");
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

export function validateDecisionRecordWriteInput(
  payload: Record<string, unknown>,
  mode: "create" | "update"
): DecisionDeskValidationResult<DecisionRecordWriteInput> {
  const fieldErrors: Record<string, string> = {};
  const input: DecisionRecordWriteInput = {};

  // title
  const title = readText(payload.title);
  if (title !== undefined) {
    if (!title || title === null || title.length > MAX_TITLE) {
      fieldErrors.title = `Title is required and must be 1-${MAX_TITLE} characters.`;
    } else {
      input.title = title;
    }
  } else if (mode === "create") {
    fieldErrors.title = "Title is required.";
  }

  // decisionCategory
  const category = readText(payload.decisionCategory);
  if (category !== undefined) {
    if (
      !category ||
      !(todayDecisionCategories as readonly string[]).includes(category)
    ) {
      fieldErrors.decisionCategory = `decisionCategory must be one of: ${todayDecisionCategories.join(", ")}.`;
    } else {
      input.decisionCategory = category;
    }
  } else if (mode === "create") {
    fieldErrors.decisionCategory = "decisionCategory is required.";
  }

  // status
  if (payload.status !== undefined) {
    const status = typeof payload.status === "string" ? payload.status.trim().toLowerCase() : "";
    if (!(decisionRecordStatuses as readonly string[]).includes(status)) {
      fieldErrors.status = `status must be one of: ${decisionRecordStatuses.join(", ")}.`;
    } else {
      input.status = status as DecisionRecordStatusInput;
    }
  }

  // decisionRating (optional, nullable)
  if (payload.decisionRating !== undefined) {
    if (payload.decisionRating === null) {
      input.decisionRating = null;
    } else {
      const rating =
        typeof payload.decisionRating === "string"
          ? payload.decisionRating.trim().toLowerCase()
          : "";
      if (!(decisionRecordRatings as readonly string[]).includes(rating)) {
        fieldErrors.decisionRating = `decisionRating must be one of: ${decisionRecordRatings.join(", ")}.`;
      } else {
        input.decisionRating = rating as DecisionRecordRating;
      }
    }
  }

  // date
  const date = readText(payload.date);
  if (date !== undefined) {
    if (!date || !isValidDateString(date)) {
      fieldErrors.date = "date must be a valid date in YYYY-MM-DD format.";
    } else {
      input.date = date;
    }
  } else if (mode === "create") {
    fieldErrors.date = "date is required.";
  }

  // timezone
  const timezone = readText(payload.timezone);
  if (timezone !== undefined) {
    if (!timezone || timezone.length > 120 || !isValidTimeZone(timezone)) {
      fieldErrors.timezone = "timezone must be a valid IANA timezone name.";
    } else {
      input.timezone = timezone;
    }
  } else if (mode === "create") {
    fieldErrors.timezone = "timezone is required.";
  }

  // latitude / longitude
  const latitude = readCoordinate(payload.latitude, -90, 90);
  const longitude = readCoordinate(payload.longitude, -180, 180);
  if (latitude.provided && latitude.value === undefined) {
    fieldErrors.latitude = "latitude must be a number between -90 and 90.";
  }
  if (longitude.provided && longitude.value === undefined) {
    fieldErrors.longitude = "longitude must be a number between -180 and 180.";
  }
  if (mode === "create") {
    if (!latitude.provided || latitude.value === null) {
      fieldErrors.latitude = fieldErrors.latitude ?? "latitude is required.";
    }
    if (!longitude.provided || longitude.value === null) {
      fieldErrors.longitude = fieldErrors.longitude ?? "longitude is required.";
    }
  }
  if (latitude.provided && latitude.value !== undefined) {
    input.latitude = latitude.value;
  }
  if (longitude.provided && longitude.value !== undefined) {
    input.longitude = longitude.value;
  }

  // locationLabel
  const locationLabel = readText(payload.locationLabel);
  if (locationLabel !== undefined) {
    if (locationLabel !== null && locationLabel.length > MAX_LABEL) {
      fieldErrors.locationLabel = `locationLabel must be ${MAX_LABEL} characters or fewer.`;
    } else {
      input.locationLabel = locationLabel;
    }
  }

  // panchangSnapshot (object, size-capped)
  if (payload.panchangSnapshot !== undefined) {
    const snap = payload.panchangSnapshot;
    if (snap === null) {
      input.panchangSnapshot = null;
    } else if (typeof snap !== "object" || Array.isArray(snap)) {
      fieldErrors.panchangSnapshot = "panchangSnapshot must be an object.";
    } else if (byteLength(snap) > MAX_SNAPSHOT_BYTES) {
      fieldErrors.panchangSnapshot = "panchangSnapshot is too large.";
    } else {
      input.panchangSnapshot = snap;
    }
  }

  // goodTimeBlocks / avoidTimeBlocks (arrays, capped)
  for (const key of ["goodTimeBlocks", "avoidTimeBlocks"] as const) {
    if (payload[key] !== undefined) {
      const value = payload[key];
      if (value === null) {
        input[key] = [];
      } else if (!Array.isArray(value)) {
        fieldErrors[key] = `${key} must be an array.`;
      } else if (value.length > MAX_BLOCKS) {
        fieldErrors[key] = `${key} must have at most ${MAX_BLOCKS} entries.`;
      } else if (byteLength(value) > MAX_SNAPSHOT_BYTES) {
        fieldErrors[key] = `${key} is too large.`;
      } else {
        input[key] = value;
      }
    }
  }

  // horaAvailable
  if (payload.horaAvailable !== undefined) {
    if (typeof payload.horaAvailable !== "boolean") {
      fieldErrors.horaAvailable = "horaAvailable must be a boolean.";
    } else {
      input.horaAvailable = payload.horaAvailable;
    }
  }

  // userNote / outcomeNote
  for (const key of ["userNote", "outcomeNote"] as const) {
    const note = readText(payload[key]);
    if (note !== undefined) {
      if (note !== null && note.length > MAX_NOTE) {
        fieldErrors[key] = `${key} must be ${MAX_NOTE} characters or fewer.`;
      } else {
        input[key] = note;
      }
    }
  }

  // followUpDate
  if (payload.followUpDate !== undefined) {
    if (payload.followUpDate === null || payload.followUpDate === "") {
      input.followUpDate = null;
    } else {
      const fu = readText(payload.followUpDate);
      if (!fu || !isValidDateString(fu)) {
        fieldErrors.followUpDate = "followUpDate must be a valid date in YYYY-MM-DD format.";
      } else {
        input.followUpDate = fu;
      }
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return invalid(fieldErrors);
  }

  return { ok: true, data: input };
}

export function validateDecisionRecordListQuery(
  params: URLSearchParams
): DecisionDeskValidationResult<DecisionRecordListQuery> {
  const fieldErrors: Record<string, string> = {};

  let page = 1;
  const pageRaw = params.get("page");
  if (pageRaw !== null && pageRaw !== "") {
    const parsed = Number(pageRaw);
    if (!Number.isInteger(parsed) || parsed < 1) {
      fieldErrors.page = "page must be a positive integer.";
    } else {
      page = parsed;
    }
  }

  let pageSize = DEFAULT_PAGE_SIZE;
  const sizeRaw = params.get("pageSize");
  if (sizeRaw !== null && sizeRaw !== "") {
    const parsed = Number(sizeRaw);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > MAX_PAGE_SIZE) {
      fieldErrors.pageSize = `pageSize must be an integer between 1 and ${MAX_PAGE_SIZE}.`;
    } else {
      pageSize = parsed;
    }
  }

  let status: DecisionRecordStatusInput | null = null;
  const statusRaw = params.get("status");
  if (statusRaw !== null && statusRaw !== "") {
    const normalized = statusRaw.trim().toLowerCase();
    if (!(decisionRecordStatuses as readonly string[]).includes(normalized)) {
      fieldErrors.status = `status filter must be one of: ${decisionRecordStatuses.join(", ")}.`;
    } else {
      status = normalized as DecisionRecordStatusInput;
    }
  }

  let decisionCategory: string | null = null;
  const catRaw = params.get("decisionCategory");
  if (catRaw !== null && catRaw !== "") {
    const normalized = catRaw.trim().toLowerCase();
    if (!(todayDecisionCategories as readonly string[]).includes(normalized)) {
      fieldErrors.decisionCategory = `decisionCategory filter must be one of: ${todayDecisionCategories.join(", ")}.`;
    } else {
      decisionCategory = normalized;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return invalid(fieldErrors);
  }

  return { ok: true, data: { page, pageSize, status, decisionCategory } };
}
