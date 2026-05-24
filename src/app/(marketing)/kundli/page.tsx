import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { KundliPageHeroVisual } from "@/components/graphics/kundli-page-visual";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { createToolMetadata } from "@/lib/seo/metadata";
import { getCoreSeoCopy } from "@/lib/seo/seo-config";
import { defaultLocale, getLocalizedPath } from "@/modules/localization/config";
import { getRequestLocale, hasExplicitLocalePrefixInRequest } from "@/modules/localization/request";
import { kundliPreviewItems, kundliTrustNote } from "@/modules/kundli/kundli-foundation";

type KundliHeroPreviewItem = (typeof kundliPreviewItems)[number];

const quickPaths = [
  { label: "Ask NI", href: "/ai", feature: "kundli-quick-ask-ni" },
  { label: "Dasha", href: "/dasha", feature: "kundli-quick-dasha" },
  { label: "Transit", href: "/transit", feature: "kundli-quick-transit" },
  { label: "Reports", href: "/reports", feature: "kundli-quick-reports" },
  { label: "Consultation", href: "/consultation", feature: "kundli-quick-consultation" },
] as const;

const conceptItems = ["Lagna", "Planets", "Houses", "Dasha", "Transit", "Dosha"] as const;

const premiumServices = [
  {
    title: "Digital Kundli Report",
    label: "Reports",
    href: "/reports",
    feature: "kundli-service-reports",
    tone: "reports",
  },
  {
    title: "Handmade Kundli",
    label: "Human-reviewed",
    href: "/consultation",
    feature: "kundli-service-handmade",
    tone: "authority",
  },
  {
    title: "Consultation Support",
    label: "J P Sarmah Desk",
    href: "/consultation",
    feature: "kundli-service-consultation",
    tone: "authority",
  },
] as const;

const relatedTools = [
  { label: "Panchang", href: "/panchang", feature: "kundli-related-panchang" },
  { label: "Dasha", href: "/dasha", feature: "kundli-related-dasha" },
  { label: "Transit", href: "/transit", feature: "kundli-related-transit" },
  { label: "Matching", href: "/matchmaking", feature: "kundli-related-matchmaking" },
  { label: "Dosha/Yoga", href: "/dosha-yoga", feature: "kundli-related-dosha-yoga" },
  { label: "Remedies", href: "/remedies", feature: "kundli-related-remedies" },
  { label: "Reports", href: "/reports", feature: "kundli-related-reports" },
  { label: "Consultation", href: "/consultation", feature: "kundli-related-consultation" },
] as const;

function localizeHref(locale: string, hasExplicitLocalePrefix: boolean, href: string) {
  return getLocalizedPath(locale, href, {
    forcePrefix: locale !== defaultLocale || hasExplicitLocalePrefix,
  });
}

function KundliPreviewCard({ item }: Readonly<{ item: KundliHeroPreviewItem }>) {
  return (
    <Card
      tone="default"
      className="min-w-0 space-y-3 border-black/8 bg-white shadow-[0_12px_28px_rgba(17,24,39,0.05)] before:opacity-0"
    >
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-accent-gold)]" />
        <p className="text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--color-accent-strong)]">
          {item.title}
        </p>
      </div>
      <p className="text-[0.82rem] leading-6 text-[color:var(--color-ink-body)]">{item.description}</p>
    </Card>
  );
}

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const localized = getCoreSeoCopy("kundli", locale);

  return createToolMetadata({
    title: localized.title,
    description: localized.description,
    path: "/kundli",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: [
      "free kundli",
      "NAVAGRAHA Intelligence birth chart guidance",
      "lagna chart",
      "vedic kundli",
      "rashi and navamsa guidance",
    ],
  });
}

export const revalidate = 3600;

