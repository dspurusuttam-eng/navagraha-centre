import { apiErrorResponse } from "@/lib/api/http";
import { captureException } from "@/lib/observability";
import { checkSecurityRateLimit } from "@/lib/security";
import { getSession } from "@/modules/auth/server";
import { getAskMyChartConversation } from "@/modules/ask-chart/service";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
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
  const normalizedSessionId = sessionId.trim();
  const readLimit = checkSecurityRateLimit({
    request,
    policyKey: "ai-session-read",
    identityParts: [session.user.id, normalizedSessionId],
  });

  if (!readLimit.allowed) {
    return apiErrorResponse({
      statusCode: 429,
      code: "RATE_LIMITED",
      message: "Too many conversation requests. Please retry shortly.",
      headers: readLimit.headers,
    });
  }

  if (!normalizedSessionId) {
    return apiErrorResponse({
      statusCode: 400,
      code: "INVALID_SESSION",
      message: "Session id is required.",
      headers: readLimit.headers,
    });
  }

  if (normalizedSessionId.length > 128) {
    return apiErrorResponse({
      statusCode: 400,
      code: "INVALID_SESSION",
      message: "Session id is invalid.",
      headers: readLimit.headers,
    });
  }

  let conversation;

  try {
    conversation = await getAskMyChartConversation(
      session.user.id,
      normalizedSessionId
    );
  } catch (error) {
    captureException(error, {
      route: "api.ai.ask-chart.session",
      userId: session.user.id,
      sessionId: normalizedSessionId,
    });

    return apiErrorResponse({
      statusCode: 500,
      code: "CONVERSATION_FETCH_FAILED",
      message: "Conversation data could not be loaded.",
      headers: readLimit.headers,
    });
  }

  if (!conversation) {
    return apiErrorResponse({
      statusCode: 404,
      code: "CONVERSATION_NOT_FOUND",
      message: "Conversation could not be found.",
      headers: readLimit.headers,
    });
  }

  return Response.json(
    {
      conversation,
    },
    {
      headers: readLimit.headers,
    }
  );
}
