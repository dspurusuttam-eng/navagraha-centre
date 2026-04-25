import "server-only";

import type { NormalizedBirthContextInput } from "@/lib/astrology/birth-input-normalizer";

const OPENCAGE_GEOCODING_ENDPOINT =
  "https://api.opencagedata.com/geocode/v1/json";
const OPEN_METEO_GEOCODING_ENDPOINT =
  "https://geocoding-api.open-meteo.com/v1/search";
const REQUEST_TIMEOUT_MS = 8_000;
const DEFAULT_GEOCODING_PROVIDER = "open-meteo";

type BirthContextLocationConfidence = "high" | "moderate" | "low";
type GeocodingProvider = "opencage" | "open-meteo";

type OpenCageResult = {
  formatted: string;
  confidence?: number;
  geometry: {
    lat: number;
    lng: number;
  };
  components: {
    country?: string;
    country_code?: string;
    state?: string;
    city?: string;
    town?: string;
    village?: string;
    county?: string;
  };
  annotations?: {
    timezone?: {
      name?: string;
    };
  };
};

type OpenCageResponse = {
  results: OpenCageResult[];
  status?: {
    code?: number;
    message?: string;
  };
};

type OpenMeteoResult = {
  name?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  country?: string;
  country_code?: string;
  admin1?: string;
  admin2?: string;
  admin3?: string;
  feature_code?: string;
  population?: number;
};

type OpenMeteoResponse = {
  results?: OpenMeteoResult[];
};

type BirthContextResolutionStage = "config" | "place" | "timezone" | "utc";

type BirthContextResolutionCode =
  | "UNSUPPORTED_GEOCODING_PROVIDER"
  | "MISSING_GEOCODING_API_KEY"
  | "PLACE_NOT_FOUND"
  | "PLACE_AMBIGUOUS"
  | "PLACE_PROVIDER_ERROR"
  | "TIMEZONE_NOT_FOUND"
  | "TIMEZONE_PROVIDER_ERROR"
  | "INVALID_TIMEZONE"
  | "UTC_CONVERSION_FAILED";

export type ResolvedBirthPlace = {
  display_name: string;
  latitude: number;
  longitude: number;
  country_code: string;
  country_name: string;
  region: string | null;
  city: string | null;
};

export type ResolvedBirthTimezone = {
  iana: string;
  utc_offset_at_birth: string;
};

export type AstronomyReadyBirthContext = {
  birth_input: NormalizedBirthContextInput;
  normalized_place: ResolvedBirthPlace;
  timezone: ResolvedBirthTimezone;
  birth_utc: string;
  quality: {
    location_confidence: BirthContextLocationConfidence;
    normalization_status: "ok";
  };
};

export type BirthContextResolutionIssue = {
  stage: BirthContextResolutionStage;
  code: BirthContextResolutionCode;
  message: string;
};

export type BirthContextResolutionResult =
  | {
      success: true;
      data: AstronomyReadyBirthContext;
    }
  | {
      success: false;
      issue: BirthContextResolutionIssue;
      partial: {
        birth_input: NormalizedBirthContextInput;
        normalized_place: ResolvedBirthPlace | null;
        timezone: ResolvedBirthTimezone | null;
      };
    };

type PlaceResolutionData = {
  place: ResolvedBirthPlace;
  timezoneIana: string | null;
  locationConfidence: BirthContextLocationConfidence;
};

type TimezoneResolutionData = ResolvedBirthTimezone;

const placeResolutionCache = new Map<string, PlaceResolutionData>();
const timezoneResolutionCache = new Map<string, TimezoneResolutionData>();

function getGeocodingProvider() {
  return (
    process.env.GEOCODING_PROVIDER?.trim().toLowerCase() ??
    DEFAULT_GEOCODING_PROVIDER
  );
}

function isSupportedGeocodingProvider(
  provider: string
): provider is GeocodingProvider {
  return provider === "opencage" || provider === "open-meteo";
}

