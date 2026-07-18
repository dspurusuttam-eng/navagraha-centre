// Claude Admin Console C2B1 — GET / PATCH /api/admin/consultation (settings singleton).
import { requireAdminApi } from "@/modules/admin/api-guard";
import {
  getConsultationDeps,
  consultationActorFromContext,
  consultationServiceResponse,
} from "@/modules/admin/consultation/service";
import {
  getConsultationSettings,
  updateConsultationSettings,
} from "@/modules/admin/consultation/service-core";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireAdminApi(); // any admin (incl. support) may read
  if (!guard.ok) return guard.response;
  return consultationServiceResponse(await getConsultationSettings(getConsultationDeps()));
}

export async function PATCH(request: Request) {
  const guard = await requireAdminApi({ allowedRoles: ["founder", "editor"] as const });
  if (!guard.ok) return guard.response;
  const body = await request.json().catch(() => null);
  return consultationServiceResponse(
    await updateConsultationSettings(getConsultationDeps(), consultationActorFromContext(guard.context), body),
  );
}
