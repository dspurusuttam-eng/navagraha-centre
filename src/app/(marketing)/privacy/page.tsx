import { ConsentPreferencesPanel } from "@/components/site/consent-preferences-panel";
import { Card } from "@/components/ui/card";
import { buildPageMetadata } from "@/lib/metadata";
import { LegalPage, type LegalSection } from "../legal-page";

export const metadata = buildPageMetadata({
  title: "Privacy Policy",
  description:
    "How NAVAGRAHA CENTRE handles account, birth-profile, and payment-adjacent data with secure defaults.",
  path: "/privacy",
  keywords: ["privacy policy", "birth data privacy", "account safety"],
});

const policySections = [
  {
    title: "Information We Use",
    points: [
      "Account details required for authentication and secure profile continuity.",
      "Birth profile data used strictly for chart generation and related guidance flows.",
      "Product events used for product quality and public page reliability checks.",
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
  {
    title: "Cookies and Consent",
    points: [
      "Necessary cookies support the site shell, localization, and secure navigation.",
      "Analytics, advertising, and personalization remain opt-in and can be updated later.",
      "Third-party tracking is not enabled until a real consent choice and provider config exist.",
    ],
  },
] as const satisfies readonly LegalSection[];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      description="NAVAGRAHA CENTRE is built to handle sensitive birth details and account flows with disciplined boundaries."
      effectiveDate="Effective July 13, 2026"
      pagePath="/privacy"
      pageTrackerFeature="privacy-page"
      primaryAction={{ href: "/contact?intent=account-support", label: "Contact" }}
      secondaryAction={{ href: "/terms", label: "Terms" }}
      sections={policySections}
      title="Privacy Policy"
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <ConsentPreferencesPanel />
        <Card className="space-y-4">
          <h2 className="text-base font-semibold text-[color:var(--ui-color-text-primary)]">
            Consent Notes
          </h2>
          <p className="text-sm font-medium leading-6 text-[color:var(--ui-color-text-secondary)]">
            Consent is stored in a first-party preference cookie only. It does
            not contain birth details, chart data, AI prompts, or payment
            information.
          </p>
          <p className="text-sm font-medium leading-6 text-[color:var(--ui-color-text-secondary)]">
            If you clear site data, the site falls back to necessary-only mode.
          </p>
        </Card>
      </div>
    </LegalPage>
  );
}
