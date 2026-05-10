import { calculateDailyPanchangContext } from "@/modules/panchang";

type PanchangQaResult = {
  name: string;
  status: "ready" | "unavailable";
  missingReason: string | null;
  panchangDate: string | null;
  locationLabel: string | null;
  timezone: string | null;
  weekday: string | null;
  dailyTone: string | null;
  moonriseAvailable: boolean;
  moonsetAvailable: boolean;
  timingWindowsAvailable: boolean;
  regionalReady: boolean;
};

function summarizeCase(
  name: string,
  result: ReturnType<typeof calculateDailyPanchangContext>
): PanchangQaResult {
  if (!result.success) {
    return {
      name,
      status: "unavailable",
      missingReason: result.missingReason ?? result.error.message,
      panchangDate: null,
      locationLabel: null,
      timezone: null,
      weekday: null,
      dailyTone: null,
      moonriseAvailable: false,
      moonsetAvailable: false,
      timingWindowsAvailable: false,
      regionalReady: false,
    };
  }

  return {
    name,
    status: "ready",
    missingReason: result.data.missingReason,
    panchangDate: result.data.panchangDate,
    locationLabel: result.data.locationLabel,
    timezone: result.data.timezone,
    weekday: result.data.weekday,
    dailyTone: result.data.dailyTone,
    moonriseAvailable: Boolean(result.data.moonrise),
    moonsetAvailable: Boolean(result.data.moonset),
    timingWindowsAvailable: Boolean(result.data.timingWindows),
    regionalReady: result.data.regional.assamReady && result.data.regional.indiaReady,
  };
}

function buildInput(input: {
  dateLocal: string;
  displayName: string;
  latitude: number;
  longitude: number;
  timezoneIana: string;
  city: string;
}) {
  return {
    dateLocal: input.dateLocal,
    location: {
      displayName: input.displayName,
      latitude: input.latitude,
      longitude: input.longitude,
      timezoneIana: input.timezoneIana,
      city: input.city,
      region: "Assam",
      countryName: "India",
      countryCode: "IN",
    },
  } as const;
}

function main() {
  const asOfDate = "2026-05-10";

  const guwahati = calculateDailyPanchangContext(
    buildInput({
      dateLocal: asOfDate,
      displayName: "Guwahati, Assam, India",
      latitude: 26.1445,
      longitude: 91.7362,
      timezoneIana: "Asia/Kolkata",
      city: "Guwahati",
    })
  );

  const northLakhimpur = calculateDailyPanchangContext(
    buildInput({
      dateLocal: asOfDate,
      displayName: "North Lakhimpur, Assam, India",
      latitude: 27.2359,
      longitude: 94.0973,
      timezoneIana: "Asia/Kolkata",
      city: "North Lakhimpur",
    })
  );

  const invalidTimezone = calculateDailyPanchangContext({
    dateLocal: asOfDate,
    location: {
      displayName: "Guwahati, Assam, India",
      latitude: 26.1445,
      longitude: 91.7362,
      timezoneIana: "Invalid/Timezone",
    },
  });

  const missingLocation = calculateDailyPanchangContext({
    dateLocal: asOfDate,
    location: null as never,
  });

  console.log(
    JSON.stringify(
      {
        cases: [
          summarizeCase("guwahati", guwahati),
          summarizeCase("north-lakhimpur", northLakhimpur),
          summarizeCase("invalid-timezone", invalidTimezone),
          summarizeCase("missing-location", missingLocation),
        ],
      },
      null,
      2
    )
  );
}

main();
