import {
  getIncompleteDataMessage,
  validateKundliChartCompleteness,
} from "@/lib/astrology/accuracy";
import {
  apiErrorResponse,
  readJsonObjectBody,
} from "@/lib/api/http";
import {
  buildRateLimitKey,
  checkRateLimit,
  getClientAddress,
  getRateLimitHeaders,
} from "@/lib/rate-limit";
import { captureException, trackServerEvent } from "@/lib/observability";
import { getSession } from "@/modules/auth/server";
import { retrieveOrRefreshBirthChartForUser } from "@/modules/astrology/chart-retrieval";

export const dynamic = "force-dynamic";

type ChartContractRequestPayload = {
  source?: unknown;
};

function toErrorStatus(code: string) {
  switch (code) {
    case "MISSING_BIRTH_PROFILE":
    case "INVALID_BIRTH_INPUT":
    case "INVALID_BIRTH_TIMEZONE":
    case "MISSING_COORDINATES":
    case "INVALID_COORDINATES":
    case "UTC_CONVERSION_FAILED":
    case "INVALID_BIRTH_CONTEXT":
    case "CHART_BUILD_FAILED":
    case "SAVED_CHART_NOT_FOUND":
    case "INVALID_SAVED_CHART":
      return 422;
    case "CHART_PERSISTENCE_FAILED":
    case "PROFILE_NOT_FOUND":
    case "CHART_REFRESH_FAILED":
      return 500;
    default:
      return 500;
  }
}

export async function POST(request: Request) {
  const session = await getSession().catch((error) => {
    captureException(error, {
      route: "api.astrology.chart",
      stage: "get-session",
    });

    return null;
  });

  if (!session) {
    return apiErrorResponse({
      statusCode: 401,
      code: "UNAUTHORIZED",
      message: "Sign in is required to access chart data.",
    });
  }

  const limit = checkRateLimit({
    key: buildRateLimitKey([
      "api-astrology-chart",
      session.user.id,
      getClientAddress(request),
    ]),
    limit: 18,
    windowMs: 10 * 60 * 1_000,
  });

  if (!limit.allowed) {
    trackServerEvent(
      "chart-contract.rate-limited",
      {
        userId: session.user.id,
      },
      "warning"
    );

    return apiErrorResponse({
      statusCode: 429,
      code: "RATE_LIMITED",
      message: "Too many chart requests. Please wait and retry.",
      headers: getRateLimitHeaders(limit),
    });
  }

  const payload = (await readJsonObjectBody(request)) as
    | ChartContractRequestPayload
    | null;

  if (!payload) {
    return apiErrorResponse({
      statusCode: 400,
      code: "INVALID_REQUEST",
      message: "Chart request payload must be a JSON object.",
      headers: getRateLimitHeaders(limit),
    });
  }

  if (
    payload.source !== undefined &&
    payload.source !== "PROFILE"
  ) {
    return apiErrorResponse({
      statusCode: 400,
      code: "INVALID_SOURCE",
      message: 'Unsupported chart source. Use "PROFILE" or omit source.',
      headers: getRateLimitHeaders(limit),
    });
  }

  let result;

  try {
    result = await retrieveOrRefreshBirthChartForUser(session.user.id);
  } catch (error) {
    captureException(error, {
      route: "api.astrology.chart",
      userId: session.user.id,
    });

    return apiErrorResponse({
      statusCode: 500,
      code: "CHART_RETRIEVAL_FAILED",
      message: "Chart data could not be loaded. Please try again.",
      headers: getRateLimitHeaders(limit),
    });
  }

  if (!result.success) {
    return apiErrorResponse({
      statusCode: toErrorStatus(result.error.code),
      code: result.error.code,
      message: result.error.message,
      headers: getRateLimitHeaders(limit),
    });
  }
  const completeness = validateKundliChartCompleteness(result.data.chart);

  if (!completeness.isComplete) {
    return apiErrorResponse({
      statusCode: 422,
      code: "INCOMPLETE_CHART_DATA",
      message: getIncompleteDataMessage({
        context: "kundli",
      }),
      headers: getRateLimitHeaders(limit),
    });
  }

  return Response.json(
    {
      chart: result.data.chart,
      persistence: result.data.persistence,
      retrieval: result.data.retrieval,
      accuracy: {
        isComplete: true,
      },
    },
    {
      headers: getRateLimitHeaders(limit),
    }
  );
}
