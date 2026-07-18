// Claude Admin Console C3B2 — admin dashboard (wired to existing Admin services).
// Authorization is enforced by the (admin) layout (requireAdminPageSession) before this
// renders; each widget degrades to an "unavailable" state on a data-source failure.
import type { Metadata } from "next";
import { AdminDashboard } from "@/modules/admin/dashboard/admin-dashboard";
import { loadAdminDashboard } from "@/modules/admin/dashboard/dashboard-core";
import { getAdminDashboardDeps } from "@/modules/admin/dashboard/dashboard-service";

export const metadata: Metadata = {
  title: "Dashboard — Admin Console",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const view = await loadAdminDashboard(getAdminDashboardDeps());
  return <AdminDashboard view={view} />;
}
