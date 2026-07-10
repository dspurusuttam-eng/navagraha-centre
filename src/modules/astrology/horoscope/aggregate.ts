// Card 8B — Aggregation: dedup, contradiction resolver, rating-band resolver,
// confidence/completeness resolver, and the per-category evaluator.
//
// Pure. Never averages contradictions into a hidden number: supportive and
// caution evidence stay in separate lists, contradictions stay visible, and the
// band comes from the locked deterministic table (Card 8A.1 section 3.2).

import {
  CATEGORY_SIGNIFICATORS,
  type CategorySignificator,
} from "@/modules/astrology/horoscope/rules";
import type { HoroscopeChartContext } from "@/modules/astrology/horoscope/context";
import { buildAllCategoryEvidence } from "@/modules/astrology/horoscope/evidence";
import type {
  CategoryConfidence,
  ConfidenceLevel,
  EvidenceToken,
  HoroscopeCategoryKey,
  HoroscopeCategoryResult,
  RatingBand,
} from "@/modules/astrology/horoscope/types";

// --- Requirement spec (Card 8A.1 section 4.4) --------------------------------

type Requirement = {
  /** Each entry: a system that must be ready, or a oneOf group (any ready). */
  critical: Array<string | string[]>;
  /** Systems that could plausibly fire for this category (for coverage). */
  expected: string[];
};

const REQUIREMENTS: Record<HoroscopeCategoryKey, Requirement> = {
  general_day_quality: {
    critical: ["natal", ["vimshottari", "gocharFromMoon"]],
    expected: ["vimshottari", "gocharFromMoon", "panchang", "ashtakavargaSAV", "sadeSati"],
  },
  career_work: {
    critical: ["natal", ["vimshottari", "gocharFromLagna"], "ashtakavargaSAV"],
    expected: ["vimshottari", "gocharFromMoon", "gocharFromLagna", "ashtakavargaSAV", "ashtakavargaBAV", "divisional"],
  },
  finance_resources: {
    critical: ["natal", ["vimshottari", "gocharFromMoon", "gocharFromLagna"], "ashtakavargaSAV"],
    expected: ["vimshottari", "gocharFromMoon", "gocharFromLagna", "ashtakavargaSAV", "ashtakavargaBAV", "divisional"],
  },
  relationships: {
    critical: ["natal", ["vimshottari", "gocharFromMoon", "gocharFromLagna"], "ashtakavargaSAV"],
    expected: ["vimshottari", "gocharFromMoon", "gocharFromLagna", "ashtakavargaSAV", "ashtakavargaBAV", "divisional", "sadeSati"],
  },
  health_routine: {
    critical: ["natal", ["vimshottari", "gocharFromMoon", "gocharFromLagna"], "sadeSati"],
    expected: ["vimshottari", "gocharFromMoon", "gocharFromLagna", "ashtakavargaSAV", "ashtakavargaBAV", "divisional", "sadeSati"],
  },
  study_planning: {
    critical: ["natal", ["vimshottari", "gocharFromMoon", "gocharFromLagna"], "ashtakavargaSAV"],
    expected: ["vimshottari", "gocharFromMoon", "gocharFromLagna", "ashtakavargaSAV", "ashtakavargaBAV", "divisional"],
  },
  travel_mobility: {
    critical: ["natal", ["vimshottari", "gocharFromMoon", "gocharFromLagna"], "ashtakavargaSAV"],
    expected: ["vimshottari", "gocharFromMoon", "gocharFromLagna", "ashtakavargaSAV", "ashtakavargaBAV"],
  },
};

// --- Dedup by conditionKey (keep max magnitude; ties keep first/precedence) --

export function dedupeTokens(tokens: EvidenceToken[]): EvidenceToken[] {
  const byKey = new Map<string, EvidenceToken>();

  for (const token of tokens) {
    const existing = byKey.get(token.conditionKey);

    if (!existing || Math.abs(token.tier) > Math.abs(existing.tier)) {
      byKey.set(token.conditionKey, token);
    }
  }

  return [...byKey.values()];
}

