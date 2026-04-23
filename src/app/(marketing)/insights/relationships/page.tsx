import { buildPageMetadata } from "@/lib/metadata";
import { getContentAdapter } from "@/modules/content";
import {
  getEntriesForInsightsCategory,
  insightsCategories,
  requireInsightsCategory,
} from "@/modules/content/insights-authority";
import {
  InsightsCategoryPage,
  selectRelatedCategoryConfigs,
} from "@/modules/content/components/insights-category-page";

const category = requireInsightsCategory("relationships");

export const metadata = buildPageMetadata({
  title: category.metadataTitle,
  description: category.metadataDescription,
  path: category.path,
  keywords: category.keywords,
});

export const revalidate = 3600;

export default async function InsightsRelationshipsCategoryPage() {
  const entries = await getContentAdapter().listPublishedEntries();

  return (
    <InsightsCategoryPage
      category={category}
      entries={getEntriesForInsightsCategory("relationships", entries)}
      relatedCategories={selectRelatedCategoryConfigs(
        insightsCategories,
        "relationships"
      )}
    />
  );
}
