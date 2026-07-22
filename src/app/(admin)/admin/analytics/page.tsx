// Founder-only analytics console. The page is a thin shell: authorization plus
// retention housekeeping here, all aggregation in `dashboard-data`, all
// rendering in `dashboard-view`. Nothing on this page exists in the public app,
// and it never renders a reader identity — there are none stored to render.
import type { Metadata } from "next";
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

  // Opportunistic retention enforcement (90 days) whenever the page is opened.
  await pruneAnalyticsEvents(90);

  const params = (await searchParams) ?? {};
  const requested = Array.isArray(params.range) ? params.range[0] : params.range;
  // An unrecognised or absent ?range falls back to 7 days rather than erroring,
  // so a stale bookmark or a hand-edited URL can never break the console.
  const range: RangeKey = isRangeKey(requested) ? requested : "7d";

  const view = await loadAnalyticsDashboard(range, readBlobUsage);

  return <AnalyticsDashboard view={view} />;
}
