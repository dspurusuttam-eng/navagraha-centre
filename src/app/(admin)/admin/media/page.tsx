// Claude Admin Console C6A — Media library list (replaces the C3B1 placeholder).
// Reads via the existing C2C media service. Founder/editor may register/edit; support is
// read-only. URL-reference metadata only — no binary upload.
import type { Metadata } from "next";
import { getAdminPageSessionOrNull } from "@/modules/admin/auth/page-guard";
import { getMediaDeps } from "@/modules/admin/media/service";
import { listMedia } from "@/modules/admin/media/service-core";
import { buildMediaListQuery } from "@/modules/admin/media/media-list";
import { MediaAssetList } from "@/modules/admin/media/media-asset-list";
import { hasAdminAccess } from "@/modules/admin/permissions";

export const metadata: Metadata = {
  title: "Media — Admin Console",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminMediaPage({
  searchParams,
}: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  const params = await searchParams;
  const query = buildMediaListQuery(params);
  const [result, session] = await Promise.all([
    listMedia(getMediaDeps(), query),
    getAdminPageSessionOrNull(),
  ]);
  const canWrite = hasAdminAccess(session?.adminRoles ?? [], ["founder", "editor"]);

  return <MediaAssetList result={result} query={query} canWrite={canWrite} />;
}
