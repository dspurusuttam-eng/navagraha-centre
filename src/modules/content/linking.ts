import type { ContentEntry } from "@/modules/content/types";

export type ContentLink = {
  href: string;
  label: string;
  description: string;
};

export type ContentLinkGroup = {
  title: string;
  description: string;
  links: readonly ContentLink[];
};

function baseToolLinks(): readonly ContentLink[] {
  return [
    {
      href: "/kundli",
      label: "Generate Kundli",
      description: "Move from general reading into your protected birth chart.",
    },
    {
      href: "/kundli-ai",
      label: "Ask NAVAGRAHA AI",
      description: "Ask chart-aware questions after chart creation.",
    },
    {
      href: "/reports",
      label: "View Reports",
      description: "Continue into premium report depth when you need more context.",
    },
    {
      href: "/consultation",
      label: "Book Consultation",
      description: "Escalate into human interpretation for nuanced situations.",
    },
  ] as const;
}

export function getEditorialLinkGroups(entry: ContentEntry): ContentLinkGroup[] {
  const sharedLinks = baseToolLinks();
  const groups: ContentLinkGroup[] = [
    {
      title: "Related Astrology Tools",
      description:
        "Use these entry points when the article should lead into chart-aware next steps.",
      links: sharedLinks,
    },
  ];

  if (entry.type === "DAILY_RASHIFAL" || entry.category === "Daily Rashifal") {
    groups.push({
      title: "Daily Guidance Paths",
      description:
        "Daily guidance should connect into sign-level context, Panchang, and consultation when needed.",
      links: [
        {
          href: "/daily-rashifal",
          label: "Daily Rashifal",
          description: "Open the daily public rashifal surface.",
        },
        {
          href: "/rashifal",
          label: "Rashifal Hub",
          description: "Browse the 12-sign horoscope hub.",
        },
        {
          href: "/panchang",
          label: "View Panchang",
          description: "Check timing and daily context before key decisions.",
        },
      ],
    });
  }

  if (entry.category === "Panchang") {
    groups.push({
      title: "Timing And Planning",
      description:
        "Panchang articles benefit from adjacent timing and remedy resources.",
      links: [
        {
          href: "/panchang",
          label: "Open Panchang",
          description: "Review the public Panchang tool.",
        },
        {
          href: "/insights/remedies",
          label: "Browse Remedies",
          description: "Read the remedies library for supportive next steps.",
        },
        {
          href: "/consultation",
          label: "Ask A Question",
          description: "Book consultation if the timing question needs nuance.",
        },
      ],
    });
  }

  if (entry.category === "Remedies" || entry.type === "REMEDIES_ARTICLE") {
    groups.push({
      title: "Remedy And Support Paths",
      description:
        "Remedies should stay optional and connect back to chart understanding.",
      links: [
        {
          href: "/insights/remedies",
          label: "Remedy Articles",
          description: "Read more remedy-oriented editorial guidance.",
        },
        {
          href: "/kundli-ai",
          label: "Use Chart Context",
          description: "Ground the remedy discussion in a saved chart first.",
        },
        {
          href: "/consultation",
          label: "Consult First",
          description: "Escalate to human guidance before acting on a remedy.",
        },
      ],
    });
  }

  if (entry.category === "Vedic Astrology" || entry.type === "BLOG_ARTICLE") {
    groups.push({
      title: "Explore The Editorial Desk",
      description:
        "Move into the authority desk and broader knowledge hubs when you want deeper reading.",
      links: [
        {
          href: "/from-the-desk",
          label: "From the Desk",
          description: "Open the official editorial desk.",
        },
        {
          href: "/articles",
          label: "Articles Index",
          description: "Return to the public article library.",
        },
        {
          href: "/horoscope-hub",
          label: "Horoscope Hub",
          description: "Browse the larger horoscope and rashifal hub.",
        },
      ],
    });
  }

  return groups;
}

