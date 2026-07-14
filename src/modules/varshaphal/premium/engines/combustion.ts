// Card 14.2B2 — combustion engine (pure). Contract §10 / 14.1A decision 4.
// The combustion arc is INJECTED by reference (the certified COMBUSTION_THRESHOLDS,
// see COMBUSTION_ARC_SOURCE) — no numeric arc is duplicated in this module. Sun/Moon/
// nodes are not subject to combustion in V1 (arc supplied as null → not applicable).
import { COMBUSTION_ARC_SOURCE } from "@/modules/varshaphal/premium/constants";
import type { TajikaGraha, VarshaphalEvidenceToken, VarshaphalTier } from "@/modules/varshaphal/premium/types";
import { buildToken } from "@/modules/varshaphal/premium/engines/token";
import { minimalSeparation } from "@/modules/varshaphal/premium/engines/geometry";

export type CombustionInput = {
  graha: TajikaGraha;
  planetLongitudeDeg: number;
  sunLongitudeDeg: number;
  /** Certified combustion arc (deg) for this graha; null = not applicable (excluded body). */
  combustionArcDeg: number | null;
};

export type CombustionResult = {
  applicable: boolean;
  combust: boolean;
  arcFromSunDeg: number;
  tier: VarshaphalTier;
  tokens: VarshaphalEvidenceToken[];
};

export function evaluateCombustion(input: CombustionInput): CombustionResult {
  const { graha, planetLongitudeDeg, sunLongitudeDeg, combustionArcDeg } = input;
  const arcFromSunDeg = minimalSeparation(planetLongitudeDeg, sunLongitudeDeg);
  const applicable = graha !== "SUN" && graha !== "MOON" && combustionArcDeg != null && Number.isFinite(combustionArcDeg);

  if (!applicable) {
    return {
      applicable: false, combust: false, arcFromSunDeg, tier: 0,
      tokens: [buildToken("COMBUSTION_V1", "COMBUSTION", 0, "NEUTRAL",
        `${graha}: combustion not applicable (source ${COMBUSTION_ARC_SOURCE.symbol})`, ["COMBUST_NA", graha])],
    };
  }

  const combust = arcFromSunDeg <= (combustionArcDeg as number);
  const tier: VarshaphalTier = combust ? -1 : 0;
  const status = combust ? "CAUTION" : "NEUTRAL";
  return {
    applicable: true, combust, arcFromSunDeg, tier,
    tokens: [buildToken("COMBUSTION_V1", "COMBUSTION", tier, status,
      `${graha} arc ${arcFromSunDeg.toFixed(2)} vs certified ${combustionArcDeg}deg -> combust=${combust}`, ["COMBUST", graha, combust ? 1 : 0])],
  };
}
