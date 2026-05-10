import { calculateMuhurtaLiteContext, type MuhurtaLiteActivityType } from "@/modules/muhurta-lite";

type QaCaseResult = {
  name: string;
  status: "ready" | "unavailable";
  activityType: MuhurtaLiteActivityType | null;
  rating: string | null;
  goodWindows: number;
  cautionWindows: number;
  avoidWindows: number;
  missingReason: string | null;
  safeSummary: string | null;
  locationLabel: string | null;
  timezone: string | null;
};

function buildInput(activityType: MuhurtaLiteActivityType | string | null) {
  return {
    dateLocal: "2026-05-10",
    activityType,
    location: {
      displayName: "Guwahati, Assam, India",
      latitude: 26.1445,
      longitude: 91.7362,
      timezoneIana: "Asia/Kolkata",
      city: "Guwahati",
      region: "Assam",
      countryName: "India",
      countryCode: "IN",
    },
  };
}

function summarizeCase(
  name: string,
  result: ReturnType<typeof calculateMuhurtaLiteContext>
): QaCaseResult {
  if (!result.success) {
    return {
      name,
      status: "unavailable",
      activityType: null,
      rating: "unavailable",
      goodWindows: 0,
      cautionWindows: 0,
      avoidWindows: 0,
      missingReason: result.missingReason ?? result.error.message,
      safeSummary: null,
      locationLabel: null,
      timezone: null,
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
    safeSummary: result.data.safeSummary,
    locationLabel: result.data.locationLabel,
    timezone: result.data.timezone,
  };
}

function main() {
  const cases = [
    summarizeCase("general", calculateMuhurtaLiteContext(buildInput("general_daily_activity"))),
    summarizeCase("spiritual", calculateMuhurtaLiteContext(buildInput("spiritual_practice"))),
    summarizeCase("business", calculateMuhurtaLiteContext(buildInput("business_work_start"))),
    summarizeCase("travel", calculateMuhurtaLiteContext(buildInput("travel_readiness"))),
    summarizeCase("marriage-placeholder", calculateMuhurtaLiteContext(buildInput("marriage_readiness_placeholder"))),
    summarizeCase(
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

  console.log(JSON.stringify({ cases }, null, 2));
}

main();
