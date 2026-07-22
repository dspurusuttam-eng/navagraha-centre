// Founder-only analytics: aggregates over the durable anonymous event stream
// plus engagement tables and system health. Nothing here exists in the public
// app; the page sits inside the admin guard and never renders identities —
// there are none to render.
import type { Metadata } from "next";
import { list } from "@vercel/blob";
import { getPrisma } from "@/lib/prisma";
import { pruneAnalyticsEvents } from "@/lib/analytics/persist-event";
import { getAdminPageSessionOrNull } from "@/modules/admin/auth/page-guard";
import { hasAdminAccess } from "@/modules/admin/permissions";

export const metadata: Metadata = {
  title: "Analytics — Admin Console",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

/** NAVAGRAHA CENTRE operates from Assam; every reported day boundary is IST. */
const CENTRE_TIME_ZONE = "Asia/Kolkata";

function daysAgoIso(days: number) {
  return new Date(Date.now() - days * DAY_MS);
}

/**
 * Start of "today" in the Centre's own timezone.
 *
 * "Active today" used to match on the stored `day` string, which is written in
 * UTC. India is UTC+5:30, so every reader between midnight and 05:30 IST was
 * counted against the *previous* day and the card read 0 through the entire
 * Indian early morning -- observed live at 06:24 IST: "Active today 0" beside
 * "Active 7 days 33". The audience and the Founder both live in IST, so the day
 * boundary has to be IST.
 *
 * Deriving the offset from the zone (rather than hard-coding +5:30) keeps this
 * correct if the zone is ever changed, and needs no migration: existing rows are
 * matched on `createdAt`, which is absolute, instead of on the UTC `day` string.
 */
function zoneOffsetMs(instant: Date, timeZone: string): number {
  const asUtc = new Date(instant.toLocaleString("en-US", { timeZone: "UTC" }));
  const asZone = new Date(instant.toLocaleString("en-US", { timeZone }));
  return asZone.getTime() - asUtc.getTime();
}

function startOfTodayInCentreTimezone(): Date {
  const now = new Date();
  const offsetMs = zoneOffsetMs(now, CENTRE_TIME_ZONE);
  // Shift into the zone, then read the calendar date with getUTC* accessors so
  // the result never depends on the timezone of the machine running the server
  // (Vercel runs UTC; a developer laptop may not).
  const zoneNow = new Date(now.getTime() + offsetMs);
  const zoneMidnight = Date.UTC(
    zoneNow.getUTCFullYear(),
    zoneNow.getUTCMonth(),
    zoneNow.getUTCDate()
  );

  return new Date(zoneMidnight - offsetMs);
}

async function readBlobUsage(): Promise<{ count: number; bytes: number } | null> {
  try {
    let cursor: string | undefined;
    let count = 0;
    let bytes = 0;
    let pages = 0;
    do {
      const page = await list({ cursor, limit: 1000 });
      for (const blob of page.blobs) {
        count += 1;
        bytes += blob.size;
      }
      cursor = page.cursor ?? undefined;
      pages += 1;
    } while (cursor && pages < 10);
    return { count, bytes };
  } catch {
    return null;
  }
}

function daysSince(value: Date | null | undefined): number | null {
  return value ? Math.floor((Date.now() - value.getTime()) / DAY_MS) : null;
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

function Stat({ label, value, hint }: Readonly<{ label: string; value: string; hint?: string }>) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-neutral-900">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-neutral-500">{hint}</p> : null}
    </div>
  );
}

function CountTable({
  title,
  rows,
  empty,
  footnote,
}: Readonly<{
  title: string;
  rows: readonly { label: string; count: number }[];
  empty: string;
  footnote?: string;
}>) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <h2 className="mb-2 text-sm font-semibold">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-neutral-600">{empty}</p>
      ) : (
        <ul className="divide-y divide-neutral-100">
          {rows.map((row) => (
            <li key={row.label} className="flex items-center justify-between gap-3 py-2">
              <span className="min-w-0 truncate text-sm text-neutral-800">{row.label}</span>
              <span className="shrink-0 text-sm font-semibold text-neutral-900">{row.count}</span>
            </li>
          ))}
        </ul>
      )}
      {footnote && rows.length > 0 ? (
        <p className="mt-2 text-xs text-neutral-500">{footnote}</p>
      ) : null}
    </div>
  );
}

