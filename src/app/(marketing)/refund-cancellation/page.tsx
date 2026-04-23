import Link from "next/link";
import { PageHero } from "@/components/site/page-hero";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Refund and Cancellation",
  description:
    "Refund and cancellation policy guidance for NAVAGRAHA CENTRE consultations, reports, and shop orders.",
  path: "/refund-cancellation",
  keywords: [
    "refund policy",
    "cancellation policy",
    "consultation cancellation",
    "shop order support",
  ],
});

const policyRows = [
  {
    title: "Consultation Sessions",
    detail:
      "Session rescheduling and cancellation requests are reviewed through the account and consultation support flow.",
  },
  {
    title: "Report and AI Services",
    detail:
      "Service access is currently free under limited launch access. Future paid policy terms will be listed here before activation.",
  },
  {
    title: "Shop Orders",
    detail:
      "Order issues, fulfillment concerns, and cancellation requests are handled through contact support after order verification.",
  },
  {
    title: "Support Response Path",
    detail:
      "Use the contact route with order or account details so requests can be reviewed safely and accurately.",
  },
] as const;

export default function RefundCancellationPage() {
  return (
    <>
      <PageHero
        eyebrow="Policy"
        title="Refund and Cancellation"
        description="A clear support policy is maintained for consultations, report access, and shop order concerns."
        highlights={[
          "Consultation and order support requests are reviewed case by case",
          "Current service access is free during limited launch mode",
          "Future paid policy terms will be published before activation",
        ]}
        note="For immediate assistance, contact the centre with your account or order reference."
        primaryAction={{ href: "/contact", label: "Contact Support" }}
        secondaryAction={{ href: "/terms", label: "View Terms" }}
        supportTitle="Support Policy"
      />

      <Section
        eyebrow="Policy Summary"
        title="How cancellation and refund requests are handled."
        description="This launch-phase policy keeps support clear while preserving a premium and transparent user experience."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {policyRows.map((row) => (
            <Card key={row.title} className="space-y-3">
              <h2 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
                {row.title}
              </h2>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {row.detail}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="pt-0" tone="transparent">
        <Card tone="accent" className="space-y-4">
          <p className="text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
            Please include the account email, order number, or consultation reference when requesting support for faster review.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className={buttonStyles({ size: "sm" })}>
              Contact Support
            </Link>
            <Link href="/shop" className={buttonStyles({ size: "sm", tone: "secondary" })}>
              Open Shop
            </Link>
          </div>
        </Card>
      </Section>
    </>
  );
}
