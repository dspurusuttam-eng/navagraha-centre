import type { ContentEntry, ContentType } from "@/modules/content/types";

export const contentTypeLabels: Record<ContentType, string> = {
  BLOG_ARTICLE: "Editorial Journal",
  DAILY_RASHIFAL: "Daily Rashifal",
  DAILY_HOROSCOPE: "Daily Horoscope",
  MONTHLY_FORECAST: "Monthly Forecast",
  REMEDIES_ARTICLE: "Remedies Article",
  SERVICE_PAGE: "Service Guide",
  FAQ_PAGE: "FAQ Page",
};

export const contentTypeDescriptions: Record<ContentType, string> = {
  BLOG_ARTICLE:
    "Longer-form editorial pieces that build trust, tone, and authority around the platform's public philosophy.",
  DAILY_RASHIFAL:
    "Manual zodiac-wise daily publishing format with structured love, career, business, and lucky indicators.",
  DAILY_HOROSCOPE:
    "Short-form daily guidance content designed for cadence, reflection, and editorial consistency.",
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
  name: "J P Sarmah",
  title: "Vedic Astrologer and Spiritual Guide",
  bio: "J P Sarmah leads the interpretive authority of NAVAGRAHA CENTRE with a calm, consultation-led approach to astrology and spiritual guidance.",
} as const;

const editorialReviewer = {
  name: "NAVAGRAHA CENTRE Editorial Review",
  title: "Human Editorial Review",
  bio: "Every published content record is intended to pass through human review so tone, caution, and factual boundaries remain aligned with the platform's standards.",
} as const;

