// Card 10A.2 — Evidence token factory + dedup/split helpers (pure).
// Tokens are created only via makeToken(), which resolves basis/provenance
// from the immutable rule registry (getAdvancedRule throws on unregistered).

import { getAdvancedRule } from "@/modules/astrology/matchmaking/advanced/rule-registry";
import type {
  AdvancedEvidenceToken,
  EvidenceTier,
  PersonScope,
  SourceChart,
  SourceLayer,
} from "@/modules/astrology/matchmaking/advanced/types";

export function makeToken(input: {
  ruleId: string;
  sourceLayer: SourceLayer;
  sourceChart: SourceChart;
  personScope: PersonScope;
  category: string;
  tier: EvidenceTier;
  conditionKey: string;
  calculationReference: string;
  detail?: string;
}): AdvancedEvidenceToken {
  const rule = getAdvancedRule(input.ruleId);

  return {
    evidenceId: `${input.sourceLayer}:${input.ruleId}:${input.conditionKey}`,
    ruleId: rule.ruleId,
    sourceLayer: input.sourceLayer,
    sourceChart: input.sourceChart,
    personScope: input.personScope,
    category: input.category,
    tier: input.tier,
    basis: input.detail ?? rule.description,
    classicalOrProduct: rule.basis,
    conditionKey: input.conditionKey,
    calculationReference: input.calculationReference,
  };
}

/** Dedup by conditionKey, keeping the maximum-magnitude tier (ties: first). */
export function dedupeTokens(tokens: AdvancedEvidenceToken[]): AdvancedEvidenceToken[] {
  const byKey = new Map<string, AdvancedEvidenceToken>();

  for (const token of tokens) {
    const existing = byKey.get(token.conditionKey);
    if (!existing || Math.abs(token.tier) > Math.abs(existing.tier)) {
      byKey.set(token.conditionKey, token);
    }
  }

  return [...byKey.values()];
}

export function splitEvidence(tokens: AdvancedEvidenceToken[]) {
  return {
    supportive: tokens.filter((t) => t.tier > 0),
    caution: tokens.filter((t) => t.tier < 0),
    neutral: tokens.filter((t) => t.tier === 0),
  };
}
