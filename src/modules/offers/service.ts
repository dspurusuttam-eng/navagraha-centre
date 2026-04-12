import "server-only";

import {
  ConsultationStatus,
  ConsultationType,
  InquiryType,
} from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import {
  getPostConsultationRetentionSnapshot,
  type PostConsultationRetentionSnapshot,
} from "@/modules/consultations/retention";
import { getChartOverview } from "@/modules/onboarding/service";
import { getRemedyRecommendationService } from "@/modules/remedies/service";
import type { RemedyRecommendation } from "@/modules/remedies/types";
import {
  remedyCommerceSafetyPolicy,
  sanitizeRemedyCommerceText,
} from "@/modules/remedies/commerce-safety";
import type {
  OfferRecommendation,
  OfferRecommendationContextSummary,
  OfferRecommendationInput,
  OfferRecommendationKind,
  OfferRecommendationPriority,
  OfferRecommendationResult,
  OfferRecommendationSurfaceKey,
} from "@/modules/offers/types";

type ConsultationOfferRecord = {
  id: string;
  status: ConsultationStatus;
  type: ConsultationType;
  serviceLabel: string;
  topicFocus: string | null;
  intakeSummary: string | null;
  package: {
    slug: string;
  } | null;
};

type InquiryOfferRecord = {
  inquiryType: InquiryType;
  desiredServiceSlug: string | null;
  message: string;
};

type OfferCandidate = OfferRecommendation & {
  score: number;
};

const compatibilityKeywords =
  /\b(compatibility|relationship|marriage|partner|couple|synastry)\b/i;

const kindLabels: Record<OfferRecommendationKind, string> = {
  CONSULTATION_FOLLOW_UP: "Follow-Up Consultation",
  REPORT_UPGRADE: "Premium Report",
  COMPATIBILITY_ADD_ON: "Compatibility Add-On",
  REMEDY_GUIDANCE_FOLLOW_UP: "Remedy Guidance",
  SPIRITUAL_PRODUCT_RELEVANCE: "Optional Product Relevance",
};

function getPriorityFromScore(score: number): OfferRecommendationPriority {
  if (score >= 90) {
    return "PRIMARY";
  }

  if (score >= 65) {
    return "SUPPORTIVE";
  }

  return "OPTIONAL";
}

function createEmptyContextSummary(
  surfaceKey: OfferRecommendationSurfaceKey
): OfferRecommendationContextSummary {
  return {
    surfaceKey,
    chartReady: false,
    reportReady: false,
    completedConsultationCount: 0,
    latestConsultationServiceLabel: null,
    retentionStatus: "pending-session",
    retentionNextActionKey: "COMPLETE_FIRST_CONSULTATION",
    hasDueFollowUp: false,
    remedyRecommendationCount: 0,
    productRelevantCount: 0,
    compatibilityContextDetected: false,
  };
}

export function createEmptyOfferRecommendationResult(
  surfaceKey: OfferRecommendationSurfaceKey
): OfferRecommendationResult {
  return {
    generatedAtUtc: new Date().toISOString(),
    primaryRecommendation: null,
    secondaryRecommendations: [],
    contextSummary: createEmptyContextSummary(surfaceKey),
  };
}

function createOfferCandidate(input: {
  score: number;
  kind: OfferRecommendationKind;
  title: string;
  summary: string;
  description: string;
  href: string;
  ctaLabel: string;
  rationale: string;
  safetyNote?: string;
  supportingSignals?: string[];
  optionalPurchase?: boolean;
}): OfferCandidate {
  return {
    key: `${input.kind}:${input.href}`,
    kind: input.kind,
    priority: getPriorityFromScore(input.score),
    title: input.title,
    summary: input.summary,
    description: input.description,
    href: input.href,
    ctaLabel: input.ctaLabel,
    rationale: input.rationale,
    safetyNote:
      input.safetyNote ?? remedyCommerceSafetyPolicy.recommendationSafetyNote,
    supportingSignals: input.supportingSignals ?? [],
    kindLabel: kindLabels[input.kind],
    optionalPurchase: input.optionalPurchase ?? false,
    score: input.score,
  };
}

function hasActionDue(
  snapshot: PostConsultationRetentionSnapshot,
  key: string
) {
  return snapshot.states.some(
    (state) => state.key === key && state.status === "ACTION_DUE"
  );
}

