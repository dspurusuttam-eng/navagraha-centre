// Claude Admin Console C3A1 — private admin sign-in page (/admin/login).
import { redirect } from "next/navigation";
import { getAdminPageSessionOrNull } from "@/modules/admin/auth/page-guard";
import { sanitizeAdminRedirect } from "@/modules/admin/auth/redirect";
import { AdminLoginForm } from "@/modules/admin/auth/admin-login-form";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  // Already an approved admin? Skip the form.
  const admin = await getAdminPageSessionOrNull();
  if (admin) {
    redirect("/admin");
  }

  const params = await searchParams;
  const rawRedirect = Array.isArray(params.redirectTo) ? params.redirectTo[0] : params.redirectTo;
  const redirectTo = sanitizeAdminRedirect(rawRedirect);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <div className="rounded-xl border bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold">Admin sign in</h1>
        <p className="mt-1 mb-6 text-sm text-neutral-600">
          Private console access for approved administrators only.
        </p>
        <AdminLoginForm redirectTo={redirectTo} />
      </div>
    </main>
  );
}
