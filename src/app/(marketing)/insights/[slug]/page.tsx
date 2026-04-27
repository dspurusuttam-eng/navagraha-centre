import { redirect } from "next/navigation";
import { defaultLocale, getLocalizedPath } from "@/modules/localization/config";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";

type LegacyInsightDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate = 3600;

export default async function LegacyInsightDetailPage({
  params,
}: Readonly<LegacyInsightDetailPageProps>) {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const localizedDeskPath = getLocalizedPath(locale, `/from-the-desk/${slug}`, {
    forcePrefix: locale !== defaultLocale || hasExplicitLocalePrefix,
  });

  redirect(localizedDeskPath);
}
