// In-app notification feed: the latest published Desk articles from the same
// cached authoritative adapter as Home/Desk/sitemap. Public, anonymous,
// read-only.
import { NextResponse } from "next/server";
import { getDeskContentAdapter } from "@/modules/content/desk-article-adapter";

export const runtime = "nodejs";

export async function GET() {
  try {
    const entries = await getDeskContentAdapter().listPublishedEntries();
    const items = [...entries]
      .sort(
        (a, b) =>
          new Date(b.publishedAt ?? 0).getTime() -
          new Date(a.publishedAt ?? 0).getTime()
      )
      .slice(0, 10)
      .map((entry) => ({
        slug: entry.slug,
        title: entry.title,
        path: entry.path,
        publishedAt: entry.publishedAt ?? null,
      }));
    return NextResponse.json(
      { ok: true, items },
      // Small shared cache: the feed only changes on publish, and the desk
      // adapter behind it is tag-invalidated anyway.
      { headers: { "cache-control": "public, s-maxage=300, stale-while-revalidate=600" } }
    );
  } catch {
    return NextResponse.json({ ok: false, items: [] }, { status: 500 });
  }
}
