// Claude Admin Console C3A1 — controlled denial page for authenticated non-admins.
import { AdminLogoutButton } from "@/modules/admin/auth/admin-logout-button";

export const dynamic = "force-dynamic";

export default function AdminDeniedPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <div className="rounded-xl border bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold">Access denied</h1>
        <p className="mt-1 mb-6 text-sm text-neutral-600">
          Your account is signed in but does not have Admin access. If you believe this is an
          error, contact the console owner.
        </p>
        <AdminLogoutButton className="rounded-md border px-4 py-2 text-sm" />
      </div>
    </main>
  );
}
