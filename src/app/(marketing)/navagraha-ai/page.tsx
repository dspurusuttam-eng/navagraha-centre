import { permanentRedirect } from "next/navigation";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";
import { getLocalizedRedirectPath } from "@/modules/localization/routes";

export default async function NavagrahaAiAliasPage() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();

  permanentRedirect(
    getLocalizedRedirectPath(locale, "/ai", {
      explicitLocalePrefix: hasExplicitLocalePrefix,
    })
  );
}