// --- Contradiction detection -------------------------------------------------

export function detectContradictions(tokens: EvidenceToken[]): string[] {
  const flags: string[] = [];
  const hasStrongSupport = tokens.some((token) => token.tier === 2);
  const hasStrongCaution = tokens.some((token) => token.tier === -2);
  const dashaPos = tokens.some((token) => token.sourceSystem === "vimshottari" && token.tier > 0);
  const dashaNeg = tokens.some((token) => token.sourceSystem === "vimshottari" && token.tier < 0);
  const gocharPos = tokens.some(
    (token) => (token.sourceSystem === "gocharFromMoon" || token.sourceSystem === "gocharFromLagna") && token.tier > 0
  );
  const gocharNeg = tokens.some(
    (token) => (token.sourceSystem === "gocharFromMoon" || token.sourceSystem === "gocharFromLagna") && token.tier < 0
  );

  if (hasStrongSupport && hasStrongCaution) {
    flags.push("STRONG_SUPPORT_VS_STRONG_CAUTION");
  }

  if ((dashaPos && gocharNeg) || (dashaNeg && gocharPos)) {
    flags.push("PHASE_VS_WINDOW");
  }

  return flags;
}

// --- Confidence / completeness -----------------------------------------------

function isReady(ctx: HoroscopeChartContext, system: string): boolean {
  return ctx.sourceSystems[system] === "ready";
}

export function resolveConfidence(input: {
  ctx: HoroscopeChartContext;
  category: HoroscopeCategoryKey;
  firedSystems: Set<string>;
  contradictionCount: number;
}): CategoryConfidence {
  const requirement = REQUIREMENTS[input.category];
  const { ctx } = input;
  const missingCriticalSystems: string[] = [];

  for (const entry of requirement.critical) {
    if (Array.isArray(entry)) {
      if (!entry.some((system) => isReady(ctx, system))) {
        missingCriticalSystems.push(`oneOf(${entry.join("|")})`);
      }
    } else if (!isReady(ctx, entry)) {
      missingCriticalSystems.push(entry);
    }
  }

  const expected = requirement.expected;
  const readyExpected = expected.filter((system) => isReady(ctx, system));
  const firedExpected = expected.filter((system) => input.firedSystems.has(system));
  const completenessRatio = expected.length === 0 ? 1 : readyExpected.length / expected.length;
  const ruleCoverageRatio = expected.length === 0 ? 1 : firedExpected.length / expected.length;
  const contradictionPenalty = Math.min(0.5, 0.1 * input.contradictionCount);
  const rawValue = Math.min(completenessRatio, ruleCoverageRatio) - contradictionPenalty;
  const value = Math.max(0, Math.min(1, Number(rawValue.toFixed(4))));

  const unavailableLayers = expected.filter((system) => !isReady(ctx, system));

  let level: ConfidenceLevel | "insufficient";

  if (missingCriticalSystems.length > 0 || value < 0.4) {
    level = "insufficient";
  } else if (value >= 0.85) {
    level = "high";
  } else if (value >= 0.6) {
    level = "moderate";
  } else {
    level = "low";
  }

  return {
    completenessRatio: Number(completenessRatio.toFixed(4)),
    ruleCoverageRatio: Number(ruleCoverageRatio.toFixed(4)),
    contradictionPenalty,
    value,
    level,
    missingCriticalSystems,
    unavailableLayers,
  };
}

// --- Rating-band resolver (Card 8A.1 section 3.2) ---------------------------

const BAND_RANK: Record<RatingBand, number> = {
  strongly_supportive: 2,
  supportive: 1,
  mixed: 0,
  cautionary: -1,
  strongly_cautionary: -2,
};

const RANK_BAND: Record<number, RatingBand> = {
  2: "strongly_supportive",
  1: "supportive",
  0: "mixed",
  [-1]: "cautionary",
  [-2]: "strongly_cautionary",
};

