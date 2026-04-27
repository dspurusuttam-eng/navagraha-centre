import { apiErrorResponse, readJsonObjectBody } from "@/lib/api/http";
import {
  getFirstAccuracyErrorMessage,
  validateCompatibilityRequestInput,
  validateNumerologyRequestInput,
  validatePanchangRequestInput,
} from "@/lib/astrology/accuracy";
import {
  checkSecurityRateLimit,
  guardOptionalHoneypotAndTiming,
  guardPayloadByteLength,
  guardTurnstileForPayload,
  guardTrustedOrigin,
  securityConfig,
} from "@/lib/security";
import { runAstrologyCalculator } from "@/modules/calculators/service";

export const dynamic = "force-dynamic";

type CalculatorPayload = {
  calculator?: unknown;
  input?: unknown;
  [key: string]: unknown;
};

function readText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asObject(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
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

  const limit = checkSecurityRateLimit({
    request,
    policyKey: "calculators-public",
  });

  if (!limit.allowed) {
    return apiErrorResponse({
      statusCode: 429,
      code: "RATE_LIMITED",
      message: "Too many calculator requests. Please retry shortly.",
      headers: limit.headers,
    });
  }

  const payload = (await readJsonObjectBody(request)) as CalculatorPayload | null;

  if (!payload) {
    return apiErrorResponse({
      statusCode: 400,
      code: "INVALID_REQUEST",
      message: "Calculator payload must be a JSON object.",
      headers: limit.headers,
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
      headers: limit.headers,
    });
  }

  const turnstileGuard = await guardTurnstileForPayload({
    request,
    payload,
    route: "api.astrology.calculators",
    headers: limit.headers,
  });

  if (turnstileGuard) {
    return turnstileGuard;
  }

  const calculator = readText(payload.calculator);
  const input = asObject(payload.input);

  if (!calculator || !input) {
    return apiErrorResponse({
      statusCode: 400,
      code: "MISSING_REQUIRED_FIELDS",
      message: "Calculator and input object are required.",
      headers: limit.headers,
    });
  }

  let result;

  switch (calculator) {
    case "nakshatra":
    case "moon-sign":
    case "lagna":
      result = await runAstrologyCalculator({
        calculator,
        input: {
          date: readText(input.date),
          time: readText(input.time),
          place: readText(input.place),
        },
      });
      break;
    case "birth-number":
      {
      const validation = validateNumerologyRequestInput({
        dateOfBirth: readText(input.dateOfBirth),
      });

      if (!validation.ok) {
        return apiErrorResponse({
          statusCode: 422,
          code: "INVALID_INPUT",
          message: getFirstAccuracyErrorMessage(
            validation.issues,
            "Date of birth is required."
          ),
          headers: limit.headers,
        });
      }

      result = await runAstrologyCalculator({
        calculator,
        input: {
          dateOfBirth: validation.data.dateOfBirth,
        },
      });
      }
      break;
    case "compatibility-quick":
      {
      const validation = validateCompatibilityRequestInput({
        firstDateOfBirth: readText(input.firstDateOfBirth),
        secondDateOfBirth: readText(input.secondDateOfBirth),
      });

      if (!validation.ok) {
        return apiErrorResponse({
          statusCode: 422,
          code: "INVALID_INPUT",
          message: getFirstAccuracyErrorMessage(
            validation.issues,
            "Both birth dates are required."
          ),
          headers: limit.headers,
        });
      }

      result = await runAstrologyCalculator({
        calculator,
        input: {
          firstDateOfBirth: validation.data.firstDateOfBirth,
          secondDateOfBirth: validation.data.secondDateOfBirth,
        },
      });
      }
      break;
    case "date-check":
      {
      const validation = validatePanchangRequestInput({
        date: readText(input.date),
        place: readText(input.place),
      });

      if (!validation.ok) {
        return apiErrorResponse({
          statusCode: 422,
          code: "INVALID_INPUT",
          message: getFirstAccuracyErrorMessage(
            validation.issues,
            "Date and place are required."
          ),
          headers: limit.headers,
        });
      }

      result = await runAstrologyCalculator({
        calculator,
        input: {
          date: validation.data.date,
          place: validation.data.place,
        },
      });
      }
      break;
    default:
      return apiErrorResponse({
        statusCode: 400,
        code: "INVALID_CALCULATOR",
        message: "Unsupported calculator type.",
        headers: limit.headers,
      });
  }

  if (!result.success) {
    return apiErrorResponse({
      statusCode:
        result.error.code === "CALCULATION_FAILED" ? 500 : 422,
      code: result.error.code,
      message: result.error.message,
      headers: limit.headers,
    });
  }

  return Response.json(
    {
      data: result.data,
    },
    {
      headers: limit.headers,
    }
  );
}
