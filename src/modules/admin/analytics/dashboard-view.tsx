// Founder analytics presentation. Deliberately dependency-free: the trend
// charts are hand-built inline SVG, so the private Admin bundle gains no chart
// library and the console stays fast on a phone over mobile data.
//
// Layout rules, all driven by the 360 px Android case:
//  * cards are a 2-up grid that never exceeds the viewport,
//  * long titles truncate instead of forcing a horizontal scrollbar,
//  * wide rows scroll inside their own container, never the page body,
//  * every control is at least 44 px tall.
import Link from "next/link";
import type {
  AnalyticsDashboardView,
  ArticlePerformanceRow,
  Metric,
  NamedCount,
  RangeKey,
  TrendPoint,
} from "@/modules/admin/analytics/dashboard-data";
import { RANGE_KEYS, RANGE_LABELS } from "@/modules/admin/analytics/dashboard-data";

const IST = "Asia/Kolkata";

function formatWhen(value: Date | null): string {
  if (!value) return "—";
  return `${value.toLocaleString("en-GB", {
    timeZone: IST,
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })} IST`;
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

function Delta({ metric }: Readonly<{ metric: Metric }>) {
  if (metric.value === null) return null;

  if (metric.changePct === null) {
    // No defensible ratio (previous window was zero) — show the raw comparison
    // rather than invent a percentage.
    return (
      <span className="text-xs text-neutral-500">
        {metric.previous === 0 ? "no prior activity" : `was ${metric.previous}`}
      </span>
    );
  }

  const up = metric.changePct >= 0;
  return (
    <span
      className={`text-xs font-medium ${up ? "text-emerald-700" : "text-red-700"}`}
    >
      {up ? "▲" : "▼"} {Math.abs(metric.changePct).toFixed(0)}%{" "}
      <span className="font-normal text-neutral-500">vs previous</span>
    </span>
  );
}

function MetricCard({
  label,
  metric,
  hint,
}: Readonly<{ label: string; metric: Metric; hint?: string }>) {
  return (
    <div className="min-w-0 rounded-lg border border-neutral-200 bg-white p-3">
      <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
        {label}
      </p>
      {metric.value === null ? (
        <>
          <p className="mt-1 text-lg font-semibold text-neutral-400">No data</p>
          <p className="mt-0.5 text-xs text-neutral-500">nothing recorded yet</p>
        </>
      ) : (
        <>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-neutral-900">
            {metric.value}
          </p>
          <div className="mt-0.5">
            <Delta metric={metric} />
          </div>
        </>
      )}
      {hint ? <p className="mt-1 text-[11px] text-neutral-500">{hint}</p> : null}
    </div>
  );
}

/** Bar sparkline. Pure SVG, scales to its container, no library. */
function Trend({ points, label }: Readonly<{ points: TrendPoint[]; label: string }>) {
  const max = points.reduce((m, p) => Math.max(m, p.count), 0);
  const total = points.reduce((sum, p) => sum + p.count, 0);

  if (!points.length || total === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-3">
        <p className="text-xs font-semibold text-neutral-700">{label}</p>
        <p className="mt-2 text-sm text-neutral-500">No data in this period.</p>
      </div>
    );
  }

  const width = 100;
  const height = 28;
  const gap = points.length > 40 ? 0.2 : 0.8;
  const barWidth = Math.max((width - gap * (points.length - 1)) / points.length, 0.4);

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="truncate text-xs font-semibold text-neutral-700">{label}</p>
        <p className="shrink-0 text-xs tabular-nums text-neutral-500">{total} total</p>
      </div>
      <svg
        aria-label={`${label}: ${total} across ${points.length} day(s), peak ${max}`}
        className="mt-2 h-10 w-full"
        preserveAspectRatio="none"
        role="img"
        viewBox={`0 0 ${width} ${height}`}
      >
        {points.map((point, index) => {
          const barHeight = max === 0 ? 0 : (point.count / max) * height;
          return (
            <rect
              key={point.day}
              fill={point.count === 0 ? "#e5e5e5" : "#171717"}
              height={Math.max(barHeight, point.count > 0 ? 1 : 0.6)}
              rx="0.4"
              width={barWidth}
              x={index * (barWidth + gap)}
              y={height - Math.max(barHeight, point.count > 0 ? 1 : 0.6)}
            />
          );
        })}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-neutral-400">
        <span>{points[0]?.day}</span>
        <span>{points[points.length - 1]?.day}</span>
      </div>
    </div>
  );
}

function Panel({
  title,
  note,
  children,
}: Readonly<{ title: string; note?: string; children: React.ReactNode }>) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
      {note ? <p className="mt-0.5 text-xs text-neutral-500">{note}</p> : null}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function EmptyRow({ message }: Readonly<{ message: string }>) {
  return <p className="text-sm text-neutral-500">{message}</p>;
}

