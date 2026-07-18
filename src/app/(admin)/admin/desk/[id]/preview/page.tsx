// Claude Admin Console C4B1 — protected private draft preview.
// Renders the current draft via the ADMIN data source only, under the (admin) layout
// (authenticated by requireAdminPageSession). noindex + force-dynamic + no-store so the
// draft is never publicly indexed or cached. No public Desk integration.
import type { Metadata } from "next";
import Link from "next/link";
import { getAdminArticleDeps } from "@/modules/admin/articles/service";
import { getArticle } from "@/modules/admin/articles/service-core";
// Reuses the same pure heading/paragraph parser the public Desk page renders through, via the
// neutral desk-sidecar module (never the public content module — Admin stays isolated from it)
// so a preview matches what /from-the-desk will eventually show, instead of dumping raw
// Markdown source as text.
import { inspectDeskBody, parseBodyToSections } from "@/modules/desk-sidecar/sidecar";

export const metadata: Metadata = {
  title: "Preview — Admin Console",
  robots: { index: false, follow: false, nocache: true },
};

// Never statically rendered or publicly cached — always per-request behind admin auth.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function DeskPreviewPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const result = await getArticle(getAdminArticleDeps(), id);

  if (!result.ok) {
    return (
      <section className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Preview unavailable</h1>
        <p className="text-sm text-neutral-600">This article could not be loaded.</p>
        <Link href="/admin/desk" className="inline-flex min-h-11 items-center rounded-md border px-4 py-2 text-sm">
          Back to list
        </Link>
      </section>
    );
  }

  const article = result.data;
  // C8B2: preview the human-readable body only — the structured sidecar is never shown.
  const { visibleBody } = inspectDeskBody(article.body);
  const sections = parseBodyToSections(visibleBody);
  return (
    <article className="mx-auto max-w-3xl space-y-4">
      <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        Private draft preview — not public. Status:{" "}
        <span className="font-medium uppercase">{article.status}</span> · Language: {article.language}
      </div>
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">{article.title}</h1>
        {article.summary ? <p className="text-neutral-600">{article.summary}</p> : null}
      </header>
      {sections.length > 0 ? (
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.title} className="space-y-2">
              <h2 className="text-lg font-semibold tracking-tight text-neutral-900">{section.title}</h2>
              <div className="space-y-3 text-sm leading-relaxed text-neutral-800">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-neutral-500">No body content yet.</p>
      )}
      <div className="pt-2">
        <Link href={`/admin/desk/${id}`} className="inline-flex min-h-11 items-center rounded-md border px-4 py-2 text-sm">
          Back to editor
        </Link>
      </div>
    </article>
  );
}
