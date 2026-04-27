import {
  apiErrorResponse,
  readJsonObjectBody,
} from "@/lib/api/http";
import {
  checkSecurityRateLimit,
  getAiTemporarilyUnavailableMessage,
  guardPayloadByteLength,
  guardTrustedOrigin,
} from "@/lib/security";
import { captureException, trackServerEvent } from "@/lib/observability";
import { getSession } from "@/modules/auth/server";
import {
  listAskMyChartSessions,
  sendAskMyChartMessage,
} from "@/modules/ask-chart/service";
import { getLocaleDefinition } from "@/modules/localization/config";
import { resolveLocaleFromRequest } from "@/modules/localization/request";

export const dynamic = "force-dynamic";
const maxAssistantMessageLength = 700;

export async function POST(
  request: Request,
  context: {
    params: Promise<{
      sessionId: string;
    }>;
  }
) {
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

  const session = await getSession().catch((error) => {
    captureException(error, {
      route: "api.ai.ask-chart.messages",
      stage: "get-session",
    });

    return null;
  });

  if (!session) {
    return apiErrorResponse({
      statusCode: 401,
      code: "UNAUTHORIZED",
      message: "Sign in is required to use Ask My Chart.",
    });
  }

  const limit = checkSecurityRateLimit({
    request,
    policyKey: "ai-message",
    identityParts: [session.user.id],
  });

  if (!limit.allowed) {
    trackServerEvent(
      "ask-chart.message.rate-limited",
      {
        userId: session.user.id,
        route: "api.ai.ask-chart.messages",
      },
      "warning"
    );

    return apiErrorResponse({
      statusCode: 429,
      code: "RATE_LIMITED",
      message:
        "Too many assistant requests. Please wait briefly and try again.",
      headers: limit.headers,
    });
  }

  const payload = await readJsonObjectBody(request);

  if (!payload) {
    return apiErrorResponse({
      statusCode: 400,
      code: "INVALID_REQUEST",
      message: "Assistant request payload must be a JSON object.",
      headers: limit.headers,
    });
  }

  const message = typeof payload.message === "string" ? payload.message : "";
  const normalizedMessage = message.trim();

  if (!normalizedMessage) {
    return apiErrorResponse({
      statusCode: 400,
      code: "INVALID_MESSAGE",
      message: "Enter a chart question before sending.",
      headers: limit.headers,
    });
  }

  if (normalizedMessage.length > maxAssistantMessageLength) {
    return apiErrorResponse({
      statusCode: 400,
      code: "MESSAGE_TOO_LONG",
      message: `Keep each question within ${maxAssistantMessageLength} characters.`,
      headers: limit.headers,
    });
  }

  const { sessionId } = await context.params;
  const normalizedSessionId = sessionId.trim();

  if (!normalizedSessionId) {
    return apiErrorResponse({
      statusCode: 400,
      code: "INVALID_SESSION",
      message: "Session id is required.",
      headers: limit.headers,
    });
  }

  try {
    const requestLocale = resolveLocaleFromRequest(request);
    const requestLocaleLabel = getLocaleDefinition(requestLocale).label;
    const result = await sendAskMyChartMessage({
      userId: session.user.id,
      userName: session.user.name,
      sessionId: normalizedSessionId,
      message: normalizedMessage,
      localeCode: requestLocale,
      localeLabel: requestLocaleLabel,
    });

    if (result.status === "LIMIT_REACHED") {
      return Response.json(result, {
        status: 200,
        headers: limit.headers,
      });
    }

    const conversation = result.conversation;

    if (!conversation) {
      return apiErrorResponse({
        statusCode: 500,
        code: "CONVERSATION_UNAVAILABLE",
        message: "Conversation could not be loaded after sending.",
        headers: limit.headers,
      });
    }

    const sessions = await listAskMyChartSessions(session.user.id);

    return Response.json({
      status: "READY",
      conversation,
      sessions,
      planType: result.planType,
      aiQuestionsUsedToday: result.aiQuestionsUsedToday,
      aiQuestionsLimitPerDay: result.aiQuestionsLimitPerDay,
      aiQuestionsRemainingToday: result.aiQuestionsRemainingToday,
      premiumNudge: result.premiumNudge,
    }, {
      headers: limit.headers,
    });
  } catch (error) {
    captureException(error, {
      route: "api.ai.ask-chart.messages",
      userId: session.user.id,
      sessionId: normalizedSessionId,
    });

    return apiErrorResponse({
      statusCode: 500,
      code: "ASSISTANT_RESPONSE_FAILED",
      message: getAiTemporarilyUnavailableMessage(resolveLocaleFromRequest(request)),
      headers: limit.headers,
    });
  }
}
