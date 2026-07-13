import { buildPageMetadata } from "@/lib/metadata";
import { LegalPage, type LegalSection } from "../legal-page";

export const metadata = buildPageMetadata({
  title: "Disclaimer",
  description:
    "Guidance boundaries for NAVAGRAHA CENTRE covering astrology interpretation, consultation scope and outcome limits.",
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
    points: [
      "Astrology outputs are for reflection and decision support.",
      "They are not guarantees of outcomes.",
      "Users remain responsible for personal decisions.",
    ],
  },
  {
    title: "AI Interpretation Boundary",
    points: [
      "NAVAGRAHA Intelligence follows chart context and structured logic where available.",
      "It does not replace professional legal, medical, or financial advice.",
      "AI output should be reviewed within the broader consultation boundary.",
    ],
  },
  {
    title: "Remedy Framing",
    points: [
      "Remedies are presented as optional spiritual support.",
      "They are not fear-based promises.",
      "They are not absolute outcome claims.",
    ],
  },
  {
    title: "Consultation Scope",
    points: [
      "Consultation sessions provide human-guided interpretation and context.",
      "Sensitive decisions should not rely on a standalone calculation output.",
      "The consultation path does not guarantee a particular result.",
    ],
  },
] as const satisfies readonly LegalSection[];

export default function DisclaimerPage() {
  return (
    <LegalPage
      description="NAVAGRAHA CENTRE provides chart-aware astrology guidance with clear boundaries so users can make informed decisions."
      effectiveDate="Effective July 13, 2026"
      pagePath="/disclaimer"
      pageTrackerFeature="disclaimer-page"
      primaryAction={{ href: "/consultation", label: "Consultation" }}
      secondaryAction={{ href: "/privacy", label: "Privacy" }}
      sections={disclaimerBlocks}
      title="Disclaimer"
    />
  );
}
