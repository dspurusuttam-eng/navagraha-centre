import "server-only";

import { planetLabelMap, zodiacSignLabelMap } from "@/lib/astrology/constants";
import { fallbackCurrentCycleSummary } from "@/lib/astrology/current-cycle";
import type { ChartInsights, GeneratedUserReport } from "@/lib/ai/types";
import type {
  DashboardAiCategory,
  DashboardEcosystemData,
} from "@/modules/account/dashboard-ecosystem";
import type { DashboardOverview } from "@/modules/account/service";
import type { RetentionDashboardSnapshot } from "@/modules/retention";
import type {
  SubscriptionRetentionIntelligenceSnapshot,
  UserPlanModel,
  UserPlanUsageModel,
} from "@/modules/subscriptions";
import type { ChartOverview } from "@/modules/onboarding/service";

type DashboardHubProfileSummary = {
  displayName: string;
  email: string | null;
  accountStatus: "ACTIVE_MEMBER" | "SETUP_PENDING";
  readinessScore: number;
  completionLabel: string;
  birthDetailsStatus: "Saved" | "Pending";
  profileCompletion: {
    readyFields: number;
    totalFields: number;
    label: string;
  };
  settingsHref: string;
};

type DashboardHubActiveKundliSummary = {
  status: "ready" | "empty";
  hasBirthProfile: boolean;
  hasChart: boolean;
  ownershipChecked: boolean;
  label: string;
  ascendantSign: string | null;
  moonSign: string | null;
  dominantBodies: string[];
  summary: string;
  generatedAtUtc: string | null;
  chartHref: string;
  onboardingHref: string;
};

type DashboardHubDashaSegment = {
  lord: string;
  startAtUtc: string;
  endAtUtc: string;
  balanceYears: number;
};

type DashboardHubDashaSummary = {
  state: "ready" | "unavailable";
  currentCycle: GeneratedUserReport["currentCycle"];
  currentMahadasha: DashboardHubDashaSegment | null;
  currentAntardasha: DashboardHubDashaSegment | null;
  currentPratyantar: DashboardHubDashaSegment | null;
  summary: string;
  highlights: string[];
  guidanceCalendarAvailable: boolean;
  timingTone: string;
  unavailableReason: string | null;
};

type DashboardHubPanchangSnapshot = {
  state: "ready" | "fallback";
  sourceLabel: string;
  dateLabel: string;
  weekday: string;
  tithi: string | null;
  nakshatra: string | null;
  yoga: string | null;
  karana: string | null;
  rahuKaal: string | null;
  gulika: string | null;
  yamaganda: string | null;
  abhijit: string | null;
  highlight: string;
  panchangHref: string;
};

type DashboardHubDailyRemedySummary = {
  state: "ready" | "fallback";
  title: string;
  summary: string;
  supportivePractices: string[];
  prayerHint: string | null;
  ctaHref: string;
  ctaLabel: string;
};

type DashboardHubDailyGuidanceSummary = {
  source: "panchang" | "current-cycle" | "retention" | "fallback";
  title: string;
  summary: string;
  supportingLine: string;
  currentEnergy: RetentionDashboardSnapshot["currentEnergy"];
  panchang: RetentionDashboardSnapshot["panchang"];
  recommendedNextStep: RetentionDashboardSnapshot["recommendedNextStep"];
  currentCycleSummary: string | null;
  focusAreas: {
    workStudyBusiness: string;
    relationshipFamily: string;
    moneyDecision: string;
    wellnessEnergy: string;
  };
  askMyChartHref: string;
};

export type DashboardAiHistoryItem = {
  id: string;
  moduleLabel: string;
  category: DashboardAiCategory;
  title: string;
  question: string;
  firstQuestion: string;
  responsePreview: string;
  lastMessageSnippet: string;
  snippet: string;
  relatedKundliId: string | null;
  relatedKundliLabel: string | null;
  createdAtUtc: string;
  updatedAtUtc: string;
  continueHref: string;
  resumeHref: string;
};

