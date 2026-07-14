// Card 14.2B2 — Varshesha (year-lord) selection (pure). Contract §13.
// Deterministic: highest Panchavargeeya Bala among eligible Panchadhikaris (in Ithasala
// with the Muntha/Lagna lord); ties broken by the pinned candidate priority order.
import { VARSHESHA_TIEBREAK_ORDER, type VarsheshaCandidateId } from "@/modules/varshaphal/premium/constants";
import type { TajikaGraha, VarshaphalEvidenceToken } from "@/modules/varshaphal/premium/types";
import { buildToken, type EngineUnavailable } from "@/modules/varshaphal/premium/engines/token";

const BALA_TIE_EPSILON = 1e-9;

export type VarsheshaCandidateInput = {
  id: VarsheshaCandidateId;
  graha: TajikaGraha | null;
  balaVishwa: number | null;
  /** Classical eligibility: an Ithasala with the Muntha lord or the Lagna lord. */
  hasIthasalaWithMunthaOrLagnaLord: boolean;
};

export type VarsheshaResult = {
  status: "CALCULATED" | "PARTIAL" | "UNAVAILABLE";
  varshesha: { id: VarsheshaCandidateId; graha: TajikaGraha; balaVishwa: number } | null;
  weakYearLord: boolean;
  eligibleCount: number;
  tokens: VarshaphalEvidenceToken[];
  unavailableReasons: EngineUnavailable[];
};

const priority = (id: VarsheshaCandidateId): number => {
  const i = VARSHESHA_TIEBREAK_ORDER.indexOf(id);
  return i < 0 ? Number.MAX_SAFE_INTEGER : i;
};

export function selectVarshesha(candidates: readonly VarsheshaCandidateInput[]): VarsheshaResult {
  const tokens: VarshaphalEvidenceToken[] = [];
  const unavailableReasons: EngineUnavailable[] = [];

  const available = candidates.filter((c) => c.graha !== null && c.balaVishwa !== null);
  if (available.length === 0) {
    unavailableReasons.push({ code: "YEAR_LORD_INDETERMINATE", message: "No available Panchadhikari candidate for Varshesha." });
    return { status: "UNAVAILABLE", varshesha: null, weakYearLord: false, eligibleCount: 0, tokens, unavailableReasons };
  }

  const eligible = available.filter((c) => c.hasIthasalaWithMunthaOrLagnaLord);
  const weakYearLord = eligible.length === 0;
  const pool = weakYearLord ? available : eligible;

  // Highest Bala; ties -> pinned candidate priority; final -> stable by priority.
  const winner = [...pool].sort((a, b) => {
    const diff = (b.balaVishwa as number) - (a.balaVishwa as number);
    if (Math.abs(diff) > BALA_TIE_EPSILON) return diff;
    return priority(a.id) - priority(b.id);
  })[0]!;

  tokens.push(buildToken("VARSHESHA_SELECTION_V1", "VARSHESHA", 0, "NEUTRAL",
    `Varshesha ${winner.graha} (${winner.id}) bala ${(winner.balaVishwa as number).toFixed(2)}; eligible=${eligible.length}; weak=${weakYearLord}`,
    ["VARSHESHA", winner.id, winner.graha as TajikaGraha]));
  tokens.push(buildToken("VARSHESHA_TIEBREAK_V1", "VARSHESHA", 0, "NEUTRAL",
    "Tie-break order: Muntha > Varsha Lagna > Janma Lagna > Trirashi > Dinaratri lord", ["VARSHESHA_TIEBREAK"]));

  return {
    status: available.length < candidates.length ? "PARTIAL" : "CALCULATED",
    varshesha: { id: winner.id, graha: winner.graha as TajikaGraha, balaVishwa: winner.balaVishwa as number },
    weakYearLord,
    eligibleCount: eligible.length,
    tokens,
    unavailableReasons,
  };
}
