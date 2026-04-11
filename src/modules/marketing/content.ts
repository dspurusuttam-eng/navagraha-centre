export type MarketingHero = {
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
  supportTitle?: string;
};

export type MarketingCard = {
  title: string;
  description: string;
  href?: string;
  label?: string;
};

export type MarketingFaq = {
  question: string;
  answer: string;
};

export const homePage = {
  metadata: {
    title: "Luxury Astrology Consultations and Spiritual Guidance",
    description:
      "Discover NAVAGRAHA CENTRE, a premium astrology house shaped around calm consultation, transparent remedy guidance, and Joy Prakash Sarmah's visible authority.",
    path: "/",
    keywords: [
      "luxury astrology website",
      "premium astrology consultation",
      "Joy Prakash Sarmah astrologer",
      "spiritual remedy guidance",
    ],
  },
  hero: {
    eyebrow: "Luxury Astrology House",
    title: "Calm, precise astrology for discerning modern lives.",
    description:
      "NAVAGRAHA CENTRE is designed as a refined spiritual house where consultation, remedy guidance, editorial insight, and carefully presented products feel grounded, premium, and responsibly framed from the first interaction.",
    highlights: [
      "Public trust built around clear language and careful interpretation",
      "Joy Prakash Sarmah positioned as the visible consulting authority",
      "Remedies and spiritual products framed with restraint, never fear",
    ],
    note: "Every public surface is written to feel premium and reassuring while staying transparent about what guidance can and cannot promise.",
    primaryAction: {
      href: "/contact?intent=general-inquiry",
      label: "Start A Calm Inquiry",
    },
    secondaryAction: {
      href: "/services",
      label: "View Services",
    },
    supportTitle: "Why It Feels Different",
  } satisfies MarketingHero,
  trustPillars: [
    {
      title: "Calm interpretation",
      description:
        "The language stays measured, respectful, and free from sensational claims so visitors feel supported rather than pressured.",
    },
    {
      title: "Visible authority",
      description:
        "Joy Prakash Sarmah is positioned clearly in the public experience so trust comes from authorship, not mystique.",
    },
    {
      title: "Transparent remedies",
      description:
        "Remedies are framed as spiritual supports and reflective practices, not guaranteed outcomes or fear-based prescriptions.",
    },
  ] satisfies MarketingCard[],
  services: [
    {
      title: "Private consultations",
      description:
        "Structured one-to-one sessions for life transitions, timing, and reflective decision support.",
      href: "/consultation?intent=consultation-ready",
      label: "Choose Consultation Format",
    },
    {
      title: "Compatibility readings",
      description:
        "Relationship-focused consultations designed to bring clarity, tone, and perspective to shared dynamics.",
      href: "/consultation?intent=compatibility-focused",
      label: "View Compatibility Path",
    },
    {
      title: "Remedy guidance",
      description:
        "Carefully framed spiritual recommendations with an emphasis on transparency, intention, and proportion.",
      href: "/consultation?intent=remedy-focused",
      label: "View Remedy Guidance Path",
    },
    {
      title: "Spiritual products",
      description:
        "Thoughtfully presented spiritual products and ritual objects chosen with restraint and context.",
      href: "/shop",
      label: "Visit Shop",
    },
  ] satisfies MarketingCard[],
  remedyPrinciples: [
    {
      title: "Grounded language",
      description:
        "Remedies are explained in a grounded, modern tone that respects spiritual practice without leaning on intimidation.",
    },
    {
      title: "Proportion and context",
      description:
        "Suggestions should align to the client's situation and never be presented as absolute requirements.",
    },
    {
      title: "Transparent framing",
      description:
        "The platform avoids claims of certainty and makes space for judgment, reflection, and personal discretion.",
    },
  ] satisfies MarketingCard[],
  faqTeaser: [
    {
      question:
        "What kind of astrology experience does NAVAGRAHA CENTRE offer?",
      answer:
        "A calm, premium consultation experience focused on clarity, interpretation, and thoughtful presentation rather than spectacle.",
    },
    {
      question: "Are remedies presented as guarantees?",
      answer:
        "No. Remedies are described as spiritual supports and reflective practices, not certain outcomes.",
    },
    {
      question: "Can visitors explore spiritual products here as well?",
      answer:
        "Yes. The public shop presents spiritual products with calm merchandising and clear, non-sensational language.",
    },
    {
      question: "Who leads the consultation authority?",
      answer:
        "Joy Prakash Sarmah is positioned as the visible consulting astrologer and public-facing authority behind the platform.",
    },
  ] satisfies MarketingFaq[],
};

