// Claude Admin Console C2C — GET (list) + POST (create) /api/admin/media.
import { requireAdminApi } from "@/modules/admin/api-guard";
import {
  getMediaDeps,
  mediaActorFromContext,
  mediaServiceResponse,
} from "@/modules/admin/media/service";
import { listMedia, createMedia } from "@/modules/admin/media/service-core";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const guard = await requireAdminApi(); // any admin (incl. support) may read
  if (!guard.ok) return guard.response;
  const params = new URL(request.url).searchParams;
  const result = await listMedia(getMediaDeps(), {
    kind: params.get("kind"),
    search: params.get("search"),
    page: params.get("page") ? Number(params.get("page")) : null,
    pageSize: params.get("pageSize") ? Number(params.get("pageSize")) : null,
  });
  return mediaServiceResponse(result);
}

export async function POST(request: Request) {
  const guard = await requireAdminApi({ allowedRoles: ["founder", "editor"] as const });
  if (!guard.ok) return guard.response;
  const body = await request.json().catch(() => null);
  return mediaServiceResponse(await createMedia(getMediaDeps(), mediaActorFromContext(guard.context), body));
}