export default async function AdminAnalyticsPage() {
  const session = await getAdminPageSessionOrNull();
  if (!hasAdminAccess(session?.adminRoles ?? [], ["founder"])) {
    return (
      <section className="mx-auto max-w-3xl space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-neutral-600">Founder access required.</p>
      </section>
    );
  }

  const prisma = getPrisma();
  // Opportunistic retention enforcement (90 days) whenever the page is opened.
  await pruneAnalyticsEvents(90);

  const since7 = daysAgoIso(7);
  const since30 = daysAgoIso(30);
  const startOfToday = startOfTodayInCentreTimezone();

  const [
    dauRows,
    wauRows,
    events7,
    topReads,
    sharesByChannel,
    localeRows,
    searchRows,
    notifOpens7,
    ctaClicks7,
    events7Total,
    likesTotal,
    subscriberCount,
    sends,
    latestArticle,
    blobUsage,
  ] = await Promise.all([
    prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: startOfToday }, cid: { not: null } },
      distinct: ["cid"],
      select: { cid: true },
    }),
    prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: since7 }, cid: { not: null } },
      distinct: ["cid"],
      select: { cid: true },
    }),
    prisma.analyticsEvent.groupBy({
      by: ["name"],
      where: { createdAt: { gte: since7 } },
      _count: { _all: true },
      orderBy: { _count: { name: "desc" } },
      take: 12,
    }),
    prisma.analyticsEvent.groupBy({
      by: ["route"],
      where: { name: "from_the_desk_read", createdAt: { gte: since30 }, route: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { route: "desc" } },
      take: 8,
    }),
    prisma.analyticsEvent.groupBy({
      by: ["source"],
      where: { name: "desk_article_share", createdAt: { gte: since30 } },
      _count: { _all: true },
      orderBy: { _count: { source: "desc" } },
    }),
    prisma.analyticsEvent.groupBy({
      by: ["locale"],
      where: { createdAt: { gte: since30 }, locale: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { locale: "desc" } },
      take: 6,
    }),
    prisma.analyticsEvent.groupBy({
      by: ["status"],
      where: { name: "assistant_query", createdAt: { gte: since30 } },
      _count: { _all: true },
      orderBy: { _count: { status: "desc" } },
      take: 10,
    }),
    // These two headline numbers must be counted directly. They were previously
    // read out of `events7`, which is a top-12 leaderboard: any event outside
    // the twelve busiest names is simply absent from that list, so the cards
    // reported a confident 0 for events that had genuinely occurred. Both
    // `notification_open` and the consultation CTAs are low-volume by nature and
    // therefore were never in the top twelve. `@@index([name, createdAt])`
    // covers these counts, so exactness costs nothing.
    prisma.analyticsEvent.count({
      where: { name: "notification_open", createdAt: { gte: since7 } },
    }),
    prisma.analyticsEvent.count({
      where: {
        name: { in: ["consultation_cta_click", "consultation_book_click"] },
        createdAt: { gte: since7 },
      },
    }),
    prisma.analyticsEvent.count({ where: { createdAt: { gte: since7 } } }),
    prisma.articleLike.count(),
    prisma.pushSubscription.count(),
    prisma.notificationSend.aggregate({
      _sum: { total: true, succeeded: true, failed: true },
      _count: { _all: true },
    }),
    prisma.article.findFirst({
      where: { status: "PUBLISHED", publishedAt: { not: null } },
      orderBy: { publishedAt: "desc" },
      select: { title: true, publishedAt: true },
    }),
    readBlobUsage(),
  ]);

  const freshnessDays = daysSince(latestArticle?.publishedAt);

  const BLOB_WARN_GB = 0.8; // warn well before the 1 GB hobby-tier practical limit

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Anonymous aggregates only — no reader identities exist anywhere in this data.
          Events are kept for 90 days.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Active today"
          value={String(dauRows.length)}
          hint="distinct anonymous devices · since midnight IST"
        />
        <Stat label="Active 7 days" value={String(wauRows.length)} hint="distinct anonymous devices" />
        <Stat label="Total likes" value={String(likesTotal)} />
        <Stat label="Push subscribers" value={String(subscriberCount)} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Notifications sent"
          value={String(sends._sum.total ?? 0)}
          hint={`${sends._count._all} broadcast(s) · ${sends._sum.failed ?? 0} failed`}
        />
        <Stat label="Notification opens (7d)" value={String(notifOpens7)} />
        <Stat label="Consultation CTA (7d)" value={String(ctaClicks7)} />
        <Stat
          label="Latest publication"
          value={freshnessDays === null ? "—" : freshnessDays === 0 ? "today" : `${freshnessDays}d ago`}
          hint={latestArticle?.title?.slice(0, 40) ?? "no published article"}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <CountTable
          // Explicitly a leaderboard, not the full ledger: the table is capped
          // at twelve names, so it is labelled and footnoted as such rather
          // than reading like a complete list of everything that happened.
          title="Busiest events (7 days)"
          empty="No events recorded yet — data accumulates from now on."
          rows={events7.map((row) => ({ label: row.name, count: row._count._all }))}
          footnote={`Top ${events7.length} of ${events7Total} event(s) recorded in the period.`}
        />
        <CountTable
          title="Top Desk reads (30 days)"
          empty="No article reads recorded yet."
          rows={topReads.map((row) => ({ label: row.route ?? "?", count: row._count._all }))}
        />
        <CountTable
          title="Shares by channel (30 days)"
          empty="No shares recorded yet."
          rows={sharesByChannel.map((row) => ({ label: row.source ?? "?", count: row._count._all }))}
        />
        <CountTable
          title="Locales (30 days)"
          empty="No locale data yet."
          rows={localeRows.map((row) => ({ label: row.locale ?? "?", count: row._count._all }))}
        />
        <CountTable
          title="Search activity (30 days)"
          empty="No searches recorded yet."
          rows={searchRows.map((row) => ({ label: row.status ?? "query", count: row._count._all }))}
        />
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold">Storage (Vercel Blob)</h2>
          {blobUsage ? (
            <>
              <p className="text-2xl font-semibold text-neutral-900">{formatBytes(blobUsage.bytes)}</p>
              <p className="mt-0.5 text-xs text-neutral-500">{blobUsage.count} file(s)</p>
              {blobUsage.bytes > BLOB_WARN_GB * 1024 * 1024 * 1024 ? (
                <p className="mt-2 rounded bg-amber-50 p-2 text-xs font-medium text-amber-900">
                  Approaching the practical free-tier limit — review old media before uploading
                  large batches.
                </p>
              ) : (
                <p className="mt-2 text-xs text-neutral-500">Comfortably within limits.</p>
              )}
            </>
          ) : (
            <p className="text-sm text-neutral-600">Usage unavailable (Blob token not readable here).</p>
          )}
        </div>
      </div>
    </section>
  );
}
