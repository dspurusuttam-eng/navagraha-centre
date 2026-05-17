export type ToolsNavigationItem = {
  key: string;
  label: string;
  href: string;
  description: string;
};

export type ToolsNavigationGroup = {
  key: string;
  title: string;
  description: string;
  items: readonly ToolsNavigationItem[];
};

export type ToolsNavigationModel = {
  allToolsHref: string;
  popularTools: readonly ToolsNavigationItem[];
  groups: readonly ToolsNavigationGroup[];
};

type RawToolsNavigationItem = Omit<ToolsNavigationItem, "href"> & {
  href: string;
};

type RawToolsNavigationGroup = Omit<ToolsNavigationGroup, "items"> & {
  items: readonly RawToolsNavigationItem[];
};

const rawToolsGroups: readonly RawToolsNavigationGroup[] = [
  {
    key: "birth-chart",
    title: "Birth & Chart",
    description: "Chart foundation, intelligence support, and time-period context.",
    items: [
      {
        key: "kundli",
        label: "Kundli",
        href: "/kundli",
        description: "Generate the primary Vedic birth chart.",
      },
      {
        key: "ask-ni",
        label: "Ask NI",
        href: "/ai",
        description: "Open NAVAGRAHA Intelligence guidance.",
      },
      {
        key: "dasha",
        label: "Dasha",
        href: "/dasha",
        description: "Review time-period guidance.",
      },
      {
        key: "transit",
        label: "Transit",
        href: "/transit",
        description: "Check current Gochar context.",
      },
    ],
  },
  {
    key: "daily-guidance",
    title: "Daily Guidance",
    description: "Daily timing and guidance surfaces for repeat use.",
    items: [
      {
        key: "panchang",
        label: "Panchang",
        href: "/panchang",
        description: "Open daily timing context.",
      },
      {
        key: "rashifal",
        label: "Rashifal",
        href: "/rashifal",
        description: "Read daily zodiac guidance.",
      },
      {
        key: "muhurat",
        label: "Muhurat",
        href: "/muhurat",
        description: "Open planning and timing tools.",
      },
    ],
  },
  {
    key: "timing-muhurat",
    title: "Timing & Muhurat",
    description: "Planning utilities for auspicious timing decisions.",
    items: [
      {
        key: "timing-muhurat",
        label: "Muhurat",
        href: "/muhurat",
        description: "Use event timing support.",
      },
      {
        key: "timing-panchang",
        label: "Panchang",
        href: "/panchang",
        description: "Check daily Panchang context.",
      },
      {
        key: "timing-transit",
        label: "Transit",
        href: "/transit",
        description: "Review planetary movement.",
      },
    ],
  },
  {
    key: "relationship",
    title: "Relationship",
    description: "Compatibility and relationship decision support.",
    items: [
      {
        key: "matchmaking",
        label: "Matchmaking",
        href: "/matchmaking",
        description: "Open compatibility review.",
      },
    ],
  },
  {
    key: "karma-dosha-remedy",
    title: "Karma / Dosha / Remedy",
    description: "Dosha, yoga, and optional remedy pathways.",
    items: [
      {
        key: "dosha-yoga",
        label: "Dosha Yoga",
        href: "/dosha-yoga",
        description: "Review dosha and yoga indicators.",
      },
      {
        key: "remedies",
        label: "Remedies",
        href: "/remedies",
        description: "Open guidance and remedy pathways.",
      },
    ],
  },
  {
    key: "number-occult",
    title: "Number & Occult",
    description: "Numerology and secondary occult utility entry.",
    items: [
      {
        key: "numerology",
        label: "Numerology",
        href: "/numerology",
        description: "Explore numbers and name energy.",
      },
    ],
  },
  {
    key: "authority-learning",
    title: "Authority & Learning",
    description: "Reports, human guidance, and verified learning surfaces.",
    items: [
      {
        key: "reports",
        label: "Reports",
        href: "/reports",
        description: "Explore digital report pathways.",
      },
      {
        key: "consultation",
        label: "Consultation",
        href: "/consultation",
        description: "Book human guidance.",
      },
      {
        key: "articles",
        label: "Articles",
        href: "/articles",
        description: "Read verified content.",
      },
      {
        key: "from-the-desk",
        label: "J P Sarmah Desk",
        href: "/from-the-desk",
        description: "Read the single human authority desk.",
      },
    ],
  },
] as const;

const popularToolKeys = [
  "kundli",
  "panchang",
  "rashifal",
  "ask-ni",
  "matchmaking",
  "dasha",
  "transit",
  "muhurat",
] as const;

export function buildLocalizedToolsNavigation(
  localizeHref: (href: string) => string,
): ToolsNavigationModel {
  const groups = rawToolsGroups.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      href: localizeHref(item.href),
    })),
  }));
  const toolsByKey = new Map(
    groups.flatMap((group) => group.items.map((item) => [item.key, item] as const)),
  );
  const popularTools = popularToolKeys
    .map((key) => toolsByKey.get(key))
    .filter((item): item is ToolsNavigationItem => Boolean(item));

  return {
    allToolsHref: localizeHref("/tools"),
    popularTools,
    groups,
  };
}
