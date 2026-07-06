import { apiErrorResponse, readJsonObjectBody } from "@/lib/api/http";
import { captureException } from "@/lib/observability";
import {
  checkSecurityRateLimit,
  guardPayloadByteLength,
  guardTrustedOrigin,
} from "@/lib/security";
import { getSession } from "@/modules/auth/server";
import {
  createDecisionRecord,
  decisionDeskErrorStatus,
  listDecisionRecords,
} from "@/modules/decision-desk";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getSession().catch((error) => {
    captureException(error, { route: "api.decision-desk.records", stage: "get-session" });
    return null;
  });

  if (!session) {
    return apiErrorResponse({
      statusCode: 401,
      code: "UNAUTHORIZED",
      message: "Sign in is required to access decision desk records.",
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

  try {
    const url = new URL(request.url);
    const result = await listDecisionRecords(session.user.id, url.searchParams);

    if (!result.success) {
      return apiErrorResponse({
        statusCode: decisionDeskErrorStatus(result.error.code),
        code: result.error.code,
        message: result.error.message,
        details: result.error.details,
        headers: limit.headers,
      });
    }

    return Response.json({ decisionDesk: result.data }, { headers: limit.headers });
  } catch (error) {
    captureException(error, {
      route: "api.decision-desk.records",
      userId: session.user.id,
      stage: "list",
    });

    return apiErrorResponse({
      statusCode: 500,
      code: "DECISION_DESK_LIST_FAILED",
      message: "Decision desk records could not be loaded. Please try again.",
      headers: limit.headers,
    });
  }
}

export async function POST(request: Request) {
  const originGuard = guardTrustedOrigin(request, { allowMissingOrigin: true });

  if (originGuard) {
    return originGuard;
  }

  const payloadGuard = guardPayloadByteLength(request);

  if (payloadGuard) {
    return payloadGuard;
  }

  const session = await getSession().catch((error) => {
    captureException(error, { route: "api.decision-desk.records", stage: "get-session" });
    return null;
  });

  if (!session) {
    return apiErrorResponse({
      statusCode: 401,
      code: "UNAUTHORIZED",
      message: "Sign in is required to create decision desk records.",
    });
  }

  const limit = checkSecurityRateLimit({
    request,
    policyKey: "decision-desk-create",
    identityParts: [session.user.id],
  });

  if (!limit.allowed) {
    return apiErrorResponse({
      statusCode: 429,
      code: "RATE_LIMITED",
      message: "Too many decision desk create requests. Please retry shortly.",
      headers: limit.headers,
    });
  }

  const payload = await readJsonObjectBody(request);

  if (!payload) {
    return apiErrorResponse({
      statusCode: 400,
      code: "INVALID_REQUEST",
      message: "Decision desk payload must be a JSON object.",
      headers: limit.headers,
    });
  }

  try {
    const result = await createDecisionRecord(session.user.id, payload);

    if (!result.success) {
      return apiErrorResponse({
        statusCode: decisionDeskErrorStatus(result.error.code),
        code: result.error.code,
        message: result.error.message,
        details: result.error.details,
        headers: limit.headers,
      });
    }

    return Response.json({ record: result.data }, { status: 201, headers: limit.headers });
  } catch (error) {
    captureException(error, {
      route: "api.decision-desk.records",
      userId: session.user.id,
      stage: "create",
    });

    return apiErrorResponse({
      statusCode: 500,
      code: "DECISION_DESK_CREATE_FAILED",
      message: "Decision desk record could not be created. Please try again.",
      headers: limit.headers,
    });
  }
}
