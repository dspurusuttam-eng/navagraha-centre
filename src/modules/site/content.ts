export type PageKey =
  | "home"
  | "about"
  | "services"
  | "consultation"
  | "shop"
  | "dashboard"
  | "admin";

export type PageContent = {
  eyebrow: string;
  title: string;
  description: string;
  highlights: string[];
  note: string;
  primaryAction: {
    href: string;
    label: string;
  };
  secondaryAction?: {
    href: string;
    label: string;
  };
};

const content: Record<PageKey, PageContent> = {
  home: {
    eyebrow: "Luxury Astrology Platform",
    title: "A calm, premium foundation for NAVAGRAHA CENTRE.",
    description:
      "The public brand experience is now structured for editorial marketing pages, future consultation flows, and secure product expansion without mixing concerns too early.",
    highlights: [
      "Next.js App Router foundation with clean route groups",
      "Server-rendered placeholder pages for public discovery",
      "Shared layout primitives ready for later brand systems",
    ],
    note: "This homepage is intentionally a phase-zero placeholder, keeping the brand language refined without promising live astrology functionality yet.",
    primaryAction: {
      href: "/consultation",
      label: "View Consultation Route",
    },
    secondaryAction: {
      href: "/services",
      label: "Explore Service Structure",
    },
  },
  about: {
    eyebrow: "Brand Story",
    title: "About NAVAGRAHA CENTRE",
    description:
      "This route is prepared for the founder story, credibility, philosophy, and service positioning that will establish trust without relying on mystical cliches.",
    highlights: [
      "Editorial page layout ready for premium storytelling",
      "Metadata helper in place for SEO-first public copy",
      "Reusable structure ready for future content modules",
    ],
    note: "Keep Joy Prakash Sarmah's authority visible here once content is written, while avoiding exaggerated claims or guaranteed outcomes.",
    primaryAction: {
      href: "/",
      label: "Back to Home",
    },
  },
  services: {
    eyebrow: "Offer Design",
    title: "Services placeholder",
    description:
      "This page is reserved for structured service tiers, consultation formats, and remedy framing once the product model for offerings is finalized.",
    highlights: [
      "Supports clear service segmentation later",
      "Designed to stay compatible with future billing adapters",
      "Keeps public marketing separate from app workflows",
    ],
    note: "Service descriptions should remain transparent and careful, especially around remedies and expected outcomes.",
    primaryAction: {
      href: "/consultation",
      label: "Open Consultation Page",
    },
    secondaryAction: {
      href: "/shop",
      label: "View Shop Placeholder",
    },
  },
  consultation: {
    eyebrow: "Manual Workflow",
    title: "Consultation route placeholder",
    description:
      "This route is reserved for the future manual consultation workflow, booking guidance, intake expectations, and astrologer-led communication flow.",
    highlights: [
      "Separate route ready for future booking UX",
      "Supports manual consultation operations before automation",
      "Aligned with phased rollout and placeholder safety rules",
    ],
    note: "No booking engine or payment flow is included in this phase, by design.",
    primaryAction: {
      href: "/services",
      label: "Review Service Structure",
    },
  },
  shop: {
    eyebrow: "Spiritual Commerce",
    title: "Shop placeholder",
    description:
      "This page holds space for future spiritual product discovery, product storytelling, and commerce integrations without introducing payment logic yet.",
    highlights: [
      "Dedicated route ready for commerce architecture later",
      "Keeps catalog UX separate from consultation surfaces",
      "Prepared for future SEO and product merchandising",
    ],
    note: "This phase intentionally excludes payment processing, inventory, and transactional workflows.",
    primaryAction: {
      href: "/",
      label: "Return to Home",
    },
  },
  dashboard: {
    eyebrow: "Client Workspace",
    title: "Dashboard placeholder",
    description:
      "The authenticated experience will live here in a later phase. For now, the route and layout boundary exist so app-specific work can stay separated from public marketing.",
    highlights: [
      "Reserved route group for future client flows",
      "Clear separation from the marketing experience",
      "Ready for future auth and data modules without rework",
    ],
    note: "No authentication, chart data, or personalized state is included in this phase.",
    primaryAction: {
      href: "/",
      label: "Visit Marketing Home",
    },
  },
  admin: {
    eyebrow: "Operations Console",
    title: "Admin placeholder",
    description:
      "This route is reserved for future internal tooling, consultation operations, and controlled administrative workflows.",
    highlights: [
      "Protected area boundary is established early",
      "Ready for future operational modules and adapters",
      "Separated from both public and client-facing experiences",
    ],
    note: "No admin capabilities are implemented yet beyond placeholder routing.",
    primaryAction: {
      href: "/",
      label: "Back to Home",
    },
  },
};

export function getPageContent(key: PageKey) {
  return content[key];
}
