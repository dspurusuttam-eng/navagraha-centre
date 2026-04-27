import { NextResponse } from "next/server";
import { apiErrorResponse, readJsonObjectBody } from "@/lib/api/http";
import { captureException } from "@/lib/observability";
import {
  checkSecurityRateLimit,
  guardPayloadByteLength,
  guardTrustedOrigin,
} from "@/lib/security";
import { getSession } from "@/modules/auth/server";
import { getPrisma } from "@/lib/prisma";
import { hasAdminAccess } from "@/modules/admin/permissions";
import { trackAstrologerCopilotSnapshotEvent } from "@/modules/astrologer-copilot/service";

type Params = {
  params: Promise<{
    snapshotId: string;
  }>;
};

export async function POST(request: Request, context: Params) {
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
      route: "api.admin.astrologer-copilot.snapshot-events",
      stage: "get-session",
    });

    return null;
  });

  if (!session) {
    return apiErrorResponse({
      statusCode: 401,
      code: "UNAUTHORIZED",
      message: "Sign in is required for this admin endpoint.",
    });
  }

  const routeLimit = checkSecurityRateLimit({
    request,
    policyKey: "admin-snapshot-events",
    identityParts: [session.user.id],
  });

  if (!routeLimit.allowed) {
    return apiErrorResponse({
      statusCode: 429,
      code: "RATE_LIMITED",
      message: "Too many admin event requests. Please retry shortly.",
      headers: routeLimit.headers,
    });
  }

  try {
    const assignments = await getPrisma().adminRoleAssignment.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        role: {
          select: {
            key: true,
            name: true,
          },
        },
      },
    });
    const roles = assignments.map((assignment) => assignment.role);

    if (!hasAdminAccess(roles, ["founder", "support"])) {
      return apiErrorResponse({
        statusCode: 403,
        code: "FORBIDDEN",
        message: "You do not have access to this admin endpoint.",
        headers: routeLimit.headers,
      });
    }

    const payload = await readJsonObjectBody(request);

    const event = typeof payload?.event === "string" ? payload.event : "";

    if (event !== "copy" && event !== "export") {
      return apiErrorResponse({
        statusCode: 400,
        code: "INVALID_EVENT",
        message: "Invalid snapshot event.",
        headers: routeLimit.headers,
      });
    }

    const { snapshotId } = await context.params;

    if (!snapshotId.trim() || snapshotId.length > 120) {
      return apiErrorResponse({
        statusCode: 400,
        code: "INVALID_SNAPSHOT_ID",
        message: "Snapshot id is invalid.",
        headers: routeLimit.headers,
      });
    }

    await trackAstrologerCopilotSnapshotEvent({
      snapshotId,
      event,
    });

    return NextResponse.json(
      { ok: true },
      {
        headers: routeLimit.headers,
      }
    );
  } catch (error) {
    captureException(error, {
      route: "api.admin.astrologer-copilot.snapshot-events",
      userId: session.user.id,
    });

    return apiErrorResponse({
      statusCode: 500,
      code: "SNAPSHOT_EVENT_FAILED",
      message: "Snapshot event could not be recorded.",
      headers: routeLimit.headers,
    });
  }
}
