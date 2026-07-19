import { buildPageMetadata } from "@/lib/metadata";
import { publicContactEmail } from "@/config/public-contact";
import { LegalPage } from "../legal-page";

export const metadata = buildPageMetadata({
  title: "Terms of Use",
  description:
    "Terms of use for NAVAGRAHA CENTRE, including copyright protection, responsible use, and the limits of astrological guidance.",
  path: "/terms",
  keywords: ["terms of use", "copyright", "disclaimer", "responsible use"],
});

/**
 * Approved terms copy — locked source content.
 * This page carries the copyright protection, responsible-use conditions, disclaimer
 * protection, professional-advice limitation and user-responsibility statement, so no separate
 * public Copyright or Disclaimer page exists.
 */
const termsParagraphs = [
  "By using NAVAGRAHA CENTRE, you agree to use the website and app lawfully and responsibly.",
  "Desk content is provided for general learning, awareness and spiritual guidance. Personalised guidance is available only through the Consultation section.",
  "You may not copy, republish, translate, scrape, sell, commercially use or reproduce our articles, handwritten content, images, graphics, icons, design, software, reports or other original materials without permission.",
  "You must not misuse the platform, attempt unauthorised access, impersonate others or submit abusive, false or unlawful information.",
  "Astrological guidance is interpretative and should not replace qualified medical, legal, financial or psychological advice. Important decisions remain the responsibility of the user.",
  "Temporary errors, interruptions or updates may occur.",
  "NAVAGRAHA CENTRE may restrict access where misuse, fraud or violation of these terms is detected.",
  `For questions or copyright concerns, contact: ${publicContactEmail}`,
] as const;

export default function TermsPage() {
  return (
    <LegalPage
      description="Lawful and responsible use, copyright protection, and the limits of astrological guidance."
      effectiveDate="Effective 2026"
      pagePath="/terms"
      pageTrackerFeature="terms-page"
      paragraphs={termsParagraphs}
      title="Terms of Use"
    />
  );
}
