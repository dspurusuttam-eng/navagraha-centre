import { redirect } from "next/navigation";
import { defaultLocale, getLocalizedPath } from "@/modules/localization/config";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";

export const revalidate = 3600;

export default async function LegacyInsightsPage() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const localizedDeskPath = getLocalizedPath(locale, "/from-the-desk", {
    forcePrefix: locale !== defaultLocale || hasExplicitLocalePrefix,
  });

  redirect(localizedDeskPath);
}
