// Claude Admin Console C3B2 — admin dashboard aggregation (pure; DI fetchers).
// Each section loads independently: a failing data source degrades to `unavailable`
// rather than crashing the page (controlled error state).

export type DashboardArticleSummary = {
  id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
};

export type SectionState<T> = { state: "ready"; data: T } | { state: "unavailable" };

export type ArticleCounts = { published: number; draft: number };
export type ConsultationSummary = { availabilityStatus: string; isEnabled: boolean };

export type AdminDashboardView = {
  articleCounts: SectionState<ArticleCounts>;
  recentArticles: SectionState<DashboardArticleSummary[]>; // data may be [] (empty state)
  consultation: SectionState<ConsultationSummary>;
};

export type DashboardDeps = {
  countArticlesByStatus: (status: string) => Promise<number>;
  listRecentArticles: (limit: number) => Promise<DashboardArticleSummary[]>;
  getConsultation: () => Promise<ConsultationSummary>;
};

const RECENT_LIMIT = 5;

export async function loadAdminDashboard(deps: DashboardDeps): Promise<AdminDashboardView> {
  const [published, draft, recent, consultation] = await Promise.allSettled([
    deps.countArticlesByStatus("PUBLISHED"),
    deps.countArticlesByStatus("DRAFT"),
    deps.listRecentArticles(RECENT_LIMIT),
    deps.getConsultation(),
  ]);

  const articleCounts: SectionState<ArticleCounts> =
    published.status === "fulfilled" && draft.status === "fulfilled"
      ? { state: "ready", data: { published: published.value, draft: draft.value } }
      : { state: "unavailable" };

  const recentArticles: SectionState<DashboardArticleSummary[]> =
    recent.status === "fulfilled" ? { state: "ready", data: recent.value } : { state: "unavailable" };

  const consultationSection: SectionState<ConsultationSummary> =
    consultation.status === "fulfilled" ? { state: "ready", data: consultation.value } : { state: "unavailable" };

  return { articleCounts, recentArticles, consultation: consultationSection };
}

/** Human label for a consultation availability status. */
export function availabilityLabel(status: string): string {
  switch (status) {
    case "AVAILABLE":
      return "Available";
    case "LIMITED":
      return "Limited";
    case "UNAVAILABLE":
      return "Unavailable";
    default:
      return "Unknown";
  }
}

export function isRecentEmpty(section: SectionState<DashboardArticleSummary[]>): boolean {
  return section.state === "ready" && section.data.length === 0;
}
