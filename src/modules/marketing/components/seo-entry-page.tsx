import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { AiProductFamilySection } from "@/modules/marketing/components/ai-product-family-section";
import { PremiumProductCatalogSection } from "@/modules/report/components/premium-product-catalog-section";
import { ToolPageTemplate } from "@/modules/marketing/components/tool-page-template";
import {
  getSeoEntryPage,
  getSeoEntryStructuredData,
  type SeoEntryPage,
  type SeoEntryPageKey,
} from "@/modules/marketing/seo-entry-pages";
import {
  buildAcquisitionOnboardingPath,
  buildAcquisitionSignInPath,
  buildAcquisitionSignUpPath,
  getAcquisitionIntentConfig,
  isAcquisitionIntent,
} from "@/modules/acquisition/intents";

function getRelatedPages(relatedPages: readonly SeoEntryPageKey[]) {
  return relatedPages.map((key) => getSeoEntryPage(key));
}

function getMemberFlowLinks(entry: SeoEntryPage) {
  if (!isAcquisitionIntent(entry.key)) {
    return [
      {
        href: "/sign-up",
        label: "Create account",
        description: "Create your member profile and unlock chart setup.",
      },
      {
        href: "/dashboard/onboarding",
        label: "Complete onboarding",
        description:
          "Add birth details and generate your validated chart foundation.",
      },
      {
        href: "/dashboard/ask-my-chart",
        label: "Use Ask My Chart",
        description:
          "Ask chart-aware questions in the protected assistant workflow.",
      },
    ] as const;
  }

  const intentConfig = getAcquisitionIntentConfig(entry.key);

  return [
    {
      href: buildAcquisitionSignUpPath(entry.key),
      label: intentConfig.ctaLabel,
      description:
        "Start the protected onboarding flow from this public page and build the chart foundation first.",
    },
    {
      href: buildAcquisitionSignInPath(entry.key),
      label: "Continue to onboarding",
      description:
        "Existing members can sign in and continue directly to the onboarding route tied to this intent.",
    },
    {
      href: buildAcquisitionOnboardingPath(entry.key),
      label: "Open onboarding",
      description:
        "If you are already signed in, go straight to the onboarding surface with this acquisition intent preserved.",
    },
  ] as const;
}

export function SeoEntryPageView({ entry }: Readonly<{ entry: SeoEntryPage }>) {
  const acquisitionIntent = isAcquisitionIntent(entry.key) ? entry.key : null;
  const isAcquisitionPage = acquisitionIntent !== null;
  const relatedPages = getRelatedPages(entry.relatedPages);
  const structuredData = getSeoEntryStructuredData(entry);
  const memberFlowLinks = getMemberFlowLinks(entry);

  return (
    <>
      <PageViewTracker page={entry.path} feature={`seo-${entry.key}`} />

      {structuredData.map((item, index) => (
        <script
          key={`${entry.key}-structured-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
      {entry.key === "kundli-ai" ? (
        <AiProductFamilySection
          surface="public"
          pagePath={entry.path}
          tone="contrast"
          eyebrow="NAVAGRAHA AI Hub"
          title="Explore the NAVAGRAHA AI product family from one flagship surface."
          description="Use this hub to move between AI Kundli Reading, Compatibility, Career Insights, Remedies Guidance, and Ask My Chart with one coherent path."
        />
      ) : null}
      {entry.key === "career-report" ||
      entry.key === "finance-report" ||
      entry.key === "health-report" ||
      entry.key === "marriage-compatibility" ? (
        <PremiumProductCatalogSection
          surface="public"
          pagePath={entry.path}
          planType="FREE"
          includeKeys={[
            "career-report",
            "marriage-report",
            "finance-report",
            "health-report",
            "deep-ai-reading",
            "consultation-guidance",
          ]}
          upgradeHref="/pricing"
          tone="muted"
          eyebrow="Premium Reports Catalog"
          title="One premium catalog for reports, AI depth, and guided follow-up"
          description="Start with useful previews, then unlock deeper product layers only when you need richer report continuity."
        />
      ) : null}
      <ToolPageTemplate
        entry={entry}
        relatedPages={relatedPages}
        memberFlowLinks={memberFlowLinks}
        acquisitionIntent={isAcquisitionPage ? acquisitionIntent : null}
      />
    </>
  );
}
