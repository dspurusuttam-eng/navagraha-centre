import type { RemedyType } from "@prisma/client";

const remedyTypeLabels: Record<RemedyType, string> = {
  MANTRA: "Mantra",
  RUDRAKSHA: "Rudraksha",
  MALA: "Mala",
  GEMSTONE: "Gemstone",
  YANTRA: "Yantra",
  PUJA: "Puja",
  DONATION: "Donation",
  FASTING: "Fasting",
  SPIRITUAL_DISCIPLINE: "Spiritual Discipline",
  LIFESTYLE_SUPPORT: "Lifestyle Support",
};

export function getLabelForRemedyType(type: RemedyType) {
  return remedyTypeLabels[type];
}
