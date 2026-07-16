// Claude Admin Console C6A — edit media metadata + reference status + guarded delete.
import type { Metadata } from "next";
import Link from "next/link";
import { getAdminPageSessionOrNull } from "@/modules/admin/auth/page-guard";
import { getMediaDeps } from "@/modules/admin/media/service";
import { getMedia, getMediaReferences } from "@/modules/admin/media/service-core";
import { MediaForm } from "@/modules/admin/media/media-form";
import { MediaReferencePanel } from "@/modules/admin/media/media-reference-panel";
import { updateMediaAction, deleteMediaAction } from "@/modules/admin/media/media-actions";
import { mediaToFormValues } from "@/modules/admin/media/media-form-config";
import { hasAdminAccess } from "@/modules/admin/permissions";

export const metadata: Metadata = {
  title: "Edit Media — Admin Console",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminMediaEditPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const deps = getMediaDeps();
  const [result, refsResult, session] = await Promise.all([
    getMedia(deps, id),
    getMediaReferences(deps, id),
    getAdminPageSessionOrNull(),
  ]);
  const canWrite = hasAdminAccess(session?.adminRoles ?? [], ["founder", "editor"]);

  if (!result.ok) {
    return (
      <section className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Media not found</h1>
        <p className="text-sm text-neutral-600">This media asset could not be loaded. It may have been removed.</p>
        <Link href="/admin/media" className="inline-flex min-h-11 items-center rounded-md border px-4 py-2 text-sm">
          Back to library
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <MediaForm
        mode="edit"
        canWrite={canWrite}
        action={updateMediaAction.bind(null, id)}
        initial={mediaToFormValues(result.data)}
      />
      {refsResult.ok ? (
        <MediaReferencePanel assetId={id} refs={refsResult.data} canWrite={canWrite} remove={deleteMediaAction} />
      ) : (
        <section aria-label="Reference status" className="mx-auto max-w-2xl rounded-md border border-neutral-200 p-3 text-sm text-neutral-600">
          Reference status is temporarily unavailable, so deletion is disabled.
        </section>
      )}
    </div>
  );
}
