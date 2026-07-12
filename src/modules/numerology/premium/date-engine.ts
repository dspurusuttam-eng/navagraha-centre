// Card 12.1 — date numerology engine (pure). Moolank/Psychic + Bhagyank/Life Path.
import { reduce, digitSum } from "@/modules/numerology/premium/reduction";
import type { DateNumerologyResult } from "@/modules/numerology/premium/types";

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
export function daysInMonth(year: number, month: number): number {
  const table = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return table[month - 1] ?? 0;
}

function invalid(iso: string, reason: string): DateNumerologyResult {
  const m = iso.match(ISO_RE);
  return {
    status: "INVALID_INPUT",
    reason,
    input: { year: m ? Number(m[1]) : 0, month: m ? Number(m[2]) : 0, day: m ? Number(m[3]) : 0, iso },
    valid: false,
    psychicNumber: null,
    destinyNumber: null,
    compoundTotal: null,
    components: null,
    ruleIds: ["DATE_GREGORIAN_VALIDATION_V1"],
  };
}

export function calculateDateNumerology(birthDate: string): DateNumerologyResult {
  const iso = (birthDate ?? "").trim();
  const m = iso.match(ISO_RE);
  if (!m) return invalid(iso, "Birth date must be an ISO Gregorian date (YYYY-MM-DD).");
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12) return invalid(iso, `Invalid month ${month}.`);
  if (year < 1) return invalid(iso, `Invalid year ${year}.`);
  const dim = daysInMonth(year, month);
  if (day < 1 || day > dim) return invalid(iso, `Invalid day ${day} for ${year}-${String(month).padStart(2, "0")} (max ${dim}).`);

  const daySum = digitSum(day);
  const monthSum = digitSum(month);
  const yearSum = digitSum(year);
  const compoundTotal = daySum + monthSum + yearSum;

  // Psychic / Moolank / Birth Number: day reduced to a single digit (no master).
  const psychicNumber = reduce(day, false, day);

  // Destiny / Life Path / Bhagyank: component reduction, master-preserving.
  const dayReducedR = reduce(day, true, day);
  const monthReducedR = reduce(month, true, month);
  const yearReducedR = reduce(year, true, year);
  const lifePathInput = dayReducedR.value + monthReducedR.value + yearReducedR.value;
  const destinyNumber = reduce(lifePathInput, true, compoundTotal);

  return {
    status: "CALCULATED",
    input: { year, month, day, iso },
    valid: true,
    psychicNumber,
    destinyNumber,
    compoundTotal,
    components: {
      daySum,
      monthSum,
      yearSum,
      dayReduced: dayReducedR.value,
      monthReduced: monthReducedR.value,
      yearReduced: yearReducedR.value,
    },
    ruleIds: [
      "DATE_GREGORIAN_VALIDATION_V1",
      "DATE_MOOLANK_PSYCHIC_V1",
      "DATE_BHAGYANK_LIFEPATH_V1",
      "DATE_COMPOUND_TOTAL_V1",
    ],
  };
}
