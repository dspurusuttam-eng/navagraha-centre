// Card 14.2B1 — evidence-token builder (pure). Every token's basis is pulled from
// the registry (throws on unknown ruleId), so factors can never emit an unregistered rule.
import { makeVarshaphalEvidenceId } from "@/modules/varshaphal/premium/constants";
import { getVarshaphalRule } from "@/modules/varshaphal/premium/rule-registry";
import type {
  VarshaphalEvidenceToken,
  VarshaphalFactorId,
  VarshaphalFactorStatus,
  VarshaphalTier,
} from "@/modules/varshaphal/premium/types";

export function buildToken(
  ruleId: string,
  factor: VarshaphalFactorId,
  tier: VarshaphalTier,
  status: VarshaphalFactorStatus,
  note: string,
  idParts: readonly (string | number)[],
): VarshaphalEvidenceToken {
  const rule = getVarshaphalRule(ruleId); // throws on unknown
  return {
    ruleId,
    evidenceId: makeVarshaphalEvidenceId(idParts),
    factor,
    tier,
    basis: rule.basis,
    status,
    note,
  };
}

export type EngineUnavailable = { code: string; message: string };