function detectCompatibilityContext(input: {
  consultations: ConsultationOfferRecord[];
  inquiries: InquiryOfferRecord[];
}) {
  if (
    input.inquiries.some(
      (lead) =>
        lead.inquiryType === InquiryType.COMPATIBILITY_FOCUSED ||
        lead.desiredServiceSlug === "compatibility-session" ||
        compatibilityKeywords.test(lead.message)
    )
  ) {
    return true;
  }

  return input.consultations.some(
    (consultation) =>
      consultation.type === ConsultationType.COMPATIBILITY ||
      consultation.package?.slug === "compatibility-session" ||
      compatibilityKeywords.test(
        `${consultation.topicFocus ?? ""} ${consultation.intakeSummary ?? ""}`
      )
  );
}

function shouldSuppressConsultationSurfaceOffers(input: {
  surfaceKey: OfferRecommendationSurfaceKey;
  selectedConsultation: ConsultationOfferRecord | null;
  retentionSnapshot: PostConsultationRetentionSnapshot;
}) {
  if (input.surfaceKey !== "consultation-detail") {
    return false;
  }

  const retentionNeedsAttention =
    input.retentionSnapshot.status === "ready" &&
    input.retentionSnapshot.nextRecommendedAction.key !== "NO_IMMEDIATE_ACTION";

  return (
    input.selectedConsultation?.status !== ConsultationStatus.COMPLETED &&
    !retentionNeedsAttention
  );
}

function sortCandidates(candidates: OfferCandidate[]) {
  return [...candidates].sort((left, right) => {
    if (left.score !== right.score) {
      return right.score - left.score;
    }

    return left.title.localeCompare(right.title, "en");
  });
}

function surfaceCandidates(candidates: OfferCandidate[]) {
  const surfaced: OfferCandidate[] = [];
  let productIncluded = false;

  for (const candidate of sortCandidates(candidates)) {
    if (candidate.kind === "SPIRITUAL_PRODUCT_RELEVANCE") {
      if (productIncluded) {
        continue;
      }

      productIncluded = true;
    }

    surfaced.push(candidate);

    if (surfaced.length === 3) {
      break;
    }
  }

  return surfaced;
}

function buildConsultationFollowUpCandidate(input: {
  retentionSnapshot: PostConsultationRetentionSnapshot;
  selectedConsultation: ConsultationOfferRecord | null;
}) {
  const rebookingDue =
    input.retentionSnapshot.status === "ready" &&
    hasActionDue(input.retentionSnapshot, "REBOOKING_OPPORTUNITY");
  const timingDue =
    input.retentionSnapshot.status === "ready" &&
    hasActionDue(input.retentionSnapshot, "TIMING_FOLLOW_UP_RECOMMENDED");

  if (!rebookingDue && !timingDue) {
    return null;
  }

  const score =
    input.retentionSnapshot.nextRecommendedAction.key ===
    "BOOK_FOLLOW_UP_CONSULTATION"
      ? 98
      : 86;

  return createOfferCandidate({
    score,
    kind: "CONSULTATION_FOLLOW_UP",
    title: "Continue with a follow-up clarity session.",
    summary:
      "A shorter returning-member session can refine the themes already active without reopening the full first-reading process.",
    description:
      "This recommendation is based on completed consultation context and the current follow-up window, not on pressure or urgency.",
    href: "/dashboard/consultations/book?package=follow-up-clarity-session",
    ctaLabel: "Book Follow-Up Session",
    rationale:
      input.retentionSnapshot.nextRecommendedAction.rationale ??
      "Post-session context suggests that a focused follow-up would be more useful than a generic next step.",
    safetyNote:
      "This follow-up suggestion is optional and should be chosen only if it feels contextually useful.",
    supportingSignals: [
      input.selectedConsultation?.serviceLabel ??
        input.retentionSnapshot.consultation?.serviceLabel ??
        "Follow-up opportunity",
    ],
  });
}

function buildReportUpgradeCandidate(input: {
  surfaceKey: OfferRecommendationSurfaceKey;
  reportReady: boolean;
  retentionSnapshot: PostConsultationRetentionSnapshot;
}) {
  if (!input.reportReady || input.surfaceKey === "report") {
    return null;
  }

  const score =
    input.retentionSnapshot.nextRecommendedAction.key === "OPEN_REPORT"
      ? 92
      : input.surfaceKey === "dashboard"
        ? 67
        : 0;

  if (!score) {
    return null;
  }

  return createOfferCandidate({
    score,
    kind: "REPORT_UPGRADE",
    title: "Open the full report for a deeper structured review.",
    summary:
      "Your existing premium report can hold more of the chart, remedy, and timing context in one calm place.",
    description:
      "This is a soft continuation into the current report experience only. No extra payment or upgraded checkout is being implied.",
    href: "/dashboard/report",
    ctaLabel: "Open Report",
    rationale:
      input.retentionSnapshot.nextRecommendedAction.key === "OPEN_REPORT"
        ? input.retentionSnapshot.nextRecommendedAction.rationale
        : "The report is already available and is the clearest structured next step from the current dashboard state.",
    safetyNote:
      "This is a continuation of your existing report experience, not a pressure path.",
  });
}

