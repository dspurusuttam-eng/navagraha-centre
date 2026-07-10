import "server-only";

import type {
  LocationProvider,
  LocationSearchResult,
  LocationTimezoneIssue,
  LocationTimezoneResult,
  ProviderPlaceCandidate,
  TimezoneResolution,
} from "@/lib/location-timezone/types";

const OPENCAGE_ENDPOINT = "https://api.opencagedata.com/geocode/v1/json";
const OPEN_METEO_GEOCODING_ENDPOINT =
  "https://geocoding-api.open-meteo.com/v1/search";
const OPEN_METEO_FORECAST_ENDPOINT = "https://api.open-meteo.com/v1/forecast";
const NOMINATIM_REVERSE_ENDPOINT = "https://nominatim.openstreetmap.org/reverse";
const REQUEST_TIMEOUT_MS = 8_000;

type ProviderName = "opencage" | "open-meteo";

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
    state_district?: string;
    county?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
  };
  annotations?: {
    timezone?: {
      name?: string;
    };
  };
};

type OpenCageResponse = {
  results?: OpenCageResult[];
  status?: {
    code?: number;
    message?: string;
  };
};

type OpenMeteoResult = {
  id?: number;
  name?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  country?: string;
  country_code?: string;
  admin1?: string;
  admin2?: string;
  admin3?: string;
};

type OpenMeteoResponse = {
  results?: OpenMeteoResult[];
};

type NominatimResponse = {
  display_name?: string;
  lat?: string;
  lon?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state_district?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
};

type OpenMeteoTimezoneResponse = {
  timezone?: string;
  utc_offset_seconds?: number;
};

function readProviderName(): ProviderName {
  const provider = process.env.GEOCODING_PROVIDER?.trim().toLowerCase();

  return provider === "opencage" ? "opencage" : "open-meteo";
}

function readOpenCageKey() {
  return (
    process.env.GEOCODING_API_KEY?.trim() ??
    process.env.OPENCAGE_API_KEY?.trim() ??
    ""
  );
}

function issue(
  code: LocationTimezoneIssue["code"],
  message: string,
  details?: unknown
): LocationTimezoneResult<never> {
  return {
    success: false,
    issue: {
      code,
      message,
      ...(details === undefined ? {} : { details }),
    },
  };
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

function validateCoordinates(latitude: number, longitude: number) {
  if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
    return issue(
      "INVALID_COORDINATES",
      "Latitude must be between -90 and 90 and longitude must be between -180 and 180."
    );
  }

  return null;
}

async function fetchJsonWithTimeout<T>(
  url: URL,
  options: RequestInit = {}
): Promise<T> {
  const abortController = new AbortController();
  const timeoutHandle = setTimeout(
    () => abortController.abort(),
    REQUEST_TIMEOUT_MS
  );

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      ...options,
      signal: abortController.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP_${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("REQUEST_TIMEOUT");
    }

    throw error;
  } finally {
    clearTimeout(timeoutHandle);
  }
}

function normalizeDisplayName(parts: Array<string | null | undefined>) {
  return [...new Set(parts.map((part) => part?.trim()).filter(Boolean))].join(", ");
}

function buildOpenCageCandidate(
  result: OpenCageResult,
  index: number
): ProviderPlaceCandidate | null {
  const latitude = result.geometry.lat;
  const longitude = result.geometry.lng;
  const countryCode = result.components.country_code?.trim().toUpperCase() ?? "";
  const country = result.components.country?.trim() ?? "";
  const city =
    result.components.city?.trim() ||
    result.components.town?.trim() ||
    result.components.village?.trim() ||
    result.components.municipality?.trim() ||
    null;
  const district =
    result.components.state_district?.trim() ||
    result.components.county?.trim() ||
    null;
  const state = result.components.state?.trim() || null;
  const timezone = result.annotations?.timezone?.name?.trim() || null;

  if (
    !countryCode ||
    !country ||
    !isValidLatitude(latitude) ||
    !isValidLongitude(longitude)
  ) {
    return null;
  }

  return {
    id: `opencage-${index}-${latitude.toFixed(6)}-${longitude.toFixed(6)}`,
    displayName:
      result.formatted?.trim() ||
      normalizeDisplayName([city, district, state, country]),
    city,
    district,
    state,
    country,
    countryCode,
    latitude,
    longitude,
    timezone: timezone && isValidTimeZone(timezone) ? timezone : null,
    provider: "opencage",
    timezoneResolution: timezone ? "provider" : "coordinate",
  };
}

