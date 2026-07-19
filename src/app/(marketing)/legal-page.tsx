import Link from "next/link";
import type { ReactNode } from "react";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { JsonLd } from "@/components/seo/json-ld";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  PremiumBentoGrid,
  PremiumBentoSection,
  PremiumPageShell,
  PremiumStatusBadge,
} from "@/components/ui/premium";
import { PolicyProse } from "@/components/site/policy-prose";
import {
  createBreadcrumbSchema,
  createWebPageSchema,
} from "@/lib/seo/schema";
import { defaultLocale, getLocalizedPath } from "@/modules/localization/config";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";

export type LegalSection = {
  title: string;
  points: readonly string[];
};

type LegalPageProps = {
  children?: ReactNode;
  description: string;
  effectiveDate: string;
  pagePath: string;
  pageTrackerFeature: string;
  primaryAction?: {
    href: string;
    label: string;
  };
  secondaryAction?: {
    href: string;
    label: string;
  };
  /** Legacy bullet sections (Admin-era pages). Optional now that copy is approved prose. */
  sections?: readonly LegalSection[];
  /** Approved policy prose. When present it replaces the bullet sections. */
  paragraphs?: readonly string[];
  title: string;
};

// Final locked public policy set — identical to the footer. Disclaimer and Refund are
// deliberately absent: disclaimer protection now lives inside Terms, and Refund stays hidden
// until paid consultation is activated.
const legalLinks = [
  { label: "Support", href: "/support" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Method", href: "/methodology" },
] as const;

export async function LegalPage({
  children,
  description,
  effectiveDate,
  pagePath,
  pageTrackerFeature,
  primaryAction,
  secondaryAction,
  sections,
  paragraphs,
  title,
}: Readonly<LegalPageProps>) {
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
        { name: title, path: pagePath },
      ],
    }),
    createWebPageSchema({
      title,
      description,
      path: pagePath,
      locale,
      explicitLocalePrefix: hasExplicitLocalePrefix,
    }),
  ];

  return (
    <>
      <JsonLd id={`${pageTrackerFeature}-schema`} data={pageSchemas} />
      <PageViewTracker page={pagePath} feature={pageTrackerFeature} />

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
              {title}
            </span>
          </nav>

          <div className="rounded-[var(--ui-radius-2xl)] border border-[color:var(--ui-color-border-gold)] bg-white px-5 py-6 shadow-[var(--ui-shadow-md)] sm:px-6 sm:py-8">
            <div className="flex flex-wrap gap-2">
              <PremiumStatusBadge status="LIVE">Legal</PremiumStatusBadge>
              <PremiumStatusBadge status="NEUTRAL">
                {effectiveDate}
              </PremiumStatusBadge>
            </div>
            <h1 className="mt-4 font-[family-name:var(--font-family-editorial)] text-[length:var(--font-size-title-lg)] leading-[var(--line-height-heading)] text-[color:var(--ui-color-text-primary)]">
              {title}
            </h1>
            <p className="mt-4 max-w-3xl text-sm font-medium leading-6 text-[color:var(--ui-color-text-secondary)]">
              {description}
            </p>
            {primaryAction || secondaryAction ? (
              <div className="mt-5 flex flex-wrap gap-3">
                {primaryAction ? (
                  <Link
                    className={buttonStyles({ size: "lg" })}
                    href={localizeHref(primaryAction.href)}
                  >
                    {primaryAction.label}
                  </Link>
                ) : null}
                {secondaryAction ? (
                  <Link
                    className={buttonStyles({
                      size: "lg",
                      tone: "secondary",
                    })}
                    href={localizeHref(secondaryAction.href)}
                  >
                    {secondaryAction.label}
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        </PremiumBentoSection>

        <PremiumBentoSection label="Legal Pages" className="pt-0">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {legalLinks.map((item) => (
              <Link
                className="rounded-[var(--ui-radius-xl)] border border-[color:var(--ui-color-border-subtle)] bg-white px-4 py-3 text-center text-sm font-semibold text-[color:var(--ui-color-text-primary)] shadow-[var(--ui-shadow-sm)] transition hover:border-[color:var(--ui-color-border-gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ui-color-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                href={localizeHref(item.href)}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </PremiumBentoSection>

        <PremiumBentoSection label="Policy" className="pt-0">
          {paragraphs?.length ? (
            <Card>
              <PolicyProse consultationHref={localizeHref("/consultation")} paragraphs={paragraphs} />
            </Card>
          ) : null}
          {paragraphs?.length ? null : (
          <PremiumBentoGrid className="sm:grid-cols-2 lg:grid-cols-2">
            {(sections ?? []).map((section) => (
              <Card className="space-y-4" key={section.title}>
                <h2 className="text-base font-semibold leading-tight text-[color:var(--ui-color-text-primary)]">
                  {section.title}
                </h2>
                <ul className="grid gap-3 text-sm font-medium leading-6 text-[color:var(--ui-color-text-secondary)]">
                  {section.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </Card>
            ))}
          </PremiumBentoGrid>
          )}
        </PremiumBentoSection>

        {children ? (
          <PremiumBentoSection className="pt-0">{children}</PremiumBentoSection>
        ) : null}

        <PremiumBentoSection className="pt-0">
          <Card className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <p className="text-sm font-medium leading-6 text-[color:var(--ui-color-text-secondary)]">
              For policy questions, use Support or Contact.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                className={buttonStyles({ size: "sm", tone: "secondary" })}
                href={localizeHref("/support")}
              >
                Support
              </Link>
              <Link
                className={buttonStyles({ size: "sm", tone: "secondary" })}
                href={localizeHref("/contact")}
              >
                Contact
              </Link>
            </div>
          </Card>
        </PremiumBentoSection>
      </PremiumPageShell>
    </>
  );
}
