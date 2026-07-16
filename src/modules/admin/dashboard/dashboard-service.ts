// Claude Admin Console C3B2 — dashboard data source bound to existing Admin services.
import "server-only";

import { getAdminArticleDeps } from "@/modules/admin/articles/service";
import { listArticles, getRecentArticles } from "@/modules/admin/articles/service-core";
import { getConsultationDeps } from "@/modules/admin/consultation/service";
import { getConsultationSettings } from "@/modules/admin/consultation/service-core";
import type { DashboardDeps } from "@/modules/admin/dashboard/dashboard-core";

export function getAdminDashboardDeps(): DashboardDeps {
  return {
    async countArticlesByStatus(status) {
      const result = await listArticles(getAdminArticleDeps(), { status, pageSize: 1 });
      if (!result.ok) throw new Error("article count unavailable");
      return result.data.total;
    },
    async listRecentArticles(limit) {
      const result = await getRecentArticles(getAdminArticleDeps(), limit);
      if (!result.ok) throw new Error("recent articles unavailable");
      return result.data.map((article) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        status: article.status,
        updatedAt: article.updatedAt.toISOString(),
      }));
    },
    async getConsultation() {
      const result = await getConsultationSettings(getConsultationDeps());
      if (!result.ok) throw new Error("consultation settings unavailable");
      return { availabilityStatus: result.data.availabilityStatus, isEnabled: result.data.isEnabled };
    },
  };
}
