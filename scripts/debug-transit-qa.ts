import { buildTransitGocharFoundation } from "@/modules/astrology/transit";

function summarize(name: string, result: ReturnType<typeof buildTransitGocharFoundation>) {
  if (result.status !== "ready" || !result.data) {
    return {
      name,
      status: "unavailable",
      missingReason: result.error?.message ?? null,
      planetCount: 0,
    };
  }

  return {
    name,
    status: "ready",
    missingReason: null,
    transitDate: result.data.transitDate,
    timezone: result.data.timezone,
    location: result.data.location,
    planetCount: result.data.planets.length,
    firstPlanet: result.data.planets[0] ?? null,
    comparisonReadiness: result.data.comparisonReadiness,
  };
}

async function main() {
  const cases = [
    summarize(
      "utc-now",
      buildTransitGocharFoundation({
        transitDateUtc: "2026-05-09T12:00:00.000Z",
      })
    ),
    summarize(
      "assam-local",
      buildTransitGocharFoundation({
        transitDateLocal: "2026-05-09",
        transitTimeLocal: "17:30",
        timezone: "Asia/Kolkata",
        location: {
          city: "Guwahati",
          country: "IN",
        },
      })
    ),
    summarize(
      "international-local",
      buildTransitGocharFoundation({
        transitDateLocal: "2026-05-09",
        transitTimeLocal: "09:15",
        timezone: "Europe/London",
        location: {
          city: "London",
          country: "GB",
        },
      })
    ),
    summarize("missing-inputs", buildTransitGocharFoundation({})),
    summarize(
      "invalid-timezone",
      buildTransitGocharFoundation({
        transitDateLocal: "2026-05-09",
        transitTimeLocal: "09:15",
        timezone: "Invalid/Timezone",
      })
    ),
  ];

  console.log(JSON.stringify({ cases }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
