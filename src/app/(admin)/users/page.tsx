import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { AdminPageIntro } from "@/modules/admin/components/admin-page-intro";
import { AdminStatusBadge } from "@/modules/admin/components/admin-status-badge";
import {
  assignAdminRoleAction,
  removeAdminRoleAction,
} from "@/modules/admin/actions";
import { formatAdminDateTime } from "@/modules/admin/format";
import { buildAdminMetadata } from "@/modules/admin/metadata";
import { adminRoleKeys } from "@/modules/admin/permissions";
import { listAdminUsers } from "@/modules/admin/service";
import { requireAdminSession } from "@/modules/auth/server";

export const metadata = buildAdminMetadata({
  title: "Admin Users",
  description:
    "Review member accounts, role assignments, and internal access boundaries inside the NAVAGRAHA CENTRE control panel.",
  path: "/admin/users",
  keywords: ["admin users", "role management", "member access"],
});

export default async function AdminUsersPage() {
  const session = await requireAdminSession({
    allowedRoles: ["founder"],
  });
  const users = await listAdminUsers();

  return (
    <div className="space-y-6">
      <AdminPageIntro
        eyebrow="Users"
        title="Member records and role assignments stay tightly governed here."
        description="This page keeps account visibility practical: who has joined, who holds admin access, and which users already have enough data to support consultation and chart workflows."
      />

      <Card className="space-y-5">
        <div className="space-y-2">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Account Registry
          </p>
          <h2
            className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
            style={{ letterSpacing: "var(--tracking-display)" }}
          >
            Role changes are founder-only and logged in the audit trail.
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3 text-left">
            <thead>
              <tr className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Readiness</th>
                <th className="px-3 py-2">Current Roles</th>
                <th className="px-3 py-2">Assign Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const assignedRoleKeys = new Set(
                  user.adminAssignments.map((assignment) => assignment.role.key)
                );
                const availableRoleKeys = adminRoleKeys.filter(
                  (roleKey) => !assignedRoleKeys.has(roleKey)
                );

                return (
                  <tr key={user.id}>
                    <td className="rounded-l-[var(--radius-xl)] border border-r-0 border-[color:var(--color-border)] bg-[rgba(255,255,255,0.015)] px-3 py-4 align-top">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
                            {user.name}
                          </p>
                          {session.user.id === user.id ? (
                            <AdminStatusBadge status="CURRENT_USER" />
                          ) : null}
                          {user.emailVerified ? (
                            <AdminStatusBadge status="EMAIL_VERIFIED" />
                          ) : (
                            <AdminStatusBadge status="EMAIL_PENDING" />
                          )}
                        </div>
                        <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                          {user.email}
                        </p>
                        <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                          Joined {formatAdminDateTime(user.createdAt)}
                        </p>
                      </div>
                    </td>

                    <td className="border-y border-[color:var(--color-border)] bg-[rgba(255,255,255,0.015)] px-3 py-4 align-top">
                      <div className="space-y-2 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                        <p>
                          Charts:{" "}
                          <span className="text-[color:var(--color-foreground)]">
                            {user._count.charts}
                          </span>
                        </p>
                        <p>
                          Consultations:{" "}
                          <span className="text-[color:var(--color-foreground)]">
                            {user._count.consultations}
                          </span>
                        </p>
                        <p>
                          Orders:{" "}
                          <span className="text-[color:var(--color-foreground)]">
                            {user._count.orders}
                          </span>
                        </p>
                        <p>
                          Profile locale:{" "}
                          <span className="text-[color:var(--color-foreground)]">
                            {user.profile?.preferredLanguage ?? "Not set"}
                          </span>
                        </p>
                      </div>
                    </td>

                    <td className="border-y border-[color:var(--color-border)] bg-[rgba(255,255,255,0.015)] px-3 py-4 align-top">
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {user.adminAssignments.length ? (
                            user.adminAssignments.map((assignment) => (
                              <div
                                key={assignment.id}
                                className="flex items-center gap-2"
                              >
                                <AdminStatusBadge
                                  status={assignment.role.key.toUpperCase()}
                                />
                                <form action={removeAdminRoleAction}>
                                  <input
                                    type="hidden"
                                    name="userId"
                                    value={user.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="roleKey"
                                    value={assignment.role.key}
                                  />
                                  <Button tone="ghost" size="sm" type="submit">
                                    Remove
                                  </Button>
                                </form>
                              </div>
                            ))
                          ) : (
                            <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                              No admin roles assigned.
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="rounded-r-[var(--radius-xl)] border border-l-0 border-[color:var(--color-border)] bg-[rgba(255,255,255,0.015)] px-3 py-4 align-top">
                      {availableRoleKeys.length ? (
                        <form
                          action={assignAdminRoleAction}
                          className="space-y-3"
                        >
                          <input type="hidden" name="userId" value={user.id} />
                          <label className="block space-y-2">
                            <span className="text-[0.74rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                              Add admin role
                            </span>
                            <Select name="roleKey" required defaultValue="">
                              <option value="" disabled>
                                Choose a role
                              </option>
                              {availableRoleKeys.map((roleKey) => (
                                <option key={roleKey} value={roleKey}>
                                  {roleKey}
                                </option>
                              ))}
                            </Select>
                          </label>
                          <Button size="sm" type="submit">
                            Assign
                          </Button>
                        </form>
                      ) : (
                        <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                          All supported admin roles are already assigned.
                        </p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
