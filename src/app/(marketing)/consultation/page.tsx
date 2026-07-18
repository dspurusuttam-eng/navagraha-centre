import Link from "next/link";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { JsonLd } from "@/components/seo/json-ld";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  PremiumBentoGrid,
  PremiumBentoSection,
  PremiumPageShell,
  PremiumSectionHeading,
  PremiumStatusBadge,
} from "@/components/ui/premium";
import { createToolMetadata } from "@/lib/seo/metadata";
import {
  createBreadcrumbSchema,
  createPersonSchema,
  createServiceSchema,
} from "@/lib/seo/schema";
// C8D: Acharya identity + availability are Admin-managed (static fallback when unset).
import {
  getPublicBrandSettings,
  getPublicConsultationSettings,
} from "@/modules/site-settings/public-settings";
import { getPublicConsultationCatalogue } from "@/modules/site-settings/public-catalogue";
import {
  availabilityBadgeStatus,
  availabilityNote,
  showsWhatsappCta,
} from "@/modules/site-settings/public-settings-core";
import { defaultLocale, getLocalizedPath } from "@/modules/localization/config";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";

const consultationLanguageLabels: Readonly<Record<string, string>> = {
  en: "English",
  as: "Assamese",
  hi: "Hindi",
};

function languageLabel(code: string) {
  return consultationLanguageLabels[code] ?? code;
}
const languageStatus = "Selected during consultation";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();

  return createToolMetadata({
    title: "Consultation Guidance",
    description:
      "Calm Vedic consultation preparation with Acharya guidance, availability details and contact access.",
    path: "/consultation",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: [
      "astrology consultation",
      "vedic consultation",
      "consult acharya",
    ],
  });
}

export const revalidate = 3600;

