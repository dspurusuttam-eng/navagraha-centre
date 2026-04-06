import type { ContentEntry, ContentType } from "@/modules/content/types";

export const contentTypeLabels: Record<ContentType, string> = {
  BLOG_ARTICLE: "Editorial Journal",
  DAILY_HOROSCOPE: "Daily Horoscope",
  MONTHLY_FORECAST: "Monthly Forecast",
  REMEDIES_ARTICLE: "Remedies Article",
  SERVICE_PAGE: "Service Guide",
  FAQ_PAGE: "FAQ Page",
};

export const contentTypeDescriptions: Record<ContentType, string> = {
  BLOG_ARTICLE:
    "Longer-form editorial pieces that build trust, tone, and authority around the platform's public philosophy.",
  DAILY_HOROSCOPE:
    "Short-form daily guidance content designed for cadence, reflection, and future editorial scheduling.",
  MONTHLY_FORECAST:
    "Calendar-based editorial outlook pieces that can support seasonal ranking without becoming filler.",
  REMEDIES_ARTICLE:
    "Educational content about remedies, caution, and discernment that keeps language transparent and grounded.",
  SERVICE_PAGE:
    "Search-friendly service explainers that clarify how consultations, process, and expectations are structured.",
  FAQ_PAGE:
    "Evergreen FAQ content designed for rich results, trust building, and careful operational clarity.",
};

const joyPrakashSarmah = {
  name: "Joy Prakash Sarmah",
  title: "Consulting Astrologer",
  bio: "Joy Prakash Sarmah leads the interpretive authority of NAVAGRAHA CENTRE with a calm, consultation-led approach to astrology and spiritual guidance.",
} as const;

const editorialReviewer = {
  name: "NAVAGRAHA CENTRE Editorial Review",
  title: "Human Editorial Review",
  bio: "Every published content record is intended to pass through human review so tone, caution, and factual boundaries remain aligned with the platform's standards.",
} as const;

