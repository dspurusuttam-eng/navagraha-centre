import { buildPageMetadata } from "@/lib/metadata";
import { publicContactEmail } from "@/config/public-contact";
import { LegalPage } from "../legal-page";

export const metadata = buildPageMetadata({
  title: "Contact",
  description:
    "Contact NAVAGRAHA CENTRE for general information, technical support, Desk content, business enquiries, collaboration, copyright, privacy or legal concerns.",
  path: "/contact",
  keywords: ["contact", "enquiry", "business", "navagraha centre contact"],
});

/**
 * Approved contact copy — locked source content.
 * Legacy consultation categories, booking forms, account-booking wording, shop and
 * subscription language and unsupported service lists are intentionally gone.
 */
const contactParagraphs = [
  "We welcome your questions, feedback and genuine enquiries regarding NAVAGRAHA CENTRE.",
  "You may contact us regarding general information, technical support, Desk content, business enquiries, collaboration, copyright, privacy or legal concerns.",
  "For personalised astrological guidance, please use the Consultation section. Individual predictions are not provided through general email.",
  `Email: ${publicContactEmail}`,
  "Consultation: Available through the Consultation section of NAVAGRAHA CENTRE.",
] as const;

export default function ContactPage() {
  return (
    <LegalPage
      description="General information, technical support, Desk content, business, copyright, privacy or legal concerns."
      effectiveDate="Desk + Consultation"
      pagePath="/contact"
      pageTrackerFeature="contact-page"
      paragraphs={contactParagraphs}
      primaryAction={{ href: "/consultation", label: "Consultation" }}
      secondaryAction={{ href: "/support", label: "Support" }}
      title="Contact"
    />
  );
}
