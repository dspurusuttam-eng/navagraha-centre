import type { PlanetaryBody, TransitEvent } from "@/modules/astrology/types";
import type { ContentType } from "@/modules/content/types";
import type {
  RemedyConfidenceLabel,
  RemedyPriorityTier,
} from "@/modules/remedies/types";
import type { RemedyType } from "@prisma/client";

export const aiToolNames = [
  "get_user_chart_snapshot",
  "get_current_chart_summary_facts",
  "get_current_transit_snapshot",
  "get_approved_remedies",
  "get_remedy_intelligence_summary",
  "get_related_products",
  "get_published_insights",
  "get_consultation_context",
  "get_consultation_history",
] as const;

export type AiToolName = (typeof aiToolNames)[number];

export type AiToolContract<
  Name extends AiToolName,
  Input extends Record<string, unknown>,
  Output extends Record<string, unknown>,
> = {
  name: Name;
  summary: string;
  input: Input;
  output: Output;
};

export type GetUserChartSnapshotInput = {
  userId: string;
};

export type GetUserChartSnapshotOutput = {
  chartId: string;
  ascendantSign: string;
  dominantBodies: PlanetaryBody[];
  narrative: string;
  generatedAtUtc: string | null;
};

export type GetCurrentChartSummaryFactsInput = {
  userId: string;
  question: string;
};

export type GetCurrentChartSummaryFactsOutput = {
  ascendantSign: string;
  houseSystem: string;
  dominantBodies: PlanetaryBody[];
  narrative: string;
  matchingPlacements: {
    body: PlanetaryBody;
    sign: string;
    house: number;
    retrograde: boolean;
  }[];
  matchingHouses: {
    house: number;
    sign: string;
    ruler: PlanetaryBody;
  }[];
  matchingAspects: {
    source: string;
    type: string;
    target: string;
    orb: number;
    exact: boolean;
  }[];
};

export type GetApprovedRemediesInput = {
  signalKeys: string[];
};

export type GetApprovedRemediesOutput = {
  remedies: {
    id: string;
    slug: string;
    title: string;
    type: RemedyType;
    priorityTier: RemedyPriorityTier;
    confidenceLabel: RemedyConfidenceLabel;
    summary: string;
    cautionNote: string | null;
    whyThisRemedy: {
      summary: string;
      chartGrounding: string;
      approvedRecordBasis: string;
    };
    cautions: {
      label: string;
      note: string;
    }[];
    productMapping: {
      note: string;
      purchaseRequired: false;
    };
    signalKey: string;
  }[];
  consultationPreparation: {
    summary: string;
    topRecommendations: {
      slug: string;
      title: string;
      priorityTier: RemedyPriorityTier;
      confidenceLabel: RemedyConfidenceLabel;
      note: string;
    }[];
  };
};

export type GetCurrentTransitSnapshotInput = {
  userId: string;
};

export type GetCurrentTransitSnapshotOutput = {
  asOfUtc: string;
  window: {
    fromDateUtc: string;
    toDateUtc: string;
  };
  planets: {
    body: PlanetaryBody;
    sign: string;
    degree: number;
    minute: number;
    longitude: number;
    house: number;
    retrograde: boolean;
    nakshatra: string | null;
    intensity: string;
    summary: string;
  }[];
  transits: {
    id: string;
    body: PlanetaryBody;
    sign: string;
    house: number;
    summary: string;
    intensity: string;
  }[];
  aspects: {
    source: string;
    type: string;
    target: string;
    orb: number;
    exact: boolean;
  }[];
};

export type GetRemedyIntelligenceSummaryInput = {
  userId: string;
};

export type GetRemedyIntelligenceSummaryOutput = {
  generatedAtUtc: string;
  signalKeys: string[];
  topRecommendations: {
    slug: string;
    title: string;
    priorityTier: RemedyPriorityTier;
    confidenceLabel: RemedyConfidenceLabel;
    whyThisRemedy: string;
  }[];
};

export type GetRelatedProductsInput = {
  remedySlugs: string[];
};

export type GetRelatedProductsOutput = {
  products: {
    id: string;
    slug: string;
    name: string;
    summary: string;
    priceLabel: string;
    categoryLabel: string;
  }[];
};

export type GetPublishedInsightsInput = {
  query: string;
  limit?: number;
};

export type GetPublishedInsightsOutput = {
  entries: {
    slug: string;
    title: string;
    excerpt: string;
    type: ContentType;
    publishedAt: string;
  }[];
};

export type GetConsultationContextInput = {
  userId: string;
  consultationId: string;
};

export type GetConsultationContextOutput = {
  confirmationCode: string;
  serviceLabel: string;
  topicFocus: string | null;
  intakeSummary: string | null;
  remedyPreparation?: {
    summary: string;
    topRecommendations: {
      slug: string;
      title: string;
      priorityTier: RemedyPriorityTier;
      confidenceLabel: RemedyConfidenceLabel;
      note: string;
    }[];
  };
  upcomingTransits?: TransitEvent[];
};

export type GetConsultationHistoryInput = {
  userId: string;
};

