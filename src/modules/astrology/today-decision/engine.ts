import {
  calculateDailyPanchangContext,
  type PanchangContextOutput,
} from "@/modules/panchang";
import { getAstrologyDisclaimer } from "@/lib/astrology/accuracy";
import type {
  TodayDecisionCategory,
  ValidatedTodayDecisionInput,
} from "@/modules/astrology/today-decision/validation";

export type TodayDecisionRating =
  | "favourable"
  | "mixed"
  | "avoid_for_now"
  | "consult_recommended";

export type TodayDecisionFailureCode =
  | "PANCHANG_CALCULATION_FAILED"
  | "MISSING_ADVANCED_TIMINGS";

export type TodayDecisionTimingBlock = {
  label: string;
  category: "supportive" | "caution";
  start_local_time: string;
  end_local_time: string;
  start_utc: string;
  end_utc: string;
  duration_minutes: number;
};

export type TodayDecisionCtaFlags = {
  consultAcharya: boolean;
  downloadReport: boolean;
  askNI: boolean;
  bookPurohit: boolean;
};

export type TodayDecisionHora = {
  available: boolean;
  current: null;
  note: string;
};

export type TodayDecisionOutput = {
  generatedAt: string;
  decisionCategory: TodayDecisionCategory;
  locale: string;
  summary: {
    date: string;
    locationLabel: string;
    timezone: string;
    latitude: number;
    longitude: number;
    sunrise: string | null;
    sunset: string | null;
  };
  panchang: {
    available: boolean;
    weekday: string;
    paksha: string;
    tithi: string;
    nakshatra: string;
    yoga: string;
    karana: string;
    moonSign: string;
    sunrise: string | null;
    sunset: string | null;
    moonrise: string | null;
    moonset: string | null;
  };
  rahuKaal: TodayDecisionTimingBlock;
  yamaganda: TodayDecisionTimingBlock;
  gulika: TodayDecisionTimingBlock;
  hora: TodayDecisionHora;
  goodTimeBlocks: TodayDecisionTimingBlock[];
  avoidTimeBlocks: TodayDecisionTimingBlock[];
  bestActionGuidance: string[];
  decisionRating: TodayDecisionRating;
  ctaFlags: TodayDecisionCtaFlags;
  disclaimer: string;
};

export type TodayDecisionResult =
  | { success: true; data: TodayDecisionOutput }
  | {
      success: false;
      error: { code: TodayDecisionFailureCode; message: string };
    };

const sensitiveCategories = new Set<TodayDecisionCategory>([
  "travel",
  "purchase",
  "business",
  "career",
  "family",
]);

const HORA_UNAVAILABLE_NOTE =
  "Hora (planetary hour) timing is not yet available in this version and is planned for a later update.";

// --- Pure decision-layer helpers (unit-testable without ephemeris) -----------

export function computeDecisionRating(input: {
  dailyTone: string;
  category: TodayDecisionCategory;
}): TodayDecisionRating {
  const tone = input.dailyTone.trim().toLowerCase();

  if (tone === "supportive") {
    return "favourable";
  }

  if (tone === "balanced") {
    return "mixed";
  }

  // Reflective / caution-leaning day.
  if (sensitiveCategories.has(input.category)) {
    return "consult_recommended";
  }

  return "avoid_for_now";
}

export function computeCtaFlags(input: {
  rating: TodayDecisionRating;
  category: TodayDecisionCategory;
}): TodayDecisionCtaFlags {
  const cautious =
    input.rating === "avoid_for_now" || input.rating === "consult_recommended";
  const sensitive = sensitiveCategories.has(input.category);

  return {
    consultAcharya: cautious || sensitive,
    downloadReport: sensitive,
    askNI: true,
    bookPurohit: input.category === "puja" || input.rating === "consult_recommended",
  };
}

export function getCategoryDisplayLabel(category: TodayDecisionCategory) {
  switch (category) {
    case "travel":
      return "travel planning";
    case "purchase":
      return "a purchase decision";
    case "business":
      return "a business action";
    case "career":
      return "a career step";
    case "family":
      return "a family matter";
    case "puja":
      return "a puja or spiritual observance";
    default:
      return "general daily planning";
  }
}

export function buildBestActionGuidance(input: {
  category: TodayDecisionCategory;
  rating: TodayDecisionRating;
  goodBlockLabels: string[];
  avoidBlockLabels: string[];
}): string[] {
  const categoryLabel = getCategoryDisplayLabel(input.category);
  const guidance: string[] = [];

  if (input.rating === "favourable") {
    guidance.push(
      `Traditional timing guidance suggests today is generally supportive for ${categoryLabel}.`
    );
  } else if (input.rating === "mixed") {
    guidance.push(
      `Traditional timing guidance indicates a balanced day for ${categoryLabel}; steady, unhurried steps are suggested.`
    );
  } else if (input.rating === "consult_recommended") {
    guidance.push(
      `For ${categoryLabel}, today may indicate a more reflective phase. Consulting an Acharya is suggested before an important decision.`
    );
  } else {
    guidance.push(
      `For ${categoryLabel}, today may indicate a reflective phase; it is often better to avoid for now and revisit later.`
    );
  }

  if (input.goodBlockLabels.length > 0) {
    guidance.push(
      `Suggested supportive windows for planning: ${input.goodBlockLabels.join("; ")}.`
    );
  }

  if (input.avoidBlockLabels.length > 0) {
    guidance.push(
      `Planning caution windows to keep in mind: ${input.avoidBlockLabels.join("; ")}.`
    );
  }

  guidance.push(
    "These are traditional timing references offered for guidance only, not fixed predictions."
  );

  return guidance;
}

