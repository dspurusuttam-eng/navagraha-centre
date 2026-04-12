import "server-only";

import { consultationPackages } from "@/modules/consultations/catalog";
import type {
  PremiumOfferCatalogItem,
  PremiumOfferCategory,
  PremiumOfferContextTag,
  PremiumOfferEligibilityContext,
  PremiumOfferEligibilityRule,
  PremiumOfferEligibilityRuleKey,
  PremiumOfferSurfaceTarget,
  PremiumReportProduct,
  PremiumReportProductType,
} from "@/modules/offers/types";

type PremiumOfferDefinition = {
  id: string;
  title: string;
  category: PremiumOfferCategory;
  shortDescription: string;
  contextTags: PremiumOfferContextTag[];
  eligibilityRuleKeys: PremiumOfferEligibilityRuleKey[];
  premiumLevel: PremiumOfferCatalogItem["premiumLevel"];
  surfaceTargets: PremiumOfferSurfaceTarget[];
};

type PremiumCatalogQuery = {
  category?: PremiumOfferCategory;
  surfaceTarget?: PremiumOfferSurfaceTarget;
  contextTag?: PremiumOfferContextTag;
  eligibleOnly?: boolean;
  eligibilityContext?: PremiumOfferEligibilityContext;
};

const eligibilityRuleDescriptions: Record<
  PremiumOfferEligibilityRuleKey,
  string
> = {
  ALWAYS: "Available as a standard premium offer entry.",
  CHART_AVAILABLE:
    "Visible when deterministic chart data is already available for the member.",
  REPORT_READY:
    "Visible when report-ready chart context is available in the account.",
  COMPLETED_CONSULTATION_EXISTS:
    "Visible when at least one completed consultation exists.",
  FOLLOW_UP_DUE: "Visible when follow-up state indicates actionable continuity.",
  RELATIONSHIP_CONTEXT_DETECTED:
    "Visible when relationship or compatibility context is present.",
  REMEDY_SIGNALS_PRESENT:
    "Visible when approved remedy signals are present in context.",
  TIMING_CONTEXT_READY:
    "Visible when current cycle/timing context is available.",
};

const consultationOfferDefinitions: PremiumOfferDefinition[] =
  consultationPackages.map((pkg) => {
    if (pkg.slug === "compatibility-session") {
      return {
        id: "offer-compatibility-session",
        title: pkg.title,
        category: "compatibility",
        shortDescription: pkg.summary,
        contextTags: ["marriage", "compatibility", "family", "timing"],
        eligibilityRuleKeys: ["RELATIONSHIP_CONTEXT_DETECTED"],
        premiumLevel: "SIGNATURE",
        surfaceTargets: ["dashboard", "checkout", "recommendation-engine"],
      };
    }

    if (pkg.slug === "remedy-guidance-session") {
      return {
        id: "offer-remedy-guidance-session",
        title: pkg.title,
        category: "remedy",
        shortDescription: pkg.summary,
        contextTags: ["remedies", "timing", "spiritual-discipline"],
        eligibilityRuleKeys: ["CHART_AVAILABLE", "REMEDY_SIGNALS_PRESENT"],
        premiumLevel: "PREMIUM",
        surfaceTargets: ["dashboard", "checkout", "recommendation-engine"],
      };
    }

    if (pkg.slug === "follow-up-clarity-session") {
      return {
        id: "offer-follow-up-clarity-session",
        title: pkg.title,
        category: "follow-up",
        shortDescription: pkg.summary,
        contextTags: ["timing", "career", "finance", "family"],
        eligibilityRuleKeys: ["COMPLETED_CONSULTATION_EXISTS", "FOLLOW_UP_DUE"],
        premiumLevel: "PREMIUM",
        surfaceTargets: ["dashboard", "checkout", "recommendation-engine"],
      };
    }

    if (pkg.slug === "business-astrology-brief") {
      return {
        id: "offer-business-astrology-brief",
        title: pkg.title,
        category: "consultation",
        shortDescription: pkg.summary,
        contextTags: ["career", "finance", "timing"],
        eligibilityRuleKeys: ["CHART_AVAILABLE", "TIMING_CONTEXT_READY"],
        premiumLevel: "SIGNATURE",
        surfaceTargets: ["dashboard", "checkout", "recommendation-engine"],
      };
    }

    return {
      id: "offer-private-reading",
      title: pkg.title,
      category: "consultation",
      shortDescription: pkg.summary,
      contextTags: ["career", "marriage", "finance", "family", "timing"],
      eligibilityRuleKeys: ["ALWAYS"],
      premiumLevel: "SIGNATURE",
      surfaceTargets: ["dashboard", "checkout", "recommendation-engine"],
    };
  });

