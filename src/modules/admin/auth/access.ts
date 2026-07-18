// Claude Admin Console C3A1 — pure admin page-access decision (no server-only, no DB).
import { hasAdminAccess, type AdminRoleKey, type AdminRoleSummary } from "@/modules/admin/permissions";

export const ADMIN_LOGIN_PATH = "/admin/login";
export const ADMIN_DENIED_PATH = "/admin/denied";

export type AdminPageAccessInput = {
  authenticated: boolean;
  adminRoles: readonly Pick<AdminRoleSummary, "key">[];
  allowedRoles?: readonly AdminRoleKey[];
};

export type AdminPageAccessDecision = { ok: true } | { ok: false; redirectTo: string };

/**
 * Deterministic page-level access decision for /admin/*.
 * Unauthenticated → admin login; authenticated non-admin (or wrong role) → controlled denial.
 */
export function evaluateAdminPageAccess(input: AdminPageAccessInput): AdminPageAccessDecision {
  if (!input.authenticated) return { ok: false, redirectTo: ADMIN_LOGIN_PATH };
  if (!input.adminRoles.length) return { ok: false, redirectTo: ADMIN_DENIED_PATH };
  if (input.allowedRoles?.length && !hasAdminAccess(input.adminRoles, input.allowedRoles)) {
    return { ok: false, redirectTo: ADMIN_DENIED_PATH };
  }
  return { ok: true };
}

/** Whether a set of role keys grants approved admin access. */
export function isApprovedAdmin(adminRoles: readonly Pick<AdminRoleSummary, "key">[]): boolean {
  return adminRoles.length > 0;
}
