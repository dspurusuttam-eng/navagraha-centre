import {
  isValidTimeZone,
  resolveCivilTimeToUtc,
  type CivilTimeDisambiguation,
} from "@/lib/location-timezone/civil-time";
import type {
  CanonicalLocationDateTime,
  LocationProvider,
  LocationSearchResult,
  LocationSource,
  LocationTimezoneIssue,
  LocationTimezoneResult,
  ProviderPlaceCandidate,
  TimezoneResolution,
} from "@/lib/location-timezone/types";

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

export function validateLocationCoordinates(
  latitude: number,
  longitude: number
): LocationTimezoneResult<never> | null {
  if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
    return issue(
      "INVALID_COORDINATES",
      "Latitude must be between -90 and 90 and longitude must be between -180 and 180."
    );
  }

  return null;
}

function parseFiniteNumber(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function buildCanonical(input: {
  place: ProviderPlaceCandidate;
  dateLocal: string;
  timeLocal: string;
  timezone: string;
  timezoneResolution: TimezoneResolution;
  locationSource: LocationSource;
  accuracyMeters: number | null;
  disambiguation?: CivilTimeDisambiguation;
}): LocationTimezoneResult<CanonicalLocationDateTime> {
  const civil = resolveCivilTimeToUtc({
    dateLocal: input.dateLocal,
    timeLocal: input.timeLocal,
    timeZone: input.timezone,
    disambiguation: input.disambiguation,
  });

  if (!civil.success) {
    return civil;
  }

  return {
    success: true,
    data: {
      displayName: input.place.displayName,
      city: input.place.city,
      district: input.place.district,
      state: input.place.state,
      country: input.place.country,
      countryCode: input.place.countryCode,
      latitude: input.place.latitude,
      longitude: input.place.longitude,
      timezone: civil.data.timezone,
      utcOffsetMinutes: civil.data.utcOffsetMinutes,
      localDateTime: civil.data.localDateTime,
      utcDateTime: civil.data.utcDateTime,
      locationSource: input.locationSource,
      accuracyMeters: input.accuracyMeters,
      timezoneResolution: input.timezoneResolution,
    },
  };
}

export async function resolveCanonicalLocationDateTime(input: {
  source: LocationSource;
  dateLocal: string;
  timeLocal: string;
  latitude?: unknown;
  longitude?: unknown;
  accuracyMeters?: unknown;
  place?: LocationSearchResult | null;
  displayName?: unknown;
  city?: unknown;
  district?: unknown;
  state?: unknown;
  country?: unknown;
  countryCode?: unknown;
  timezone?: unknown;
  disambiguation?: CivilTimeDisambiguation;
  provider: LocationProvider;
}): Promise<LocationTimezoneResult<CanonicalLocationDateTime>> {
  const dateLocal = input.dateLocal.trim();
  const timeLocal = input.timeLocal.trim();

  if (!dateLocal || !timeLocal) {
    return issue(
      "MISSING_DATE_TIME",
      "Select date of birth and birth time before confirming location."
    );
  }

  if (input.source === "manual") {
    const latitude = parseFiniteNumber(input.latitude);
    const longitude = parseFiniteNumber(input.longitude);
    const timezone =
      typeof input.timezone === "string" ? input.timezone.trim() : "";
    const displayName =
      typeof input.displayName === "string" && input.displayName.trim()
        ? input.displayName.trim()
        : "Manual location";
    const country =
      typeof input.country === "string" && input.country.trim()
        ? input.country.trim()
        : "";
    const countryCode =
      typeof input.countryCode === "string" && input.countryCode.trim()
        ? input.countryCode.trim().toUpperCase()
        : "XX";

    if (latitude === null || longitude === null) {
      return issue(
        "INVALID_COORDINATES",
        "Manual latitude and longitude must be valid numbers."
      );
    }

    const coordinateIssue = validateLocationCoordinates(latitude, longitude);

    if (coordinateIssue) {
      return coordinateIssue;
    }

    if (!timezone || !isValidTimeZone(timezone)) {
      return issue(
        "INVALID_TIMEZONE",
        "Manual timezone must be a valid IANA timezone identifier."
      );
    }

    if (!country) {
      return issue("MISSING_LOCATION", "Manual country is required.");
    }

    return buildCanonical({
      place: {
        id: "manual",
        displayName,
        city:
          typeof input.city === "string" && input.city.trim()
            ? input.city.trim()
            : null,
        district:
          typeof input.district === "string" && input.district.trim()
            ? input.district.trim()
            : null,
        state:
          typeof input.state === "string" && input.state.trim()
            ? input.state.trim()
            : null,
        country,
        countryCode,
        latitude,
        longitude,
        timezone,
        provider: "manual",
        timezoneResolution: "manual",
      },
      dateLocal,
      timeLocal,
      timezone,
      timezoneResolution: "manual",
      locationSource: "manual",
      accuracyMeters: null,
      disambiguation: input.disambiguation,
    });
  }

  let place: ProviderPlaceCandidate | null = null;
  let accuracyMeters: number | null = null;

  if (input.source === "search" || input.source === "saved") {
    if (!input.place) {
      return issue("MISSING_LOCATION", "Select a search result before confirming.");
    }

    place = {
      ...input.place,
      timezoneResolution: input.place.timezone ? "provider" : "coordinate",
    };
  }

  if (input.source === "browser") {
    const latitude = parseFiniteNumber(input.latitude);
    const longitude = parseFiniteNumber(input.longitude);

    if (latitude === null || longitude === null) {
      return issue(
        "INVALID_COORDINATES",
        "Browser location did not provide usable coordinates."
      );
    }

    const coordinateIssue = validateLocationCoordinates(latitude, longitude);

    if (coordinateIssue) {
      return coordinateIssue;
    }

    const reverse = await input.provider.reverseGeocode({ latitude, longitude });

    if (!reverse.success) {
      return reverse;
    }

    place = reverse.data;
    accuracyMeters = parseFiniteNumber(input.accuracyMeters);
  }

  if (!place) {
    return issue("MISSING_LOCATION", "Location source could not be resolved.");
  }

  const timezone = await input.provider.resolveTimezone({
    latitude: place.latitude,
    longitude: place.longitude,
    providerTimezone: place.timezone,
  });

  if (!timezone.success) {
    return timezone;
  }

  return buildCanonical({
    place,
    dateLocal,
    timeLocal,
    timezone: timezone.data.timezone,
    timezoneResolution: timezone.data.resolution,
    locationSource: input.source,
    accuracyMeters,
    disambiguation: input.disambiguation,
  });
}
