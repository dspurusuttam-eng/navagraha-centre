import { redirect } from "next/navigation";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";
import { getLocalizedRedirectPath } from "@/modules/localization/routes";

export default async function CompatibilityEntryPage() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();

  redirect(
    getLocalizedRedirectPath(locale, "/matchmaking", {
      explicitLocalePrefix: hasExplicitLocalePrefix,
    })
  );
}
