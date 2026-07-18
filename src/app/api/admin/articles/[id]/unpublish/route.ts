// Claude Admin Console C2A — POST /api/admin/articles/[id]/unpublish.
import { requireAdminApi } from "@/modules/admin/api-guard";
import {
  getAdminArticleDeps,
  articleActorFromContext,
  articleServiceResponse,
} from "@/modules/admin/articles/service";
import { transitionArticle } from "@/modules/admin/articles/service-core";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteContext) {
  const guard = await requireAdminApi({ allowedRoles: ["founder", "editor"] as const });
  if (!guard.ok) return guard.response;
  const { id } = await params;
  return articleServiceResponse(
    await transitionArticle(getAdminArticleDeps(), articleActorFromContext(guard.context), id, "UNPUBLISH"),
  );
}
