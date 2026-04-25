import {
  calculateDailyPanchangContext,
  type PanchangInput,
  type PanchangLocationInput,
} from "@/modules/panchang";

type MuhurtaLiteFailureCode =
  | "PANCHANG_CALCULATION_FAILED"
  | "MISSING_ADVANCED_TIMINGS";

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
};

export type MuhurtaLiteOutput = {
  as_of_date: string;
  as_of_utc: string;
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
  sunrise: {
    local_time: string;
    utc: string;
  };
  sunset: {
    local_time: string;
    utc: string;
  };
  rahu_kaal: MuhurtaLiteTimingWindow;
  gulika_kaal: MuhurtaLiteTimingWindow;
  yamaganda: MuhurtaLiteTimingWindow;
  abhijit_muhurta: MuhurtaLiteTimingWindow;
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

  const cautionTimeBlocks = [rahuKaal.label, gulikaKaal.label, yamaganda.label];
  const betterTimeBlocks = [abhijitMuhurta.label];

  return {
    success: true,
    data: {
      as_of_date: panchang.data.as_of_date,
      as_of_utc: panchang.data.as_of_utc,
      location: panchang.data.location,
      sunrise: panchang.data.sunrise,
      sunset: panchang.data.sunset,
      rahu_kaal: rahuKaal,
      gulika_kaal: gulikaKaal,
      yamaganda,
      abhijit_muhurta: abhijitMuhurta,
      summary: {
        caution_windows: [...advanced.timing_summary.caution_windows],
        supportive_windows: [...advanced.timing_summary.auspicious_windows],
        caution_time_blocks: cautionTimeBlocks,
        better_time_blocks: betterTimeBlocks,
        daily_timing_notes: [
          `Day feel: ${panchang.data.guidance.day_feel}. ${panchang.data.guidance.daily_quality}`,
          "Use caution windows as planning references, not absolute restrictions.",
          "For major decisions, combine time windows with Kundli and chart-aware guidance.",
        ],
      },
    },
  };
}

