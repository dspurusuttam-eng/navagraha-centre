// Claude Admin Console C5B — Brand/profile settings page (replaces the C3B1 placeholder).
// Reads via the existing C2B2 brand service; founder/editor may edit, support is
// read-only. No public profile/footer integration, no media upload.
import type { Metadata } from "next";
import { getAdminPageSessionOrNull } from "@/modules/admin/auth/page-guard";
import { getBrandDeps } from "@/modules/admin/brand/service";
import { getBrandSettings } from "@/modules/admin/brand/service-core";
import { brandToFormValues } from "@/modules/admin/brand/brand-form-config";
import { updateBrandAction } from "@/modules/admin/brand/brand-actions";
import { BrandSettingsForm } from "@/modules/admin/brand/brand-settings-form";
import { getMediaPickerOptions } from "@/modules/admin/media/picker-options";
import { hasAdminAccess } from "@/modules/admin/permissions";

export const metadata: Metadata = {
  title: "Settings — Admin Console",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [result, session, mediaOptions] = await Promise.all([
    getBrandSettings(getBrandDeps()),
    getAdminPageSessionOrNull(),
    getMediaPickerOptions(),
  ]);
  const canWrite = hasAdminAccess(session?.adminRoles ?? [], ["founder", "editor"]);

  if (!result.ok) {
    return (
      <section className="mx-auto max-w-2xl space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">Brand &amp; profile settings</h1>
        <p className="text-sm text-neutral-600">Settings are temporarily unavailable. Please try again.</p>
      </section>
    );
  }

  return (
    <BrandSettingsForm
      initial={brandToFormValues(result.data)}
      canWrite={canWrite}
      action={updateBrandAction}
      mediaOptions={mediaOptions}
    />
  );
}
