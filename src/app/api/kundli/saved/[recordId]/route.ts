import { apiErrorResponse, readJsonObjectBody } from "@/lib/api/http";
import { captureException } from "@/lib/observability";
import {
  checkSecurityRateLimit,
  guardPayloadByteLength,
  guardTrustedOrigin,
} from "@/lib/security";
import { getSession } from "@/modules/auth/server";
import {
  deleteSavedKundliRecord,
  savedKundliErrorStatus,
  updateSavedKundliRecord,
} from "@/modules/account/saved-kundli-service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    recordId: string;
  }>;
};

async function readRecordId(context: RouteContext) {
  const { recordId } = await context.params;
  const normalized = recordId.trim();

  if (!normalized || normalized.length > 128) {
    return null;
  }

  return normalized;
}

export async function PUT(request: Request, context: RouteContext) {
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
      route: "api.kundli.saved.record",
      stage: "get-session",
    });

    return null;
  });

  if (!session) {
    return apiErrorResponse({
      statusCode: 401,
      code: "UNAUTHORIZED",
      message: "Sign in is required to update saved kundli records.",
    });
  }

  const limit = checkSecurityRateLimit({
    request,
    policyKey: "saved-kundli-mutate",
    identityParts: [session.user.id],
  });

  if (!limit.allowed) {
    return apiErrorResponse({
      statusCode: 429,
      code: "RATE_LIMITED",
      message: "Too many saved kundli update requests. Please retry shortly.",
      headers: limit.headers,
    });
  }

  const recordId = await readRecordId(context);

  if (!recordId) {
    return apiErrorResponse({
      statusCode: 400,
      code: "INVALID_RECORD_ID",
      message: "Saved kundli record id is invalid.",
      headers: limit.headers,
    });
  }

  const payload = await readJsonObjectBody(request);

  if (!payload) {
    return apiErrorResponse({
      statusCode: 400,
      code: "INVALID_REQUEST",
      message: "Saved kundli update payload must be a JSON object.",
      headers: limit.headers,
    });
  }

  try {
    const updated = await updateSavedKundliRecord(
      session.user.id,
      recordId,
      payload
    );

    if (!updated.success) {
      return apiErrorResponse({
        statusCode: savedKundliErrorStatus(updated.error.code),
        code: updated.error.code,
        message: updated.error.message,
        details: updated.error.details,
        headers: limit.headers,
      });
    }

    return Response.json(updated.data, {
      headers: limit.headers,
    });
  } catch (error) {
    captureException(error, {
      route: "api.kundli.saved.record",
      userId: session.user.id,
      stage: "update",
    });

    return apiErrorResponse({
      statusCode: 500,
      code: "SAVED_KUNDLI_UPDATE_FAILED",
      message: "Saved kundli record could not be updated. Please try again.",
      headers: limit.headers,
    });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const originGuard = guardTrustedOrigin(request, {
    allowMissingOrigin: true,
  });

  if (originGuard) {
    return originGuard;
  }

  const session = await getSession().catch((error) => {
    captureException(error, {
      route: "api.kundli.saved.record",
      stage: "get-session",
    });

    return null;
  });

  if (!session) {
    return apiErrorResponse({
      statusCode: 401,
      code: "UNAUTHORIZED",
      message: "Sign in is required to delete saved kundli records.",
    });
  }

  const limit = checkSecurityRateLimit({
    request,
    policyKey: "saved-kundli-mutate",
    identityParts: [session.user.id],
  });

  if (!limit.allowed) {
    return apiErrorResponse({
      statusCode: 429,
      code: "RATE_LIMITED",
      message: "Too many saved kundli delete requests. Please retry shortly.",
      headers: limit.headers,
    });
  }

  const recordId = await readRecordId(context);

  if (!recordId) {
    return apiErrorResponse({
      statusCode: 400,
      code: "INVALID_RECORD_ID",
      message: "Saved kundli record id is invalid.",
      headers: limit.headers,
    });
  }

  try {
    const deleted = await deleteSavedKundliRecord(session.user.id, recordId);

    if (!deleted.success) {
      return apiErrorResponse({
        statusCode: savedKundliErrorStatus(deleted.error.code),
        code: deleted.error.code,
        message: deleted.error.message,
        details: deleted.error.details,
        headers: limit.headers,
      });
    }

    return Response.json(
      {
        status: "deleted",
        id: deleted.data.id,
      },
      {
        headers: limit.headers,
      }
    );
  } catch (error) {
    captureException(error, {
      route: "api.kundli.saved.record",
      userId: session.user.id,
      stage: "delete",
    });

    return apiErrorResponse({
      statusCode: 500,
      code: "SAVED_KUNDLI_DELETE_FAILED",
      message: "Saved kundli record could not be deleted. Please try again.",
      headers: limit.headers,
    });
  }
}
