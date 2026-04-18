import {
  apiErrorResponse,
  readJsonObjectBody,
} from "@/lib/api/http";
import { captureException } from "@/lib/observability";
import { getSession } from "@/modules/auth/server";
import { normalizeBirthContextInput } from "@/lib/astrology/birth-input-normalizer";
import { resolveAstronomyReadyBirthContext } from "@/lib/astrology/birth-context-engine";
import { validateBirthContextResolutionResult } from "@/lib/astrology/birth-context-validator";

export const dynamic = "force-dynamic";

type ResolveBirthContextPayload = {
  birthDate?: unknown;
  birthTime?: unknown;
  city?: unknown;
  region?: unknown;
  country?: unknown;
};

function readText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getResolutionErrorMessage(code: string, message: string) {
  switch (code) {
    case "MISSING_GEOCODING_API_KEY":
    case "PLACE_PROVIDER_ERROR":
    case "TIMEZONE_PROVIDER_ERROR":
      return "Automatic location lookup is unavailable right now. You can continue with manual timezone and coordinates.";
    case "PLACE_NOT_FOUND":
      return "Birthplace could not be resolved. Add a more specific city, region, and country.";
    case "PLACE_AMBIGUOUS":
      return "Birthplace is ambiguous. Add a clearer region/state and country.";
    case "TIMEZONE_NOT_FOUND":
    case "INVALID_TIMEZONE":
      return "Timezone could not be resolved from this birthplace. You can enter timezone manually.";
    default:
      return message || "Birthplace resolution failed. You can continue with manual timezone and coordinates.";
  }
}

export async function POST(request: Request) {
  const session = await getSession().catch((error) => {
    captureException(error, {
      route: "api.astrology.birth-context.resolve",
      stage: "get-session",
    });

    return null;
  });

  if (!session) {
    return apiErrorResponse({
      statusCode: 401,
      code: "UNAUTHORIZED",
      message: "Sign in is required to resolve birthplace details.",
    });
  }

  const payload = (await readJsonObjectBody(request)) as
    | ResolveBirthContextPayload
    | null;

  if (!payload) {
    return apiErrorResponse({
      statusCode: 400,
      code: "INVALID_REQUEST",
      message: "Birthplace resolve payload must be a JSON object.",
    });
  }

  try {
    const city = readText(payload.city);
    const region = readText(payload.region);
    const country = readText(payload.country);
    const birthDate = readText(payload.birthDate);
    const birthTime = readText(payload.birthTime);

    if (!city || !country || !birthDate || !birthTime) {
      return apiErrorResponse({
        statusCode: 400,
        code: "MISSING_REQUIRED_FIELDS",
        message: "Birth date, birth time, city, and country are required.",
      });
    }

    if (
      city.length > 120 ||
      region.length > 120 ||
      country.length > 120 ||
      birthDate.length > 32 ||
      birthTime.length > 32
    ) {
      return apiErrorResponse({
        statusCode: 400,
        code: "INVALID_FIELD_LENGTH",
        message: "One or more birthplace fields exceed the allowed length.",
      });
    }

    const placeTextInput = [city, region, country]
      .filter((value) => Boolean(value))
      .join(", ");

    const normalized = normalizeBirthContextInput({
      dateLocalInput: birthDate,
      timeLocalInput: birthTime,
      placeTextInput,
    });

    if (!normalized.success) {
      return apiErrorResponse({
        statusCode: 422,
        code: normalized.issues[0]?.code ?? "NORMALIZATION_FAILED",
        message:
          normalized.issues[0]?.message ??
          "Birth input normalization failed.",
      });
    }

    const resolved = await resolveAstronomyReadyBirthContext(normalized.data).catch(
      (error) => {
        captureException(error, {
          route: "api.astrology.birth-context.resolve",
          userId: session.user.id,
          stage: "resolve-birth-context",
        });

        return {
          success: false as const,
          issue: {
            code: "PLACE_PROVIDER_ERROR",
            message: "Birthplace resolution failed unexpectedly.",
          },
        };
      }
    );

    if (!resolved.success) {
      return apiErrorResponse({
        statusCode: 422,
        code: resolved.issue.code,
        message: getResolutionErrorMessage(
          resolved.issue.code,
          resolved.issue.message
        ),
      });
    }

    const validation = validateBirthContextResolutionResult(resolved);

    return Response.json({
      resolved: {
        displayName: resolved.data.normalized_place.display_name,
        latitude: resolved.data.normalized_place.latitude,
        longitude: resolved.data.normalized_place.longitude,
        countryCode: resolved.data.normalized_place.country_code,
        countryName: resolved.data.normalized_place.country_name,
        region: resolved.data.normalized_place.region,
        city: resolved.data.normalized_place.city,
        timezoneIana: resolved.data.timezone.iana,
        utcOffsetAtBirth: resolved.data.timezone.utc_offset_at_birth,
        locationConfidence: resolved.data.quality.location_confidence,
        birthUtc: resolved.data.birth_utc,
        validation: {
          isValidForChart: validation.is_valid_for_chart,
          overallConfidence: validation.overall_confidence,
          warnings: validation.warnings.map((warning) => warning.message),
        },
      },
    });
  } catch (error) {
    captureException(error, {
      route: "api.astrology.birth-context.resolve",
      userId: session.user.id,
      stage: "unexpected",
    });

    return apiErrorResponse({
      statusCode: 500,
      code: "BIRTH_CONTEXT_RESOLVE_FAILED",
      message:
        "Birthplace resolution failed unexpectedly. You can continue with manual timezone and coordinates.",
    });
  }
}