function ArticleTable({
  rows,
  metric,
  empty,
}: Readonly<{
  rows: readonly ArticlePerformanceRow[];
  metric: "views" | "likes" | "shares" | "published";
  empty: string;
}>) {
  if (!rows.length) return <EmptyRow message={empty} />;

  return (
    <ul className="divide-y divide-neutral-100">
      {rows.map((row) => (
        <li key={row.slug} className="flex items-center justify-between gap-3 py-2">
          <div className="min-w-0 flex-1">
            <Link
              className="block truncate text-sm text-neutral-900 underline-offset-2 hover:underline"
              href={`/from-the-desk/${row.slug}`}
              rel="noreferrer"
              target="_blank"
            >
              {row.title}
            </Link>
            <p className="mt-0.5 truncate text-[11px] text-neutral-500">
              {row.publishedAt ? row.publishedAt.slice(0, 10) : "unpublished"}
              {row.engagementPct !== null && metric !== "published"
                ? ` · ${row.engagementPct.toFixed(1)}% liked`
                : ""}
            </p>
          </div>
          <span className="shrink-0 text-sm font-semibold tabular-nums text-neutral-900">
            {metric === "published" ? "" : row[metric]}
          </span>
        </li>
      ))}
    </ul>
  );
}

function CountList({
  rows,
  empty,
}: Readonly<{ rows: readonly NamedCount[]; empty: string }>) {
  if (!rows.length) return <EmptyRow message={empty} />;
  return (
    <ul className="divide-y divide-neutral-100">
      {rows.map((row) => (
        <li key={row.label} className="flex items-center justify-between gap-3 py-2">
          <span className="min-w-0 truncate text-sm text-neutral-800">{row.label}</span>
          <span className="shrink-0 text-sm font-semibold tabular-nums">{row.count}</span>
        </li>
      ))}
    </ul>
  );
}

function Stat({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="min-w-0">
      <dt className="truncate text-[11px] uppercase tracking-wide text-neutral-500">{label}</dt>
      <dd className="truncate text-sm font-semibold text-neutral-900">{value}</dd>
    </div>
  );
}