function getGeocodingApiKey() {
  return (
    process.env.GEOCODING_API_KEY?.trim() ??
    process.env.OPENCAGE_API_KEY?.trim() ??
    ""
  );
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

function mapLocationConfidenceFromOpenCage(
  result: OpenCageResult
): BirthContextLocationConfidence {
  const confidence = result.confidence ?? 0;

  if (confidence >= 8) {
    return "high";
  }

  if (confidence >= 5) {
    return "moderate";
  }

  return "low";
}

function buildCanonicalBirthPlaceFromOpenCage(result: OpenCageResult): {
  place: ResolvedBirthPlace;
  timezoneIana: string | null;
} | null {
  const components = result.components;
  const countryCode = components.country_code?.toUpperCase() ?? "";
  const countryName = components.country ?? "";
  const region = components.state ?? null;
  const city =
    components.city ??
    components.town ??
    components.village ??
    components.county ??
    null;
  const latitude = result.geometry.lat;
  const longitude = result.geometry.lng;

  if (
    !countryCode ||
    !countryName ||
    !isValidLatitude(latitude) ||
    !isValidLongitude(longitude)
  ) {
    return null;
  }

  return {
    place: {
      display_name: result.formatted,
      latitude,
      longitude,
      country_code: countryCode,
      country_name: countryName,
      region,
      city,
    },
    timezoneIana: result.annotations?.timezone?.name?.trim() || null,
  };
}

function isOpenCagePlaceAmbiguous(query: string, results: OpenCageResult[]): boolean {
  if (results.length < 2) {
    return false;
  }

  const queryIncludesCountryHint = query.toLowerCase().split(",").length >= 2;

  if (queryIncludesCountryHint) {
    return false;
  }

  const first = buildCanonicalBirthPlaceFromOpenCage(results[0]);
  const second = buildCanonicalBirthPlaceFromOpenCage(results[1]);

  if (!first || !second) {
    return true;
  }

  return (
    first.place.country_code !== second.place.country_code ||
    first.place.region !== second.place.region
  );
}

function mapLocationConfidenceFromOpenMeteo(
  result: OpenMeteoResult
): BirthContextLocationConfidence {
  const featureCode = result.feature_code?.toUpperCase() ?? "";
  const population = typeof result.population === "number" ? result.population : 0;

  if (
    (featureCode === "PPLC" || featureCode === "PPLA" || featureCode === "PPL") &&
    population >= 100_000
  ) {
    return "high";
  }

  if (featureCode.startsWith("PPL") || population >= 10_000) {
    return "moderate";
  }

  return "low";
}

function buildCanonicalBirthPlaceFromOpenMeteo(result: OpenMeteoResult): {
  place: ResolvedBirthPlace;
  timezoneIana: string | null;
} | null {
  const countryCode = result.country_code?.trim().toUpperCase() ?? "";
  const countryName = result.country?.trim() || countryCode;
  const city =
    result.name?.trim() ||
    result.admin2?.trim() ||
    result.admin3?.trim() ||
    null;
  const region = result.admin1?.trim() || null;
  const latitude = result.latitude;
  const longitude = result.longitude;
  const displayParts = [city, region, countryName].filter(
    (part): part is string => Boolean(part)
  );

  if (
    !countryCode ||
    !countryName ||
    displayParts.length === 0 ||
    !isValidLatitude(latitude) ||
    !isValidLongitude(longitude)
  ) {
    return null;
  }

  return {
    place: {
      display_name: displayParts.join(", "),
      latitude,
      longitude,
      country_code: countryCode,
      country_name: countryName,
      region,
      city,
    },
    timezoneIana: result.timezone?.trim() || null,
  };
}

function isOpenMeteoPlaceAmbiguous(query: string, results: OpenMeteoResult[]): boolean {
  if (results.length < 2) {
    return false;
  }

  const queryIncludesCountryHint = query.toLowerCase().split(",").length >= 2;

  if (queryIncludesCountryHint) {
    return false;
  }

  const first = buildCanonicalBirthPlaceFromOpenMeteo(results[0]);
  const second = buildCanonicalBirthPlaceFromOpenMeteo(results[1]);

  if (!first || !second) {
    return true;
  }

  return (
    first.place.country_code !== second.place.country_code ||
    first.place.region !== second.place.region
  );
}

function issue(
  stage: BirthContextResolutionStage,
  code: BirthContextResolutionCode,
  message: string
): BirthContextResolutionIssue {
  return { stage, code, message };
}

function buildPlaceProviderError(
  statusCode: number | undefined,
  fallbackMessage: string
) {
  if (statusCode === 402 || statusCode === 429) {
    return issue(
      "place",
      "PLACE_PROVIDER_ERROR",
      "Birthplace lookup is temporarily unavailable due to geocoding rate limits. Please try again shortly."
    );
  }

  return issue("place", "PLACE_PROVIDER_ERROR", fallbackMessage);
}

async function fetchJsonWithTimeout<T>(url: URL): Promise<T> {
  const abortController = new AbortController();
  const timeoutHandle = setTimeout(
    () => abortController.abort(),
    REQUEST_TIMEOUT_MS
  );

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: abortController.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP_${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeoutHandle);
  }
}

