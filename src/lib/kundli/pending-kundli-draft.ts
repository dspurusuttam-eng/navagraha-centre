export const pendingKundliDraftKey = "navagraha:kundli:pending:v1";
export const pendingKundliClaimKey = "navagraha:kundli:claim:v1";
export const pendingKundliDraftLifetimeMs = 30 * 60 * 1_000;
const pendingKundliClaimLifetimeMs = 2 * 60 * 1_000;

export type KundliGender = "Male" | "Female";
export type KundliChartStyle = "North" | "South" | "East";
export type KundliLanguage = "EN" | "HI" | "AS";
export type KundliLocationSource = "browser" | "search" | "saved" | "manual";

export type KundliCanonicalLocation = {
  displayName: string;
  city: string | null;
  district: string | null;
  state: string | null;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  timezone: string;
  utcOffsetMinutes: number;
  localDateTime: string;
  utcDateTime: string;
  locationSource: KundliLocationSource;
  accuracyMeters: number | null;
  timezoneResolution: "coordinate" | "provider" | "manual";
};

export type KundliRequestPayload = {
  name: string;
  dateLocal: string;
  timeLocal: string;
  gender: KundliGender;
  chartStyle: KundliChartStyle;
  language: KundliLanguage;
  location: KundliCanonicalLocation;
};

export type PendingKundliDraft = {
  version: 1;
  createdAt: string;
  expiresAt: string;
  intent: "generate-kundli";
  payload: KundliRequestPayload;
  requestId: string;
};

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

