import { apiErrorResponse } from "@/lib/api/http";
import { captureException } from "@/lib/observability";
import { getAnalyticsSummarySnapshot } from "@/lib/analytics/event-store";
import { getSession } from "@/modules/auth/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession().catch((error) => {
    captureException(error, {
      route: "api.analytics.summary",
      stage: "get-session",
    });

    return null;
  });

  if (!session) {
    return apiErrorResponse({
      statusCode: 401,
      code: "UNAUTHORIZED",
      message: "Sign in is required to read analytics summary.",
    });
  }

  try {
    return Response.json(
      {
        ok: true,
        summary: getAnalyticsSummarySnapshot(),
      },
      { status: 200 }
    );
  } catch (error) {
    captureException(error, {
      route: "api.analytics.summary",
      userId: session.user.id,
    });

    return apiErrorResponse({
      statusCode: 500,
      code: "ANALYTICS_SUMMARY_FAILED",
      message: "Analytics summary could not be loaded.",
    });
  }
}
