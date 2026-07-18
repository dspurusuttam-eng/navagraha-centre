// Claude Admin Console C2A — GET / PATCH / DELETE /api/admin/articles/[id].
import { requireAdminApi } from "@/modules/admin/api-guard";
import {
  getAdminArticleDeps,
  articleActorFromContext,
  articleServiceResponse,
} from "@/modules/admin/articles/service";
import { getArticle, updateArticle, deleteArticle } from "@/modules/admin/articles/service-core";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;
  const { id } = await params;
  return articleServiceResponse(await getArticle(getAdminArticleDeps(), id));
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const guard = await requireAdminApi({ allowedRoles: ["founder", "editor"] as const });
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const body = await request.json().catch(() => null);
  return articleServiceResponse(
    await updateArticle(getAdminArticleDeps(), articleActorFromContext(guard.context), id, body),
  );
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const guard = await requireAdminApi({ allowedRoles: ["founder", "editor"] as const });
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const confirmed = new URL(request.url).searchParams.get("confirm") === "true";
  return articleServiceResponse(
    await deleteArticle(getAdminArticleDeps(), articleActorFromContext(guard.context), id, confirmed),
  );
}
