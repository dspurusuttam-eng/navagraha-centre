import { apiErrorResponse, readJsonObjectBody } from "@/lib/api/http";
import { captureException } from "@/lib/observability";
import {
  checkSecurityRateLimit,
  guardOptionalHoneypotAndTiming,
  guardPayloadByteLength,
  guardTrustedOrigin,
  guardTurnstileForPayload,
  securityConfig,
} from "@/lib/security";
import {
  buildTodayDecisionContext,
  validateTodayDecisionInput,
} from "@/modules/astrology/today-decision";

export const dynamic = "force-dynamic";

type TodayDecisionPayload = Record<string, unknown>;

function getTodayDecisionErrorStatus(code: string) {
  switch (code) {
    case "MISSING_ADVANCED_TIMINGS":
    case "PANCHANG_CALCULATION_FAILED":
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
    policyKey: "today-decision-public",
  });

  if (!rateLimit.allowed) {
    return apiErrorResponse({
      statusCode: 429,
      code: "RATE_LIMITED",
      message: "Too many Today Decision requests. Please retry shortly.",
      headers: rateLimit.headers,
    });
  }

  const payload = (await readJsonObjectBody(request)) as TodayDecisionPayload | null;

  if (!payload) {
    return apiErrorResponse({
      statusCode: 400,
      code: "INVALID_REQUEST",
      message: "Today Decision payload must be a JSON object.",
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
    route: "api.astrology.today-decision",
    headers: rateLimit.headers,
  });

  if (turnstileGuard) {
    return turnstileGuard;
  }

  const validated = validateTodayDecisionInput(payload);

  if (!validated.ok) {
    return apiErrorResponse({
      statusCode: 422,
      code: validated.error.code,
      message: validated.error.message,
      headers: rateLimit.headers,
    });
  }

  let result;

  try {
    result = buildTodayDecisionContext(validated.data);
  } catch (error) {
    captureException(error, {
      route: "api.astrology.today-decision",
      stage: "build-context",
    });

    return apiErrorResponse({
      statusCode: 500,
      code: "TODAY_DECISION_FAILED",
      message: "Today Decision guidance could not be generated. Please try again.",
      headers: rateLimit.headers,
    });
  }

  if (!result.success) {
    return apiErrorResponse({
      statusCode: getTodayDecisionErrorStatus(result.error.code),
      code: result.error.code,
      message: result.error.message,
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
