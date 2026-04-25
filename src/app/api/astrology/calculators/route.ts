import { apiErrorResponse, readJsonObjectBody } from "@/lib/api/http";
import { runAstrologyCalculator } from "@/modules/calculators/service";

export const dynamic = "force-dynamic";

type CalculatorPayload = {
  calculator?: unknown;
  input?: unknown;
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
  const payload = (await readJsonObjectBody(request)) as CalculatorPayload | null;

  if (!payload) {
    return apiErrorResponse({
      statusCode: 400,
      code: "INVALID_REQUEST",
      message: "Calculator payload must be a JSON object.",
    });
  }

  const calculator = readText(payload.calculator);
  const input = asObject(payload.input);

  if (!calculator || !input) {
    return apiErrorResponse({
      statusCode: 400,
      code: "MISSING_REQUIRED_FIELDS",
      message: "Calculator and input object are required.",
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
      result = await runAstrologyCalculator({
        calculator,
        input: {
          dateOfBirth: readText(input.dateOfBirth),
        },
      });
      break;
    case "compatibility-quick":
      result = await runAstrologyCalculator({
        calculator,
        input: {
          firstDateOfBirth: readText(input.firstDateOfBirth),
          secondDateOfBirth: readText(input.secondDateOfBirth),
        },
      });
      break;
    case "date-check":
      result = await runAstrologyCalculator({
        calculator,
        input: {
          date: readText(input.date),
          place: readText(input.place),
        },
      });
      break;
    default:
      return apiErrorResponse({
        statusCode: 400,
        code: "INVALID_CALCULATOR",
        message: "Unsupported calculator type.",
      });
  }

  if (!result.success) {
    return apiErrorResponse({
      statusCode:
        result.error.code === "CALCULATION_FAILED" ? 500 : 422,
      code: result.error.code,
      message: result.error.message,
    });
  }

  return Response.json({
    data: result.data,
  });
}
