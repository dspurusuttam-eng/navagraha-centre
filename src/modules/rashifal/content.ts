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

export const rashifalSigns: readonly RashifalSign[] = [
  {
    slug: "aries",
    name: "Aries",
    icon: "AR",
    shortPrediction:
      "Momentum is strong today, but your best outcomes come from measured decisions. Keep your communication direct and steady.",
    fullDescription: [
      "Today supports action, but avoid rushing into unfinished plans.",
      "You may feel a strong urge to lead; pair it with patience.",
      "Short, focused tasks will deliver better results than scattered effort.",
      "Relationship clarity improves when you listen before responding.",
      "End the day by reviewing priorities for tomorrow.",
    ],
    love:
      "Express your feelings clearly, but leave room for your partner's perspective.",
    career:
      "A practical update to your workflow can unlock progress by evening.",
    business:
      "Avoid impulsive commitments; verify details before final agreement.",
    luckyColor: "Saffron Gold",
    luckyNumber: "9",
    luckyTime: "09:30 AM - 11:00 AM",
  },
  {
    slug: "taurus",
    name: "Taurus",
    icon: "TA",
    shortPrediction:
      "Stability and consistency favor you today. Slow, deliberate steps bring stronger results than fast changes.",
    fullDescription: [
      "Your steady approach becomes your biggest advantage today.",
      "Handle pending tasks first before taking new responsibilities.",
      "Financial planning discussions can be productive in the afternoon.",
      "Choose calm and thoughtful responses in personal conversations.",
      "A short evening reset helps clear mental clutter.",
    ],
    love:
      "Small gestures and reliable communication will deepen emotional comfort.",
    career:
      "Consistency in execution will be noticed more than dramatic ideas.",
    business:
      "Strong day for budgeting, negotiation review, and controlled expansion.",
    luckyColor: "Cream Beige",
    luckyNumber: "6",
    luckyTime: "01:00 PM - 02:30 PM",
  },
  {
    slug: "gemini",
    name: "Gemini",
    icon: "GE",
    shortPrediction:
      "Your communication energy is high today. Channel it into priority conversations and avoid overcommitting.",
    fullDescription: [
      "Today favors learning, communication, and quick adaptation.",
      "Be selective about where you invest your attention.",
      "A key conversation may open a fresh opportunity path.",
      "Do not let minor distractions break your schedule.",
      "Close the day by documenting your next action items.",
    ],
    love:
      "Be open about your thoughts, but keep your tone grounded and warm.",
    career:
      "Your ideas land well when supported by practical execution steps.",
    business:
      "Good day for networking and early-stage proposal discussions.",
    luckyColor: "Light Yellow",
    luckyNumber: "5",
    luckyTime: "10:30 AM - 12:00 PM",
  },
  {
    slug: "cancer",
    name: "Cancer",
    icon: "CA",
    shortPrediction:
      "Emotional sensitivity is high, and intuition is useful today. Stay grounded and avoid reacting to temporary tension.",
    fullDescription: [
      "Your emotional intelligence can guide important decisions today.",
      "Avoid carrying unresolved issues from one conversation to another.",
      "Family or home-related planning may need extra attention.",
      "Protect your energy by maintaining healthy boundaries.",
      "A calm evening routine will restore your focus.",
    ],
    love:
      "Compassion and patience strengthen your connection more than intensity.",
    career:
      "You perform best in collaborative settings where trust is clear.",
    business:
      "Prioritize relationship management with clients and long-term partners.",
    luckyColor: "Pearl White",
    luckyNumber: "2",
    luckyTime: "07:30 PM - 09:00 PM",
  },
  {
    slug: "leo",
    name: "Leo",
    icon: "LE",
    shortPrediction:
      "Leadership is highlighted today. Use your confidence wisely and focus on decisions that improve long-term outcomes.",
    fullDescription: [
      "Today rewards focused leadership and clear communication.",
      "Set direction early and align your team around priorities.",
      "Avoid ego-driven decisions in competitive situations.",
      "Creative thinking can solve a pending work challenge.",
      "Balance ambition with practical timelines before closing the day.",
    ],
    love:
      "Lead with generosity and honesty, not just strong expression.",
    career:
      "Your initiative can move stalled work forward if execution is disciplined.",
    business:
      "Strong day for brand visibility and strategic positioning.",
    luckyColor: "Antique Gold",
    luckyNumber: "1",
    luckyTime: "11:30 AM - 01:00 PM",
  },
  {
    slug: "virgo",
    name: "Virgo",
    icon: "VI",
    shortPrediction:
      "Detail orientation is your strength today. Use it to improve quality, but avoid overanalysis that delays action.",
    fullDescription: [
      "A practical, methodical approach brings stable progress.",
      "Focus on one high-value task before multitasking.",
      "Data review and process optimization are especially favorable.",
      "Keep expectations realistic in personal discussions.",
      "End the day by simplifying tomorrow's to-do list.",
    ],
    love:
      "Supportive communication and thoughtful listening improve harmony.",
    career:
      "Your quality standards can unlock recognition when paired with speed.",
    business:
      "Excellent day for system checks, reporting, and compliance review.",
    luckyColor: "Muted Green",
    luckyNumber: "5",
    luckyTime: "08:30 AM - 10:00 AM",
  },
  {
    slug: "libra",
    name: "Libra",
    icon: "LI",
    shortPrediction:
      "Balance and diplomacy are central today. Your ability to mediate and prioritize fairness brings progress.",
    fullDescription: [
      "You are best positioned as a stabilizing voice today.",
      "Decision quality improves when both sides are clearly heard.",
      "Avoid delaying key choices for the sake of perfection.",
      "Partnership matters gain momentum in the afternoon.",
      "A short reflection period at night helps reset your focus.",
    ],
    love:
      "Mutual respect and calm dialogue will strengthen trust.",
    career:
      "Collaborative projects benefit from your coordination skills.",
    business:
      "Strong day for negotiations, contracts, and partnership alignment.",
    luckyColor: "Rose Beige",
    luckyNumber: "6",
    luckyTime: "03:00 PM - 04:30 PM",
  },
  {
    slug: "scorpio",
    name: "Scorpio",
    icon: "SC",
    shortPrediction:
      "Depth and focus help you today. Use strategic thinking, but avoid unnecessary emotional intensity in routine matters.",
    fullDescription: [
      "Today supports deep work and meaningful progress.",
      "A hidden detail may become visible and clarify your next step.",
      "Guard your energy by minimizing low-value distractions.",
      "Do not overinterpret brief misunderstandings in relationships.",
      "Evening is favorable for long-term planning.",
    ],
    love:
      "Honest but calm communication creates stronger emotional security.",
    career:
      "Strategic planning and focused execution will outperform multitasking.",
    business:
      "Good day for risk review and confidential decision-making.",
    luckyColor: "Deep Maroon",
    luckyNumber: "8",
    luckyTime: "05:00 PM - 06:30 PM",
  },
  {
    slug: "sagittarius",
    name: "Sagittarius",
    icon: "SG",
    shortPrediction:
      "Your outlook is optimistic today. Combine vision with discipline to convert ideas into concrete progress.",
    fullDescription: [
      "Your broad perspective can reveal new paths today.",
      "Channel enthusiasm into one well-defined objective.",
      "Learning or mentorship discussions can be productive.",
      "Be mindful of overpromising in social or work settings.",
      "Close the day by grounding big ideas into practical steps.",
    ],
    love:
      "Shared goals and meaningful conversation deepen emotional connection.",
    career:
      "A growth opportunity appears when you pair courage with planning.",
    business:
      "Good day for market exploration and long-range business strategy.",
    luckyColor: "Soft Orange",
    luckyNumber: "3",
    luckyTime: "12:30 PM - 02:00 PM",
  },
  {
    slug: "capricorn",
    name: "Capricorn",
    icon: "CP",
    shortPrediction:
      "Discipline and structure bring you steady wins today. Prioritize foundational tasks before expansion.",
    fullDescription: [
      "Today favors long-term structure over short-term excitement.",
      "A systematic approach helps you close pending responsibilities.",
      "Authority interactions are likely to be constructive.",
      "Do not carry work pressure into personal space.",
      "A measured evening review keeps tomorrow efficient.",
    ],
    love:
      "Reliability and consistency matter more than grand expression today.",
    career:
      "Strong day for strategic execution, policy alignment, and accountability.",
    business:
      "Stable momentum supports operations, planning, and structured growth.",
    luckyColor: "Slate Gray",
    luckyNumber: "4",
    luckyTime: "07:00 AM - 08:30 AM",
  },
  {
    slug: "aquarius",
    name: "Aquarius",
    icon: "AQ",
    shortPrediction:
      "Innovation and perspective are active today. Bring practical structure to new ideas for meaningful results.",
    fullDescription: [
      "You are likely to think ahead and challenge old patterns today.",
      "Blend creative insight with realistic execution timelines.",
      "Team discussions benefit from your independent perspective.",
      "Avoid detachment in close relationships; stay emotionally present.",
      "Late evening is favorable for strategic thought work.",
    ],
    love:
      "Be present and communicative to avoid mixed emotional signals.",
    career:
      "Your unconventional ideas gain traction when packaged clearly.",
    business:
      "Useful day for innovation planning and product-level improvements.",
    luckyColor: "Sky Blue",
    luckyNumber: "11",
    luckyTime: "04:00 PM - 05:30 PM",
  },
  {
    slug: "pisces",
    name: "Pisces",
    icon: "PI",
    shortPrediction:
      "Intuition is strong today, and emotional clarity is important. Stay grounded while following your inner sense of timing.",
    fullDescription: [
      "Your inner guidance can be highly accurate today.",
      "Protect your energy by avoiding unnecessary noise.",
      "Creative and spiritual activities are especially supportive.",
      "Keep practical boundaries in work and personal communication.",
      "A quiet evening ritual can improve mental balance.",
    ],
    love:
      "Gentle expression and emotional honesty create stronger understanding.",
    career:
      "Focused creative work and supportive teamwork will bring results.",
    business:
      "Avoid speculative moves; rely on steady, data-backed decisions.",
    luckyColor: "Sea Green",
    luckyNumber: "7",
    luckyTime: "06:30 AM - 08:00 AM",
  },
] as const;

export function getRashifalSignBySlug(slug: string) {
  return rashifalSigns.find((sign) => sign.slug === slug) ?? null;
}
