import {
  apiErrorResponse,
  isPlainObject,
  readJsonObjectBody,
} from "@/lib/api/http";
import { captureException } from "@/lib/observability";
import {
  checkSecurityRateLimit,
  guardPayloadByteLength,
  guardTrustedOrigin,
} from "@/lib/security";
import { getSession } from "@/modules/auth/server";
import {
  buildDailyHoroscopeForSavedKundli,
  type DailyHoroscopeLocationInput,
} from "@/modules/astrology/horoscope/daily-horoscope-service";

export const dynamic = "force-dynamic";

type DailyHoroscopePayload = {
  savedKundliId?: unknown;
  localDate?: unknown;
  calculationLocation?: unknown;
};

function readText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readNumber(value: unknown) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function readLocation(value: unknown): DailyHoroscopeLocationInput | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (!isPlainObject(value)) {
    return null;
  }

  const latitude = readNumber(value.latitude);
  const longitude = readNumber(value.longitude);
  const displayName = readText(value.displayName);
  const timezoneIana = readText(value.timezoneIana);

  if (
    latitude === null ||
    longitude === null ||
    !displayName ||
    !timezoneIana
  ) {
    return null;
  }

  return {
    displayName,
    latitude,
    longitude,
    timezoneIana,
    countryCode: readText(value.countryCode) || null,
    countryName: readText(value.countryName) || null,
    region: readText(value.region) || null,
    city: readText(value.city) || null,
  };
}

function getStatusForError(code: string) {
  switch (code) {
    case "INVALID_REQUEST":
    case "INVALID_LOCATION":
      return 400;
    case "KUNDLI_NOT_FOUND":
      return 404;
    case "MISSING_BIRTH_TIME":
    case "MISSING_LOCATION":
    case "INVALID_BIRTH_CONTEXT":
    case "CHART_BUILD_FAILED":
    case "HOROSCOPE_UNAVAILABLE":
      return 422;
    default:
      return 500;
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

  const session = await getSession().catch((error) => {
    captureException(error, {
      route: "api.astrology.daily-horoscope",
      stage: "get-session",
    });

    return null;
  });

  if (!session) {
    return apiErrorResponse({
      statusCode: 401,
      code: "UNAUTHORIZED",
      message: "Sign in is required to access personalised daily guidance.",
    });
  }

  const rateLimit = checkSecurityRateLimit({
    request,
    policyKey: "daily-horoscope-read",
    identityParts: [session.user.id],
  });

  if (!rateLimit.allowed) {
    return apiErrorResponse({
      statusCode: 429,
      code: "RATE_LIMITED",
      message: "Too many daily horoscope requests. Please retry shortly.",
      headers: rateLimit.headers,
    });
  }

  const payload = (await readJsonObjectBody(request)) as DailyHoroscopePayload | null;

  if (!payload) {
    return apiErrorResponse({
      statusCode: 400,
      code: "INVALID_REQUEST",
      message: "Daily horoscope payload must be a JSON object.",
      headers: rateLimit.headers,
    });
  }

  const result = await buildDailyHoroscopeForSavedKundli({
    userId: session.user.id,
    savedKundliId: readText(payload.savedKundliId),
    localDate: readText(payload.localDate),
    calculationLocation: readLocation(payload.calculationLocation),
  });

  if (!result.success) {
    return apiErrorResponse({
      statusCode: getStatusForError(result.error.code),
      code: result.error.code,
      message: result.error.message,
      details: result.details,
      headers: rateLimit.headers,
    });
  }

  return Response.json(
    {
      data: result.data,
    },
    {
      headers: rateLimit.headers,
    }
  );
}