export function AnalyticsDashboard({
  view,
}: Readonly<{ view: AnalyticsDashboardView }>) {
  const { overview, trends, content, sharing, consultation, notifications, search, health } = view;

  return (
    <section className="mx-auto max-w-4xl space-y-5 pb-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Anonymous aggregates only — no reader identities exist anywhere in this
          data. Events are kept for 90 days.
        </p>
      </header>

      {/* Range filter: plain links, so the range survives reload and sharing and
          the page needs no client JavaScript to switch. */}
      <nav aria-label="Time range" className="flex flex-wrap gap-2">
        {RANGE_KEYS.map((key: RangeKey) => {
          const active = key === view.range.key;
          return (
            <Link
              key={key}
              aria-current={active ? "page" : undefined}
              className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium ${
                active
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-300 bg-white text-neutral-700"
              }`}
              href={`/admin/analytics?range=${key}`}
            >
              {RANGE_LABELS[key]}
            </Link>
          );
        })}
      </nav>

      <p className="text-xs text-neutral-500">
        {view.range.label} · {formatWhen(view.range.from)} → {formatWhen(view.range.to)} ·
        generated {formatWhen(view.generatedAt)} · newest event {formatWhen(view.lastEventAt)}
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Article views" metric={overview.articleViews} />
        <MetricCard
          label="Unique visitors"
          metric={overview.uniqueVisitors}
          hint="distinct anonymous devices"
        />
        <MetricCard label="Likes" metric={overview.likes} />
        <MetricCard label="Shares" metric={overview.shares} />
        <MetricCard label="Consultation CTA" metric={overview.consultationCtaClicks} />
        <MetricCard label="WhatsApp handoffs" metric={overview.whatsappHandoffs} />
        <MetricCard label="Notification opt-ins" metric={overview.notificationOptIns} />
        <MetricCard label="Notification opens" metric={overview.notificationOpens} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Trend label="Article views" points={trends.articleViews} />
        <Trend label="Likes" points={trends.likes} />
        <Trend label="Shares" points={trends.shares} />
        <Trend label="Consultation actions" points={trends.consultation} />
        <Trend label="Notification opens" points={trends.notificationOpens} />
      </div>

      <Panel
        note="Ranked within the selected period. Engagement rate is shown only where the view count is large enough for the ratio to mean anything."
        title="Content performance"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Most viewed
            </h3>
            <ArticleTable empty="No article views recorded." metric="views" rows={content.mostViewed} />
          </div>
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Most liked
            </h3>
            <ArticleTable empty="No likes recorded." metric="likes" rows={content.mostLiked} />
          </div>
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Most shared
            </h3>
            <ArticleTable empty="No shares recorded." metric="shares" rows={content.mostShared} />
          </div>
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Newest published
            </h3>
            <ArticleTable empty="No published articles." metric="published" rows={content.newest} />
          </div>
        </div>
      </Panel>

      <Panel
        note="Channel is recorded per share; no device or reader is identifiable."
        title="Sharing by channel"
      >
        <CountList empty="No shares recorded in this period." rows={sharing} />
      </Panel>

      <Panel
        note="Funnel percentages appear only when both steps of the step were genuinely recorded."
        title="Consultation"
      >
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Page visits" value={String(consultation.pageVisits)} />
          <Stat label="CTA clicks" value={String(consultation.ctaClicks)} />
          <Stat label="WhatsApp handoffs" value={String(consultation.handoffs)} />
          <Stat
            label="CTA → handoff"
            value={
              consultation.ctaToHandoffPct === null
                ? "No data"
                : `${consultation.ctaToHandoffPct.toFixed(0)}%`
            }
          />
        </dl>
        <p className="mt-3 text-xs text-neutral-500">
          Consultation questions and client details are never stored — only that a
          handoff occurred.
        </p>
      </Panel>

      <Panel
        note="Sent, delivered and opened are separate measurements and are not interchangeable."
        title="Notifications"
      >
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Bell opened" value={String(notifications.promptsOpened)} />
          <Stat label="Opt-ins" value={String(notifications.optIns)} />
          <Stat label="Opt-outs" value={String(notifications.optOuts)} />
          <Stat label="Active subscriptions" value={String(notifications.activeSubscriptions)} />
          <Stat label="Sent (all time)" value={String(notifications.sent)} />
          <Stat label="Delivered" value={String(notifications.succeeded)} />
          <Stat label="Failed" value={String(notifications.failed)} />
          <Stat label="Opens (period)" value={String(notifications.opens)} />
        </dl>
        <h3 className="mb-1 mt-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Recent broadcasts
        </h3>
        {notifications.recent.length === 0 ? (
          <EmptyRow message="No announcements sent yet." />
        ) : (
          <ul className="divide-y divide-neutral-100">
            {notifications.recent.map((send) => (
              <li key={`${send.title}-${send.createdAt.toISOString()}`} className="py-2">
                <p className="truncate text-sm font-medium text-neutral-900">{send.title}</p>
                <p className="mt-0.5 text-[11px] text-neutral-500">
                  {formatWhen(send.createdAt)} · sent {send.total} · delivered {send.succeeded} ·
                  failed {send.failed}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel
        note={`Terms appearing fewer than 3 times are suppressed, so an unusual one-off search can never be singled out.${
          search.suppressedTerms > 0 ? ` ${search.suppressedTerms} rare term(s) hidden.` : ""
        }`}
        title="Search"
      >
        <dl className="grid grid-cols-3 gap-3">
          <Stat label="Searches" value={String(search.total)} />
          <Stat label="With results" value={String(search.withResults)} />
          <Stat label="Zero results" value={String(search.zeroResults)} />
        </dl>
        <h3 className="mb-1 mt-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Popular terms
        </h3>
        <CountList
          empty="No search terms have reached the display threshold yet."
          rows={search.terms}
        />
      </Panel>

      <Panel note="Private operational status. No secrets or environment values." title="System health">
        <dl className="grid grid-cols-2 gap-3">
          <Stat
            label="Analytics ingestion"
            value={view.ingestionOk ? "Receiving" : "No events yet"}
          />
          <Stat label="Newest event" value={formatWhen(view.lastEventAt)} />
          <Stat label="Events stored" value={String(health.eventsStored)} />
          <Stat label="Database" value={health.databaseOk ? "Reachable" : "Unreachable"} />
          <Stat label="Latest publication" value={formatWhen(health.latestPublicationAt)} />
          <Stat label="YouTube last sync" value={formatWhen(health.youtubeLastSyncAt)} />
          <Stat label="YouTube rail" value={health.youtubeEnabled ? "Visible" : "Hidden"} />
          <Stat
            label="Media storage"
            value={
              health.blob
                ? `${formatBytes(health.blob.bytes)} · ${health.blob.count} file(s)`
                : "Unavailable"
            }
          />
        </dl>
        {health.latestPublicationTitle ? (
          <p className="mt-3 truncate text-xs text-neutral-500">
            Latest: {health.latestPublicationTitle}
          </p>
        ) : null}
        {health.youtubeLastError ? (
          <p className="mt-2 rounded bg-amber-50 p-2 text-xs text-amber-900">
            YouTube last error: {health.youtubeLastError}
          </p>
        ) : null}
        {health.blob && health.blob.bytes > 0.8 * 1024 ** 3 ? (
          <p className="mt-2 rounded bg-amber-50 p-2 text-xs font-medium text-amber-900">
            Approaching the practical free-tier storage limit — review old media
            before uploading large batches.
          </p>
        ) : null}
      </Panel>
    </section>
  );
}
