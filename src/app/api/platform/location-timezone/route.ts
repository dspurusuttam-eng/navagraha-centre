import { apiErrorResponse, isPlainObject, readJsonObjectBody } from "@/lib/api/http";
import { captureException } from "@/lib/observability";
import {
  checkSecurityRateLimit,
  guardPayloadByteLength,
  guardTrustedOrigin,
} from "@/lib/security";
import {
  getLocationProvider,
} from "@/lib/location-timezone/provider";
import { resolveCanonicalLocationDateTime } from "@/lib/location-timezone/resolver";
import type {
  LocationSearchResult,
  LocationSource,
  LocationTimezoneIssue,
} from "@/lib/location-timezone/types";

export const dynamic = "force-dynamic";

type LocationTimezonePayload = {
  mode?: unknown;
  query?: unknown;
  source?: unknown;
  dateLocal?: unknown;
  timeLocal?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  accuracyMeters?: unknown;
  place?: unknown;
  displayName?: unknown;
  city?: unknown;
  district?: unknown;
  state?: unknown;
  country?: unknown;
  countryCode?: unknown;
  timezone?: unknown;
  disambiguation?: unknown;
};

function readText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readSource(value: unknown): LocationSource | null {
  return value === "browser" ||
    value === "search" ||
    value === "saved" ||
    value === "manual"
    ? value
    : null;
}

function readPlace(value: unknown): LocationSearchResult | null {
  if (!isPlainObject(value)) {
    return null;
  }

  const latitude = Number(value.latitude);
  const longitude = Number(value.longitude);
  const displayName = readText(value.displayName);
  const country = readText(value.country);
  const countryCode = readText(value.countryCode).toUpperCase();

  if (
    !displayName ||
    !country ||
    !countryCode ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }

  return {
    id: readText(value.id) || `${latitude}:${longitude}`,
    displayName,
    city: readText(value.city) || null,
    district: readText(value.district) || null,
    state: readText(value.state) || null,
    country,
    countryCode,
    latitude,
    longitude,
    timezone: readText(value.timezone) || null,
    provider: readText(value.provider) || "client-selection",
  };
}

function getStatusForIssue(issue: LocationTimezoneIssue) {
  switch (issue.code) {
    case "PLACE_PROVIDER_ERROR":
    case "TIMEZONE_PROVIDER_ERROR":
      return 503;
    case "PLACE_NOT_FOUND":
      return 404;
    case "LOCAL_TIME_AMBIGUOUS":
    case "LOCAL_TIME_NONEXISTENT":
    case "INVALID_COORDINATES":
    case "INVALID_TIMEZONE":
    case "MISSING_LOCATION":
    case "MISSING_DATE_TIME":
    case "INVALID_FIELD_LENGTH":
      return 422;
    default:
      return 400;
  }
}

function getSafeMessage(issue: LocationTimezoneIssue) {
  switch (issue.code) {
    case "PLACE_PROVIDER_ERROR":
      return "Location provider is temporarily unavailable. Use manual entry or try again shortly.";
    case "TIMEZONE_PROVIDER_ERROR":
      return "Timezone provider is temporarily unavailable. Use manual timezone entry or try again shortly.";
    case "PLACE_NOT_FOUND":
      return "No matching place was found. Try a clearer city, state, and country.";
    case "LOCAL_TIME_AMBIGUOUS":
      return issue.message;
    case "LOCAL_TIME_NONEXISTENT":
      return issue.message;
    default:
      return issue.message;
  }
}

export async function POST(request: Request) {
  const originGuard = guardTrustedOrigin(request, {
    allowMissingOrigin: true,
    allowSameOrigin: true,
  });

  if (originGuard) {
    return originGuard;
  }

  const payloadGuard = guardPayloadByteLength(request);

  if (payloadGuard) {
    return payloadGuard;
  }

  const rateLimit = checkSecurityRateLimit({
    request,
    policyKey: "location-timezone-public",
  });

  if (!rateLimit.allowed) {
    return apiErrorResponse({
      statusCode: 429,
      code: "RATE_LIMITED",
      message: "Too many location requests. Please retry shortly.",
      headers: rateLimit.headers,
    });
  }

  const payload = (await readJsonObjectBody(request)) as
    | LocationTimezonePayload
    | null;

  if (!payload) {
    return apiErrorResponse({
      statusCode: 400,
      code: "INVALID_REQUEST",
      message: "Location-timezone payload must be a JSON object.",
      headers: rateLimit.headers,
    });
  }

  try {
    const mode = readText(payload.mode);

    if (mode === "search") {
      const query = readText(payload.query);
      const provider = getLocationProvider();
      const result = await provider.searchPlaces(query);

      if (!result.success) {
        return apiErrorResponse({
          statusCode: getStatusForIssue(result.issue),
          code: result.issue.code,
          message: getSafeMessage(result.issue),
          details: result.issue.details,
          headers: rateLimit.headers,
        });
      }

      return Response.json(
        {
          results: result.data,
        },
        {
          headers: rateLimit.headers,
        }
      );
    }

    if (mode === "resolve") {
      const source = readSource(payload.source);

      if (!source) {
        return apiErrorResponse({
          statusCode: 400,
          code: "INVALID_REQUEST",
          message:
            'Location source must be one of "browser", "search", "saved", or "manual".',
          headers: rateLimit.headers,
        });
      }

      const result = await resolveCanonicalLocationDateTime({
        source,
        dateLocal: readText(payload.dateLocal),
        timeLocal: readText(payload.timeLocal),
        latitude: payload.latitude,
        longitude: payload.longitude,
        accuracyMeters: payload.accuracyMeters,
        place: readPlace(payload.place),
        displayName: payload.displayName,
        city: payload.city,
        district: payload.district,
        state: payload.state,
        country: payload.country,
        countryCode: payload.countryCode,
        timezone: payload.timezone,
        disambiguation:
          payload.disambiguation === "earlier" ||
          payload.disambiguation === "later"
            ? payload.disambiguation
            : undefined,
        provider: getLocationProvider(),
      });

      if (!result.success) {
        return apiErrorResponse({
          statusCode: getStatusForIssue(result.issue),
          code: result.issue.code,
          message: getSafeMessage(result.issue),
          details: result.issue.details,
          headers: rateLimit.headers,
        });
      }

      return Response.json(
        {
          resolved: result.data,
        },
        {
          headers: rateLimit.headers,
        }
      );
    }

    return apiErrorResponse({
      statusCode: 400,
      code: "INVALID_REQUEST",
      message: 'Unsupported mode. Use "search" or "resolve".',
      headers: rateLimit.headers,
    });
  } catch (error) {
    captureException(error, {
      route: "api.platform.location-timezone",
    });

    return apiErrorResponse({
      statusCode: 500,
      code: "LOCATION_TIMEZONE_FAILED",
      message:
        "Location and timezone resolution failed unexpectedly. Manual entry remains available.",
      headers: rateLimit.headers,
    });
  }
}