const reportProducts: PremiumReportProduct[] = [
  {
    id: "report-career-premium",
    reportType: "career",
    title: "Career Momentum Report",
    shortDescription:
      "Structured chart and timing perspective focused on career direction and decision rhythm.",
    sellable: true,
    category: "report",
    linkedOfferId: "offer-report-career",
    priceFromMinor: null,
    currencyCode: null,
  },
  {
    id: "report-marriage-premium",
    reportType: "marriage",
    title: "Marriage and Partnership Report",
    shortDescription:
      "Relationship and compatibility-centered report structure for thoughtful partnership review.",
    sellable: true,
    category: "report",
    linkedOfferId: "offer-report-marriage",
    priceFromMinor: null,
    currencyCode: null,
  },
  {
    id: "report-timing-premium",
    reportType: "timing",
    title: "Current Timing Intelligence Report",
    shortDescription:
      "Current-cycle oriented report block for active windows, caution areas, and timing focus.",
    sellable: true,
    category: "report",
    linkedOfferId: "offer-report-timing",
    priceFromMinor: null,
    currencyCode: null,
  },
  {
    id: "report-remedies-premium",
    reportType: "remedies",
    title: "Remedy Intelligence Report",
    shortDescription:
      "Approved remedy-focused report with priority, confidence, and clear caution framing.",
    sellable: true,
    category: "report",
    linkedOfferId: "offer-report-remedies",
    priceFromMinor: null,
    currencyCode: null,
  },
  {
    id: "report-annual-premium",
    reportType: "annual",
    title: "Annual Theme Report",
    shortDescription:
      "Yearly structure for major themes, transitions, and follow-up checkpoints.",
    sellable: true,
    category: "report",
    linkedOfferId: "offer-report-annual",
    priceFromMinor: null,
    currencyCode: null,
  },
];

const reportOfferDefinitions: PremiumOfferDefinition[] = reportProducts.map(
  (reportProduct) => ({
    id: reportProduct.linkedOfferId,
    title: reportProduct.title,
    category: "report",
    shortDescription: reportProduct.shortDescription,
    contextTags: getReportContextTags(reportProduct.reportType),
    eligibilityRuleKeys: ["CHART_AVAILABLE", "REPORT_READY"],
    premiumLevel: reportProduct.reportType === "annual" ? "SIGNATURE" : "PREMIUM",
    surfaceTargets: ["dashboard", "checkout", "recommendation-engine"],
  })
);

const timingOfferDefinitions: PremiumOfferDefinition[] = [
  {
    id: "offer-timing-cycle-review",
    title: "Timing Cycle Review",
    category: "timing",
    shortDescription:
      "A timing-focused premium follow-up for current-cycle windows and practical sequencing.",
    contextTags: ["timing", "career", "finance", "family"],
    eligibilityRuleKeys: ["CHART_AVAILABLE", "TIMING_CONTEXT_READY"],
    premiumLevel: "PREMIUM",
    surfaceTargets: ["dashboard", "recommendation-engine"],
  },
];

