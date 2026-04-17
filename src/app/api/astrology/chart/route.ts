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
  const session = await getSession();

  if (!session) {
    return Response.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Sign in is required to access chart data.",
        },
      },
      { status: 401 }
    );
  }

  const payload = (await request.json().catch(() => ({}))) as
    | ChartContractRequestPayload
    | null;

  if (payload && typeof payload !== "object") {
    return Response.json(
      {
        error: {
          code: "INVALID_REQUEST",
          message: "Chart request payload must be a JSON object.",
        },
      },
      { status: 400 }
    );
  }

  if (
    payload &&
    payload.source !== undefined &&
    payload.source !== "PROFILE"
  ) {
    return Response.json(
      {
        error: {
          code: "INVALID_SOURCE",
          message: 'Unsupported chart source. Use "PROFILE" or omit source.',
        },
      },
      { status: 400 }
    );
  }

  const result = await retrieveOrRefreshBirthChartForUser(session.user.id);

  if (!result.success) {
    return Response.json(
      {
        error: result.error,
      },
      { status: toErrorStatus(result.error.code) }
    );
  }

  return Response.json({
    chart: result.data.chart,
    persistence: result.data.persistence,
    retrieval: result.data.retrieval,
  });
}
