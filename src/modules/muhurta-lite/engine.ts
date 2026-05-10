import {
  calculateDailyPanchangContext,
  type PanchangInput,
  type PanchangLocationInput,
} from "@/modules/panchang";

type MuhurtaLiteFailureCode =
  | "PANCHANG_CALCULATION_FAILED"
  | "MISSING_ADVANCED_TIMINGS";

export type MuhurtaLiteActivityType =
  | "general_daily_activity"
  | "spiritual_practice"
  | "business_work_start"
  | "travel_readiness"
  | "vehicle_purchase_readiness"
  | "griha_pravesh_readiness"
  | "naming_ceremony_readiness"
  | "marriage_readiness_placeholder";

export type MuhurtaLiteRating = "auspicious" | "moderate" | "caution" | "unavailable";

type MuhurtaLiteTimingWindow = {
  label: string;
  category: "supportive" | "caution";
  start_utc: string;
  end_utc: string;
  start_local_time: string;
  end_local_time: string;
  start_local_date_time: string;
  end_local_date_time: string;
  duration_minutes: number;
};

export type MuhurtaLiteInput = {
  dateLocal: string;
  location: PanchangLocationInput;
  activityType?: MuhurtaLiteActivityType | string | null;
};

export type MuhurtaLiteOutput = {
  as_of_date: string;
  as_of_utc: string;
  muhuratDate: string;
  generatedAt: string;
  location: {
    display_name: string;
    latitude: number;
    longitude: number;
    timezone_iana: string;
    country_code: string | null;
    country_name: string | null;
    region: string | null;
    city: string | null;
  };
  locationLabel: string;
  timezone: string;
  sunrise: {
    local_time: string;
    utc: string;
  };
  sunset: {
    local_time: string;
    utc: string;
  };
  moonrise: {
    local_time: string;
    utc: string;
  } | null;
  moonset: {
    local_time: string;
    utc: string;
  } | null;
  rahu_kaal: MuhurtaLiteTimingWindow;
  gulika_kaal: MuhurtaLiteTimingWindow;
  yamaganda: MuhurtaLiteTimingWindow;
  abhijit_muhurta: MuhurtaLiteTimingWindow;
  brahma_muhurta: MuhurtaLiteTimingWindow | null;
  activityType: MuhurtaLiteActivityType;
  rating: MuhurtaLiteRating;
  goodWindows: string[];
  cautionWindows: string[];
  avoidWindows: string[];
  basis: string[];
  panchangFactors: string[];
  safeSummary: string;
  missingReason: string | null;
  summary: {
    caution_windows: string[];
    supportive_windows: string[];
    caution_time_blocks: string[];
    better_time_blocks: string[];
    daily_timing_notes: string[];
  };
};

export type MuhurtaLiteFailure = {
  success: false;
  missingReason: string;
  error: {
    code: MuhurtaLiteFailureCode;
    message: string;
  };
};

export type MuhurtaLiteSuccess = {
  success: true;
  data: MuhurtaLiteOutput;
};

export type MuhurtaLiteResult = MuhurtaLiteFailure | MuhurtaLiteSuccess;

function fail(
  code: MuhurtaLiteFailureCode,
  message: string
): MuhurtaLiteFailure {
  return {
    success: false,
    missingReason: message,
    error: {
      code,
      message,
    },
  };
}

function toTimingLabel(title: string, start: string, end: string) {
  return `${title}: ${start} - ${end}`;
}

function mapTimingWindow(
  title: string,
  category: "supportive" | "caution",
  value: {
    start_utc: string;
    end_utc: string;
    start_local_time: string;
    end_local_time: string;
    start_local_date_time: string;
    end_local_date_time: string;
    duration_minutes: number;
  }
): MuhurtaLiteTimingWindow {
  return {
    label: toTimingLabel(title, value.start_local_time, value.end_local_time),
    category,
    start_utc: value.start_utc,
    end_utc: value.end_utc,
    start_local_time: value.start_local_time,
    end_local_time: value.end_local_time,
    start_local_date_time: value.start_local_date_time,
    end_local_date_time: value.end_local_date_time,
    duration_minutes: value.duration_minutes,
  };
}

function normalizeActivityType(
  activityType: MuhurtaLiteInput["activityType"]
): MuhurtaLiteActivityType {
  const normalized = typeof activityType === "string" ? activityType.trim() : "";

  switch (normalized) {
    case "spiritual_practice":
    case "business_work_start":
    case "travel_readiness":
    case "vehicle_purchase_readiness":
    case "griha_pravesh_readiness":
    case "naming_ceremony_readiness":
    case "marriage_readiness_placeholder":
      return normalized;
    default:
      return "general_daily_activity";
  }
}

