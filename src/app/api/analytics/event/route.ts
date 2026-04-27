import {
  apiErrorResponse,
  isPlainObject,
  readJsonObjectBody,
} from "@/lib/api/http";
import {
  checkSecurityRateLimit,
  guardPayloadByteLength,
  guardTrustedOrigin,
} from "@/lib/security";
import { captureException } from "@/lib/observability";
import { getSession } from "@/modules/auth/server";
import {
  isTrackedEventName,
  recordAnalyticsEventSafely,
} from "@/lib/analytics/event-store";
import type { AnalyticsEventPayload } from "@/lib/analytics/types";

export const dynamic = "force-dynamic";

type EventRequestBody = Record<string, unknown> & {
  event?: unknown;
  payload?: unknown;
  userId?: unknown;
};

function toPayload(value: unknown): AnalyticsEventPayload {
  if (!isPlainObject(value)) {
    return {};
  }

  const payload: AnalyticsEventPayload = {};

  for (const [key, entry] of Object.entries(value)) {
    if (
      entry === null ||
      entry === undefined ||
      typeof entry === "string" ||
      typeof entry === "number" ||
      typeof entry === "boolean"
    ) {
      payload[key] = entry;
    }
  }

  return payload;
}

function toUserId(
  sessionUserId: string | null,
  payloadUserId: unknown
) {
  if (sessionUserId) {
    return sessionUserId;
  }

  if (
    process.env.NODE_ENV !== "production" &&
    typeof payloadUserId === "string" &&
    payloadUserId.trim().length
  ) {
    return payloadUserId.trim().slice(0, 128);
  }

  return null;
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
    policyKey: "analytics-event",
  });

  if (!limit.allowed) {
    return apiErrorResponse({
      statusCode: 429,
      code: "RATE_LIMITED",
      message: "Too many analytics events. Please retry later.",
      headers: limit.headers,
    });
  }

  const body = (await readJsonObjectBody(request)) as EventRequestBody | null;

  if (!body) {
    return apiErrorResponse({
      statusCode: 400,
      code: "INVALID_REQUEST",
      message: "Analytics payload must be a JSON object.",
      headers: limit.headers,
    });
  }

  const event =
    typeof body?.event === "string" ? body.event.trim() : "";

  if (!isTrackedEventName(event)) {
    return apiErrorResponse({
      statusCode: 400,
      code: "INVALID_EVENT_NAME",
      message: "Invalid analytics event name.",
      headers: limit.headers,
    });
  }

  const session = await getSession().catch((error) => {
    captureException(error, {
      route: "api.analytics.event",
      stage: "get-session",
      event,
    });

    return null;
  });
  const record = recordAnalyticsEventSafely({
    event,
    payload: toPayload(body?.payload),
    userId: toUserId(session?.user.id ?? null, body?.userId),
  });

  if (!record) {
    return Response.json(
      {
        ok: false,
        accepted: true,
      },
      {
        status: 202,
        headers: limit.headers,
      }
    );
  }

  return Response.json(
    {
      ok: true,
      id: record.id,
      event: record.event,
      receivedAtUtc: record.receivedAtUtc,
    },
    {
      status: 201,
      headers: limit.headers,
    }
  );
}
