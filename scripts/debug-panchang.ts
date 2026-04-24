import { calculateDailyPanchangContext } from "@/modules/panchang";

function readArg(flag: string) {
  const index = process.argv.indexOf(flag);

  if (index === -1) {
    return null;
  }

  return process.argv[index + 1] ?? null;
}

function hasFlag(flag: string) {
  return process.argv.includes(flag);
}

async function main() {
  const dateLocal = readArg("--date") ?? "2026-04-24";
  const placeName = readArg("--place") ?? "Guwahati, Assam, India";
  const timezoneIana = readArg("--timezone") ?? "Asia/Kolkata";
  const latitude = Number(readArg("--lat") ?? "26.1445");
  const longitude = Number(readArg("--lon") ?? "91.7362");

  const result = calculateDailyPanchangContext({
    dateLocal,
    location: {
      displayName: placeName,
      latitude,
      longitude,
      timezoneIana: hasFlag("--invalid-timezone")
        ? "Invalid/Timezone"
        : timezoneIana,
      city: "Guwahati",
      region: "Assam",
      countryCode: "IN",
      countryName: "India",
    },
  });

  console.log(
    JSON.stringify(
      {
        input: {
          dateLocal,
          placeName,
          timezoneIana,
          latitude,
          longitude,
        },
        result,
        preview:
          result.success
            ? {
                tithi: result.data.tithi,
                vara: result.data.vara,
                nakshatra: result.data.nakshatra,
                yoga: result.data.yoga,
                karana: result.data.karana,
                sunrise: result.data.sunrise,
                sunset: result.data.sunset,
                moon_sign: result.data.moon_sign,
              }
            : null,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
