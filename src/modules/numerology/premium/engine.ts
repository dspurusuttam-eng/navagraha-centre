// Card 12.1 — orchestrator (pure). Builds the versioned premium numerology snapshot.
// Systems remain SEPARATE (Chaldean and Pythagorean never mixed). No compatibility
// percentage. No prediction/remedy/sales language.
import { calculateDateNumerology } from "@/modules/numerology/premium/date-engine";
import { calculateChaldeanNumerology } from "@/modules/numerology/premium/chaldean-engine";
import { calculatePythagoreanNumerology } from "@/modules/numerology/premium/pythagorean-engine";
import { calculateLoShu } from "@/modules/numerology/premium/loshu-engine";
import { compareNumbers } from "@/modules/numerology/premium/compatibility-engine";
import {
  NUMEROLOGY_PREMIUM_CONTRACT_VERSION,
  NUMEROLOGY_PREMIUM_CONVENTIONS,
  NUMEROLOGY_PREMIUM_DISCLAIMER,
  type CompatibilityResult,
  type PremiumNumerologyInput,
  type PremiumNumerologySnapshot,
  type ResultStatus,
} from "@/modules/numerology/premium/types";

function composeFullName(input: PremiumNumerologyInput): string | undefined {
  if (input.fullName && input.fullName.trim().length > 0) return input.fullName;
  const parts = [input.nameParts?.first, input.nameParts?.middle, input.nameParts?.surname]
    .map((p) => (p ?? "").trim())
    .filter((p) => p.length > 0);
  return parts.length > 0 ? parts.join(" ") : undefined;
}

export function buildPremiumNumerologySnapshot(input: PremiumNumerologyInput): PremiumNumerologySnapshot {
  const unavailableReasons: PremiumNumerologySnapshot["unavailableReasons"] = [];

  // --- Date + Lo Shu ---
  const date = input.birthDate ? calculateDateNumerology(input.birthDate) : null;
  const loShu = input.birthDate ? calculateLoShu(input.birthDate) : null;
  if (!input.birthDate) {
    unavailableReasons.push({ system: "DATE", code: "MISSING_BIRTH_DATE", message: "No birth date supplied." });
    unavailableReasons.push({ system: "LOSHU", code: "MISSING_BIRTH_DATE", message: "No birth date supplied." });
  } else {
    if (date?.status !== "CALCULATED") unavailableReasons.push({ system: "DATE", code: date?.status ?? "UNAVAILABLE", message: date?.reason ?? "date unavailable" });
    if (loShu?.status !== "CALCULATED") unavailableReasons.push({ system: "LOSHU", code: loShu?.status ?? "UNAVAILABLE", message: loShu?.reason ?? "lo shu unavailable" });
  }

  // --- Name systems (kept STRICTLY separate) ---
  const composed = composeFullName(input);
  const chaldean = composed ? calculateChaldeanNumerology(composed) : null;
  const pythagorean = composed ? calculatePythagoreanNumerology(composed) : null;
  if (!composed) {
    unavailableReasons.push({ system: "CHALDEAN", code: "MISSING_NAME", message: "No name supplied." });
    unavailableReasons.push({ system: "PYTHAGOREAN", code: "MISSING_NAME", message: "No name supplied." });
  } else {
    if (chaldean?.status !== "CALCULATED") unavailableReasons.push({ system: "CHALDEAN", code: chaldean?.status ?? "UNAVAILABLE", message: chaldean?.reason ?? "chaldean unavailable" });
    if (pythagorean?.status !== "CALCULATED") unavailableReasons.push({ system: "PYTHAGOREAN", code: pythagorean?.status ?? "UNAVAILABLE", message: pythagorean?.reason ?? "pythagorean unavailable" });
  }

  // --- Compatibility (per-system, never mixed, never a percentage) ---
  const compatibility: CompatibilityResult[] = [];
  if (input.partnerBirthDate || input.partnerFullName) {
    const partnerDate = input.partnerBirthDate ? calculateDateNumerology(input.partnerBirthDate) : null;
    const partnerName = input.partnerFullName;
    // Date-vs-date (Psychic and Destiny — separate rows)
    compatibility.push(
      compareNumbers(
        "DATE_PSYCHIC",
        date?.psychicNumber?.value ?? null,
        partnerDate?.psychicNumber?.value ?? null
      )
    );
    compatibility.push(
      compareNumbers(
        "DATE_DESTINY",
        date?.destinyNumber?.isMasterNumber ? reduceMaster(date.destinyNumber.value) : date?.destinyNumber?.value ?? null,
        partnerDate?.destinyNumber?.isMasterNumber ? reduceMaster(partnerDate.destinyNumber.value) : partnerDate?.destinyNumber?.value ?? null
      )
    );
    // Same-system name comparisons (only if the same system is available on both sides).
    if (composed && partnerName) {
      const chB = calculateChaldeanNumerology(partnerName);
      const pyB = calculatePythagoreanNumerology(partnerName);
      compatibility.push(
        compareNumbers(
          "CHALDEAN_EXPRESSION",
          chaldean?.status === "CALCULATED" ? chaldean.expression?.value ?? null : null,
          chB.status === "CALCULATED" ? chB.expression?.value ?? null : null
        )
      );
      compatibility.push(
        compareNumbers(
          "PYTHAGOREAN_EXPRESSION",
          pythagorean?.status === "CALCULATED"
            ? maybeReduceMaster(pythagorean.expression?.value ?? null, pythagorean.expression?.isMasterNumber ?? false)
            : null,
          pyB.status === "CALCULATED"
            ? maybeReduceMaster(pyB.expression?.value ?? null, pyB.expression?.isMasterNumber ?? false)
            : null
        )
      );
    } else {
      compatibility.push({
        status: "UNAVAILABLE",
        system: "NAME_COMPATIBILITY",
        a: null,
        b: null,
        relationship: "UNAVAILABLE",
        evidenceIds: [],
        ruleIds: ["COMPAT_UNAVAILABLE_V1", "COMPAT_SYSTEM_SEPARATE_V1"],
        reason: "Both names required for name-based compatibility.",
      });
    }
  }

  const anyOk = [date?.status, chaldean?.status, pythagorean?.status, loShu?.status].some((s) => s === "CALCULATED");
  const status: ResultStatus = anyOk ? "CALCULATED" : "UNAVAILABLE";

  return {
    status,
    contractVersion: NUMEROLOGY_PREMIUM_CONTRACT_VERSION,
    conventions: NUMEROLOGY_PREMIUM_CONVENTIONS,
    date,
    chaldean,
    pythagorean,
    loShu,
    compatibility,
    unavailableReasons,
    disclaimer: NUMEROLOGY_PREMIUM_DISCLAIMER,
  };
}

// For compatibility comparisons the matrix is 1-9; masters are reduced only for the
// symmetric relationship lookup (the original master value is preserved in the source
// snapshot). This keeps the matrix well-defined without mutating other outputs.
function reduceMaster(v: number): number {
  return v === 11 ? 2 : v === 22 ? 4 : v === 33 ? 6 : v;
}
function maybeReduceMaster(v: number | null, isMaster: boolean): number | null {
  if (v == null) return null;
  return isMaster ? reduceMaster(v) : v;
}
