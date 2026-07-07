import type {
  DivisionalChartReadiness,
  DivisionalReadinessCode,
} from "@/modules/astrology/types";

export type DivisionalInterpretationPurpose = {
  code: DivisionalReadinessCode;
  title: string;
  summary: string;
  next_step: string;
};

export type DivisionalInterpretationReadiness = {
  code: DivisionalReadinessCode;
  title: string;
  purpose: DivisionalInterpretationPurpose;
  chart_status: DivisionalChartReadiness["status"];
  safe_summary: string;
};

const IMPLEMENTED_NEXT_STEP =
  "Sign placements are computed from verified natal longitudes; interpretation layering is a separate future card.";

const purposeCatalog: Record<DivisionalReadinessCode, Omit<DivisionalInterpretationPurpose, "code">> =
  {
    D1: {
      title: "Rashi / Lagna",
      summary: "Core life body, baseline identity, and whole-chart expression.",
      next_step: "Use as the production baseline for every other divisional layer.",
    },
    D2: {
      title: "Hora",
      summary: "Resources, sustenance, and wealth orientation.",
      next_step: IMPLEMENTED_NEXT_STEP,
    },
    D3: {
      title: "Drekkana",
      summary: "Siblings, courage, and personal initiative.",
      next_step: IMPLEMENTED_NEXT_STEP,
    },
    D4: {
      title: "Chaturthamsha",
      summary: "Home, property, roots, and settlement themes.",
      next_step: IMPLEMENTED_NEXT_STEP,
    },
    D7: {
      title: "Saptamsa",
      summary: "Children, creativity, progeny, and legacy themes.",
      next_step: IMPLEMENTED_NEXT_STEP,
    },
    D9: {
      title: "Navamsa",
      summary: "Dharma, marriage, spiritual ripening, and inner strength.",
      next_step: IMPLEMENTED_NEXT_STEP,
    },
    D10: {
      title: "Dashamsa",
      summary: "Career, status, and professional contribution.",
      next_step: IMPLEMENTED_NEXT_STEP,
    },
    D12: {
      title: "Dwadashamsha",
      summary: "Lineage, parents, and family-root patterning.",
      next_step: IMPLEMENTED_NEXT_STEP,
    },
    D16: {
      title: "Shodashamsha",
      summary: "Comforts, conveyances, and inner contentment.",
      next_step: IMPLEMENTED_NEXT_STEP,
    },
    D20: {
      title: "Vimshamsha",
      summary: "Devotional practice and spiritual discipline.",
      next_step: IMPLEMENTED_NEXT_STEP,
    },
    D24: {
      title: "Chaturvimshamsha",
      summary: "Learning, knowledge, and study patterns.",
      next_step: IMPLEMENTED_NEXT_STEP,
    },
    D27: {
      title: "Bhamsha",
      summary: "Underlying strengths and subtle vitality.",
      next_step: IMPLEMENTED_NEXT_STEP,
    },
    D30: {
      title: "Trimshamsha",
      summary: "Challenges, resilience, and self-protection themes.",
      next_step: IMPLEMENTED_NEXT_STEP,
    },
    D40: {
      title: "Khavedamsha",
      summary: "Maternal lineage tone and habitual patterns.",
      next_step: IMPLEMENTED_NEXT_STEP,
    },
    D45: {
      title: "Akshavedamsha",
      summary: "Paternal lineage tone and conduct patterns.",
      next_step: IMPLEMENTED_NEXT_STEP,
    },
    D60: {
      title: "Shashtiamsha",
      summary: "Deep karmic refinement and high-precision narrative work.",
      next_step: IMPLEMENTED_NEXT_STEP,
    },
  };

export function buildDivisionalInterpretationReadiness(
  readiness: readonly DivisionalChartReadiness[]
): DivisionalInterpretationReadiness[] {
  return readiness.map((entry) => {
    const purpose = purposeCatalog[entry.code];

    return {
      code: entry.code,
      title: entry.title,
      purpose: {
        code: entry.code,
        ...purpose,
      },
      chart_status: entry.status,
      safe_summary:
        entry.chart === null
          ? `${entry.title} is not available yet. ${entry.note}`
          : `${entry.title} is available as a safe foundation layer and can support future interpretation without changing the existing chart contract.`,
    };
  });
}