type DraftReadResult =
  | { status: "ready"; draft: PendingKundliDraft }
  | { status: "missing" }
  | { status: "expired" }
  | { status: "invalid" };

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const requestIdPattern = /^[A-Za-z0-9_-]{8,128}$/;

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isValidDate(value: string) {
  if (!datePattern.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isValidTimezone(value: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

function isValidIsoDateTime(value: string) {
  return Boolean(value) && Number.isFinite(Date.parse(value));
}

function hasMatchingUtcMoment(input: {
  dateLocal: string;
  timeLocal: string;
  utcOffsetMinutes: number;
  utcDateTime: string;
}) {
  const [year, month, day] = input.dateLocal.split("-").map(Number);
  const [hour, minute] = input.timeLocal.split(":").map(Number);
  const expectedUtc =
    Date.UTC(year, month - 1, day, hour, minute) -
    input.utcOffsetMinutes * 60_000;
  const actualUtc = Date.parse(input.utcDateTime);

  return Math.abs(expectedUtc - actualUtc) < 60_000;
}

function isAllowedValue<T extends string>(
  value: unknown,
  values: readonly T[]
): value is T {
  return typeof value === "string" && values.includes(value as T);
}

export function validateKundliRequestPayload(
  value: unknown
): value is KundliRequestPayload {
  if (!isObject(value) || !isObject(value.location)) {
    return false;
  }

  const location = value.location;
  const name = typeof value.name === "string" ? value.name.trim() : "";
  const dateLocal = typeof value.dateLocal === "string" ? value.dateLocal : "";
  const timeLocal = typeof value.timeLocal === "string" ? value.timeLocal : "";
  const displayName =
    typeof location.displayName === "string" ? location.displayName.trim() : "";
  const country =
    typeof location.country === "string" ? location.country.trim() : "";
  const timezone =
    typeof location.timezone === "string" ? location.timezone.trim() : "";

  if (
    !name ||
    name.length > 120 ||
    !isValidDate(dateLocal) ||
    !timePattern.test(timeLocal) ||
    !isAllowedValue(value.gender, ["Male", "Female"] as const) ||
    !isAllowedValue(value.chartStyle, ["North", "South", "East"] as const) ||
    !isAllowedValue(value.language, ["EN", "HI", "AS"] as const) ||
    !displayName ||
    !country ||
    !isFiniteNumber(location.latitude) ||
    location.latitude < -90 ||
    location.latitude > 90 ||
    !isFiniteNumber(location.longitude) ||
    location.longitude < -180 ||
    location.longitude > 180 ||
    !isValidTimezone(timezone) ||
    !isFiniteNumber(location.utcOffsetMinutes) ||
    !Number.isInteger(location.utcOffsetMinutes) ||
    location.utcOffsetMinutes < -14 * 60 ||
    location.utcOffsetMinutes > 14 * 60 ||
    !isValidIsoDateTime(String(location.localDateTime ?? "")) ||
    !isValidIsoDateTime(String(location.utcDateTime ?? "")) ||
    !String(location.localDateTime).startsWith(`${dateLocal}T${timeLocal}`) ||
    !hasMatchingUtcMoment({
      dateLocal,
      timeLocal,
      utcOffsetMinutes: Number(location.utcOffsetMinutes),
      utcDateTime: String(location.utcDateTime),
    }) ||
    !isAllowedValue(location.locationSource, [
      "browser",
      "search",
      "saved",
      "manual",
    ] as const) ||
    !isAllowedValue(location.timezoneResolution, [
      "coordinate",
      "provider",
      "manual",
    ] as const)
  ) {
    return false;
  }

  const nullableTextFields = ["city", "district", "state"] as const;
  if (
    nullableTextFields.some(
      (field) => location[field] !== null && typeof location[field] !== "string"
    ) ||
    typeof location.countryCode !== "string" ||
    (location.accuracyMeters !== null &&
      (!isFiniteNumber(location.accuracyMeters) || location.accuracyMeters < 0))
  ) {
    return false;
  }

  return true;
}

export function createPendingKundliDraft(
  payload: KundliRequestPayload,
  options: { now?: number; requestId?: string } = {}
): PendingKundliDraft {
  if (!validateKundliRequestPayload(payload)) {
    throw new Error("Kundli birth details are incomplete or invalid.");
  }

  const now = options.now ?? Date.now();
  const requestId = options.requestId ?? crypto.randomUUID();

  if (!requestIdPattern.test(requestId)) {
    throw new Error("Kundli request identifier is invalid.");
  }

  return {
    version: 1,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + pendingKundliDraftLifetimeMs).toISOString(),
    intent: "generate-kundli",
    payload,
    requestId,
  };
}

export function validatePendingKundliDraft(
  value: unknown,
  now = Date.now()
): DraftReadResult {
  if (
    !isObject(value) ||
    value.version !== 1 ||
    value.intent !== "generate-kundli" ||
    typeof value.createdAt !== "string" ||
    typeof value.expiresAt !== "string" ||
    typeof value.requestId !== "string" ||
    !requestIdPattern.test(value.requestId) ||
    !validateKundliRequestPayload(value.payload)
  ) {
    return { status: "invalid" };
  }

  const createdAt = Date.parse(value.createdAt);
  const expiresAt = Date.parse(value.expiresAt);
  if (
    !Number.isFinite(createdAt) ||
    !Number.isFinite(expiresAt) ||
    expiresAt <= createdAt ||
    expiresAt - createdAt > pendingKundliDraftLifetimeMs ||
    createdAt > now + 60_000
  ) {
    return { status: "invalid" };
  }

  if (expiresAt <= now) {
    return { status: "expired" };
  }

  return { status: "ready", draft: value as PendingKundliDraft };
}

export function storePendingKundliDraft(
  storage: StorageLike,
  draft: PendingKundliDraft
) {
  storage.setItem(pendingKundliDraftKey, JSON.stringify(draft));
}

export function readPendingKundliDraft(
  storage: StorageLike,
  now = Date.now()
): DraftReadResult {
  const serialized = storage.getItem(pendingKundliDraftKey);
  if (!serialized) {
    return { status: "missing" };
  }

  try {
    return validatePendingKundliDraft(JSON.parse(serialized), now);
  } catch {
    return { status: "invalid" };
  }
}

export function clearPendingKundliDraft(storage: StorageLike) {
  storage.removeItem(pendingKundliDraftKey);
  storage.removeItem(pendingKundliClaimKey);
}

export function claimPendingKundliRequest(
  storage: StorageLike,
  requestId: string,
  now = Date.now()
) {
  const existing = storage.getItem(pendingKundliClaimKey);
  if (existing) {
    try {
      const parsed = JSON.parse(existing) as { requestId?: unknown; claimedAt?: unknown };
      if (
        parsed.requestId === requestId &&
        typeof parsed.claimedAt === "number" &&
        now - parsed.claimedAt < pendingKundliClaimLifetimeMs
      ) {
        return false;
      }
    } catch {
      // A malformed claim is safe to replace with the current request claim.
    }
  }

  storage.setItem(
    pendingKundliClaimKey,
    JSON.stringify({ requestId, claimedAt: now })
  );
  return true;
}

export function releasePendingKundliRequest(storage: StorageLike) {
  storage.removeItem(pendingKundliClaimKey);
}

export function isSafeSameOriginCallback(value: string) {
  return value.startsWith("/") && !value.startsWith("//") && !value.includes("\\");
}

export function buildKundliSignInHref(input: {
  signInPath?: string;
  callbackPath?: string;
} = {}) {
  const signInPath = input.signInPath ?? "/sign-in";
  const callbackPath = input.callbackPath ?? "/kundli?resume=1";

  if (
    !isSafeSameOriginCallback(signInPath) ||
    !isSafeSameOriginCallback(callbackPath)
  ) {
    throw new Error("Kundli sign-in callback must remain same-origin.");
  }

  const separator = signInPath.includes("?") ? "&" : "?";
  return `${signInPath}${separator}intent=generate-kundli&next=${encodeURIComponent(callbackPath)}`;
}

export function resolveKundliGenerateAction(input: {
  isAuthenticated: boolean;
  hasValidPayload: boolean;
  hasSessionStorage: boolean;
}) {
  if (!input.hasValidPayload) {
    return "validation-error" as const;
  }
  if (input.isAuthenticated) {
    return "generate" as const;
  }
  if (!input.hasSessionStorage) {
    return "storage-error" as const;
  }

  return "sign-in" as const;
}