export const curatedContentEntries: readonly ContentEntry[] = [
  {
    slug: "understanding-premium-consultation-journeys",
    path: "/insights/understanding-premium-consultation-journeys",
    type: "BLOG_ARTICLE",
    status: "published",
    title: "Understanding Premium Consultation Journeys",
    excerpt:
      "A clearer look at how a premium astrology consultation should feel: composed, precise, and responsibly framed from first contact to follow-up.",
    description:
      "Explore how NAVAGRAHA CENTRE frames premium astrology consultations with clarity, discretion, calm language, and human authority.",
    keywords: [
      "premium astrology consultation",
      "astrology process",
      "Joy Prakash Sarmah",
    ],
    publishedAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-04-06T00:00:00.000Z",
    readingTimeMinutes: 5,
    heroEyebrow: "Editorial Journal",
    heroHighlights: [
      "Consultation design should reduce anxiety, not create it",
      "Premium tone comes from clarity, spacing, and calm authorship",
      "Remedies belong inside discernment, not urgency",
    ],
    heroNote:
      "This article is part of the long-term editorial foundation and is written for authority, trust, and search value rather than clickbait volume.",
    author: joyPrakashSarmah,
    reviewer: editorialReviewer,
    sections: [
      {
        title: "Why consultation tone matters",
        paragraphs: [
          "Many astrology experiences feel noisy before the first meaningful sentence has even landed. A premium consultation journey should do the opposite. It should create calm, orient the client, and make clear what the conversation is meant to help with.",
          "That tone matters because people usually arrive during moments of uncertainty. The platform should not multiply that uncertainty with clutter, alarm, or mystical excess.",
        ],
      },
      {
        title: "What a premium journey should include",
        paragraphs: [
          "A well-structured consultation path should clarify the purpose of the session, the role of birth data, the kind of interpretation a client can expect, and how follow-up will be handled.",
          "It should also keep authorship visible. Trust grows more naturally when the astrologer is clearly present, rather than buried behind anonymous platform language.",
        ],
      },
      {
        title: "How remedies should be introduced",
        paragraphs: [
          "Remedies, when relevant, should appear as optional spiritual supports rather than mandatory purchases or fear-driven requirements.",
          "That distinction is essential for long-term authority. Strong brands do not rely on pressure to convert trust into action.",
        ],
      },
    ],
    relatedSlugs: [
      "how-private-consultations-are-structured",
      "how-to-approach-remedies-with-discernment",
    ],
    aiDraftReady: true,
    autoPublish: false,
  },
  {
    slug: "daily-horoscope-april-6-2026",
    path: "/insights/daily-horoscope-april-6-2026",
    type: "DAILY_HOROSCOPE",
    status: "published",
    title: "Daily Horoscope Editorial Note for April 6, 2026",
    excerpt:
      "A calm daily editorial note for pacing, reflection, and steadier decision-making at the start of the week.",
    description:
      "Read NAVAGRAHA CENTRE's editorial daily horoscope note for April 6, 2026 with calm, reflective guidance.",
    keywords: [
      "daily horoscope",
      "astrology editorial note",
      "April 6 2026 horoscope",
    ],
    publishedAt: "2026-04-06T00:00:00.000Z",
    updatedAt: "2026-04-06T00:00:00.000Z",
    readingTimeMinutes: 3,
    heroEyebrow: "Daily Horoscope",
    heroHighlights: [
      "A short-form content type ready for editorial cadence later",
      "Written as reflective guidance, not deterministic promise",
      "Suitable for human review before any future assisted drafting",
    ],
    heroNote:
      "Daily pieces are kept intentionally disciplined so future publishing cadence does not slip into filler or automation-first content.",
    author: joyPrakashSarmah,
    reviewer: editorialReviewer,
    sections: [
      {
        title: "Theme of the day",
        paragraphs: [
          "The day favors steadier pacing over dramatic initiative. If a decision can be clarified through one more round of observation, that extra patience may improve both tone and timing.",
          "Conversations are likely to go better when they begin from clarity rather than urgency.",
        ],
      },
      {
        title: "Where to place attention",
        paragraphs: [
          "Return to what is already underway before reaching for something new. A practical correction, a quieter response, or a more measured boundary may have more value than expansion.",
        ],
      },
      {
        title: "What to avoid",
        paragraphs: [
          "Avoid letting a temporary emotional spike define the entire day. The most useful posture now is calm adjustment, not overreaction.",
        ],
      },
    ],
    relatedSlugs: ["april-2026-monthly-forecast"],
    aiDraftReady: true,
    autoPublish: false,
  },
  {
    slug: "april-2026-monthly-forecast",
    path: "/insights/april-2026-monthly-forecast",
    type: "MONTHLY_FORECAST",
    status: "published",
    title: "Monthly Forecast for April 2026",
    excerpt:
      "An editorial monthly forecast focused on steadier pacing, selective commitment, and calm structural decisions for the month ahead.",
    description:
      "Review the NAVAGRAHA CENTRE monthly forecast for April 2026 with calm editorial guidance and premium presentation.",
    keywords: [
      "monthly forecast",
      "April 2026 astrology forecast",
      "premium astrology editorial",
    ],
    publishedAt: "2026-04-01T00:00:00.000Z",
    updatedAt: "2026-04-06T00:00:00.000Z",
    readingTimeMinutes: 6,
    heroEyebrow: "Monthly Forecast",
    heroHighlights: [
      "A recurring content format that supports seasonality and search depth",
      "Structured for reflective planning rather than sensational prediction",
      "Built to support future human-reviewed draft workflows",
    ],
    heroNote:
      "Monthly forecast content should deepen authority over time, not chase short-term traffic through exaggerated claims.",
    author: joyPrakashSarmah,
    reviewer: editorialReviewer,
    sections: [
      {
        title: "The wider tone of April",
        paragraphs: [
          "April favors consolidation more than spectacle. There is more value in clarifying what is already in motion than in forcing a dramatic new direction before the foundations are ready.",
          "That makes the month especially useful for structure, review, and selective commitment.",
        ],
      },
      {
        title: "Relationships and communication",
        paragraphs: [
          "Relational clarity will depend less on intensity and more on consistency. A softer tone paired with firmer language may serve better than emotional overstatement.",
          "Where conversations feel delayed, patience may reveal more than pressure.",
        ],
      },
      {
        title: "Practice and discipline",
        paragraphs: [
          "April is well suited to simple disciplines that can be sustained. Measured morning routines, repeated prayer, or a restrained spiritual rhythm are more valuable than dramatic effort that cannot last.",
        ],
      },
    ],
    relatedSlugs: [
      "daily-horoscope-april-6-2026",
      "how-to-approach-remedies-with-discernment",
    ],
    aiDraftReady: true,
    autoPublish: false,
  },
  {
    slug: "how-to-approach-remedies-with-discernment",
    path: "/insights/how-to-approach-remedies-with-discernment",
    type: "REMEDIES_ARTICLE",
    status: "published",
    title: "How To Approach Remedies With Discernment",
    excerpt:
      "A practical editorial guide to approaching remedies without fear, urgency, or unsupported certainty.",
    description:
      "Learn how NAVAGRAHA CENTRE frames remedies carefully, transparently, and without fear-based language or unsupported claims.",
    keywords: [
      "astrology remedies",
      "remedy guidance",
      "spiritual remedies with discernment",
    ],
    publishedAt: "2026-03-12T00:00:00.000Z",
    updatedAt: "2026-04-06T00:00:00.000Z",
    readingTimeMinutes: 5,
    heroEyebrow: "Remedies Article",
    heroHighlights: [
      "Remedies should remain optional spiritual supports",
      "Pressure and certainty both erode trust",
      "Educational content is stronger than product-first persuasion",
    ],
    heroNote:
      "This content type helps long-term SEO by answering recurring remedy questions in a responsible, evergreen way.",
    author: joyPrakashSarmah,
    reviewer: editorialReviewer,
    sections: [
      {
        title: "Why remedy framing matters",
        paragraphs: [
          "Clients often encounter remedies when they already feel vulnerable. That is why remedy language must be especially careful. If the explanation leans on fear, urgency, or transaction-first pressure, trust erodes immediately.",
          "A remedy should be described as a possible support within a wider spiritual and practical context, not as a guarantee.",
        ],
      },
      {
        title: "What responsible guidance sounds like",
        paragraphs: [
          "Responsible guidance explains the purpose, limits, and optional nature of a remedy. It makes room for health, budget, tradition, and personal readiness.",
          "It also acknowledges when something requires review rather than instant adoption, especially in areas such as gemstones or formal ritual.",
        ],
      },
      {
        title: "How the platform applies this principle",
        paragraphs: [
          "NAVAGRAHA CENTRE keeps approved remedy records curated, human-reviewed, and connected to structured chart signals. Even where related products are shown, they appear as optional catalog records, not as mandatory purchases.",
        ],
      },
    ],
    relatedSlugs: [
      "understanding-premium-consultation-journeys",
      "guidance-and-remedies-frequently-asked-questions",
    ],
    aiDraftReady: true,
    autoPublish: false,
  },
  {
    slug: "how-private-consultations-are-structured",
    path: "/insights/how-private-consultations-are-structured",
    type: "SERVICE_PAGE",
    status: "published",
    title: "How Private Consultations Are Structured",
    excerpt:
      "A service-oriented explainer covering what private consultations include, how intake works, and what clients can expect from the process.",
    description:
      "Understand how NAVAGRAHA CENTRE structures private consultations, intake, scheduling, and follow-up with Joy Prakash Sarmah.",
    keywords: [
      "private astrology consultation",
      "consultation intake",
      "Joy Prakash Sarmah booking",
    ],
    publishedAt: "2026-03-20T00:00:00.000Z",
    updatedAt: "2026-04-06T00:00:00.000Z",
    readingTimeMinutes: 4,
    heroEyebrow: "Service Guide",
    heroHighlights: [
      "Designed for clients who want operational clarity before booking",
      "Pairs evergreen service intent with long-term search value",
      "Supports future CMS and draft workflows without changing the route contract",
    ],
    heroNote:
      "Service explainers help the public site rank on intent-driven queries while keeping expectations clear and humane.",
    author: joyPrakashSarmah,
    reviewer: editorialReviewer,
    sections: [
      {
        title: "Before the session",
        paragraphs: [
          "The intake stage is meant to gather context, not overwhelm the client. Birth details, topic focus, language preference, and timezone are collected so the consultation begins with clarity.",
        ],
      },
      {
        title: "During the consultation",
        paragraphs: [
          "A private consultation is designed to be measured, specific, and human-led. The session should clarify themes, timing, and perspective without making fear-based claims or removing personal judgment.",
        ],
      },
      {
        title: "After the session",
        paragraphs: [
          "If remedies or follow-up points are relevant, they should be framed transparently. The goal is to leave the client with clarity and proportion, not emotional dependence.",
        ],
      },
    ],
    relatedSlugs: ["understanding-premium-consultation-journeys"],
    aiDraftReady: true,
    autoPublish: false,
  },
  {
    slug: "guidance-and-remedies-frequently-asked-questions",
    path: "/insights/guidance-and-remedies-frequently-asked-questions",
    type: "FAQ_PAGE",
    status: "published",
    title: "Guidance And Remedies Frequently Asked Questions",
    excerpt:
      "An evergreen FAQ page covering consultation tone, remedies, certainty, and what clients can reasonably expect from guidance.",
    description:
      "Read frequently asked questions about consultations, remedies, and guidance at NAVAGRAHA CENTRE.",
    keywords: ["astrology faq", "remedy faq", "consultation questions"],
    publishedAt: "2026-03-28T00:00:00.000Z",
    updatedAt: "2026-04-06T00:00:00.000Z",
    readingTimeMinutes: 4,
    heroEyebrow: "FAQ Page",
    heroHighlights: [
      "Evergreen question-and-answer content for SEO and trust",
      "Suitable for structured data rich results where appropriate",
      "Written to clarify limits as much as benefits",
    ],
    heroNote:
      "FAQ content should answer recurring questions cleanly without slipping into aggressive conversion tactics or shallow repetition.",
    author: joyPrakashSarmah,
    reviewer: editorialReviewer,
    sections: [
      {
        title: "What this page is for",
        paragraphs: [
          "This page exists to answer recurring questions about consultations, remedies, and content boundaries in a direct, evergreen format.",
        ],
      },
    ],
    faqItems: [
      {
        question: "Are remedies presented as guarantees?",
        answer:
          "No. Remedies are framed as optional spiritual supports and should never be treated as guarantees of life outcomes.",
      },
      {
        question: "Does the platform use AI to calculate chart mathematics?",
        answer:
          "No. Chart calculations remain inside the deterministic astrology provider layer. AI is limited to interpretation of structured chart data.",
      },
      {
        question: "Can I book Joy Prakash Sarmah directly?",
        answer:
          "Yes. The consultation flow is centered on Joy Prakash Sarmah and the booking path keeps that authorship visible.",
      },
      {
        question: "Will future drafts be auto-published?",
        answer:
          "No. The content system is being prepared for assisted drafting later, but publication still requires deliberate human review.",
      },
    ],
    relatedSlugs: [
      "how-private-consultations-are-structured",
      "how-to-approach-remedies-with-discernment",
    ],
    aiDraftReady: true,
    autoPublish: false,
  },
] as const;
