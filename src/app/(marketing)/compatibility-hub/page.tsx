import { buildPageMetadata } from "@/lib/metadata";
import { ContentHubPage } from "@/modules/content/components/content-hub-page";
import { getRelatedContentHubs, getRequiredContentHubBySlug } from "@/modules/content/hubs";

const hub = getRequiredContentHubBySlug("compatibility");

export const metadata = buildPageMetadata({
  title: hub.metadata.title,
  description: hub.metadata.description,
  path: hub.path,
  keywords: hub.metadata.keywords,
});

export default function CompatibilityHubPage() {
  return <ContentHubPage hub={hub} relatedHubs={getRelatedContentHubs(hub)} />;
}
