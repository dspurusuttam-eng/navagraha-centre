import {
  calculateJyotishYogaRuleEngine,
  type YogaRuleEngineResult,
} from "@/lib/astrology/rules/yoga-rule-engine";
import type { UnifiedSiderealChart } from "@/modules/astrology/chart-contract-types";

export type YogaRuleContextResult = YogaRuleEngineResult;

export function getYogaRuleContextForChart(input: {
  chart: UnifiedSiderealChart | null | undefined;
}): YogaRuleContextResult {
  return calculateJyotishYogaRuleEngine({
    chart: input.chart,
  });
}
