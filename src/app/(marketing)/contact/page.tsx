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
import {
  getDefaultDesiredServiceForInquiryType,
  mapIntentToInquiryType,
} from "@/modules/consultations/inquiry-lifecycle";
import { PublicInquiryForm } from "@/modules/consultations/components/public-inquiry-form";
import { defaultLocale, getLocalizedPath } from "@/modules/localization/config";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";

const contactActions = [
  { featureKey: "consult" },
  { featureKey: "support" },
  { featureKey: "privacy" },
  { featureKey: "refund-cancellation" },
] as const satisfies ReadonlyArray<{
  featureKey: FeatureStatusRecord["featureKey"];
}>;

const unavailableActions = ["Live chat", "WhatsApp", "Ticket number"] as const;

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();

  return createPageMetadata({
    title: "Contact",
    description:
      "Contact NAVAGRAHA CENTRE through the existing inquiry form, consultation route, support route, privacy access, and refund policy.",
    path: "/contact",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: ["contact", "support", "consultation inquiry"],
  });
}

export const revalidate = 3600;

export default async function ContactPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{
    intent?: string;
  }>;
}>) {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const localizeHref = (href: string) =>
    getLocalizedPath(locale, href, {
      forcePrefix: locale !== defaultLocale || hasExplicitLocalePrefix,
    });
  const resolvedSearchParams = await searchParams;
  const inquiryType = mapIntentToInquiryType(resolvedSearchParams.intent);
  const desiredServiceSlug = getDefaultDesiredServiceForInquiryType(inquiryType);
  const pageSchemas = [
    createBreadcrumbSchema({
      locale,
      explicitLocalePrefix: hasExplicitLocalePrefix,
      items: [
        { name: "Home", path: "/" },
        { name: "Contact", path: "/contact" },
      ],
    }),
    createWebPageSchema({
      title: "Contact",
      description:
        "Contact surface for NAVAGRAHA CENTRE inquiry, support, consultation, privacy, and refund access.",
      path: "/contact",
      locale,
      explicitLocalePrefix: hasExplicitLocalePrefix,
    }),
  ];

  return (
    <>
      <JsonLd id="contact-page-schema" data={pageSchemas} />
      <PageViewTracker page="/contact" feature="contact-page" />

      <PremiumPageShell
        className="pb-[calc(6rem+env(safe-area-inset-bottom))] xl:pb-12"
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
              Contact
            </span>
          </nav>

          <div className="rounded-[var(--ui-radius-2xl)] border border-[color:var(--ui-color-border-gold)] bg-white px-5 py-6 shadow-[var(--ui-shadow-md)] sm:px-6 sm:py-8">
            <div className="flex flex-wrap gap-2">
              <PremiumStatusBadge status="LIVE">Inquiry</PremiumStatusBadge>
              <PremiumStatusBadge status="NEUTRAL">Public</PremiumStatusBadge>
            </div>
            <h1 className="mt-4 font-[family-name:var(--font-family-editorial)] text-[length:var(--font-size-title-lg)] leading-[var(--line-height-heading)] text-[color:var(--ui-color-text-primary)]">
              Contact
            </h1>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                className={buttonStyles({ size: "lg" })}
                href="#contact-form"
              >
                Inquiry form
              </Link>
              <Link
                className={buttonStyles({ size: "lg", tone: "secondary" })}
                href={localizeHref("/consultation")}
              >
                Consult
              </Link>
            </div>
          </div>
        </PremiumBentoSection>

        <PremiumBentoSection label="Actions" className="pt-0">
          <PremiumBentoGrid className="sm:grid-cols-2 lg:grid-cols-4">
            {contactActions.map(({ featureKey }) => {
              const feature = getFeatureStatus(featureKey);

              return (
                <PremiumRouteTile
                  access={feature.access}
                  href={localizeHref(feature.route)}
                  iconKey={feature.iconKey}
                  key={feature.featureKey}
                  label={feature.label}
                  showMeta={false}
                  status={feature.visibility}
                />
              );
            })}
          </PremiumBentoGrid>
        </PremiumBentoSection>

        <PremiumBentoSection className="pt-0">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
            <div id="contact-form" className="scroll-mt-24">
              <PublicInquiryForm
                defaultInquiryType={inquiryType}
                defaultDesiredServiceSlug={desiredServiceSlug}
                sourcePath="/contact"
              />
            </div>

            <div className="grid gap-5">
              <Card className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <PremiumStatusBadge status="LIVE">Legal</PremiumStatusBadge>
                  <PremiumStatusBadge status="NEUTRAL">
                    Access
                  </PremiumStatusBadge>
                </div>
                <div className="grid gap-3">
                  {[
                    { label: "Privacy", href: "/privacy" },
                    { label: "Terms", href: "/terms" },
                    { label: "Disclaimer", href: "/disclaimer" },
                    { label: "Refund", href: "/refund" },
                  ].map((item) => (
                    <Link
                      className="rounded-[var(--ui-radius-lg)] border border-[color:var(--ui-color-border-subtle)] px-4 py-3 text-sm font-semibold text-[color:var(--ui-color-text-primary)] transition hover:border-[color:var(--ui-color-border-gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ui-color-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                      href={localizeHref(item.href)}
                      key={item.href}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </Card>

              <Card className="space-y-4" tone="muted">
                <PremiumStatusBadge status="NEUTRAL">
                  Unavailable
                </PremiumStatusBadge>
                <ul className="grid gap-3">
                  {unavailableActions.map((item) => (
                    <li
                      className="flex items-center justify-between gap-3 rounded-[var(--ui-radius-lg)] border border-[color:var(--ui-color-border-subtle)] bg-white px-4 py-3"
                      key={item}
                    >
                      <span className="text-sm font-semibold text-[color:var(--ui-color-text-primary)]">
                        {item}
                      </span>
                      <PremiumStatusBadge status="NEUTRAL">
                        Unavailable
                      </PremiumStatusBadge>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </PremiumBentoSection>
      </PremiumPageShell>
    </>
  );
}
