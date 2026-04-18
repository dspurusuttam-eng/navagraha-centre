import { apiErrorResponse } from "@/lib/api/http";
import {
  buildRateLimitKey,
  checkRateLimit,
  getClientAddress,
  getRateLimitHeaders,
} from "@/lib/rate-limit";
import { captureException, trackServerEvent } from "@/lib/observability";
import { getSession } from "@/modules/auth/server";
import {
  createAskMyChartSession,
  listAskMyChartSessions,
} from "@/modules/ask-chart/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession().catch((error) => {
    captureException(error, {
      route: "api.ai.ask-chart.sessions",
      method: "GET",
      stage: "get-session",
    });

    return null;
  });

  if (!session) {
    return apiErrorResponse({
      statusCode: 401,
      code: "UNAUTHORIZED",
      message: "Sign in is required to view Ask My Chart sessions.",
    });
  }

  try {
    const sessions = await listAskMyChartSessions(session.user.id);

    return Response.json({
      sessions,
    });
  } catch (error) {
    captureException(error, {
      route: "api.ai.ask-chart.sessions",
      method: "GET",
      userId: session.user.id,
    });

    return apiErrorResponse({
      statusCode: 500,
      code: "SESSION_LIST_FAILED",
      message: "Ask My Chart sessions could not be loaded.",
    });
  }
}

export async function POST(request: Request) {
  const session = await getSession().catch((error) => {
    captureException(error, {
      route: "api.ai.ask-chart.sessions",
      method: "POST",
      stage: "get-session",
    });

    return null;
  });

  if (!session) {
    return apiErrorResponse({
      statusCode: 401,
      code: "UNAUTHORIZED",
      message: "Sign in is required to start Ask My Chart.",
    });
  }

  const limit = checkRateLimit({
    key: buildRateLimitKey([
      "api-ask-chart-create-session",
      session.user.id,
      getClientAddress(request),
    ]),
    limit: 20,
    windowMs: 10 * 60 * 1_000,
  });

  if (!limit.allowed) {
    trackServerEvent(
      "ask-chart.session-create.rate-limited",
      {
        userId: session.user.id,
        route: "api.ai.ask-chart.sessions",
      },
      "warning"
    );

    return apiErrorResponse({
      statusCode: 429,
      code: "RATE_LIMITED",
      message: "Too many session requests. Please wait and try again.",
      headers: getRateLimitHeaders(limit),
    });
  }

  try {
    const createdSession = await createAskMyChartSession(session.user.id);

    return Response.json(
      {
        session: createdSession,
      },
      {
        status: 201,
        headers: getRateLimitHeaders(limit),
      }
    );
  } catch (error) {
    captureException(error, {
      route: "api.ai.ask-chart.sessions",
      method: "POST",
      userId: session.user.id,
    });

    return apiErrorResponse({
      statusCode: 500,
      code: "SESSION_CREATE_FAILED",
      message: "A new Ask My Chart session could not be created.",
      headers: getRateLimitHeaders(limit),
    });
  }
}
