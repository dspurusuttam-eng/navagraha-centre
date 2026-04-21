import Link from "next/link";
import { PageHero } from "@/components/site/page-hero";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Terms Of Use",
  description:
    "Public usage terms for NAVAGRAHA CENTRE covering account ownership, guidance boundaries, and platform use.",
  path: "/terms",
  keywords: ["terms of use", "astrology platform terms", "service policy"],
});

const termsSections = [
  {
    title: "Service Scope",
    description:
      "The platform provides chart tools, AI-assisted guidance, reports, and consultation pathways. Content is informational and reflective in nature.",
  },
  {
    title: "Account Responsibility",
    description:
      "Users are responsible for secure login usage, accurate profile inputs, and maintaining control of their account credentials.",
  },
  {
    title: "Payment And Access",
    description:
      "Premium access is controlled server-side by verified payment and subscription state. Unauthorized bypass attempts are not permitted.",
  },
  {
    title: "Operational Limits",
    description:
      "Service continuity depends on external providers such as hosting, email, AI, and payment infrastructure. Safe fallback behavior is applied when dependencies fail.",
  },
] as const;

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Policy"
        title="Terms Of Use"
        description="These terms define how NAVAGRAHA CENTRE services are delivered and how account safety is maintained."
        highlights={[
          "Clear service boundaries for chart, AI, reports, and consultation",
          "Account ownership and access protections are enforced server-side",
          "Premium feature access follows verified subscription and payment state",
        ]}
        note="For policy clarifications, use the contact route and choose consultation or account support intent."
        primaryAction={{ href: "/contact", label: "Contact The Centre" }}
        secondaryAction={{ href: "/privacy", label: "View Privacy Policy" }}
        supportTitle="Service Terms"
      />

      <Section
        eyebrow="Core Terms"
        title="Simple and readable operational terms."
        description="This page is intentionally concise so public users can understand the platform boundary without legal clutter."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {termsSections.map((section) => (
            <Card key={section.title} className="space-y-3">
              <h2 className="text-[length:var(--font-size-body-lg)] font-medium text-[color:var(--color-foreground)]">
                {section.title}
              </h2>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {section.description}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="pt-0" tone="transparent">
        <Card tone="accent" className="space-y-4">
          <p className="text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            By continuing to use the platform, users acknowledge this scope and the standard account and payment boundaries described above.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/privacy" className={buttonStyles({ size: "sm" })}>
              Privacy Policy
            </Link>
            <Link href="/pricing" className={buttonStyles({ size: "sm", tone: "secondary" })}>
              Plans And Access
            </Link>
          </div>
        </Card>
      </Section>
    </>
  );
}
