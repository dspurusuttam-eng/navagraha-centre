// Claude Admin Console C4A — Desk article list view (server-safe; mobile-first).
import Link from "next/link";
import { DESK_STATUS_OPTIONS, DESK_LANGUAGE_OPTIONS, buildDeskUrl } from "@/modules/admin/desk/desk-list";
import type { ArticleListFilters, ArticleListResult, ServiceResult } from "@/modules/admin/articles/types";

export function DeskArticleList({
  result,
  query,
}: Readonly<{ result: ServiceResult<ArticleListResult>; query: ArticleListFilters }>) {
  return (
    <section className="mx-auto max-w-3xl space-y-5">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Desk</h1>
        <Link
          href="/admin/desk/new"
          className="flex min-h-11 items-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          New article
        </Link>
      </header>

      <form method="get" action="/admin/desk" role="search" aria-label="Filter articles" className="grid gap-2 sm:grid-cols-[1fr_1fr_2fr_auto]">
        <select name="status" defaultValue={query.status ?? ""} aria-label="Filter by status" className="min-h-11 rounded-md border px-3">
          <option value="">All statuses</option>
          {DESK_STATUS_OPTIONS.map((status) => (<option key={status} value={status}>{status}</option>))}
        </select>
        <select name="language" defaultValue={query.language ?? ""} aria-label="Filter by language" className="min-h-11 rounded-md border px-3">
          <option value="">All languages</option>
          {DESK_LANGUAGE_OPTIONS.map((code) => (<option key={code} value={code}>{code}</option>))}
        </select>
        <input name="search" type="search" defaultValue={query.search ?? ""} placeholder="Search title / slug" aria-label="Search articles" className="min-h-11 rounded-md border px-3" />
        <button type="submit" className="min-h-11 rounded-md border px-4 text-sm font-medium">Filter</button>
      </form>

      {!result.ok ? (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          The article list is temporarily unavailable. Please retry shortly.
        </p>
      ) : result.data.items.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-sm text-neutral-500">
          No articles match these filters yet. Use “New article” to create one.
        </div>
      ) : (
        <>
          <ul className="divide-y rounded-lg border bg-white">
            {result.data.items.map((article) => (
              <li key={article.id}>
                <Link href={`/admin/desk/${article.id}`} className="flex min-h-11 items-center justify-between gap-3 px-4 py-3">
                  <span className="min-w-0 truncate text-sm">{article.title}</span>
                  <span className="shrink-0 text-xs uppercase tracking-wide text-neutral-500">{article.status}</span>
                </Link>
              </li>
            ))}
          </ul>
          <nav aria-label="Pagination" className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">
              Page {result.data.page} of {result.data.pageCount} · {result.data.total} total
            </span>
            <span className="flex gap-2">
              {result.data.page > 1 ? (
                <Link href={buildDeskUrl(query, result.data.page - 1)} className="rounded-md border px-3 py-1.5">Previous</Link>
              ) : null}
              {result.data.page < result.data.pageCount ? (
                <Link href={buildDeskUrl(query, result.data.page + 1)} className="rounded-md border px-3 py-1.5">Next</Link>
              ) : null}
            </span>
          </nav>
        </>
      )}
    </section>
  );
}
