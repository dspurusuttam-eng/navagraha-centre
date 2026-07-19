import { buildPageMetadata } from "@/lib/metadata";
import { LegalPage, type LegalSection } from "../legal-page";

// Hidden until paid consultation and payment processing are officially activated: the route
// is blocked by product-mode, excluded from the sitemap and never linked publicly. This
// noindex is the final belt-and-braces so it can never be indexed if it is ever reachable.
export const metadata = buildPageMetadata({
  index: false,
  title: "Refund and Cancellation",
  description:
    "Refund and cancellation policy guidance for NAVAGRAHA CENTRE consultation access and support review.",
  path: "/refund",
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
    points: [
      "Session rescheduling and cancellation requests are reviewed through the account and consultation support flow.",
      "The review depends on the current consultation state and available operational records.",
      "No automatic outcome is promised by this policy summary.",
    ],
  },
  {
    title: "Report and AI Services",
    points: [
      "Service access is currently free under limited launch access where paid access is not active.",
      "Future paid policy terms will be listed before activation.",
      "Unavailable or preview-only features do not create paid access rights.",
    ],
  },
  {
    title: "Shop Orders",
    points: [
      "Order issues, fulfillment concerns, and cancellation requests are handled through contact support after order verification.",
      "Order support requires enough account or order context to locate the request.",
      "No unverified refund promise is made on this page.",
    ],
  },
  {
    title: "Support Response Path",
    points: [
      "Use Contact or Support with account, order, or consultation context.",
      "Do not include passwords or private credentials in support messages.",
      "Requests are reviewed through the available support workflow.",
    ],
  },
] as const satisfies readonly LegalSection[];

export default function RefundPage() {
  return (
    <LegalPage
      description="A clear support policy is maintained for consultations, report access, and shop order concerns."
      effectiveDate="Effective July 13, 2026"
      pagePath="/refund"
      pageTrackerFeature="refund-page"
      primaryAction={{ href: "/contact", label: "Contact" }}
      secondaryAction={{ href: "/terms", label: "Terms" }}
      sections={policyRows}
      title="Refund and Cancellation"
    />
  );
}
