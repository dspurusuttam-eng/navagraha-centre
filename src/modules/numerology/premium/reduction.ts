// Card 12.1 — deterministic reduction utilities (pure).
import { MASTER_NUMBERS } from "@/modules/numerology/premium/constants";
import type { ReductionResult } from "@/modules/numerology/premium/types";

export function digitSum(value: number): number {
  return String(Math.abs(Math.trunc(value)))
    .split("")
    .reduce((acc, d) => acc + Number(d), 0);
}

/**
 * Reduce `input` to a single digit (1-9). When `retainMaster` is true, reduction
 * stops at 11/22/33. `compoundTotal` is the pre-reduction value carried through.
 */
export function reduce(input: number, retainMaster: boolean, compoundTotal?: number): ReductionResult {
  const start = Math.abs(Math.trunc(input));
  const steps: number[] = [start];
  let current = start;
  while (current > 9 && !(retainMaster && MASTER_NUMBERS.has(current))) {
    current = digitSum(current);
    steps.push(current);
  }
  return {
    ruleId: retainMaster ? "REDUCE_MASTER_RETAIN_V1" : "REDUCE_SINGLE_DIGIT_V1",
    input: start,
    compoundTotal: compoundTotal ?? start,
    steps,
    value: current,
    isMasterNumber: retainMaster && MASTER_NUMBERS.has(current),
  };
}
