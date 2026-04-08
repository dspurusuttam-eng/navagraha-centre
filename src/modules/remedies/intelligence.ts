import type { RemedyType } from "@prisma/client";
import type {
  ApprovedRemedyRecord,
  RemedyConsultationPreparation,
  RemedyConfidenceLabel,
  RemedyCautionKey,
  RemedyEvidenceSignal,
  RemedyFollowUpSuggestion,
  RemedyPriorityTier,
  RemedyProductMapping,
  RemedyRecommendation,
  RemedyRecommendationCaution,
  ReportChartSignal,
  RemedyRuleMatch,
} from "@/modules/remedies/types";
import type { RemedyLinkedProduct } from "@/modules/shop";

const remedyTypeLabels: Record<RemedyType, string> = {
  MANTRA: "Mantra",
  RUDRAKSHA: "Rudraksha",
  MALA: "Mala",
  GEMSTONE: "Gemstone",
  YANTRA: "Yantra",
  PUJA: "Puja",
  DONATION: "Donation",
  FASTING: "Fasting",
  SPIRITUAL_DISCIPLINE: "Spiritual Discipline",
  LIFESTYLE_SUPPORT: "Lifestyle Support",
};

function formatBodies(signal: ReportChartSignal) {
  if (!signal.relatedBodies.length) {
    return "the chart";
  }

  return signal.relatedBodies
    .map((body) => body.charAt(0) + body.slice(1).toLowerCase())
    .join(", ");
}

export function getRemedyPriorityTier(priority: number): RemedyPriorityTier {
  if (priority >= 110) {
    return "PRIMARY";
  }

  if (priority >= 90) {
    return "SUPPORTIVE";
  }

  return "OPTIONAL";
}

export function getRemedyConfidenceLabel(
  priority: number
): RemedyConfidenceLabel {
  if (priority >= 110) {
    return "HIGH_CONFIDENCE";
  }

  if (priority >= 90) {
    return "MODERATE_CONFIDENCE";
  }

  return "OPTIONAL_SUPPORT";
}

export function buildRemedyEvidence(
  signal: ReportChartSignal,
  rationale: string
): RemedyEvidenceSignal {
  return {
    signalKey: signal.key,
    title: signal.title,
    level: signal.level,
    rationale,
    relatedBodies: signal.relatedBodies,
    source: "RULE_MATCH",
  };
}

function getCautionDefinitions(
  type: RemedyType,
  confidenceLabel: RemedyConfidenceLabel
): RemedyRecommendationCaution[] {
  const entries = new Map<RemedyCautionKey, RemedyRecommendationCaution>();

  entries.set("PRODUCT_PURCHASE_NOT_REQUIRED", {
    key: "PRODUCT_PURCHASE_NOT_REQUIRED",
    label: "Product purchase not required",
    note: "The remedy itself remains the priority. Any product linkage is optional and secondary.",
  });

  entries.set("SPIRITUAL_SUPPORT_ONLY", {
    key: "SPIRITUAL_SUPPORT_ONLY",
    label: "Spiritual support only",
    note: "This recommendation is offered as reflective spiritual support, not as a guaranteed outcome.",
  });

  if (["GEMSTONE", "PUJA"].includes(type)) {
    entries.set("REQUIRES_EXPERT_CONSULTATION", {
      key: "REQUIRES_EXPERT_CONSULTATION",
      label: "Requires expert consultation",
      note: "This remedy is better reviewed directly with Joy Prakash Sarmah before adoption.",
    });
  }

  if (["FASTING", "PUJA", "YANTRA", "GEMSTONE"].includes(type)) {
    entries.set("TIMING_SENSITIVE", {
      key: "TIMING_SENSITIVE",
      label: "Timing-sensitive",
      note: "If pursued, this remedy should be timed carefully rather than used casually.",
    });
  }

  if (confidenceLabel === "OPTIONAL_SUPPORT") {
    entries.set("REQUIRES_EXPERT_CONSULTATION", {
      key: "REQUIRES_EXPERT_CONSULTATION",
      label: "Better with consultation",
      note: "Because this is a lower-confidence support, a personal consultation is the safer next step.",
    });
  }

  return Array.from(entries.values());
}

function buildProductMapping(
  relatedProducts: RemedyLinkedProduct[]
): RemedyProductMapping {
  if (!relatedProducts.length) {
    return {
      products: [],
      purchaseRequired: false,
      note: "No purchase is required for this remedy. The focus stays on the practice, observance, or reflection itself.",
    };
  }

  return {
    products: relatedProducts,
    purchaseRequired: false,
    note: "Related catalog records are optional supports only. A purchase is never required for this remedy.",
  };
}

