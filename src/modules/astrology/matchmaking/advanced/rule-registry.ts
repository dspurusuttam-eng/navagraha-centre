// Card 10A.2 — Immutable advanced-matchmaking rule registry.
// Every advanced evidence token references a rule registered here.

export type AdvancedRule = {
  ruleId: string;
  layer: "MANGLIK" | "D1" | "D9" | "DASHA" | "CONTRADICTION" | "PRODUCT";
  basis: "classical" | "product";
  description: string;
};

const RULES: readonly AdvancedRule[] = [
  // Manglik (mitigation subset; raw unchanged)
  { ruleId: "MANGLIK_ADV_MARS_OWN_SIGN", layer: "MANGLIK", basis: "classical", description: "Mars in own sign (Aries/Scorpio) in D1 mitigates raw Manglik" },
  { ruleId: "MANGLIK_ADV_MARS_EXALTED", layer: "MANGLIK", basis: "classical", description: "Mars exalted (Capricorn) in D1 mitigates raw Manglik" },
  { ruleId: "MANGLIK_ADV_JUPITER_CONJUNCT_MARS", layer: "MANGLIK", basis: "classical", description: "Jupiter conjoins Mars (same D1 sign) mitigates raw Manglik" },
  { ruleId: "MANGLIK_ADV_JUPITER_ASPECTS_MARS", layer: "MANGLIK", basis: "classical", description: "Jupiter Parashari aspect (5/7/9) on Mars sign mitigates raw Manglik" },
  { ruleId: "MANGLIK_ADV_MUTUAL_BALANCE", layer: "MANGLIK", basis: "classical", description: "Both charts raw-flagged -> mutual Manglik balance" },
  { ruleId: "MANGLIK_ADV_D9_MARS_DIGNIFIED", layer: "MANGLIK", basis: "classical", description: "Mars own/exalted in D9 -> contextual confirmation only (not a cancellation)" },

  // D1 natal compatibility
  { ruleId: "D1_COMPAT_LAGNA_LORD_FRIENDSHIP", layer: "D1", basis: "classical", description: "Natural friendship between the two Lagna lords" },
  { ruleId: "D1_COMPAT_SEVENTH_LORD_FRIENDSHIP", layer: "D1", basis: "classical", description: "Natural friendship between the two 7th lords" },
  { ruleId: "D1_COMPAT_VENUS_RELATION", layer: "D1", basis: "classical", description: "Natural relationship between the two Venus dispositors (relationship karaka)" },
  { ruleId: "D1_COMPAT_SEVENTH_BENEFIC_SUPPORT", layer: "D1", basis: "classical", description: "Benefic occupies or aspects the 7th house (per person)" },
  { ruleId: "D1_COMPAT_SEVENTH_MALEFIC_STRESS", layer: "D1", basis: "classical", description: "Malefic occupies or aspects the 7th house without benefic relief (per person)" },
  { ruleId: "D1_COMPAT_SEVENTH_LORD_DIGNITY", layer: "D1", basis: "classical", description: "7th lord own/exalted (support) or debilitated (caution) (per person)" },

  // D9 navamsha compatibility (contextual)
  { ruleId: "D9_COMPAT_SEVENTH_LORD_FRIENDSHIP", layer: "D9", basis: "classical", description: "Natural friendship between the two D9 7th lords (contextual)" },
  { ruleId: "D9_COMPAT_VENUS_DIGNITY", layer: "D9", basis: "classical", description: "D9 Venus own/exalted (support) or debilitated (caution), contextual" },
  { ruleId: "D9_COMPAT_VARGOTTAMA_REINFORCE", layer: "D9", basis: "classical", description: "Vargottama (same sign D1 & D9) for Lagna/7th-lord/Venus reinforces D1 (contextual, <= +/-1)" },

  // Dasha compatibility
  { ruleId: "DASHA_COMPAT_RELATIONSHIP_ACTIVE", layer: "DASHA", basis: "product", description: "Active Maha/Antar lord is a relationship significator (Venus/Jupiter/7th-lord/Lagna-lord)" },
  { ruleId: "DASHA_COMPAT_SUPPORTIVE_OVERLAP", layer: "DASHA", basis: "product", description: "Both charts running relationship-supportive periods simultaneously" },
  { ruleId: "DASHA_SANDHI_MAHA", layer: "DASHA", basis: "product", description: "Within +/-45 days of a Mahadasha boundary (threshold product-normalization)" },
  { ruleId: "DASHA_SANDHI_ANTAR", layer: "DASHA", basis: "product", description: "Within +/-10 days of an Antardasha boundary (threshold product-normalization)" },
  { ruleId: "DASHA_SANDHI_SIMULTANEOUS", layer: "DASHA", basis: "product", description: "Both charts in a Dasha Sandhi at the evaluation instant" },
  { ruleId: "DASHA_SANDHI_ONE_SIDED", layer: "DASHA", basis: "product", description: "Only one chart in a Dasha Sandhi at the evaluation instant" },

  // Contradictions
  { ruleId: "CONTRADICTION_ASHTAKOOT_VS_MANGLIK", layer: "CONTRADICTION", basis: "product", description: "Strong Ashtakoot vs unbalanced Manglik" },
  { ruleId: "CONTRADICTION_D1_VS_D9", layer: "CONTRADICTION", basis: "product", description: "D1 supportive vs D9 caution (or vice versa)" },
  { ruleId: "CONTRADICTION_DASHA_ASYMMETRIC", layer: "CONTRADICTION", basis: "product", description: "One chart supportive period, the other adverse/Sandhi" },

  // Product summary
  { ruleId: "PRODUCT_SUMMARY_OVERALL_BAND", layer: "PRODUCT", basis: "product", description: "Overall band (supportive/mixed/caution/incomplete/unavailable) from section statuses; product normalization" },
] as const;

const INDEX = new Map(RULES.map((rule) => [rule.ruleId, rule] as const));

export const ADVANCED_RULE_REGISTRY: readonly AdvancedRule[] = RULES;

export function getAdvancedRule(ruleId: string): AdvancedRule {
  const rule = INDEX.get(ruleId);

  if (!rule) {
    throw new Error(
      `Unregistered advanced matchmaking rule "${ruleId}". Every evidence token must reference a registered rule.`
    );
  }

  return rule;
}