function buildOpenMeteoCandidate(
  result: OpenMeteoResult,
  index: number
): ProviderPlaceCandidate | null {
  const latitude = result.latitude;
  const longitude = result.longitude;
  const countryCode = result.country_code?.trim().toUpperCase() ?? "";
  const country = result.country?.trim() || countryCode;
  const city = result.name?.trim() || result.admin3?.trim() || null;
  const district = result.admin2?.trim() || null;
  const state = result.admin1?.trim() || null;
  const timezone = result.timezone?.trim() || null;
  const displayName = normalizeDisplayName([city, district, state, country]);

  if (
    !countryCode ||
    !country ||
    !displayName ||
    !isValidLatitude(latitude) ||
    !isValidLongitude(longitude)
  ) {
    return null;
  }

  return {
    id: `open-meteo-${result.id ?? index}-${latitude.toFixed(6)}-${longitude.toFixed(6)}`,
    displayName,
    city,
    district,
    state,
    country,
    countryCode,
    latitude,
    longitude,
    timezone: timezone && isValidTimeZone(timezone) ? timezone : null,
    provider: "open-meteo",
    timezoneResolution: timezone ? "provider" : "coordinate",
  };
}

function buildNominatimCandidate(
  payload: NominatimResponse,
  latitude: number,
  longitude: number
): ProviderPlaceCandidate | null {
  const address = payload.address;

  if (!address) {
    return null;
  }

  const countryCode = address.country_code?.trim().toUpperCase() ?? "";
  const country = address.country?.trim() ?? "";
  const city =
    address.city?.trim() ||
    address.town?.trim() ||
    address.village?.trim() ||
    address.municipality?.trim() ||
    null;
  const district =
    address.state_district?.trim() ||
    address.county?.trim() ||
    null;
  const state = address.state?.trim() || null;
  const displayName =
    payload.display_name?.trim() ||
    normalizeDisplayName([city, district, state, country]);

  if (!countryCode || !country || !displayName) {
    return null;
  }

  return {
    id: `nominatim-${latitude.toFixed(6)}-${longitude.toFixed(6)}`,
    displayName,
    city,
    district,
    state,
    country,
    countryCode,
    latitude,
    longitude,
    timezone: null,
    provider: "nominatim",
    timezoneResolution: "coordinate",
  };
}

async function searchWithOpenCage(
  query: string,
  key: string
): Promise<LocationTimezoneResult<LocationSearchResult[]>> {
  const url = new URL(OPENCAGE_ENDPOINT);
  url.searchParams.set("q", query);
  url.searchParams.set("key", key);
  url.searchParams.set("limit", "5");
  url.searchParams.set("language", "en");
  url.searchParams.set("no_annotations", "0");

  try {
    const payload = await fetchJsonWithTimeout<OpenCageResponse>(url);

    if ((payload.status?.code ?? 200) >= 400) {
      return issue(
        "PLACE_PROVIDER_ERROR",
        payload.status?.message ||
          "Place search provider is temporarily unavailable."
      );
    }

    const results = (payload.results ?? [])
      .map((result, index) => buildOpenCageCandidate(result, index))
      .filter((result): result is ProviderPlaceCandidate => Boolean(result));

    return { success: true, data: results };
  } catch (error) {
    return issue(
      "PLACE_PROVIDER_ERROR",
      error instanceof Error
        ? `Place search failed: ${error.message}`
        : "Place search failed due to an unknown provider error."
    );
  }
}

async function searchWithOpenMeteo(
  query: string
): Promise<LocationTimezoneResult<LocationSearchResult[]>> {
  const url = new URL(OPEN_METEO_GEOCODING_ENDPOINT);
  url.searchParams.set("name", query);
  url.searchParams.set("count", "5");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  try {
    const payload = await fetchJsonWithTimeout<OpenMeteoResponse>(url);
    const results = (payload.results ?? [])
      .map((result, index) => buildOpenMeteoCandidate(result, index))
      .filter((result): result is ProviderPlaceCandidate => Boolean(result));

    return { success: true, data: results };
  } catch (error) {
    return issue(
      "PLACE_PROVIDER_ERROR",
      error instanceof Error
        ? `Place search failed: ${error.message}`
        : "Place search failed due to an unknown provider error."
    );
  }
}

