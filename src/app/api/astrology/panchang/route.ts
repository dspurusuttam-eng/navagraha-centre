import { normalizeBirthContextInput } from "@/lib/astrology/birth-input-normalizer";
import { resolveAstronomyReadyBirthContext } from "@/lib/astrology/birth-context-engine";
import {
  getFirstAccuracyErrorMessage,
  getIncompleteDataMessage,
  validatePanchangOutputCompleteness,
  validatePanchangRequestInput,
} from "@/lib/astrology/accuracy";
import { apiErrorResponse, readJsonObjectBody } from "@/lib/api/http";
import { captureException } from "@/lib/observability";
import {
  checkSecurityRateLimit,
  guardOptionalHoneypotAndTiming,
  guardPayloadByteLength,
  guardTurnstileForPayload,
  guardTrustedOrigin,
  securityConfig,
} from "@/lib/security";
import { calculateDailyPanchangContext } from "@/modules/panchang";

export const dynamic = "force-dynamic";

type PanchangPayload = {
  date?: unknown;
  place?: unknown;
  [key: string]: unknown;
};

function readText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getResolutionErrorMessage(code: string) {
  switch (code) {
    case "MISSING_GEOCODING_API_KEY":
    case "PLACE_PROVIDER_ERROR":
    case "TIMEZONE_PROVIDER_ERROR":
      return "Location lookup is temporarily unavailable. Please try again shortly.";
    case "PLACE_NOT_FOUND":
      return "Place could not be resolved. Add city, region/state, and country.";
    case "PLACE_AMBIGUOUS":
      return "Place is ambiguous. Add a clearer region/state and country.";
    case "TIMEZONE_NOT_FOUND":
    case "INVALID_TIMEZONE":
      return "Timezone could not be resolved from this place input.";
    default:
      return "Location resolution failed for Panchang calculation.";
  }
}

function getPanchangErrorStatus(code: string) {
  switch (code) {
    case "MISSING_DATE":
    case "INVALID_DATE":
    case "MISSING_LOCATION":
    case "INVALID_COORDINATES":
    case "INVALID_TIMEZONE":
      return 422;
    default:
      return 500;
  }
}

export async function POST(request: Request) {
  const originGuard = guardTrustedOrigin(request, {
    allowMissingOrigin: true,
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
    policyKey: "panchang-public",
  });

  if (!rateLimit.allowed) {
    return apiErrorResponse({
      statusCode: 429,
      code: "RATE_LIMITED",
      message: "Too many Panchang requests. Please retry shortly.",
      headers: rateLimit.headers,
    });
  }

  const payload = (await readJsonObjectBody(request)) as PanchangPayload | null;

  if (!payload) {
    return apiErrorResponse({
      statusCode: 400,
      code: "INVALID_REQUEST",
      message: "Panchang payload must be a JSON object.",
      headers: rateLimit.headers,
    });
  }

  const spamCheck = guardOptionalHoneypotAndTiming({
    honeypotValue: payload[securityConfig.spamProtection.honeypotField],
    startedAtValue: payload[securityConfig.spamProtection.startedAtField],
  });

  if (!spamCheck.ok) {
    return apiErrorResponse({
      statusCode: 400,
      code: spamCheck.issue.code,
      message: spamCheck.issue.message,
      headers: rateLimit.headers,
    });
  }

  const turnstileGuard = await guardTurnstileForPayload({
    request,
    payload,
    route: "api.astrology.panchang",
    headers: rateLimit.headers,
  });

  if (turnstileGuard) {
    return turnstileGuard;
  }

  const date = readText(payload.date);
  const place = readText(payload.place);
  const validatedInput = validatePanchangRequestInput({
    date,
    place,
  });

  if (!validatedInput.ok) {
    return apiErrorResponse({
      statusCode: 422,
      code: "INVALID_PANCHANG_INPUT",
      message: getFirstAccuracyErrorMessage(
        validatedInput.issues,
        "Date and place are required."
      ),
      headers: rateLimit.headers,
    });
  }

  const normalized = normalizeBirthContextInput({
    dateLocalInput: validatedInput.data.date,
    timeLocalInput: "12:00",
    placeTextInput: validatedInput.data.place,
  });

  if (!normalized.success) {
    return apiErrorResponse({
      statusCode: 422,
      code: normalized.issues[0]?.code ?? "NORMALIZATION_FAILED",
      message:
        normalized.issues[0]?.message ??
        "Date/place normalization failed for Panchang calculation.",
      headers: rateLimit.headers,
    });
  }

  const resolved = await resolveAstronomyReadyBirthContext(normalized.data).catch(
    (error) => {
      captureException(error, {
        route: "api.astrology.panchang",
        stage: "resolve-birth-context",
      });

      return {
        success: false as const,
        issue: {
          code: "PLACE_PROVIDER_ERROR",
          message: "Location resolution failed unexpectedly.",
        },
      };
    }
  );

  if (!resolved.success) {
    return apiErrorResponse({
      statusCode: 422,
      code: resolved.issue.code,
      message: getResolutionErrorMessage(resolved.issue.code),
      headers: rateLimit.headers,
    });
  }

  const panchang = calculateDailyPanchangContext({
    dateLocal: normalized.data.date_local_normalized,
    location: {
      displayName: resolved.data.normalized_place.display_name,
      latitude: resolved.data.normalized_place.latitude,
      longitude: resolved.data.normalized_place.longitude,
      timezoneIana: resolved.data.timezone.iana,
      countryCode: resolved.data.normalized_place.country_code,
      countryName: resolved.data.normalized_place.country_name,
      region: resolved.data.normalized_place.region,
      city: resolved.data.normalized_place.city,
    },
  });

  if (!panchang.success) {
    return apiErrorResponse({
      statusCode: getPanchangErrorStatus(panchang.error.code),
      code: panchang.error.code,
      message: panchang.error.message,
      headers: rateLimit.headers,
    });
  }
  const completeness = validatePanchangOutputCompleteness(panchang.data);

  if (!completeness.isComplete) {
    return apiErrorResponse({
      statusCode: 422,
      code: "INCOMPLETE_PANCHANG_DATA",
      message: getIncompleteDataMessage({
        context: "panchang",
      }),
      headers: rateLimit.headers,
    });
  }

  return Response.json(
    {
      data: panchang.data,
      accuracy: {
        isComplete: true,
        missingFields: [],
      },
    },
    {
      headers: rateLimit.headers,
    }
  );
}