async function resolvePlaceWithOpenCage(
  placeQueryNormalized: string,
  apiKey: string
): Promise<
  | {
      success: true;
      data: PlaceResolutionData;
    }
  | {
      success: false;
      issue: BirthContextResolutionIssue;
    }
> {
  const cacheKey = `opencage:${placeQueryNormalized.toLowerCase()}`;
  const cached = placeResolutionCache.get(cacheKey);

  if (cached) {
    return { success: true, data: cached };
  }

  const url = new URL(OPENCAGE_GEOCODING_ENDPOINT);
  url.searchParams.set("q", placeQueryNormalized);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("limit", "5");
  url.searchParams.set("language", "en");
  url.searchParams.set("no_annotations", "0");

  let payload: OpenCageResponse;

  try {
    payload = await fetchJsonWithTimeout<OpenCageResponse>(url);
  } catch (error) {
    const statusMatch =
      error instanceof Error ? error.message.match(/^HTTP_(\d+)$/) : null;
    const statusCode = statusMatch ? Number(statusMatch[1]) : undefined;

    return {
      success: false,
      issue: buildPlaceProviderError(
        statusCode,
        error instanceof Error
          ? `Birth place lookup failed: ${error.message}`
          : "Birth place lookup failed due to an unknown geocoding provider error."
      ),
    };
  }

  if ((payload.status?.code ?? 200) >= 400) {
    const statusCode = payload.status?.code;

    return {
      success: false,
      issue: buildPlaceProviderError(
        statusCode,
        payload.status?.message ||
          `Birth place lookup returned provider status: ${statusCode ?? "UNKNOWN"}.`
      ),
    };
  }

  if (!Array.isArray(payload.results) || payload.results.length === 0) {
    return {
      success: false,
      issue: issue(
        "place",
        "PLACE_NOT_FOUND",
        "Birth place could not be resolved. Please enter a more specific city/region/country."
      ),
    };
  }

  if (isOpenCagePlaceAmbiguous(placeQueryNormalized, payload.results)) {
    return {
      success: false,
      issue: issue(
        "place",
        "PLACE_AMBIGUOUS",
        "Birth place is ambiguous. Please include region/state and country for precise resolution."
      ),
    };
  }

  const selected = buildCanonicalBirthPlaceFromOpenCage(payload.results[0]);

  if (!selected) {
    return {
      success: false,
      issue: issue(
        "place",
        "PLACE_PROVIDER_ERROR",
        "Birth place provider returned incomplete coordinate data. Please try a more explicit location."
      ),
    };
  }

  const locationConfidenceRaw = mapLocationConfidenceFromOpenCage(
    payload.results[0]
  );
  const locationConfidence =
    locationConfidenceRaw === "low" ? "moderate" : locationConfidenceRaw;

  const resolved = {
    place: selected.place,
    timezoneIana: selected.timezoneIana,
    locationConfidence,
  };

  placeResolutionCache.set(cacheKey, resolved);

  return {
    success: true,
    data: resolved,
  };
}

