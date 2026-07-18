// Claude Admin Console C1B — /api/admin/* authorization guard (server-only).
// Reuses the same session + AdminRoleAssignment lookup as requireAdminSession, but
// returns controlled JSON 401/403 (no redirects, no sensitive detail) for API routes.
import "server-only";

import { NextResponse } from "next/server";
import { getSession } from "@/modules/auth/server";
import { getPrisma } from "@/lib/prisma";
import { type AdminRoleKey, type AdminRoleSummary } from "@/modules/admin/permissions";
import {
  adminApiDenialBody,
  evaluateAdminApiAccess,
  UNAUTHENTICATED_DENIAL,
  type AdminApiDenial,
} from "@/modules/admin/access-policy";

export function buildAdminApiErrorResponse(denial: AdminApiDenial): NextResponse {
  return NextResponse.json(adminApiDenialBody(denial), { status: denial.status });
}

export type AdminApiContext = {
  userId: string;
  userEmail: string;
  adminRoles: AdminRoleSummary[];
  primaryRoleKey: string | null;
};

export type RequireAdminApiResult =
  | { ok: true; context: AdminApiContext }
  | { ok: false; response: NextResponse };

export async function requireAdminApi(
  options: { allowedRoles?: readonly AdminRoleKey[] } = {},
): Promise<RequireAdminApiResult> {
  const session = await getSession();
  if (!session) {
    return { ok: false, response: buildAdminApiErrorResponse(UNAUTHENTICATED_DENIAL) };
  }

  const assignments = await getPrisma().adminRoleAssignment.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    select: { role: { select: { key: true, name: true } } },
  });
  const adminRoles: AdminRoleSummary[] = assignments.map((assignment) => assignment.role);

  const decision = evaluateAdminApiAccess({
    authenticated: true,
    adminRoles,
    allowedRoles: options.allowedRoles,
  });
  if (!decision.ok) {
    return { ok: false, response: buildAdminApiErrorResponse(decision.denial) };
  }

  return {
    ok: true,
    context: {
      userId: session.user.id,
      userEmail: session.user.email,
      adminRoles,
      primaryRoleKey: adminRoles[0]?.key ?? null,
    },
  };
}
