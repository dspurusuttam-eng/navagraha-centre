import { redirect } from "next/navigation";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";
import { getLocalizedRedirectPath } from "@/modules/localization/routes";

export const revalidate = 3600;

export default async function RemediesPage() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();

  redirect(
    getLocalizedRedirectPath(locale, "/insights/remedies", {
      explicitLocalePrefix: hasExplicitLocalePrefix,
    })
  );
}
