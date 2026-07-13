import Link from "next/link";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
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
import {
  consultationHost,
  consultationPackages,
} from "@/modules/consultations/catalog";
import { defaultLocale, getLocalizedPath } from "@/modules/localization/config";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";

const consultationMethod = "Account booking";
const languageStatus = "Selected during booking";
const availabilityStatus = "Slots shown after sign-in";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();

  return createToolMetadata({
    title: "Consultation Guidance",
    description:
      "Calm Vedic consultation preparation with Acharya guidance, availability details and account booking access.",
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

function formatPriceFrom(minorUnits: number) {
  if (minorUnits <= 0) {
    return null;
  }

  return new Intl.NumberFormat("en-IN", {
    currency: "INR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(minorUnits / 100);
}

function toBookingHref(packageSlug: string) {
  return `/dashboard/consultations/book?package=${packageSlug}`;
}

export default async function ConsultationPage() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
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
                {availabilityStatus}
              </PremiumStatusBadge>
            </div>
            <h1 className="mt-4 font-[family-name:var(--font-family-editorial)] text-[length:var(--font-size-title-lg)] leading-[var(--line-height-heading)] text-[color:var(--ui-color-text-primary)]">
              Consultation
            </h1>
            <div className="mt-5 flex flex-wrap gap-3">
              <TrackedLink
                className={buttonStyles({ size: "lg" })}
                eventName="consultation_cta_click"
                eventPayload={{
                  feature: "consultation-booking",
                  page: "/consultation",
                  route: "/dashboard/consultations/book",
                }}
                href={localizeHref("/dashboard/consultations/book")}
              >
                Book from Account
              </TrackedLink>
              <TrackedLink
                className={buttonStyles({ size: "lg", tone: "secondary" })}
                eventName="consultation_cta_click"
                eventPayload={{
                  feature: "consultation-contact",
                  page: "/consultation",
                  route: "/contact?intent=consultation",
                }}
                href={localizeHref("/contact?intent=consultation")}
              >
                Contact
              </TrackedLink>
            </div>
          </div>
        </PremiumBentoSection>

        <PremiumBentoSection label="Acharya" className="pt-0">
          <Card className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-[color:var(--ui-color-text-primary)]">
                {consultationHost.astrologerName}
              </h2>
              <p className="mt-2 text-sm font-medium text-[color:var(--ui-color-text-muted)]">
                {consultationHost.timezoneLabel}
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

        <PremiumBentoSection label="Consultation Types" className="pt-0">
          <PremiumBentoGrid className="sm:grid-cols-2 lg:grid-cols-3">
            {consultationPackages.map((item) => {
              const price = formatPriceFrom(item.priceFromMinor);
              const bookingHref = toBookingHref(item.slug);

              return (
                <Card
                  className="flex min-h-full flex-col justify-between gap-5"
                  key={item.slug}
                  tone={item.isFeatured ? "accent" : "muted"}
                >
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <PremiumStatusBadge status="LIVE">
                        {availabilityStatus}
                      </PremiumStatusBadge>
                      {item.isFeatured ? (
                        <PremiumStatusBadge status="NEUTRAL">
                          Featured
                        </PremiumStatusBadge>
                      ) : null}
                    </div>
                    <h2 className="text-base font-semibold leading-tight text-[color:var(--ui-color-text-primary)]">
                      {item.title}
                    </h2>
                    <dl className="grid gap-3 text-sm">
                      <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3">
                        <dt className="font-medium text-[color:var(--ui-color-text-muted)]">
                          Duration
                        </dt>
                        <dd className="font-semibold text-[color:var(--ui-color-text-primary)]">
                          {item.durationMinutes} min
                        </dd>
                      </div>
                      {price ? (
                        <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3">
                          <dt className="font-medium text-[color:var(--ui-color-text-muted)]">
                            Price
                          </dt>
                          <dd className="font-semibold text-[color:var(--ui-color-text-primary)]">
                            From {price}
                          </dd>
                        </div>
                      ) : null}
                      <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3">
                        <dt className="font-medium text-[color:var(--ui-color-text-muted)]">
                          Language
                        </dt>
                        <dd className="font-semibold text-[color:var(--ui-color-text-primary)]">
                          {languageStatus}
                        </dd>
                      </div>
                      <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3">
                        <dt className="font-medium text-[color:var(--ui-color-text-muted)]">
                          Method
                        </dt>
                        <dd className="font-semibold text-[color:var(--ui-color-text-primary)]">
                          {consultationMethod}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <TrackedLink
                    className={buttonStyles({
                      className: "w-full",
                      size: "md",
                    })}
                    eventName="consultation_cta_click"
                    eventPayload={{
                      feature: `consultation-${item.slug}`,
                      page: "/consultation",
                      route: bookingHref,
                    }}
                    href={localizeHref(bookingHref)}
                  >
                    Book
                  </TrackedLink>
                </Card>
              );
            })}
          </PremiumBentoGrid>
        </PremiumBentoSection>

        <PremiumBentoSection className="pt-0">
          <PremiumSectionHeading label="Availability" />
          <Card className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <p className="text-sm font-medium leading-6 text-[color:var(--ui-color-text-secondary)]">
              If no booking slot is visible after sign-in, use the contact path.
            </p>
            <Link
              className={buttonStyles({ size: "sm", tone: "secondary" })}
              href={localizeHref("/contact?intent=consultation")}
            >
              Contact
            </Link>
          </Card>
        </PremiumBentoSection>
      </PremiumPageShell>
    </>
  );
}
