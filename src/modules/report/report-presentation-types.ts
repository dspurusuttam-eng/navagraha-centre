import type { ReportAccessTier, ReportSectionKey, ReportUnlockState } from "@/modules/report/report-foundation";

export type ReportPresentationSlot =
  | "cover-header"
  | "metadata-block"
  | "executive-summary-card"
  | "section-card"
  | "timing-table"
  | "transit-insight-block"
  | "yoga-rule-signal-block"
  | "house-analysis-block"
  | "practical-guidance-block"
  | "remedy-block"
  | "disclaimer-block"
  | "premium-locked-section-block"
  | "cta-block";

export type ReportPresentationBadge = {
  label: string;
  value: string;
};

export type ReportPresentationBlock = {
  id: string;
  sectionKey: ReportSectionKey;
  slot: ReportPresentationSlot;
  title: string;
  content: string;
  previewTeaser: string | null;
  previewAllowed: boolean;
  premiumOnly: boolean;
  requiresUnlockedReport: boolean;
  locked: boolean;
  lockedMessage: string | null;
  softCtaLabel: string | null;
  softCtaHref: string | null;
  exportable: boolean;
  pageBreakBefore: boolean;
  className: string;
  printClassName: string;
};

export type ReportPresentationModel = {
  reportType: string;
  title: string;
  cover: {
    eyebrow: string;
    title: string;
    summary: string;
    lead: string;
    badges: ReportPresentationBadge[];
  };
  metadata: {
    accessTier: ReportAccessTier;
    unlockState: ReportUnlockState;
    previewSections: number;
    premiumSections: number;
    hiddenSections: number;
    hasD9: boolean;
    hasD10: boolean;
    hasDivisionalCharts: boolean;
    panchangAvailable: boolean;
    note: string;
  };
  sectionBlocks: ReportPresentationBlock[];
  print: {
    surfaceClassName: string;
    sectionClassName: string;
    pageBreakBeforeKeys: ReportSectionKey[];
    avoidBreakKeys: ReportSectionKey[];
  };
  export: {
    status: "STRUCTURE_READY";
    disclaimerIncluded: boolean;
    previewExportAllowed: boolean;
    lockedSectionsWithheld: boolean;
    withheldSectionKeys: ReportSectionKey[];
    exportableSectionKeys: ReportSectionKey[];
    pdfEnginePending: boolean;
    pendingNote: string;
  };
};
