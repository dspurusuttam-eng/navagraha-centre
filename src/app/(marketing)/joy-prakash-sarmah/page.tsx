import Image from "next/image";
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
import { astrologerPage } from "@/modules/marketing/content";

const profileIconPath = "/icons/navagraha/Consult.png";
const availabilityStatus = "Slots shown after sign-in";
const consultationMethod = "Account booking";
const languageStatus = "Selected during booking";

const verifiedDetails = [
  {
    label: "Name",
    value: consultationHost.astrologerName,
  },
  {
    label: "Experience",
    value: "Consultation-led Vedic astrology practice",
  },
  {
    label: "Lineage",
    value: "NAVAGRAHA CENTRE legacy",
  },
  {
    label: "History",
    value: "Since 1950",
  },
  {
    label: "Languages",
    value: languageStatus,
  },
  {
    label: "Method",
    value: consultationMethod,
  },
  {
    label: "Availability",
    value: availabilityStatus,
  },
] as const;

const policyItems = [
  "Booking access is handled through the protected account flow.",
  "If no slot is visible after sign-in, use the contact path.",
  "Consultation is guidance and does not guarantee outcomes.",
] as const;

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();

  return createToolMetadata({
    ...astrologerPage.metadata,
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
  });
}
export const revalidate = 3600;

function toBookingHref(packageSlug: string) {
  return `/dashboard/consultations/book?package=${packageSlug}`;
}

export default async function JoyPrakashSarmahPage() {
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
        { name: "Consultation", path: "/consultation" },
        { name: consultationHost.astrologerName, path: "/joy-prakash-sarmah" },
      ],
    }),
    createPersonSchema({
      locale,
      path: "/joy-prakash-sarmah",
    }),
  ];

  return (
    <>
      <JsonLd id="acharya-profile-schema" data={pageSchemas} />
      <PageViewTracker
        page="/joy-prakash-sarmah"
        feature="acharya-profile-page"
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
            <Link href={localizeHref("/consultation")}>Consult</Link>
            <span aria-hidden="true">/</span>
            <span className="text-[color:var(--ui-color-text-primary)]">
              Acharya
            </span>
          </nav>

          <div className="grid gap-5 rounded-[var(--ui-radius-2xl)] border border-[color:var(--ui-color-border-gold)] bg-white px-5 py-6 shadow-[var(--ui-shadow-md)] sm:px-6 sm:py-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <PremiumStatusBadge status="LIVE">Acharya</PremiumStatusBadge>
                <PremiumStatusBadge status="NEUTRAL">
                  {availabilityStatus}
                </PremiumStatusBadge>
              </div>
              <h1 className="mt-4 font-[family-name:var(--font-family-editorial)] text-[length:var(--font-size-title-lg)] leading-[var(--line-height-heading)] text-[color:var(--ui-color-text-primary)]">
                {consultationHost.astrologerName}
              </h1>
              <div className="mt-5 flex flex-wrap gap-3">
                <TrackedLink
                  className={buttonStyles({ size: "lg" })}
                  eventName="consultation_cta_click"
                  eventPayload={{
                    feature: "acharya-booking",
                    page: "/joy-prakash-sarmah",
                    route: "/dashboard/consultations/book",
                  }}
                  href={localizeHref("/dashboard/consultations/book")}
                >
                  Consult
                </TrackedLink>
                <Link
                  className={buttonStyles({ size: "lg", tone: "secondary" })}
                  href={localizeHref("/consultation")}
                >
                  Return to Consult
                </Link>
              </div>
            </div>

            <figure className="mx-auto flex w-full max-w-72 flex-col items-center gap-3 rounded-[var(--ui-radius-2xl)] border border-[color:var(--ui-color-border-subtle)] bg-[color:var(--ui-color-surface-soft)] p-5 text-center shadow-[var(--ui-shadow-sm)]">
              <span className="flex aspect-square w-full max-w-40 items-center justify-center rounded-[var(--ui-radius-xl)] border border-[color:var(--ui-color-border-gold)] bg-white">
                <Image
                  alt="Joy Prakash Sarmah profile mark"
                  className="h-24 w-24 object-contain"
                  height={96}
                  priority
                  src={profileIconPath}
                  width={96}
                />
              </span>
              <figcaption className="text-xs font-medium uppercase tracking-[var(--tracking-label)] text-[color:var(--ui-color-text-muted)]">
                Profile visual
              </figcaption>
            </figure>
          </div>
        </PremiumBentoSection>

        <PremiumBentoSection label="Verified Profile" className="pt-0">
          <PremiumBentoGrid className="sm:grid-cols-2 lg:grid-cols-4">
            {verifiedDetails.map((item) => (
              <Card className="space-y-2" key={item.label}>
                <p className="text-xs font-medium uppercase tracking-[var(--tracking-label)] text-[color:var(--ui-color-text-muted)]">
                  {item.label}
                </p>
                <p className="text-sm font-semibold leading-6 text-[color:var(--ui-color-text-primary)]">
                  {item.value}
                </p>
              </Card>
            ))}
          </PremiumBentoGrid>
        </PremiumBentoSection>

        <PremiumBentoSection label="Specialisations" className="pt-0">
          <PremiumBentoGrid className="sm:grid-cols-2 lg:grid-cols-3">
            {consultationPackages.map((item) => (
              <Card
                className="flex min-h-full flex-col justify-between gap-4"
                key={item.slug}
                tone={item.isFeatured ? "accent" : "muted"}
              >
                <div className="space-y-3">
                  <PremiumStatusBadge status="LIVE">
                    {item.durationMinutes} min
                  </PremiumStatusBadge>
                  <h2 className="text-base font-semibold leading-tight text-[color:var(--ui-color-text-primary)]">
                    {item.title}
                  </h2>
                </div>
                <TrackedLink
                  className={buttonStyles({ className: "w-full", size: "md" })}
                  eventName="consultation_cta_click"
                  eventPayload={{
                    feature: `acharya-${item.slug}`,
                    page: "/joy-prakash-sarmah",
                    route: toBookingHref(item.slug),
                  }}
                  href={localizeHref(toBookingHref(item.slug))}
                >
                  Consult
                </TrackedLink>
              </Card>
            ))}
          </PremiumBentoGrid>
        </PremiumBentoSection>

        <PremiumBentoSection label="Consultation Access" className="pt-0">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <Card className="space-y-4">
              <PremiumSectionHeading label="Methods" className="mb-0" />
              <dl className="grid gap-3 text-sm">
                <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3">
                  <dt className="font-medium text-[color:var(--ui-color-text-muted)]">
                    Booking
                  </dt>
                  <dd className="font-semibold text-[color:var(--ui-color-text-primary)]">
                    {consultationMethod}
                  </dd>
                </div>
                <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3">
                  <dt className="font-medium text-[color:var(--ui-color-text-muted)]">
                    Timezone
                  </dt>
                  <dd className="font-semibold text-[color:var(--ui-color-text-primary)]">
                    {consultationHost.timezoneLabel}
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
            </Card>

            <Card className="space-y-4">
              <PremiumSectionHeading label="Policies" className="mb-0" />
              <ul className="grid gap-3 text-sm font-medium leading-6 text-[color:var(--ui-color-text-secondary)]">
                {policyItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Card>
          </div>
        </PremiumBentoSection>

        <PremiumBentoSection className="pt-0">
          <Card className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <p className="text-sm font-medium leading-6 text-[color:var(--ui-color-text-secondary)]">
              If account booking is unavailable, use the consultation contact
              path.
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