function getActivityDisplayLabel(activityType: MuhurtaLiteActivityType) {
  switch (activityType) {
    case "spiritual_practice":
      return "Spiritual practice timing";
    case "business_work_start":
      return "Business/work start readiness";
    case "travel_readiness":
      return "Travel readiness";
    case "vehicle_purchase_readiness":
      return "Vehicle purchase readiness";
    case "griha_pravesh_readiness":
      return "Griha Pravesh readiness";
    case "naming_ceremony_readiness":
      return "Naming ceremony readiness";
    case "marriage_readiness_placeholder":
      return "Marriage readiness placeholder";
    default:
      return "General daily activity timing";
  }
}

function buildPanchangFactors(input: {
  panchangDate: string;
  weekday: string;
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  sunrise: string;
  sunset: string;
}) {
  return [
    `Date: ${input.panchangDate}`,
    `Weekday: ${input.weekday}`,
    `Tithi: ${input.tithi}`,
    `Nakshatra: ${input.nakshatra}`,
    `Yoga: ${input.yoga}`,
    `Karana: ${input.karana}`,
    `Sunrise: ${input.sunrise}`,
    `Sunset: ${input.sunset}`,
  ];
}

function buildTimingBasedAnalysis(input: {
  activityType: MuhurtaLiteActivityType;
  dailyTone: string;
  guidanceDailyQuality: string;
  goodWindows: string[];
  cautionWindows: string[];
  brahmaMuhurta: MuhurtaLiteTimingWindow | null;
  abhijitMuhurta: MuhurtaLiteTimingWindow;
}) {
  let score = 0;

  if (input.dailyTone === "Supportive") {
    score += 2;
  } else if (input.dailyTone === "Balanced") {
    score += 1;
  } else {
    score -= 1;
  }

  if (input.goodWindows.length > 0) {
    score += 1;
  }

  if (input.activityType === "spiritual_practice" && input.brahmaMuhurta) {
    score += 1;
  }

  if (input.activityType === "general_daily_activity" && input.abhijitMuhurta) {
    score += 1;
  }

  if (
    input.activityType === "marriage_readiness_placeholder" ||
    input.activityType === "griha_pravesh_readiness" ||
    input.activityType === "naming_ceremony_readiness"
  ) {
    score = Math.min(score, 2);
  }

  const rating: MuhurtaLiteRating =
    score >= 4 ? "auspicious" : score >= 1 ? "moderate" : "caution";

  const basis = [
    input.guidanceDailyQuality,
    `Activity lens: ${getActivityDisplayLabel(input.activityType)}.`,
    `Support windows available: ${input.goodWindows.length}.`,
    `Planning caution windows available: ${input.cautionWindows.length}.`,
    input.brahmaMuhurta
      ? "Brahma Muhurta is available as a supportive planning reference."
      : "Brahma Muhurta is unavailable for this place/date combination.",
    "Rahu Kaal, Gulika Kaal, and Yamaganda are planning caution references, not danger indicators.",
  ];

  const safeSummary =
    input.activityType === "marriage_readiness_placeholder"
      ? "Marriage readiness is shown as a cautious planning placeholder until fuller classical rules are added."
      : input.activityType === "griha_pravesh_readiness"
        ? "Griha Pravesh readiness is shown as a planning reference, not a guaranteed muhurat."
        : input.activityType === "naming_ceremony_readiness"
          ? "Naming ceremony readiness is shown as a planning reference, not a guaranteed muhurat."
          : input.activityType === "travel_readiness"
            ? "Travel readiness is shown as a practical planning reference with caution windows included."
            : input.activityType === "vehicle_purchase_readiness"
              ? "Vehicle purchase readiness is shown as a practical planning reference."
              : input.activityType === "business_work_start"
                ? "Business/work start readiness is shown as a practical planning reference."
                : input.activityType === "spiritual_practice"
                  ? "Spiritual practice timing emphasizes calm, disciplined follow-through."
                  : "General daily activity timing emphasizes practical pacing and measured decisions.";

  return {
    rating,
    basis,
    safeSummary,
  };
}

