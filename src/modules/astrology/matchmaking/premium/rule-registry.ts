// Card 10.2 — Immutable matchmaking rule registry.
//
// Every score, exception and Manglik result must reference a rule registered
// here; getMatchRule throws on an unregistered id, so no unregistered rule can
// affect the output.

export type MatchRule = {
  ruleId: string;
  basis: "classical" | "product";
  description: string;
};

const RULES: readonly MatchRule[] = [
  { ruleId: "VARNA_DIRECTIONAL_RANK", basis: "classical", description: "1 point when groom-role varna rank >= bride-role varna rank (symbolic Koota categories by sign element; never real caste)" },
  { ruleId: "VASHYA_CLASS_MATRIX", basis: "classical", description: "Pinned symmetric 5x5 Vashya class matrix (0/0.5/1/2); Sagittarius/Capricorn half-sign splits" },
  { ruleId: "TARA_BIDIRECTIONAL_RESIDUE", basis: "classical", description: "Inclusive nakshatra count both directions; residues {2,4,6,8,0} auspicious; 1.5 per auspicious direction" },
  { ruleId: "YONI_ANIMAL_MATRIX", basis: "classical", description: "27-nakshatra to 14-animal mapping with pinned symmetric 0..4 points table (symbolic categories only)" },
  { ruleId: "GRAHA_MAITRI_NATURAL_FRIENDSHIP", basis: "classical", description: "Moon-sign lords; natural planetary friendship; pinned 5/4/3/1/0 resolution" },
  { ruleId: "GANA_GROUP_MATRIX", basis: "classical", description: "Corrected classical 9/9/9 gana mapping with pinned symmetric 6/5/1/0 matrix (symbolic groups only)" },
  { ruleId: "BHAKOOT_DISTANCE_PAIRS", basis: "classical", description: "Directional modulo-12 sign distances; dosha pairs 2/12, 5/9, 6/8 score 0; all other pairs incl. same sign score 7" },
  { ruleId: "NADI_TABLE_GROUPS", basis: "classical", description: "Corrected classical 3x9 nadi table; same nadi 0, different nadi 8" },
  { ruleId: "MANGLIK_HOUSE_PLACEMENT", basis: "classical", description: "Mars in whole-sign house {1,2,4,7,8,12} counted separately from Lagna, Moon and Venus; raw detection only, cancellation deferred" },
  { ruleId: "MANGLIK_MUTUAL_COMPARISON", basis: "product", description: "Structural comparison of both charts' raw Manglik reference flags: balanced / unbalanced / mixed / unavailable" },
  { ruleId: "EXCEPTION_BHAKOOT_SAME_LORD", basis: "classical", description: "Bhakoot dosha cancellation applicable when both Moon signs share one lord (raw score unchanged)" },
  { ruleId: "EXCEPTION_BHAKOOT_FRIENDLY_LORDS", basis: "classical", description: "Bhakoot dosha cancellation applicable when the two Moon-sign lords are mutual natural friends (raw score unchanged)" },
  { ruleId: "EXCEPTION_NADI_SAME_NAK_DIFF_PADA", basis: "classical", description: "Nadi dosha cancellation applicable when both Moons share a nakshatra but occupy different padas (raw score unchanged)" },
  { ruleId: "EXCEPTION_NADI_SAME_RASHI_DIFF_NAK", basis: "classical", description: "Nadi dosha cancellation applicable when both Moons share a rashi but different nakshatras (raw score unchanged)" },
  { ruleId: "EXCEPTION_NADI_SIGN_LORD", basis: "classical", description: "Nadi dosha cancellation applicable when both Moon signs share one lord (documented variant; raw score unchanged)" },
  { ruleId: "PRODUCT_PRESENTATION_SEVERITY", basis: "product", description: "Manglik flagged-reference count presented as none/single_reference/multi_reference; product label, not classical certainty" },
  { ruleId: "PRODUCT_PRESENTATION_RECOMMENDATION", basis: "product", description: "Legacy recommendation level from raw score ratio; presentation band only, never approval or rejection" },
] as const;

const INDEX = new Map(RULES.map((rule) => [rule.ruleId, rule] as const));

export const MATCH_RULE_REGISTRY: readonly MatchRule[] = RULES;

export function getMatchRule(ruleId: string): MatchRule {
  const rule = INDEX.get(ruleId);

  if (!rule) {
    throw new Error(
      `Unregistered matchmaking rule "${ruleId}". Every score/exception must reference a registered rule.`
    );
  }

  return rule;
}