function getReportContextTags(reportType: PremiumReportProductType) {
  switch (reportType) {
    case "career":
      return ["career", "finance", "timing"] satisfies PremiumOfferContextTag[];
    case "marriage":
      return ["marriage", "compatibility", "family"] satisfies PremiumOfferContextTag[];
    case "timing":
      return ["timing", "career", "finance", "family"] satisfies PremiumOfferContextTag[];
    case "remedies":
      return ["remedies", "timing", "spiritual-discipline"] satisfies PremiumOfferContextTag[];
    case "annual":
      return ["timing", "career", "marriage", "finance"] satisfies PremiumOfferContextTag[];
  }
}

function toEligibilityRules(
  keys: PremiumOfferEligibilityRuleKey[]
): PremiumOfferEligibilityRule[] {
  return keys.map((key) => ({
    key,
    description: eligibilityRuleDescriptions[key],
  }));
}

const premiumOfferCatalog: PremiumOfferCatalogItem[] = [
  ...consultationOfferDefinitions,
  ...reportOfferDefinitions,
  ...timingOfferDefinitions,
].map((offer) => ({
  id: offer.id,
  title: offer.title,
  category: offer.category,
  shortDescription: offer.shortDescription,
  contextTags: [...offer.contextTags],
  eligibilityRules: toEligibilityRules(offer.eligibilityRuleKeys),
  premiumLevel: offer.premiumLevel,
  surfaceTargets: [...offer.surfaceTargets],
}));

function isRuleEligible(
  ruleKey: PremiumOfferEligibilityRuleKey,
  context: PremiumOfferEligibilityContext
) {
  switch (ruleKey) {
    case "ALWAYS":
      return true;
    case "CHART_AVAILABLE":
      return context.hasChart;
    case "REPORT_READY":
      return context.hasReport;
    case "COMPLETED_CONSULTATION_EXISTS":
      return context.hasCompletedConsultation;
    case "FOLLOW_UP_DUE":
      return context.hasFollowUpDue;
    case "RELATIONSHIP_CONTEXT_DETECTED":
      return context.hasRelationshipContext;
    case "REMEDY_SIGNALS_PRESENT":
      return context.hasRemedySignals;
    case "TIMING_CONTEXT_READY":
      return context.hasTimingContext;
  }
}

function isOfferEligible(
  offer: PremiumOfferCatalogItem,
  context: PremiumOfferEligibilityContext
) {
  return offer.eligibilityRules.every((rule) => isRuleEligible(rule.key, context));
}

export function getPremiumOfferCatalog(query: PremiumCatalogQuery = {}) {
  const withCategory = query.category
    ? premiumOfferCatalog.filter((offer) => offer.category === query.category)
    : premiumOfferCatalog;

  const surfaceTarget = query.surfaceTarget;
  const withSurface = surfaceTarget
    ? withCategory.filter((offer) => offer.surfaceTargets.includes(surfaceTarget))
    : withCategory;

  const contextTag = query.contextTag;
  const withContextTag = contextTag
    ? withSurface.filter((offer) => offer.contextTags.includes(contextTag))
    : withSurface;

  if (query.eligibleOnly) {
    const eligibilityContext = query.eligibilityContext;

    if (!eligibilityContext) {
      return [];
    }

    return withContextTag.filter((offer) =>
      isOfferEligible(offer, eligibilityContext)
    );
  }

  return withContextTag;
}

export function getPremiumOfferCategories() {
  return Array.from(new Set(premiumOfferCatalog.map((offer) => offer.category)));
}

export function getPremiumReportProducts() {
  return reportProducts;
}

export function findPremiumOfferById(offerId: string) {
  return premiumOfferCatalog.find((offer) => offer.id === offerId) ?? null;
}

export function createDefaultPremiumOfferEligibilityContext(): PremiumOfferEligibilityContext {
  return {
    hasChart: false,
    hasReport: false,
    hasCompletedConsultation: false,
    hasFollowUpDue: false,
    hasRelationshipContext: false,
    hasRemedySignals: false,
    hasTimingContext: false,
  };
}
