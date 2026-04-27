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
  const localized = getCoreSeoCopy("navagrahaAi", locale);

  return createToolMetadata({
    title: localized.title,
    description: localized.description,
    path: "/navagraha-ai",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: [
      "navagraha ai",
      "ai astrology guidance",
      "kundli ai",
      "vedic astrology ai",
    ],
  });
}

export default async function NavagrahaAiAliasPage() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();

  redirect(
    getLocalizedPath(locale, "/ai", {
      forcePrefix: hasExplicitLocalePrefix,
    })
  );
}
