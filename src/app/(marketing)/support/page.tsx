import Link from "next/link";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { JsonLd } from "@/components/seo/json-ld";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  PremiumBentoGrid,
  PremiumBentoSection,
  PremiumPageShell,
  PremiumRouteTile,
  PremiumStatusBadge,
} from "@/components/ui/premium";
import {
  getFeatureStatus,
  type FeatureStatusRecord,
} from "@/config/feature-status-registry";
import { createPageMetadata } from "@/lib/seo/metadata";
import {
  createBreadcrumbSchema,
  createWebPageSchema,
} from "@/lib/seo/schema";
import { defaultLocale, getLocalizedPath } from "@/modules/localization/config";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";

const supportTiles = [
  { featureKey: "consult", label: "Consultation" },
  { featureKey: "contact", label: "Account support", href: "/contact?intent=account-support" },
  { featureKey: "desk", label: "Content / Desk" },
  {
    featureKey: "contact",
    label: "Technical issue",
    href: "/contact?intent=general-inquiry",
  },
  { featureKey: "privacy", label: "Privacy" },
  { featureKey: "refund-cancellation", label: "Refund" },
] as const satisfies ReadonlyArray<{
  featureKey: FeatureStatusRecord["featureKey"];
  label: string;
  href?: string;
}>;

const unavailableActions = ["Live chat", "WhatsApp", "Ticket number"] as const;

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();

  return createPageMetadata({
    title: "Support",
    description:
      "NAVAGRAHA CENTRE support access for consultation, account, Desk content, technical issues, privacy, and refund information.",
    path: "/support",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: ["support", "contact", "consultation", "account support"],
  });
}

export const revalidate = 3600;

export default async function SupportPage() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const localizeHref = (href: string) =>
    getLocalizedPath(locale, href, {
      forcePrefix: locale !== defaultLocale || hasExplicitLocalePrefix,
    });
  const pageSchemas = [
    createBreadcrumbSchema({
      locale,
      explicitLocalePrefix: hasExplicitLocalePrefix,
      items: [
        { name: "Home", path: "/" },
        { name: "Support", path: "/support" },
      ],
    }),
    createWebPageSchema({
      title: "Support",
      description:
        "Support surface for consultation, account access, Desk content, technical issues, privacy, and refund information.",
      path: "/support",
      locale,
      explicitLocalePrefix: hasExplicitLocalePrefix,
    }),
  ];

  return (
    <>
      <JsonLd id="support-page-schema" data={pageSchemas} />
      <PageViewTracker page="/support" feature="support-page" />

      <PremiumPageShell
        className="pb-10 xl:pb-12"
        tone="soft"
      >
        <PremiumBentoSection className="pt-5 sm:pt-8">
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex flex-wrap items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[var(--tracking-label)] text-[color:var(--ui-color-text-muted)]"
          >
            <Link href={localizeHref("/")}>Home</Link>
            <span aria-hidden="true">/</span>
            <span className="text-[color:var(--ui-color-text-primary)]">
              Support
            </span>
          </nav>

          <div className="rounded-[var(--ui-radius-2xl)] border border-[color:var(--ui-color-border-gold)] bg-white px-5 py-6 shadow-[var(--ui-shadow-md)] sm:px-6 sm:py-8">
            <div className="flex flex-wrap gap-2">
              <PremiumStatusBadge status="LIVE">Support</PremiumStatusBadge>
              <PremiumStatusBadge status="NEUTRAL">Public</PremiumStatusBadge>
            </div>
            <h1 className="mt-4 font-[family-name:var(--font-family-editorial)] text-[length:var(--font-size-title-lg)] leading-[var(--line-height-heading)] text-[color:var(--ui-color-text-primary)]">
              Support
            </h1>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                className={buttonStyles({ size: "lg" })}
                href={localizeHref("/consultation")}
              >
                Consult
              </Link>
              <Link
                className={buttonStyles({ size: "lg", tone: "secondary" })}
                href={localizeHref("/contact")}
              >
                Contact
              </Link>
            </div>
          </div>
        </PremiumBentoSection>

        <PremiumBentoSection label="Support" className="pt-0">
          <PremiumBentoGrid className="sm:grid-cols-2 lg:grid-cols-3">
            {supportTiles.map((tile) => {
              const feature = getFeatureStatus(tile.featureKey);

              return (
                <PremiumRouteTile
                  access={feature.access}
                  href={localizeHref("href" in tile ? tile.href : feature.route)}
                  iconKey={feature.iconKey}
                  key={tile.label}
                  label={tile.label}
                  showMeta={false}
                  status={feature.visibility}
                />
              );
            })}
          </PremiumBentoGrid>
        </PremiumBentoSection>

        <PremiumBentoSection className="pt-0">
          <Card className="space-y-4" tone="muted">
            <PremiumStatusBadge status="NEUTRAL">Unavailable</PremiumStatusBadge>
            <div className="grid gap-3 sm:grid-cols-3">
              {unavailableActions.map((item) => (
                <div
                  className="flex min-w-0 items-center justify-between gap-3 rounded-[var(--ui-radius-lg)] border border-[color:var(--ui-color-border-subtle)] bg-white px-4 py-3"
                  key={item}
                >
                  <span className="truncate text-sm font-semibold text-[color:var(--ui-color-text-primary)]">
                    {item}
                  </span>
                  <PremiumStatusBadge status="NEUTRAL">
                    Unavailable
                  </PremiumStatusBadge>
                </div>
              ))}
            </div>
          </Card>
        </PremiumBentoSection>
      </PremiumPageShell>
    </>
  );
}