export type GetConsultationHistoryOutput = {
  consultations: {
    id: string;
    confirmationCode: string;
    status: string;
    serviceLabel: string;
    scheduledForUtc: string | null;
    topicFocus: string | null;
    intakeSummary: string | null;
  }[];
};

export type AiToolContractRegistry = {
  get_user_chart_snapshot: AiToolContract<
    "get_user_chart_snapshot",
    GetUserChartSnapshotInput,
    GetUserChartSnapshotOutput
  >;
  get_current_chart_summary_facts: AiToolContract<
    "get_current_chart_summary_facts",
    GetCurrentChartSummaryFactsInput,
    GetCurrentChartSummaryFactsOutput
  >;
  get_current_transit_snapshot: AiToolContract<
    "get_current_transit_snapshot",
    GetCurrentTransitSnapshotInput,
    GetCurrentTransitSnapshotOutput
  >;
  get_remedy_intelligence_summary: AiToolContract<
    "get_remedy_intelligence_summary",
    GetRemedyIntelligenceSummaryInput,
    GetRemedyIntelligenceSummaryOutput
  >;
  get_approved_remedies: AiToolContract<
    "get_approved_remedies",
    GetApprovedRemediesInput,
    GetApprovedRemediesOutput
  >;
  get_related_products: AiToolContract<
    "get_related_products",
    GetRelatedProductsInput,
    GetRelatedProductsOutput
  >;
  get_published_insights: AiToolContract<
    "get_published_insights",
    GetPublishedInsightsInput,
    GetPublishedInsightsOutput
  >;
  get_consultation_context: AiToolContract<
    "get_consultation_context",
    GetConsultationContextInput,
    GetConsultationContextOutput
  >;
  get_consultation_history: AiToolContract<
    "get_consultation_history",
    GetConsultationHistoryInput,
    GetConsultationHistoryOutput
  >;
};

export const aiToolContracts = {
  get_user_chart_snapshot: {
    name: "get_user_chart_snapshot",
    summary:
      "Returns a deterministic chart snapshot prepared by the astrology provider layer.",
    input: {
      userId: "string",
    },
    output: {
      chartId: "string",
      ascendantSign: "string",
      dominantBodies: "PlanetaryBody[]",
      narrative: "string",
      generatedAtUtc: "string|null",
    },
  },
  get_current_chart_summary_facts: {
    name: "get_current_chart_summary_facts",
    summary:
      "Returns the current user's grounded chart summary facts, including matching placements, houses, and aspects related to the question.",
    input: {
      userId: "string",
      question: "string",
    },
    output: {
      ascendantSign: "string",
      houseSystem: "string",
      dominantBodies: "PlanetaryBody[]",
      narrative: "string",
      matchingPlacements: "PlacementFact[]",
      matchingHouses: "HouseFact[]",
      matchingAspects: "AspectFact[]",
    },
  },
  get_current_transit_snapshot: {
    name: "get_current_transit_snapshot",
    summary:
      "Returns a current transit snapshot for the user when grounded transit data can be prepared from stored birth details.",
    input: {
      userId: "string",
    },
    output: {
      asOfUtc: "string",
      window: "TransitWindow",
      planets: "TransitPlanetSnapshot[]",
      transits: "TransitFact[]",
      aspects: "TransitAspectFact[]",
    },
  },
  get_approved_remedies: {
    name: "get_approved_remedies",
    summary:
      "Returns only approved remedy records curated in NAVAGRAHA CENTRE data.",
    input: {
      signalKeys: "string[]",
    },
    output: {
      remedies: "ApprovedRemedy[]",
      consultationPreparation: "ConsultationRemedyPreparation",
    },
  },
  get_remedy_intelligence_summary: {
    name: "get_remedy_intelligence_summary",
    summary:
      "Returns ranked remedy-intelligence output mapped from deterministic chart signals and approved records.",
    input: {
      userId: "string",
    },
    output: {
      generatedAtUtc: "string",
      signalKeys: "string[]",
      topRecommendations: "RemedyIntelligenceSummaryEntry[]",
    },
  },
  get_related_products: {
    name: "get_related_products",
    summary:
      "Returns related catalog products linked from approved remedy records.",
    input: {
      remedySlugs: "string[]",
    },
    output: {
      products: "RelatedProduct[]",
    },
  },
  get_published_insights: {
    name: "get_published_insights",
    summary:
      "Returns published editorial insight entries for grounded responses and citations.",
    input: {
      query: "string",
      limit: "number|undefined",
    },
    output: {
      entries: "PublishedInsight[]",
    },
  },
  get_consultation_context: {
    name: "get_consultation_context",
    summary:
      "Returns consultation context and intake notes for briefing or assistant workflows.",
    input: {
      userId: "string",
      consultationId: "string",
    },
    output: {
      confirmationCode: "string",
      serviceLabel: "string",
      topicFocus: "string|null",
      intakeSummary: "string|null",
      remedyPreparation: "ConsultationRemedyPreparation|undefined",
      upcomingTransits: "TransitEvent[]|undefined",
    },
  },
  get_consultation_history: {
    name: "get_consultation_history",
    summary:
      "Returns recent consultation history for grounding astrologer preparation flows.",
    input: {
      userId: "string",
    },
    output: {
      consultations: "ConsultationHistoryEntry[]",
    },
  },
} as const;
