import { redirect } from "next/navigation";
import { createToolMetadata } from "@/lib/seo/metadata";
import { getCoreSeoCopy } from "@/lib/seo/seo-config";
import { getLocalizedPath } from "@/modules/localization/config";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const localized = getCoreSeoCopy("compatibility", locale);

  return createToolMetadata({
    title: localized.title,
    description: localized.description,
    path: "/compatibility",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: [
      "marriage compatibility",
      "guna milan",
      "relationship astrology",
      "kundli matching",
    ],
  });
}

export default async function CompatibilityEntryPage() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();

  redirect(
    getLocalizedPath(locale, "/marriage-compatibility", {
      forcePrefix: hasExplicitLocalePrefix,
    })
  );
}