export default async function KundliPage() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const localize = (href: string) => localizeHref(locale, hasExplicitLocalePrefix, href);

  return (
    <>
      <PageViewTracker page="/kundli" feature="kundli-page" />

      <main className="launch-page launch-page-kundli min-h-screen bg-white pb-[calc(6.5rem+env(safe-area-inset-bottom))] text-[#111111] md:pb-0">
        <section className="relative overflow-hidden border-b border-black/8 bg-white">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_12%_18%,rgba(184,137,67,0.08),transparent_32%),radial-gradient(circle_at_86%_12%,rgba(0,229,255,0.05),transparent_24%)]" />
          <Container className="relative grid min-w-0 gap-6 py-8 sm:py-10 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.82fr)] lg:items-center lg:py-12">
            <div className="min-w-0 space-y-5">
              <div className="space-y-3">
                <Badge tone="trust" className="w-fit border border-black/8 bg-white">
                  Your Vedic Birth Chart Dashboard
                </Badge>
                <h1
                  className="max-w-4xl font-[family-name:var(--font-display)] text-[2.55rem] text-[color:var(--color-ink-strong)] sm:text-[length:var(--font-size-display-md)]"
                  style={{ letterSpacing: "0.005em", lineHeight: "var(--line-height-tight)" }}
                >
                  Kundli &mdash; Vedic Birth Chart
                </h1>
                <p className="max-w-[44rem] text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  Create your birth chart, understand planetary structure, and continue into Dasha,
                  Transit, Reports, Consultation, or Ask NI.
                </p>
              </div>

              <Card
                tone="default"
                className="relative overflow-hidden border-[rgba(184,137,67,0.22)] bg-white shadow-[0_16px_38px_rgba(17,24,39,0.06)] before:opacity-0"
              >
                <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(184,137,67,0.34)_1px,transparent_1px),linear-gradient(90deg,rgba(184,137,67,0.34)_1px,transparent_1px)] [background-size:44px_44px]" />
                <div className="relative space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      tone="outline"
                      className="border border-black/8 bg-white text-[color:var(--color-ink-strong)]"
                    >
                      Kundli Action
                    </Badge>
                    <Badge tone="trust" className="border border-black/8 bg-white">
                      Privacy-Safe
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-ink-strong)]">
                      Start with verified birth details
                    </h2>
                    <p className="max-w-2xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                      The real Kundli flow begins with your birth details, and chart details appear
                      only after calculation.
                    </p>
                  </div>
                </div>
              </Card>

              <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
                <TrackedLink
                  href={localize("/sign-in")}
                  eventName="cta_click"
                  eventPayload={{ page: "/kundli", feature: "kundli-hero-primary" }}
                  className={buttonStyles({
                    tone: "accent",
                    size: "lg",
                    className: "w-full justify-center sm:w-auto",
                  })}
                >
                  Generate Kundli
                </TrackedLink>
                <TrackedLink
                  href={localize("/reports")}
                  eventName="report_cta_click"
                  eventPayload={{ page: "/kundli", feature: "kundli-hero-secondary" }}
                  className={buttonStyles({
                    tone: "secondary",
                    size: "lg",
                    className: "w-full justify-center sm:w-auto",
                  })}
                >
                  Explore Kundli Reports
                </TrackedLink>
              </div>

              <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
                <div className="flex w-max max-w-none gap-2 pr-4 sm:flex-wrap sm:pr-0">
                  {quickPaths.map((path) => (
                    <TrackedLink
                      key={path.label}
                      href={localize(path.href)}
                      eventName="cta_click"
                      eventPayload={{ page: "/kundli", feature: path.feature }}
                      className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-[var(--radius-pill)] border border-[rgba(184,137,67,0.24)] bg-white px-4 text-[0.74rem] font-semibold text-[color:var(--color-ink-strong)] shadow-[0_8px_20px_rgba(17,24,39,0.04)] transition hover:-translate-y-0.5 hover:border-[rgba(184,137,67,0.42)] hover:text-[color:var(--color-accent-strong)]"
                    >
                      {path.label}
                    </TrackedLink>
                  ))}
                </div>
              </div>
            </div>

            <KundliPageHeroVisual />
          </Container>
        </section>

        <section className="border-b border-black/8 bg-white">
          <Container className="space-y-5 py-8 sm:py-10">
            <div className="space-y-2">
              <Badge tone="trust" className="border border-black/8 bg-white">
                Understand
              </Badge>
              <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-ink-strong)]">
                What Kundli helps you understand
              </h2>
              <p className="max-w-3xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                These are concept paths only. Chart-specific details appear only after verified
                birth details.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
              {conceptItems.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.15rem] border border-[rgba(184,137,67,0.2)] bg-white px-3 py-3 text-center shadow-[0_10px_22px_rgba(17,24,39,0.04)]"
                >
                  <span className="text-[0.78rem] font-semibold text-[color:var(--color-ink-strong)]">{item}</span>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="border-b border-black/8 bg-white">
          <Container className="grid gap-4 py-8 sm:py-10 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
            <Card
              tone="default"
              className="relative min-w-0 overflow-hidden border-[rgba(0,229,255,0.28)] bg-[#050505] text-white shadow-[0_18px_44px_rgba(0,0,0,0.18)] before:opacity-0"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(0,229,255,0.16),transparent_32%),linear-gradient(135deg,rgba(184,137,67,0.12),transparent_38%)]" />
              <div className="relative space-y-4">
                <Badge tone="outline" className="w-fit border-[rgba(0,229,255,0.34)] bg-black/30 text-[#9EF7FF]">
                  NAVAGRAHA Intelligence
                </Badge>
                <div className="space-y-2">
                  <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-white">
                    Ask NI
                  </h2>
                  <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-white/76">
                    Ask NI is powered by NAVAGRAHA Intelligence and helps users understand chart
                    context, planets, houses, Dasha, Transit, timing, and remedies.
                  </p>
                </div>
                <TrackedLink
                  href={localize("/ai")}
                  eventName="cta_click"
                  eventPayload={{ page: "/kundli", feature: "kundli-ask-ni-bridge" }}
                  className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-pill)] border border-[rgba(0,229,255,0.36)] bg-[#00E5FF] px-5 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-black shadow-[0_0_28px_rgba(0,229,255,0.18)]"
                >
                  Ask NI
                </TrackedLink>
              </div>
            </Card>

            <Card
              tone="default"
              className="relative min-w-0 overflow-hidden border-[rgba(184,137,67,0.24)] bg-white shadow-[0_16px_38px_rgba(17,24,39,0.06)] before:opacity-0"
            >
              <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full border border-[rgba(184,137,67,0.24)]" />
              <div className="relative space-y-3">
                <Badge tone="trust" className="w-fit border border-black/8 bg-white">
                  Kundli Foundation
                </Badge>
                <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-ink-strong)]">
                  Chart-aware structure, no sample output
                </h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {kundliPreviewItems.map((item) => (
                    <KundliPreviewCard key={item.title} item={item} />
                  ))}
                </div>
              </div>
            </Card>
          </Container>
        </section>

        <section className="border-b border-black/8 bg-white">
          <Container className="space-y-5 py-8 sm:py-10">
            <div className="space-y-2">
              <Badge tone="trust" className="border border-black/8 bg-white">
                Premium Kundli Services
              </Badge>
              <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-ink-strong)]">
                Human-reviewed paths beyond automatic chart generation
              </h2>
              <p className="max-w-3xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                For users who need deeper interpretation, reports, or consultation support.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {premiumServices.map((service) => (
                <TrackedLink
                  key={service.title}
                  href={localize(service.href)}
                  eventName={service.href === "/reports" ? "report_cta_click" : "consultation_cta_click"}
                  eventPayload={{ page: "/kundli", feature: service.feature }}
                  className="block min-w-0"
                >
                  <Card
                    tone="default"
                    className={`h-full min-w-0 space-y-4 bg-white shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0 ${
                      service.tone === "authority"
                        ? "border-[rgba(109,16,31,0.24)]"
                        : "border-[rgba(184,137,67,0.28)]"
                    }`}
                  >
                    <Badge
                      tone="outline"
                      className={`w-fit bg-white ${
                        service.tone === "authority"
                          ? "border-[rgba(109,16,31,0.22)] text-[#6D101F]"
                          : "border-[rgba(184,137,67,0.22)] text-[color:var(--color-accent-strong)]"
                      }`}
                    >
                      {service.label}
                    </Badge>
                    <h3 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-body-lg)] text-[color:var(--color-ink-strong)]">
                      {service.title}
                    </h3>
                    <span className="inline-flex min-h-10 items-center rounded-[var(--radius-pill)] border border-[rgba(184,137,67,0.18)] px-4 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-accent-strong)]">
                      Open
                    </span>
                  </Card>
                </TrackedLink>
              ))}
            </div>
          </Container>
        </section>

        <section className="border-b border-black/8 bg-white">
          <Container className="grid gap-4 py-8 sm:py-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <Card
              tone="default"
              className="min-w-0 border-[rgba(109,16,31,0.24)] bg-white shadow-[0_16px_38px_rgba(109,16,31,0.08)] before:opacity-0"
            >
              <div className="space-y-3">
                <Badge tone="outline" className="w-fit border-[rgba(109,16,31,0.22)] bg-white text-[#6D101F]">
                  J P Sarmah Desk
                </Badge>
                <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-ink-strong)]">
                  Human authority remains separate
                </h2>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  J P Sarmah remains the human authority. Ask NI is assistance, not a replacement.
                  Handmade Kundli and consultation support deeper human-reviewed guidance.
                </p>
                <TrackedLink
                  href={localize("/consultation")}
                  eventName="consultation_cta_click"
                  eventPayload={{ page: "/kundli", feature: "kundli-jp-sarmah-bridge" }}
                  className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-pill)] border border-[rgba(109,16,31,0.22)] bg-[#6D101F] px-5 text-[0.76rem] font-semibold uppercase tracking-[0.08em] text-white"
                >
                  Consultation
                </TrackedLink>
              </div>
            </Card>

            <Card
              tone="default"
              className="min-w-0 border-black/8 bg-white shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Badge tone="trust" className="border border-black/8 bg-white">
                    Related Tools
                  </Badge>
                  <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-ink-strong)]">
                    Continue from your Kundli
                  </h2>
                </div>

                <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
                  <div className="flex w-max gap-2 pr-4 sm:grid sm:w-full sm:grid-cols-2 sm:pr-0 lg:grid-cols-4">
                    {relatedTools.map((tool) => (
                      <TrackedLink
                        key={tool.label}
                        href={localize(tool.href)}
                        eventName="cta_click"
                        eventPayload={{ page: "/kundli", feature: tool.feature }}
                        className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-[1rem] border border-[rgba(184,137,67,0.2)] bg-white px-4 text-[0.76rem] font-semibold text-[color:var(--color-ink-strong)] shadow-[0_8px_20px_rgba(17,24,39,0.04)] sm:w-full"
                      >
                        {tool.label}
                      </TrackedLink>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </Container>
        </section>

        <section className="bg-white">
          <Container className="py-8 sm:py-10">
            <Card
              tone="default"
              className="space-y-3 border-[rgba(184,137,67,0.2)] bg-white shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0"
            >
              <Badge tone="trust" className="w-fit border border-black/8 bg-white">
                Privacy Note
              </Badge>
              <p className="max-w-4xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                {kundliTrustNote} Birth details are sensitive, and no result preview is shown without
                verified birth details. Guidance stays privacy-conscious and interpretation-focused.
              </p>
            </Card>
          </Container>
        </section>
      </main>
    </>
  );
}
