import "server-only";

import {
  type ReportFoundation,
  type ReportSectionKey,
  type ReportUnlockState,
} from "@/modules/report/report-foundation";
import type { ReportPresentationBlock, ReportPresentationModel, ReportPresentationSlot } from "@/modules/report/report-presentation-types";

function isUnlocked(accessTier: ReportFoundation["accessTier"], unlockState: ReportUnlockState) {
  return (
    unlockState === "UNLOCKED" &&
    (accessTier === "PREMIUM" || accessTier === "PRO")
  );
}

const slotBySectionKey: Record<ReportSectionKey, ReportPresentationSlot> = {
  "executive-summary": "executive-summary-card",
  "chart-foundation": "section-card",
  "key-strengths": "section-card",
  "caution-areas": "section-card",
  "timing-dasha-insight": "timing-table",
  "transit-current-period-insight": "transit-insight-block",
  "house-based-analysis": "house-analysis-block",
  "yoga-rule-signals": "yoga-rule-signal-block",
  "practical-guidance": "practical-guidance-block",
  "optional-remedies": "remedy-block",
  "premium-deep-dive-sections": "section-card",
  "disclaimer-safety-note": "disclaimer-block",
  "next-step-cta": "cta-block",
};

const sectionPageBreakBeforeKeys: ReadonlySet<ReportSectionKey> = new Set([
  "timing-dasha-insight",
  "premium-deep-dive-sections",
]);

const sectionAvoidBreakKeys: ReadonlySet<ReportSectionKey> = new Set([
  "executive-summary",
  "chart-foundation",
  "disclaimer-safety-note",
  "next-step-cta",
]);

function buildPresentationBadgeSet(foundation: ReportFoundation) {
  const badges = [
    { label: "Access", value: foundation.accessTier },
    { label: "Unlock", value: foundation.unlockState },
    { label: "Preview", value: `${foundation.profile.previewSections.length} sections` },
    { label: "Premium", value: `${foundation.profile.premiumSections.length} sections` },
    { label: "Divisional Charts", value: foundation.chartContext.hasDivisionalCharts ? "Available" : "Not available" },
    { label: "Export", value: "Structure-ready" },
  ];

  if (foundation.chartContext.hasD9) {
    badges.push({ label: "D9", value: "Available" });
  }

  if (foundation.chartContext.hasD10) {
    badges.push({ label: "D10", value: "Available" });
  }

  if (foundation.chartContext.panchangAvailable) {
    badges.push({ label: "Panchang", value: "Available" });
  }

  return badges;
}

function buildSectionBlock(input: {
  foundation: ReportFoundation;
  sectionKey: ReportSectionKey;
  title: string;
  content: string;
}): ReportPresentationBlock {
  const premiumOnly = input.foundation.profile.premiumSections.includes(input.sectionKey);
  const previewAllowed = input.foundation.profile.previewSections.includes(input.sectionKey);
  const locked = premiumOnly && !isUnlocked(input.foundation.accessTier, input.foundation.unlockState);
  const slot = slotBySectionKey[input.sectionKey];
  const pageBreakBefore = sectionPageBreakBeforeKeys.has(input.sectionKey);
  const softCtaLabel = "Unlock Full Report";
  const softCtaHref = input.foundation.profile.softCtaPath;
  const previewTeaser = locked
    ? `Preview mode keeps ${input.title.toLowerCase()} concise. Unlock the full report to read the deeper interpretation.`
    : null;

  return {
    id: input.sectionKey,
    sectionKey: input.sectionKey,
    slot: locked && premiumOnly ? "premium-locked-section-block" : slot,
    title: input.title,
    content: locked
      ? "This section is available after unlocking the premium report."
      : input.content,
    previewTeaser,
    previewAllowed,
    premiumOnly,
    requiresUnlockedReport: premiumOnly,
    locked,
    lockedMessage: locked
      ? "This section is available after unlocking the premium report."
      : null,
    softCtaLabel: locked ? softCtaLabel : null,
    softCtaHref: locked ? softCtaHref : null,
    exportable: !locked,
    pageBreakBefore,
    className: locked
      ? "report-premium-locked report-print-card report-print-avoid-break"
      : "report-print-card report-print-avoid-break",
    printClassName: pageBreakBefore
      ? "report-print-card report-print-avoid-break report-print-page-break-before"
      : "report-print-card report-print-avoid-break",
  };
}

export function buildReportPresentationModel(foundation: ReportFoundation): ReportPresentationModel {
  const sectionBlocks = foundation.sectionPlan.map((section) =>
    buildSectionBlock({
      foundation,
      sectionKey: section.key,
      title: section.title,
      content: section.content,
    })
  );

  const previewSections = sectionBlocks.filter((block) => block.previewAllowed);
  const premiumSections = sectionBlocks.filter((block) => block.premiumOnly);
  const hiddenSections = sectionBlocks.filter((block) => block.locked);
  const exportableSections = sectionBlocks.filter((block) => block.exportable);
  const exportableSectionKeys = exportableSections.map((block) => block.sectionKey);
  const withheldSectionKeys = hiddenSections.map((block) => block.sectionKey);

  const profileSummary = foundation.contextSummary.executiveSummary;
  const leadSummary = foundation.contextSummary.chartFoundation;

  return {
    reportType: foundation.reportType,
    title: foundation.profile.title,
    cover: {
      eyebrow: "Premium Report",
      title: foundation.profile.title,
      summary: profileSummary,
      lead: leadSummary,
      badges: buildPresentationBadgeSet(foundation),
    },
    metadata: {
      accessTier: foundation.accessTier,
      unlockState: foundation.unlockState,
      previewSections: previewSections.length,
      premiumSections: premiumSections.length,
      hiddenSections: hiddenSections.length,
      hasD9: foundation.chartContext.hasD9,
      hasD10: foundation.chartContext.hasD10,
      hasDivisionalCharts: foundation.chartContext.hasDivisionalCharts,
      panchangAvailable: foundation.chartContext.panchangAvailable,
      note: foundation.contextSummary.nextStepCta,
    },
    sectionBlocks,
    print: {
      surfaceClassName: "report-print-surface",
      sectionClassName: "report-print-card report-print-avoid-break",
      pageBreakBeforeKeys: Array.from(sectionPageBreakBeforeKeys),
      avoidBreakKeys: Array.from(sectionAvoidBreakKeys),
    },
    export: {
      status: "STRUCTURE_READY",
      disclaimerIncluded: true,
      previewExportAllowed: true,
      lockedSectionsWithheld: withheldSectionKeys.length > 0,
      withheldSectionKeys,
      exportableSectionKeys,
      pdfEnginePending: true,
      pendingNote:
        "PDF export is structure-ready, but the dedicated PDF engine is still pending. Locked sections remain withheld from any preview export path.",
    },
  };
}
