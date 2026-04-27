import { normalizeBirthContextInput } from "@/lib/astrology/birth-input-normalizer";
import { resolveAstronomyReadyBirthContext } from "@/lib/astrology/birth-context-engine";
import {
  getFirstAccuracyErrorMessage,
  validateMuhurtaLiteOutputCompleteness,
  validatePanchangRequestInput,
} from "@/lib/astrology/accuracy";
import { apiErrorResponse, readJsonObjectBody } from "@/lib/api/http";
import { captureException } from "@/lib/observability";
import { calculateMuhurtaLiteContext } from "@/modules/muhurta-lite";

export const dynamic = "force-dynamic";

type MuhurtaLitePayload = {
  date?: unknown;
  place?: unknown;
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
      return "Location resolution failed for Muhurta-lite calculation.";
  }
}

function getMuhurtaLiteErrorStatus(code: string) {
  switch (code) {
    case "MISSING_ADVANCED_TIMINGS":
      return 422;
    default:
      return 500;
  }
}

export async function POST(request: Request) {
  const payload = (await readJsonObjectBody(request)) as MuhurtaLitePayload | null;

  if (!payload) {
    return apiErrorResponse({
      statusCode: 400,
      code: "INVALID_REQUEST",
      message: "Muhurta-lite payload must be a JSON object.",
    });
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
      code: "INVALID_MUHURTA_INPUT",
      message: getFirstAccuracyErrorMessage(
        validatedInput.issues,
        "Date and place are required."
      ),
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
        "Date/place normalization failed for Muhurta-lite calculation.",
    });
  }

  const resolved = await resolveAstronomyReadyBirthContext(normalized.data).catch(
    (error) => {
      captureException(error, {
        route: "api.astrology.muhurta-lite",
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
    });
  }

  const muhurtaLite = calculateMuhurtaLiteContext({
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

  if (!muhurtaLite.success) {
    return apiErrorResponse({
      statusCode: getMuhurtaLiteErrorStatus(muhurtaLite.error.code),
      code: muhurtaLite.error.code,
      message: muhurtaLite.error.message,
    });
  }
  const completeness = validateMuhurtaLiteOutputCompleteness(muhurtaLite.data);

  if (!completeness.isComplete) {
    return apiErrorResponse({
      statusCode: 422,
      code: "INCOMPLETE_MUHURTA_DATA",
      message:
        "Daily timing data is incomplete for this date and location. Please try again.",
    });
  }

  return Response.json({
    data: muhurtaLite.data,
    accuracy: {
      isComplete: true,
      missingFields: [],
    },
  });
}
