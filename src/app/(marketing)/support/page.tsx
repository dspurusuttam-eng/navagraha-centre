import { buildPageMetadata } from "@/lib/metadata";
import { publicContactEmail } from "@/config/public-contact";
import { LegalPage } from "../legal-page";

export const metadata = buildPageMetadata({
  title: "Support",
  description:
    "Help with the NAVAGRAHA CENTRE website or app, Desk content, language or display issues, broken links and access to the Consultation service.",
  path: "/support",
  keywords: ["support", "help", "technical issue", "navagraha centre support"],
});

/** Approved support copy — locked source content. */
const supportParagraphs = [
  "We are here to help you use NAVAGRAHA CENTRE smoothly.",
  "You may contact us for help with the website or app, Desk content, language or display issues, broken links, technical errors, or access to the Consultation service.",
  "For personalised astrological guidance, please use the Consultation section. Support does not provide individual predictions or horoscope analysis.",
  "When reporting a technical issue, mention the relevant page, device and a short description of the problem. Please do not send passwords, payment credentials or unnecessary sensitive personal information.",
  `Support email: ${publicContactEmail}`,
] as const;

export default function SupportPage() {
  return (
    <LegalPage
      description="Help with the website or app, Desk content, technical errors and access to the Consultation service."
      effectiveDate="Desk + Consultation"
      pagePath="/support"
      pageTrackerFeature="support-page"
      paragraphs={supportParagraphs}
      primaryAction={{ href: "/consultation", label: "Consultation" }}
      secondaryAction={{ href: "/contact", label: "Contact" }}
      title="Support"
    />
  );
}
