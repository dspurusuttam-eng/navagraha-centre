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

const purposeCatalog: Record<DivisionalReadinessCode, Omit<DivisionalInterpretationPurpose, "code">> =
  {
    D1: {
      title: "Rashi / Lagna",
      summary: "Core life body, baseline identity, and whole-chart expression.",
      next_step: "Use as the production baseline for every other divisional layer.",
    },
    D4: {
      title: "Chaturthamsha",
      summary: "Home, property, roots, and settlement themes.",
      next_step: "Attach a formula-backed D4 engine when it is approved.",
    },
    D7: {
      title: "Saptamsa",
      summary: "Children, creativity, progeny, and legacy themes.",
      next_step: "Attach a formula-backed D7 engine when it is approved.",
    },
    D9: {
      title: "Navamsa",
      summary: "Dharma, marriage, spiritual ripening, and inner strength.",
      next_step: "Attach a formula-backed D9 engine when it is approved.",
    },
    D10: {
      title: "Dashamsa",
      summary: "Career, status, and professional contribution.",
      next_step: "Attach a formula-backed D10 engine when it is approved.",
    },
    D12: {
      title: "Dwadashamsha",
      summary: "Lineage, parents, and family-root patterning.",
      next_step: "Attach a formula-backed D12 engine when it is approved.",
    },
    D60: {
      title: "Shashtiamsha",
      summary: "Deep karmic refinement and high-precision narrative work.",
      next_step: "Attach a high-precision D60 engine only after dedicated certification.",
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