function buildFollowUpSuggestions(
  recommendation: {
    type: RemedyType;
    priorityTier: RemedyPriorityTier;
    confidenceLabel: RemedyConfidenceLabel;
    productMapping: RemedyProductMapping;
  }
): RemedyFollowUpSuggestion[] {
  const suggestions: RemedyFollowUpSuggestion[] = [
    {
      kind: "REFLECTION",
      title: "Stay observant, not urgent",
      note: "Approach the recommendation gently and notice whether it supports steadiness over time.",
    },
  ];

  if (
    recommendation.priorityTier === "OPTIONAL" ||
    recommendation.confidenceLabel === "OPTIONAL_SUPPORT" ||
    ["GEMSTONE", "PUJA"].includes(recommendation.type)
  ) {
    suggestions.push({
      kind: "CONSULTATION",
      title: "Take this into consultation",
      note: "A personal review with Joy Prakash Sarmah is the safest next step before acting more strongly on this support.",
      href: "/consultation",
    });
  } else {
    suggestions.push({
      kind: "SELF_PRACTICE",
      title: "Start with a measured rhythm",
      note: "Choose a small, sustainable cadence rather than trying to do everything at once.",
    });
  }

  if (recommendation.productMapping.products.length) {
    suggestions.push({
      kind: "PRODUCT_OPTION",
      title: "Explore related records only if useful",
      note: "If you review a related product, treat it as optional support rather than the center of the remedy.",
    });
  }

  if (recommendation.type === "LIFESTYLE_SUPPORT") {
    suggestions.push({
      kind: "SELF_PRACTICE",
      title: "Keep the support simple",
      note: "Lifestyle supports work best when they reduce friction and overstimulation instead of adding pressure.",
    });
  }

  return suggestions;
}

export function buildRemedyRecommendation(params: {
  record: ApprovedRemedyRecord;
  signals: ReportChartSignal[];
  matches: RemedyRuleMatch[];
  relatedProducts: RemedyLinkedProduct[];
}): RemedyRecommendation {
  const topMatch = [...params.matches].sort(
    (left, right) => right.priority - left.priority
  )[0];

  const primarySignal =
    params.signals.find((signal) => signal.key === topMatch?.signalKey) ??
    params.signals[0];
  const evidence = params.matches
    .map((match) => {
      const sourceSignal = params.signals.find((signal) => signal.key === match.signalKey);

      return sourceSignal ? buildRemedyEvidence(sourceSignal, match.rationale) : null;
    })
    .filter((entry): entry is RemedyEvidenceSignal => entry !== null);

  const priority =
    (topMatch?.priority ?? 0) + Math.max(0, params.matches.length - 1) * 4;
  const priorityTier = getRemedyPriorityTier(priority);
  const confidenceLabel = getRemedyConfidenceLabel(priority);
  const confidenceScore = Number(
    Math.max(
      0.55,
      Math.min(
        0.96,
        (topMatch?.confidenceScore ?? 0.55) + Math.max(0, params.matches.length - 1) * 0.03
      )
    ).toFixed(2)
  );
  const cautions = getCautionDefinitions(params.record.type, confidenceLabel);
  const productMapping = buildProductMapping(params.relatedProducts);

  return {
    id: params.record.id,
    slug: params.record.slug,
    title: params.record.title,
    summary: params.record.summary,
    description: params.record.description,
    type: params.record.type,
    cautionNote: params.record.cautionNote,
    rationale: topMatch?.rationale ?? primarySignal?.rationale ?? params.record.summary,
    signalKey: topMatch?.signalKey ?? primarySignal?.key ?? "devotional-foundation",
    priority,
    priorityTier,
    confidenceLabel,
    confidenceScore,
    evidence,
    whyThisRemedy: {
      summary:
        topMatch?.rationale ??
        "This remedy remains grounded in stored chart signals and an approved NAVAGRAHA CENTRE record.",
      chartGrounding: primarySignal
        ? `${primarySignal.title} ${primarySignal.rationale} The strongest signal here is connected to ${formatBodies(primarySignal)}.`
        : "The recommendation is anchored to deterministic chart signals already stored in the platform.",
      approvedRecordBasis: `${params.record.title} is an approved ${remedyTypeLabels[
        params.record.type
      ].toLowerCase()} record in NAVAGRAHA CENTRE and is presented as optional support rather than a guaranteed outcome.`,
    },
    cautions,
    productMapping,
    followUpSuggestions: buildFollowUpSuggestions({
      type: params.record.type,
      priorityTier,
      confidenceLabel,
      productMapping,
    }),
    relatedProducts: params.relatedProducts,
  };
}

export function buildRemedyConsultationPreparation(
  recommendations: RemedyRecommendation[]
): RemedyConsultationPreparation {
  const topRecommendations = recommendations.slice(0, 3).map((recommendation) => ({
    slug: recommendation.slug,
    title: recommendation.title,
    priorityTier: recommendation.priorityTier,
    confidenceLabel: recommendation.confidenceLabel,
    note:
      recommendation.priorityTier === "OPTIONAL" ||
      recommendation.confidenceLabel === "OPTIONAL_SUPPORT"
        ? "Best reviewed in consultation before stronger action."
        : recommendation.whyThisRemedy.summary,
  }));

  return {
    summary: topRecommendations.length
      ? "These remedy notes can help prepare a more focused consultation without replacing human judgement."
      : "No approved remedies are currently mapped strongly enough to prepare a consultation remedy brief.",
    topRecommendations,
  };
}
