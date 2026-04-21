import Link from "next/link";
import { PageHero } from "@/components/site/page-hero";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Privacy Policy",
  description:
    "How NAVAGRAHA CENTRE handles account, birth-profile, and payment-adjacent data with calm and secure defaults.",
  path: "/privacy",
  keywords: ["privacy policy", "birth data privacy", "account safety"],
});

const policySections = [
  {
    title: "Information We Use",
    points: [
      "Account details required for authentication and secure profile continuity.",
      "Birth profile data used strictly for chart generation and related guidance flows.",
      "Behavioral product events used only for product quality and conversion visibility.",
    ],
  },
  {
    title: "What We Do Not Expose",
    points: [
      "Passwords and secret keys are never returned in public responses.",
      "Private chart data is only available to the authenticated account owner.",
      "Payment webhook secrets and internal verification data remain server-side.",
    ],
  },
  {
    title: "Operational Safeguards",
    points: [
      "Critical flows use structured validation and safe fallback states.",
      "Public analytics excludes raw birth details and credential material.",
      "Access checks are enforced in protected chart, report, and account surfaces.",
    ],
  },
] as const;

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero
        eyebrow="Policy"
        title="Privacy Policy"
        description="NAVAGRAHA CENTRE is built to handle sensitive birth details and account flows with disciplined boundaries."
        highlights={[
          "Birth profile data is used for chart logic and related guidance only",
          "Protected account ownership checks are enforced server-side",
          "Security and reliability take precedence over growth shortcuts",
        ]}
        note="For direct requests, use the contact route and select the privacy or account-support intent."
        primaryAction={{ href: "/contact?intent=account-support", label: "Contact Support" }}
        secondaryAction={{ href: "/terms", label: "View Terms" }}
        supportTitle="Data + Access Boundary"
      />

      <Section
        eyebrow="Core Policy"
        title="A practical policy for chart-centric account data."
        description="This summary is written for clarity and launch safety. It does not expose implementation secrets."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {policySections.map((section) => (
            <Card key={section.title} className="space-y-4">
              <h2 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
                {section.title}
              </h2>
              <ul className="space-y-2">
                {section.points.map((point) => (
                  <li
                    key={point}
                    className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="pt-0" tone="transparent">
        <Card tone="accent" className="space-y-4">
          <p className="text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            Questions about privacy, account ownership, or data correction can be submitted through the contact path for review.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact?intent=account-support" className={buttonStyles({ size: "sm" })}>
              Contact Support
            </Link>
            <Link href="/terms" className={buttonStyles({ size: "sm", tone: "secondary" })}>
              Read Terms
            </Link>
          </div>
        </Card>
      </Section>
    </>
  );
}
