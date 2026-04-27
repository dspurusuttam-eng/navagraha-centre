import { createToolMetadata } from "@/lib/seo/metadata";
import { getCoreSeoCopy } from "@/lib/seo/seo-config";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";
import { SeoEntryPageView } from "@/modules/marketing/components/seo-entry-page";
import { getSeoEntryPage } from "@/modules/marketing/seo-entry-pages";

const entry = getSeoEntryPage("marriage-compatibility");

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const localized = getCoreSeoCopy("compatibility", locale);

  return createToolMetadata({
    title: localized.title,
    description: localized.description,
    path: "/marriage-compatibility",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: entry.metadata.keywords,
  });
}

export default function MarriageCompatibilityPage() {
  return <SeoEntryPageView entry={entry} />;
}