function buildCompatibilityCandidate(input: {
  compatibilityContextDetected: boolean;
  hasCompatibilitySession: boolean;
}) {
  if (!input.compatibilityContextDetected || input.hasCompatibilitySession) {
    return null;
  }

  return createOfferCandidate({
    score: 74,
    kind: "COMPATIBILITY_ADD_ON",
    title: "Consider a dedicated compatibility session if relationships are central right now.",
    summary:
      "Compatibility questions usually benefit from their own structure instead of being folded into a broader reading.",
    description:
      "This remains an optional add-on only when your existing inquiry or consultation context clearly points toward relationship-focused questions.",
    href: "/dashboard/consultations/book?package=compatibility-session",
    ctaLabel: "Review Compatibility Session",
    rationale:
      "Existing consultation or inquiry context suggests relationship-centered themes, but no compatibility-focused session is on file yet.",
    safetyNote:
      "Compatibility support remains optional and should follow your own readiness.",
  });
}

function buildRemedyGuidanceCandidate(input: {
  significantRemedies: RemedyRecommendation[];
  retentionSnapshot: PostConsultationRetentionSnapshot;
  hasRemedyGuidanceSession: boolean;
  selectedConsultation: ConsultationOfferRecord | null;
}) {
  const remedyDue =
    input.retentionSnapshot.status === "ready" &&
    hasActionDue(input.retentionSnapshot, "REMEDY_FOLLOW_UP_DUE");

  if (
    !input.significantRemedies.length ||
    !remedyDue ||
    input.selectedConsultation?.type === ConsultationType.REMEDY_GUIDANCE
  ) {
    return null;
  }

  const score =
    input.retentionSnapshot.nextRecommendedAction.key ===
    "REVIEW_REMEDY_FOLLOW_UP"
      ? input.hasRemedyGuidanceSession
        ? 76
        : 94
      : 72;

  const leadRemedy = input.significantRemedies[0];

  return createOfferCandidate({
    score,
    kind: "REMEDY_GUIDANCE_FOLLOW_UP",
    title: "Use a remedy guidance follow-up when you want careful interpretation.",
    summary:
      "A remedy-focused session can help you review approved recommendations with proportion and personal context.",
    description:
      "This recommendation stays grounded in approved remedy records and keeps the conversation clear, optional, and non-fear-based.",
    href: "/dashboard/consultations/book?package=remedy-guidance-session",
    ctaLabel: "Review Remedy Guidance",
    rationale:
      leadRemedy?.whyThisRemedy.summary ??
      "Approved remedy signals are present and now benefit from a more careful follow-up conversation.",
    safetyNote:
      "Remedy follow-up is optional and should stay proportionate to your broader chart context.",
    supportingSignals: leadRemedy ? [leadRemedy.title, leadRemedy.slug] : [],
  });
}

function buildProductCandidate(input: {
  significantRemedies: RemedyRecommendation[];
}) {
  const leadRemedyWithProduct = input.significantRemedies.find(
    (remedy) => remedy.relatedProducts.length > 0
  );

  if (!leadRemedyWithProduct) {
    return null;
  }

  const leadProduct = leadRemedyWithProduct.relatedProducts[0];

  return createOfferCandidate({
    score: 36,
    kind: "SPIRITUAL_PRODUCT_RELEVANCE",
    title: "An optional product record may be relevant to this remedy path.",
    summary:
      "If a material support feels useful, you can calmly review one related product record beside the remedy guidance.",
    description:
      "Any purchase remains optional. The remedy practice stays primary and no outcome is guaranteed from a transaction.",
    href: leadProduct.href,
    ctaLabel: "Review Optional Product",
    rationale: sanitizeRemedyCommerceText(
      leadProduct.relationshipNote ||
      leadRemedyWithProduct.productMapping.note ||
      "A related product record is already linked to the approved remedy set.",
      remedyCommerceSafetyPolicy.relationshipFallback
    ),
    safetyNote: [
      remedyCommerceSafetyPolicy.noPressureNote,
      remedyCommerceSafetyPolicy.standaloneRemedyNote,
    ].join(" "),
    supportingSignals: [leadRemedyWithProduct.title, leadProduct.name],
    optionalPurchase: true,
  });
}

