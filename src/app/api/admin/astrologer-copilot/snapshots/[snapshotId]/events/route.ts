import { NextResponse } from "next/server";
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
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = (await request.json()) as { event?: string };

  if (payload.event !== "copy" && payload.event !== "export") {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  const { snapshotId } = await context.params;
  await trackAstrologerCopilotSnapshotEvent({
    snapshotId,
    event: payload.event,
  });

  return NextResponse.json({ ok: true });
}
