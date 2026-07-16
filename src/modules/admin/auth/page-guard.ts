// Claude Admin Console C3A1 — server-side /admin/* page guard (server-only).
// Redirects BEFORE any admin data is fetched/rendered: unauthenticated → /admin/login,
// authenticated non-admin (or wrong role) → /admin/denied. Reuses the same session +
// AdminRoleAssignment lookup as requireAdminSession, but never touches public routes.
import "server-only";

import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/server";
import { getPrisma } from "@/lib/prisma";
import { hasAdminAccess, type AdminRoleKey, type AdminRoleSummary } from "@/modules/admin/permissions";
import { ADMIN_DENIED_PATH, ADMIN_LOGIN_PATH } from "@/modules/admin/auth/access";

export type AdminPageSession = {
  user: { id: string; name: string; email: string };
  adminRole: AdminRoleSummary;
  adminRoles: AdminRoleSummary[];
};

export async function requireAdminPageSession(
  options: { allowedRoles?: readonly AdminRoleKey[] } = {},
): Promise<AdminPageSession> {
  const session = await getSession();
  if (!session) {
    redirect(ADMIN_LOGIN_PATH);
  }

  const assignments = await getPrisma().adminRoleAssignment.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    select: { role: { select: { key: true, name: true } } },
  });
  const adminRoles: AdminRoleSummary[] = assignments.map((assignment) => assignment.role);

  if (!adminRoles.length) {
    redirect(ADMIN_DENIED_PATH);
  }
  if (options.allowedRoles?.length && !hasAdminAccess(adminRoles, options.allowedRoles)) {
    redirect(ADMIN_DENIED_PATH);
  }

  return {
    user: { id: session.user.id, name: session.user.name, email: session.user.email },
    adminRole: adminRoles[0]!,
    adminRoles,
  };
}

/** Returns the admin session if the visitor is an approved admin, else null (no redirect). */
export async function getAdminPageSessionOrNull(): Promise<AdminPageSession | null> {
  const session = await getSession();
  if (!session) return null;
  const assignments = await getPrisma().adminRoleAssignment.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    select: { role: { select: { key: true, name: true } } },
  });
  const adminRoles: AdminRoleSummary[] = assignments.map((assignment) => assignment.role);
  if (!adminRoles.length) return null;
  return {
    user: { id: session.user.id, name: session.user.name, email: session.user.email },
    adminRole: adminRoles[0]!,
    adminRoles,
  };
}
