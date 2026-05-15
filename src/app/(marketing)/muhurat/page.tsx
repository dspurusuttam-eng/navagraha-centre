import { MuhuratFoundationPage } from "@/modules/muhurta-lite/components/muhurat-foundation-page";
import { createToolMetadata } from "@/lib/seo/metadata";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();

  return createToolMetadata({
    title: "Muhurat & Hindu Calendar",
    description:
      "Use traditional timing guidance with verified Panchang context, safe preparation states, and consultation-led support for important events.",
    path: "/muhurat",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: [
      "muhurat calculator",
      "hindu calendar",
      "festival calendar",
      "choghadiya",
      "hora",
      "rahu kaal",
    ],
  });
}

export const revalidate = 3600;

export default function MuhuratPage() {
  return <MuhuratFoundationPage pagePath="/muhurat" />;
}
