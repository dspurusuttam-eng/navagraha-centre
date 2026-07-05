import { apiErrorResponse, readJsonObjectBody } from "@/lib/api/http";
import { captureException } from "@/lib/observability";
import {
  checkSecurityRateLimit,
  guardPayloadByteLength,
  guardTrustedOrigin,
} from "@/lib/security";
import { getSession } from "@/modules/auth/server";
import {
  createSavedKundliRecord,
  listSavedKundliRecords,
  savedKundliErrorStatus,
} from "@/modules/account/saved-kundli-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getSession().catch((error) => {
    captureException(error, {
      route: "api.kundli.saved",
      stage: "get-session",
    });

    return null;
  });

  if (!session) {
    return apiErrorResponse({
      statusCode: 401,
      code: "UNAUTHORIZED",
      message: "Sign in is required to access saved kundli records.",
    });
  }

  const limit = checkSecurityRateLimit({
    request,
    policyKey: "saved-kundli-read",
    identityParts: [session.user.id],
  });

  if (!limit.allowed) {
    return apiErrorResponse({
      statusCode: 429,
      code: "RATE_LIMITED",
      message: "Too many saved kundli requests. Please retry shortly.",
      headers: limit.headers,
    });
  }

  try {
    const catalog = await listSavedKundliRecords(session.user.id);

    if (!catalog.success) {
      return apiErrorResponse({
        statusCode: savedKundliErrorStatus(catalog.error.code),
        code: catalog.error.code,
        message: catalog.error.message,
        details: catalog.error.details,
        headers: limit.headers,
      });
    }

    return Response.json(
      {
        savedKundli: catalog.data,
      },
      {
        headers: limit.headers,
      }
    );
  } catch (error) {
    captureException(error, {
      route: "api.kundli.saved",
      userId: session.user.id,
      stage: "list",
    });

    return apiErrorResponse({
      statusCode: 500,
      code: "SAVED_KUNDLI_LIST_FAILED",
      message: "Saved kundli records could not be loaded. Please try again.",
      headers: limit.headers,
    });
  }
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

  const session = await getSession().catch((error) => {
    captureException(error, {
      route: "api.kundli.saved",
      stage: "get-session",
    });

    return null;
  });

  if (!session) {
    return apiErrorResponse({
      statusCode: 401,
      code: "UNAUTHORIZED",
      message: "Sign in is required to save kundli records.",
    });
  }

  const limit = checkSecurityRateLimit({
    request,
    policyKey: "saved-kundli-create",
    identityParts: [session.user.id],
  });

  if (!limit.allowed) {
    return apiErrorResponse({
      statusCode: 429,
      code: "RATE_LIMITED",
      message: "Too many saved kundli create requests. Please retry shortly.",
      headers: limit.headers,
    });
  }

  const payload = await readJsonObjectBody(request);

  if (!payload) {
    return apiErrorResponse({
      statusCode: 400,
      code: "INVALID_REQUEST",
      message: "Saved kundli payload must be a JSON object.",
      headers: limit.headers,
    });
  }

  try {
    const created = await createSavedKundliRecord(session.user.id, payload);

    if (!created.success) {
      return apiErrorResponse({
        statusCode: savedKundliErrorStatus(created.error.code),
        code: created.error.code,
        message: created.error.message,
        details: created.error.details,
        headers: limit.headers,
      });
    }

    return Response.json(created.data, {
      status: 201,
      headers: limit.headers,
    });
  } catch (error) {
    captureException(error, {
      route: "api.kundli.saved",
      userId: session.user.id,
      stage: "create",
    });

    return apiErrorResponse({
      statusCode: 500,
      code: "SAVED_KUNDLI_CREATE_FAILED",
      message: "Saved kundli record could not be created. Please try again.",
      headers: limit.headers,
    });
  }
}
