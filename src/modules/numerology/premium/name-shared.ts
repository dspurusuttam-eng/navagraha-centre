// Card 12.1 — shared name-numerology core (pure). Used by the Chaldean & Pythagorean engines.
import { VOWELS_V1 } from "@/modules/numerology/premium/constants";
import { reduce } from "@/modules/numerology/premium/reduction";
import { normalizeName } from "@/modules/numerology/premium/normalizer";
import type { NameNumerologyResult, NamePartValue } from "@/modules/numerology/premium/types";

type Opts = {
  system: "CHALDEAN" | "PYTHAGOREAN";
  table: Readonly<Record<string, number>>;
  retainMaster: boolean;
  computeSoulPersonality: boolean;
  expressionRuleId: string;
  baseRuleIds: string[];
};

export function computeNameNumerology(raw: string | undefined | null, opts: Opts): NameNumerologyResult {
  const normalization = normalizeName(raw);
  const empty: NameNumerologyResult = {
    system: opts.system,
    status: normalization.status,
    reason: normalization.reason,
    normalization,
    expression: null,
    soulUrge: null,
    personality: null,
    parts: [],
    letterValues: [],
    ruleIds: [normalization.ruleId, ...opts.baseRuleIds],
  };
  if (normalization.status !== "CALCULATED") return empty;

  const letters = normalization.latinLetters.split("");
  const letterValues = letters.map((letter) => ({ letter, value: opts.table[letter] ?? 0 }));
  const sumOf = (subset: string[]) => subset.reduce((acc, l) => acc + (opts.table[l] ?? 0), 0);

  const fullCompound = sumOf(letters);
  const expression = reduce(fullCompound, opts.retainMaster, fullCompound);

  const parts: NamePartValue[] = normalization.parts.map((part) => {
    const compound = sumOf(part.split(""));
    const r = reduce(compound, opts.retainMaster, compound);
    return { part, compoundTotal: compound, value: r.value, isMasterNumber: r.isMasterNumber };
  });

  let soulUrge = null;
  let personality = null;
  if (opts.computeSoulPersonality) {
    const vowels = letters.filter((l) => VOWELS_V1.has(l));
    const consonants = letters.filter((l) => !VOWELS_V1.has(l));
    const vSum = sumOf(vowels);
    const cSum = sumOf(consonants);
    soulUrge = reduce(vSum, opts.retainMaster, vSum);
    personality = reduce(cSum, opts.retainMaster, cSum);
  }

  return {
    system: opts.system,
    status: "CALCULATED",
    normalization,
    expression,
    soulUrge,
    personality,
    parts,
    letterValues,
    ruleIds: [normalization.ruleId, ...opts.baseRuleIds, opts.expressionRuleId].filter(
      (v, i, a) => a.indexOf(v) === i
    ),
  };
}