async function resolvePlaceWithOpenMeteo(
  placeQueryNormalized: string
): Promise<
  | {
      success: true;
      data: PlaceResolutionData;
    }
  | {
      success: false;
      issue: BirthContextResolutionIssue;
    }
> {
  const cacheKey = `open-meteo:${placeQueryNormalized.toLowerCase()}`;
  const cached = placeResolutionCache.get(cacheKey);

  if (cached) {
    return { success: true, data: cached };
  }

  const url = new URL(OPEN_METEO_GEOCODING_ENDPOINT);
  url.searchParams.set("name", placeQueryNormalized);
  url.searchParams.set("count", "5");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  let payload: OpenMeteoResponse;

  try {
    payload = await fetchJsonWithTimeout<OpenMeteoResponse>(url);
  } catch (error) {
    const statusMatch =
      error instanceof Error ? error.message.match(/^HTTP_(\d+)$/) : null;
    const statusCode = statusMatch ? Number(statusMatch[1]) : undefined;

    return {
      success: false,
      issue: buildPlaceProviderError(
        statusCode,
        error instanceof Error
          ? `Birth place lookup failed: ${error.message}`
          : "Birth place lookup failed due to an unknown geocoding provider error."
      ),
    };
  }

  if (!Array.isArray(payload.results) || payload.results.length === 0) {
    return {
      success: false,
      issue: issue(
        "place",
        "PLACE_NOT_FOUND",
        "Birth place could not be resolved. Please enter a more specific city/region/country."
      ),
    };
  }

  if (isOpenMeteoPlaceAmbiguous(placeQueryNormalized, payload.results)) {
    return {
      success: false,
      issue: issue(
        "place",
        "PLACE_AMBIGUOUS",
        "Birth place is ambiguous. Please include region/state and country for precise resolution."
      ),
    };
  }

  const selected = buildCanonicalBirthPlaceFromOpenMeteo(payload.results[0]);

  if (!selected) {
    return {
      success: false,
      issue: issue(
        "place",
        "PLACE_PROVIDER_ERROR",
        "Birth place provider returned incomplete coordinate data. Please try a more explicit location."
      ),
    };
  }

  const locationConfidenceRaw = mapLocationConfidenceFromOpenMeteo(
    payload.results[0]
  );
  const locationConfidence =
    locationConfidenceRaw === "low" ? "moderate" : locationConfidenceRaw;

  const resolved = {
    place: selected.place,
    timezoneIana: selected.timezoneIana,
    locationConfidence,
  };

  placeResolutionCache.set(cacheKey, resolved);

  return {
    success: true,
    data: resolved,
  };
}

async function resolvePlace(
  placeQueryNormalized: string
): Promise<
  | {
      success: true;
      data: PlaceResolutionData;
    }
  | {
      success: false;
      issue: BirthContextResolutionIssue;
    }
> {
  const provider = getGeocodingProvider();
  const apiKey = getGeocodingApiKey();

  if (!isSupportedGeocodingProvider(provider)) {
    return {
      success: false,
      issue: issue(
        "config",
        "UNSUPPORTED_GEOCODING_PROVIDER",
        `Unsupported geocoding provider "${provider}". Set GEOCODING_PROVIDER to "opencage" or "open-meteo".`
      ),
    };
  }

  if (provider === "open-meteo") {
    return resolvePlaceWithOpenMeteo(placeQueryNormalized);
  }

  if (apiKey) {
    return resolvePlaceWithOpenCage(placeQueryNormalized, apiKey);
  }

  // Fallback keeps place-based calculators operational when OpenCage keys are missing.
  return resolvePlaceWithOpenMeteo(placeQueryNormalized);
}

