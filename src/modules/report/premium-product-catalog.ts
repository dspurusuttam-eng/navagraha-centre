import type { MonetizationPlanType } from "@/modules/subscriptions/monetization-content";

export type PremiumProductKey =
  | "career-report"
  | "marriage-report"
  | "finance-report"
  | "health-report"
  | "deep-ai-reading"
  | "consultation-guidance";

export type PremiumProductSurface = "public" | "protected";

export type PremiumProductCatalogItem = {
  key: PremiumProductKey;
  title: string;
  categoryLabel: "Report" | "AI Reading" | "Consultation";
  helpsWith: string;
  bestFor: string;
  includes: readonly string[];
  previewValue: string;
  premiumValue: string;
  relationshipNote: string;
  publicHref: string;
  protectedHref: string;
  ctaLabelPublic: string;
  ctaLabelProtected: string;
};

const premiumProductCatalog: readonly PremiumProductCatalogItem[] = [
  {
    key: "career-report",
    title: "Career Report",
    categoryLabel: "Report",
    helpsWith: "Career direction, timing rhythm, and practical focus priorities.",
    bestFor: "Members exploring work transitions or role-fit clarity.",
    includes: [
      "Structured chart lens for career context",
      "Timing-aware report sections",
      "Assistant follow-up pathway",
    ],
    previewValue: "Foundational preview plus summary insights.",
    premiumValue: "Full section depth with stronger continuity across sessions.",
    relationshipNote: "Use with Ask My Chart for deeper career follow-up.",
    publicHref: "/career-report",
    protectedHref: "/dashboard/report",
    ctaLabelPublic: "View Career Report",
    ctaLabelProtected: "Open Career Layer",
  },
  {
    key: "marriage-report",
    title: "Marriage / Compatibility Report",
    categoryLabel: "Report",
    helpsWith: "Compatibility themes, communication tone, and relationship timing context.",
    bestFor: "Members preparing relationship decisions with calm structure.",
    includes: [
      "Compatibility-oriented interpretation sections",
      "Chart-grounded relationship context",
      "Consultation continuation path",
    ],
    previewValue: "Core compatibility teaser and limited view.",
    premiumValue: "Deeper compatibility reasoning and guided follow-up.",
    relationshipNote: "Can continue into consultation for nuanced human interpretation.",
    publicHref: "/marriage-compatibility",
    protectedHref: "/dashboard/report",
    ctaLabelPublic: "Explore Compatibility",
    ctaLabelProtected: "Open Compatibility Layer",
  },
  {
    key: "finance-report",
    title: "Finance Report",
    categoryLabel: "Report",
    helpsWith: "Resource discipline, decision timing, and risk-awareness pacing.",
    bestFor: "Members seeking reflective financial timing context.",
    includes: [
      "Finance-focused timing sections",
      "Chart-backed strengths and pressure points",
      "Premium assistant continuation",
    ],
    previewValue: "Useful finance preview before upgrade.",
    premiumValue: "Full finance report depth with continuity across sessions.",
    relationshipNote: "Pair with Ask My Chart to clarify action priority.",
    publicHref: "/finance-report",
    protectedHref: "/dashboard/report",
    ctaLabelPublic: "View Finance Report",
    ctaLabelProtected: "Open Finance Layer",
  },
  {
    key: "health-report",
    title: "Health / Wellbeing Report",
    categoryLabel: "Report",
    helpsWith: "Energy rhythm awareness and sustainable pace planning.",
    bestFor: "Members wanting reflective wellbeing context with safety boundaries.",
    includes: [
      "Wellbeing-oriented interpretation sections",
      "Chart-grounded pacing themes",
      "Consultation escalation option",
    ],
    previewValue: "Safe, useful wellbeing preview.",
    premiumValue: "Richer section depth for continuity and follow-up.",
    relationshipNote: "Maintains non-medical, trust-safe guidance boundaries.",
    publicHref: "/health-report",
    protectedHref: "/dashboard/report",
    ctaLabelPublic: "View Health Report",
    ctaLabelProtected: "Open Wellbeing Layer",
  },
  {
    key: "deep-ai-reading",
    title: "Deep AI Chart Reading",
    categoryLabel: "AI Reading",
    helpsWith: "Richer chart reasoning and extended assistant continuity.",
    bestFor: "Members who return often for chart-specific follow-up.",
    includes: [
      "Chart-aware assistant depth",
      "Cross-link into premium report sections",
      "Persistent flow from question to report",
    ],
    previewValue: "Foundational Ask My Chart support.",
    premiumValue: "Deeper AI interpretation and higher continuity.",
    relationshipNote: "Natural bridge from assistant questions to premium reports.",
    publicHref: "/kundli-ai",
    protectedHref: "/dashboard/ask-my-chart",
    ctaLabelPublic: "Explore AI Reading",
    ctaLabelProtected: "Open Ask My Chart",
  },
  {
    key: "consultation-guidance",
    title: "Consultation-led Premium Guidance",
    categoryLabel: "Consultation",
    helpsWith: "Human-led nuance when premium report or AI context needs deeper interpretation.",
    bestFor: "Members handling high-context decisions.",
    includes: [
      "Consultation pathway from report and assistant",
      "Context continuity from saved chart",
      "Calm non-deterministic interpretation style",
    ],
    previewValue: "Consultation access remains visible and clear.",
    premiumValue: "Richer preparation through premium report and AI context first.",
    relationshipNote: "Best used as a follow-up to chart + report + assistant context.",
    publicHref: "/consultation",
    protectedHref: "/dashboard/consultations",
    ctaLabelPublic: "Book Consultation",
    ctaLabelProtected: "Open Consultation Path",
  },
] as const;

export function listPremiumProductCatalog(
  includeKeys?: readonly PremiumProductKey[]
) {
  if (!includeKeys?.length) {
    return premiumProductCatalog;
  }

  const keySet = new Set(includeKeys);
  return premiumProductCatalog.filter((item) => keySet.has(item.key));
}

export function resolvePremiumProductHref(
  item: PremiumProductCatalogItem,
  surface: PremiumProductSurface
) {
  return surface === "protected" ? item.protectedHref : item.publicHref;
}

export function resolvePremiumProductCtaLabel(
  item: PremiumProductCatalogItem,
  surface: PremiumProductSurface
) {
  return surface === "protected" ? item.ctaLabelProtected : item.ctaLabelPublic;
}

export function isPremiumProductUnlocked(input: {
  item: PremiumProductCatalogItem;
  planType: MonetizationPlanType;
  unlockedKeys?: readonly PremiumProductKey[];
}) {
  if (input.unlockedKeys?.includes(input.item.key)) {
    return true;
  }

  if (input.planType === "PRO") {
    return true;
  }

  if (input.planType === "PREMIUM") {
    return input.item.key !== "consultation-guidance";
  }

  return false;
}
