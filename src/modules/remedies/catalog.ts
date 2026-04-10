import type { RemedyType } from "@prisma/client";

export type CuratedRemedyRecord = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  type: RemedyType;
  cautionNote: string;
  isFeatured: boolean;
  publishedAt: string;
};

export const curatedRemedyCatalog: readonly CuratedRemedyRecord[] = [
  {
    slug: "adi-gayatri-mantra",
    title: "Adi Gayatri Mantra Recitation",
    summary:
      "A calm sunrise mantra practice sometimes chosen when clarity, composure, or inner steadiness needs careful support.",
    description:
      "Presented as a traditional devotional discipline rather than a promise of outcomes. A short, consistent recitation is preferred over intensity.",
    type: "MANTRA",
    cautionNote:
      "Stay with a mantra practice that feels respectful and sustainable. If you already follow a lineage, remain consistent with that guidance.",
    isFeatured: true,
    publishedAt: "2026-01-15T00:00:00.000Z",
  },
  {
    slug: "five-mukhi-rudraksha",
    title: "Five Mukhi Rudraksha",
    summary:
      "A traditional grounding support often considered when a chart suggests the need for steadier rhythm and containment.",
    description:
      "Included as an approved remedy record for careful, consultation-led use. Material authenticity and individual suitability both matter.",
    type: "RUDRAKSHA",
    cautionNote:
      "Traditional suitability varies by person. Confirm sourcing and personal appropriateness before buying or wearing regularly.",
    isFeatured: true,
    publishedAt: "2026-01-15T00:00:00.000Z",
  },
  {
    slug: "sandalwood-japa-mala",
    title: "Sandalwood Japa Mala",
    summary:
      "A measured counting mala for devotional repetition when the chart points toward gentler pacing and attentive practice.",
    description:
      "This record supports a contemplative practice posture and does not imply necessity. It is meant for repetition, breath, and steadiness.",
    type: "MALA",
    cautionNote:
      "Choose only what you can use consistently and respectfully. A mala should support discipline, not become a superstition trigger.",
    isFeatured: false,
    publishedAt: "2026-01-15T00:00:00.000Z",
  },
  {
    slug: "yellow-sapphire-review",
    title: "Yellow Sapphire Review",
    summary:
      "A gemstone discussion point sometimes considered when benefic guidance themes deserve deeper consultation.",
    description:
      "Gemstones are not default prescriptions. This record exists to support careful review rather than impulsive adoption.",
    type: "GEMSTONE",
    cautionNote:
      "Gemstones should never be prescribed casually. Treat this as a consultation topic, not a general recommendation.",
    isFeatured: false,
    publishedAt: "2026-01-15T00:00:00.000Z",
  },
  {
    slug: "surya-yantra-contemplation",
    title: "Surya Yantra Contemplation",
    summary:
      "A visual devotional focus sometimes used when solar themes call for a more ordered morning practice.",
    description:
      "This yantra record is framed as a contemplative aid only. It should sit inside a grounded daily rhythm, not replace judgement.",
    type: "YANTRA",
    cautionNote:
      "Only adopt symbolic supports that feel meaningful and stable in your own practice context.",
    isFeatured: false,
    publishedAt: "2026-01-15T00:00:00.000Z",
  },
  {
    slug: "navagraha-puja-observance",
    title: "Navagraha Puja Observance",
    summary:
      "A formal ritual option reserved for cases where a broader balancing observance may be worth discussing with a trusted guide.",
    description:
      "Included as a transparent ritual option for consultation-led review. It should never be framed through fear or urgency.",
    type: "PUJA",
    cautionNote:
      "Formal puja should be chosen deliberately and only when it feels aligned with personal tradition, trust, and capacity.",
    isFeatured: true,
    publishedAt: "2026-01-15T00:00:00.000Z",
  },
  {
    slug: "sesame-donation-saturday",
    title: "Saturday Sesame Donation",
    summary:
      "A small charitable observance that may support humility and grounded service around heavier Saturn themes.",
    description:
      "Presented as a modest act of service, not a transactional cure. Consistency and sincerity matter more than scale.",
    type: "DONATION",
    cautionNote:
      "Keep donation practices voluntary, proportionate, and ethical. They are not substitutes for practical responsibility.",
    isFeatured: true,
    publishedAt: "2026-01-15T00:00:00.000Z",
  },
  {
    slug: "monday-fasting-reflection",
    title: "Monday Fasting Reflection",
    summary:
      "A light reflective fast sometimes considered when lunar steadiness benefits from simpler ritual structure.",
    description:
      "This record refers to a gentle, traditional observance only. It is optional and should always yield to health, capacity, and common sense.",
    type: "FASTING",
    cautionNote:
      "Do not fast if it conflicts with health, medication, pregnancy, or recovery needs. Personal wellbeing takes priority.",
    isFeatured: false,
    publishedAt: "2026-01-15T00:00:00.000Z",
  },
  {
    slug: "evening-quiet-window",
    title: "Evening Quiet Window",
    summary:
      "A low-stimulation closing ritual that supports gentler settling when the chart points toward emotional or nodal overextension.",
    description:
      "This lifestyle support record keeps the emphasis on calmer rhythm, reflection, and reduced overstimulation. It is intentionally simple and does not require any purchase.",
    type: "LIFESTYLE_SUPPORT",
    cautionNote:
      "Keep the practice light and humane. The goal is steadiness and space, not rigid austerity or social withdrawal.",
    isFeatured: false,
    publishedAt: "2026-01-15T00:00:00.000Z",
  },
  {
    slug: "sunrise-discipline-window",
    title: "Sunrise Discipline Window",
    summary:
      "A daily spiritual discipline built around a short, consistent sunrise practice rather than dramatic ritual effort.",
    description:
      "This foundation practice is intentionally simple: sit, breathe, recite, and notice. It supports steadiness without promising results.",
    type: "SPIRITUAL_DISCIPLINE",
    cautionNote:
      "Choose a rhythm you can maintain gently over time. Excessive austerity is neither required nor encouraged here.",
    isFeatured: true,
    publishedAt: "2026-01-15T00:00:00.000Z",
  },
] as const;
