import type { BadgeTone } from "@/components/ui/badge";
import type { TrackedEventName } from "@/lib/analytics/types";

export type KundliPreviewItem = {
  title: string;
  description: string;
};

export type KundliNextStepCard = {
  title: string;
  description: string;
  href?: string;
  ctaLabel: string;
  statusLabel: string;
  statusTone?: BadgeTone;
  eventName: TrackedEventName;
  feature: string;
};

export const kundliHeroBadges = [
  "12-Planet Calculation",
  "Lagna + Nakshatra",
  "Dasha Ready",
  "AI Guidance Ready",
  "Privacy-Safe",
] as const;

export const kundliPreviewItems: readonly KundliPreviewItem[] = [
  {
    title: "Lagna Chart",
    description: "A clear ascendant-first foundation for interpretation.",
  },
  {
    title: "12 Planet Table",
    description: "Structured graha positions for stable reference.",
  },
  {
    title: "Nakshatra & Pada",
    description: "Moon context and finer placement support.",
  },
  {
    title: "Vimshottari Dasha",
    description: "Timing layers prepared for later guidance flows.",
  },
  {
    title: "Transit Context",
    description: "Current movement context for practical next steps.",
  },
  {
    title: "NAVAGRAHA Intelligence Guidance",
    description: "Chart-aware guidance support layered on top.",
  },
] as const;

export const kundliNextStepCards: readonly KundliNextStepCard[] = [
  {
    title: "View Dasha Timeline",
    description: "Open your current timing context and continue from the chart foundation.",
    href: "/tools",
    ctaLabel: "Open Tools",
    statusLabel: "Available",
    statusTone: "trust",
    eventName: "cta_click",
    feature: "kundli-next-step-dasha",
  },
  {
    title: "Check Transit / Gochar",
    description: "Review movement-aware context from the saved chart flow.",
    href: "/tools",
    ctaLabel: "Check Transit",
    statusLabel: "Available",
    statusTone: "trust",
    eventName: "cta_click",
    feature: "kundli-next-step-transit",
  },
  {
    title: "Explore Reports",
    description: "Move into premium reports when you want deeper synthesis.",
    href: "/reports",
    ctaLabel: "Open Reports",
    statusLabel: "Premium Reports",
    statusTone: "accent",
    eventName: "report_cta_click",
    feature: "kundli-next-step-reports",
  },
  {
    title: "Ask NI",
    description: "Use the same saved chart context to ask a chart-aware question.",
    href: "/ai",
    ctaLabel: "Ask NI",
    statusLabel: "Available",
    statusTone: "trust",
    eventName: "cta_click",
    feature: "kundli-next-step-ai",
  },
  {
    title: "Consult JYOTISH BHASKAR J P SARMAH",
    description: "Move into human guidance for important decisions.",
    href: "/consultation",
    ctaLabel: "Book Consultation",
    statusLabel: "Premium Service",
    statusTone: "accent",
    eventName: "consultation_cta_click",
    feature: "kundli-next-step-consultation",
  },
] as const;

export const kundliTrustNote =
  "Your birth details are used only to generate your astrology guidance. NAVAGRAHA CENTRE keeps Kundli experience privacy-focused and secure.";