export function buildTodayDecisionDisclaimer(locale: string): string {
  const base = getAstrologyDisclaimer(locale);

  return `${base} For important decisions, please consult a qualified Acharya and relevant professional advisor where required.`;
}

// --- Panchang -> Today Decision assembly -------------------------------------

function toTimingBlock(
  label: string,
  category: "supportive" | "caution",
  window: PanchangContextOutput["advanced_timings"]["rahu_kaal"]
): TodayDecisionTimingBlock {
  return {
    label: `${label}: ${window.start_local_time} - ${window.end_local_time}`,
    category,
    start_local_time: window.start_local_time,
    end_local_time: window.end_local_time,
    start_utc: window.start_utc,
    end_utc: window.end_utc,
    duration_minutes: window.duration_minutes,
  };
}

export function buildTodayDecisionFromPanchang(input: {
  panchang: PanchangContextOutput;
  category: TodayDecisionCategory;
  locale: string;
  locationLabel: string;
  latitude: number;
  longitude: number;
}): TodayDecisionOutput {
  const p = input.panchang;
  const advanced = p.advanced_timings;

  const rahuKaal = toTimingBlock("Rahu Kaal", "caution", advanced.rahu_kaal);
  const gulika = toTimingBlock("Gulika Kaal", "caution", advanced.gulika_kaal);
  const yamaganda = toTimingBlock("Yamaganda", "caution", advanced.yamaganda);
  const abhijit = toTimingBlock(
    "Abhijit Muhurta",
    "supportive",
    advanced.abhijit_muhurta
  );
  const brahma = advanced.brahma_muhurta
    ? toTimingBlock("Brahma Muhurta", "supportive", advanced.brahma_muhurta)
    : null;

  const goodTimeBlocks = [abhijit, ...(brahma ? [brahma] : [])];
  const avoidTimeBlocks = [rahuKaal, gulika, yamaganda];

  const rating = computeDecisionRating({
    dailyTone: p.dailyTone,
    category: input.category,
  });
  const ctaFlags = computeCtaFlags({ rating, category: input.category });
  const bestActionGuidance = buildBestActionGuidance({
    category: input.category,
    rating,
    goodBlockLabels: goodTimeBlocks.map((block) => block.label),
    avoidBlockLabels: avoidTimeBlocks.map((block) => block.label),
  });

  return {
    generatedAt: new Date().toISOString(),
    decisionCategory: input.category,
    locale: input.locale,
    summary: {
      date: p.panchangDate,
      locationLabel: input.locationLabel,
      timezone: p.timezone,
      latitude: input.latitude,
      longitude: input.longitude,
      sunrise: p.sunrise?.local_time ?? null,
      sunset: p.sunset?.local_time ?? null,
    },
    panchang: {
      available: true,
      weekday: p.weekday,
      paksha: p.paksha,
      tithi: p.tithi.name,
      nakshatra: p.nakshatra.name,
      yoga: p.yoga.name,
      karana: p.karana.name,
      moonSign: p.moon_sign,
      sunrise: p.sunrise?.local_time ?? null,
      sunset: p.sunset?.local_time ?? null,
      moonrise: p.moonrise?.local_time ?? null,
      moonset: p.moonset?.local_time ?? null,
    },
    rahuKaal,
    yamaganda,
    gulika,
    hora: {
      available: false,
      current: null,
      note: HORA_UNAVAILABLE_NOTE,
    },
    goodTimeBlocks,
    avoidTimeBlocks,
    bestActionGuidance,
    decisionRating: rating,
    ctaFlags,
    disclaimer: buildTodayDecisionDisclaimer(input.locale),
  };
}

export function buildTodayDecisionContext(
  input: ValidatedTodayDecisionInput
): TodayDecisionResult {
  const panchang = calculateDailyPanchangContext({
    dateLocal: input.dateLocal,
    location: {
      displayName: input.locationLabel,
      latitude: input.latitude,
      longitude: input.longitude,
      timezoneIana: input.timezone,
    },
  });

  if (!panchang.success) {
    return {
      success: false,
      error: {
        code: "PANCHANG_CALCULATION_FAILED",
        message: panchang.error.message,
      },
    };
  }

  if (!panchang.data.advanced_timings) {
    return {
      success: false,
      error: {
        code: "MISSING_ADVANCED_TIMINGS",
        message:
          "Daily timing windows are unavailable for this date and location.",
      },
    };
  }

  return {
    success: true,
    data: buildTodayDecisionFromPanchang({
      panchang: panchang.data,
      category: input.category,
      locale: input.locale,
      locationLabel: input.locationLabel,
      latitude: input.latitude,
      longitude: input.longitude,
    }),
  };
}
