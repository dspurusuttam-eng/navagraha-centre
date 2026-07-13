import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import {
  PremiumArticleCard,
  PremiumBentoGrid,
  PremiumBentoSection,
  PremiumPageShell,
  PremiumRouteTile,
  PremiumSectionHeading,
} from "@/components/ui/premium";
import {
  type FeatureStatusRegistryEntry,
  featureStatusRegistry,
} from "@/config/feature-status-registry";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getContentAdapter } from "@/modules/content";
import { defaultLocale, getLocalizedPath } from "@/modules/localization/config";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();

  return createPageMetadata({
    title: "NAVAGRAHA CENTRE Consultation Desk",
    description:
      "Consultation-first Vedic astrology guidance, Desk articles, methodology and support from NAVAGRAHA CENTRE.",
    path: "/",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: [
      "astrology consultation",
      "from the desk",
      "vedic consultation",
      "acharya guidance",
      "navagraha centre",
    ],
  });
}

export const revalidate = 3600;

const primaryFeatureKeys = ["consult", "desk"] as const;
const secondaryFeatureKeys = ["acharya", "account"] as const;
const hiddenHomeContentTerms = [
  "Ask NI",
  "Dasha",
  "Gemstone",
  "Gochar",
  "Horoscope",
  "Kundli",
  "Muhurat",
  "Numerology",
  "Panchang",
  "Rashifal",
  "Remedies",
  "Reports",
  "Shop",
  "Tools",
] as const;

const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function getFeature(featureKey: string): FeatureStatusRegistryEntry | null {
  const feature = featureStatusRegistry.find(
    (feature) =>
      feature.featureKey === featureKey &&
      feature.visibility === "LIVE" &&
      feature.runtimeEnabled
  );

  return feature ? (feature as FeatureStatusRegistryEntry) : null;
}

function isFeature(
  feature: FeatureStatusRegistryEntry | null
): feature is FeatureStatusRegistryEntry {
  return feature !== null;
}

function formatDeskDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);

  if (!year || !month || !day) {
    return value.slice(0, 10);
  }

  return `${day} ${monthLabels[month - 1]} ${year}`;
}

function isHomeSafeDeskEntry(entry: {
  category: string;
  title: string;
}) {
  const candidate = `${entry.title} ${entry.category}`.toLowerCase();

  return !hiddenHomeContentTerms.some((term) =>
    candidate.includes(term.toLowerCase())
  );
}

export default async function HomePage() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const localizeHref = (href: string) =>
    getLocalizedPath(locale, href, {
      forcePrefix: locale !== defaultLocale || hasExplicitLocalePrefix,
    });

  const contentAdapter = getContentAdapter();
  const latestDeskEntries = (
    await contentAdapter.listPublishedEntriesByLocale(locale)
  )
    .filter(isHomeSafeDeskEntry)
    .slice(0, 4);
  const primaryFeatures = primaryFeatureKeys
    .map((featureKey) => getFeature(featureKey))
    .filter(isFeature);
  const secondaryFeatures = secondaryFeatureKeys
    .map((featureKey) => getFeature(featureKey))
    .filter(isFeature);

  return (
    <>
      <PageViewTracker page="/" feature="consultation-first-home" />

      <PremiumPageShell
        className="pb-[calc(6rem+env(safe-area-inset-bottom))] xl:pb-12"
        tone="soft"
      >
        <PremiumBentoSection className="pt-5 sm:pt-8">
          <div className="rounded-[var(--ui-radius-2xl)] border border-[color:var(--ui-color-border-gold)] bg-white px-5 py-6 shadow-[var(--ui-shadow-md)] sm:px-6 sm:py-8">
            <h1 className="font-[family-name:var(--font-family-editorial)] text-[length:var(--font-size-title-lg)] leading-[var(--line-height-heading)] text-[color:var(--ui-color-text-primary)]">
              NAVAGRAHA CENTRE
            </h1>
          </div>
        </PremiumBentoSection>

        <PremiumBentoSection label="Primary">
          <PremiumBentoGrid className="sm:grid-cols-2 lg:grid-cols-2">
            {primaryFeatures.map((feature) => (
              <PremiumRouteTile
                key={feature.featureKey}
                access={feature.access}
                href={localizeHref(feature.route)}
                iconKey={feature.iconKey}
                label={feature.label}
                showMeta={false}
                status={feature.visibility}
              />
            ))}
          </PremiumBentoGrid>
        </PremiumBentoSection>

        <PremiumBentoSection label="Secondary" className="pt-0">
          <PremiumBentoGrid className="sm:grid-cols-2 lg:grid-cols-2">
            {secondaryFeatures.map((feature) => (
              <PremiumRouteTile
                key={feature.featureKey}
                access={feature.access}
                href={localizeHref(feature.route)}
                iconKey={feature.iconKey}
                label={feature.label}
                showMeta={false}
                status={feature.visibility}
              />
            ))}
          </PremiumBentoGrid>
        </PremiumBentoSection>

        <PremiumBentoSection className="pt-0">
          <PremiumSectionHeading label="Latest Desk" />
          <PremiumBentoGrid className="sm:grid-cols-2 lg:grid-cols-4">
            {latestDeskEntries.map((entry) => (
              <PremiumArticleCard
                key={`${entry.locale ?? defaultLocale}-${entry.slug}`}
                category={entry.category}
                date={formatDeskDate(entry.publishedAt)}
                href={localizeHref(entry.path)}
                title={entry.title}
              />
            ))}
          </PremiumBentoGrid>
        </PremiumBentoSection>
      </PremiumPageShell>
    </>
  );
}
