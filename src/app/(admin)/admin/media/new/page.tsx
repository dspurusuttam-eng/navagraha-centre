// Claude Admin Console C6A — register media (URL reference; no upload).
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminPageSessionOrNull } from "@/modules/admin/auth/page-guard";
import { MediaForm } from "@/modules/admin/media/media-form";
import { createMediaAction } from "@/modules/admin/media/media-actions";
import { emptyMediaFormValues } from "@/modules/admin/media/media-form-config";
import { hasAdminAccess } from "@/modules/admin/permissions";

export const metadata: Metadata = {
  title: "Register Media — Admin Console",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminMediaNewPage() {
  const session = await getAdminPageSessionOrNull();
  // Registering media is a write: a read-only admin has nothing to do here.
  if (!hasAdminAccess(session?.adminRoles ?? [], ["founder", "editor"])) {
    redirect("/admin/media");
  }

  return <MediaForm mode="create" canWrite action={createMediaAction} initial={emptyMediaFormValues()} />;
}
