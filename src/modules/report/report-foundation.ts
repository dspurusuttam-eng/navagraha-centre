import "server-only";

import type { ChartReportState, ReportAccuracySnapshot } from "@/modules/report/service";
import type { CurrentCycleSummary } from "@/lib/astrology/current-cycle";
import type { ChartInsights, ReportPredictiveContext } from "@/lib/ai/types";

export type ReportFoundationTypeKey =
  | "FULL_KUNDLI"
  | "CAREER"
  | "MARRIAGE"
  | "FINANCE"
  | "HEALTH"
  | "EDUCATION"
  | "BUSINESS"
  | "DAILY"
  | "YEARLY";

export type ReportAccessTier = "FREE" | "PREMIUM" | "PRO" | "UNKNOWN";
export type ReportUnlockState =
  | "UNLOCKED"
  | "PREVIEW_LOCKED"
  | "LIMIT_REACHED";

export type ReportSectionKey =
  | "executive-summary"
  | "chart-foundation"
  | "key-strengths"
  | "caution-areas"
  | "timing-dasha-insight"
  | "transit-current-period-insight"
  | "house-based-analysis"
  | "yoga-rule-signals"
  | "practical-guidance"
  | "optional-remedies"
  | "premium-deep-dive-sections"
  | "disclaimer-safety-note"
  | "next-step-cta";

export type ReportSectionFlags = {
  previewAllowed: boolean;
  premiumOnly: boolean;
  requiresUnlockedReport: boolean;
};

export type ReportSectionPlan = {
  key: ReportSectionKey;
  title: string;
  content: string;
  flags: ReportSectionFlags;
};

export type ReportTypeProfile = {
  key: ReportFoundationTypeKey;
  title: string;
  includedSections: readonly ReportSectionKey[];
  requiredContext: readonly string[];
  optionalContext: readonly string[];
  safetyRules: readonly string[];
  softCtaPath: string;
  previewSections: readonly ReportSectionKey[];
  premiumSections: readonly ReportSectionKey[];
};

export type ReportFoundation = {
  reportType: ReportFoundationTypeKey;
  accessTier: ReportAccessTier;
  unlockState: ReportUnlockState;
  profile: ReportTypeProfile;
  chartContext: {
    hasSavedChart: boolean;
    hasBirthProfile: boolean;
    hasChart: boolean;
    hasLagnaChart: boolean;
    hasHouseAnalysis: boolean;
    hasDashaChain: boolean;
    hasTransitContext: boolean;
    hasPredictiveContext: boolean;
    hasYogaSignals: boolean;
    hasDivisionalCharts: boolean;
    divisionalChartCodes: string[];
    hasD9: boolean;
    hasD10: boolean;
    panchangAvailable: boolean;
  };
  contextSummary: {
    executiveSummary: string;
    chartFoundation: string;
    keyStrengths: string[];
    cautionAreas: string[];
    timingInsight: string;
    transitInsight: string;
    houseAnalysis: string[];
    yogaSignals: string[];
    practicalGuidance: string[];
    optionalRemedies: string[];
    premiumDeepDive: string[];
    disclaimer: string;
    nextStepCta: string;
  };
  timingContext: {
    dashaLord: string | null;
    currentCycleOverview: string;
    predictiveOverview: string | null;
    confidenceLevel: ReportPredictiveContext["confidence"]["level"] | null;
  };
  accuracy: ReportAccuracySnapshot | null;
  missingContext: string[];
  sectionPlan: ReportSectionPlan[];
};

const sectionOrder: readonly ReportSectionKey[] = [
  "executive-summary",
  "chart-foundation",
  "key-strengths",
  "caution-areas",
  "timing-dasha-insight",
  "transit-current-period-insight",
  "house-based-analysis",
  "yoga-rule-signals",
  "practical-guidance",
  "optional-remedies",
  "premium-deep-dive-sections",
  "disclaimer-safety-note",
  "next-step-cta",
] as const;

const sectionTitleMap: Record<ReportSectionKey, string> = {
  "executive-summary": "Executive Summary",
  "chart-foundation": "Chart Foundation",
  "key-strengths": "Key Strengths",
  "caution-areas": "Caution Areas",
  "timing-dasha-insight": "Timing / Dasha Insight",
  "transit-current-period-insight": "Transit / Current Period Insight",
  "house-based-analysis": "House-Based Analysis",
  "yoga-rule-signals": "Yoga / Rule Signals",
  "practical-guidance": "Practical Guidance",
  "optional-remedies": "Optional Remedies",
  "premium-deep-dive-sections": "Premium Deep-Dive Sections",
  "disclaimer-safety-note": "Disclaimer / Safety Note",
  "next-step-cta": "Next Step CTA",
};

const careerSectionTitleMap: Partial<Record<ReportSectionKey, string>> = {
  "executive-summary": "Career Executive Summary",
  "chart-foundation": "Career Foundation",
  "key-strengths": "Professional Strengths",
  "caution-areas": "Work Pressure / Obstacles",
  "timing-dasha-insight": "Dasha / Career Timing",
  "transit-current-period-insight": "Income / Gains Connection",
  "house-based-analysis": "Job vs Business Tendency",
  "yoga-rule-signals": "Career Yoga / Rule Signals",
  "practical-guidance": "Practical Career Guidance",
  "optional-remedies": "Optional Career Remedies",
  "premium-deep-dive-sections": "Career Deep Dive",
};

const marriageSectionTitleMap: Partial<Record<ReportSectionKey, string>> = {
  "executive-summary": "Relationship Executive Summary",
  "chart-foundation": "Marriage Foundation",
  "key-strengths": "Partner / Spouse Tendency",
  "caution-areas": "Delay / Caution Areas",
  "timing-dasha-insight": "Marriage Timing Overview",
  "transit-current-period-insight": "Family & Social Support",
  "house-based-analysis": "Compatibility & Harmony Factors",
  "yoga-rule-signals": "Love vs Arranged Marriage Tendency",
  "practical-guidance": "Relationship Guidance",
  "optional-remedies": "Optional Relationship Remedies",
  "premium-deep-dive-sections": "Marriage Deep Dive",
};

const financeSectionTitleMap: Partial<Record<ReportSectionKey, string>> = {
  "executive-summary": "Financial Executive Summary",
  "chart-foundation": "Income & Savings Foundation",
  "key-strengths": "Gains & Wealth Growth",
  "caution-areas": "Expense / Debt / Risk Pattern",
  "timing-dasha-insight": "Dasha / Financial Timing",
  "transit-current-period-insight": "Transit / Current Financial Period Insight",
  "house-based-analysis": "Profession-to-Income Connection",
  "yoga-rule-signals": "Dhana Yoga / Wealth Rule Signals",
  "practical-guidance": "Practical Financial Guidance",
  "optional-remedies": "Optional Finance Remedies",
  "premium-deep-dive-sections": "Finance Deep Dive",
};

const educationSectionTitleMap: Partial<Record<ReportSectionKey, string>> = {
  "executive-summary": "Education Executive Summary",
  "chart-foundation": "Learning Foundation",
  "key-strengths": "Subject / Field Tendency",
  "caution-areas": "Concentration & Memory Pattern",
  "timing-dasha-insight": "Dasha / Education Timing",
  "transit-current-period-insight": "Transit / Current Study Period",
  "house-based-analysis": "Higher Studies & Mentor Support",
  "yoga-rule-signals": "Competitive Exam / Discipline Indicators",
  "practical-guidance": "Practical Study Guidance",
  "optional-remedies": "Optional Education Remedies",
  "premium-deep-dive-sections": "Education Deep Dive",
  "disclaimer-safety-note": "Student Safety Disclaimer",
};

const businessSectionTitleMap: Partial<Record<ReportSectionKey, string>> = {
  "executive-summary": "Business Executive Summary",
  "chart-foundation": "Business Foundation",
  "key-strengths": "Entrepreneurship Strengths",
  "caution-areas": "Risk / Debt / Legal Caution",
  "timing-dasha-insight": "Dasha / Business Timing",
  "transit-current-period-insight": "Transit / Current Business Period",
  "house-based-analysis": "Business / Job / Partnership Tendency",
  "yoga-rule-signals": "Client / Customer Growth Pattern",
  "practical-guidance": "Practical Business Guidance",
  "optional-remedies": "Optional Business Remedies",
  "premium-deep-dive-sections": "Business Deep Dive",
  "disclaimer-safety-note": "Business Safety Disclaimer",
};

const healthSectionTitleMap: Partial<Record<ReportSectionKey, string>> = {
  "executive-summary": "Wellness Executive Summary",
  "chart-foundation": "Body / Vitality Foundation",
  "key-strengths": "Wellness Strengths",
  "caution-areas": "Routine / Health Pressure Indicators",
  "timing-dasha-insight": "Dasha / Wellness Timing",
  "transit-current-period-insight": "Transit / Current Wellness Period",
  "house-based-analysis": "Long-Term Wellness Sensitivity",
  "yoga-rule-signals": "Wellness Yoga / Rule Signals",
  "practical-guidance": "Practical Lifestyle Guidance",
  "optional-remedies": "Optional Spiritual Support",
  "premium-deep-dive-sections": "Wellness Deep Dive",
};

const baseSafetyRules = [
  "No guaranteed prediction language.",
  "No fear-based claims.",
  "No medical, legal, financial, or investment certainty.",
  "No coercive relationship advice.",
  "Optional remedies only; no remedy guarantee claims.",
  "No raw chart or internal context exposure.",
] as const;

