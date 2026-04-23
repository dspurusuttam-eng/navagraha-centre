import Link from "next/link";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import {
  getAiAccessLayers,
  getConsultationTierDefinitions,
  getLaunchAccessBadge,
  getReportPackageDefinitions,
  getRevenueValueLevels,
} from "@/modules/subscriptions/offer-architecture";

export function RevenueValueLevelsSection({
  pagePath,
  tone = "light",
}: Readonly<{
  pagePath: string;
  tone?: "default" | "muted" | "transparent" | "light" | "contrast";
}>) {
  const levels = getRevenueValueLevels();

  return (
    <Section
      tone={tone}
      eyebrow="Free To Premium Architecture"
      title="Three value levels are already structured for future monetization."
      description="Payments remain inactive now, while the offer hierarchy and user journey are prepared for a clean free-to-paid transition."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {levels.map((level) => (
          <Card key={level.level} className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={level.level === "MID_TIER" ? "accent" : "neutral"}>
                {level.title}
              </Badge>
              {level.level === "MID_TIER" ? (
                <Badge tone="outline">Most Popular</Badge>
              ) : null}
            </div>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {level.positioning}
            </p>
            <div className="space-y-2">
              {level.includes.map((item) => (
                <p
                  key={`${level.level}-${item}`}
                  className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]"
                >
                  {item}
                </p>
              ))}
            </div>
            <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              {level.badge}
            </p>
          </Card>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <TrackedLink
          href="/reports"
          eventName="premium_click"
          eventPayload={{ page: pagePath, feature: "value-levels-reports" }}
          className={buttonStyles({ size: "sm", tone: "secondary" })}
        >
          Explore Reports
        </TrackedLink>
        <TrackedLink
          href="/consultation"
          eventName="premium_click"
          eventPayload={{ page: pagePath, feature: "value-levels-consultation" }}
          className={buttonStyles({ size: "sm", tone: "tertiary" })}
        >
          Book Consultation
        </TrackedLink>
      </div>
    </Section>
  );
}

export function ReportPackagesSection({
  pagePath,
  tone = "light",
}: Readonly<{
  pagePath: string;
  tone?: "default" | "muted" | "transparent" | "light" | "contrast";
}>) {
  const packages = getReportPackageDefinitions();

  return (
    <Section
      tone={tone}
      eyebrow="Report Packaging"
      title="Future-ready report packages with clear value hierarchy."
      description="Essential, Advanced, and Premium packaging is prepared now and remains open under limited launch access."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {packages.map((pkg) => (
          <Card key={pkg.tier} className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={pkg.tier === "ADVANCED" ? "accent" : "neutral"}>
                {pkg.title}
              </Badge>
              {pkg.tier === "ADVANCED" ? <Badge tone="outline">Most Popular</Badge> : null}
            </div>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {pkg.positioning}
            </p>
            <div className="space-y-2">
              {pkg.includes.map((item) => (
                <p
                  key={`${pkg.tier}-${item}`}
                  className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]"
                >
                  {item}
                </p>
              ))}
            </div>
            <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              {pkg.badge}
            </p>
          </Card>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <TrackedLink
          href="/career-report"
          eventName="premium_click"
          eventPayload={{ page: pagePath, feature: "report-packages-career" }}
          className={buttonStyles({ size: "sm" })}
        >
          Get Free Report
        </TrackedLink>
        <TrackedLink
          href="/ai"
          eventName="premium_click"
          eventPayload={{ page: pagePath, feature: "report-packages-ai" }}
          className={buttonStyles({ size: "sm", tone: "secondary" })}
        >
          Start Free Analysis
        </TrackedLink>
      </div>
    </Section>
  );
}

export function ConsultationTiersSection({
  pagePath,
  tone = "light",
}: Readonly<{
  pagePath: string;
  tone?: "default" | "muted" | "transparent" | "light" | "contrast";
}>) {
  const tiers = getConsultationTierDefinitions();

  return (
    <Section
      tone={tone}
      eyebrow="Consultation Packaging"
      title="Future consultation tiers are now structured."
      description="Session hierarchy is clear for launch and future pricing activation, while consultations remain free right now."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {tiers.map((tier) => (
          <Card key={tier.tier} className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={tier.tier === "DETAILED" ? "accent" : "neutral"}>
                {tier.title}
              </Badge>
              <Badge tone="outline">{tier.duration}</Badge>
            </div>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {tier.description}
            </p>
            <div className="space-y-2">
              {tier.includes.map((item) => (
                <p
                  key={`${tier.tier}-${item}`}
                  className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]"
                >
                  {item}
                </p>
              ))}
            </div>
            <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              {tier.badge}
            </p>
          </Card>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <TrackedLink
          href="/consultation"
          eventName="premium_click"
          eventPayload={{ page: pagePath, feature: "consultation-tiers-book" }}
          className={buttonStyles({ size: "sm" })}
        >
          Book Free Consultation
        </TrackedLink>
      </div>
    </Section>
  );
}

export function AiMonetizationPrepSection({
  pagePath,
  tone = "light",
}: Readonly<{
  pagePath: string;
  tone?: "default" | "muted" | "transparent" | "light" | "contrast";
}>) {
  const layers = getAiAccessLayers();

  return (
    <Section
      tone={tone}
      eyebrow="AI Monetization Preparation"
      title="Free and Premium AI layers are prepared without locking access."
      description="Members can use all core AI flows now, while UX messaging already supports future free-to-premium rollout."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        {layers.map((layer) => (
          <Card key={layer.title} className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={layer.title.includes("Premium") ? "accent" : "neutral"}>
                {layer.title}
              </Badge>
              {layer.title.includes("Premium") ? (
                <Badge tone="outline">Early Access</Badge>
              ) : null}
            </div>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {layer.description}
            </p>
            <div className="space-y-2">
              {layer.includes.map((item) => (
                <p
                  key={`${layer.title}-${item}`}
                  className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]"
                >
                  {item}
                </p>
              ))}
            </div>
            <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              {layer.badge}
            </p>
          </Card>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <TrackedLink
          href="/ai"
          eventName="premium_click"
          eventPayload={{ page: pagePath, feature: "ai-monetization-try-ai" }}
          className={buttonStyles({ size: "sm", tone: "secondary" })}
        >
          Try NAVAGRAHA AI
        </TrackedLink>
      </div>
    </Section>
  );
}

export function RevenuePathwaysCard({
  pagePath,
  title = "Continue with premium-ready pathways",
  description = "Move from free value into deeper report, consultation, or spiritual support flows without friction.",
}: Readonly<{
  pagePath: string;
  title?: string;
  description?: string;
}>) {
  return (
    <Card tone="accent" className="space-y-5">
      <div className="space-y-2">
        <Badge tone="accent">{getLaunchAccessBadge()}</Badge>
        <h3 className="text-[length:var(--font-size-title-sm)] text-[var(--color-ink-strong)]">
          {title}
        </h3>
        <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
          {description}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <TrackedLink
          href="/reports"
          eventName="premium_click"
          eventPayload={{ page: pagePath, feature: "pathway-reports" }}
          className={buttonStyles({
            size: "sm",
            className: "w-full justify-center",
          })}
        >
          Get Free Report
        </TrackedLink>
        <TrackedLink
          href="/consultation"
          eventName="premium_click"
          eventPayload={{ page: pagePath, feature: "pathway-consultation" }}
          className={buttonStyles({
            size: "sm",
            tone: "secondary",
            className: "w-full justify-center",
          })}
        >
          Book Free Consultation
        </TrackedLink>
        <TrackedLink
          href="/shop"
          eventName="premium_click"
          eventPayload={{ page: pagePath, feature: "pathway-shop" }}
          className={buttonStyles({
            size: "sm",
            tone: "tertiary",
            className: "w-full justify-center",
          })}
        >
          Explore Spiritual Shop
        </TrackedLink>
      </div>
      <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
        Shop pricing remains separate from service monetization.
      </p>
      <div className="flex gap-3">
        <Link href="/pricing" className={buttonStyles({ size: "sm", tone: "ghost" })}>
          View Offer Architecture
        </Link>
      </div>
    </Card>
  );
}
