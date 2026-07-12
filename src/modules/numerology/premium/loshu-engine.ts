// Card 12.1 — Lo Shu grid engine (pure).
// Base grid = DOB digits only, zeros excluded. Driver (Psychic) and Conductor
// (Destiny) are reported SEPARATELY as an overlay; the base grid is never modified.
import { LO_SHU_ARRANGEMENT, LO_SHU_LINES } from "@/modules/numerology/premium/constants";
import { calculateDateNumerology } from "@/modules/numerology/premium/date-engine";
import type { LoShuResult } from "@/modules/numerology/premium/types";

export function calculateLoShu(birthDate: string): LoShuResult {
  const date = calculateDateNumerology(birthDate);
  if (!date.valid) {
    return {
      status: "INVALID_INPUT",
      reason: date.reason,
      digitsUsed: [],
      frequency: {},
      missingNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      repeatedNumbers: [],
      grid: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
      completedLines: [],
      overlay: { driverNumber: null, conductorNumber: null, note: "Base grid unavailable — invalid date." },
      ruleIds: ["LOSHU_BASE_DOB_ONLY_V1"],
    };
  }

  const { year, month, day } = date.input;
  const raw = `${day}${month}${year}`;
  const digitsUsed = raw
    .split("")
    .map((c) => Number(c))
    .filter((d) => d >= 1 && d <= 9); // zero excluded per contract

  const frequency: Record<string, number> = {};
  for (let n = 1; n <= 9; n += 1) frequency[String(n)] = 0;
  for (const d of digitsUsed) frequency[String(d)] = (frequency[String(d)] ?? 0) + 1;

  const missingNumbers: number[] = [];
  const repeatedNumbers: number[] = [];
  for (let n = 1; n <= 9; n += 1) {
    const c = frequency[String(n)] ?? 0;
    if (c === 0) missingNumbers.push(n);
    if (c >= 2) repeatedNumbers.push(n);
  }

  // 3x3 Lo Shu grid of counts (in the fixed Lo Shu arrangement).
  const grid = LO_SHU_ARRANGEMENT.map((row) => row.map((n) => frequency[String(n)] ?? 0));

  const completedLines = LO_SHU_LINES.filter((line) =>
    line.cells.every((n) => (frequency[String(n)] ?? 0) >= 1)
  ).map((line) => ({ id: line.id, type: line.type, cells: [...line.cells] }));

  return {
    status: "CALCULATED",
    digitsUsed,
    frequency,
    missingNumbers,
    repeatedNumbers,
    grid,
    completedLines,
    overlay: {
      driverNumber: date.psychicNumber?.value ?? null,
      conductorNumber: date.destinyNumber?.value ?? null,
      note: "Overlay reported separately; base grid uses DOB digits only and is unchanged by driver/conductor.",
    },
    ruleIds: [
      "LOSHU_BASE_DOB_ONLY_V1",
      "LOSHU_FREQUENCY_V1",
      "LOSHU_LINES_V1",
      "LOSHU_OVERLAY_SEPARATE_V1",
    ],
  };
}