export const aboutPage = {
  metadata: {
    title: "About NAVAGRAHA CENTRE",
    description:
      "Learn how NAVAGRAHA CENTRE combines premium editorial design, careful astrology communication, and visible astrologer authority.",
    path: "/about",
    keywords: [
      "about NAVAGRAHA CENTRE",
      "premium astrology brand",
      "modern spiritual platform",
    ],
  },
  hero: {
    eyebrow: "About The House",
    title:
      "A premium spiritual brand built around clarity, restraint, and trust.",
    description:
      "NAVAGRAHA CENTRE is designed to feel more like an editorial house than a template astrology website, with calm guidance, refined presentation, and explicit respect for the client's agency.",
    highlights: [
      "Luxury presentation without occult cliche",
      "Careful communication that protects trust",
      "Architecture shaped for consultations, remedies, and commerce with clear boundaries",
    ],
    note: "The intent is not to dramatize astrology, but to present it with precision, softness, and modern polish.",
    primaryAction: {
      href: "/joy-prakash-sarmah",
      label: "Meet Joy Prakash Sarmah",
    },
    secondaryAction: {
      href: "/services",
      label: "See Services",
    },
  } satisfies MarketingHero,
  values: [
    {
      title: "Editorial clarity",
      description:
        "Every page is designed to feel readable, spacious, and quietly luxurious, so visitors can understand the offering at a glance.",
    },
    {
      title: "Responsible interpretation",
      description:
        "Copy and consultation framing avoid certainty, alarm, and exaggerated promises in favor of balanced, careful language.",
    },
    {
      title: "Visible human authority",
      description:
        "The astrologer's presence is explicit, so trust can anchor in people, approach, and communication style.",
    },
  ] satisfies MarketingCard[],
  promise: [
    {
      title: "What clients can expect",
      description:
        "A premium environment that respects privacy, nuance, and the emotional tone of seeking guidance.",
    },
    {
      title: "What clients will not find",
      description:
        "Fear-based remedy pressure, cluttered mystical theatrics, or language that removes personal judgment.",
    },
  ] satisfies MarketingCard[],
};

export const servicesPage = {
  metadata: {
    title: "Astrology Services",
    description:
      "Explore NAVAGRAHA CENTRE's premium astrology services, consultation formats, and remedy guidance philosophy.",
    path: "/services",
    keywords: [
      "astrology services",
      "premium consultation services",
      "remedy guidance",
      "compatibility astrology",
    ],
  },
  hero: {
    eyebrow: "Services",
    title: "Services shaped for depth, discretion, and calm guidance.",
    description:
      "The service architecture is designed to feel elevated and clearly segmented, so clients can understand the type of guidance they are seeking before they reserve a session.",
    highlights: [
      "Private consultations for personal and professional transitions",
      "Compatibility and relationship-focused interpretation",
      "Remedy guidance framed with proportion and transparency",
    ],
    note: "Each service is framed with clarity so clients can choose the right conversation before they commit to a session.",
    primaryAction: {
      href: "/consultation?intent=consultation-ready",
      label: "Move To Consultation",
    },
    secondaryAction: {
      href: "/joy-prakash-sarmah",
      label: "View Astrologer Profile",
    },
  } satisfies MarketingHero,
  offerings: [
    {
      title: "Private consultation",
      description:
        "For personal transitions, timing questions, and reflective guidance that benefits from a dedicated session.",
    },
    {
      title: "Compatibility reading",
      description:
        "For relationship dynamics, shared timing, and structured compatibility conversations.",
    },
    {
      title: "Remedy consultation",
      description:
        "For clients seeking a careful explanation of spiritual remedies and how to approach them responsibly.",
    },
    {
      title: "Ongoing advisory",
      description:
        "For clients who prefer continuity, measured follow-up, and a more ongoing interpretive relationship.",
    },
  ] satisfies MarketingCard[],
  process: [
    {
      title: "1. Clarify the purpose",
      description:
        "The first step is understanding the nature of the question, the level of depth required, and the right consultation format.",
    },
    {
      title: "2. Interpret with care",
      description:
        "Interpretation should be thoughtful, human, and attentive to nuance rather than dramatic or overconfident.",
    },
    {
      title: "3. Frame remedies responsibly",
      description:
        "If remedies are relevant, they are explained with proportion, transparency, and no language of certainty.",
    },
    {
      title: "4. Close with clarity",
      description:
        "The client should leave with a clearer sense of perspective, emphasis, and next steps for reflection.",
    },
  ] satisfies MarketingCard[],
};

