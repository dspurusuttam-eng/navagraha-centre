import type { ConsultationType } from "@prisma/client";

export type ConsultationPackageDefinition = {
  slug: string;
  type: ConsultationType;
  title: string;
  summary: string;
  description: string;
  durationMinutes: number;
  priceFromMinor: number;
  isFeatured: boolean;
  sortOrder: number;
  idealFor: string[];
};

export const consultationHost = {
  astrologerName: "Joy Prakash Sarmah",
  timezone: "Asia/Kolkata",
  timezoneLabel: "India Standard Time",
} as const;

export const consultationPackages: readonly ConsultationPackageDefinition[] = [
  {
    slug: "private-reading",
    type: "PRIVATE_READING",
    title: "Private Reading",
    summary:
      "A focused one-to-one consultation for life transitions, timing questions, and deeper personal reflection.",
    description:
      "Best for clients seeking a full private session with Joy Prakash Sarmah around change, decision-making, timing, or a broader life chapter.",
    durationMinutes: 75,
    priceFromMinor: 18000,
    isFeatured: true,
    sortOrder: 10,
    idealFor: [
      "major transitions or crossroads",
      "clarifying timing and emphasis",
      "a broader personal reading with discretion",
    ],
  },
  {
    slug: "compatibility-session",
    type: "COMPATIBILITY",
    title: "Compatibility Session",
    summary:
      "A relationship-centered consultation shaped for partnership dynamics, tone, and thoughtful compatibility questions.",
    description:
      "Designed for clients who want a calm, structured conversation around relationship dynamics, partnership timing, or compatibility themes.",
    durationMinutes: 90,
    priceFromMinor: 24000,
    isFeatured: true,
    sortOrder: 20,
    idealFor: [
      "relationship dynamics and shared timing",
      "compatibility questions approached with nuance",
      "calm perspective rather than fixed judgement",
    ],
  },
  {
    slug: "business-astrology-brief",
    type: "BUSINESS_ASTROLOGY",
    title: "Business Astrology Brief",
    summary:
      "A restrained consultation format for founders, professionals, and business timing conversations.",
    description:
      "A more focused session for leadership transitions, launch timing, strategic reflection, or decision periods that benefit from calm interpretation.",
    durationMinutes: 60,
    priceFromMinor: 26000,
    isFeatured: false,
    sortOrder: 30,
    idealFor: [
      "founder or leadership timing conversations",
      "professional transitions",
      "strategic reflection with discretion",
    ],
  },
  {
    slug: "remedy-guidance-session",
    type: "REMEDY_GUIDANCE",
    title: "Remedy Guidance Session",
    summary:
      "A careful consultation for understanding spiritual remedies with proportion, context, and transparent framing.",
    description:
      "Suitable when you want to discuss remedies with care and avoid fear-based or exaggerated interpretations.",
    durationMinutes: 50,
    priceFromMinor: 14000,
    isFeatured: true,
    sortOrder: 40,
    idealFor: [
      "understanding when a remedy may or may not fit",
      "traditional supports explained responsibly",
      "clarity before adopting a new spiritual practice",
    ],
  },
  {
    slug: "follow-up-clarity-session",
    type: "FOLLOW_UP",
    title: "Follow-Up Clarity Session",
    summary:
      "A shorter session for returning clients who want continuity, refinement, and a more focused second pass.",
    description:
      "Reserved for clients who already have context and need a measured follow-up rather than a full first reading.",
    durationMinutes: 45,
    priceFromMinor: 11000,
    isFeatured: false,
    sortOrder: 50,
    idealFor: [
      "returning clients with prior context",
      "brief follow-up and refinement",
      "targeted questions after a previous consultation",
    ],
  },
] as const;

export const commonBookingTimezones = [
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Australia/Sydney",
] as const;

export const consultationProcess = [
  {
    title: "Choose the right format",
    description:
      "Start with a package that matches the depth and context of the question rather than selecting the longest session by default.",
  },
  {
    title: "Reserve a clear time",
    description:
      "All slots are stored in UTC and then shown back in your own timezone alongside Joy Prakash Sarmah's calendar timezone.",
  },
  {
    title: "Submit a calm intake",
    description:
      "The intake form captures enough context to prepare the consultation without becoming a full CRM workflow.",
  },
  {
    title: "Review the confirmation",
    description:
      "After booking, the dashboard keeps the scheduled time, package, intake summary, and confirmation details in one protected place.",
  },
] as const;

export function getConsultationPackageBySlug(slug: string) {
  return consultationPackages.find((item) => item.slug === slug) ?? null;
}
