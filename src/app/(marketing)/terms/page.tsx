import { buildPageMetadata } from "@/lib/metadata";
import { LegalPage, type LegalSection } from "../legal-page";

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
    points: [
      "The platform provides chart tools, guidance surfaces, reports, and consultation pathways where available.",
      "Content is informational and reflective in nature.",
      "Consultation remains the human-guided path for personal context.",
    ],
  },
  {
    title: "Account Responsibility",
    points: [
      "Users are responsible for secure login usage.",
      "Users are responsible for accurate profile inputs.",
      "Users should maintain control of their account credentials.",
    ],
  },
  {
    title: "Payment And Access",
    points: [
      "Premium access is controlled server-side by verified payment and subscription state where paid access is active.",
      "Unauthorized bypass attempts are not permitted.",
      "Refund and cancellation details are listed on the refund policy page.",
    ],
  },
  {
    title: "Operational Limits",
    points: [
      "Service continuity can depend on hosting, email, AI, and payment infrastructure.",
      "Safe fallback behavior is applied when dependencies fail.",
      "Unavailable states should not be treated as completed guidance.",
    ],
  },
] as const satisfies readonly LegalSection[];

export default function TermsPage() {
  return (
    <LegalPage
      description="These terms define how NAVAGRAHA CENTRE services are delivered and how account safety is maintained."
      effectiveDate="Effective July 13, 2026"
      pagePath="/terms"
      pageTrackerFeature="terms-page"
      primaryAction={{ href: "/privacy", label: "Privacy" }}
      secondaryAction={{ href: "/refund", label: "Refund" }}
      sections={termsSections}
      title="Terms Of Use"
    />
  );
}
