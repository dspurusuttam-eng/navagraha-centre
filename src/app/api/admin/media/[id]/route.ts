// Claude Admin Console C2C — GET / PATCH / DELETE /api/admin/media/[id].
import { requireAdminApi } from "@/modules/admin/api-guard";
import {
  getMediaDeps,
  mediaActorFromContext,
  mediaServiceResponse,
} from "@/modules/admin/media/service";
import { getMedia, updateMedia, deleteMedia } from "@/modules/admin/media/service-core";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;
  const { id } = await params;
  return mediaServiceResponse(await getMedia(getMediaDeps(), id));
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const guard = await requireAdminApi({ allowedRoles: ["founder", "editor"] as const });
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const body = await request.json().catch(() => null);
  return mediaServiceResponse(await updateMedia(getMediaDeps(), mediaActorFromContext(guard.context), id, body));
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const guard = await requireAdminApi({ allowedRoles: ["founder", "editor"] as const });
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const confirmed = new URL(request.url).searchParams.get("confirm") === "true";
  return mediaServiceResponse(await deleteMedia(getMediaDeps(), mediaActorFromContext(guard.context), id, confirmed));
}
