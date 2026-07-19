import Link from "next/link";
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

const methodologySections = [
  {
    title: "Calculation-first approach",
    items: [
      "Structured inputs are resolved before any result is shown.",
      "Birth date, birth time, place, coordinates, and timezone are kept explicit.",
      "Unavailable source data is shown as unavailable rather than guessed.",
    ],
  },
  {
    title: "Vedic conventions",
    items: [
      "The platform uses sidereal Vedic calculation conventions where astrology engines require them.",
      "Named conventions are kept visible in calculation details where a result surface supports it.",
      "Interpretation remains separate from raw calculation output.",
    ],
  },
  {
    title: "Deterministic QA",
    items: [
      "Core calculation modules are checked with repeatable debug and regression scripts.",
      "Boundary cases are tested for dates, timezones, rise and set events, and unavailable states.",
      "Changes are validated before release with typecheck, lint, build, and targeted QA scripts.",
    ],
  },
  {
    title: "Independent reference checks",
    items: [
      "Reference fixtures and differential checks are used where the platform has approved them.",
      "Cross-checks support engineering assurance; they are not public accuracy claims.",
      "Provider and licensing questions remain separate business or legal decisions.",
    ],
  },
  {
    title: "Controlled unavailable states",
    items: [
      "High-latitude, provider, timeout, and missing-data cases use controlled fallback states.",
      "The UI should avoid replacing missing results with fabricated times or interpretations.",
      "Users are directed to consultation or contact when a safe result cannot be shown.",
    ],
  },
  {
    title: "Data and privacy principles",
    items: [
      "Sensitive birth details should be sent only to the route needed for the requested calculation.",
      "Authentication-gated data stays inside protected account routes.",
      "Secrets, provider keys, tokens, and private payloads must not appear in public UI.",
    ],
  },
] as const;

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();

  return createPageMetadata({
    title: "Calculation Methodology",
    description:
      "NAVAGRAHA CENTRE methodology notes for calculation-first astrology, Vedic conventions, deterministic QA, unavailable states, and privacy.",
    path: "/methodology",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: [
      "calculation methodology",
      "vedic astrology QA",
      "astrology privacy",
      "navagraha centre trust",
    ],
  });
}

export const revalidate = 3600;

export default async function MethodologyPage() {
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
        { name: "Methodology", path: "/methodology" },
      ],
    }),
    createWebPageSchema({
      title: "Calculation Methodology",
      description:
        "Concise methodology and trust notes for NAVAGRAHA CENTRE calculation surfaces.",
      path: "/methodology",
      locale,
      explicitLocalePrefix: hasExplicitLocalePrefix,
    }),
  ];

  return (
    <>
      <JsonLd id="methodology-page-schema" data={pageSchemas} />
      <PageViewTracker page="/methodology" feature="methodology-page" />

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
              Methodology
            </span>
          </nav>

          <div className="rounded-[var(--ui-radius-2xl)] border border-[color:var(--ui-color-border-gold)] bg-white px-5 py-6 shadow-[var(--ui-shadow-md)] sm:px-6 sm:py-8">
            <div className="flex flex-wrap gap-2">
              <PremiumStatusBadge status="LIVE">Trust</PremiumStatusBadge>
              <PremiumStatusBadge status="NEUTRAL">
                Calculation notes
              </PremiumStatusBadge>
            </div>
            <h1 className="mt-4 font-[family-name:var(--font-family-editorial)] text-[length:var(--font-size-title-lg)] leading-[var(--line-height-heading)] text-[color:var(--ui-color-text-primary)]">
              Calculation Methodology
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
                href={localizeHref("/privacy")}
              >
                Privacy
              </Link>
            </div>
          </div>
        </PremiumBentoSection>

        <PremiumBentoSection label="Methodology" className="pt-0">
          <PremiumBentoGrid className="sm:grid-cols-2 lg:grid-cols-3">
            {methodologySections.map((section) => (
              <Card className="space-y-4" key={section.title}>
                <h2 className="text-base font-semibold leading-tight text-[color:var(--ui-color-text-primary)]">
                  {section.title}
                </h2>
                <ul className="grid gap-3 text-sm font-medium leading-6 text-[color:var(--ui-color-text-secondary)]">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Card>
            ))}
          </PremiumBentoGrid>
        </PremiumBentoSection>

        <PremiumBentoSection className="pt-0">
          <Card className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <p className="text-sm font-medium leading-6 text-[color:var(--ui-color-text-secondary)]">
              For personal decisions, use the consultation path rather than
              treating calculation output as a standalone instruction.
            </p>
            <Link
              className={buttonStyles({ size: "sm", tone: "secondary" })}
              href={localizeHref("/consultation")}
            >
              Consult
            </Link>
          </Card>
        </PremiumBentoSection>
      </PremiumPageShell>
    </>
  );
}
