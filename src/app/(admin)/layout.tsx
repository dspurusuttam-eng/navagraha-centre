import { AdminShell } from "@/modules/admin/components/admin-shell";
import { requireAdminSession } from "@/modules/auth/server";

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
  const session = await requireAdminSession();

  return (
    <AdminShell
      userName={session.user.name}
      userEmail={session.user.email}
      adminRoles={session.adminRoles}
    >
      {children}
    </AdminShell>
  );
}