export const curatedContentEntries: readonly ContentEntry[] = [
  {
    id: "desk-001",
    slug: "understanding-premium-consultation-journeys",
    path: "/from-the-desk/understanding-premium-consultation-journeys",
    category: "Vedic Astrology",
    tags: ["consultation", "authority", "guidance"],
    type: "BLOG_ARTICLE",
    status: "published",
    title: "Understanding Premium Consultation Journeys",
    excerpt:
      "A clearer look at how a premium astrology consultation should feel: composed, precise, and responsibly framed from first contact to follow-up.",
    description:
      "Explore how NAVAGRAHA CENTRE frames premium astrology consultations with clarity, discretion, calm language, and human authority.",
    content:
      "A premium consultation should calm the client, clarify purpose, and define follow-up with transparent expectations.",
    seoTitle:
      "From the Desk of J P Sarmah | Understanding Premium Consultation Journeys",
    seoDescription:
      "Learn how premium Vedic astrology consultations are structured at NAVAGRAHA CENTRE with clarity, trust, and human guidance.",
    canonicalUrl:
      "https://navagrahacentre.com/from-the-desk/understanding-premium-consultation-journeys",
    isFeatured: true,
    keywords: [
      "premium astrology consultation",
      "astrology process",
      "Joy Prakash Sarmah",
    ],
    publishedAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-04-06T00:00:00.000Z",
    readingTime: "5 min read",
    readingTimeMinutes: 5,
    authorName: joyPrakashSarmah.name,
    authorTitle: "Vedic Astrologer and Spiritual Guide",
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
    id: "desk-002",
    slug: "daily-horoscope-april-6-2026",
    path: "/from-the-desk/daily-horoscope-april-6-2026",
    category: "Daily Rashifal",
    tags: ["daily", "cadence", "horoscope"],
    type: "DAILY_HOROSCOPE",
    status: "published",
    title: "Daily Horoscope Editorial Note for April 6, 2026",
    excerpt:
      "A calm daily editorial note for pacing, reflection, and steadier decision-making at the start of the week.",
    description:
      "Read NAVAGRAHA CENTRE's editorial daily horoscope note for April 6, 2026 with calm, reflective guidance.",
    content:
      "A concise daily editorial note focused on pacing, communication quality, and emotional steadiness.",
    seoTitle:
      "From the Desk of J P Sarmah | Daily Horoscope Editorial Note for April 6, 2026",
    seoDescription:
      "A calm editorial daily horoscope note from NAVAGRAHA CENTRE for practical decision pacing and reflective guidance.",
    canonicalUrl:
      "https://navagrahacentre.com/from-the-desk/daily-horoscope-april-6-2026",
    isFeatured: false,
    keywords: [
      "daily horoscope",
      "astrology editorial note",
      "April 6 2026 horoscope",
    ],
    publishedAt: "2026-04-06T00:00:00.000Z",
    updatedAt: "2026-04-06T00:00:00.000Z",
    readingTime: "3 min read",
    readingTimeMinutes: 3,
    authorName: joyPrakashSarmah.name,
    authorTitle: "Vedic Astrologer and Spiritual Guide",
    heroEyebrow: "Daily Horoscope",
    heroHighlights: [
      "A short-form format maintained with steady editorial cadence",
      "Written as reflective guidance, not deterministic promise",
      "Reviewed with the same tone and safety standards as long-form pieces",
    ],
    heroNote:
      "Daily pieces are kept intentionally disciplined so the library remains calm, useful, and high-signal.",
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
    id: "desk-003",
    slug: "daily-rashifal-26-april-2026",
    path: "/from-the-desk/daily-rashifal-26-april-2026",
    category: "Daily Rashifal",
    tags: ["daily-rashifal", "zodiac", "manual-publishing"],
    type: "DAILY_RASHIFAL",
    status: "published",
    title: "Daily Rashifal - 26 April 2026",
    excerpt:
      "Manual zodiac-wise daily Rashifal published from the official desk with structured love, career, business, lucky indicators, and remedies.",
    description:
      "Read the official NAVAGRAHA CENTRE daily Rashifal for 26 April 2026 with all twelve zodiac updates and practical remedy notes.",
    content:
      "This daily Rashifal is manually prepared with 12 zodiac sections, structured guidance blocks, and supportive remedy cues.",
    seoTitle:
      "From the Desk of J P Sarmah | Daily Rashifal 26 April 2026",
    seoDescription:
      "Official daily Rashifal from NAVAGRAHA CENTRE for 26 April 2026 with zodiac-wise guidance, lucky indicators, and remedies.",
    canonicalUrl:
      "https://navagrahacentre.com/from-the-desk/daily-rashifal-26-april-2026",
    isFeatured: true,
    keywords: ["daily rashifal", "today rashifal", "zodiac forecast"],
    publishedAt: "2026-04-26T00:00:00.000Z",
    updatedAt: "2026-04-26T00:00:00.000Z",
    readingTime: "9 min read",
    readingTimeMinutes: 9,
    authorName: "J P Sarmah",
    authorTitle: "Vedic Astrologer and Spiritual Guide",
    heroEyebrow: "From the Desk of J P Sarmah",
    heroHighlights: [
      "Manual publishing format for all 12 zodiac signs.",
      "Clear love, career, and business blocks per sign.",
      "Lucky color, number, time, and remedy cues included.",
    ],
    heroNote:
      "Prepared as a daily editorial guidance record. This is guidance, not a guaranteed life outcome.",
    author: joyPrakashSarmah,
    reviewer: editorialReviewer,
    sections: [
      {
        title: "Daily Editorial Note",
        paragraphs: [
          "Today's Rashifal is prepared manually to preserve depth and equal coverage for each zodiac sign.",
          "Use these signals as reflective guidance for planning, communication, and disciplined decisions.",
        ],
      },
    ],
    dailyRashifal: {
      date: "2026-04-26",
      zodiacSections: [
        {
          sign: "aries",
          title: "Aries",
          overview:
            "Energy is steady when actions stay focused and communication remains measured.",
          love: "Emotional clarity improves through calm listening.",
          career: "Prioritize pending deliverables over new expansion.",
          business: "Keep risk moderate and review commitments before closing.",
          luckyColor: "Saffron Gold",
          luckyNumber: "9",
          luckyTime: "08:10 AM - 09:20 AM",
          remedy: "Offer brief sunrise prayer and avoid reactive speech.",
        },
        {
          sign: "taurus",
          title: "Taurus",
          overview:
            "Stable routines and practical budgeting create stronger confidence.",
          love: "Speak directly but softly to avoid avoidable friction.",
          career: "Complete core tasks before taking additional responsibility.",
          business: "Short-cycle planning gives better control than long speculation.",
          luckyColor: "Ivory",
          luckyNumber: "6",
          luckyTime: "10:40 AM - 11:35 AM",
          remedy: "Light a ghee diya in the evening with gratitude.",
        },
        {
          sign: "gemini",
          title: "Gemini",
          overview:
            "Thought flow is high; structure your priorities to prevent dispersion.",
          love: "Consistency in tone matters more than volume of words.",
          career: "Documentation and review tasks are favored today.",
          business: "Validate details before verbal commitments.",
          luckyColor: "Warm Yellow",
          luckyNumber: "5",
          luckyTime: "12:15 PM - 01:10 PM",
          remedy: "Read a short wisdom verse before key conversations.",
        },
        {
          sign: "cancer",
          title: "Cancer",
          overview:
            "Emotional steadiness supports clearer home and work decisions.",
          love: "Offer reassurance through simple, practical gestures.",
          career: "Avoid overpersonalizing feedback; stay task-centered.",
          business: "Choose dependable execution over aggressive scaling.",
          luckyColor: "Pearl White",
          luckyNumber: "2",
          luckyTime: "02:20 PM - 03:10 PM",
          remedy: "Water a sacred plant in the morning mindfully.",
        },
        {
          sign: "leo",
          title: "Leo",
          overview:
            "Leadership quality rises when confidence is paired with patience.",
          love: "Warmth with humility opens better dialogue.",
          career: "Visible responsibility is favorable if backed by preparation.",
          business: "Review pricing and positioning before announcements.",
          luckyColor: "Soft Orange",
          luckyNumber: "1",
          luckyTime: "03:40 PM - 04:30 PM",
          remedy: "Offer water to the Sun with a calm intention.",
        },
        {
          sign: "virgo",
          title: "Virgo",
          overview:
            "Precision helps, but avoid perfection delays in practical tasks.",
          love: "Use kind clarity rather than corrective tone.",
          career: "Analysis and quality checks bring strong outcomes.",
          business: "Lean process improvements yield better momentum.",
          luckyColor: "Olive Green",
          luckyNumber: "5",
          luckyTime: "09:10 AM - 10:05 AM",
          remedy: "Maintain a brief journal entry before sleep.",
        },
        {
          sign: "libra",
          title: "Libra",
          overview:
            "Balance is restored through structured choices and clear boundaries.",
          love: "Fairness in communication heals pending tension.",
          career: "Partnership coordination is favored today.",
          business: "Negotiate with patience and documented clarity.",
          luckyColor: "Rose Beige",
          luckyNumber: "6",
          luckyTime: "11:55 AM - 12:40 PM",
          remedy: "Chant a peace mantra for a few minutes.",
        },
        {
          sign: "scorpio",
          title: "Scorpio",
          overview:
            "Depth supports transformation when emotions are processed calmly.",
          love: "Share concerns directly without testing the other person.",
          career: "Strategic tasks and confidential planning are favored.",
          business: "Avoid impulsive financial commitments.",
          luckyColor: "Maroon",
          luckyNumber: "8",
          luckyTime: "04:45 PM - 05:30 PM",
          remedy: "Observe silence for a short evening interval.",
        },
        {
          sign: "sagittarius",
          title: "Sagittarius",
          overview:
            "Learning, values, and direction-setting gain momentum today.",
          love: "Shared purpose strengthens emotional alignment.",
          career: "Mentorship and planning conversations are positive.",
          business: "Long-term positioning benefits from disciplined review.",
          luckyColor: "Honey Gold",
          luckyNumber: "3",
          luckyTime: "07:20 AM - 08:05 AM",
          remedy: "Read a spiritual text passage with focus.",
        },
        {
          sign: "capricorn",
          title: "Capricorn",
          overview:
            "Responsibility remains high; pacing and discipline keep progress steady.",
          love: "Practical support communicates care effectively.",
          career: "Execution quality is your strongest advantage today.",
          business: "Avoid overextension; protect working capital.",
          luckyColor: "Smoke Gray",
          luckyNumber: "8",
          luckyTime: "01:30 PM - 02:15 PM",
          remedy: "Offer service to an elder or mentor respectfully.",
        },
        {
          sign: "aquarius",
          title: "Aquarius",
          overview:
            "Networks and future planning gain clarity with practical prioritization.",
          love: "Give space while maintaining emotional availability.",
          career: "Collaborative projects move well with clear role mapping.",
          business: "Community-driven offers need sharper execution details.",
          luckyColor: "Sky Blue",
          luckyNumber: "4",
          luckyTime: "05:40 PM - 06:20 PM",
          remedy: "Practice one conscious breathing cycle before decisions.",
        },
        {
          sign: "pisces",
          title: "Pisces",
          overview:
            "Intuition is useful when grounded in realistic timelines.",
          love: "Gentle honesty supports trust and peace.",
          career: "Creative output improves with fixed time blocks.",
          business: "Avoid ambiguity in agreements and payment terms.",
          luckyColor: "Sea Green",
          luckyNumber: "7",
          luckyTime: "06:50 AM - 07:35 AM",
          remedy: "Offer water with gratitude before morning work.",
        },
      ],
      remedies: [
        "Keep speech measured and avoid fear-based decisions.",
        "Follow disciplined routines for better emotional and practical balance.",
      ],
      brandFooter:
        "From the Desk of J P Sarmah — NAVAGRAHA CENTRE. Astrology offers guidance, not guarantees.",
    },
    relatedSlugs: [
      "april-2026-monthly-forecast",
      "how-to-approach-remedies-with-discernment",
    ],
    aiDraftReady: true,
    autoPublish: false,
  },
  {
    id: "desk-004",
    slug: "april-2026-monthly-forecast",
    path: "/from-the-desk/april-2026-monthly-forecast",
    category: "Vedic Astrology",
    tags: ["monthly-forecast", "planning", "discipline"],
    type: "MONTHLY_FORECAST",
    status: "published",
    title: "Monthly Forecast for April 2026",
    excerpt:
      "An editorial monthly forecast focused on steadier pacing, selective commitment, and calm structural decisions for the month ahead.",
    description:
      "Review the NAVAGRAHA CENTRE monthly forecast for April 2026 with calm editorial guidance and premium presentation.",
    content:
      "April emphasizes consolidation, disciplined communication, and sustainable routines over dramatic expansion.",
    seoTitle:
      "From the Desk of J P Sarmah | Monthly Forecast for April 2026",
    seoDescription:
      "Monthly Vedic forecast for April 2026 from NAVAGRAHA CENTRE with practical timing and disciplined planning guidance.",
    canonicalUrl:
      "https://navagrahacentre.com/from-the-desk/april-2026-monthly-forecast",
    isFeatured: true,
    keywords: [
      "monthly forecast",
      "April 2026 astrology forecast",
      "premium astrology editorial",
    ],
    publishedAt: "2026-04-01T00:00:00.000Z",
    updatedAt: "2026-04-06T00:00:00.000Z",
    readingTime: "6 min read",
    readingTimeMinutes: 6,
    authorName: joyPrakashSarmah.name,
    authorTitle: "Vedic Astrologer and Spiritual Guide",
    heroEyebrow: "Monthly Forecast",
    heroHighlights: [
      "A recurring content format that supports seasonality and search depth",
      "Structured for reflective planning rather than sensational prediction",
      "Maintained through deliberate human review standards",
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
    id: "desk-005",
    slug: "how-to-approach-remedies-with-discernment",
    path: "/from-the-desk/how-to-approach-remedies-with-discernment",
    category: "Remedies",
    tags: ["remedies", "ethics", "discernment"],
    type: "REMEDIES_ARTICLE",
    status: "published",
    title: "How To Approach Remedies With Discernment",
    excerpt:
      "A practical editorial guide to approaching remedies without fear, urgency, or unsupported certainty.",
    description:
      "Learn how NAVAGRAHA CENTRE frames remedies carefully, transparently, and without fear-based language or unsupported claims.",
    content:
      "Remedies should be optional supports introduced with transparent scope, practical limits, and respectful discernment.",
    seoTitle:
      "From the Desk of J P Sarmah | How To Approach Remedies With Discernment",
    seoDescription:
      "A responsible Vedic remedy guide from NAVAGRAHA CENTRE focused on transparency, caution, and practical discernment.",
    canonicalUrl:
      "https://navagrahacentre.com/from-the-desk/how-to-approach-remedies-with-discernment",
    isFeatured: true,
    keywords: [
      "astrology remedies",
      "remedy guidance",
      "spiritual remedies with discernment",
    ],
    publishedAt: "2026-03-12T00:00:00.000Z",
    updatedAt: "2026-04-06T00:00:00.000Z",
    readingTime: "5 min read",
    readingTimeMinutes: 5,
    authorName: joyPrakashSarmah.name,
    authorTitle: "Vedic Astrologer and Spiritual Guide",
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
    id: "desk-006",
    slug: "how-private-consultations-are-structured",
    path: "/from-the-desk/how-private-consultations-are-structured",
    category: "Vedic Astrology",
    tags: ["consultation", "process", "client-guidance"],
    type: "SERVICE_PAGE",
    status: "published",
    title: "How Private Consultations Are Structured",
    excerpt:
      "A service-oriented explainer covering what private consultations include, how intake works, and what clients can expect from the process.",
    description:
      "Understand how NAVAGRAHA CENTRE structures private consultations, intake, scheduling, and follow-up with Joy Prakash Sarmah.",
    content:
      "Private consultation flow is designed for clarity across intake, session delivery, and follow-up recommendations.",
    seoTitle:
      "From the Desk of J P Sarmah | How Private Consultations Are Structured",
    seoDescription:
      "Understand NAVAGRAHA CENTRE's consultation intake, session process, and follow-up model with J P Sarmah.",
    canonicalUrl:
      "https://navagrahacentre.com/from-the-desk/how-private-consultations-are-structured",
    isFeatured: false,
    keywords: [
      "private astrology consultation",
      "consultation intake",
      "Joy Prakash Sarmah booking",
    ],
    publishedAt: "2026-03-20T00:00:00.000Z",
    updatedAt: "2026-04-06T00:00:00.000Z",
    readingTime: "4 min read",
    readingTimeMinutes: 4,
    authorName: joyPrakashSarmah.name,
    authorTitle: "Vedic Astrologer and Spiritual Guide",
    heroEyebrow: "Service Guide",
    heroHighlights: [
      "Designed for clients who want operational clarity before booking",
      "Pairs evergreen service intent with long-term search value",
      "Structured to remain portable across CMS tooling without changing the route contract",
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
    id: "desk-007",
    slug: "guidance-and-remedies-frequently-asked-questions",
    path: "/from-the-desk/guidance-and-remedies-frequently-asked-questions",
    category: "Spiritual Guidance",
    tags: ["faq", "guidance", "safety"],
    type: "FAQ_PAGE",
    status: "published",
    title: "Guidance And Remedies Frequently Asked Questions",
    excerpt:
      "An evergreen FAQ page covering consultation tone, remedies, certainty, and what clients can reasonably expect from guidance.",
    description:
      "Read frequently asked questions about consultations, remedies, and guidance at NAVAGRAHA CENTRE.",
    content:
      "A curated FAQ for consultation and remedy expectations with clear trust-safe boundaries.",
    seoTitle:
      "From the Desk of J P Sarmah | Guidance And Remedies Frequently Asked Questions",
    seoDescription:
      "Frequently asked questions on consultation guidance and remedies at NAVAGRAHA CENTRE.",
    canonicalUrl:
      "https://navagrahacentre.com/from-the-desk/guidance-and-remedies-frequently-asked-questions",
    isFeatured: false,
    keywords: ["astrology faq", "remedy faq", "consultation questions"],
    publishedAt: "2026-03-28T00:00:00.000Z",
    updatedAt: "2026-04-06T00:00:00.000Z",
    readingTime: "4 min read",
    readingTimeMinutes: 4,
    authorName: joyPrakashSarmah.name,
    authorTitle: "Vedic Astrologer and Spiritual Guide",
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
        question: "Are insights reviewed before publication?",
        answer:
          "Yes. Published insights pass through deliberate human review so tone, safety, and factual boundaries stay clear.",
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
    id: "desk-template-rashifal",
    slug: "daily-rashifal-template",
    path: "/from-the-desk/daily-rashifal-template",
    category: "Daily Rashifal",
    tags: ["template", "draft", "manual-publishing"],
    type: "DAILY_RASHIFAL",
    status: "draft",
    title: "Daily Rashifal Template (Manual Publishing)",
    excerpt: "Draft template for manually publishing a complete daily Rashifal.",
    description:
      "Internal draft template for daily Rashifal publishing workflow with required metadata and zodiac structure.",
    content:
      "Use this draft template to prepare a full 12-sign daily Rashifal entry before marking status as published.",
    seoTitle: "Daily Rashifal Template",
    seoDescription: "Draft template for manual daily Rashifal publishing.",
    canonicalUrl:
      "https://navagrahacentre.com/from-the-desk/daily-rashifal-template",
    isFeatured: false,
    keywords: ["template", "daily rashifal"],
    publishedAt: "2026-04-26T00:00:00.000Z",
    updatedAt: "2026-04-26T00:00:00.000Z",
    readingTime: "2 min read",
    readingTimeMinutes: 2,
    authorName: "J P Sarmah",
    authorTitle: "Vedic Astrologer and Spiritual Guide",
    heroEyebrow: "Publishing Template",
    heroHighlights: [
      "Include all 12 zodiac sections.",
      "Keep Love, Career, Business, and lucky indicators mandatory.",
      "Publish only after manual review.",
    ],
    heroNote: "Template entry. Keep status as draft until final review.",
    author: joyPrakashSarmah,
    reviewer: editorialReviewer,
    sections: [
      {
        title: "Draft workflow",
        paragraphs: [
          "1. Fill required metadata fields.",
          "2. Add 12 zodiac blocks with structured guidance.",
          "3. Review language, remedies, and lucky indicators before publishing.",
        ],
      },
    ],
    aiDraftReady: true,
    autoPublish: false,
  },
  {
    id: "desk-template-panchang",
    slug: "panchang-article-template",
    path: "/from-the-desk/panchang-article-template",
    category: "Panchang",
    tags: ["template", "panchang", "draft"],
    type: "BLOG_ARTICLE",
    status: "draft",
    title: "Panchang Guidance Template",
    excerpt: "Draft format for daily Panchang editorial guidance articles.",
    description: "Internal draft template for publishing Panchang guidance content.",
    content:
      "Template for structured Panchang articles including tithi, nakshatra, yoga, karana, and practical guidance.",
    seoTitle: "Panchang Guidance Template",
    seoDescription: "Draft template for Panchang guidance publishing.",
    canonicalUrl:
      "https://navagrahacentre.com/from-the-desk/panchang-article-template",
    isFeatured: false,
    keywords: ["panchang template"],
    publishedAt: "2026-04-26T00:00:00.000Z",
    updatedAt: "2026-04-26T00:00:00.000Z",
    readingTime: "2 min read",
    readingTimeMinutes: 2,
    authorName: "J P Sarmah",
    authorTitle: "Vedic Astrologer and Spiritual Guide",
    heroEyebrow: "Publishing Template",
    heroHighlights: [
      "Add date and location context.",
      "Include transition-aware timing notes.",
      "Keep guidance conservative and practical.",
    ],
    heroNote: "Template entry. Keep status as draft until editorial review.",
    author: joyPrakashSarmah,
    reviewer: editorialReviewer,
    sections: [
      {
        title: "Template structure",
        paragraphs: [
          "Headline, date, Panchang table, guidance blocks, and internal links to Panchang tool.",
        ],
      },
    ],
    aiDraftReady: true,
    autoPublish: false,
  },
  {
    id: "desk-template-remedy",
    slug: "remedy-article-template",
    path: "/from-the-desk/remedy-article-template",
    category: "Remedies",
    tags: ["template", "remedies", "draft"],
    type: "REMEDIES_ARTICLE",
    status: "draft",
    title: "Remedy Guidance Template",
    excerpt: "Draft template for trust-safe remedy guidance publishing.",
    description:
      "Internal draft template for remedy guidance articles with safe language and disclosure boundaries.",
    content:
      "Template for publishing remedy guidance using supportive framing without fear or certainty claims.",
    seoTitle: "Remedy Guidance Template",
    seoDescription: "Draft template for remedy article publishing.",
    canonicalUrl:
      "https://navagrahacentre.com/from-the-desk/remedy-article-template",
    isFeatured: false,
    keywords: ["remedy template"],
    publishedAt: "2026-04-26T00:00:00.000Z",
    updatedAt: "2026-04-26T00:00:00.000Z",
    readingTime: "2 min read",
    readingTimeMinutes: 2,
    authorName: "J P Sarmah",
    authorTitle: "Vedic Astrologer and Spiritual Guide",
    heroEyebrow: "Publishing Template",
    heroHighlights: [
      "Clarify remedy purpose and limits.",
      "Avoid urgency or guaranteed outcomes.",
      "Link to consultation when deeper guidance is needed.",
    ],
    heroNote: "Template entry. Keep status as draft until editorial review.",
    author: joyPrakashSarmah,
    reviewer: editorialReviewer,
    sections: [
      {
        title: "Template structure",
        paragraphs: [
          "Context, remedy explanation, practical caution, and optional product references.",
        ],
      },
    ],
    aiDraftReady: true,
    autoPublish: false,
  },
  {
    id: "desk-template-gemstone",
    slug: "gemstone-guidance-template",
    path: "/from-the-desk/gemstone-guidance-template",
    category: "Gemstones",
    tags: ["template", "gemstones", "draft"],
    type: "BLOG_ARTICLE",
    status: "draft",
    title: "Gemstone Guidance Template",
    excerpt:
      "Draft template for gemstone guidance content with trust-safe product linking.",
    description:
      "Internal draft template for gemstone guidance publishing with chart-context framing and optional shop links.",
    content:
      "Template for gemstone guidance articles that keep spiritual support optional and transparent.",
    seoTitle: "Gemstone Guidance Template",
    seoDescription: "Draft template for gemstone guidance publishing.",
    canonicalUrl:
      "https://navagrahacentre.com/from-the-desk/gemstone-guidance-template",
    isFeatured: false,
    keywords: ["gemstone template"],
    publishedAt: "2026-04-26T00:00:00.000Z",
    updatedAt: "2026-04-26T00:00:00.000Z",
    readingTime: "2 min read",
    readingTimeMinutes: 2,
    authorName: "J P Sarmah",
    authorTitle: "Vedic Astrologer and Spiritual Guide",
    heroEyebrow: "Publishing Template",
    heroHighlights: [
      "Connect gemstone guidance to chart context.",
      "Add safety and expectation notes.",
      "Use shop links as optional add-ons only.",
    ],
    heroNote: "Template entry. Keep status as draft until editorial review.",
    author: joyPrakashSarmah,
    reviewer: editorialReviewer,
    sections: [
      {
        title: "Template structure",
        paragraphs: [
          "Gemstone context, who may consider it, caution points, and optional shop pathway.",
        ],
      },
    ],
    aiDraftReady: true,
    autoPublish: false,
  },
] as const;