function capAt(band: RatingBand, maxBand: RatingBand): RatingBand {
  return BAND_RANK[band] > BAND_RANK[maxBand] ? maxBand : band;
}

export function resolveBand(input: {
  netTier: number;
  tokens: EvidenceToken[];
  contradiction: boolean;
  significator: CategorySignificator;
  confidenceLevel: ConfidenceLevel | "insufficient";
}): RatingBand {
  const { netTier, tokens, significator } = input;
  const hasStrongSupport = tokens.some((token) => token.tier === 2);
  const hasStrongCaution = tokens.some((token) => token.tier === -2);
  const confident = input.confidenceLevel === "high" || input.confidenceLevel === "moderate";

  let band: RatingBand;

  if (input.contradiction) {
    band = "mixed";
  } else if (netTier >= 4 && !hasStrongCaution) {
    band = "strongly_supportive";
  } else if (netTier >= 2) {
    band = "supportive";
  } else if (netTier >= -1) {
    band = "mixed";
  } else if (netTier >= -3) {
    band = "cautionary";
  } else {
    band = hasStrongSupport ? "cautionary" : "strongly_cautionary";
  }

  // Confidence gates: extremes require at least moderate confidence.
  if (band === "strongly_supportive" && !confident) {
    band = "supportive";
  }
  if (band === "strongly_cautionary" && !confident) {
    band = "cautionary";
  }

  // Sade Sati peak / ashtama caps capped categories at mixed.
  const sadeSatiCap =
    significator.sadeSatiCapped &&
    tokens.some(
      (token) => token.ruleId === "SADE_SATI_PEAK" || token.ruleId === "SATURN_ASHTAMA_8TH"
    );

  if (sadeSatiCap) {
    band = capAt(band, "mixed");
  }

  // Structural rating cap (e.g. travel).
  if (significator.ratingCap) {
    band = capAt(band, significator.ratingCap);
  }

  return RANK_BAND[BAND_RANK[band]];
}

// --- Per-category evaluator --------------------------------------------------

export function evaluateCategory(
  ctx: HoroscopeChartContext,
  category: HoroscopeCategoryKey
): HoroscopeCategoryResult {
  const significator = CATEGORY_SIGNIFICATORS[category];
  const rawTokens = buildAllCategoryEvidence(ctx, category);
  const tokens = dedupeTokens(rawTokens);
  const firedSystems = new Set(tokens.map((token) => token.sourceSystem));
  const contradictionFlags = detectContradictions(tokens);
  const confidence = resolveConfidence({
    ctx,
    category,
    firedSystems,
    contradictionCount: contradictionFlags.length,
  });

  const supportiveEvidence = tokens.filter((token) => token.tier > 0);
  const cautionEvidence = tokens.filter((token) => token.tier < 0);
  const neutralEvidence = tokens.filter((token) => token.tier === 0);
  const calculationReferences = [
    ...new Set(tokens.map((token) => token.calculationReference)),
  ];

  // Critical-missing -> unavailable (never a guessed band).
  if (confidence.level === "insufficient") {
    return {
      category,
      status: "unavailable",
      ratingBand: null,
      internalNetTier: null,
      confidence,
      supportiveEvidence,
      cautionEvidence,
      neutralEvidence,
      contradictionFlags,
      calculationReferences,
      unavailableReason:
        confidence.missingCriticalSystems.length > 0
          ? `Missing critical systems: ${confidence.missingCriticalSystems.join(", ")}.`
          : "Insufficient data/rule coverage to emit a defensible rating.",
    };
  }

  const netTier = tokens.reduce((sum, token) => sum + token.tier, 0);
  const contradiction = contradictionFlags.length > 0;
  const ratingBand = resolveBand({
    netTier,
    tokens,
    contradiction,
    significator,
    confidenceLevel: confidence.level,
  });

  return {
    category,
    status: "available",
    ratingBand,
    internalNetTier: netTier,
    confidence,
    supportiveEvidence,
    cautionEvidence,
    neutralEvidence,
    contradictionFlags,
    calculationReferences,
    unavailableReason: null,
  };
}
