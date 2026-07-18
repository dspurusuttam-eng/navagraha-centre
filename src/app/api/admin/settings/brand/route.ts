// Claude Admin Console C2B2 — GET / PATCH /api/admin/settings/brand (settings singleton).
import { requireAdminApi } from "@/modules/admin/api-guard";
import {
  getBrandDeps,
  brandActorFromContext,
  brandServiceResponse,
} from "@/modules/admin/brand/service";
import { getBrandSettings, updateBrandSettings } from "@/modules/admin/brand/service-core";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireAdminApi(); // any admin (incl. support) may read
  if (!guard.ok) return guard.response;
  return brandServiceResponse(await getBrandSettings(getBrandDeps()));
}

export async function PATCH(request: Request) {
  const guard = await requireAdminApi({ allowedRoles: ["founder", "editor"] as const });
  if (!guard.ok) return guard.response;
  const body = await request.json().catch(() => null);
  return brandServiceResponse(
    await updateBrandSettings(getBrandDeps(), brandActorFromContext(guard.context), body),
  );
}
