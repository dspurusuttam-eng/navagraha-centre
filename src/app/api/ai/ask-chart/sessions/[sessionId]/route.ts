import { apiErrorResponse } from "@/lib/api/http";
import { captureException } from "@/lib/observability";
import { getSession } from "@/modules/auth/server";
import { getAskMyChartConversation } from "@/modules/ask-chart/service";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{
      sessionId: string;
    }>;
  }
) {
  const session = await getSession().catch((error) => {
    captureException(error, {
      route: "api.ai.ask-chart.session",
      stage: "get-session",
    });

    return null;
  });

  if (!session) {
    return apiErrorResponse({
      statusCode: 401,
      code: "UNAUTHORIZED",
      message: "Sign in is required to access this conversation.",
    });
  }

  const { sessionId } = await context.params;

  if (!sessionId.trim()) {
    return apiErrorResponse({
      statusCode: 400,
      code: "INVALID_SESSION",
      message: "Session id is required.",
    });
  }

  let conversation;

  try {
    conversation = await getAskMyChartConversation(session.user.id, sessionId);
  } catch (error) {
    captureException(error, {
      route: "api.ai.ask-chart.session",
      userId: session.user.id,
      sessionId,
    });

    return apiErrorResponse({
      statusCode: 500,
      code: "CONVERSATION_FETCH_FAILED",
      message: "Conversation data could not be loaded.",
    });
  }

  if (!conversation) {
    return apiErrorResponse({
      statusCode: 404,
      code: "CONVERSATION_NOT_FOUND",
      message: "Conversation could not be found.",
    });
  }

  return Response.json({
    conversation,
  });
}
