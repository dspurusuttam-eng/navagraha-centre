// Claude Admin Console C5A — Consultation settings page (replaces the C3B1 placeholder).
// Reads via the existing C2B1 consultation service; founder/editor may edit, support is
// read-only. No public consultation integration.
import type { Metadata } from "next";
import { getAdminPageSessionOrNull } from "@/modules/admin/auth/page-guard";
import { getConsultationDeps } from "@/modules/admin/consultation/service";
import { getConsultationSettings } from "@/modules/admin/consultation/service-core";
import { consultationToFormValues } from "@/modules/admin/consultation/consultation-form-config";
import { updateConsultationAction } from "@/modules/admin/consultation/consultation-actions";
import { ConsultationSettingsForm } from "@/modules/admin/consultation/consultation-settings-form";
import { hasAdminAccess } from "@/modules/admin/permissions";

export const metadata: Metadata = {
  title: "Consultation — Admin Console",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminConsultationPage() {
  const [result, session] = await Promise.all([
    getConsultationSettings(getConsultationDeps()),
    getAdminPageSessionOrNull(),
  ]);
  const canWrite = hasAdminAccess(session?.adminRoles ?? [], ["founder", "editor"]);

  if (!result.ok) {
    return (
      <section className="mx-auto max-w-2xl space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">Consultation settings</h1>
        <p className="text-sm text-neutral-600">Settings are temporarily unavailable. Please try again.</p>
      </section>
    );
  }

  return (
    <ConsultationSettingsForm
      initial={consultationToFormValues(result.data)}
      canWrite={canWrite}
      action={updateConsultationAction}
    />
  );
}