export default async function ConsultationPage() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const [brand, consultation, catalogue] = await Promise.all([
    getPublicBrandSettings(),
    getPublicConsultationSettings(),
    getPublicConsultationCatalogue(),
  ]);
  const hasPublicCatalogue = catalogue.tiers.length > 0 && consultation.availability !== "UNAVAILABLE";
  const localizeHref = (href: string) =>
    getLocalizedPath(locale, href, {
      forcePrefix: locale !== defaultLocale || hasExplicitLocalePrefix,
    });
  const consultationSchemas = [
    createBreadcrumbSchema({
      locale,
      explicitLocalePrefix: hasExplicitLocalePrefix,
      items: [
        { name: "Home", path: "/" },
        { name: "Consultation", path: "/consultation" },
      ],
    }),
    createServiceSchema({
      name: "Consultation Guidance",
      description:
        "Responsible Vedic consultation preparation with human chart interpretation.",
      path: "/consultation",
      locale,
      serviceType: "Vedic Consultation Guidance",
    }),
    createPersonSchema({
      locale,
      path: "/joy-prakash-sarmah",
    }),
  ];

  return (
    <>
      <JsonLd id="consultation-page-schema" data={consultationSchemas} />
      <PageViewTracker
        page="/consultation"
        feature="consultation-guidance-page"
      />

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
              Consult
            </span>
          </nav>

          <div className="rounded-[var(--ui-radius-2xl)] border border-[color:var(--ui-color-border-gold)] bg-white px-5 py-6 shadow-[var(--ui-shadow-md)] sm:px-6 sm:py-8">
            <div className="flex flex-wrap gap-2">
              <PremiumStatusBadge status="LIVE">Consult</PremiumStatusBadge>
              <PremiumStatusBadge status="NEUTRAL">
                {consultation.availabilityLabel}
              </PremiumStatusBadge>
            </div>
            <h1 className="mt-4 font-[family-name:var(--font-family-editorial)] text-[length:var(--font-size-title-lg)] leading-[var(--line-height-heading)] text-[color:var(--ui-color-text-primary)]">
              Consultation
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-[color:var(--ui-color-text-secondary)]">
              {availabilityNote(consultation.availability)}
            </p>
          </div>
        </PremiumBentoSection>

        <PremiumBentoSection label="Acharya" className="pt-0">
          <Card className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-[color:var(--ui-color-text-primary)]">
                {brand.acharyaName}
              </h2>
              <p className="mt-2 text-sm font-medium text-[color:var(--ui-color-text-muted)]">
                {brand.professionalTitle ?? "Vedic Astrologer and Spiritual Guide"}
              </p>
            </div>
            <Link
              className={buttonStyles({ size: "sm", tone: "secondary" })}
              href={localizeHref("/joy-prakash-sarmah")}
            >
              Acharya
            </Link>
          </Card>
        </PremiumBentoSection>

        {hasPublicCatalogue ? (
          <PremiumBentoSection label="Consultation Types" className="pt-0">
            <PremiumBentoGrid className="sm:grid-cols-2 lg:grid-cols-3">
              {catalogue.tiers.map((tier) =>
                tier.utilities.map((utility) => (
                  <Card
                    className="flex min-h-full flex-col justify-between gap-5"
                    key={utility.slug}
                    tone={utility.isPriority ? "accent" : "muted"}
                  >
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <PremiumStatusBadge status={availabilityBadgeStatus(utility.availability.status)}>
                          {utility.availability.label}
                        </PremiumStatusBadge>
                        {utility.isPriority ? (
                          <PremiumStatusBadge status="NEUTRAL">Priority</PremiumStatusBadge>
                        ) : null}
                      </div>
                      <h2 className="text-base font-semibold leading-tight text-[color:var(--ui-color-text-primary)]">
                        {utility.name}
                      </h2>
                      <dl className="grid gap-3 text-sm">
                        <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3">
                          <dt className="font-medium text-[color:var(--ui-color-text-muted)]">
                            Tier
                          </dt>
                          <dd className="font-semibold text-[color:var(--ui-color-text-primary)]">
                            {tier.name}
                          </dd>
                        </div>
                        <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3">
                          <dt className="font-medium text-[color:var(--ui-color-text-muted)]">
                            Price
                          </dt>
                          <dd className="font-semibold text-[color:var(--ui-color-text-primary)]">
                            {utility.priceLabel ?? (utility.launchPrice == null ? "Scope review" : `${utility.currency} ${utility.launchPrice}`)}
                          </dd>
                        </div>
                        <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3">
                          <dt className="font-medium text-[color:var(--ui-color-text-muted)]">
                            Language
                          </dt>
                          <dd className="font-semibold text-[color:var(--ui-color-text-primary)]">
                            {languageStatus}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </Card>
                )),
              )}
            </PremiumBentoGrid>
          </PremiumBentoSection>
        ) : null}

        <PremiumBentoSection className="pt-0">
          <PremiumSectionHeading label="Availability" />
          <Card className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="min-w-0">
              <PremiumStatusBadge status={availabilityBadgeStatus(consultation.availability)}>
                {consultation.availabilityLabel}
              </PremiumStatusBadge>
              <p className="mt-2 text-sm font-medium leading-6 text-[color:var(--ui-color-text-secondary)]">
                {availabilityNote(consultation.availability)}
              </p>
              {consultation.officeHours ? (
                <p className="mt-1 text-sm font-medium leading-6 text-[color:var(--ui-color-text-muted)]">
                  {consultation.officeHours}
                </p>
              ) : null}
            </div>
            <Link
              className={buttonStyles({ size: "sm", tone: "secondary" })}
              href={localizeHref("/contact?intent=consultation")}
            >
              Contact
            </Link>
          </Card>
        </PremiumBentoSection>

        {consultation.shortDescription ? (
          <PremiumBentoSection className="pt-0">
            <PremiumSectionHeading label="About" />
            <Card>
              <p className="text-sm font-medium leading-6 text-[color:var(--ui-color-text-secondary)]">
                {consultation.shortDescription}
              </p>
            </Card>
          </PremiumBentoSection>
        ) : null}

        {showsWhatsappCta(consultation.availability, consultation.whatsappUrl) ? (
          <PremiumBentoSection className="pt-0">
            <PremiumSectionHeading label="Contact" />
            <Card className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <p className="text-sm font-medium leading-6 text-[color:var(--ui-color-text-secondary)]">
                Send a consultation request directly on WhatsApp.
              </p>
              {/* Plain external link, opened in a new tab. noopener/noreferrer stops the
                  opened tab reaching back into this window or leaking the referrer. */}
              <a
                className={buttonStyles({ size: "sm" })}
                href={consultation.whatsappUrl as string}
                rel="noopener noreferrer nofollow"
                target="_blank"
              >
                WhatsApp
              </a>
            </Card>
          </PremiumBentoSection>
        ) : null}

        {consultation.languages.length ? (
          <PremiumBentoSection className="pt-0">
            <PremiumSectionHeading label="Languages" />
            <Card>
              <ul aria-label="Consultation languages" className="flex min-w-0 flex-wrap gap-2">
                {consultation.languages.map((code) => (
                  <li key={code}>
                    <PremiumStatusBadge status="NEUTRAL">{languageLabel(code)}</PremiumStatusBadge>
                  </li>
                ))}
              </ul>
            </Card>
          </PremiumBentoSection>
        ) : null}

        {consultation.topics.length ? (
          <PremiumBentoSection className="pt-0">
            <PremiumSectionHeading label="Topics" />
            <Card>
              <ul aria-label="Consultation topics" className="flex min-w-0 flex-wrap gap-2">
                {consultation.topics.map((topic) => (
                  <li key={topic}>
                    <PremiumStatusBadge status="NEUTRAL">{topic}</PremiumStatusBadge>
                  </li>
                ))}
              </ul>
            </Card>
          </PremiumBentoSection>
        ) : null}

        {consultation.preparationInstructions ? (
          <PremiumBentoSection className="pt-0">
            <PremiumSectionHeading label="Preparation" />
            <Card>
              <p className="whitespace-pre-wrap text-sm font-medium leading-6 text-[color:var(--ui-color-text-secondary)]">
                {consultation.preparationInstructions}
              </p>
            </Card>
          </PremiumBentoSection>
        ) : null}

        {consultation.disclaimer ? (
          <PremiumBentoSection className="pt-0">
            <PremiumSectionHeading label="Disclaimer" />
            <Card tone="muted">
              <p className="whitespace-pre-wrap text-sm font-medium leading-6 text-[color:var(--ui-color-text-muted)]">
                {consultation.disclaimer}
              </p>
            </Card>
          </PremiumBentoSection>
        ) : null}
      </PremiumPageShell>
    </>
  );
}