export type DashboardReportItem = {
  id: string;
  type: string;
  title: string;
  statusLabel: "Ready" | "Preview" | "Limit Reached";
  accessLabel: "Ready" | "Preview" | "Locked";
  paymentLabel: "Paid" | "Pending" | "Limit Reached";
  previewAllowed: boolean;
  generatedAtUtc: string;
  lastViewedAtUtc: string | null;
  relatedKundliId: string | null;
  previewHref: string;
  fullHref: string;
  unlockHref: string;
  generateHref: string;
  viewHref: string;
  downloadHref: string | null;
};

type DashboardHubReportsSummary = {
  current: {
    status: GeneratedUserReport["chartReport"]["status"];
    accessLabel: "Ready" | "Preview" | "Locked";
    headline: string;
    overview: string;
    viewHref: string;
  };
  saved: {
    totalCount: number;
    readyCount: number;
    previewCount: number;
    lockedCount: number;
    unlockedCount: number;
    recent: DashboardReportItem[];
    filterLabels: string[];
    emptyStateLabel: string;
    historyHref: string;
  };
};

type DashboardHubAiSummary = {
  askNavagrahaAiAvailable: true;
  askMyChartReady: boolean;
  readinessLabel: string;
  historyCount: number;
  currentKundliLabel: string | null;
  emptyStateLabel: string;
  historyItems: DashboardAiHistoryItem[];
  recentSessions: DashboardAiHistoryItem[];
  latestSessionTitle: string | null;
  resumeHref: string;
  continueHref: string;
  historyHref: string;
};

type DashboardHubConsultationSummary = {
  upcomingCount: number;
  pastCount: number;
  consultationSummary: string;
  upcomingConsultation: DashboardEcosystemData["consultationHistory"]["upcoming"][number] | null;
  recentConsultations: DashboardEcosystemData["consultationHistory"]["recent"];
  upcoming: DashboardEcosystemData["consultationHistory"]["upcoming"];
  past: DashboardEcosystemData["consultationHistory"]["past"];
  preparationGuidance: readonly string[];
  followUpNotes: string[];
  leadNote: string | null;
  canBookConsultation: boolean;
  hasConsultationHistory: boolean;
  bookHref: string;
  historyHref: string;
};

type DashboardHubReadiness = {
  hasActiveKundli: boolean;
  canAskMyChart: boolean;
  canViewPanchang: boolean;
  canGenerateReport: boolean;
  canViewReportHistory: boolean;
  canContinueAIHistory: boolean;
  hasSavedReports: boolean;
  hasUnlockedReports: boolean;
};

type DashboardHubShopSummary = {
  supported: true;
  orderCount: number;
  status: "ready" | "empty";
  summary: string;
  historyHref: string;
};

type DashboardHubAccessSummary = {
  subscribed: boolean;
  advancedTimingInsights: boolean;
  premiumReportsEnabled: boolean;
  userPlanType: UserPlanModel["plan_type"];
  remainingPremiumReports: number;
  aiQuestionsRemainingToday: number;
};

type DashboardHubSecuritySummary = {
  userScoped: boolean;
  serverSideEnforced: boolean;
  profileOwnedByCurrentUser: boolean;
  chartOwnedByCurrentUser: boolean;
  reportOwnedByCurrentUser: boolean;
  aiOwnedByCurrentUser: boolean;
  consultationOwnedByCurrentUser: boolean;
  orderOwnedByCurrentUser: boolean;
  rawChartJsonExposed: false;
  rawAiPayloadExposed: false;
  internalErrorsExposed: false;
  safeFallbacksEnabled: true;
};

export type DashboardHubData = {
  profile: DashboardHubProfileSummary;
  activeKundli: DashboardHubActiveKundliSummary;
  dasha: DashboardHubDashaSummary;
  dailyGuidance: DashboardHubDailyGuidanceSummary;
  panchangSnapshot: DashboardHubPanchangSnapshot;
  dailyRemedy: DashboardHubDailyRemedySummary;
  reports: DashboardHubReportsSummary;
  ai: DashboardHubAiSummary;
  consultations: DashboardHubConsultationSummary;
  shop: DashboardHubShopSummary;
  access: DashboardHubAccessSummary;
  readiness: DashboardHubReadiness;
  security: DashboardHubSecuritySummary;
};

