import type { Metadata } from "next";
import { requireAdminPageSession } from "@/modules/admin/auth/page-guard";
import { getCatalogueDeps } from "@/modules/admin/consultation-catalogue/service";
import { listCatalogue } from "@/modules/admin/consultation-catalogue/service-core";
import { ConsultationCatalogueDisplay } from "@/modules/consultations/components/consultation-catalogue-display";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Consultation preview - Admin Console",
  robots: {
    follow: false,
    index: false,
    nocache: true,
  },
};

export default async function AdminConsultationPreviewPage() {
  await requireAdminPageSession();
  const result = await listCatalogue(getCatalogueDeps());

  if (!result.ok) {
    return (
      <section className="mx-auto max-w-2xl space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">Consultation preview</h1>
        <p className="text-sm text-neutral-600">
          The draft catalogue preview is temporarily unavailable.
        </p>
      </section>
    );
  }

  return (
    <ConsultationCatalogueDisplay
      heading="Consultation Catalogue Preview"
      tiers={result.data}
    />
  );
}
