export type RashifalSign = {
  slug:
    | "aries"
    | "taurus"
    | "gemini"
    | "cancer"
    | "leo"
    | "virgo"
    | "libra"
    | "scorpio"
    | "sagittarius"
    | "capricorn"
    | "aquarius"
    | "pisces";
  name: string;
  icon: string;
  shortPrediction: string;
  fullDescription: readonly [string, string, string, string, string];
  love: string;
  career: string;
  business: string;
  luckyColor: string;
  luckyNumber: string;
  luckyTime: string;
};

type RashifalNarrativeLines = {
  lineOne: string;
  lineTwo: string;
  lineThree: string;
  lineFour: string;
  lineFive: string;
};

type RashifalSignDefinition = Omit<RashifalSign, "fullDescription"> & {
  narrative: RashifalNarrativeLines;
};

const forbiddenPublicTerms = /\b(?:bhava|bhavas|house|houses|1st|2nd|3rd|4th|5th|6th|7th|8th|9th|10th|11th|12th)\b/i;

const minimumLineWordCount = 10;
const minimumSectionWordCount = 8;

export const rashifalGenerationStandard = {
  descriptiveLineCount: 5,
  publicOutputOrder: [
    "Sign title",
    "Exactly 5 descriptive lines",
    "Love",
    "Career",
    "Business",
    "Lucky Color",
    "Lucky Number",
    "Lucky Time",
  ] as const,
  hiddenLineCoverage: {
    lineOne:
      "Blend self, confidence, body/health, mood, and family stability.",
    lineTwo:
      "Blend speech, communication, effort, courage, home atmosphere, and emotional comfort.",
    lineThree:
      "Blend creativity, intelligence, planning, children themes, duties, obstacles, discipline, and practical pressure.",
    lineFour:
      "Blend relationships, partnerships, public dealings, hidden tension, emotional depth, and transformation.",
    lineFive:
      "Blend fortune, guidance, values, career direction, gains, networks, expenses, and spiritual balance.",
  } as const,
} as const;

function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function hasForbiddenTerms(value: string) {
  return forbiddenPublicTerms.test(value);
}

function normalize(value: string) {
  return value.trim();
}

function createDescriptionTuple(
  narrative: RashifalNarrativeLines
): readonly [string, string, string, string, string] {
  return [
    normalize(narrative.lineOne),
    normalize(narrative.lineTwo),
    normalize(narrative.lineThree),
    normalize(narrative.lineFour),
    normalize(narrative.lineFive),
  ] as const;
}

function validateRashifalSign(sign: RashifalSign) {
  const errors: string[] = [];

  if (sign.fullDescription.length !== rashifalGenerationStandard.descriptiveLineCount) {
    errors.push(
      `${sign.slug}: expected ${rashifalGenerationStandard.descriptiveLineCount} descriptive lines, received ${sign.fullDescription.length}.`
    );
  }

  sign.fullDescription.forEach((line, index) => {
    const normalizedLine = normalize(line);
    if (!normalizedLine) {
      errors.push(`${sign.slug}: descriptive line ${index + 1} is empty.`);
      return;
    }
    if (countWords(normalizedLine) < minimumLineWordCount) {
      errors.push(
        `${sign.slug}: descriptive line ${index + 1} must contain at least ${minimumLineWordCount} words.`
      );
    }
    if (hasForbiddenTerms(normalizedLine)) {
      errors.push(
        `${sign.slug}: descriptive line ${index + 1} uses forbidden technical house terminology.`
      );
    }
  });

  const requiredSections = [
    { key: "love", value: sign.love },
    { key: "career", value: sign.career },
    { key: "business", value: sign.business },
    { key: "luckyColor", value: sign.luckyColor },
    { key: "luckyNumber", value: sign.luckyNumber },
    { key: "luckyTime", value: sign.luckyTime },
  ] as const;

  requiredSections.forEach((section) => {
    const normalizedValue = normalize(section.value);
    if (!normalizedValue) {
      errors.push(`${sign.slug}: ${section.key} is missing.`);
      return;
    }

    if (
      (section.key === "love" ||
        section.key === "career" ||
        section.key === "business") &&
      countWords(normalizedValue) < minimumSectionWordCount
    ) {
      errors.push(
        `${sign.slug}: ${section.key} must contain at least ${minimumSectionWordCount} words.`
      );
    }

    if (hasForbiddenTerms(normalizedValue)) {
      errors.push(
        `${sign.slug}: ${section.key} uses forbidden technical house terminology.`
      );
    }
  });

  return errors;
}

