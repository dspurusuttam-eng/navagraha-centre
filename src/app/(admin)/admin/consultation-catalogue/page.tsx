// Claude C10A — Consultation catalogue Admin page.
// Reads the full catalogue via the C10A service; founder/editor may manage, support is
// read-only. No public consultation integration and no activation from here.
import type { Metadata } from "next";
import { getAdminPageSessionOrNull } from "@/modules/admin/auth/page-guard";
import { hasAdminAccess } from "@/modules/admin/permissions";
import { getCatalogueDeps } from "@/modules/admin/consultation-catalogue/service";
import { listCatalogue } from "@/modules/admin/consultation-catalogue/service-core";
import { CatalogueAdminView } from "@/modules/admin/consultation-catalogue/catalogue-admin-view";

export const metadata: Metadata = {
  title: "Consultation catalogue — Admin Console",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminConsultationCataloguePage() {
  const [result, session] = await Promise.all([listCatalogue(getCatalogueDeps()), getAdminPageSessionOrNull()]);
  const canWrite = hasAdminAccess(session?.adminRoles ?? [], ["founder", "editor"]);

  if (!result.ok) {
    return (
      <section className="mx-auto max-w-2xl space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">Consultation catalogue</h1>
        <p className="text-sm text-neutral-600">The catalogue is temporarily unavailable. Please try again.</p>
      </section>
    );
  }

  return <CatalogueAdminView catalogue={result.data} canWrite={canWrite} />;
}
