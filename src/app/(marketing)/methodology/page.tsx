import { buildPageMetadata } from "@/lib/metadata";
import { LegalPage } from "../legal-page";

// Route note: the canonical path stays /methodology (it is already indexed and linked); only
// the public footer label is "Method". No duplicate /method page is created — /method is a
// permanent redirect to this canonical destination (see next.config.ts).
export const metadata = buildPageMetadata({
  title: "Our Method",
  description:
    "How NAVAGRAHA CENTRE combines traditional Vedic astrology with modern astronomical calculation, interpreted by a human astrologer.",
  path: "/methodology",
  keywords: ["method", "vedic astrology method", "kundli calculation"],
});

/** Approved method copy — locked source content. */
const methodParagraphs = [
  "NAVAGRAHA CENTRE follows traditional Vedic astrology supported by modern astronomical calculation tools.",
  "For Kundli and other personalised services, we consider the birth date, exact birth time and birth location to calculate planetary positions and relevant astrological factors.",
  "Technology helps us maintain calculation accuracy, but the final analysis and guidance are performed by a human astrologer. We do not rely only on automatic or AI-generated predictions.",
  "Each consultation is interpreted according to the individual’s details, circumstances and questions. Astrological guidance should be used together with personal judgement.",
] as const;

export default function MethodPage() {
  return (
    <LegalPage
      description="Traditional Vedic astrology supported by modern calculation, interpreted by a human astrologer."
      effectiveDate="Desk + Consultation"
      pagePath="/methodology"
      pageTrackerFeature="methodology-page"
      paragraphs={methodParagraphs}
      primaryAction={{ href: "/consultation", label: "Consultation" }}
      secondaryAction={{ href: "/from-the-desk", label: "Desk" }}
      title="Our Method"
    />
  );
}
