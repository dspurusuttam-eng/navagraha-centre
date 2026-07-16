// Claude Admin Console C6A — Media library list view (server-safe; mobile-first).
import Link from "next/link";
import { MEDIA_KIND_OPTIONS, buildMediaUrl, formatByteSize, formatDimensions } from "@/modules/admin/media/media-list";
import type { MediaListFilters, MediaListResult, ServiceResult } from "@/modules/admin/media/types";

export function MediaAssetList({
  result,
  query,
  canWrite,
}: Readonly<{ result: ServiceResult<MediaListResult>; query: MediaListFilters; canWrite: boolean }>) {
  return (
    <section className="mx-auto max-w-3xl space-y-5">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Media</h1>
        {canWrite ? (
          <Link
            href="/admin/media/new"
            className="flex min-h-11 items-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
          >
            Register media
          </Link>
        ) : null}
      </header>

      <form method="get" action="/admin/media" role="search" aria-label="Filter media" className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
        <select name="kind" defaultValue={query.kind ?? ""} aria-label="Filter by kind" className="min-h-11 rounded-md border px-3">
          <option value="">All kinds</option>
          {MEDIA_KIND_OPTIONS.map((kind) => (<option key={kind} value={kind}>{kind}</option>))}
        </select>
        <input
          name="search" type="search" defaultValue={query.search ?? ""}
          placeholder="Search filename / alt text" aria-label="Search media"
          className="min-h-11 rounded-md border px-3"
        />
        <button type="submit" className="min-h-11 rounded-md border px-4 text-sm font-medium">Filter</button>
      </form>

      {!result.ok ? (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          The media library is temporarily unavailable. Please retry shortly.
        </p>
      ) : result.data.items.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-sm text-neutral-500">
          {query.search || query.kind
            ? "No media matches these filters."
            : canWrite
              ? "No media registered yet. Use “Register media” to add a URL reference."
              : "No media registered yet."}
        </div>
      ) : (
        <>
          <ul className="divide-y rounded-lg border bg-white">
            {result.data.items.map((asset) => (
              <li key={asset.id}>
                <Link href={`/admin/media/${asset.id}`} className="flex min-h-11 items-center justify-between gap-3 px-4 py-3">
                  <span className="min-w-0">
                    <span className="block truncate text-sm">{asset.filename ?? asset.url}</span>
                    <span className="block truncate text-xs text-neutral-500">
                      {asset.mimeType ?? asset.kind} · {formatDimensions(asset.width, asset.height)} · {formatByteSize(asset.byteSize)}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs uppercase tracking-wide text-neutral-500">{asset.kind}</span>
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
                <Link href={buildMediaUrl(query, result.data.page - 1)} className="rounded-md border px-3 py-1.5">Previous</Link>
              ) : null}
              {result.data.page < result.data.pageCount ? (
                <Link href={buildMediaUrl(query, result.data.page + 1)} className="rounded-md border px-3 py-1.5">Next</Link>
              ) : null}
            </span>
          </nav>
        </>
      )}
    </section>
  );
}