function createRashifalSign(definition: RashifalSignDefinition): RashifalSign {
  const sign: RashifalSign = {
    ...definition,
    fullDescription: createDescriptionTuple(definition.narrative),
  };

  const errors = validateRashifalSign(sign);
  if (errors.length) {
    throw new Error(
      `Invalid Rashifal content for "${sign.slug}".\n${errors.join("\n")}`
    );
  }

  return sign;
}

export const rashifalSigns: readonly RashifalSign[] = [
  createRashifalSign({
    slug: "aries",
    name: "Aries",
    icon: "AR",
    shortPrediction:
      "Momentum is high today, and disciplined pacing turns bold intent into dependable progress.",
    narrative: {
      lineOne:
        "Your confidence is strong today, and consistent routines keep physical energy, mood, and home stability aligned.",
      lineTwo:
        "Direct communication works best when softened with patience, while focused effort brings courage and emotional ease.",
      lineThree:
        "Creative plans can advance if you sequence duties first and stay disciplined through practical pressure and minor delays.",
      lineFour:
        "Partnership matters improve through honest listening, and a measured public response can transform hidden tension.",
      lineFive:
        "Clear values guide career direction today, helping useful alliances grow while spending stays balanced and spiritually grounded.",
    },
    love:
      "Warm honesty and patient listening strengthen trust better than fast emotional reactions.",
    career:
      "Take initiative early, then organize tasks in sequence to secure visible progress by evening.",
    business:
      "Review commitments carefully, align on timelines, and avoid rushed decisions in negotiations.",
    luckyColor: "Saffron Gold",
    luckyNumber: "9",
    luckyTime: "09:30 AM - 11:00 AM",
  }),
  createRashifalSign({
    slug: "taurus",
    name: "Taurus",
    icon: "TA",
    shortPrediction:
      "Steady choices and practical communication help you convert daily effort into reliable outcomes.",
    narrative: {
      lineOne:
        "A calm approach strengthens confidence today, supporting physical steadiness, balanced emotions, and family comfort.",
      lineTwo:
        "Thoughtful speech and consistent communication reduce friction, while steady effort improves home atmosphere and courage.",
      lineThree:
        "Methodical planning supports creative output and responsibilities when you face obstacles with discipline and patience.",
      lineFour:
        "Relationship discussions become productive when you avoid stubbornness and address deeper concerns with emotional maturity.",
      lineFive:
        "Guidance from core values supports career clarity, stronger networks, mindful expenses, and a sense of inner stability.",
    },
    love:
      "Reliable communication and gentle reassurance deepen connection more than dramatic expression today.",
    career:
      "Consistency and quality control attract trust from decision-makers and support long-term growth.",
    business:
      "Good day for budgeting, contract review, and deliberate partnership alignment.",
    luckyColor: "Cream Beige",
    luckyNumber: "6",
    luckyTime: "01:00 PM - 02:30 PM",
  }),
  createRashifalSign({
    slug: "gemini",
    name: "Gemini",
    icon: "GE",
    shortPrediction:
      "Communication is your edge today, especially when ideas are paired with a clear action plan.",
    narrative: {
      lineOne:
        "Mental energy is lively, and grounding habits help confidence, mood, and personal stability stay centered.",
      lineTwo:
        "Your speech has influence today, so clear words and focused effort improve courage and emotional comfort at home.",
      lineThree:
        "Creative thinking gains results when you organize priorities, manage duties, and stay disciplined through interruptions.",
      lineFour:
        "Partnership dynamics improve through transparency, while measured public responses can ease hidden emotional strain.",
      lineFive:
        "Insightful guidance supports career direction today, attracting helpful networks while keeping expenses and values balanced.",
    },
    love:
      "Speak openly yet gently, and let meaningful listening shape the emotional tone of conversations.",
    career:
      "Present ideas with clear execution steps to gain stronger support from colleagues and leaders.",
    business:
      "Good time for outreach, proposal refinement, and strategic follow-ups with key contacts.",
    luckyColor: "Light Yellow",
    luckyNumber: "5",
    luckyTime: "10:30 AM - 12:00 PM",
  }),
  createRashifalSign({
    slug: "cancer",
    name: "Cancer",
    icon: "CA",
    shortPrediction:
      "Emotional intelligence guides your best choices today when boundaries remain clear and practical.",
    narrative: {
      lineOne:
        "Your intuition is strong, and gentle discipline keeps confidence, health rhythms, and family calm in balance.",
      lineTwo:
        "Careful communication softens misunderstandings, while steady effort improves courage and emotional comfort in domestic matters.",
      lineThree:
        "Creative planning supports responsibilities today if you handle practical pressure early and maintain consistent routines.",
      lineFour:
        "Relationship depth grows through empathy, and unresolved tension transforms when you address sensitive matters directly.",
      lineFive:
        "Values-led decisions support career direction, trusted networks, mindful spending, and a quiet spiritual reset.",
    },
    love:
      "Compassionate words and patient responses help your bond feel secure and emotionally grounded.",
    career:
      "Collaborative work thrives when you combine sensitivity with structure and clear timelines.",
    business:
      "Prioritize client trust and relationship quality before making expansion commitments.",
    luckyColor: "Pearl White",
    luckyNumber: "2",
    luckyTime: "07:30 PM - 09:00 PM",
  }),
  createRashifalSign({
    slug: "leo",
    name: "Leo",
    icon: "LE",
    shortPrediction:
      "Leadership potential is high today, and measured confidence creates stronger long-term impact.",
    narrative: {
      lineOne:
        "Personal presence is strong now, and balanced routines help confidence, vitality, and family stability stay steady.",
      lineTwo:
        "Assertive speech works best with warmth, while focused effort improves courage and emotional ease at home.",
      lineThree:
        "Creative initiatives move faster when duties are prioritized and practical pressure is managed with discipline.",
      lineFour:
        "Partnership clarity improves through respect, and public interactions benefit when hidden tension is handled calmly.",
      lineFive:
        "Purpose-driven values support career direction today, expanding useful networks while keeping expenses and balance aligned.",
    },
    love:
      "Lead with generosity and calm honesty to build deeper emotional trust.",
    career:
      "Take ownership of key decisions, but confirm execution details before committing publicly.",
    business:
      "Strong day for brand positioning, strategic visibility, and structured growth decisions.",
    luckyColor: "Antique Gold",
    luckyNumber: "1",
    luckyTime: "11:30 AM - 01:00 PM",
  }),
  createRashifalSign({
    slug: "virgo",
    name: "Virgo",
    icon: "VI",
    shortPrediction:
      "Precision is your advantage today when analysis is balanced with timely execution.",
    narrative: {
      lineOne:
        "A practical start boosts confidence today, supporting physical steadiness, emotional balance, and household order.",
      lineTwo:
        "Measured communication reduces noise, and consistent effort strengthens courage and comfort in personal space.",
      lineThree:
        "Planning quality improves creative output when duties are sorted early and obstacles are handled with discipline.",
      lineFour:
        "Partnership matters benefit from clarity, while emotional depth grows when hidden concerns are addressed without judgment.",
      lineFive:
        "Grounded values guide career direction, attract constructive networks, and help manage expenses with spiritual composure.",
    },
    love:
      "Supportive communication and thoughtful listening create smoother emotional understanding.",
    career:
      "Refine process details first, then deliver outcomes with confidence and consistent follow-through.",
    business:
      "Excellent day for audits, systems review, and disciplined planning decisions.",
    luckyColor: "Muted Green",
    luckyNumber: "5",
    luckyTime: "08:30 AM - 10:00 AM",
  }),
  createRashifalSign({
    slug: "libra",
    name: "Libra",
    icon: "LI",
    shortPrediction:
      "Balance and diplomacy help you create progress in relationships and practical decisions today.",
    narrative: {
      lineOne:
        "Your composure supports confidence today, helping mood, vitality, and family stability remain aligned.",
      lineTwo:
        "Diplomatic speech improves communication flow, while steady effort reinforces courage and emotional comfort at home.",
      lineThree:
        "Creative planning works best when you finalize duties early and stay disciplined under practical pressure.",
      lineFour:
        "Partnership negotiations improve through fairness, and hidden emotional strain softens through honest dialogue.",
      lineFive:
        "Value-based choices guide career direction, strengthen networks, and keep expenses aligned with spiritual priorities.",
    },
    love:
      "Respectful conversation and emotional fairness help maintain harmony in close relationships.",
    career:
      "Collaboration succeeds when you make timely decisions and keep shared goals explicit.",
    business:
      "Favorable period for negotiations, partnership agreements, and coordinated planning.",
    luckyColor: "Rose Beige",
    luckyNumber: "6",
    luckyTime: "03:00 PM - 04:30 PM",
  }),
  createRashifalSign({
    slug: "scorpio",
    name: "Scorpio",
    icon: "SC",
    shortPrediction:
      "Depth and strategic focus support meaningful progress when emotional intensity is channeled wisely.",
    narrative: {
      lineOne:
        "Inner focus is strong today, and grounded routines keep confidence, energy, and family stability anchored.",
      lineTwo:
        "Controlled speech and clear communication improve effort quality, courage, and emotional atmosphere in personal matters.",
      lineThree:
        "Strategic creativity gains momentum when duties are prioritized and practical obstacles are managed with discipline.",
      lineFour:
        "Relationship depth increases through honesty, and hidden tension transforms when difficult topics are addressed directly.",
      lineFive:
        "Guidance from core values supports career direction, productive alliances, balanced expenses, and spiritual clarity.",
    },
    love:
      "Emotional honesty with a calm tone strengthens trust and reduces unnecessary misunderstandings.",
    career:
      "Focused execution and strategic timing will outperform scattered multitasking today.",
    business:
      "Strong day for confidential planning, risk review, and long-view decision making.",
    luckyColor: "Deep Maroon",
    luckyNumber: "8",
    luckyTime: "05:00 PM - 06:30 PM",
  }),
  createRashifalSign({
    slug: "sagittarius",
    name: "Sagittarius",
    icon: "SG",
    shortPrediction:
      "Optimism is useful today when paired with structure, accountability, and clear priorities.",
    narrative: {
      lineOne:
        "Your outlook lifts confidence today, and steady habits support physical energy, mood, and family harmony.",
      lineTwo:
        "Open communication helps progress, while focused effort and courage stabilize emotional comfort in domestic settings.",
      lineThree:
        "Big ideas can become practical if duties are handled first and discipline is maintained through pressure points.",
      lineFour:
        "Partnership growth comes through mutual respect, and hidden tension eases with direct but kind conversation.",
      lineFive:
        "Purposeful values guide career choices, expand networks, and keep spending aligned with spiritual balance.",
    },
    love:
      "Shared goals and sincere communication build stronger emotional momentum today.",
    career:
      "Growth opportunities open when bold vision is matched with concrete execution plans.",
    business:
      "Useful day for expansion planning, market research, and strategic outreach.",
    luckyColor: "Soft Orange",
    luckyNumber: "3",
    luckyTime: "12:30 PM - 02:00 PM",
  }),
  createRashifalSign({
    slug: "capricorn",
    name: "Capricorn",
    icon: "CP",
    shortPrediction:
      "Structured effort gives steady results today, especially where long-term priorities are concerned.",
    narrative: {
      lineOne:
        "Discipline strengthens confidence today, supporting physical steadiness, emotional balance, and family reliability.",
      lineTwo:
        "Clear speech with measured tone improves communication, while consistent effort supports courage and home comfort.",
      lineThree:
        "Practical planning unlocks creative progress when duties are completed and obstacles are managed with patience.",
      lineFour:
        "Partnership trust builds through accountability, and deeper emotional tension shifts when concerns are addressed clearly.",
      lineFive:
        "Values-based guidance supports career direction, useful alliances, careful spending, and spiritual composure.",
    },
    love:
      "Consistency and dependable presence communicate care more effectively than dramatic gestures today.",
    career:
      "Strong day for strategic execution, accountability reviews, and disciplined leadership choices.",
    business:
      "Operational planning and structured decision-making create durable momentum.",
    luckyColor: "Slate Gray",
    luckyNumber: "4",
    luckyTime: "07:00 AM - 08:30 AM",
  }),
  createRashifalSign({
    slug: "aquarius",
    name: "Aquarius",
    icon: "AQ",
    shortPrediction:
      "Fresh ideas are powerful today when they are organized into practical, collaborative steps.",
    narrative: {
      lineOne:
        "Independent thinking boosts confidence today, while balanced routines support health, mood, and family steadiness.",
      lineTwo:
        "Clear communication keeps momentum strong, and focused effort reinforces courage and emotional comfort at home.",
      lineThree:
        "Innovative planning succeeds when duties are structured and practical constraints are handled with discipline.",
      lineFour:
        "Partnerships improve through emotional presence, and hidden tension can transform through direct mutual dialogue.",
      lineFive:
        "Guidance aligned with values sharpens career direction, strengthens networks, and keeps expenses spiritually balanced.",
    },
    love:
      "Stay emotionally present and specific in communication to avoid mixed signals in close bonds.",
    career:
      "Your original ideas gain traction when framed with timelines, ownership, and clear outcomes.",
    business:
      "Good day for innovation review, process upgrades, and strategic product decisions.",
    luckyColor: "Sky Blue",
    luckyNumber: "11",
    luckyTime: "04:00 PM - 05:30 PM",
  }),
  createRashifalSign({
    slug: "pisces",
    name: "Pisces",
    icon: "PI",
    shortPrediction:
      "Intuition supports your decisions today when grounded by clear boundaries and practical planning.",
    narrative: {
      lineOne:
        "Inner sensitivity is high today, and stable routines support confidence, vitality, mood, and family calm.",
      lineTwo:
        "Gentle speech improves communication, while consistent effort strengthens courage and emotional comfort in home life.",
      lineThree:
        "Creative insight becomes productive when duties are prioritized and practical pressure is managed with discipline.",
      lineFour:
        "Relationship understanding deepens through compassion, and hidden emotional strain transforms with honest conversation.",
      lineFive:
        "Value-led guidance supports career direction, healthy networks, mindful expenses, and a renewed spiritual balance.",
    },
    love:
      "Soft honesty and emotional steadiness create deeper connection and reduce confusion.",
    career:
      "Focused creativity and dependable teamwork produce better results than scattered effort today.",
    business:
      "Avoid speculative risk and move forward with data-backed, measured decisions.",
    luckyColor: "Sea Green",
    luckyNumber: "7",
    luckyTime: "06:30 AM - 08:00 AM",
  }),
] as const;

export function validateRashifalDataset(signs: readonly RashifalSign[]) {
  const errors = signs.flatMap((sign) => validateRashifalSign(sign));

  if (signs.length !== 12) {
    errors.push(`Expected 12 zodiac signs, received ${signs.length}.`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

const datasetValidation = validateRashifalDataset(rashifalSigns);
if (!datasetValidation.valid) {
  throw new Error(
    `Invalid Rashifal dataset.\n${datasetValidation.errors.join("\n")}`
  );
}

export function getRashifalSignBySlug(slug: string) {
  return rashifalSigns.find((sign) => sign.slug === slug) ?? null;
}
