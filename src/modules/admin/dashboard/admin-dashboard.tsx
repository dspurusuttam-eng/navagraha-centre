// Claude Admin Console C3B2 — admin dashboard view (server-safe; mobile-first).
// Renders only the C3B2-scoped widgets with ready / empty / unavailable states.
import Link from "next/link";
import { availabilityLabel, type AdminDashboardView } from "@/modules/admin/dashboard/dashboard-core";

function StatCard({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function Unavailable() {
  return <p className="text-sm text-neutral-500">Temporarily unavailable. Please retry shortly.</p>;
}

export function AdminDashboard({ view }: Readonly<{ view: AdminDashboardView }>) {
  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="max-w-prose text-sm text-neutral-600">
          Operations overview for the private Admin Console.
        </p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/admin/desk"
          className="flex min-h-11 items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          Create New Article
        </Link>
        <Link
          href="/admin/consultation"
          className="flex min-h-11 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium"
        >
          Edit Consultation Details
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {view.articleCounts.state === "ready" ? (
          <>
            <StatCard label="Published articles" value={String(view.articleCounts.data.published)} />
            <StatCard label="Draft articles" value={String(view.articleCounts.data.draft)} />
          </>
        ) : (
          <div className="col-span-2 rounded-lg border bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">Article counts</p>
            <div className="mt-1">
              <Unavailable />
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white p-4">
        <h2 className="text-sm font-medium">Consultation availability</h2>
        <div className="mt-2">
          {view.consultation.state === "ready" ? (
            <p className="text-sm">
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium">
                {availabilityLabel(view.consultation.data.availabilityStatus)}
              </span>
              {!view.consultation.data.isEnabled ? (
                <span className="ml-2 text-neutral-500">(consultation disabled)</span>
              ) : null}
            </p>
          ) : (
            <Unavailable />
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4">
        <h2 className="text-sm font-medium">Recently updated articles</h2>
        <div className="mt-2">
          {view.recentArticles.state === "unavailable" ? (
            <Unavailable />
          ) : view.recentArticles.data.length === 0 ? (
            <p className="text-sm text-neutral-500">No articles yet.</p>
          ) : (
            <ul className="divide-y">
              {view.recentArticles.data.map((article) => (
                <li key={article.id} className="flex items-center justify-between gap-3 py-2">
                  <span className="min-w-0 truncate text-sm">{article.title}</span>
                  <span className="shrink-0 text-xs uppercase tracking-wide text-neutral-500">{article.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