const reportTypeProfiles: Record<ReportFoundationTypeKey, ReportTypeProfile> = {
  FULL_KUNDLI: {
    key: "FULL_KUNDLI",
    title: "Full Kundli Report",
    includedSections: sectionOrder,
    requiredContext: [
      "birth details",
      "Lagna / Ascendant",
      "Moon sign",
      "planetary positions",
      "house placements",
    ],
    optionalContext: [
      "Sun sign when available",
      "12 Bhava analysis when available",
      "Dasha chain",
      "transit context",
      "yoga / rule signals",
      "predictive synthesis summary",
      "Phase 19 AI insights when available",
      "D9 / Navamsa when available",
      "D10 / Dashamsa when available",
    ],
    safetyRules: [
      ...baseSafetyRules,
      "Full Kundli preview should remain limited to high-level chart orientation only.",
      "Deeper house, timing, yoga, and life-area analysis should stay premium-calibrated when gating requires it.",
    ],
    softCtaPath: "/dashboard/ask-my-chart",
    previewSections: [
      "executive-summary",
      "chart-foundation",
      "key-strengths",
      "disclaimer-safety-note",
      "next-step-cta",
    ],
    premiumSections: [
      "caution-areas",
      "timing-dasha-insight",
      "transit-current-period-insight",
      "house-based-analysis",
      "yoga-rule-signals",
      "practical-guidance",
      "optional-remedies",
      "premium-deep-dive-sections",
    ],
  },
  CAREER: {
    key: "CAREER",
    title: "Career Report",
    includedSections: sectionOrder,
    requiredContext: ["10th house", "6th house", "Mercury", "Saturn"],
    optionalContext: [
      "11th house",
      "2nd house",
      "3rd house",
      "5th house",
      "7th house",
      "9th house",
      "D10 / Dashamsa when available",
      "transit context",
      "predictive synthesis summary",
    ],
    safetyRules: [
      ...baseSafetyRules,
      "Career advice should remain reflective, not deterministic or guaranteed.",
    ],
    softCtaPath: "/career-report",
    previewSections: [
      "executive-summary",
      "chart-foundation",
      "key-strengths",
      "caution-areas",
      "disclaimer-safety-note",
      "next-step-cta",
    ],
    premiumSections: [
      "timing-dasha-insight",
      "transit-current-period-insight",
      "house-based-analysis",
      "yoga-rule-signals",
      "practical-guidance",
      "optional-remedies",
      "premium-deep-dive-sections",
    ],
  },
  MARRIAGE: {
    key: "MARRIAGE",
    title: "Marriage / Compatibility Report",
    includedSections: sectionOrder,
    requiredContext: ["7th house", "Venus", "Moon"],
    optionalContext: ["D9 / Navamsa when available", "transit context", "predictive synthesis summary"],
    safetyRules: [
      ...baseSafetyRules,
      "Relationship guidance should avoid coercion, certainty, or pressure language.",
    ],
    softCtaPath: "/marriage-compatibility",
    previewSections: [
      "executive-summary",
      "chart-foundation",
      "key-strengths",
      "caution-areas",
      "disclaimer-safety-note",
      "next-step-cta",
    ],
    premiumSections: [
      "timing-dasha-insight",
      "transit-current-period-insight",
      "house-based-analysis",
      "yoga-rule-signals",
      "practical-guidance",
      "optional-remedies",
      "premium-deep-dive-sections",
    ],
  },
  FINANCE: {
    key: "FINANCE",
    title: "Finance Report",
    includedSections: sectionOrder,
    requiredContext: ["2nd house", "11th house", "5th house", "Mercury"],
    optionalContext: [
      "6th house",
      "8th house",
      "9th house",
      "10th house",
      "12th house",
      "transit context",
      "predictive synthesis summary",
      "D10 when available",
    ],
    safetyRules: [
      ...baseSafetyRules,
      "Finance guidance must not become investment advice or guaranteed-return language.",
    ],
    softCtaPath: "/finance-report",
    previewSections: [
      "executive-summary",
      "chart-foundation",
      "key-strengths",
      "caution-areas",
      "disclaimer-safety-note",
      "next-step-cta",
    ],
    premiumSections: [
      "timing-dasha-insight",
      "transit-current-period-insight",
      "house-based-analysis",
      "yoga-rule-signals",
      "practical-guidance",
      "optional-remedies",
      "premium-deep-dive-sections",
    ],
  },
  HEALTH: {
    key: "HEALTH",
    title: "Health / Wellness Report",
    includedSections: sectionOrder,
    requiredContext: ["1st house", "6th house", "Moon", "Sun", "Saturn"],
    optionalContext: [
      "8th house",
      "12th house",
      "Mars",
      "Mercury",
      "Jupiter",
      "Venus",
      "transit context",
      "predictive synthesis summary",
      "daily timing context when relevant",
    ],
    safetyRules: [
      ...baseSafetyRules,
      "Health guidance must stay non-medical and never replace qualified care.",
    ],
    softCtaPath: "/health-report",
    previewSections: [
      "executive-summary",
      "chart-foundation",
      "key-strengths",
      "disclaimer-safety-note",
      "next-step-cta",
    ],
    premiumSections: [
      "caution-areas",
      "timing-dasha-insight",
      "transit-current-period-insight",
      "practical-guidance",
      "house-based-analysis",
      "yoga-rule-signals",
      "optional-remedies",
      "premium-deep-dive-sections",
    ],
  },
  EDUCATION: {
    key: "EDUCATION",
    title: "Education Report",
    includedSections: sectionOrder,
    requiredContext: ["4th house", "5th house", "9th house", "Mercury", "Jupiter"],
    optionalContext: ["2nd house", "3rd house", "6th house", "10th house", "transit context", "predictive synthesis summary"],
    safetyRules: [
      ...baseSafetyRules,
      "Education guidance must avoid guaranteed exam, marks, rank, or admission outcomes.",
      "Student distress should stay on the existing safety path and never be shamed or pressured.",
    ],
    softCtaPath: "/dashboard/ask-my-chart",
    previewSections: [
      "executive-summary",
      "chart-foundation",
      "disclaimer-safety-note",
      "next-step-cta",
    ],
    premiumSections: [
      "key-strengths",
      "caution-areas",
      "timing-dasha-insight",
      "transit-current-period-insight",
      "practical-guidance",
      "house-based-analysis",
      "yoga-rule-signals",
      "optional-remedies",
      "premium-deep-dive-sections",
    ],
  },
  BUSINESS: {
    key: "BUSINESS",
    title: "Business / Entrepreneurship Report",
    includedSections: sectionOrder,
    requiredContext: ["7th house", "10th house", "11th house", "Mercury", "Saturn"],
    optionalContext: ["2nd house", "3rd house", "5th house", "8th house", "9th house", "12th house", "transit context", "predictive synthesis summary", "D10 when available"],
    safetyRules: [
      ...baseSafetyRules,
      "Business guidance must not become investment, legal, tax, funding, or revenue certainty.",
      "Business guidance must not promise clients, profit, scale, or market success.",
    ],
    softCtaPath: "/dashboard/ask-my-chart",
    previewSections: [
      "executive-summary",
      "chart-foundation",
      "disclaimer-safety-note",
      "next-step-cta",
    ],
    premiumSections: [
      "key-strengths",
      "caution-areas",
      "timing-dasha-insight",
      "transit-current-period-insight",
      "house-based-analysis",
      "yoga-rule-signals",
      "practical-guidance",
      "optional-remedies",
      "premium-deep-dive-sections",
    ],
  },
  DAILY: {
    key: "DAILY",
    title: "Daily Personalized Prediction Report",
    includedSections: sectionOrder,
    requiredContext: ["active/saved chart", "Lagna", "Moon sign", "Dasha chain", "transit context"],
    optionalContext: ["Panchang / timing windows", "lucky indicators", "daily remedies"],
    safetyRules: [
      ...baseSafetyRules,
      "Daily guidance must not guarantee events or create fear around timing windows.",
    ],
    softCtaPath: "/daily-horoscope",
    previewSections: [
      "executive-summary",
      "chart-foundation",
      "key-strengths",
      "caution-areas",
      "timing-dasha-insight",
      "transit-current-period-insight",
      "practical-guidance",
      "disclaimer-safety-note",
      "next-step-cta",
    ],
    premiumSections: [
      "house-based-analysis",
      "yoga-rule-signals",
      "optional-remedies",
      "premium-deep-dive-sections",
    ],
  },
  YEARLY: {
    key: "YEARLY",
    title: "Yearly Guidance Report",
    includedSections: sectionOrder,
    requiredContext: ["Dasha chain", "transit context", "predictive synthesis summary"],
    optionalContext: ["yearly timing calendar", "house emphasis", "divisional charts when available"],
    safetyRules: [
      ...baseSafetyRules,
      "Yearly guidance should remain directional, not deterministic.",
    ],
    softCtaPath: "/reports",
    previewSections: [
      "executive-summary",
      "chart-foundation",
      "key-strengths",
      "caution-areas",
      "timing-dasha-insight",
      "transit-current-period-insight",
      "practical-guidance",
      "disclaimer-safety-note",
      "next-step-cta",
    ],
    premiumSections: [
      "house-based-analysis",
      "yoga-rule-signals",
      "optional-remedies",
      "premium-deep-dive-sections",
    ],
  },
};

function ordinalLabel(value: number) {
  const suffix =
    value % 10 === 1 && value % 100 !== 11
      ? "st"
      : value % 10 === 2 && value % 100 !== 12
        ? "nd"
        : value % 10 === 3 && value % 100 !== 13
          ? "rd"
          : "th";

  return `${value}${suffix}`;
}

