// Claude Admin Console C4A — Desk article management list.
import type { Metadata } from "next";
import { DeskArticleList } from "@/modules/admin/desk/desk-article-list";
import { buildDeskListQuery } from "@/modules/admin/desk/desk-list";
import { getAdminArticleDeps } from "@/modules/admin/articles/service";
import { listArticles } from "@/modules/admin/articles/service-core";

export const metadata: Metadata = {
  title: "Desk — Admin Console",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DeskListPage({
  searchParams,
}: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  const query = buildDeskListQuery(await searchParams);
  const result = await listArticles(getAdminArticleDeps(), query);
  return <DeskArticleList result={result} query={query} />;
}