export async function getOfferRecommendations(
  input: OfferRecommendationInput
): Promise<OfferRecommendationResult> {
  const prisma = getPrisma();
  const [
    chartOverview,
    retentionSnapshot,
    consultations,
    inquiryLeads,
    completedConsultationCount,
    selectedConsultation,
  ] = await Promise.all([
    getChartOverview(input.userId),
    getPostConsultationRetentionSnapshot(input.userId),
    prisma.consultation.findMany({
      where: {
        userId: input.userId,
      },
      orderBy: [{ scheduledFor: "desc" }, { updatedAt: "desc" }],
      take: 8,
      select: {
        id: true,
        status: true,
        type: true,
        serviceLabel: true,
        topicFocus: true,
        intakeSummary: true,
        package: {
          select: {
            slug: true,
          },
        },
      },
    }),
    prisma.inquiryLead.findMany({
      where: {
        userId: input.userId,
      },
      orderBy: [{ updatedAt: "desc" }],
      take: 5,
      select: {
        inquiryType: true,
        desiredServiceSlug: true,
        message: true,
      },
    }),
    prisma.consultation.count({
      where: {
        userId: input.userId,
        status: ConsultationStatus.COMPLETED,
      },
    }),
    input.consultationId
      ? prisma.consultation.findFirst({
          where: {
            id: input.consultationId,
            userId: input.userId,
          },
          select: {
            id: true,
            status: true,
            type: true,
            serviceLabel: true,
            topicFocus: true,
            intakeSummary: true,
            package: {
              select: {
                slug: true,
              },
            },
          },
        })
      : Promise.resolve(null),
  ]);

  const reportReady = Boolean(chartOverview.chart && chartOverview.chartRecord);
  const remedyRecommendationResult =
    reportReady && chartOverview.chart
      ? await getRemedyRecommendationService().getRecommendations({
          chart: chartOverview.chart,
        })
      : null;
  const significantRemedies =
    remedyRecommendationResult?.recommendations.filter(
      (recommendation) =>
        recommendation.priorityTier !== "OPTIONAL" &&
        recommendation.confidenceLabel !== "OPTIONAL_SUPPORT"
    ) ?? [];
  const compatibilityContextDetected = detectCompatibilityContext({
    consultations,
    inquiries: inquiryLeads,
  });
  const hasCompatibilitySession = consultations.some(
    (consultation) =>
      consultation.type === ConsultationType.COMPATIBILITY ||
      consultation.package?.slug === "compatibility-session"
  );
  const hasRemedyGuidanceSession = consultations.some(
    (consultation) =>
      consultation.type === ConsultationType.REMEDY_GUIDANCE ||
      consultation.package?.slug === "remedy-guidance-session"
  );
  const hasDueFollowUp =
    retentionSnapshot.status === "ready" &&
    retentionSnapshot.nextRecommendedAction.key !== "NO_IMMEDIATE_ACTION";
  const productRelevantCount = significantRemedies.filter(
    (recommendation) => recommendation.relatedProducts.length > 0
  ).length;

  const contextSummary: OfferRecommendationContextSummary = {
    surfaceKey: input.surfaceKey,
    chartReady: Boolean(chartOverview.chart),
    reportReady,
    completedConsultationCount,
    latestConsultationServiceLabel: consultations[0]?.serviceLabel ?? null,
    retentionStatus: retentionSnapshot.status,
    retentionNextActionKey: retentionSnapshot.nextRecommendedAction.key,
    hasDueFollowUp,
    remedyRecommendationCount: significantRemedies.length,
    productRelevantCount,
    compatibilityContextDetected,
  };

  if (!reportReady && completedConsultationCount === 0) {
    return {
      ...createEmptyOfferRecommendationResult(input.surfaceKey),
      contextSummary,
    };
  }

  if (
    shouldSuppressConsultationSurfaceOffers({
      surfaceKey: input.surfaceKey,
      selectedConsultation,
      retentionSnapshot,
    })
  ) {
    return {
      ...createEmptyOfferRecommendationResult(input.surfaceKey),
      contextSummary,
    };
  }

  const candidates = [
    buildConsultationFollowUpCandidate({
      retentionSnapshot,
      selectedConsultation,
    }),
    buildReportUpgradeCandidate({
      surfaceKey: input.surfaceKey,
      reportReady,
      retentionSnapshot,
    }),
    buildCompatibilityCandidate({
      compatibilityContextDetected,
      hasCompatibilitySession,
    }),
    buildRemedyGuidanceCandidate({
      significantRemedies,
      retentionSnapshot,
      hasRemedyGuidanceSession,
      selectedConsultation,
    }),
    buildProductCandidate({
      significantRemedies,
    }),
  ].filter((candidate): candidate is OfferCandidate => candidate !== null);

  const surfaced = surfaceCandidates(candidates);

  return {
    generatedAtUtc: new Date().toISOString(),
    primaryRecommendation: surfaced[0] ?? null,
    secondaryRecommendations: surfaced.slice(1),
    contextSummary,
  };
}