async function resolveTimezoneAtBirth(input: {
  latitude: number;
  longitude: number;
  dateLocal: string;
  timeLocal: string;
  timezoneIanaFromPlace: string | null;
}): Promise<
  | {
      success: true;
      data: TimezoneResolutionData;
    }
  | {
      success: false;
      issue: BirthContextResolutionIssue;
    }
> {
  const cacheKey = `${input.latitude.toFixed(6)}:${input.longitude.toFixed(6)}:${input.dateLocal}:${input.timeLocal}`;
  const cached = timezoneResolutionCache.get(cacheKey);

  if (cached) {
    return { success: true, data: cached };
  }

  const timezoneIana = input.timezoneIanaFromPlace?.trim() ?? "";

  if (!timezoneIana) {
    return {
      success: false,
      issue: issue(
        "timezone",
        "TIMEZONE_NOT_FOUND",
        "Timezone could not be determined from resolved birth coordinates."
      ),
    };
  }

  if (!isValidTimeZone(timezoneIana)) {
    return {
      success: false,
      issue: issue(
        "timezone",
        "INVALID_TIMEZONE",
        "Geocoding provider returned an invalid timezone identifier for the resolved birthplace."
      ),
    };
  }

  let utcDate: Date;

  try {
    utcDate = convertLocalToUtcDate(input.dateLocal, input.timeLocal, timezoneIana);
  } catch (error) {
    return {
      success: false,
      issue: issue(
        "utc",
        "UTC_CONVERSION_FAILED",
        error instanceof Error
          ? `UTC conversion failed: ${error.message}`
          : "UTC conversion failed due to an unknown conversion error."
      ),
    };
  }

  const offsetMs = getTimeZoneOffsetMs(utcDate, timezoneIana);
  const resolved = {
    iana: timezoneIana,
    utc_offset_at_birth: formatUtcOffset(Math.round(offsetMs / 1000)),
  };

  timezoneResolutionCache.set(cacheKey, resolved);

  return {
    success: true,
    data: resolved,
  };
}

export async function resolveAstronomyReadyBirthContext(
  normalizedInput: NormalizedBirthContextInput
): Promise<BirthContextResolutionResult> {
  const placeResolution = await resolvePlace(
    normalizedInput.place_query_normalized
  );

  if (!placeResolution.success) {
    return {
      success: false,
      issue: placeResolution.issue,
      partial: {
        birth_input: normalizedInput,
        normalized_place: null,
        timezone: null,
      },
    };
  }

  const timezoneResolution = await resolveTimezoneAtBirth({
    latitude: placeResolution.data.place.latitude,
    longitude: placeResolution.data.place.longitude,
    dateLocal: normalizedInput.date_local_normalized,
    timeLocal: normalizedInput.time_local_normalized,
    timezoneIanaFromPlace: placeResolution.data.timezoneIana,
  });

  if (!timezoneResolution.success) {
    return {
      success: false,
      issue: timezoneResolution.issue,
      partial: {
        birth_input: normalizedInput,
        normalized_place: placeResolution.data.place,
        timezone: null,
      },
    };
  }

  let birthUtcIso: string;

  try {
    birthUtcIso = convertLocalToUtcDate(
      normalizedInput.date_local_normalized,
      normalizedInput.time_local_normalized,
      timezoneResolution.data.iana
    ).toISOString();
  } catch (error) {
    return {
      success: false,
      issue: issue(
        "utc",
        "UTC_CONVERSION_FAILED",
        error instanceof Error
          ? `UTC conversion failed: ${error.message}`
          : "UTC conversion failed due to an unknown conversion error."
      ),
      partial: {
        birth_input: normalizedInput,
        normalized_place: placeResolution.data.place,
        timezone: timezoneResolution.data,
      },
    };
  }

  return {
    success: true,
    data: {
      birth_input: normalizedInput,
      normalized_place: placeResolution.data.place,
      timezone: timezoneResolution.data,
      birth_utc: birthUtcIso,
      quality: {
        location_confidence: placeResolution.data.locationConfidence,
        normalization_status: "ok",
      },
    },
  };
}
