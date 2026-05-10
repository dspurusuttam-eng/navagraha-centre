import { rashifalSigns } from "@/modules/rashifal/content";

type RashifalSlug = (typeof rashifalSigns)[number]["slug"];

export type RetentionSurfaceKey =
  | "dashboard"
  | "daily-rashifal"
  | "rashifal"
  | "panchang"
  | "from-the-desk"
  | "articles"
  | "consultation"
  | "reports"
  | "kundli"
  | "ai";

export type RetentionPreferenceSnapshot = {
  preferredSignSlug: string | null;
  lastVisitedSignSlug: string | null;
  lastSection: RetentionSurfaceKey | null;
  updatedAtUtc: string | null;
};

const retentionPreferenceStorageKey = "navagraha:retention-preferences:v1";

const rashifalSlugSet = new Set(rashifalSigns.map((sign) => sign.slug));

function normalizeSection(value: string | null | undefined): RetentionSurfaceKey | null {
  const normalized = value?.trim();

  if (!normalized) {
    return null;
  }

  const allowedValues: RetentionSurfaceKey[] = [
    "dashboard",
    "daily-rashifal",
    "rashifal",
    "panchang",
    "from-the-desk",
    "articles",
    "consultation",
    "reports",
    "kundli",
    "ai",
  ];

  return allowedValues.includes(normalized as RetentionSurfaceKey)
    ? (normalized as RetentionSurfaceKey)
    : null;
}

export function isKnownRetentionSignSlug(
  value: string | null | undefined
): value is RashifalSlug {
  if (!value) {
    return false;
  }

  return rashifalSlugSet.has(value as RashifalSlug);
}

export function getRetentionSignLabel(value: string | null | undefined) {
  if (!isKnownRetentionSignSlug(value)) {
    return null;
  }

  return rashifalSigns.find((sign) => sign.slug === value)?.name ?? null;
}

export function readRetentionPreferenceSnapshot(): RetentionPreferenceSnapshot | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(retentionPreferenceStorageKey);

    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue) as Partial<RetentionPreferenceSnapshot>;

    return {
      preferredSignSlug: isKnownRetentionSignSlug(parsed.preferredSignSlug)
        ? parsed.preferredSignSlug ?? null
        : null,
      lastVisitedSignSlug: isKnownRetentionSignSlug(parsed.lastVisitedSignSlug)
        ? parsed.lastVisitedSignSlug ?? null
        : null,
      lastSection: normalizeSection(parsed.lastSection),
      updatedAtUtc:
        typeof parsed.updatedAtUtc === "string" && parsed.updatedAtUtc.trim()
          ? parsed.updatedAtUtc
          : null,
    };
  } catch {
    return null;
  }
}

export function writeRetentionPreferenceSnapshot(
  input: Partial<RetentionPreferenceSnapshot>
) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const existing = readRetentionPreferenceSnapshot();
    const nextValue: RetentionPreferenceSnapshot = {
      preferredSignSlug: isKnownRetentionSignSlug(input.preferredSignSlug)
        ? input.preferredSignSlug ?? null
        : existing?.preferredSignSlug ?? null,
      lastVisitedSignSlug: isKnownRetentionSignSlug(input.lastVisitedSignSlug)
        ? input.lastVisitedSignSlug ?? null
        : existing?.lastVisitedSignSlug ?? null,
      lastSection: normalizeSection(input.lastSection) ?? existing?.lastSection ?? null,
      updatedAtUtc: new Date().toISOString(),
    };

    window.localStorage.setItem(
      retentionPreferenceStorageKey,
      JSON.stringify(nextValue)
    );

    return nextValue;
  } catch {
    return null;
  }
}