export const astrologerPage = {
  metadata: {
    title: "Joy Prakash Sarmah",
    description:
      "Meet Joy Prakash Sarmah, the visible consulting astrologer behind NAVAGRAHA CENTRE's calm, premium public experience.",
    path: "/joy-prakash-sarmah",
    keywords: [
      "Joy Prakash Sarmah",
      "consulting astrologer",
      "premium astrology guidance",
    ],
  },
  hero: {
    eyebrow: "Consulting Astrologer",
    title:
      "Joy Prakash Sarmah is positioned as the human authority behind the work.",
    description:
      "The profile is designed to foreground calm authority, measured interpretation, and a consultation style that values trust, discretion, and responsible spiritual language.",
    highlights: [
      "Visible authorship rather than anonymous platform voice",
      "Interpretation led by care, discretion, and tone",
      "Remedies framed as guidance, not guarantees",
    ],
    note: "This page emphasizes approach, public trust, and a measured consultation voice.",
    primaryAction: {
      href: "/consultation?intent=consultation-ready",
      label: "Move To Consultation",
    },
    secondaryAction: {
      href: "/consultation?intent=returning-member-follow-up",
      label: "Returning Member Follow-Up",
    },
    supportTitle: "Public Profile",
  } satisfies MarketingHero,
  profileCards: [
    {
      title: "Consultation style",
      description:
        "Quiet, attentive, and structured for clients who value reflection over theatrics.",
    },
    {
      title: "Communication tone",
      description:
        "Clear language that respects emotional nuance without leaning into fear or absolutes.",
    },
    {
      title: "Remedy philosophy",
      description:
        "Recommendations are best presented as spiritual supports and reflective practices, not promises of certainty.",
    },
  ] satisfies MarketingCard[],
  focusAreas: [
    {
      title: "Life transitions",
      description:
        "Guidance around periods of change, timing, and recalibration.",
    },
    {
      title: "Relationship dynamics",
      description:
        "Compatibility and partnership conversations approached with care and proportion.",
    },
    {
      title: "Remedy interpretation",
      description:
        "Thoughtful explanation of when a spiritual recommendation may or may not be appropriate.",
    },
  ] satisfies MarketingCard[],
};

export const contactPage = {
  metadata: {
    title: "Contact NAVAGRAHA CENTRE",
    description:
      "Contact NAVAGRAHA CENTRE for consultation inquiries, service questions, and spiritual product interest.",
    path: "/contact",
    keywords: [
      "contact astrology consultation",
      "NAVAGRAHA CENTRE contact",
      "consultation inquiry",
    ],
  },
  hero: {
    eyebrow: "Contact",
    title: "Begin the conversation with calm, clear expectations.",
    description:
      "The contact experience is designed to feel composed and premium. Visitors can understand the right next step for consultations, remedy questions, and product interest without being pushed into noisy or overly transactional UX.",
    highlights: [
      "Clear next steps for consultation, product, and service questions",
      "Contact language stays calm, discreet, and trust-building",
      "Every route keeps expectations explicit and measured",
    ],
    note: "The centre favors clear next steps, careful review, and direct human handling over noisy friction.",
    primaryAction: {
      href: "/services",
      label: "Review Services",
    },
    secondaryAction: {
      href: "/joy-prakash-sarmah",
      label: "View Astrologer Profile",
    },
    supportTitle: "Inquiry Principles",
  } satisfies MarketingHero,
  inquiryCards: [
    {
      title: "Consultation requests",
      description:
        "Use this route for private consultation interest and questions about the right service fit.",
    },
    {
      title: "Remedy questions",
      description:
        "Share context for remedy-related inquiries so the centre can respond with appropriate discretion.",
    },
    {
      title: "Shop and product interest",
      description:
        "Use this route when you need guidance on product fit, ritual context, or catalog selection.",
    },
  ] satisfies MarketingCard[],
};