async function reverseWithOpenCage(
  latitude: number,
  longitude: number,
  key: string
): Promise<LocationTimezoneResult<ProviderPlaceCandidate>> {
  const url = new URL(OPENCAGE_ENDPOINT);
  url.searchParams.set("q", `${latitude},${longitude}`);
  url.searchParams.set("key", key);
  url.searchParams.set("limit", "1");
  url.searchParams.set("language", "en");
  url.searchParams.set("no_annotations", "0");

  try {
    const payload = await fetchJsonWithTimeout<OpenCageResponse>(url);
    const selected = (payload.results ?? [])
      .map((result, index) => buildOpenCageCandidate(result, index))
      .find(Boolean);

    if (!selected) {
      return issue(
        "PLACE_NOT_FOUND",
        "Detected coordinates could not be converted into a readable place."
      );
    }

    return { success: true, data: selected };
  } catch (error) {
    return issue(
      "PLACE_PROVIDER_ERROR",
      error instanceof Error
        ? `Reverse geocoding failed: ${error.message}`
        : "Reverse geocoding failed due to an unknown provider error."
    );
  }
}

async function reverseWithNominatim(
  latitude: number,
  longitude: number
): Promise<LocationTimezoneResult<ProviderPlaceCandidate>> {
  const url = new URL(NOMINATIM_REVERSE_ENDPOINT);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", latitude.toString());
  url.searchParams.set("lon", longitude.toString());
  url.searchParams.set("zoom", "10");
  url.searchParams.set("addressdetails", "1");

  try {
    const payload = await fetchJsonWithTimeout<NominatimResponse>(url, {
      headers: {
        "Accept-Language": "en",
        "User-Agent": "NAVAGRAHA-CENTRE location-timezone resolver",
      },
    });
    const selected = buildNominatimCandidate(payload, latitude, longitude);

    if (!selected) {
      return issue(
        "PLACE_NOT_FOUND",
        "Detected coordinates could not be converted into a readable place."
      );
    }

    return { success: true, data: selected };
  } catch (error) {
    return issue(
      "PLACE_PROVIDER_ERROR",
      error instanceof Error
        ? `Reverse geocoding failed: ${error.message}`
        : "Reverse geocoding failed due to an unknown provider error."
    );
  }
}

async function resolveTimezoneWithOpenMeteo(input: {
  latitude: number;
  longitude: number;
}): Promise<LocationTimezoneResult<{ timezone: string; resolution: TimezoneResolution }>> {
  const url = new URL(OPEN_METEO_FORECAST_ENDPOINT);
  url.searchParams.set("latitude", input.latitude.toString());
  url.searchParams.set("longitude", input.longitude.toString());
  url.searchParams.set("current", "temperature_2m");
  url.searchParams.set("forecast_days", "1");
  url.searchParams.set("timezone", "auto");

  try {
    const payload = await fetchJsonWithTimeout<OpenMeteoTimezoneResponse>(url);
    const timezone = payload.timezone?.trim() ?? "";

    if (!timezone || !isValidTimeZone(timezone)) {
      return issue(
        "TIMEZONE_NOT_FOUND",
        "Timezone provider did not return a valid IANA timezone identifier."
      );
    }

    return {
      success: true,
      data: {
        timezone,
        resolution: "coordinate",
      },
    };
  } catch (error) {
    return issue(
      "TIMEZONE_PROVIDER_ERROR",
      error instanceof Error
        ? `Timezone lookup failed: ${error.message}`
        : "Timezone lookup failed due to an unknown provider error."
    );
  }
}

export function getLocationProvider(): LocationProvider {
  return {
    async searchPlaces(query) {
      const normalized = query.trim();

      if (!normalized) {
        return issue("MISSING_LOCATION", "Enter a place before searching.");
      }

      if (normalized.length > 160) {
        return issue(
          "INVALID_FIELD_LENGTH",
          "Place search must be 160 characters or fewer."
        );
      }

      const provider = readProviderName();
      const key = readOpenCageKey();

      return provider === "opencage" && key
        ? searchWithOpenCage(normalized, key)
        : searchWithOpenMeteo(normalized);
    },

    async reverseGeocode(input) {
      const coordinateIssue = validateCoordinates(
        input.latitude,
        input.longitude
      );

      if (coordinateIssue) {
        return coordinateIssue;
      }

      const key = readOpenCageKey();

      return key
        ? reverseWithOpenCage(input.latitude, input.longitude, key)
        : reverseWithNominatim(input.latitude, input.longitude);
    },

    async resolveTimezone(input) {
      const coordinateIssue = validateCoordinates(
        input.latitude,
        input.longitude
      );

      if (coordinateIssue) {
        return coordinateIssue;
      }

      const providerTimezone = input.providerTimezone?.trim() ?? "";

      if (providerTimezone && isValidTimeZone(providerTimezone)) {
        return {
          success: true,
          data: {
            timezone: providerTimezone,
            resolution: "provider",
          },
        };
      }

      return resolveTimezoneWithOpenMeteo(input);
    },
  };
}
