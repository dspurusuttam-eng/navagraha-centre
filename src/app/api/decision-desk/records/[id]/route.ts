import { apiErrorResponse, readJsonObjectBody } from "@/lib/api/http";
import { captureException } from "@/lib/observability";
import {
  checkSecurityRateLimit,
  guardPayloadByteLength,
  guardTrustedOrigin,
} from "@/lib/security";
import { getSession } from "@/modules/auth/server";
import {
  decisionDeskErrorStatus,
  deleteDecisionRecord,
  getDecisionRecord,
  updateDecisionRecord,
} from "@/modules/decision-desk";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

async function readRecordId(context: RouteContext) {
  const { id } = await context.params;
  const normalized = id.trim();

  if (!normalized || normalized.length > 128) {
    return null;
  }

  return normalized;
}

export async function GET(request: Request, context: RouteContext) {
  const session = await getSession().catch((error) => {
    captureException(error, { route: "api.decision-desk.record", stage: "get-session" });
    return null;
  });

  if (!session) {
    return apiErrorResponse({
      statusCode: 401,
      code: "UNAUTHORIZED",
      message: "Sign in is required to access this decision desk record.",
    });
  }

  const limit = checkSecurityRateLimit({
    request,
    policyKey: "decision-desk-read",
    identityParts: [session.user.id],
  });

  if (!limit.allowed) {
    return apiErrorResponse({
      statusCode: 429,
      code: "RATE_LIMITED",
      message: "Too many decision desk requests. Please retry shortly.",
      headers: limit.headers,
    });
  }

  const recordId = await readRecordId(context);

  if (!recordId) {
    return apiErrorResponse({
      statusCode: 400,
      code: "INVALID_RECORD_ID",
      message: "Decision desk record id is invalid.",
      headers: limit.headers,
    });
  }

  try {
    const result = await getDecisionRecord(session.user.id, recordId);

    if (!result.success) {
      return apiErrorResponse({
        statusCode: decisionDeskErrorStatus(result.error.code),
        code: result.error.code,
        message: result.error.message,
        details: result.error.details,
        headers: limit.headers,
      });
    }

    return Response.json({ record: result.data }, { headers: limit.headers });
  } catch (error) {
    captureException(error, {
      route: "api.decision-desk.record",
      userId: session.user.id,
      stage: "get",
    });

    return apiErrorResponse({
      statusCode: 500,
      code: "DECISION_DESK_FETCH_FAILED",
      message: "Decision desk record could not be loaded. Please try again.",
      headers: limit.headers,
    });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const originGuard = guardTrustedOrigin(request, { allowMissingOrigin: true });

  if (originGuard) {
    return originGuard;
  }

  const payloadGuard = guardPayloadByteLength(request);

  if (payloadGuard) {
    return payloadGuard;
  }

  const session = await getSession().catch((error) => {
    captureException(error, { route: "api.decision-desk.record", stage: "get-session" });
    return null;
  });

  if (!session) {
    return apiErrorResponse({
      statusCode: 401,
      code: "UNAUTHORIZED",
      message: "Sign in is required to update decision desk records.",
    });
  }

  const limit = checkSecurityRateLimit({
    request,
    policyKey: "decision-desk-mutate",
    identityParts: [session.user.id],
  });

  if (!limit.allowed) {
    return apiErrorResponse({
      statusCode: 429,
      code: "RATE_LIMITED",
      message: "Too many decision desk update requests. Please retry shortly.",
      headers: limit.headers,
    });
  }

  const recordId = await readRecordId(context);

  if (!recordId) {
    return apiErrorResponse({
      statusCode: 400,
      code: "INVALID_RECORD_ID",
      message: "Decision desk record id is invalid.",
      headers: limit.headers,
    });
  }

  const payload = await readJsonObjectBody(request);

  if (!payload) {
    return apiErrorResponse({
      statusCode: 400,
      code: "INVALID_REQUEST",
      message: "Decision desk update payload must be a JSON object.",
      headers: limit.headers,
    });
  }

  try {
    const result = await updateDecisionRecord(session.user.id, recordId, payload);

    if (!result.success) {
      return apiErrorResponse({
        statusCode: decisionDeskErrorStatus(result.error.code),
        code: result.error.code,
        message: result.error.message,
        details: result.error.details,
        headers: limit.headers,
      });
    }

    return Response.json({ record: result.data }, { headers: limit.headers });
  } catch (error) {
    captureException(error, {
      route: "api.decision-desk.record",
      userId: session.user.id,
      stage: "update",
    });

    return apiErrorResponse({
      statusCode: 500,
      code: "DECISION_DESK_UPDATE_FAILED",
      message: "Decision desk record could not be updated. Please try again.",
      headers: limit.headers,
    });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const originGuard = guardTrustedOrigin(request, { allowMissingOrigin: true });

  if (originGuard) {
    return originGuard;
  }

  const session = await getSession().catch((error) => {
    captureException(error, { route: "api.decision-desk.record", stage: "get-session" });
    return null;
  });

  if (!session) {
    return apiErrorResponse({
      statusCode: 401,
      code: "UNAUTHORIZED",
      message: "Sign in is required to delete decision desk records.",
    });
  }

  const limit = checkSecurityRateLimit({
    request,
    policyKey: "decision-desk-mutate",
    identityParts: [session.user.id],
  });

  if (!limit.allowed) {
    return apiErrorResponse({
      statusCode: 429,
      code: "RATE_LIMITED",
      message: "Too many decision desk delete requests. Please retry shortly.",
      headers: limit.headers,
    });
  }

  const recordId = await readRecordId(context);

  if (!recordId) {
    return apiErrorResponse({
      statusCode: 400,
      code: "INVALID_RECORD_ID",
      message: "Decision desk record id is invalid.",
      headers: limit.headers,
    });
  }

  try {
    const result = await deleteDecisionRecord(session.user.id, recordId);

    if (!result.success) {
      return apiErrorResponse({
        statusCode: decisionDeskErrorStatus(result.error.code),
        code: result.error.code,
        message: result.error.message,
        details: result.error.details,
        headers: limit.headers,
      });
    }

    return Response.json(
      { status: "deleted", id: result.data.id },
      { headers: limit.headers }
    );
  } catch (error) {
    captureException(error, {
      route: "api.decision-desk.record",
      userId: session.user.id,
      stage: "delete",
    });

    return apiErrorResponse({
      statusCode: 500,
      code: "DECISION_DESK_DELETE_FAILED",
      message: "Decision desk record could not be deleted. Please try again.",
      headers: limit.headers,
    });
  }
}
