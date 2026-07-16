import { AdminMobileShell } from "@/modules/admin/shell/admin-mobile-shell";
import { AdminLogoutButton } from "@/modules/admin/auth/admin-logout-button";
import { requireAdminPageSession } from "@/modules/admin/auth/page-guard";
import { getPrimaryAdminRoleLabel } from "@/modules/admin/permissions";

export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminLayoutInner>{children}</AdminLayoutInner>;
}

async function AdminLayoutInner({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Server-side gate: no admin data is fetched or rendered before authorization.
  // Unauthenticated → /admin/login, authenticated non-admin → /admin/denied.
  const session = await requireAdminPageSession();

  return (
    <AdminMobileShell
      userName={session.user.name}
      userEmail={session.user.email}
      roleLabel={getPrimaryAdminRoleLabel(session.adminRoles)}
      logout={
        <AdminLogoutButton className="flex min-h-11 w-full items-center rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100" />
      }
    >
      {children}
    </AdminMobileShell>
  );
}
