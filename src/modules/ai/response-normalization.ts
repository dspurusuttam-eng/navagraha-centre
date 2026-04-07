import type { ChartInterpretationResult } from "@/modules/ai/types";

function normalizeText(value: string) {
  return value.trim().replace(/\n{3,}/g, "\n\n");
}

export function normalizeChartInterpretationResult(
  result: ChartInterpretationResult
): ChartInterpretationResult {
  return {
    ...result,
    generatedAtUtc: new Date(result.generatedAtUtc).toISOString(),
    summary: normalizeText(result.summary),
    caution: normalizeText(result.caution),
    sections: result.sections.map((section) => ({
      ...section,
      title: normalizeText(section.title),
      body: normalizeText(section.body),
    })),
  };
}
