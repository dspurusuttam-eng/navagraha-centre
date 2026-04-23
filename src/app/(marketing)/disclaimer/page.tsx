import Link from "next/link";
import { PageHero } from "@/components/site/page-hero";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Disclaimer",
  description:
    "Guidance boundaries for NAVAGRAHA CENTRE covering astrology interpretation, AI outputs, and remedy framing.",
  path: "/disclaimer",
  keywords: [
    "astrology disclaimer",
    "guidance boundaries",
    "ai astrology disclaimer",
  ],
});

const disclaimerBlocks = [
  {
    title: "Guidance, Not Guarantee",
    description:
      "Astrology outputs are for reflection and decision support. They are not guarantees of outcomes.",
  },
  {
    title: "AI Interpretation Boundary",
    description:
      "NAVAGRAHA AI follows chart context and structured logic. It does not replace professional legal, medical, or financial advice.",
  },
  {
    title: "Remedy Framing",
    description:
      "Remedies are presented as optional spiritual support, not as fear-based promises or absolute outcomes.",
  },
  {
    title: "Consultation Scope",
    description:
      "Consultation sessions provide human-guided interpretation and context. Users remain responsible for personal decisions.",
  },
] as const;

export default function DisclaimerPage() {
  return (
    <>
      <PageHero
        eyebrow="Policy"
        title="Disclaimer"
        description="NAVAGRAHA CENTRE provides chart-aware astrology guidance with clear boundaries so users can make informed decisions."
        highlights={[
          "Guidance-first, not guarantee-based communication",
          "AI interpretation stays chart-grounded and bounded",
          "Remedies are optional support, never absolute claims",
        ]}
        note="For nuanced interpretation, users can continue into consultation with Joy Prakash Sarmah."
        primaryAction={{ href: "/consultation", label: "Book Free Consultation" }}
        secondaryAction={{ href: "/privacy", label: "View Privacy Policy" }}
        supportTitle="Trust Boundary"
      />

      <Section
        eyebrow="Usage Boundary"
        title="How to interpret guidance responsibly."
        description="This page keeps trust expectations explicit across chart, AI, reports, and remedies."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {disclaimerBlocks.map((block) => (
            <Card key={block.title} className="space-y-3">
              <h2 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
                {block.title}
              </h2>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {block.description}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="pt-0" tone="transparent">
        <Card tone="accent" className="space-y-4">
          <p className="text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
            If your question is highly personal or sensitive, use consultation for deeper context and human review.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/consultation" className={buttonStyles({ size: "sm" })}>
              Consultation
            </Link>
            <Link href="/terms" className={buttonStyles({ size: "sm", tone: "secondary" })}>
              Terms Of Use
            </Link>
          </div>
        </Card>
      </Section>
    </>
  );
}
