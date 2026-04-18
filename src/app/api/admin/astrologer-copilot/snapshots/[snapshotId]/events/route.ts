import { NextResponse } from "next/server";
import { apiErrorResponse, readJsonObjectBody } from "@/lib/api/http";
import { captureException } from "@/lib/observability";
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
      });
    }

    const payload = await readJsonObjectBody(request);

    const event = typeof payload?.event === "string" ? payload.event : "";

    if (event !== "copy" && event !== "export") {
      return apiErrorResponse({
        statusCode: 400,
        code: "INVALID_EVENT",
        message: "Invalid snapshot event.",
      });
    }

    const { snapshotId } = await context.params;
    await trackAstrologerCopilotSnapshotEvent({
      snapshotId,
      event,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    captureException(error, {
      route: "api.admin.astrologer-copilot.snapshot-events",
      userId: session.user.id,
    });

    return apiErrorResponse({
      statusCode: 500,
      code: "SNAPSHOT_EVENT_FAILED",
      message: "Snapshot event could not be recorded.",
    });
  }
}
