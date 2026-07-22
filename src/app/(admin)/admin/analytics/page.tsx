// Founder-only analytics console. The page is a thin shell: authorization plus
// retention housekeeping here, all aggregation in `dashboard-data`, all
// rendering in `dashboard-view`. Nothing on this page exists in the public app,
// and it never renders a reader identity — there are none stored to render.
import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { list } from "@vercel/blob";
import { pruneAnalyticsEvents } from "@/lib/analytics/persist-event";
import { AnalyticsDashboard } from "@/modules/admin/analytics/dashboard-view";
import {
  isRangeKey,
  loadAnalyticsDashboard,
  type RangeKey,
} from "@/modules/admin/analytics/dashboard-data";
import { getAdminPageSessionOrNull } from "@/modules/admin/auth/page-guard";
import { hasAdminAccess } from "@/modules/admin/permissions";

export const metadata: Metadata = {
  title: "Analytics — Admin Console",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type AnalyticsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Total media storage in use.
 *
 * This walks the Blob store a page at a time — up to ten sequential network
 * round trips to an external service — so running it on every page view put all
 * of that latency directly in front of the Founder before the console could
 * render. Stored bytes do not change minute to minute, so the walk is cached for
 * fifteen minutes and the vast majority of views now pay nothing for it.
 */
const readBlobUsage = unstable_cache(
  async (): Promise<{ count: number; bytes: number } | null> => {
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
  },
  ["admin-analytics-blob-usage"],
  { revalidate: 900 }
);

/**
 * Retention is best-effort by design, so it must never sit in front of a render.
 * It used to be awaited before any query ran, which put a `deleteMany` scan over
 * the whole event table on the critical path of every single page view. It now
 * runs at most once a day per server instance, after the page has its data, and
 * is never awaited.
 */
let lastPruneAt = 0;
const PRUNE_INTERVAL_MS = 24 * 60 * 60 * 1000;

function pruneIfDue(): void {
  const now = Date.now();
  if (now - lastPruneAt < PRUNE_INTERVAL_MS) return;
  lastPruneAt = now;
  void pruneAnalyticsEvents(90).catch(() => {
    // Swallowed deliberately: retention housekeeping must never surface as a
    // console error, and the next due run will retry.
  });
}

export default async function AdminAnalyticsPage({
  searchParams,
}: Readonly<AnalyticsPageProps>) {
  const session = await getAdminPageSessionOrNull();
  if (!hasAdminAccess(session?.adminRoles ?? [], ["founder"])) {
    return (
      <section className="mx-auto max-w-3xl space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-neutral-600">Founder access required.</p>
      </section>
    );
  }


  const params = (await searchParams) ?? {};
  const requested = Array.isArray(params.range) ? params.range[0] : params.range;
  // An unrecognised or absent ?range falls back to 7 days rather than erroring,
  // so a stale bookmark or a hand-edited URL can never break the console.
  const range: RangeKey = isRangeKey(requested) ? requested : "7d";

  const view = await loadAnalyticsDashboard(range, readBlobUsage);

  // Housekeeping only after the Founder has their data.
  pruneIfDue();

  return <AnalyticsDashboard view={view} />;
}
