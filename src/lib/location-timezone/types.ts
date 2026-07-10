export type LocationSource = "browser" | "search" | "saved" | "manual";

export type TimezoneResolution = "coordinate" | "provider" | "manual";

export type LocationTimezoneErrorCode =
  | "INVALID_REQUEST"
  | "INVALID_FIELD_LENGTH"
  | "INVALID_COORDINATES"
  | "INVALID_TIMEZONE"
  | "MISSING_LOCATION"
  | "MISSING_DATE_TIME"
  | "PLACE_NOT_FOUND"
  | "PLACE_AMBIGUOUS"
  | "PLACE_PROVIDER_ERROR"
  | "TIMEZONE_NOT_FOUND"
  | "TIMEZONE_PROVIDER_ERROR"
  | "LOCAL_TIME_AMBIGUOUS"
  | "LOCAL_TIME_NONEXISTENT"
  | "UTC_CONVERSION_FAILED";

export type CanonicalLocationDateTime = {
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
  locationSource: LocationSource;
  accuracyMeters: number | null;
  timezoneResolution: TimezoneResolution;
};

export type LocationSearchResult = {
  id: string;
  displayName: string;
  city: string | null;
  district: string | null;
  state: string | null;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  timezone: string | null;
  provider: string;
};

export type ProviderPlaceCandidate = LocationSearchResult & {
  timezoneResolution: TimezoneResolution;
};

export type LocationProvider = {
  searchPlaces(query: string): Promise<LocationTimezoneResult<LocationSearchResult[]>>;
  reverseGeocode(input: {
    latitude: number;
    longitude: number;
  }): Promise<LocationTimezoneResult<ProviderPlaceCandidate>>;
  resolveTimezone(input: {
    latitude: number;
    longitude: number;
    providerTimezone?: string | null;
  }): Promise<LocationTimezoneResult<{
    timezone: string;
    resolution: TimezoneResolution;
  }>>;
};

export type LocationTimezoneIssue = {
  code: LocationTimezoneErrorCode;
  message: string;
  details?: unknown;
};

export type LocationTimezoneResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      issue: LocationTimezoneIssue;
    };