function toTitleCase(value: string) {
  return value
    .split(/[\s/_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

function joinOrFallback(items: string[], fallback: string) {
  return items.length ? items.join(" ") : fallback;
}

function formatPlanetName(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function findPlanetSign(
  chartReport: Extract<ChartReportState, { status: "ready" }>["overview"]["chart"],
  planetName: string
) {
  return chartReport.planets.find((planet) => planet.body === planetName)?.sign ?? null;
}

function summarizeCurrentCycle(currentCycle: CurrentCycleSummary) {
  if (currentCycle.status !== "ready") {
    return currentCycle.unavailableReason ?? "Current timing context is unavailable.";
  }

  return currentCycle.synthesis.overview;
}

function buildChartFoundationSummary(input: {
  chartReport: ChartReportState;
}) {
  if (input.chartReport.status !== "ready") {
    return "Saved chart context is not ready yet, so the report foundation is showing the safe fallback state.";
  }

  const houseCount = input.chartReport.overview.chart.houses.length;
  const housePreview = input.chartReport.overview.chart.houses
    .slice(0, 4)
    .map((house) => `${ordinalLabel(house.house)} house in ${toTitleCase(house.sign)}`)
    .join(", ");

  const moonSign = findPlanetSign(input.chartReport.overview.chart, "Moon");
  const sunSign = findPlanetSign(input.chartReport.overview.chart, "Sun");
  const ascendant = input.chartReport.overview.chart.ascendantSign;

  return `${input.chartReport.overview.birthProfile.label} is the chart foundation. ${input.chartReport.overview.chart.summary.narrative} ${ascendant ? `Lagna points to ${toTitleCase(ascendant)} rising.` : ""} ${moonSign ? `Moon is placed in ${toTitleCase(moonSign)}.` : ""} ${sunSign ? `Sun is placed in ${toTitleCase(sunSign)}.` : ""} ${houseCount ? `House placements are available across ${houseCount} bhavas${housePreview ? `; key placements start with ${housePreview}.` : "."}` : "No house placements are available yet."}`;
}

function getHouseSign(
  chartReport: Extract<ChartReportState, { status: "ready" }>["overview"]["chart"],
  houseNumber: number
) {
  return chartReport.houses.find((house) => house.house === houseNumber)?.sign ?? null;
}

function getHouseRuler(
  chartReport: Extract<ChartReportState, { status: "ready" }>["overview"]["chart"],
  houseNumber: number
) {
  return chartReport.houses.find((house) => house.house === houseNumber)?.ruler ?? null;
}

function buildCareerChartFoundationSummary(input: { chartReport: ChartReportState }) {
  if (input.chartReport.status !== "ready") {
    return "Saved chart context is not ready yet, so the career foundation is showing the safe fallback state.";
  }

  const chart = input.chartReport.overview.chart;
  const ascendant = toTitleCase(chart.ascendantSign);
  const tenthHouse = getHouseSign(chart, 10);
  const sixthHouse = getHouseSign(chart, 6);
  const eleventhHouse = getHouseSign(chart, 11);

  return `Career foundation starts with ${input.chartReport.overview.birthProfile.label}. Lagna points to ${ascendant} rising, so career style is read through that basic temperament. The 10th house is ${tenthHouse ? toTitleCase(tenthHouse) : "not available"}, the 6th house is ${sixthHouse ? toTitleCase(sixthHouse) : "not available"}, and the 11th house is ${eleventhHouse ? toTitleCase(eleventhHouse) : "not available"}. ${chart.summary.narrative}`;
}

function buildMarriageChartFoundationSummary(input: { chartReport: ChartReportState }) {
  if (input.chartReport.status !== "ready") {
    return "Saved chart context is not ready yet, so the marriage foundation is showing the safe fallback state.";
  }

  const chart = input.chartReport.overview.chart;
  const ascendant = toTitleCase(chart.ascendantSign);
  const seventhHouse = getHouseSign(chart, 7);
  const venus = findPlanetSign(chart, "Venus");
  const moon = findPlanetSign(chart, "Moon");
  const jupiter = findPlanetSign(chart, "Jupiter");

  return `Marriage foundation starts with ${input.chartReport.overview.birthProfile.label}. Lagna points to ${ascendant} rising, while the 7th house is ${seventhHouse ? toTitleCase(seventhHouse) : "not available"}. Venus${venus ? ` is placed in ${toTitleCase(venus)}` : " is read through the chart pattern"}; Moon${moon ? ` is placed in ${toTitleCase(moon)}` : " stays part of the emotional tone"}; Jupiter${jupiter ? ` is placed in ${toTitleCase(jupiter)}` : " adds guidance only where available"}. ${chart.summary.narrative}`;
}

function buildCareerHouseAnalysis(input: { chartReport: ChartReportState }) {
  if (input.chartReport.status !== "ready") {
    return [
      "No career house analysis is available until the natal chart is ready.",
    ];
  }

  const chart = input.chartReport.overview.chart;
  const focusHouses = [10, 6, 11, 2, 3, 5, 7, 9];

  return focusHouses.map((houseNumber) => {
    const sign = getHouseSign(chart, houseNumber);
    const ruler = getHouseRuler(chart, houseNumber);
    return `${ordinalLabel(houseNumber)} house${sign ? ` in ${toTitleCase(sign)}` : ""}${ruler ? `, ruled by ${formatPlanetName(ruler)}` : ""}`;
  });
}

function buildMarriageHouseAnalysis(input: { chartReport: ChartReportState }) {
  if (input.chartReport.status !== "ready") {
    return [
      "No compatibility and harmony analysis is available until the natal chart is ready.",
    ];
  }

  const chart = input.chartReport.overview.chart;
  const focusHouses = [7, 2, 4, 5, 8, 11];

  return focusHouses.map((houseNumber) => {
    const sign = getHouseSign(chart, houseNumber);
    const ruler = getHouseRuler(chart, houseNumber);
    return `${ordinalLabel(houseNumber)} house${sign ? ` in ${toTitleCase(sign)}` : ""}${ruler ? `, ruled by ${formatPlanetName(ruler)}` : ""}`;
  });
}

function buildCareerStrengths(input: { chartReport: ChartReportState }) {
  if (input.chartReport.status !== "ready") {
    return [
      "No career strengths are available until the natal chart is ready.",
    ];
  }

  const chart = input.chartReport.overview.chart;
  const strongest = chart.summary.strongestPlanets?.slice(0, 3) ?? chart.summary.dominantBodies.slice(0, 3);

  return [
    `Professional strengths are most visible through ${strongest.map(formatPlanetName).join(", ") || "the chart's main emphasis"} and the chart's house balance.`,
    `Communication, discipline, and initiative should be read through the 3rd, 6th, and 10th house pattern rather than as a one-line promise.`,
    chart.summary.narrative,
  ];
}

function buildMarriageStrengths(input: { chartReport: ChartReportState }) {
  if (input.chartReport.status !== "ready") {
    return [
      "No relationship strengths are available until the natal chart is ready.",
    ];
  }

  const chart = input.chartReport.overview.chart;
  const strongest = chart.summary.strongestPlanets?.slice(0, 3) ?? chart.summary.dominantBodies.slice(0, 3);
  const relationshipBodies = ["Venus", "Moon", "Jupiter"].filter((body) =>
    strongest.map((item) => item.toUpperCase()).includes(body.toUpperCase()) ||
    chart.summary.dominantBodies.map((item) => item.toUpperCase()).includes(body.toUpperCase())
  );

  return [
    `Relationship strengths are most visible through ${joinOrFallback(
      relationshipBodies.map(formatPlanetName),
      strongest.map(formatPlanetName).join(", ") || "the chart's main relationship emphasis"
    )} and the balance between the 5th, 7th, 8th, and 11th houses.`,
    `Emotional tone, communication rhythm, and willingness to hold responsibility matter more here than any one-line promise of compatibility.`,
    chart.summary.narrative,
  ];
}

function buildCareerCautionAreas(input: { chartReport: ChartReportState }) {
  if (input.chartReport.status !== "ready") {
    return [
      "No career caution areas are available until the natal chart is ready.",
    ];
  }

  const chart = input.chartReport.overview.chart;
  const challengingPlanets = chart.summary.challengingPlanets?.slice(0, 3) ?? [];
  const challengingHouses = chart.summary.challengingHouses?.slice(0, 3) ?? [];

  const parts = [
    challengingPlanets.length
      ? `Work pressure may cluster around ${challengingPlanets.map(formatPlanetName).join(", ")}.`
      : "No strong challenging planet pattern is surfacing as the main pressure point.",
    challengingHouses.length
      ? `The chart may ask for extra patience around house areas such as ${challengingHouses.join(", ")}.`
      : "No dominant caution house is surfacing strongly enough to exaggerate.",
    "The report keeps this as practical pacing guidance, not a fear-based warning.",
  ];

  return parts;
}

function buildMarriageCautionAreas(input: { chartReport: ChartReportState }) {
  if (input.chartReport.status !== "ready") {
    return [
      "No relationship caution areas are available until the natal chart is ready.",
    ];
  }

  const chart = input.chartReport.overview.chart;
  const challengingPlanets = chart.summary.challengingPlanets?.slice(0, 3) ?? [];
  const challengingHouses = chart.summary.challengingHouses?.slice(0, 3) ?? [];

  return [
    challengingPlanets.length
      ? `Misunderstanding or pressure may cluster around ${challengingPlanets.map(formatPlanetName).join(", ")}.`
      : "No strong challenging planet pattern is surfacing as the main relationship pressure point.",
    challengingHouses.length
      ? `The chart may ask for extra patience around house areas such as ${challengingHouses.join(", ")}.`
      : "No dominant caution house is surfacing strongly enough to exaggerate.",
    "The report keeps this as practical relationship pacing guidance, not a fear-based warning.",
  ];
}

function buildCareerTimingSummary(input: {
  currentCycle: CurrentCycleSummary;
  predictiveContext: ReportPredictiveContext | null;
}) {
  const baseTiming =
    input.currentCycle.status === "ready"
      ? input.currentCycle.synthesis.overview
      : input.currentCycle.unavailableReason ?? "Career timing is unavailable.";

  if (!input.predictiveContext) {
    return baseTiming;
  }

  const timingFocus = input.predictiveContext.dominant_timing_factors.timing_focus.join(", ");
  const dominantPlanets = joinOrFallback(
    input.predictiveContext.dominant_timing_factors.dominant_planets,
    "No dominant planets surfaced."
  );
  return `${baseTiming} Current timing emphasis: ${timingFocus || "steady career pacing"}. Dominant planets: ${dominantPlanets}.`;
}

function buildMarriageTimingSummary(input: {
  currentCycle: CurrentCycleSummary;
  predictiveContext: ReportPredictiveContext | null;
}) {
  const baseTiming =
    input.currentCycle.status === "ready"
      ? input.currentCycle.synthesis.overview
      : input.currentCycle.unavailableReason ?? "Marriage timing is unavailable.";

  if (!input.predictiveContext) {
    return baseTiming;
  }

  const timingFocus = input.predictiveContext.dominant_timing_factors.timing_focus.join(", ");
  const dominantPlanets = joinOrFallback(
    input.predictiveContext.dominant_timing_factors.dominant_planets,
    "No dominant planets surfaced."
  );
  return `${baseTiming} Current relationship timing emphasis: ${timingFocus || "steady relationship pacing"}. Dominant planets: ${dominantPlanets}.`;
}

function buildCareerTransitSummary(input: {
  currentCycle: CurrentCycleSummary;
}) {
  if (input.currentCycle.status !== "ready") {
    return input.currentCycle.unavailableReason ?? "Transit context is unavailable.";
  }

  return `Income and gains are being read through the active cycle tone and transit pressure points. ${input.currentCycle.synthesis.activeAreas[0]?.summary ?? input.currentCycle.synthesis.overview}`;
}

function buildMarriageTransitSummary(input: {
  currentCycle: CurrentCycleSummary;
  chartReport: ChartReportState;
}) {
  if (input.currentCycle.status !== "ready") {
    return input.currentCycle.unavailableReason ?? "Current relationship support context is unavailable.";
  }

  const supportParts: string[] = [];
  const chart = input.chartReport.status === "ready" ? input.chartReport.overview.chart : null;

  if (chart) {
    const secondHouse = getHouseSign(chart, 2);
    const fourthHouse = getHouseSign(chart, 4);
    const eleventhHouse = getHouseSign(chart, 11);
    supportParts.push(
      `Family support is read through the 2nd house${secondHouse ? ` in ${toTitleCase(secondHouse)}` : ""}, the 4th house${fourthHouse ? ` in ${toTitleCase(fourthHouse)}` : ""}, and the 11th house${eleventhHouse ? ` in ${toTitleCase(eleventhHouse)}` : ""}.`
    );
  }

  supportParts.push(
    input.currentCycle.synthesis.activeAreas[0]?.summary ?? input.currentCycle.synthesis.overview
  );

  return supportParts.join(" ");
}

function buildCareerYogaSignals(input: {
  chartReport: ChartReportState;
  predictiveContext: ReportPredictiveContext | null;
}) {
  if (input.predictiveContext) {
    const signals = input.predictiveContext.yoga_rule_summary.top_yoga_signals.map(
      (signal) => `${signal.yoga_name} (${signal.confidence})`
    );

    return signals.length
      ? signals
      : ["Predictive context is ready, but no top career yoga signals were surfaced."];
  }

  if (input.chartReport.status === "ready") {
    return input.chartReport.overview.chart.summary.yogaKeys?.length
      ? input.chartReport.overview.chart.summary.yogaKeys.map((key) => toTitleCase(key))
      : ["No career yoga signal summary is available yet."];
  }

  return ["No career yoga signal summary is available yet."];
}

function buildMarriageYogaSignals(input: {
  chartReport: ChartReportState;
  predictiveContext: ReportPredictiveContext | null;
}) {
  if (input.predictiveContext) {
    const signals = input.predictiveContext.yoga_rule_summary.top_yoga_signals.map(
      (signal) => `${signal.yoga_name} (${signal.confidence})`
    );

    return signals.length
      ? signals
      : ["Predictive context is ready, but no top relationship yoga signals were surfaced."];
  }

  if (input.chartReport.status === "ready") {
    return input.chartReport.overview.chart.summary.yogaKeys?.length
      ? input.chartReport.overview.chart.summary.yogaKeys.map((key) => toTitleCase(key))
      : ["No relationship yoga signal summary is available yet."];
  }

  return ["No relationship yoga signal summary is available yet."];
}

function buildCareerPracticalGuidance(input: {
  insights: ChartInsights;
  currentCycle: CurrentCycleSummary;
}) {
  const careerTips = [
    ...input.insights.recommendations.slice(0, 2),
    input.currentCycle.status === "ready"
      ? input.currentCycle.guidanceCalendar.overview
      : input.currentCycle.unavailableReason ?? "Timing guidance is unavailable.",
    "Use skill-building, networking, and disciplined follow-through instead of chasing a single guaranteed outcome.",
  ];

  return careerTips;
}

function buildMarriagePracticalGuidance(input: {
  insights: ChartInsights;
  currentCycle: CurrentCycleSummary;
}) {
  const relationshipTips = [
    ...input.insights.recommendations.slice(0, 2),
    input.currentCycle.status === "ready"
      ? input.currentCycle.guidanceCalendar.overview
      : input.currentCycle.unavailableReason ?? "Timing guidance is unavailable.",
    "Use communication, patience, expectation clarity, and mutual respect instead of forcing a fixed outcome.",
  ];

  return relationshipTips;
}

function buildCareerOptionalRemedies(input: { chartReport: ChartReportState }) {
  if (input.chartReport.status !== "ready") {
    return [
      "Approved career remedy records are unavailable until the chart is ready.",
    ];
  }

  if (!input.chartReport.remedies.length) {
    return [
      "No approved career remedy records matched the current signal set yet.",
    ];
  }

  return input.chartReport.remedies.slice(0, 3).map((remedy) => remedy.summary);
}

function buildMarriageOptionalRemedies(input: { chartReport: ChartReportState }) {
  if (input.chartReport.status !== "ready") {
    return [
      "Approved relationship remedy records are unavailable until the chart is ready.",
    ];
  }

  if (!input.chartReport.remedies.length) {
    return [
      "No approved relationship remedy records matched the current signal set yet.",
    ];
  }

  return input.chartReport.remedies.slice(0, 3).map((remedy) => remedy.summary);
}

function buildCareerPremiumDeepDive(input: {
  currentCycle: CurrentCycleSummary;
  predictiveContext: ReportPredictiveContext | null;
  chartReport: ChartReportState;
}) {
  const sections: string[] = [];

  if (input.chartReport.status === "ready") {
    const chart = input.chartReport.overview.chart;
    const d10 = chart.divisionalCharts.find((entry) => entry.code === "D10");

    sections.push(
      `Career deep dive: the 10th house, 6th house, and 11th house form the core of the professional reading, while the 2nd, 3rd, 5th, 7th, and 9th add income, communication, strategy, partnerships, and guidance context.`
    );
    sections.push(
      d10
        ? `D10 / Dashamsa is available and may be used as a refinement layer: ${d10.focus}.`
        : "D10 / Dashamsa is not available in the saved chart, so the report stays with the natal career foundation."
    );
  }

  if (input.predictiveContext) {
    sections.push(
      `Dominant timing factors: ${joinOrFallback(
        input.predictiveContext.dominant_timing_factors.dominant_planets,
        "No dominant planets surfaced."
      )}.`
    );
    sections.push(
      `Dominant houses: ${
        input.predictiveContext.dominant_timing_factors.dominant_houses.length
          ? input.predictiveContext.dominant_timing_factors.dominant_houses.join(", ")
          : "Not available"
      }.`
    );
  }

  if (input.currentCycle.status === "ready") {
    sections.push(
      `Current cycle highlights: ${joinOrFallback(
        input.currentCycle.synthesis.timeSensitiveHighlights,
        "No strong time-sensitive highlights are standing out yet."
      )}`
    );
  }

  return sections.length
    ? sections
    : ["No career deep-dive context is available yet."];
}

function buildMarriagePremiumDeepDive(input: {
  currentCycle: CurrentCycleSummary;
  predictiveContext: ReportPredictiveContext | null;
  chartReport: ChartReportState;
}) {
  const sections: string[] = [];

  if (input.chartReport.status === "ready") {
    const chart = input.chartReport.overview.chart;
    const d9 = chart.divisionalCharts.find((entry) => entry.code === "D9");

    sections.push(
      "Marriage deep dive: the 7th house, Venus, Moon, and Jupiter carry the core relationship reading, while the 2nd, 4th, 5th, 8th, and 11th houses add family, comfort, affection, intimacy, and social support context."
    );
    sections.push(
      d9
        ? `D9 / Navamsa is available and may be used as a refinement layer: ${d9.focus}.`
        : "D9 / Navamsa is not available in the saved chart, so the report stays with the natal relationship foundation."
    );
    sections.push(
      "If compatibility score or Guna Milan data is present in the saved context later, it can refine the harmony reading; otherwise the report stays with the birth-chart and timing-based view."
    );
  }

  if (input.predictiveContext) {
    sections.push(
      `Dominant timing factors: ${joinOrFallback(
        input.predictiveContext.dominant_timing_factors.dominant_planets,
        "No dominant planets surfaced."
      )}.`
    );
    sections.push(
      `Dominant houses: ${
        input.predictiveContext.dominant_timing_factors.dominant_houses.length
          ? input.predictiveContext.dominant_timing_factors.dominant_houses.join(", ")
          : "Not available"
      }.`
    );
  }

  if (input.currentCycle.status === "ready") {
    sections.push(
      `Current cycle highlights: ${joinOrFallback(
        input.currentCycle.synthesis.timeSensitiveHighlights,
        "No strong time-sensitive highlights are standing out yet."
      )}`
    );
  }

  return sections.length
    ? sections
    : ["No relationship deep-dive context is available yet."];
}

function buildFinanceChartFoundationSummary(input: { chartReport: ChartReportState }) {
  if (input.chartReport.status !== "ready") {
    return "Saved chart context is not ready yet, so the finance foundation is showing the safe fallback state.";
  }

  const chart = input.chartReport.overview.chart;
  const ascendant = toTitleCase(chart.ascendantSign);
  const secondHouse = getHouseSign(chart, 2);
  const eleventhHouse = getHouseSign(chart, 11);
  const tenthHouse = getHouseSign(chart, 10);
  const jupiter = findPlanetSign(chart, "Jupiter");
  const mercury = findPlanetSign(chart, "Mercury");
  const venus = findPlanetSign(chart, "Venus");

  return `Finance foundation starts with ${input.chartReport.overview.birthProfile.label}. Lagna points to ${ascendant} rising. The 2nd house is ${secondHouse ? toTitleCase(secondHouse) : "not available"}, the 11th house is ${eleventhHouse ? toTitleCase(eleventhHouse) : "not available"}, and the 10th house is ${tenthHouse ? toTitleCase(tenthHouse) : "not available"}. Jupiter${jupiter ? ` is placed in ${toTitleCase(jupiter)}` : " adds a wisdom layer only where available"}; Mercury${mercury ? ` is placed in ${toTitleCase(mercury)}` : " supports trade and calculation only where available"}; Venus${venus ? ` is placed in ${toTitleCase(venus)}` : " supports value and comfort only where available"}. ${chart.summary.narrative}`;
}

function buildFinanceHouseAnalysis(input: { chartReport: ChartReportState }) {
  if (input.chartReport.status !== "ready") {
    return [
      "No finance house analysis is available until the natal chart is ready.",
    ];
  }

  const chart = input.chartReport.overview.chart;
  const focusHouses = [2, 11, 5, 8, 6, 9, 10, 12];

  return focusHouses.map((houseNumber) => {
    const sign = getHouseSign(chart, houseNumber);
    const ruler = getHouseRuler(chart, houseNumber);
    return `${ordinalLabel(houseNumber)} house${sign ? ` in ${toTitleCase(sign)}` : ""}${ruler ? `, ruled by ${formatPlanetName(ruler)}` : ""}`;
  });
}

function buildFinanceStrengths(input: { chartReport: ChartReportState }) {
  if (input.chartReport.status !== "ready") {
    return [
      "No finance strengths are available until the natal chart is ready.",
    ];
  }

  const chart = input.chartReport.overview.chart;
  const strongest = chart.summary.strongestPlanets?.slice(0, 3) ?? chart.summary.dominantBodies.slice(0, 3);
  const wealthBodies = ["Jupiter", "Venus", "Mercury", "Saturn"].filter((body) =>
    strongest.map((item) => item.toUpperCase()).includes(body.toUpperCase()) ||
    chart.summary.dominantBodies.map((item) => item.toUpperCase()).includes(body.toUpperCase())
  );

  return [
    `Wealth strengths are most visible through ${joinOrFallback(
      wealthBodies.map(formatPlanetName),
      strongest.map(formatPlanetName).join(", ") || "the chart's main financial emphasis"
    )} and the balance between income, gains, and discipline.`,
    `Savings growth, practical trade, and measured accumulation matter more here than any one-line promise of wealth.`,
    chart.summary.narrative,
  ];
}

function buildFinanceCautionAreas(input: { chartReport: ChartReportState }) {
  if (input.chartReport.status !== "ready") {
    return [
      "No finance caution areas are available until the natal chart is ready.",
    ];
  }

  const chart = input.chartReport.overview.chart;
  const challengingPlanets = chart.summary.challengingPlanets?.slice(0, 3) ?? [];
  const challengingHouses = chart.summary.challengingHouses?.slice(0, 3) ?? [];

  return [
    challengingPlanets.length
      ? `Financial pressure may cluster around ${challengingPlanets.map(formatPlanetName).join(", ")}.`
      : "No strong challenging planet pattern is surfacing as the main finance pressure point.",
    challengingHouses.length
      ? `The chart may ask for extra caution around house areas such as ${challengingHouses.join(", ")}.`
      : "No dominant caution house is surfacing strongly enough to exaggerate.",
    "The report keeps this as practical finance pacing guidance, not a fear-based warning.",
  ];
}

function buildFinanceTimingSummary(input: {
  currentCycle: CurrentCycleSummary;
  predictiveContext: ReportPredictiveContext | null;
}) {
  const baseTiming =
    input.currentCycle.status === "ready"
      ? input.currentCycle.synthesis.overview
      : input.currentCycle.unavailableReason ?? "Financial timing is unavailable.";

  if (!input.predictiveContext) {
    return baseTiming;
  }

  const timingFocus = input.predictiveContext.dominant_timing_factors.timing_focus.join(", ");
  const dominantPlanets = joinOrFallback(
    input.predictiveContext.dominant_timing_factors.dominant_planets,
    "No dominant planets surfaced."
  );
  return `${baseTiming} Current finance timing emphasis: ${timingFocus || "steady savings and caution"}. Dominant planets: ${dominantPlanets}.`;
}

function buildFinanceTransitSummary(input: {
  currentCycle: CurrentCycleSummary;
}) {
  if (input.currentCycle.status !== "ready") {
    return input.currentCycle.unavailableReason ?? "Current financial period context is unavailable.";
  }

  return `Expenses, cashflow, and gain timing are being read through the active cycle tone and transit pressure points. ${input.currentCycle.synthesis.activeAreas[0]?.summary ?? input.currentCycle.synthesis.overview}`;
}

function buildFinanceYogaSignals(input: {
  chartReport: ChartReportState;
  predictiveContext: ReportPredictiveContext | null;
}) {
  if (input.predictiveContext) {
    const signals = input.predictiveContext.yoga_rule_summary.top_yoga_signals.map(
      (signal) => `${signal.yoga_name} (${signal.confidence})`
    );

    return signals.length
      ? signals
      : ["Predictive context is ready, but no top finance yoga signals were surfaced."];
  }

  if (input.chartReport.status === "ready") {
    return input.chartReport.overview.chart.summary.yogaKeys?.length
      ? input.chartReport.overview.chart.summary.yogaKeys.map((key) => toTitleCase(key))
      : ["No finance yoga signal summary is available yet."];
  }

  return ["No finance yoga signal summary is available yet."];
}

function buildFinancePracticalGuidance(input: {
  insights: ChartInsights;
  currentCycle: CurrentCycleSummary;
}) {
  const financeTips = [
    ...input.insights.recommendations.slice(0, 2),
    input.currentCycle.status === "ready"
      ? input.currentCycle.guidanceCalendar.overview
      : input.currentCycle.unavailableReason ?? "Timing guidance is unavailable.",
    "Use budgeting, savings discipline, expense control, and documentation instead of chasing a guaranteed windfall.",
  ];

  return financeTips;
}

function buildFinanceOptionalRemedies(input: { chartReport: ChartReportState }) {
  if (input.chartReport.status !== "ready") {
    return [
      "Approved finance remedy records are unavailable until the chart is ready.",
    ];
  }

  if (!input.chartReport.remedies.length) {
    return [
      "No approved finance remedy records matched the current signal set yet.",
    ];
  }

  return input.chartReport.remedies.slice(0, 3).map((remedy) => remedy.summary);
}

function buildFinancePremiumDeepDive(input: {
  currentCycle: CurrentCycleSummary;
  predictiveContext: ReportPredictiveContext | null;
  chartReport: ChartReportState;
}) {
  const sections: string[] = [];

  if (input.chartReport.status === "ready") {
    const chart = input.chartReport.overview.chart;
    const d10 = chart.divisionalCharts.find((entry) => entry.code === "D10");

    sections.push(
      "Finance deep dive: the 2nd and 11th houses form the core of the wealth reading, while the 5th, 6th, 8th, 9th, 10th, and 12th add speculation, debt, uncertainty, fortune, profession, and expense context."
    );
    sections.push(
      d10
        ? `D10 / Dashamsa is available and may refine profession-to-income context: ${d10.focus}.`
        : "D10 / Dashamsa is not available in the saved chart, so the report stays with the natal finance foundation."
    );
    sections.push(
      "If Dhana Yoga or wealth-rule data is present in the saved context later, it can refine the reading; otherwise the report stays with the birth-chart and timing-based view."
    );
  }

  if (input.predictiveContext) {
    sections.push(
      `Dominant timing factors: ${joinOrFallback(
        input.predictiveContext.dominant_timing_factors.dominant_planets,
        "No dominant planets surfaced."
      )}.`
    );
    sections.push(
      `Dominant houses: ${
        input.predictiveContext.dominant_timing_factors.dominant_houses.length
          ? input.predictiveContext.dominant_timing_factors.dominant_houses.join(", ")
          : "Not available"
      }.`
    );
  }

  if (input.currentCycle.status === "ready") {
    sections.push(
      `Current cycle highlights: ${joinOrFallback(
        input.currentCycle.synthesis.timeSensitiveHighlights,
        "No strong time-sensitive highlights are standing out yet."
      )}`
    );
  }

  return sections.length
    ? sections
    : ["No finance deep-dive context is available yet."];
}

function buildEducationChartFoundationSummary(input: {
  chartReport: ChartReportState;
}) {
  if (input.chartReport.status !== "ready") {
    return "Saved chart context is not ready yet, so the education foundation is showing the safe fallback state.";
  }

  const chart = input.chartReport.overview.chart;
  const ascendant = toTitleCase(chart.ascendantSign);
  const fourthHouse = getHouseSign(chart, 4);
  const fifthHouse = getHouseSign(chart, 5);
  const ninthHouse = getHouseSign(chart, 9);
  const mercury = findPlanetSign(chart, "Mercury");
  const jupiter = findPlanetSign(chart, "Jupiter");
  const moon = findPlanetSign(chart, "Moon");

  return `Education foundation starts with ${input.chartReport.overview.birthProfile.label}. Lagna points to ${ascendant} rising. The 4th house is ${fourthHouse ? toTitleCase(fourthHouse) : "not available"}, the 5th house is ${fifthHouse ? toTitleCase(fifthHouse) : "not available"}, and the 9th house is ${ninthHouse ? toTitleCase(ninthHouse) : "not available"}. Mercury${mercury ? ` is placed in ${toTitleCase(mercury)}` : " shapes learning only where available"}; Jupiter${jupiter ? ` is placed in ${toTitleCase(jupiter)}` : " shapes guidance only where available"}; Moon${moon ? ` is placed in ${toTitleCase(moon)}` : " shapes concentration only where available"}. ${chart.summary.narrative}`;
}

function buildEducationStrengths(input: { chartReport: ChartReportState }) {
  if (input.chartReport.status !== "ready") {
    return [
      "No education strengths are available until the natal chart is ready.",
    ];
  }

  const chart = input.chartReport.overview.chart;
  const strongest = chart.summary.strongestPlanets?.slice(0, 3) ?? chart.summary.dominantBodies.slice(0, 3);
  const studyBodies = ["Mercury", "Jupiter", "Moon", "Saturn", "Mars"].filter((body) =>
    strongest.map((item) => item.toUpperCase()).includes(body.toUpperCase()) ||
    chart.summary.dominantBodies.map((item) => item.toUpperCase()).includes(body.toUpperCase())
  );

  return [
    `Learning strengths are most visible through ${joinOrFallback(
      studyBodies.map(formatPlanetName),
      strongest.map(formatPlanetName).join(", ") || "the chart's main learning emphasis"
    )} and the balance between memory, discipline, curiosity, and repetition.`,
    "The report keeps subject and field tendency practical rather than deterministic.",
    chart.summary.narrative,
  ];
}

function buildEducationCautionAreas(input: { chartReport: ChartReportState }) {
  if (input.chartReport.status !== "ready") {
    return [
      "No education caution areas are available until the natal chart is ready.",
    ];
  }

  const chart = input.chartReport.overview.chart;
  const challengingPlanets = chart.summary.challengingPlanets?.slice(0, 3) ?? [];
  const challengingHouses = chart.summary.challengingHouses?.slice(0, 3) ?? [];

  return [
    challengingPlanets.length
      ? `Study pressure may cluster around ${challengingPlanets.map(formatPlanetName).join(", ")}.`
      : "No strong planet pattern is surfacing as the main study pressure point.",
    challengingHouses.length
      ? `Extra care may be needed around house areas such as ${challengingHouses.join(", ")}.`
      : "No dominant study caution house is surfacing strongly enough to exaggerate.",
    "The report keeps this as practical study pacing guidance, not a fear-based warning.",
  ];
}

function buildEducationTimingSummary(input: {
  currentCycle: CurrentCycleSummary;
  predictiveContext: ReportPredictiveContext | null;
}) {
  const baseTiming =
    input.currentCycle.status === "ready"
      ? input.currentCycle.synthesis.overview
      : input.currentCycle.unavailableReason ?? "Education timing is unavailable.";

  if (!input.predictiveContext) {
    return baseTiming;
  }

  const timingFocus = input.predictiveContext.dominant_timing_factors.timing_focus.join(", ");
  const dominantPlanets = joinOrFallback(
    input.predictiveContext.dominant_timing_factors.dominant_planets,
    "No dominant planets surfaced."
  );
  return `${baseTiming} Current study timing emphasis: ${timingFocus || "steady revision and discipline"} . Dominant planets: ${dominantPlanets}.`;
}

function buildEducationTransitSummary(input: {
  currentCycle: CurrentCycleSummary;
}) {
  if (input.currentCycle.status !== "ready") {
    return input.currentCycle.unavailableReason ?? "Current study period context is unavailable.";
  }

  return `Study rhythm, concentration load, and revision pace are being read through the active cycle tone and transit pressure points. ${input.currentCycle.synthesis.activeAreas[0]?.summary ?? input.currentCycle.synthesis.overview}`;
}

function buildEducationHouseAnalysis(input: { chartReport: ChartReportState }) {
  if (input.chartReport.status !== "ready") {
    return [
      "No education house analysis is available until the natal chart is ready.",
    ];
  }

  const chart = input.chartReport.overview.chart;
  const focusHouses = [4, 5, 9, 2, 3, 6, 10];

  return focusHouses.map((houseNumber) => {
    const sign = getHouseSign(chart, houseNumber);
    const ruler = getHouseRuler(chart, houseNumber);
    return `${ordinalLabel(houseNumber)} house${sign ? ` in ${toTitleCase(sign)}` : ""}${ruler ? `, ruled by ${formatPlanetName(ruler)}` : ""}`;
  });
}

function buildEducationYogaSignals(input: {
  chartReport: ChartReportState;
  predictiveContext: ReportPredictiveContext | null;
}) {
  if (input.predictiveContext) {
    const signals = input.predictiveContext.yoga_rule_summary.top_yoga_signals.map(
      (signal) => `${signal.yoga_name} (${signal.confidence})`
    );

    return signals.length
      ? signals
      : ["Predictive context is ready, but no top education yoga signals were surfaced."];
  }

  if (input.chartReport.status === "ready") {
    return input.chartReport.overview.chart.summary.yogaKeys?.length
      ? input.chartReport.overview.chart.summary.yogaKeys.map((key) => toTitleCase(key))
      : ["No education yoga signal summary is available yet."];
  }

  return ["No education yoga signal summary is available yet."];
}

function buildEducationPracticalGuidance(input: {
  insights: ChartInsights;
  currentCycle: CurrentCycleSummary;
}) {
  const educationTips = [
    ...input.insights.recommendations.slice(0, 2),
    input.currentCycle.status === "ready"
      ? input.currentCycle.guidanceCalendar.overview
      : input.currentCycle.unavailableReason ?? "Timing guidance is unavailable.",
    "Use a fixed study plan, spaced revision, practice tests, mentor check-ins, and enough rest to protect concentration.",
  ];

  return educationTips;
}

function buildEducationOptionalRemedies(input: { chartReport: ChartReportState }) {
  if (input.chartReport.status !== "ready") {
    return [
      "Approved education remedy records are unavailable until the chart is ready.",
    ];
  }

  if (!input.chartReport.remedies.length) {
    return [
      "No approved education remedy records matched the current signal set yet.",
    ];
  }

  return input.chartReport.remedies.slice(0, 3).map((remedy) => remedy.summary);
}

function buildEducationPremiumDeepDive(input: {
  currentCycle: CurrentCycleSummary;
  predictiveContext: ReportPredictiveContext | null;
  chartReport: ChartReportState;
}) {
  const sections: string[] = [];

  if (input.chartReport.status === "ready") {
    const chart = input.chartReport.overview.chart;
    sections.push(
      "Education deep dive: the 4th, 5th, 9th, 3rd, 6th, and 10th houses shape study foundation, memory, higher learning, effort, competition, and career linkage."
    );
    sections.push(
      `Study support bodies: ${joinOrFallback(
        ["Mercury", "Jupiter", "Moon", "Saturn", "Mars"].filter((body) =>
          chart.summary.dominantBodies.map((item) => item.toUpperCase()).includes(body.toUpperCase()) ||
          (chart.summary.strongestPlanets?.map((item) => item.toUpperCase()).includes(body.toUpperCase()) ?? false)
        ).map(formatPlanetName),
        "No major study support bodies surfaced."
      )}.`
    );
    sections.push(
      "If more refinement charts appear in saved context later, they can sharpen the reading; otherwise the report stays with the natal learning foundation and timing-based view."
    );
  }

  if (input.predictiveContext) {
    sections.push(
      `Dominant timing factors: ${joinOrFallback(
        input.predictiveContext.dominant_timing_factors.dominant_planets,
        "No dominant planets surfaced."
      )}.`
    );
    sections.push(
      `Dominant houses: ${
        input.predictiveContext.dominant_timing_factors.dominant_houses.length
          ? input.predictiveContext.dominant_timing_factors.dominant_houses.join(", ")
          : "Not available"
      }.`
    );
  }

  if (input.currentCycle.status === "ready") {
    sections.push(
      `Current cycle highlights: ${joinOrFallback(
        input.currentCycle.synthesis.timeSensitiveHighlights,
        "No strong time-sensitive highlights are standing out yet."
      )}`
    );
  }

  return sections.length
    ? sections
    : ["No education deep-dive context is available yet."];
}

function buildBusinessChartFoundationSummary(input: {
  chartReport: ChartReportState;
}) {
  if (input.chartReport.status !== "ready") {
    return "Saved chart context is not ready yet, so the business foundation is showing the safe fallback state.";
  }

  const chart = input.chartReport.overview.chart;
  const ascendant = toTitleCase(chart.ascendantSign);
  const seventhHouse = getHouseSign(chart, 7);
  const tenthHouse = getHouseSign(chart, 10);
  const eleventhHouse = getHouseSign(chart, 11);
  const mercury = findPlanetSign(chart, "Mercury");
  const saturn = findPlanetSign(chart, "Saturn");
  const mars = findPlanetSign(chart, "Mars");
  const venus = findPlanetSign(chart, "Venus");

  return `Business foundation starts with ${input.chartReport.overview.birthProfile.label}. Lagna points to ${ascendant} rising. The 7th house is ${seventhHouse ? toTitleCase(seventhHouse) : "not available"}, the 10th house is ${tenthHouse ? toTitleCase(tenthHouse) : "not available"}, and the 11th house is ${eleventhHouse ? toTitleCase(eleventhHouse) : "not available"}. Mercury${mercury ? ` is placed in ${toTitleCase(mercury)}` : " shapes sales and calculation only where available"}; Saturn${saturn ? ` is placed in ${toTitleCase(saturn)}` : " shapes discipline only where available"}; Mars${mars ? ` is placed in ${toTitleCase(mars)}` : " shapes initiative only where available"}; Venus${venus ? ` is placed in ${toTitleCase(venus)}` : " shapes value and public dealing only where available"}. ${chart.summary.narrative}`;
}

function buildBusinessStrengths(input: { chartReport: ChartReportState }) {
  if (input.chartReport.status !== "ready") {
    return [
      "No business strengths are available until the natal chart is ready.",
    ];
  }

  const chart = input.chartReport.overview.chart;
  const strongest = chart.summary.strongestPlanets?.slice(0, 3) ?? chart.summary.dominantBodies.slice(0, 3);
  const businessBodies = ["Mercury", "Venus", "Jupiter", "Saturn", "Mars"].filter((body) =>
    strongest.map((item) => item.toUpperCase()).includes(body.toUpperCase()) ||
    chart.summary.dominantBodies.map((item) => item.toUpperCase()).includes(body.toUpperCase())
  );

  return [
    `Entrepreneurship strengths are most visible through ${joinOrFallback(
      businessBodies.map(formatPlanetName),
      strongest.map(formatPlanetName).join(", ") || "the chart's main business emphasis"
    )} and the balance between communication, timing, scale, and consistency.`,
    "The report treats business potential as practical readiness, not guaranteed success.",
    chart.summary.narrative,
  ];
}

function buildBusinessCautionAreas(input: { chartReport: ChartReportState }) {
  if (input.chartReport.status !== "ready") {
    return [
      "No business caution areas are available until the natal chart is ready.",
    ];
  }

  const chart = input.chartReport.overview.chart;
  const challengingPlanets = chart.summary.challengingPlanets?.slice(0, 3) ?? [];
  const challengingHouses = chart.summary.challengingHouses?.slice(0, 3) ?? [];

  return [
    challengingPlanets.length
      ? `Business pressure may cluster around ${challengingPlanets.map(formatPlanetName).join(", ")}.`
      : "No strong planet pattern is surfacing as the main business pressure point.",
    challengingHouses.length
      ? `Extra care may be needed around house areas such as ${challengingHouses.join(", ")}.`
      : "No dominant business caution house is surfacing strongly enough to exaggerate.",
    "The report keeps this as practical risk management guidance, not a fear-based warning.",
  ];
}

function buildBusinessTimingSummary(input: {
  currentCycle: CurrentCycleSummary;
  predictiveContext: ReportPredictiveContext | null;
}) {
  const baseTiming =
    input.currentCycle.status === "ready"
      ? input.currentCycle.synthesis.overview
      : input.currentCycle.unavailableReason ?? "Business timing is unavailable.";

  if (!input.predictiveContext) {
    return baseTiming;
  }

  const timingFocus = input.predictiveContext.dominant_timing_factors.timing_focus.join(", ");
  const dominantPlanets = joinOrFallback(
    input.predictiveContext.dominant_timing_factors.dominant_planets,
    "No dominant planets surfaced."
  );
  return `${baseTiming} Current business timing emphasis: ${timingFocus || "steady planning and follow-through"} . Dominant planets: ${dominantPlanets}.`;
}

function buildBusinessTransitSummary(input: {
  currentCycle: CurrentCycleSummary;
}) {
  if (input.currentCycle.status !== "ready") {
    return input.currentCycle.unavailableReason ?? "Current business period context is unavailable.";
  }

  return `Client flow, pressure, and scaling pace are being read through the active cycle tone and transit pressure points. ${input.currentCycle.synthesis.activeAreas[0]?.summary ?? input.currentCycle.synthesis.overview}`;
}

function buildBusinessHouseAnalysis(input: { chartReport: ChartReportState }) {
  if (input.chartReport.status !== "ready") {
    return [
      "No business house analysis is available until the natal chart is ready.",
    ];
  }

  const chart = input.chartReport.overview.chart;
  const focusHouses = [7, 10, 11, 2, 3, 5, 6, 8, 9, 12];

  return focusHouses.map((houseNumber) => {
    const sign = getHouseSign(chart, houseNumber);
    const ruler = getHouseRuler(chart, houseNumber);
    return `${ordinalLabel(houseNumber)} house${sign ? ` in ${toTitleCase(sign)}` : ""}${ruler ? `, ruled by ${formatPlanetName(ruler)}` : ""}`;
  });
}

function buildBusinessYogaSignals(input: {
  chartReport: ChartReportState;
  predictiveContext: ReportPredictiveContext | null;
}) {
  if (input.predictiveContext) {
    const signals = input.predictiveContext.yoga_rule_summary.top_yoga_signals.map(
      (signal) => `${signal.yoga_name} (${signal.confidence})`
    );

    return signals.length
      ? signals
      : ["Predictive context is ready, but no top business yoga signals were surfaced."];
  }

  if (input.chartReport.status === "ready") {
    return input.chartReport.overview.chart.summary.yogaKeys?.length
      ? input.chartReport.overview.chart.summary.yogaKeys.map((key) => toTitleCase(key))
      : ["No business yoga signal summary is available yet."];
  }

  return ["No business yoga signal summary is available yet."];
}

function buildBusinessPracticalGuidance(input: {
  insights: ChartInsights;
  currentCycle: CurrentCycleSummary;
}) {
  const businessTips = [
    ...input.insights.recommendations.slice(0, 2),
    input.currentCycle.status === "ready"
      ? input.currentCycle.guidanceCalendar.overview
      : input.currentCycle.unavailableReason ?? "Timing guidance is unavailable.",
    "Use customer follow-up, cash-flow discipline, contract clarity, tested offers, and due diligence before scaling.",
  ];

  return businessTips;
}

function buildBusinessOptionalRemedies(input: { chartReport: ChartReportState }) {
  if (input.chartReport.status !== "ready") {
    return [
      "Approved business remedy records are unavailable until the chart is ready.",
    ];
  }

  if (!input.chartReport.remedies.length) {
    return [
      "No approved business remedy records matched the current signal set yet.",
    ];
  }

  return input.chartReport.remedies.slice(0, 3).map((remedy) => remedy.summary);
}

function buildBusinessPremiumDeepDive(input: {
  currentCycle: CurrentCycleSummary;
  predictiveContext: ReportPredictiveContext | null;
  chartReport: ChartReportState;
}) {
  const sections: string[] = [];

  if (input.chartReport.status === "ready") {
    const chart = input.chartReport.overview.chart;
    sections.push(
      "Business deep dive: the 7th, 10th, 11th, 2nd, 3rd, 5th, 6th, 8th, 9th, and 12th houses describe partnership, status, gains, capital, sales, strategy, risk, ethics, and expense flow."
    );
    sections.push(
      `Business support bodies: ${joinOrFallback(
        ["Mercury", "Saturn", "Mars", "Jupiter", "Venus"].filter((body) =>
          chart.summary.dominantBodies.map((item) => item.toUpperCase()).includes(body.toUpperCase()) ||
          (chart.summary.strongestPlanets?.map((item) => item.toUpperCase()).includes(body.toUpperCase()) ?? false)
        ).map(formatPlanetName),
        "No major business support bodies surfaced."
      )}.`
    );
    sections.push(
      chart.divisionalCharts.find((entry) => entry.code === "D10")
        ? `D10 / Dashamsa is available and may sharpen the profession-to-business view: ${chart.divisionalCharts.find((entry) => entry.code === "D10")?.focus}.`
        : "No profession-refinement divisional chart is available in the saved chart, so the report stays with the natal business foundation."
    );
  }

  if (input.predictiveContext) {
    sections.push(
      `Dominant timing factors: ${joinOrFallback(
        input.predictiveContext.dominant_timing_factors.dominant_planets,
        "No dominant planets surfaced."
      )}.`
    );
    sections.push(
      `Dominant houses: ${
        input.predictiveContext.dominant_timing_factors.dominant_houses.length
          ? input.predictiveContext.dominant_timing_factors.dominant_houses.join(", ")
          : "Not available"
      }.`
    );
  }

  if (input.currentCycle.status === "ready") {
    sections.push(
      `Current cycle highlights: ${joinOrFallback(
        input.currentCycle.synthesis.timeSensitiveHighlights,
        "No strong time-sensitive highlights are standing out yet."
      )}`
    );
  }

  return sections.length
    ? sections
    : ["No business deep-dive context is available yet."];
}

function buildEducationDisclaimerSafetyNote(input: { chartReport: ChartReportState }) {
  const studyNote =
    "This education report is study guidance only, not a guarantee of marks, rank, pass/fail, or admission outcomes. " +
    "Use qualified academic support for learning difficulties or exam strategy, and follow the existing safety path for severe student distress.";

  if (input.chartReport.status !== "ready") {
    return `${"Interpretation language is reflective and should not be treated as certainty."} ${studyNote}`;
  }

  const baseDisclaimer = input.chartReport.accuracy.disclaimer;
  const incompleteDataNotice = input.chartReport.accuracy.incompleteDataNotice ?? "";

  return `${baseDisclaimer} ${incompleteDataNotice} ${studyNote}`.trim();
}

function buildBusinessDisclaimerSafetyNote(input: { chartReport: ChartReportState }) {
  const businessNote =
    "This business report is strategic guidance only, not investment, legal, tax, funding, or revenue advice. " +
    "Use qualified professional advice for contracts, tax, legal, or investment decisions.";

  if (input.chartReport.status !== "ready") {
    return `${"Interpretation language is reflective and should not be treated as certainty."} ${businessNote}`;
  }

  const baseDisclaimer = input.chartReport.accuracy.disclaimer;
  const incompleteDataNotice = input.chartReport.accuracy.incompleteDataNotice ?? "";

  return `${baseDisclaimer} ${incompleteDataNotice} ${businessNote}`.trim();
}

function buildHealthChartFoundationSummary(input: { chartReport: ChartReportState }) {
  if (input.chartReport.status !== "ready") {
    return "Saved chart context is not ready yet, so the health foundation is showing the safe fallback state.";
  }

  const chart = input.chartReport.overview.chart;
  const ascendant = toTitleCase(chart.ascendantSign);
  const firstHouse = getHouseSign(chart, 1);
  const sixthHouse = getHouseSign(chart, 6);
  const eighthHouse = getHouseSign(chart, 8);
  const twelfthHouse = getHouseSign(chart, 12);
  const moon = findPlanetSign(chart, "Moon");
  const sun = findPlanetSign(chart, "Sun");
  const mars = findPlanetSign(chart, "Mars");
  const saturn = findPlanetSign(chart, "Saturn");

  return `Health foundation starts with ${input.chartReport.overview.birthProfile.label}. Lagna points to ${ascendant} rising. The 1st house is ${firstHouse ? toTitleCase(firstHouse) : "not available"}, the 6th house is ${sixthHouse ? toTitleCase(sixthHouse) : "not available"}, the 8th house is ${eighthHouse ? toTitleCase(eighthHouse) : "not available"}, and the 12th house is ${twelfthHouse ? toTitleCase(twelfthHouse) : "not available"}. Moon${moon ? ` is placed in ${toTitleCase(moon)}` : " shapes emotional balance only where available"}; Sun${sun ? ` is placed in ${toTitleCase(sun)}` : " shapes vitality only where available"}; Mars${mars ? ` is placed in ${toTitleCase(mars)}` : " shapes energy only where available"}; Saturn${saturn ? ` is placed in ${toTitleCase(saturn)}` : " shapes discipline only where available"}. ${chart.summary.narrative}`;
}

function buildHealthHouseAnalysis(input: { chartReport: ChartReportState }) {
  if (input.chartReport.status !== "ready") {
    return [
      "No health house analysis is available until the natal chart is ready.",
    ];
  }

  const chart = input.chartReport.overview.chart;
  const focusHouses = [1, 6, 8, 12, 2, 4, 5, 11];

  return focusHouses.map((houseNumber) => {
    const sign = getHouseSign(chart, houseNumber);
    const ruler = getHouseRuler(chart, houseNumber);
    return `${ordinalLabel(houseNumber)} house${sign ? ` in ${toTitleCase(sign)}` : ""}${ruler ? `, ruled by ${formatPlanetName(ruler)}` : ""}`;
  });
}

function buildHealthStrengths(input: { chartReport: ChartReportState }) {
  if (input.chartReport.status !== "ready") {
    return [
      "No health strengths are available until the natal chart is ready.",
    ];
  }

  const chart = input.chartReport.overview.chart;
  const strongest = chart.summary.strongestPlanets?.slice(0, 3) ?? chart.summary.dominantBodies.slice(0, 3);
  const wellnessBodies = ["Sun", "Moon", "Mars", "Jupiter", "Saturn", "Mercury", "Venus"].filter((body) =>
    strongest.map((item) => item.toUpperCase()).includes(body.toUpperCase()) ||
    chart.summary.dominantBodies.map((item) => item.toUpperCase()).includes(body.toUpperCase())
  );

  return [
    `Wellness strengths are most visible through ${joinOrFallback(
      wellnessBodies.map(formatPlanetName),
      strongest.map(formatPlanetName).join(", ") || "the chart's main wellness emphasis"
    )} and the balance between vitality, recovery, and routine.`,
    "The report reads body, mind, and routine as a single wellness pattern and stays away from diagnosis language.",
    chart.summary.narrative,
  ];
}

function buildHealthCautionAreas(input: { chartReport: ChartReportState }) {
  if (input.chartReport.status !== "ready") {
    return [
      "No health caution areas are available until the natal chart is ready.",
    ];
  }

  const chart = input.chartReport.overview.chart;
  const challengingPlanets = chart.summary.challengingPlanets?.slice(0, 3) ?? [];
  const challengingHouses = chart.summary.challengingHouses?.slice(0, 3) ?? [];

  return [
    challengingPlanets.length
      ? `Routine strain may cluster around ${challengingPlanets.map(formatPlanetName).join(", ")}.`
      : "No strong challenging planet pattern is surfacing as the main wellness pressure point.",
    challengingHouses.length
      ? `The chart may ask for extra care around house areas such as ${challengingHouses.join(", ")}.`
      : "No dominant caution house is surfacing strongly enough to exaggerate.",
    "The report keeps this as practical wellness pacing guidance, not a fear-based warning.",
  ];
}

function buildHealthTimingSummary(input: {
  currentCycle: CurrentCycleSummary;
  predictiveContext: ReportPredictiveContext | null;
}) {
  const baseTiming =
    input.currentCycle.status === "ready"
      ? input.currentCycle.synthesis.overview
      : input.currentCycle.unavailableReason ?? "Wellness timing is unavailable.";

  if (!input.predictiveContext) {
    return baseTiming;
  }

  const timingFocus = input.predictiveContext.dominant_timing_factors.timing_focus.join(", ");
  const dominantPlanets = joinOrFallback(
    input.predictiveContext.dominant_timing_factors.dominant_planets,
    "No dominant planets surfaced."
  );
  return `${baseTiming} Current wellness timing emphasis: ${timingFocus || "steady recovery and routine"} . Dominant planets: ${dominantPlanets}.`;
}

function buildHealthTransitSummary(input: {
  currentCycle: CurrentCycleSummary;
}) {
  if (input.currentCycle.status !== "ready") {
    return input.currentCycle.unavailableReason ?? "Current wellness period context is unavailable.";
  }

  return `Energy rhythm, stress load, and recovery pace are being read through the active cycle tone and transit pressure points. ${input.currentCycle.synthesis.activeAreas[0]?.summary ?? input.currentCycle.synthesis.overview}`;
}

function buildHealthYogaSignals(input: {
  chartReport: ChartReportState;
  predictiveContext: ReportPredictiveContext | null;
}) {
  if (input.predictiveContext) {
    const signals = input.predictiveContext.yoga_rule_summary.top_yoga_signals.map(
      (signal) => `${signal.yoga_name} (${signal.confidence})`
    );

    return signals.length
      ? signals
      : ["Predictive context is ready, but no top wellness yoga signals were surfaced."];
  }

  if (input.chartReport.status === "ready") {
    return input.chartReport.overview.chart.summary.yogaKeys?.length
      ? input.chartReport.overview.chart.summary.yogaKeys.map((key) => toTitleCase(key))
      : ["No wellness yoga signal summary is available yet."];
  }

  return ["No wellness yoga signal summary is available yet."];
}

function buildHealthPracticalGuidance(input: {
  insights: ChartInsights;
  currentCycle: CurrentCycleSummary;
}) {
  const wellnessTips = [
    ...input.insights.recommendations.slice(0, 2),
    input.currentCycle.status === "ready"
      ? input.currentCycle.guidanceCalendar.overview
      : input.currentCycle.unavailableReason ?? "Timing guidance is unavailable.",
    "Use sleep routine, hydration, balanced meals, light exercise, stress reduction, and regular checkups if symptoms exist.",
  ];

  return wellnessTips;
}

function buildHealthOptionalRemedies(input: { chartReport: ChartReportState }) {
  if (input.chartReport.status !== "ready") {
    return [
      "Approved health remedy records are unavailable until the chart is ready.",
    ];
  }

  if (!input.chartReport.remedies.length) {
    return [
      "No approved health remedy records matched the current signal set yet.",
    ];
  }

  return input.chartReport.remedies.slice(0, 3).map((remedy) => remedy.summary);
}

function buildHealthDisclaimerSafetyNote(input: { chartReport: ChartReportState }) {
  const wellnessNote =
    "This health report is wellness guidance only, not medical diagnosis or treatment. " +
    "Consult a qualified healthcare professional for symptoms or illness, and seek urgent local medical help for urgent symptoms.";

  if (input.chartReport.status !== "ready") {
    return `${"Interpretation language is reflective and should not be treated as certainty."} ${wellnessNote}`;
  }

  const baseDisclaimer = input.chartReport.accuracy.disclaimer;
  const incompleteDataNotice = input.chartReport.accuracy.incompleteDataNotice ?? "";

  return `${baseDisclaimer} ${incompleteDataNotice} ${wellnessNote}`.trim();
}

function buildHealthPremiumDeepDive(input: {
  currentCycle: CurrentCycleSummary;
  predictiveContext: ReportPredictiveContext | null;
  chartReport: ChartReportState;
}) {
  const sections: string[] = [];

  if (input.chartReport.status === "ready") {
    const chart = input.chartReport.overview.chart;
    const d12 = chart.divisionalCharts.find((entry) => entry.code === "D12");

    sections.push(
      "Health deep dive: the 1st, 6th, 8th, and 12th houses form the core of the wellness reading, while the Moon, Sun, Mars, Saturn, Mercury, and Jupiter add emotional, vitality, routine, recovery, and support context."
    );
    sections.push(
      d12
        ? `D12 / Shashtiamsha or other health-refinement chart is available and may refine the wellness view: ${d12.focus}.`
        : "No health-refinement divisional chart is available in the saved chart, so the report stays with the natal wellness foundation."
    );
    sections.push(
      "If wellness-related rule signals are present in the saved context later, they can refine the reading; otherwise the report stays with the birth-chart and timing-based view."
    );
  }

  if (input.predictiveContext) {
    sections.push(
      `Dominant timing factors: ${joinOrFallback(
        input.predictiveContext.dominant_timing_factors.dominant_planets,
        "No dominant planets surfaced."
      )}.`
    );
    sections.push(
      `Dominant houses: ${
        input.predictiveContext.dominant_timing_factors.dominant_houses.length
          ? input.predictiveContext.dominant_timing_factors.dominant_houses.join(", ")
          : "Not available"
      }.`
    );
  }

  if (input.currentCycle.status === "ready") {
    sections.push(
      `Current cycle highlights: ${joinOrFallback(
        input.currentCycle.synthesis.timeSensitiveHighlights,
        "No strong time-sensitive highlights are standing out yet."
      )}`
    );
  }

  return sections.length
    ? sections
    : ["No health deep-dive context is available yet."];
}

function getProfileSectionTitle(
  profile: ReportTypeProfile,
  key: ReportSectionKey
) {
  if (profile.key === "CAREER") {
    return careerSectionTitleMap[key] ?? sectionTitleMap[key];
  }

  if (profile.key === "MARRIAGE") {
    return marriageSectionTitleMap[key] ?? sectionTitleMap[key];
  }

  if (profile.key === "FINANCE") {
    return financeSectionTitleMap[key] ?? sectionTitleMap[key];
  }

  if (profile.key === "EDUCATION") {
    return educationSectionTitleMap[key] ?? sectionTitleMap[key];
  }

  if (profile.key === "BUSINESS") {
    return businessSectionTitleMap[key] ?? sectionTitleMap[key];
  }

  if (profile.key === "HEALTH") {
    return healthSectionTitleMap[key] ?? sectionTitleMap[key];
  }

  return sectionTitleMap[key];
}

function buildHouseAnalysis(input: { chartReport: ChartReportState }) {
  if (input.chartReport.status !== "ready") {
    return [
      "No house-by-house analysis is available until the natal chart is ready.",
    ];
  }

  return input.chartReport.overview.chart.houses.map(
    (house) => `${ordinalLabel(house.house)} house: ${toTitleCase(house.sign)}`
  );
}

function buildDivisionalChartSummary(input: { chartReport: ChartReportState }) {
  if (input.chartReport.status !== "ready") {
    return {
      codes: [] as string[],
      hasD9: false,
      hasD10: false,
      summary: "Divisional chart availability is unavailable until the natal chart is ready.",
    };
  }

  const codes = input.chartReport.overview.chart.divisionalCharts.map(
    (chart) => chart.code
  );

  return {
    codes,
    hasD9: codes.includes("D9"),
    hasD10: codes.includes("D10"),
    summary: codes.length
      ? `Divisional charts available: ${codes.join(", ")}.`
      : "No divisional charts are currently available in the saved chart context.",
  };
}

function buildYogaSignals(input: {
  chartReport: ChartReportState;
  predictiveContext: ReportPredictiveContext | null;
}) {
  if (input.predictiveContext) {
    const topSignals = input.predictiveContext.yoga_rule_summary.top_yoga_signals.map(
      (signal) => `${signal.yoga_name} (${signal.confidence})`
    );

    return topSignals.length
      ? topSignals
      : ["Predictive context is ready, but no top yoga signals were surfaced."];
  }

  if (input.chartReport.status === "ready") {
    return input.chartReport.overview.chart.summary.yogaKeys?.length
      ? input.chartReport.overview.chart.summary.yogaKeys.map((key) => toTitleCase(key))
      : ["No yoga signal summary is available yet."];
  }

  return ["No yoga signal summary is available yet."];
}

function buildPracticalGuidance(input: {
  insights: ChartInsights;
  currentCycle: CurrentCycleSummary;
}) {
  const recommendations = input.insights.recommendations.slice(0, 3);
  const timingGuidance =
    input.currentCycle.status === "ready"
      ? input.currentCycle.guidanceCalendar.overview
      : input.currentCycle.unavailableReason ?? "Timing guidance is unavailable.";

  return [...recommendations, timingGuidance];
}

function buildOptionalRemedies(input: { chartReport: ChartReportState }) {
  if (input.chartReport.status !== "ready") {
    return [
      "Approved remedy records are unavailable until the chart is ready.",
    ];
  }

  if (!input.chartReport.remedies.length) {
    return [
      "No approved remedy records matched the current signal set yet.",
    ];
  }

  return input.chartReport.remedies.slice(0, 3).map((remedy) => remedy.summary);
}

function buildPremiumDeepDive(input: {
  currentCycle: CurrentCycleSummary;
  predictiveContext: ReportPredictiveContext | null;
  chartReport: ChartReportState;
  profile: ReportTypeProfile;
}) {
  const sections: string[] = [];
  const divisionalSummary = buildDivisionalChartSummary({
    chartReport: input.chartReport,
  });

  sections.push(divisionalSummary.summary);

  if (input.profile.key === "FULL_KUNDLI" && input.chartReport.status === "ready") {
    const dominantBodies = input.chartReport.overview.chart.summary.dominantBodies
      .slice(0, 4)
      .map(formatPlanetName)
      .join(", ");
    const lifeAreaSnapshot =
      "Life area snapshot: career, marriage, finance, health, education, business, and spiritual growth are best read as one connected pattern rather than separate silos.";
    const planetaryEmphasis = `Planetary emphasis: ${dominantBodies || "no dominant bodies were surfaced"} shape the overall life tone while the house pattern adds the practical context.`;

    sections.push(
      `${lifeAreaSnapshot} ${planetaryEmphasis}`
    );

    const timingParts: string[] = [];

    if (input.predictiveContext) {
      timingParts.push(
        `Dominant timing factors: ${joinOrFallback(
          input.predictiveContext.dominant_timing_factors.dominant_planets,
          "No dominant planets surfaced."
        )}.`
      );
      timingParts.push(
        `Dominant houses: ${
          input.predictiveContext.dominant_timing_factors.dominant_houses.length
            ? input.predictiveContext.dominant_timing_factors.dominant_houses.join(", ")
            : "Not available"
        }.`
      );
    }

    if (input.currentCycle.status === "ready") {
      timingParts.push(
        `Current cycle highlights: ${joinOrFallback(
          input.currentCycle.synthesis.timeSensitiveHighlights,
          "No strong time-sensitive highlights are standing out yet."
        )}`
      );
    }

    if (timingParts.length) {
      sections.push(`Timing snapshot: ${timingParts.join(" ")}`);
    }

    return sections.length
      ? sections
      : ["No premium deep-dive context is available yet."];
  }

  if (input.predictiveContext) {
    sections.push(
      `Dominant timing factors: ${joinOrFallback(
        input.predictiveContext.dominant_timing_factors.dominant_planets,
        "No dominant planets surfaced."
      )}.`
    );
    sections.push(
      `Dominant houses: ${
        input.predictiveContext.dominant_timing_factors.dominant_houses.length
          ? input.predictiveContext.dominant_timing_factors.dominant_houses.join(", ")
          : "Not available"
      }.`
    );
  }

  if (input.currentCycle.status === "ready") {
    sections.push(
      `Guidance calendar overview: ${input.currentCycle.guidanceCalendar.overview}`
    );
    sections.push(
      `Current cycle highlights: ${joinOrFallback(
        input.currentCycle.synthesis.timeSensitiveHighlights,
        "No strong time-sensitive highlights are standing out yet."
      )}`
    );
  }

  if (input.chartReport.status === "ready") {
    sections.push(
      `Chart signals: ${input.chartReport.signals
        .slice(0, 3)
        .map((signal) => signal.title)
        .join(", ") || "No chart signals are available yet."}`
    );
  }

  return sections.length
    ? sections
    : ["No premium deep-dive context is available yet."];
}

function buildNextStepCta(profile: ReportTypeProfile) {
  switch (profile.key) {
    case "CAREER":
      return "Use the career report or Ask My Chart for role-specific follow-up.";
    case "MARRIAGE":
      return "Use compatibility follow-up or consultation for careful relationship context.";
    case "FINANCE":
      return "Use the finance report or Ask My Chart for cautious next-step context.";
    case "HEALTH":
      return "Use the health report or consultation for safe, non-medical follow-up.";
    case "EDUCATION":
      return "Use Ask My Chart or the education report path for study-specific context.";
    case "BUSINESS":
      return "Use Ask My Chart or the business report path for business-specific context.";
    case "DAILY":
      return "Use daily guidance or Ask My Chart for tomorrow's timing context.";
    case "YEARLY":
      return "Use the yearly report or consultation for a broader timing view.";
    case "FULL_KUNDLI":
    default:
      return "Use Ask My Chart or consultation for deeper chart follow-up.";
  }
}

function isUnlocked(accessTier: ReportAccessTier, unlockState: ReportUnlockState) {
  return (
    unlockState === "UNLOCKED" &&
    (accessTier === "PREMIUM" || accessTier === "PRO")
  );
}

function buildSectionPlan(input: {
  profile: ReportTypeProfile;
  accessTier: ReportAccessTier;
  unlockState: ReportUnlockState;
  chartReport: ChartReportState;
  insights: ChartInsights;
  currentCycle: CurrentCycleSummary;
  predictiveContext: ReportPredictiveContext | null;
}) {
  const premiumUnlocked = isUnlocked(input.accessTier, input.unlockState);

  const sectionContentByKey: Record<ReportSectionKey, string> = {
    "executive-summary": input.chartReport.status === "ready"
      ? input.profile.key === "FULL_KUNDLI"
        ? `${input.chartReport.interpretation.summary} ${input.currentCycle.status === "ready" ? `Current period tone: ${input.currentCycle.synthesis.overview}` : ""}`.trim()
        : input.profile.key === "CAREER"
          ? `${input.chartReport.interpretation.summary} ${input.currentCycle.status === "ready" ? `Career period tone: ${input.currentCycle.synthesis.overview}` : ""}`.trim()
          : input.profile.key === "MARRIAGE"
            ? `${input.chartReport.interpretation.summary} ${input.currentCycle.status === "ready" ? `Relationship period tone: ${input.currentCycle.synthesis.overview}` : ""}`.trim()
            : input.profile.key === "FINANCE"
              ? `${input.chartReport.interpretation.summary} ${input.currentCycle.status === "ready" ? `Financial period tone: ${input.currentCycle.synthesis.overview}` : ""}`.trim()
              : input.profile.key === "HEALTH"
                ? `${input.chartReport.interpretation.summary} ${input.currentCycle.status === "ready" ? `Wellness period tone: ${input.currentCycle.synthesis.overview}` : ""}`.trim()
                : input.profile.key === "EDUCATION"
                  ? `${input.chartReport.interpretation.summary} ${input.currentCycle.status === "ready" ? `Study period tone: ${input.currentCycle.synthesis.overview}` : ""}`.trim()
                  : input.profile.key === "BUSINESS"
                    ? `${input.chartReport.interpretation.summary} ${input.currentCycle.status === "ready" ? `Business period tone: ${input.currentCycle.synthesis.overview}` : ""}`.trim()
          : input.chartReport.interpretation.summary
      : input.insights.summary,
    "chart-foundation":
      input.profile.key === "CAREER"
        ? buildCareerChartFoundationSummary({ chartReport: input.chartReport })
        : input.profile.key === "MARRIAGE"
          ? buildMarriageChartFoundationSummary({ chartReport: input.chartReport })
          : input.profile.key === "FINANCE"
            ? buildFinanceChartFoundationSummary({ chartReport: input.chartReport })
            : input.profile.key === "HEALTH"
              ? buildHealthChartFoundationSummary({ chartReport: input.chartReport })
              : input.profile.key === "EDUCATION"
                ? buildEducationChartFoundationSummary({ chartReport: input.chartReport })
                : input.profile.key === "BUSINESS"
                  ? buildBusinessChartFoundationSummary({ chartReport: input.chartReport })
        : buildChartFoundationSummary({
            chartReport: input.chartReport,
          }),
    "key-strengths":
      input.profile.key === "CAREER"
        ? joinOrFallback(
            buildCareerStrengths({ chartReport: input.chartReport }).slice(0, 3),
            "No dominant career strengths are available in this context yet."
          )
        : input.profile.key === "MARRIAGE"
          ? joinOrFallback(
              buildMarriageStrengths({ chartReport: input.chartReport }).slice(0, 3),
              "No dominant relationship strengths are available in this context yet."
            )
          : input.profile.key === "FINANCE"
            ? joinOrFallback(
                buildFinanceStrengths({ chartReport: input.chartReport }).slice(0, 3),
                "No dominant finance strengths are available in this context yet."
              )
            : input.profile.key === "HEALTH"
              ? joinOrFallback(
                  buildHealthStrengths({ chartReport: input.chartReport }).slice(0, 3),
                  "No dominant health strengths are available in this context yet."
                )
              : input.profile.key === "EDUCATION"
                ? joinOrFallback(
                    buildEducationStrengths({ chartReport: input.chartReport }).slice(0, 3),
                    "No dominant education strengths are available in this context yet."
                  )
              : input.profile.key === "BUSINESS"
                ? joinOrFallback(
                    buildBusinessStrengths({ chartReport: input.chartReport }).slice(0, 3),
                    "No dominant business strengths are available in this context yet."
                  )
        : joinOrFallback(
            input.insights.strengths.slice(0, 3),
            "No dominant strengths are available in this context yet."
          ),
    "caution-areas":
      input.profile.key === "CAREER"
        ? joinOrFallback(
            buildCareerCautionAreas({ chartReport: input.chartReport }).slice(0, 3),
            "No dominant career caution areas are available in this context yet."
          )
        : input.profile.key === "MARRIAGE"
          ? joinOrFallback(
              buildMarriageCautionAreas({ chartReport: input.chartReport }).slice(0, 3),
              "No dominant relationship caution areas are available in this context yet."
            )
          : input.profile.key === "FINANCE"
            ? joinOrFallback(
                buildFinanceCautionAreas({ chartReport: input.chartReport }).slice(0, 3),
                "No dominant finance caution areas are available in this context yet."
              )
            : input.profile.key === "HEALTH"
              ? joinOrFallback(
                  buildHealthCautionAreas({ chartReport: input.chartReport }).slice(0, 3),
                  "No dominant health caution areas are available in this context yet."
                )
              : input.profile.key === "EDUCATION"
                ? joinOrFallback(
                    buildEducationCautionAreas({ chartReport: input.chartReport }).slice(0, 3),
                    "No dominant education caution areas are available in this context yet."
                  )
              : input.profile.key === "BUSINESS"
                ? joinOrFallback(
                    buildBusinessCautionAreas({ chartReport: input.chartReport }).slice(0, 3),
                    "No dominant business caution areas are available in this context yet."
                  )
        : joinOrFallback(
            input.insights.challenges.slice(0, 3),
            "No dominant caution areas are available in this context yet."
          ),
    "timing-dasha-insight":
      input.profile.key === "CAREER"
        ? buildCareerTimingSummary({
            currentCycle: input.currentCycle,
            predictiveContext: input.predictiveContext,
          })
        : input.profile.key === "MARRIAGE"
          ? buildMarriageTimingSummary({
              currentCycle: input.currentCycle,
              predictiveContext: input.predictiveContext,
            })
          : input.profile.key === "FINANCE"
            ? buildFinanceTimingSummary({
                currentCycle: input.currentCycle,
                predictiveContext: input.predictiveContext,
              })
            : input.profile.key === "HEALTH"
              ? buildHealthTimingSummary({
                  currentCycle: input.currentCycle,
                  predictiveContext: input.predictiveContext,
                })
              : input.profile.key === "EDUCATION"
                ? buildEducationTimingSummary({
                    currentCycle: input.currentCycle,
                    predictiveContext: input.predictiveContext,
                  })
              : input.profile.key === "BUSINESS"
                ? buildBusinessTimingSummary({
                    currentCycle: input.currentCycle,
                    predictiveContext: input.predictiveContext,
                  })
        : summarizeCurrentCycle(input.currentCycle),
    "transit-current-period-insight":
      input.profile.key === "CAREER"
        ? buildCareerTransitSummary({
            currentCycle: input.currentCycle,
          })
        : input.profile.key === "MARRIAGE"
          ? buildMarriageTransitSummary({
              currentCycle: input.currentCycle,
              chartReport: input.chartReport,
            })
          : input.profile.key === "FINANCE"
            ? buildFinanceTransitSummary({
                currentCycle: input.currentCycle,
              })
            : input.profile.key === "HEALTH"
              ? buildHealthTransitSummary({
                  currentCycle: input.currentCycle,
                })
              : input.profile.key === "EDUCATION"
                ? buildEducationTransitSummary({
                    currentCycle: input.currentCycle,
                  })
              : input.profile.key === "BUSINESS"
                ? buildBusinessTransitSummary({
                    currentCycle: input.currentCycle,
                  })
        : input.currentCycle.status === "ready"
          ? input.currentCycle.synthesis.activeAreas[0]?.summary ??
            input.currentCycle.synthesis.overview
          : input.currentCycle.unavailableReason ?? "Transit context is unavailable.",
    "house-based-analysis":
      input.profile.key === "CAREER"
        ? joinOrFallback(
            buildCareerHouseAnalysis({ chartReport: input.chartReport }).slice(0, 6),
            "No job-or-business house analysis is available yet."
          )
        : input.profile.key === "MARRIAGE"
          ? joinOrFallback(
              buildMarriageHouseAnalysis({ chartReport: input.chartReport }).slice(0, 6),
              "No compatibility and harmony analysis is available yet."
            )
          : input.profile.key === "FINANCE"
            ? joinOrFallback(
                buildFinanceHouseAnalysis({ chartReport: input.chartReport }).slice(0, 6),
                "No finance house analysis is available yet."
              )
            : input.profile.key === "HEALTH"
              ? joinOrFallback(
                  buildHealthHouseAnalysis({ chartReport: input.chartReport }).slice(0, 6),
                  "No health house analysis is available yet."
                )
              : input.profile.key === "EDUCATION"
                ? joinOrFallback(
                    buildEducationHouseAnalysis({ chartReport: input.chartReport }).slice(0, 6),
                    "No education house analysis is available yet."
                  )
              : input.profile.key === "BUSINESS"
                ? joinOrFallback(
                    buildBusinessHouseAnalysis({ chartReport: input.chartReport }).slice(0, 6),
                    "No business house analysis is available yet."
                  )
        : joinOrFallback(
            buildHouseAnalysis({ chartReport: input.chartReport }).slice(0, 6),
            "No house-by-house analysis is available yet."
          ),
    "yoga-rule-signals":
      input.profile.key === "CAREER"
        ? joinOrFallback(
            buildCareerYogaSignals({
              chartReport: input.chartReport,
              predictiveContext: input.predictiveContext,
            }).slice(0, 5),
            "No career yoga rule signal summary is available yet."
          )
        : input.profile.key === "MARRIAGE"
          ? joinOrFallback(
              buildMarriageYogaSignals({
                chartReport: input.chartReport,
                predictiveContext: input.predictiveContext,
              }).slice(0, 5),
              "No relationship yoga rule signal summary is available yet."
            )
          : input.profile.key === "FINANCE"
            ? joinOrFallback(
                buildFinanceYogaSignals({
                  chartReport: input.chartReport,
                  predictiveContext: input.predictiveContext,
                }).slice(0, 5),
                "No finance yoga rule signal summary is available yet."
              )
            : input.profile.key === "HEALTH"
              ? joinOrFallback(
                  buildHealthYogaSignals({
                    chartReport: input.chartReport,
                    predictiveContext: input.predictiveContext,
                  }).slice(0, 5),
                  "No wellness yoga rule signal summary is available yet."
                )
              : input.profile.key === "EDUCATION"
                ? joinOrFallback(
                    buildEducationYogaSignals({
                      chartReport: input.chartReport,
                      predictiveContext: input.predictiveContext,
                    }).slice(0, 5),
                    "No education yoga rule signal summary is available yet."
                  )
              : input.profile.key === "BUSINESS"
                ? joinOrFallback(
                    buildBusinessYogaSignals({
                      chartReport: input.chartReport,
                      predictiveContext: input.predictiveContext,
                    }).slice(0, 5),
                    "No business yoga rule signal summary is available yet."
                  )
        : joinOrFallback(
            buildYogaSignals({
              chartReport: input.chartReport,
              predictiveContext: input.predictiveContext,
            }).slice(0, 5),
            "No yoga rule signal summary is available yet."
          ),
    "practical-guidance":
      input.profile.key === "CAREER"
        ? joinOrFallback(
            buildCareerPracticalGuidance({
              insights: input.insights,
              currentCycle: input.currentCycle,
            }).slice(0, 4),
            "No practical career guidance is available yet."
          )
        : input.profile.key === "MARRIAGE"
          ? joinOrFallback(
              buildMarriagePracticalGuidance({
                insights: input.insights,
                currentCycle: input.currentCycle,
              }).slice(0, 4),
              "No practical relationship guidance is available yet."
            )
          : input.profile.key === "FINANCE"
            ? joinOrFallback(
                buildFinancePracticalGuidance({
                  insights: input.insights,
                  currentCycle: input.currentCycle,
                }).slice(0, 4),
                "No practical financial guidance is available yet."
              )
            : input.profile.key === "HEALTH"
              ? joinOrFallback(
                  buildHealthPracticalGuidance({
                    insights: input.insights,
                    currentCycle: input.currentCycle,
                  }).slice(0, 4),
                  "No practical wellness guidance is available yet."
                )
              : input.profile.key === "EDUCATION"
                ? joinOrFallback(
                    buildEducationPracticalGuidance({
                      insights: input.insights,
                      currentCycle: input.currentCycle,
                    }).slice(0, 4),
                    "No practical study guidance is available yet."
                  )
              : input.profile.key === "BUSINESS"
                ? joinOrFallback(
                    buildBusinessPracticalGuidance({
                      insights: input.insights,
                      currentCycle: input.currentCycle,
                    }).slice(0, 4),
                    "No practical business guidance is available yet."
                  )
        : joinOrFallback(
            buildPracticalGuidance({
              insights: input.insights,
              currentCycle: input.currentCycle,
            }).slice(0, 4),
            "No practical guidance is available yet."
          ),
    "optional-remedies":
      input.profile.key === "CAREER"
        ? joinOrFallback(
            buildCareerOptionalRemedies({ chartReport: input.chartReport }).slice(0, 3),
            "No approved career remedy records matched the current signal set yet."
          )
        : input.profile.key === "MARRIAGE"
          ? joinOrFallback(
              buildMarriageOptionalRemedies({ chartReport: input.chartReport }).slice(0, 3),
              "No approved relationship remedy records matched the current signal set yet."
            )
          : input.profile.key === "FINANCE"
            ? joinOrFallback(
                buildFinanceOptionalRemedies({ chartReport: input.chartReport }).slice(0, 3),
                "No approved finance remedy records matched the current signal set yet."
              )
            : input.profile.key === "HEALTH"
              ? joinOrFallback(
                  buildHealthOptionalRemedies({ chartReport: input.chartReport }).slice(0, 3),
                  "No approved health remedy records matched the current signal set yet."
                )
              : input.profile.key === "EDUCATION"
                ? joinOrFallback(
                    buildEducationOptionalRemedies({ chartReport: input.chartReport }).slice(0, 3),
                    "No approved education remedy records matched the current signal set yet."
                  )
              : input.profile.key === "BUSINESS"
                ? joinOrFallback(
                    buildBusinessOptionalRemedies({ chartReport: input.chartReport }).slice(0, 3),
                    "No approved business remedy records matched the current signal set yet."
                  )
        : joinOrFallback(
            buildOptionalRemedies({ chartReport: input.chartReport }).slice(0, 3),
            "No approved remedy records matched the current signal set yet."
          ),
    "premium-deep-dive-sections":
      input.profile.key === "CAREER"
        ? joinOrFallback(
            buildCareerPremiumDeepDive({
              currentCycle: input.currentCycle,
              predictiveContext: input.predictiveContext,
              chartReport: input.chartReport,
            }).slice(0, 3),
            "No career deep-dive context is available yet."
          )
        : input.profile.key === "MARRIAGE"
          ? joinOrFallback(
              buildMarriagePremiumDeepDive({
                currentCycle: input.currentCycle,
                predictiveContext: input.predictiveContext,
                chartReport: input.chartReport,
              }).slice(0, 3),
              "No relationship deep-dive context is available yet."
            )
          : input.profile.key === "FINANCE"
            ? joinOrFallback(
                buildFinancePremiumDeepDive({
                  currentCycle: input.currentCycle,
                  predictiveContext: input.predictiveContext,
                  chartReport: input.chartReport,
                }).slice(0, 3),
                "No finance deep-dive context is available yet."
              )
            : input.profile.key === "HEALTH"
              ? joinOrFallback(
                  buildHealthPremiumDeepDive({
                    currentCycle: input.currentCycle,
                    predictiveContext: input.predictiveContext,
                    chartReport: input.chartReport,
                  }).slice(0, 3),
                  "No wellness deep-dive context is available yet."
                )
              : input.profile.key === "EDUCATION"
                ? joinOrFallback(
                    buildEducationPremiumDeepDive({
                      currentCycle: input.currentCycle,
                      predictiveContext: input.predictiveContext,
                      chartReport: input.chartReport,
                    }).slice(0, 3),
                    "No education deep-dive context is available yet."
                  )
              : input.profile.key === "BUSINESS"
                ? joinOrFallback(
                    buildBusinessPremiumDeepDive({
                      currentCycle: input.currentCycle,
                      predictiveContext: input.predictiveContext,
                      chartReport: input.chartReport,
                    }).slice(0, 3),
                    "No business deep-dive context is available yet."
                  )
        : joinOrFallback(
            buildPremiumDeepDive({
              currentCycle: input.currentCycle,
              predictiveContext: input.predictiveContext,
              chartReport: input.chartReport,
              profile: input.profile,
            }).slice(0, 3),
            "No premium deep-dive context is available yet."
          ),
    "disclaimer-safety-note":
      input.profile.key === "HEALTH"
        ? buildHealthDisclaimerSafetyNote({ chartReport: input.chartReport })
        : input.profile.key === "EDUCATION"
          ? buildEducationDisclaimerSafetyNote({ chartReport: input.chartReport })
          : input.profile.key === "BUSINESS"
            ? buildBusinessDisclaimerSafetyNote({ chartReport: input.chartReport })
        : input.chartReport.status === "ready"
          ? `${input.chartReport.accuracy.disclaimer} ${input.chartReport.accuracy.incompleteDataNotice ?? ""}`.trim()
          : "Interpretation language is reflective and should not be treated as certainty.",
    "next-step-cta": buildNextStepCta(input.profile),
  };

  return sectionOrder.map((key) => {
    const premiumOnly = input.profile.premiumSections.includes(key);
    const previewAllowed = input.profile.previewSections.includes(key);
    const requiresUnlockedReport = premiumOnly;
    const safeContent =
      premiumOnly && !premiumUnlocked
        ? "This section is available after unlocking the premium report."
        : sectionContentByKey[key];

    return {
      key,
      title: getProfileSectionTitle(input.profile, key),
      content: safeContent,
      flags: {
        previewAllowed,
        premiumOnly,
        requiresUnlockedReport,
      },
    } satisfies ReportSectionPlan;
  });
}

export function getReportTypeProfile(
  reportType: ReportFoundationTypeKey
): ReportTypeProfile {
  return reportTypeProfiles[reportType];
}

export function buildPremiumReportFoundation(input: {
  reportType: ReportFoundationTypeKey;
  accessTier: ReportAccessTier;
  unlockState: ReportUnlockState;
  chartReport: ChartReportState;
  insights: ChartInsights;
  currentCycle: CurrentCycleSummary;
  predictiveContext: ReportPredictiveContext | null;
  accuracy?: ReportAccuracySnapshot | null;
}): ReportFoundation {
  const profile = getReportTypeProfile(input.reportType);
  const chartAvailable = input.chartReport.status === "ready";
  const chart = chartAvailable ? input.chartReport.overview.chart : null;
  const divisionalChartCodes = chart?.divisionalCharts.map((entry) => entry.code) ?? [];

  return {
    reportType: input.reportType,
    accessTier: input.accessTier,
    unlockState: input.unlockState,
    profile,
    chartContext: {
      hasSavedChart: chartAvailable,
      hasBirthProfile: chartAvailable,
      hasChart: chartAvailable,
      hasLagnaChart: Boolean(chart?.lagna),
      hasHouseAnalysis: Boolean(chart?.houses.length),
      hasDashaChain: Boolean(input.currentCycle.dasha),
      hasTransitContext:
        input.currentCycle.status === "ready" &&
        Boolean(input.currentCycle.transitSnapshot.planets.length),
      hasPredictiveContext: Boolean(input.predictiveContext),
      hasYogaSignals: Boolean(
        input.predictiveContext?.yoga_rule_summary.top_yoga_signals.length ||
          chart?.summary.yogaKeys?.length
      ),
      hasDivisionalCharts: Boolean(divisionalChartCodes.length),
      divisionalChartCodes,
      hasD9: divisionalChartCodes.includes("D9"),
      hasD10: divisionalChartCodes.includes("D10"),
      panchangAvailable: false,
    },
    contextSummary: {
      executiveSummary:
        input.chartReport.status === "ready"
          ? input.chartReport.interpretation.summary
          : input.insights.summary,
      chartFoundation: buildChartFoundationSummary({
        chartReport: input.chartReport,
      }),
      keyStrengths: input.insights.strengths.slice(0, 3),
      cautionAreas: input.insights.challenges.slice(0, 3),
      timingInsight: summarizeCurrentCycle(input.currentCycle),
      transitInsight:
        input.currentCycle.status === "ready"
          ? input.currentCycle.synthesis.activeAreas[0]?.summary ??
            input.currentCycle.synthesis.overview
          : input.currentCycle.unavailableReason ?? "Transit context is unavailable.",
      houseAnalysis: buildHouseAnalysis({ chartReport: input.chartReport }).slice(
        0,
        6
      ),
      yogaSignals: buildYogaSignals({
        chartReport: input.chartReport,
        predictiveContext: input.predictiveContext,
      }).slice(0, 5),
      practicalGuidance: buildPracticalGuidance({
        insights: input.insights,
        currentCycle: input.currentCycle,
      }).slice(0, 4),
      optionalRemedies: buildOptionalRemedies({
        chartReport: input.chartReport,
      }).slice(0, 3),
      premiumDeepDive: buildPremiumDeepDive({
        currentCycle: input.currentCycle,
        predictiveContext: input.predictiveContext,
        chartReport: input.chartReport,
        profile: profile,
      }).slice(0, 3),
      disclaimer:
        profile.key === "HEALTH"
          ? buildHealthDisclaimerSafetyNote({ chartReport: input.chartReport })
          : profile.key === "EDUCATION"
            ? buildEducationDisclaimerSafetyNote({ chartReport: input.chartReport })
            : profile.key === "BUSINESS"
              ? buildBusinessDisclaimerSafetyNote({ chartReport: input.chartReport })
          : input.chartReport.status === "ready"
            ? input.chartReport.accuracy.disclaimer
            : "Interpretation language is reflective and should not be treated as certainty.",
      nextStepCta: buildNextStepCta(profile),
    },
    timingContext: {
      dashaLord: input.currentCycle.dasha?.lord ?? null,
      currentCycleOverview: summarizeCurrentCycle(input.currentCycle),
      predictiveOverview: input.predictiveContext?.dominant_timing_factors.timing_focus.join(
        ", "
      )
        ? input.predictiveContext.dominant_timing_factors.timing_focus.join(", ")
        : null,
      confidenceLevel: input.predictiveContext?.confidence.level ?? null,
    },
    accuracy: input.accuracy ?? null,
    missingContext:
      input.chartReport.status === "ready"
        ? input.chartReport.accuracy.missingFields
        : ["chart", "timing", "predictive context"],
    sectionPlan: buildSectionPlan({
      profile,
      accessTier: input.accessTier,
      unlockState: input.unlockState,
      chartReport: input.chartReport,
      insights: input.insights,
      currentCycle: input.currentCycle,
      predictiveContext: input.predictiveContext,
    }),
  };
}

export function resolveReportFoundationTypeKey(reportType: string) {
  const normalized = reportType.trim().toUpperCase();

  if (
    normalized === "CAREER" ||
    normalized === "MARRIAGE" ||
    normalized === "FINANCE" ||
    normalized === "HEALTH" ||
    normalized === "EDUCATION" ||
    normalized === "BUSINESS"
  ) {
    return normalized;
  }

  return "FULL_KUNDLI";
}