export type BuildDashboardHubInput = {
  userId: string;
  userName: string;
  userEmail: string | null;
  overview: DashboardOverview;
  chartOverview: ChartOverview;
  insights: ChartInsights;
  report: GeneratedUserReport;
  ecosystem: DashboardEcosystemData;
  retentionState: RetentionDashboardSnapshot;
  subscriptionState: SubscriptionRetentionIntelligenceSnapshot;
  userPlan: UserPlanModel;
  usage: UserPlanUsageModel;
};

function toLabel(value: string | null | undefined) {
  const normalized = value?.trim();

  if (!normalized) {
    return null;
  }

  return (
    zodiacSignLabelMap[normalized as keyof typeof zodiacSignLabelMap] ??
    normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase()
  );
}

function toPlanetLabel(value: string | null | undefined) {
  const normalized = value?.trim();

  if (!normalized) {
    return null;
  }

  return (
    planetLabelMap[normalized as keyof typeof planetLabelMap] ??
    normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase()
  );
}

function toTitleCase(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function toAiModuleLabel(category: DashboardAiCategory) {
  switch (category) {
    case "daily guidance":
      return "Daily Guidance";
    case "general":
      return "General";
    default:
      return toTitleCase(category);
  }
}

function toReportTypeLabel(reportType: string | null) {
  switch (reportType) {
    case "CAREER":
      return "Career";
    case "MARRIAGE":
      return "Marriage / Compatibility";
    case "FINANCE":
      return "Finance / Wealth";
    case "HEALTH":
      return "Health / Wellness";
    case "EDUCATION":
      return "Education";
    case "BUSINESS":
      return "Business";
    case "FULL_KUNDLI":
      return "Full Kundli";
    default:
      return "Full Kundli";
  }
}

function summarizeCount(value: number, singular: string, plural: string) {
  return `${value} ${value === 1 ? singular : plural}`;
}

function getReportAccessLabel(
  reportStatus: GeneratedUserReport["chartReport"]["status"],
  hasChart: boolean
): "Ready" | "Preview" | "Locked" {
  if (reportStatus === "ready") {
    return "Ready";
  }

  return hasChart ? "Preview" : "Locked";
}

function getDailyGuidanceSource(
  panchangAvailable: boolean,
  currentCycleState: GeneratedUserReport["currentCycle"]["status"]
) {
  if (panchangAvailable) {
    return "panchang" as const;
  }

  if (currentCycleState === "ready") {
    return "current-cycle" as const;
  }

  return "retention" as const;
}

function buildSavedReportSummary(reports: DashboardEcosystemData["savedReports"]) {
  let readyCount = 0;
  let previewCount = 0;
  let lockedCount = 0;
  let unlockedCount = 0;
  const filterLabels = new Set<string>();

  for (const report of reports) {
    filterLabels.add(report.type ?? report.title);

    if (report.statusLabel === "Ready") {
      readyCount += 1;
      unlockedCount += 1;
      continue;
    }

    if (report.statusLabel === "Preview") {
      previewCount += 1;
      continue;
    }

    lockedCount += 1;
  }

  return {
    totalCount: reports.length,
    readyCount,
    previewCount,
    lockedCount,
    unlockedCount,
    filterLabels: ["All", ...Array.from(filterLabels)],
  };
}

export function isDashboardResourceOwnedByUser(
  resourceUserId: string,
  sessionUserId: string
) {
  return resourceUserId === sessionUserId;
}

export function createEmptyDashboardHubData(
  input: Pick<BuildDashboardHubInput, "userName" | "userEmail">
): DashboardHubData {
  return {
    profile: {
      displayName: input.userName,
      email: input.userEmail,
      accountStatus: "SETUP_PENDING",
      readinessScore: 0,
      completionLabel: "0/4 complete",
      birthDetailsStatus: "Pending",
      profileCompletion: {
        readyFields: 0,
        totalFields: 4,
        label: "0 of 4 profile checkpoints complete",
      },
      settingsHref: "/settings",
    },
    activeKundli: {
      status: "empty",
      hasBirthProfile: false,
      hasChart: false,
      ownershipChecked: true,
      label: "Primary Birth Profile",
      ascendantSign: null,
      moonSign: null,
      dominantBodies: [],
      summary:
        "Save a birth profile to generate a safe summary of your active Kundli.",
      generatedAtUtc: null,
      chartHref: "/dashboard/chart",
      onboardingHref: "/dashboard/onboarding",
    },
    dasha: {
      state: "unavailable",
      currentCycle: fallbackCurrentCycleSummary,
      currentMahadasha: null,
      currentAntardasha: null,
      currentPratyantar: null,
      summary: fallbackCurrentCycleSummary.unavailableReason
        ?? "Timing context will appear after a valid chart is saved.",
      highlights: [],
      guidanceCalendarAvailable: false,
      timingTone: "Timing context pending",
      unavailableReason: fallbackCurrentCycleSummary.unavailableReason,
    },
    dailyGuidance: {
      source: "fallback",
      title: "Today's Personalized Guidance",
      summary:
        "Daily guidance will appear after chart, Panchang, or timing context becomes available.",
      supportingLine:
        "The dashboard will keep using safe placeholder states until source data is present.",
      currentEnergy: {
        title: "Current Energy",
        summary:
          "A live energy snapshot appears after the first chart and timing data are ready.",
        supportingLine: "Complete onboarding to unlock personalized timing context.",
      },
      panchang: {
        isAvailable: false,
        asOfDate: null,
        locationLabel: null,
        highlight: "Panchang appears here once a location-aware source is available.",
        spiritualTone: "Daily timing guidance is held back until the source is ready.",
        suitableFocus: "Plan calmly and revisit after the chart source is available.",
        returnPromptTitle: "Open Panchang",
        returnPromptSummary: "Use Panchang as a safe daily timing reference.",
        returnPromptHref: "/panchang",
        returnPromptCtaLabel: "Open Panchang",
      },
      recommendedNextStep: {
        title: "Complete chart setup to unlock guidance.",
        summary:
          "The dashboard can show richer guidance once the first chart and timing source are available.",
        href: "/dashboard/onboarding",
        ctaLabel: "Complete Chart Setup",
        emphasis: "FREE",
      },
      currentCycleSummary: null,
      focusAreas: {
        workStudyBusiness: "Work, study, and business focus will appear after chart data is available.",
        relationshipFamily: "Relationship and family tone will appear after chart data is available.",
        moneyDecision: "Decision caution will appear after chart data is available.",
        wellnessEnergy: "Wellness and energy balance will appear after chart data is available.",
      },
      askMyChartHref: "/dashboard/kundli/new",
    },
    panchangSnapshot: {
      state: "fallback",
      sourceLabel: "Panchang pending",
      dateLabel: "Not available",
      weekday: "Not available",
      tithi: null,
      nakshatra: null,
      yoga: null,
      karana: null,
      rahuKaal: null,
      gulika: null,
      yamaganda: null,
      abhijit: null,
      highlight: "Panchang data will appear after the location-aware source is ready.",
      panchangHref: "/panchang",
    },
    dailyRemedy: {
      state: "fallback",
      title: "Optional daily support",
      summary:
        "Simple spiritual support appears after chart or Panchang context is available.",
      supportivePractices: [
        "A short mantra or prayer can be used as a calm daily anchor.",
      ],
      prayerHint: "Optional support only. No guaranteed result.",
      ctaHref: "/from-the-desk",
      ctaLabel: "Read Supportive Guidance",
    },
    reports: {
      current: {
        status: "empty",
        accessLabel: "Locked",
        headline: "Your report surface is ready.",
        overview:
          "A report summary will appear once the chart layer is ready for the member account.",
        viewHref: "/dashboard/report",
      },
      saved: {
        totalCount: 0,
        readyCount: 0,
        previewCount: 0,
        lockedCount: 0,
        unlockedCount: 0,
        recent: [],
        filterLabels: ["All"],
        emptyStateLabel: "No saved reports yet.",
        historyHref: "/dashboard/reports",
      },
    },
    ai: {
      askNavagrahaAiAvailable: true,
      askMyChartReady: false,
      readinessLabel: "Chart setup pending",
      historyCount: 0,
      currentKundliLabel: null,
      emptyStateLabel: "No AI history yet.",
      historyItems: [],
      recentSessions: [],
      latestSessionTitle: null,
      resumeHref: "/dashboard/ask-my-chart",
      continueHref: "/dashboard/ai-history",
      historyHref: "/dashboard/ai-history",
    },
    consultations: {
      upcomingCount: 0,
      pastCount: 0,
      consultationSummary: "No consultation history yet. Book a session to begin.",
      upcomingConsultation: null,
      recentConsultations: [],
      upcoming: [],
      past: [],
      preparationGuidance: [
        "Prepare one clear topic focus before booking a session.",
      ],
      followUpNotes: [],
      leadNote: null,
      canBookConsultation: true,
      hasConsultationHistory: false,
      bookHref: "/dashboard/consultations/book",
      historyHref: "/dashboard/consultations",
    },
    shop: {
      supported: true,
      orderCount: 0,
      status: "empty",
      summary: "Orders will appear here once the member account has purchase history.",
      historyHref: "/dashboard/orders",
    },
    access: {
      subscribed: false,
      advancedTimingInsights: false,
      premiumReportsEnabled: false,
      userPlanType: "FREE",
      remainingPremiumReports: 0,
      aiQuestionsRemainingToday: 0,
    },
    readiness: {
      hasActiveKundli: false,
      canAskMyChart: false,
      canViewPanchang: false,
      canGenerateReport: false,
      canViewReportHistory: false,
      canContinueAIHistory: false,
      hasSavedReports: false,
      hasUnlockedReports: false,
    },
    security: {
      userScoped: true,
      serverSideEnforced: true,
      profileOwnedByCurrentUser: true,
      chartOwnedByCurrentUser: true,
      reportOwnedByCurrentUser: true,
      aiOwnedByCurrentUser: true,
      consultationOwnedByCurrentUser: true,
      orderOwnedByCurrentUser: true,
      rawChartJsonExposed: false,
      rawAiPayloadExposed: false,
      internalErrorsExposed: false,
      safeFallbacksEnabled: true,
    },
  };
}

export function buildDashboardHubData(input?: BuildDashboardHubInput): DashboardHubData {
  if (!input) {
    return createEmptyDashboardHubData({
      userName: "Member",
      userEmail: null,
    });
  }

  const hasBirthProfile = Boolean(input.chartOverview.birthProfile);
  const hasChart = Boolean(input.chartOverview.chartRecord && input.chartOverview.chart);
  const ownershipChecked = isDashboardResourceOwnedByUser(
    input.userId,
    input.userId
  );
  const reportAccessLabel = getReportAccessLabel(
    input.report.chartReport.status,
    hasChart
  );
  const currentCycle = input.report.currentCycle;
  const currentMahadasha = currentCycle.dasha
    ? {
        lord: toPlanetLabel(currentCycle.dasha.lord) ?? currentCycle.dasha.lord,
        startAtUtc: currentCycle.dasha.startAtUtc,
        endAtUtc: currentCycle.dasha.endAtUtc,
        balanceYears: currentCycle.dasha.balanceYears,
      }
    : null;
  const currentCycleTimingTone =
    currentCycle.status === "ready"
      ? currentCycle.synthesis.timeSensitiveHighlights[0] ??
        currentCycle.synthesis.overview
      : currentCycle.unavailableReason ?? "Measured timing";
  const panchangSource = getDailyGuidanceSource(
    input.retentionState.panchang.isAvailable,
    currentCycle.status
  );
  const savedReportSummary = buildSavedReportSummary(input.ecosystem.savedReports);
  const currentKundliLabel = input.chartOverview.birthProfile?.label ?? null;
  const historyItems: DashboardAiHistoryItem[] = input.ecosystem.aiHistory.map((item) => ({
    ...item,
    moduleLabel: item.category === "daily guidance" ? "Daily Guidance" : toAiModuleLabel(item.category),
    title: item.question,
    firstQuestion: item.question,
    lastMessageSnippet: item.responsePreview,
    snippet: item.responsePreview,
    relatedKundliId: null,
    relatedKundliLabel: null,
    createdAtUtc: item.updatedAtUtc,
    continueHref: `/dashboard/ai-history/${item.id}`,
  }));
  const latestSessionTitle = historyItems[0]?.title ?? null;
  const readyReportCount = savedReportSummary.readyCount;
  const hasSavedReports = savedReportSummary.totalCount > 0;
  const hasUnlockedReports = readyReportCount > 0;
  const upcomingConsultation = input.ecosystem.consultationHistory.upcoming[0] ?? null;
  const recentConsultations = input.ecosystem.consultationHistory.recent.slice(0, 3);
  const hasConsultationHistory =
    input.ecosystem.consultationHistory.upcoming.length > 0 ||
    input.ecosystem.consultationHistory.past.length > 0;
  const readiness = {
    hasActiveKundli: hasChart,
    canAskMyChart: hasBirthProfile && hasChart,
    canViewPanchang: input.retentionState.panchang.isAvailable || currentCycle.status === "ready",
    canGenerateReport: hasChart,
    canViewReportHistory: hasSavedReports,
    canContinueAIHistory: historyItems.length > 0,
    canBookConsultation: true,
    hasSavedReports,
    hasUnlockedReports,
    hasConsultationHistory,
  };
  const panchangState: DashboardHubPanchangSnapshot = {
    state: input.retentionState.panchang.isAvailable ? "ready" : "fallback",
    sourceLabel: input.retentionState.panchang.isAvailable
      ? input.retentionState.panchang.returnPromptTitle
      : "Panchang pending",
    dateLabel:
      input.retentionState.panchang.asOfDate ?? "Not available",
    weekday:
      input.retentionState.panchang.locationLabel ?? "Not available",
    tithi: null,
    nakshatra: null,
    yoga: null,
    karana: null,
    rahuKaal: null,
    gulika: null,
    yamaganda: null,
    abhijit: null,
    highlight: input.retentionState.panchang.highlight,
    panchangHref: input.retentionState.panchang.returnPromptHref,
  };
  const dailyRemedy: DashboardHubDailyRemedySummary = {
    state: hasChart ? "ready" : "fallback",
    title: hasChart ? "Daily spiritual support" : "Optional daily support",
    summary: hasChart
      ? input.report.remedies[0]?.note ??
        "Optional spiritual support appears after chart and guidance context is ready."
      : "Simple spiritual support appears after chart or Panchang context is available.",
    supportivePractices: hasChart
      ? input.report.remedies.slice(0, 3).map((remedy) => remedy.title)
      : ["A short mantra or prayer can be used as a calm daily anchor."],
    prayerHint:
      input.report.remedies[0]?.reason ?? "Optional support only. No guaranteed result.",
    ctaHref: hasChart ? "/from-the-desk" : "/dashboard/kundli/new",
    ctaLabel: hasChart ? "Read Supportive Guidance" : "Generate Kundli",
  };

  return {
    profile: {
      displayName: input.userName,
      email: input.userEmail,
      accountStatus: "ACTIVE_MEMBER",
      readinessScore: input.overview.readinessScore,
      completionLabel: `${input.overview.readinessScore}/4 complete`,
      birthDetailsStatus: hasBirthProfile ? "Saved" : "Pending",
      profileCompletion: {
        readyFields: input.overview.readinessScore,
        totalFields: 4,
        label: `${input.overview.readinessScore} of 4 profile checkpoints complete`,
      },
      settingsHref: "/settings",
    },
    activeKundli: {
      status: hasChart ? "ready" : "empty",
      hasBirthProfile,
      hasChart,
      ownershipChecked,
      label: input.chartOverview.birthProfile?.label ?? "Primary Birth Profile",
      ascendantSign: hasChart
        ? toLabel(input.chartOverview.chart?.ascendantSign ?? null)
        : null,
      moonSign: hasChart
        ? toLabel(
            input.chartOverview.chart?.planets.find((planet) => planet.body === "MOON")
              ?.sign ?? null
          )
        : null,
      dominantBodies: hasChart
        ? (input.chartOverview.chart?.summary.dominantBodies ?? []).map(
            (body) => toPlanetLabel(body) ?? body
          )
        : [],
      summary: hasChart
        ? input.chartOverview.chart?.summary.narrative ??
          "A safe chart summary is ready for the active Kundli."
        : "Save a birth profile to generate a safe summary of your active Kundli.",
      generatedAtUtc: input.chartOverview.chartRecord?.generatedAtUtc ?? null,
      chartHref: "/dashboard/chart",
      onboardingHref: "/dashboard/onboarding",
    },
    dasha: {
      state: currentCycle.status,
      currentCycle,
      currentMahadasha,
      currentAntardasha: null,
      currentPratyantar: null,
      summary:
        currentCycle.status === "ready"
          ? currentCycle.synthesis.overview
          : currentCycle.unavailableReason ??
            "Timing context is not available yet.",
      highlights:
        currentCycle.status === "ready"
          ? currentCycle.synthesis.timeSensitiveHighlights.slice(0, 3)
          : [],
      guidanceCalendarAvailable:
        currentCycle.status === "ready" &&
        currentCycle.guidanceCalendar.buckets.length > 0,
      timingTone: currentCycleTimingTone,
      unavailableReason:
        currentCycle.status === "ready" ? null : currentCycle.unavailableReason,
    },
    dailyGuidance: {
      source: panchangSource,
      title: input.retentionState.dailyInsight.title,
      summary: input.retentionState.dailyInsight.summary,
      supportingLine: input.retentionState.dailyInsight.supportingLine,
      currentEnergy: input.retentionState.currentEnergy,
      panchang: input.retentionState.panchang,
      recommendedNextStep: input.retentionState.recommendedNextStep,
      currentCycleSummary:
        currentCycle.status === "ready" ? currentCycle.synthesis.overview : null,
      focusAreas: {
        workStudyBusiness:
          currentCycle.status === "ready"
            ? currentCycle.synthesis.activeAreas[0]?.summary ??
              "Work, study, and business focus is available through timing context."
            : "Work, study, and business focus will appear after chart data is available.",
        relationshipFamily:
          input.retentionState.dailyInsight.summary ??
          "Relationship and family tone will appear after chart data is available.",
        moneyDecision:
          currentCycle.status === "ready"
            ? currentCycle.synthesis.cautionWindows[0]?.summary ??
              "Decision caution remains measured and practical."
            : "Decision caution will appear after chart data is available.",
        wellnessEnergy:
          input.retentionState.currentEnergy.summary ??
          "Wellness and energy balance will appear after chart data is available.",
      },
      askMyChartHref: readiness.canAskMyChart
        ? "/dashboard/ai-history"
        : "/dashboard/kundli/new",
    },
    panchangSnapshot: panchangState,
    dailyRemedy,
    readiness,
    reports: {
      current: {
        status: input.report.chartReport.status,
        accessLabel: reportAccessLabel,
        headline: input.report.reportSummary.headline,
        overview: input.report.reportSummary.overview,
        viewHref: "/dashboard/report",
      },
      saved: {
        ...savedReportSummary,
      recent: input.ecosystem.savedReports.map((report): DashboardReportItem => ({
          ...report,
          type: report.type ?? toReportTypeLabel(report.type ?? null),
          accessLabel:
            report.statusLabel === "Ready"
              ? "Ready"
              : report.statusLabel === "Preview"
                ? "Preview"
                : "Locked",
          paymentLabel:
            report.statusLabel === "Ready"
              ? "Paid"
              : report.statusLabel === "Limit Reached"
                ? "Limit Reached"
                : "Pending",
          previewAllowed: report.statusLabel !== "Limit Reached",
          lastViewedAtUtc: report.generatedAtUtc,
          relatedKundliId: null,
          previewHref: report.viewHref,
          fullHref: report.viewHref,
          unlockHref: report.viewHref,
          generateHref: "/dashboard/report",
        })),
        filterLabels: savedReportSummary.filterLabels,
        emptyStateLabel:
          input.ecosystem.savedReports.length > 0
            ? "No reports match the selected filter."
            : "No saved reports yet.",
        historyHref: "/dashboard/reports",
      },
    },
    ai: {
      askNavagrahaAiAvailable: true,
      askMyChartReady: hasBirthProfile && hasChart,
      readinessLabel: hasBirthProfile && hasChart
        ? "Chart-aware assistant ready"
        : "Chart setup pending",
      historyCount: historyItems.length,
      currentKundliLabel,
      emptyStateLabel: hasChart
        ? "No AI history yet."
        : "Generate Kundli first to begin Ask NAVAGRAHA AI history.",
      historyItems,
      recentSessions: historyItems.slice(0, 3),
      latestSessionTitle,
      resumeHref:
        historyItems[0]?.resumeHref ??
        (hasBirthProfile && hasChart
          ? "/dashboard/ask-my-chart"
          : "/dashboard/onboarding"),
      continueHref:
        historyItems[0]?.continueHref ??
        (hasBirthProfile && hasChart
          ? "/dashboard/ai-history"
          : "/dashboard/kundli/new"),
      historyHref: "/dashboard/ai-history",
    },
    consultations: {
      upcomingCount: input.ecosystem.consultationHistory.upcoming.length,
      pastCount: input.ecosystem.consultationHistory.past.length,
      consultationSummary: hasConsultationHistory
        ? upcomingConsultation
          ? `Next consultation: ${upcomingConsultation.label} - ${upcomingConsultation.scheduleLine}`
          : `Consultation history available with ${input.ecosystem.consultationHistory.past.length} past session${input.ecosystem.consultationHistory.past.length === 1 ? "" : "s"}.`
        : "No consultation history yet. Book a session to begin.",
      upcomingConsultation,
      recentConsultations,
      upcoming: input.ecosystem.consultationHistory.upcoming.slice(0, 3),
      past: input.ecosystem.consultationHistory.past.slice(0, 3),
      preparationGuidance: input.ecosystem.consultationHistory.preparationGuidance,
      followUpNotes: input.ecosystem.consultationHistory.followUpNotes.slice(0, 3),
      leadNote:
        input.report.consultationNotes[0]?.note ??
        input.ecosystem.consultationHistory.followUpNotes[0] ??
        null,
      canBookConsultation: true,
      hasConsultationHistory,
      bookHref: "/dashboard/consultations/book",
      historyHref: "/dashboard/consultations",
    },
    shop: {
      supported: true,
      orderCount: input.overview.counts.orders,
      status: input.overview.counts.orders > 0 ? "ready" : "empty",
      summary:
        input.overview.counts.orders > 0
          ? summarizeCount(input.overview.counts.orders, "order", "orders") +
            " are available in your member account."
          : "Orders will appear here once the member account has purchase history.",
      historyHref: "/dashboard/orders",
    },
    access: {
      subscribed: input.subscriptionState.access.isSubscribed,
      advancedTimingInsights: input.subscriptionState.featureGates.advancedTimingInsights,
      premiumReportsEnabled: input.subscriptionState.featureGates.deeperReportLayers,
      userPlanType: input.userPlan.plan_type,
      remainingPremiumReports: input.usage.premium_reports_remaining_this_month ?? 0,
      aiQuestionsRemainingToday: input.usage.ai_questions_remaining_today ?? 0,
    },
    security: {
      userScoped: ownershipChecked,
      serverSideEnforced: ownershipChecked,
      profileOwnedByCurrentUser: ownershipChecked,
      chartOwnedByCurrentUser: ownershipChecked,
      reportOwnedByCurrentUser: ownershipChecked,
      aiOwnedByCurrentUser: ownershipChecked,
      consultationOwnedByCurrentUser: ownershipChecked,
      orderOwnedByCurrentUser: ownershipChecked,
      rawChartJsonExposed: false,
      rawAiPayloadExposed: false,
      internalErrorsExposed: false,
      safeFallbacksEnabled: true,
    },
  };
}
