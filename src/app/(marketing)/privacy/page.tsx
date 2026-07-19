import { ConsentPreferencesPanel } from "@/components/site/consent-preferences-panel";
import { buildPageMetadata } from "@/lib/metadata";
import { publicContactEmail } from "@/config/public-contact";
import { LegalPage } from "../legal-page";

export const metadata = buildPageMetadata({
  title: "Privacy Policy",
  description:
    "How NAVAGRAHA CENTRE collects, uses and protects the limited information you share through email, WhatsApp or the website.",
  path: "/privacy",
  keywords: ["privacy policy", "data protection", "navagraha centre privacy"],
});

/** Approved privacy copy — locked source content for the Desk + Consultation MVP. */
const privacyParagraphs = [
  "NAVAGRAHA CENTRE respects your privacy and collects only the information reasonably required to provide and improve its services.",
  "We may receive information that you voluntarily provide through email or WhatsApp, including your name, contact details, preferred language, consultation request, birth details and related questions.",
  "This information is used only to respond to you, provide the requested service, maintain necessary records, prevent misuse and comply with applicable law.",
  "The website or app may process limited technical information such as device type, browser, page usage and security logs.",
  "We do not sell or rent personal information.",
  "WhatsApp and other external services operate under their own privacy policies. Please do not send passwords, payment credentials, government identification documents or unnecessary sensitive information.",
  `To request correction or deletion of information you provided, contact: ${publicContactEmail}`,
  "Users below 18 years should use the service with the involvement of a parent or legal guardian.",
] as const;

export default function PrivacyPage() {
  return (
    <LegalPage
      description="Information we collect, how it is used, and how to request correction or deletion."
      effectiveDate="Effective 2026"
      pagePath="/privacy"
      pageTrackerFeature="privacy-page"
      paragraphs={privacyParagraphs}
      title="Privacy Policy"
    >
      {/* Retained: the cookie/advertising consent control is an active, legally relevant
          mechanism rather than policy prose. Inline — never a popup. */}
      <ConsentPreferencesPanel />
    </LegalPage>
  );
}
