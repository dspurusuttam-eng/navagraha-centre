// Card 8B — Premium Daily Horoscope engine orchestrator.
//
// Pure over the resolved chart context. Builds the versioned snapshot: general
// day quality + the 7 locked categories + Panchang time windows. Consumes Cards
// 2/4/5/6/7 outputs via the adapter; never recomputes their math; honest
// unavailable/partial states; no interpretation prose, no persistence.

import {
  buildHoroscopeChartContext,
  type BuildHoroscopeChartContextInput,
  type HoroscopeChartContext,
} from "@/modules/astrology/horoscope/context";
import { evaluateCategory } from "@/modules/astrology/horoscope/aggregate";
import {
  HOROSCOPE_CATEGORY_KEYS,
  HOROSCOPE_CONTRACT_VERSION,
  HOROSCOPE_CONVENTIONS,
  HOROSCOPE_DISCLAIMER,
  type ConfidenceLevel,
  type DailyHoroscopeSnapshot,
  type HoroscopeCategoryResult,
  type HoroscopeTimeWindow,
} from "@/modules/astrology/horoscope/types";

type PanchangWindow = {
  start_local_time: string;
  end_local_time: string;
  start_utc: string;
  end_utc: string;
};

function toWindow(
  label: string,
  kind: "supportive" | "caution",
  window: PanchangWindow | null | undefined
): HoroscopeTimeWindow | null {
  if (!window) {
    return null;
  }

  return {
    label,
    kind,
    startLocal: window.start_local_time,
    endLocal: window.end_local_time,
    startUtc: window.start_utc,
    endUtc: window.end_utc,
  };
}

function buildTimeWindows(ctx: HoroscopeChartContext): HoroscopeTimeWindow[] {
  if (!ctx.panchang.ready) {
    return [];
  }

  const advanced = ctx.panchang.data.advanced_timings;
  const windows: Array<HoroscopeTimeWindow | null> = [
    toWindow("Abhijit Muhurta", "supportive", advanced.abhijit_muhurta),
    toWindow("Brahma Muhurta", "supportive", advanced.brahma_muhurta),
    toWindow("Rahu Kaal", "caution", advanced.rahu_kaal),
    toWindow("Gulika Kaal", "caution", advanced.gulika_kaal),
    toWindow("Yamaganda", "caution", advanced.yamaganda),
  ];

  return windows.filter((window): window is HoroscopeTimeWindow => window !== null);
}

function levelFromValue(value: number): ConfidenceLevel | "insufficient" {
  if (value < 0.4) return "insufficient";
  if (value >= 0.85) return "high";
  if (value >= 0.6) return "moderate";
  return "low";
}

export function buildDailyHoroscopeSnapshot(
  input: BuildHoroscopeChartContextInput
): DailyHoroscopeSnapshot {
  const ctx = buildHoroscopeChartContext(input);

  const categories: HoroscopeCategoryResult[] = HOROSCOPE_CATEGORY_KEYS.map((category) =>
    evaluateCategory(ctx, category)
  );
  const generalDayQuality =
    categories.find((category) => category.category === "general_day_quality") ?? null;

  const availableCategories = categories.filter((category) => category.status === "available");
  const timeWindows = buildTimeWindows(ctx);

  // --- Overall status --------------------------------------------------------
  let status: DailyHoroscopeSnapshot["status"];

  if (ctx.chartContextStatus !== "verified" || availableCategories.length === 0) {
    status = "unavailable";
  } else if (availableCategories.length === categories.length) {
    status = "ok";
  } else {
    status = "partial";
  }

  // --- Overall confidence (mean of available categories) ---------------------
  const overallValue =
    availableCategories.length === 0
      ? 0
      : Number(
          (
            availableCategories.reduce((sum, category) => sum + category.confidence.value, 0) /
            availableCategories.length
          ).toFixed(4)
        );
  const overallLevel = availableCategories.length === 0 ? "insufficient" : levelFromValue(overallValue);

  // --- Dasha + Sade Sati context ---------------------------------------------
  const dashaContext = ctx.dasha.ready
    ? {
        mahadasha: ctx.dasha.data.mahadasha.planet,
        antardasha: ctx.dasha.data.antardasha.planet,
        pratyantardasha: ctx.dasha.data.pratyantardasha.planet,
        sookshma: ctx.dasha.data.sookshma.planet,
        prana: ctx.dasha.data.prana.planet,
        lineagePath: ctx.dasha.data.prana.lineagePath,
      }
    : null;

  const sadeSati = ctx.gochar.ready
    ? {
        active: ctx.gochar.data.sadeSati.active,
        phase: ctx.gochar.data.sadeSati.phase,
        saturnHouseFromMoon: ctx.gochar.data.sadeSati.saturnHouseFromMoon,
        saturnAffliction: ctx.gochar.data.saturnAffliction,
      }
    : null;

  // --- Calculation references (deduped) --------------------------------------
  const calculationReferences = [
    ...new Set([
      ...Object.values(ctx.provenance),
      ...categories.flatMap((category) => category.calculationReferences),
    ]),
  ];

  const anyContradiction = categories.some((category) => category.contradictionFlags.length > 0);
  const degradedConfidence =
    status === "partial" ||
    availableCategories.some((category) => category.confidence.level === "low");

  return {
    status,
    contractVersion: HOROSCOPE_CONTRACT_VERSION,
    periodType: "DAILY",
    queryInstant: ctx.queryInstant,
    timezone: ctx.timezone,
    localDate: ctx.localDate,
    conventions: HOROSCOPE_CONVENTIONS,
    sourceSystems: ctx.sourceSystems,
    chartContextStatus: ctx.chartContextStatus,
    dashaContext,
    sadeSati,
    generalDayQuality,
    categories,
    timeWindows,
    confidence: {
      level: overallLevel,
      value: overallValue,
    },
    unavailableReasons: ctx.unavailableReasons,
    calculationReferences,
    flags: {
      dayInstantFallback: ctx.dayInstantFallback,
      anyContradiction,
      degradedConfidence,
      ephemerisBackedLayersAvailable: ctx.gochar.ready && ctx.panchang.ready,
    },
    disclaimer: HOROSCOPE_DISCLAIMER,
  };
}
