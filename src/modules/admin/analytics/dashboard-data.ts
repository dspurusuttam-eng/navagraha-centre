// Founder analytics data layer.
//
// Every number the console shows is produced here, so the accuracy rules live in
// one auditable place rather than being re-derived per card:
//
//  * Totals are NEVER read out of a leaderboard. A `take: N` groupBy answers
//    "the busiest N", and a name outside it is absent rather than zero — that is
//    exactly how the old console reported a confident 0 for notification opens.
//    Per-event totals come from one full aggregate over the window instead.
//  * Day boundaries are IST. The stored `day` column is UTC, so bucketing on it
//    put every reader between 00:00 and 05:30 IST on the previous day.
//  * Distinct-device counts are aggregated in the database (`count(DISTINCT …)`),
//    not by pulling every distinct row into the server and measuring the array.
//  * The comparison window is always the SAME length as the selected one and
//    immediately precedes it, so "vs previous" compares like with like.
//  * A metric with no underlying events reports `null`, which the UI renders as
//    "No data" — never as a zero that looks like a measured result.
import "server-only";

import { getPrisma } from "@/lib/prisma";
import {
  CENTRE_TIME_ZONE,
  resolveRange,
  startOfDayInCentreZone,
  toMetric,
  zoneOffsetMs,
  DAY_MS,
  SEARCH_TERM_MIN_COUNT,
  type ArticlePerformanceRow,
  type NamedCount,
  type RangeKey,
  type ResolvedRange,
  type Metric,
  type TrendPoint,
} from "@/modules/admin/analytics/dashboard-range";

// Re-exported so callers have a single import site for the dashboard.
export * from "@/modules/admin/analytics/dashboard-range";


export type AnalyticsDashboardView = {
  range: ResolvedRange;
  generatedAt: Date;
  /** Newest event timestamp seen, i.e. how fresh the stream actually is. */
  lastEventAt: Date | null;
  ingestionOk: boolean;
  overview: {
    articleViews: Metric;
    uniqueVisitors: Metric;
    likes: Metric;
    shares: Metric;
    consultationCtaClicks: Metric;
    whatsappHandoffs: Metric;
    notificationOptIns: Metric;
    notificationOpens: Metric;
  };
  totals: { likesAllTime: number; subscribers: number };
  trends: {
    articleViews: TrendPoint[];
    likes: TrendPoint[];
    shares: TrendPoint[];
    consultation: TrendPoint[];
    notificationOpens: TrendPoint[];
  };
  content: {
    mostViewed: ArticlePerformanceRow[];
    mostLiked: ArticlePerformanceRow[];
    mostShared: ArticlePerformanceRow[];
    newest: ArticlePerformanceRow[];
  };
  sharing: NamedCount[];
  consultation: {
    pageVisits: number;
    ctaClicks: number;
    handoffs: number;
    /** Only present when both sides of the step were actually recorded. */
    ctaToHandoffPct: number | null;
    visitToCtaPct: number | null;
  };
  notifications: {
    promptsOpened: number;
    optIns: number;
    optOuts: number;
    activeSubscriptions: number;
    sent: number;
    succeeded: number;
    failed: number;
    opens: number;
    recent: {
      title: string;
      createdAt: Date;
      total: number;
      succeeded: number;
      failed: number;
    }[];
  };
  search: {
    total: number;
    withResults: number;
    zeroResults: number;
    /** Terms at or above SEARCH_TERM_MIN_COUNT only. */
    terms: NamedCount[];
    suppressedTerms: number;
  };
  health: {
    latestPublicationAt: Date | null;
    latestPublicationTitle: string | null;
    youtubeLastSyncAt: Date | null;
    youtubeLastError: string | null;
    youtubeEnabled: boolean;
    blob: { count: number; bytes: number } | null;
    /** Events recorded in the SELECTED window. A full-table count was a
     * sequential scan on every page view, for one status line. */
    eventsInPeriod: number;
    databaseOk: boolean;
  };
};

type EventDayRow = { day: Date; name: string; count: number };

/** Bucket rows by IST day for one event name, filling gaps with zeros. */
function buildTrend(rows: EventDayRow[], names: readonly string[], range: ResolvedRange): TrendPoint[] {
  const wanted = new Set(names);
  const byDay = new Map<string, number>();

  for (const row of rows) {
    if (!wanted.has(row.name)) continue;
    const key = row.day.toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + row.count);
  }

  const points: TrendPoint[] = [];
  const startDay = startOfDayInCentreZone(range.from);
  for (let i = 0; i < range.days; i += 1) {
    const day = new Date(startDay.getTime() + i * DAY_MS);
    const key = new Date(day.getTime() + zoneOffsetMs(day, CENTRE_TIME_ZONE))
      .toISOString()
      .slice(0, 10);
    points.push({ day: key, count: byDay.get(key) ?? 0 });
  }
  return points;
}

