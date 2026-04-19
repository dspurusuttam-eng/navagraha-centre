import { buildPageMetadata } from "@/lib/metadata";
import { SeoEntryPageView } from "@/modules/marketing/components/seo-entry-page";
import { getSeoEntryPage } from "@/modules/marketing/seo-entry-pages";

const entry = getSeoEntryPage("daily-rashifal");

export const metadata = buildPageMetadata({
  title: entry.metadata.title,
  description: entry.metadata.description,
  path: entry.path,
  keywords: entry.metadata.keywords,
});

export default function DailyRashifalPage() {
  return <SeoEntryPageView entry={entry} />;
}
