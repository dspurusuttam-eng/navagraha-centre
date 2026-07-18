// Claude Admin Console C1B — protected admin health endpoint (authorization QA only).
// GET /api/admin/health → 401 (unauthenticated) / 403 (non-admin) / 200 (admin).
// Returns no secrets, session tokens, or cookies.
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/modules/admin/api-guard";
import { writeAuditLog } from "@/modules/admin/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireAdminApi();
  if (!guard.ok) {
    return guard.response;
  }

  await writeAuditLog({
    actorUserId: guard.context.userId,
    actorRoleKey: guard.context.primaryRoleKey,
    entityType: "admin_health",
    entityId: "health",
    action: "admin.health.check",
    summary: "Admin health check accessed.",
    metadata: { roleCount: guard.context.adminRoles.length },
  });

  return NextResponse.json({
    status: "ok",
    roles: guard.context.adminRoles.map((role) => role.key),
    serverTimeUtc: new Date().toISOString(),
  });
}