function sumOf(rows: EventDayRow[], names: readonly string[]): number {
  const wanted = new Set(names);
  return rows.reduce((total, row) => (wanted.has(row.name) ? total + row.count : total), 0);
}

const VIEW_EVENTS = ["from_the_desk_read"] as const;
const SHARE_EVENTS = ["desk_article_share"] as const;
const CTA_EVENTS = ["consultation_cta_click", "consultation_book_click"] as const;
const HANDOFF_EVENTS = ["consultation_whatsapp_handoff"] as const;
const OPT_IN_EVENTS = ["push_subscribed"] as const;
const OPEN_EVENTS = ["notification_open"] as const;

export async function loadAnalyticsDashboard(
  rangeKey: RangeKey,
  readBlobUsage: () => Promise<{ count: number; bytes: number } | null>
): Promise<AnalyticsDashboardView> {
  const prisma = getPrisma();
  const now = new Date();
  const range = resolveRange(rangeKey, now);

  // ONE aggregate over the selected window and ONE over the comparison window,
  // both bucketed by IST day in the database. Every event-derived number below
  // is computed from these two result sets, so adding a card costs no extra
  // query and no card can accidentally read from a truncated list.
  const dayBuckets = async (from: Date, to: Date) =>
    prisma.$queryRaw<EventDayRow[]>`
      SELECT date_trunc('day', "createdAt" AT TIME ZONE ${CENTRE_TIME_ZONE}) AS day,
             name,
             count(*)::int AS count
      FROM analytics_event
      WHERE "createdAt" >= ${from} AND "createdAt" < ${to}
      GROUP BY 1, 2
    `;

  const distinctDevices = async (from: Date, to: Date) => {
    const rows = await prisma.$queryRaw<{ count: number }[]>`
      SELECT count(DISTINCT cid)::int AS count
      FROM analytics_event
      WHERE "createdAt" >= ${from} AND "createdAt" < ${to} AND cid IS NOT NULL
    `;
    return rows[0]?.count ?? 0;
  };

  const [
    current,
    previous,
    devicesNow,
    devicesPrev,
    sharesByChannel,
    viewsByRoute,
    sharesByRoute,
    likesByDay,
    searchStatusRows,
    searchTermRows,
    likesInRange,
    likesPrevRange,
    likesByArticle,
    likesAllTime,
    subscribers,
    sendAggregate,
    recentSends,
    publishedArticles,
    youtubeState,
    lastEvent,
    blob,
  ] = await Promise.all([
    dayBuckets(range.from, range.to),
    dayBuckets(range.previousFrom, range.from),
    distinctDevices(range.from, range.to),
    distinctDevices(range.previousFrom, range.from),
    prisma.analyticsEvent.groupBy({
      by: ["source"],
      where: { name: "desk_article_share", createdAt: { gte: range.from, lt: range.to } },
      _count: { _all: true },
      orderBy: { _count: { source: "desc" } },
    }),
    prisma.analyticsEvent.groupBy({
      by: ["route"],
      where: {
        name: "from_the_desk_read",
        route: { not: null },
        createdAt: { gte: range.from, lt: range.to },
      },
      _count: { _all: true },
      orderBy: { _count: { route: "desc" } },
      take: 50,
    }),
    prisma.analyticsEvent.groupBy({
      by: ["route"],
      where: {
        name: "desk_article_share",
        route: { not: null },
        createdAt: { gte: range.from, lt: range.to },
      },
      _count: { _all: true },
      orderBy: { _count: { route: "desc" } },
      take: 50,
    }),
    prisma.$queryRaw<{ day: Date; count: number }[]>`
      SELECT date_trunc('day', "createdAt" AT TIME ZONE ${CENTRE_TIME_ZONE}) AS day,
             count(*)::int AS count
      FROM article_like
      WHERE "createdAt" >= ${range.from} AND "createdAt" < ${range.to}
      GROUP BY 1
    `,
    prisma.analyticsEvent.groupBy({
      by: ["status"],
      where: { name: "desk_search", createdAt: { gte: range.from, lt: range.to } },
      _count: { _all: true },
      orderBy: { _count: { status: "desc" } },
    }),
    prisma.analyticsEvent.groupBy({
      by: ["section"],
      where: {
        name: "desk_search",
        section: { not: null },
        createdAt: { gte: range.from, lt: range.to },
      },
      _count: { _all: true },
      orderBy: { _count: { section: "desc" } },
      take: 40,
    }),
    prisma.articleLike.count({ where: { createdAt: { gte: range.from, lt: range.to } } }),
    prisma.articleLike.count({
      where: { createdAt: { gte: range.previousFrom, lt: range.from } },
    }),
    prisma.articleLike.groupBy({
      by: ["articleId"],
      _count: { _all: true },
      orderBy: { _count: { articleId: "desc" } },
      take: 20,
    }),
    prisma.articleLike.count(),
    prisma.pushSubscription.count(),
    prisma.notificationSend.aggregate({
      _sum: { total: true, succeeded: true, failed: true },
      _count: { _all: true },
    }),
    prisma.notificationSend.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.article.findMany({
      where: { status: "PUBLISHED", publishedAt: { not: null } },
      orderBy: { publishedAt: "desc" },
      select: { id: true, slug: true, title: true, publishedAt: true },
      take: 200,
    }),
    prisma.youtubeRailState.findUnique({ where: { id: "singleton" } }).catch(() => null),
    prisma.analyticsEvent.findFirst({
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
    readBlobUsage(),
  ]);

  const hasCurrentEvents = current.length > 0;
  const eventsInPeriod = current.reduce((total, row) => total + row.count, 0);

  // ---- content performance -------------------------------------------------
  const articleBySlug = new Map(publishedArticles.map((a) => [a.slug, a]));
  const articleById = new Map(publishedArticles.map((a) => [a.id, a]));
  const likesBySlug = new Map<string, number>();
  for (const row of likesByArticle) {
    const article = articleById.get(row.articleId);
    if (article) likesBySlug.set(article.slug, row._count._all);
  }

  const sharesBySlug = new Map<string, number>();
  const slugFromRoute = (route: string | null) =>
    route?.replace(/^.*\/from-the-desk\//, "").split(/[?#]/)[0] ?? "";

  const viewsBySlug = new Map<string, number>();
  for (const row of viewsByRoute) {
    const slug = slugFromRoute(row.route);
    if (slug && articleBySlug.has(slug)) {
      viewsBySlug.set(slug, (viewsBySlug.get(slug) ?? 0) + row._count._all);
    }
  }

  for (const row of sharesByRoute) {
    const slug = slugFromRoute(row.route);
    if (slug && articleBySlug.has(slug)) {
      sharesBySlug.set(slug, (sharesBySlug.get(slug) ?? 0) + row._count._all);
    }
  }

  const toRow = (slug: string): ArticlePerformanceRow | null => {
    const article = articleBySlug.get(slug);
    if (!article) return null;
    const views = viewsBySlug.get(slug) ?? 0;
    const likes = likesBySlug.get(slug) ?? 0;
    return {
      slug,
      title: article.title,
      publishedAt: article.publishedAt?.toISOString() ?? null,
      views,
      likes,
      shares: sharesBySlug.get(slug) ?? 0,
      // A denominator of a handful of views makes any percentage noise, so the
      // rate is withheld rather than published as if it were a finding.
      engagementPct: views >= 20 ? (likes / views) * 100 : null,
    };
  };

  const rowsWithViews = [...viewsBySlug.keys()]
    .map(toRow)
    .filter((r): r is ArticlePerformanceRow => r !== null)
    .sort((a, b) => b.views - a.views);

  const rowsWithLikes = [...likesBySlug.keys()]
    .map(toRow)
    .filter((r): r is ArticlePerformanceRow => r !== null)
    .filter((r) => r.likes > 0)
    .sort((a, b) => b.likes - a.likes);

  const rowsWithShares = [...sharesBySlug.keys()]
    .map(toRow)
    .filter((r): r is ArticlePerformanceRow => r !== null)
    .filter((r) => r.shares > 0)
    .sort((a, b) => b.shares - a.shares);

  const newest = publishedArticles.slice(0, 5).map((a) => toRow(a.slug)).filter(
    (r): r is ArticlePerformanceRow => r !== null
  );

  // ---- search --------------------------------------------------------------
  const searchTotal = searchStatusRows.reduce((n, r) => n + r._count._all, 0);
  const withResults =
    searchStatusRows.find((r) => r.status === "results")?._count._all ?? 0;
  const zeroResults = searchStatusRows.find((r) => r.status === "empty")?._count._all ?? 0;
  const eligibleTerms = searchTermRows.filter(
    (r) => r._count._all >= SEARCH_TERM_MIN_COUNT && r.section
  );

  // ---- consultation --------------------------------------------------------
  const pageVisits = sumOf(current, ["page_visit", "page_view"]);
  const ctaClicks = sumOf(current, CTA_EVENTS);
  const handoffs = sumOf(current, HANDOFF_EVENTS);

  return {
    range,
    generatedAt: now,
    lastEventAt: lastEvent?.createdAt ?? null,
    ingestionOk: Boolean(lastEvent),
    overview: {
      articleViews: toMetric(sumOf(current, VIEW_EVENTS), sumOf(previous, VIEW_EVENTS), hasCurrentEvents),
      uniqueVisitors: toMetric(devicesNow, devicesPrev, hasCurrentEvents),
      likes: toMetric(likesInRange, likesPrevRange, likesAllTime > 0),
      shares: toMetric(sumOf(current, SHARE_EVENTS), sumOf(previous, SHARE_EVENTS), hasCurrentEvents),
      consultationCtaClicks: toMetric(ctaClicks, sumOf(previous, CTA_EVENTS), hasCurrentEvents),
      whatsappHandoffs: toMetric(handoffs, sumOf(previous, HANDOFF_EVENTS), hasCurrentEvents),
      notificationOptIns: toMetric(
        sumOf(current, OPT_IN_EVENTS),
        sumOf(previous, OPT_IN_EVENTS),
        hasCurrentEvents
      ),
      notificationOpens: toMetric(
        sumOf(current, OPEN_EVENTS),
        sumOf(previous, OPEN_EVENTS),
        hasCurrentEvents
      ),
    },
    totals: { likesAllTime, subscribers },
    trends: {
      articleViews: buildTrend(current, VIEW_EVENTS, range),
      likes: buildTrend(
        likesByDay.map((r) => ({ day: r.day, name: "like", count: r.count })),
        ["like"],
        range
      ),
      shares: buildTrend(current, SHARE_EVENTS, range),
      consultation: buildTrend(current, CTA_EVENTS, range),
      notificationOpens: buildTrend(current, OPEN_EVENTS, range),
    },
    content: {
      mostViewed: rowsWithViews.slice(0, 5),
      mostLiked: rowsWithLikes.slice(0, 5),
      mostShared: rowsWithShares.slice(0, 5),
      newest,
    },
    sharing: sharesByChannel
      .map((row) => ({ label: row.source ?? "unknown", count: row._count._all }))
      .sort((a, b) => b.count - a.count),
    consultation: {
      pageVisits,
      ctaClicks,
      handoffs,
      // Both steps must be genuinely recorded before a funnel percentage is
      // meaningful; otherwise the console would imply a collapse that is really
      // just an uninstrumented step.
      ctaToHandoffPct: ctaClicks > 0 && handoffs > 0 ? (handoffs / ctaClicks) * 100 : null,
      visitToCtaPct: pageVisits > 0 && ctaClicks > 0 ? (ctaClicks / pageVisits) * 100 : null,
    },
    notifications: {
      promptsOpened: sumOf(current, ["notification_bell_open"]),
      optIns: sumOf(current, OPT_IN_EVENTS),
      optOuts: sumOf(current, ["push_unsubscribed"]),
      activeSubscriptions: subscribers,
      sent: sendAggregate._sum.total ?? 0,
      succeeded: sendAggregate._sum.succeeded ?? 0,
      failed: sendAggregate._sum.failed ?? 0,
      opens: sumOf(current, OPEN_EVENTS),
      recent: recentSends.map((s) => ({
        title: s.title,
        createdAt: s.createdAt,
        total: s.total,
        succeeded: s.succeeded,
        failed: s.failed,
      })),
    },
    search: {
      total: searchTotal,
      withResults,
      zeroResults,
      terms: eligibleTerms.map((r) => ({ label: r.section as string, count: r._count._all })),
      suppressedTerms: searchTermRows.length - eligibleTerms.length,
    },
    health: {
      latestPublicationAt: publishedArticles[0]?.publishedAt ?? null,
      latestPublicationTitle: publishedArticles[0]?.title ?? null,
      youtubeLastSyncAt: youtubeState?.lastSyncAt ?? null,
      youtubeLastError: youtubeState?.lastError ?? null,
      youtubeEnabled: youtubeState?.enabled ?? true,
      blob,
      eventsInPeriod,
      databaseOk: true,
    },
  };
}
