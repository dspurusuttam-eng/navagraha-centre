// Card 12.1 — Pythagorean name numerology engine (pure).
// Expression, Soul Urge (vowels AEIOU; Y consonant V1), Personality (consonants).
// Master numbers 11/22/33 retained per contract.
import { PYTHAGOREAN_TABLE } from "@/modules/numerology/premium/constants";
import { computeNameNumerology } from "@/modules/numerology/premium/name-shared";
import type { NameNumerologyResult } from "@/modules/numerology/premium/types";

export function calculatePythagoreanNumerology(name: string | undefined | null): NameNumerologyResult {
  return computeNameNumerology(name, {
    system: "PYTHAGOREAN",
    table: PYTHAGOREAN_TABLE,
    retainMaster: true,
    computeSoulPersonality: true,
    expressionRuleId: "PYTHAGOREAN_EXPRESSION_V1",
    baseRuleIds: [
      "PYTHAGOREAN_TABLE_V1",
      "PYTHAGOREAN_SOUL_URGE_V1",
      "PYTHAGOREAN_PERSONALITY_V1",
    ],
  });
}
