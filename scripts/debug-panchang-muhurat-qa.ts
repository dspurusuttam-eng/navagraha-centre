import { calculateDailyPanchangContext } from "@/modules/panchang";
import { calculateMuhurtaLiteContext } from "@/modules/muhurta-lite";

type PanchangCase = {
  name: string;
  status: "ready" | "unavailable";
  missingReason: string | null;
  dailyTone: string | null;
  locationLabel: string | null;
  timezone: string | null;
  hasMoonrise: boolean;
  hasMoonset: boolean;
  hasTimingWindows: boolean;
};

type MuhurtaCase = {
  name: string;
  status: "ready" | "unavailable";
  activityType: string | null;
  rating: string | null;
  goodWindows: number;
  cautionWindows: number;
  avoidWindows: number;
  missingReason: string | null;
};

function buildPanchangInput(dateLocal: string, displayName: string, timezoneIana: string) {
  return {
    dateLocal,
    location: {
      displayName,
      latitude: 26.1445,
      longitude: 91.7362,
      timezoneIana,
      city: "Guwahati",
      region: "Assam",
      countryName: "India",
      countryCode: "IN",
    },
  };
}

function summarizePanchang(
  name: string,
  result: ReturnType<typeof calculateDailyPanchangContext>
): PanchangCase {
  if (!result.success) {
    return {
      name,
      status: "unavailable",
      missingReason: result.missingReason ?? result.error.message,
      dailyTone: null,
      locationLabel: null,
      timezone: null,
      hasMoonrise: false,
      hasMoonset: false,
      hasTimingWindows: false,
    };
  }

  return {
    name,
    status: "ready",
    missingReason: result.data.missingReason,
    dailyTone: result.data.dailyTone,
    locationLabel: result.data.locationLabel,
    timezone: result.data.timezone,
    hasMoonrise: Boolean(result.data.moonrise),
    hasMoonset: Boolean(result.data.moonset),
    hasTimingWindows: Boolean(result.data.timingWindows),
  };
}

function summarizeMuhurta(
  name: string,
  result: ReturnType<typeof calculateMuhurtaLiteContext>
): MuhurtaCase {
  if (!result.success) {
    return {
      name,
      status: "unavailable",
      activityType: null,
      rating: null,
      goodWindows: 0,
      cautionWindows: 0,
      avoidWindows: 0,
      missingReason: result.missingReason ?? result.error.message,
    };
  }

  return {
    name,
    status: "ready",
    activityType: result.data.activityType,
    rating: result.data.rating,
    goodWindows: result.data.goodWindows.length,
    cautionWindows: result.data.cautionWindows.length,
    avoidWindows: result.data.avoidWindows.length,
    missingReason: result.data.missingReason,
  };
}

function main() {
  const panchangCases = [
    summarizePanchang(
      "today-guwahati",
      calculateDailyPanchangContext(buildPanchangInput("2026-05-10", "Guwahati, Assam, India", "Asia/Kolkata"))
    ),
    summarizePanchang(
      "invalid-date",
      calculateDailyPanchangContext(buildPanchangInput("2026-02-30", "Guwahati, Assam, India", "Asia/Kolkata"))
    ),
    summarizePanchang(
      "invalid-timezone",
      calculateDailyPanchangContext(buildPanchangInput("2026-05-10", "Guwahati, Assam, India", "Invalid/Timezone"))
    ),
  ];

  const muhurtaCases = [
    summarizeMuhurta(
      "general",
      calculateMuhurtaLiteContext({
        dateLocal: "2026-05-10",
        activityType: "general_daily_activity",
        location: buildPanchangInput("2026-05-10", "Guwahati, Assam, India", "Asia/Kolkata").location,
      })
    ),
    summarizeMuhurta(
      "business",
      calculateMuhurtaLiteContext({
        dateLocal: "2026-05-10",
        activityType: "business_work_start",
        location: buildPanchangInput("2026-05-10", "Guwahati, Assam, India", "Asia/Kolkata").location,
      })
    ),
    summarizeMuhurta(
      "invalid-location",
      calculateMuhurtaLiteContext({
        dateLocal: "2026-05-10",
        activityType: "general_daily_activity",
        location: {
          displayName: "",
          latitude: Number.NaN,
          longitude: Number.NaN,
          timezoneIana: "Invalid/Timezone",
        } as never,
      })
    ),
  ];

  console.log(JSON.stringify({ panchangCases, muhurtaCases }, null, 2));
}

main();
