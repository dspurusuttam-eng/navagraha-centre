export const consentStorageVersion = 1 as const;
export const consentCookieName = "navagraha_consent_preferences";

export type ConsentCategoryKey =
  | "necessary"
  | "analytics"
  | "advertising"
  | "personalization";

export type ConsentPreferences = {
  version: typeof consentStorageVersion;
  necessary: true;
  analytics: boolean;
  advertising: boolean;
  personalization: boolean;
  updatedAtUtc: string | null;
};

export type ConsentPreferencePatch = Partial<
  Pick<ConsentPreferences, "analytics" | "advertising" | "personalization">
>;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toBoolean(value: unknown, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    if (value === 1) {
      return true;
    }

    if (value === 0) {
      return false;
    }
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (["true", "1", "yes", "on"].includes(normalized)) {
      return true;
    }

    if (["false", "0", "no", "off"].includes(normalized)) {
      return false;
    }
  }

  return fallback;
}

function toTimestamp(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function getDefaultConsentPreferences(): ConsentPreferences {
  return {
    version: consentStorageVersion,
    necessary: true,
    analytics: false,
    advertising: false,
    personalization: false,
    updatedAtUtc: null,
  };
}

export function normalizeConsentPreferences(
  value: unknown
): ConsentPreferences {
  const fallback = getDefaultConsentPreferences();

  if (!isPlainObject(value)) {
    return fallback;
  }

  const version =
    typeof value.version === "number" && Number.isFinite(value.version)
      ? value.version
      : fallback.version;

  if (version !== consentStorageVersion) {
    return {
      ...fallback,
      updatedAtUtc: toTimestamp(value.updatedAtUtc),
    };
  }

  return {
    version: consentStorageVersion,
    necessary: true,
    analytics: toBoolean(value.analytics, fallback.analytics),
    advertising: toBoolean(value.advertising, fallback.advertising),
    personalization: toBoolean(value.personalization, fallback.personalization),
    updatedAtUtc: toTimestamp(value.updatedAtUtc),
  };
}

export function applyConsentPatch(
  existing: ConsentPreferences,
  patch: ConsentPreferencePatch
) {
  return {
    version: consentStorageVersion,
    necessary: true,
    analytics:
      typeof patch.analytics === "boolean"
        ? patch.analytics
        : existing.analytics,
    advertising:
      typeof patch.advertising === "boolean"
        ? patch.advertising
        : existing.advertising,
    personalization:
      typeof patch.personalization === "boolean"
        ? patch.personalization
        : existing.personalization,
    updatedAtUtc: new Date().toISOString(),
  } satisfies ConsentPreferences;
}

export function stampConsentPreferences(
  preferences: ConsentPreferences,
  updatedAtUtc = new Date().toISOString()
) {
  return {
    ...preferences,
    updatedAtUtc,
  } satisfies ConsentPreferences;
}

export function serializeConsentPreferences(preferences: ConsentPreferences) {
  return encodeURIComponent(JSON.stringify(preferences));
}

export function deserializeConsentPreferences(rawValue: string | null) {
  if (!rawValue) {
    return getDefaultConsentPreferences();
  }

  try {
    const decoded = decodeURIComponent(rawValue);
    const parsed = JSON.parse(decoded);

    return normalizeConsentPreferences(parsed);
  } catch {
    return getDefaultConsentPreferences();
  }
}

export function hasAnalyticsConsent(
  preferences: ConsentPreferences = getDefaultConsentPreferences()
) {
  return Boolean(preferences.analytics);
}

export function hasAdvertisingConsent(
  preferences: ConsentPreferences = getDefaultConsentPreferences()
) {
  return Boolean(preferences.advertising);
}

export function hasPersonalizationConsent(
  preferences: ConsentPreferences = getDefaultConsentPreferences()
) {
  return Boolean(preferences.personalization);
}

export function canLoadExternalAnalytics(
  preferences: ConsentPreferences = getDefaultConsentPreferences()
) {
  return hasAnalyticsConsent(preferences);
}

export function canLoadAds(
  preferences: ConsentPreferences = getDefaultConsentPreferences()
) {
  return hasAdvertisingConsent(preferences);
}

export function canPersonalizeExperience(
  preferences: ConsentPreferences = getDefaultConsentPreferences()
) {
  return hasPersonalizationConsent(preferences);
}
