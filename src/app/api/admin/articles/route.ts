// Claude Admin Console C2A — GET (list) + POST (create) /api/admin/articles.
import { requireAdminApi } from "@/modules/admin/api-guard";
import {
  getAdminArticleDeps,
  articleActorFromContext,
  articleServiceResponse,
} from "@/modules/admin/articles/service";
import { listArticles, createArticle } from "@/modules/admin/articles/service-core";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const guard = await requireAdminApi(); // any admin (incl. support) may read
  if (!guard.ok) return guard.response;
  const params = new URL(request.url).searchParams;
  const result = await listArticles(getAdminArticleDeps(), {
    status: params.get("status"),
    language: params.get("language"),
    search: params.get("search"),
    page: params.get("page") ? Number(params.get("page")) : null,
    pageSize: params.get("pageSize") ? Number(params.get("pageSize")) : null,
  });
  return articleServiceResponse(result);
}

export async function POST(request: Request) {
  const guard = await requireAdminApi({ allowedRoles: ["founder", "editor"] as const });
  if (!guard.ok) return guard.response;
  const body = await request.json().catch(() => null);
  const result = await createArticle(getAdminArticleDeps(), articleActorFromContext(guard.context), body);
  return articleServiceResponse(result);
}