function buildAvailabilityWindows(input: {
  activityType: MuhurtaLiteActivityType;
  supportWindows: string[];
  cautionWindows: string[];
}) {
  const goodWindows = [...input.supportWindows];
  const cautionWindows = [...input.cautionWindows];
  const avoidWindows = [...input.cautionWindows];

  if (input.activityType === "travel_readiness") {
    avoidWindows.unshift("Avoid starting travel during planning caution windows.");
  }

  if (
    input.activityType === "marriage_readiness_placeholder" ||
    input.activityType === "griha_pravesh_readiness" ||
    input.activityType === "naming_ceremony_readiness"
  ) {
    avoidWindows.unshift("Readiness-level placeholder only; exact classical muhurat rules are pending.");
  }

  return {
    goodWindows,
    cautionWindows,
    avoidWindows,
  };
}

export function calculateMuhurtaLiteContext(
  input: MuhurtaLiteInput
): MuhurtaLiteResult {
  const panchang = calculateDailyPanchangContext(input as PanchangInput);

  if (!panchang.success) {
    return fail("PANCHANG_CALCULATION_FAILED", panchang.error.message);
  }

  const advanced = panchang.data.advanced_timings;

  if (!advanced) {
    return fail(
      "MISSING_ADVANCED_TIMINGS",
      "Muhurta-lite timing windows are unavailable for this date and place."
    );
  }

  const rahuKaal = mapTimingWindow("Rahu Kaal", "caution", advanced.rahu_kaal);
  const gulikaKaal = mapTimingWindow(
    "Gulika Kaal",
    "caution",
    advanced.gulika_kaal
  );
  const yamaganda = mapTimingWindow(
    "Yamaganda",
    "caution",
    advanced.yamaganda
  );
  const abhijitMuhurta = mapTimingWindow(
    "Abhijit Muhurta",
    "supportive",
    advanced.abhijit_muhurta
  );
  const brahmaMuhurta = advanced.brahma_muhurta
    ? mapTimingWindow("Brahma Muhurta", "supportive", advanced.brahma_muhurta)
    : null;
  const activityType = normalizeActivityType(input.activityType);
  const availability = buildAvailabilityWindows({
    activityType,
    supportWindows: [...advanced.timing_summary.auspicious_windows],
    cautionWindows: [...advanced.timing_summary.caution_windows],
  });
  const analysis = buildTimingBasedAnalysis({
    activityType,
    dailyTone: panchang.data.dailyTone,
    guidanceDailyQuality: panchang.data.guidance.daily_quality,
    goodWindows: availability.goodWindows,
    cautionWindows: availability.cautionWindows,
    brahmaMuhurta,
    abhijitMuhurta,
  });
  const panchangFactors = buildPanchangFactors({
    panchangDate: panchang.data.panchangDate,
    weekday: panchang.data.weekday,
    tithi: panchang.data.tithi.name,
    nakshatra: panchang.data.nakshatra.name,
    yoga: panchang.data.yoga.name,
    karana: panchang.data.karana.name,
    sunrise: panchang.data.sunrise.local_time,
    sunset: panchang.data.sunset.local_time,
  });

  const cautionTimeBlocks = [rahuKaal.label, gulikaKaal.label, yamaganda.label];
  const betterTimeBlocks = [abhijitMuhurta.label];

  return {
    success: true,
    data: {
      as_of_date: panchang.data.as_of_date,
      as_of_utc: panchang.data.as_of_utc,
      muhuratDate: panchang.data.panchangDate,
      generatedAt: panchang.data.generatedAt,
      location: panchang.data.location,
      locationLabel: panchang.data.locationLabel,
      timezone: panchang.data.timezone,
      sunrise: panchang.data.sunrise,
      sunset: panchang.data.sunset,
      moonrise: panchang.data.moonrise,
      moonset: panchang.data.moonset,
      rahu_kaal: rahuKaal,
      gulika_kaal: gulikaKaal,
      yamaganda,
      abhijit_muhurta: abhijitMuhurta,
      brahma_muhurta: brahmaMuhurta,
      activityType,
      rating: analysis.rating,
      goodWindows: availability.goodWindows,
      cautionWindows: availability.cautionWindows,
      avoidWindows: availability.avoidWindows,
      basis: analysis.basis,
      panchangFactors,
      safeSummary: analysis.safeSummary,
      missingReason: null,
      summary: {
        caution_windows: [...advanced.timing_summary.caution_windows],
        supportive_windows: [...advanced.timing_summary.auspicious_windows],
        caution_time_blocks: cautionTimeBlocks,
        better_time_blocks: betterTimeBlocks,
        daily_timing_notes: [
          `Activity type: ${getActivityDisplayLabel(activityType)}.`,
          `Day feel: ${panchang.data.dailyTone}. ${panchang.data.guidance.daily_quality}`,
          analysis.safeSummary,
          "Use caution windows as planning references, not absolute restrictions.",
        ],
      },
    },
  };
}
