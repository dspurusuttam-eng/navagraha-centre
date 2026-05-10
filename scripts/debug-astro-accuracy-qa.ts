import { MockDeterministicAstrologyProvider } from "@/modules/astrology/providers/mock-deterministic-provider";
import { validateBirthDetails } from "@/modules/astrology/validation";
import type { BirthDetailsInput, NatalChartResponse } from "@/modules/astrology/types";

const expectedBodies = [
  "SUN",
  "MOON",
  "MARS",
  "MERCURY",
  "JUPITER",
  "VENUS",
  "SATURN",
  "RAHU",
  "KETU",
  "URANUS",
  "NEPTUNE",
  "PLUTO",
] as const;

type ValidCase = {
  name: string;
  input: BirthDetailsInput;
  expectedUtc?: string;
};

type InvalidCase = {
  name: string;
  input: BirthDetailsInput;
};

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function getTimeZoneParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = formatter.formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === "year")?.value ?? "0"),
    month: Number(parts.find((part) => part.type === "month")?.value ?? "1"),
    day: Number(parts.find((part) => part.type === "day")?.value ?? "1"),
    hour: Number(parts.find((part) => part.type === "hour")?.value ?? "0"),
    minute: Number(parts.find((part) => part.type === "minute")?.value ?? "0"),
    second: Number(parts.find((part) => part.type === "second")?.value ?? "0"),
  };
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = getTimeZoneParts(date, timeZone);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );

  return asUtc - date.getTime();
}

function convertZonedBirthToUtcDate(
  dateLocal: string,
  timeLocal: string,
  timeZone: string
) {
  const [year, month, day] = dateLocal.split("-").map(Number);
  const [hour, minute] = timeLocal.split(":").map(Number);
  const naiveUtcMs = Date.UTC(year, month - 1, day, hour, minute, 0);
  const initialOffset = getTimeZoneOffsetMs(new Date(naiveUtcMs), timeZone);
  let utcMs = naiveUtcMs - initialOffset;
  const correctedOffset = getTimeZoneOffsetMs(new Date(utcMs), timeZone);

  if (correctedOffset !== initialOffset) {
    utcMs = naiveUtcMs - correctedOffset;
  }

  return new Date(utcMs);
}

function ensure12PlanetOutput(name: string, chart: NatalChartResponse) {
  assert(chart.planets.length === 12, `${name}: expected 12 planets, received ${chart.planets.length}.`);
  const nakshatras = chart.nakshatras ?? [];
  assert(
    nakshatras.length === 12,
    `${name}: expected 12 nakshatra entries, received ${nakshatras.length}.`
  );

  const bodies = new Set(chart.planets.map((planet) => planet.body));

  for (const body of expectedBodies) {
    assert(bodies.has(body), `${name}: missing ${body} in chart output.`);
  }

  for (const planet of chart.planets) {
    assert(Number.isFinite(planet.longitude), `${name}: ${planet.body} longitude is invalid.`);
    assert(Number.isInteger(planet.degree), `${name}: ${planet.body} degree is invalid.`);
    assert(Number.isInteger(planet.minute), `${name}: ${planet.body} minute is invalid.`);
    assert(planet.sign.length > 0, `${name}: ${planet.body} sign is missing.`);
    assert(planet.house >= 1 && planet.house <= 12, `${name}: ${planet.body} house is invalid.`);
    assert(typeof planet.retrograde === "boolean", `${name}: ${planet.body} retrograde flag is missing.`);
    assert(planet.nakshatra !== undefined, `${name}: ${planet.body} nakshatra is missing.`);
    assert(
      planet.nakshatra !== undefined && [1, 2, 3, 4].includes(planet.nakshatra.pada),
      `${name}: ${planet.body} nakshatra pada is invalid.`
    );
  }

  const serialized = JSON.parse(JSON.stringify(chart)) as NatalChartResponse;
  assert(
    serialized.planets.length === 12,
    `${name}: serialized chart lost planet data.`
  );
}

async function runValidCase(name: string, input: BirthDetailsInput, expectedUtc?: string) {
  const validation = validateBirthDetails(input);

  assert(validation.success, `${name}: birth details validation failed unexpectedly.`);
  if (!validation.success) {
    throw new Error(`${name}: birth details validation failed unexpectedly.`);
  }

  const provider = new MockDeterministicAstrologyProvider();
  const chart = await provider.getNatalChart({
    requestId: `phase-27-accuracy-${name}`,
    kind: "NATAL",
    birthDetails: validation.data,
    houseSystem: "WHOLE_SIGN",
    requestedDivisionalCharts: [],
  });

  ensure12PlanetOutput(name, chart);

  if (expectedUtc) {
    const convertedUtc = convertZonedBirthToUtcDate(
      validation.data.dateLocal,
      validation.data.timeLocal,
      validation.data.timezone
    ).toISOString();

    assert(
      convertedUtc === expectedUtc,
      `${name}: expected UTC ${expectedUtc}, received ${convertedUtc}.`
    );
  }
}

function runInvalidCase(name: string, input: BirthDetailsInput) {
  const validation = validateBirthDetails(input);

  assert(!validation.success, `${name}: invalid birth details were accepted.`);
}

async function main() {
  const validCases: ValidCase[] = [
    {
      name: "assam-india-birth",
      input: {
        dateLocal: "1996-04-12",
        timeLocal: "19:30",
        timezone: "Asia/Kolkata",
        place: {
          city: "North Lakhimpur",
          region: "Assam",
          country: "India",
          latitude: 27.2352,
          longitude: 94.1034,
        },
      },
      expectedUtc: "1996-04-12T14:00:00.000Z",
    },
    {
      name: "international-timezone-birth",
      input: {
        dateLocal: "1992-11-06",
        timeLocal: "01:30",
        timezone: "America/New_York",
        place: {
          city: "New York",
          region: "New York",
          country: "United States",
          latitude: 40.7128,
          longitude: -74.006,
        },
      },
    },
    {
      name: "midnight-birth",
      input: {
        dateLocal: "2001-01-01",
        timeLocal: "00:00",
        timezone: "Asia/Kolkata",
        place: {
          city: "Guwahati",
          region: "Assam",
          country: "India",
          latitude: 26.1445,
          longitude: 91.7362,
        },
      },
    },
    {
      name: "leap-year-birth",
      input: {
        dateLocal: "2000-02-29",
        timeLocal: "12:15",
        timezone: "Europe/London",
        place: {
          city: "London",
          region: "England",
          country: "United Kingdom",
          latitude: 51.5072,
          longitude: -0.1276,
        },
      },
    },
    {
      name: "sign-boundary-birth",
      input: {
        dateLocal: "1990-03-21",
        timeLocal: "23:59",
        timezone: "Asia/Kolkata",
        place: {
          city: "Shillong",
          region: "Meghalaya",
          country: "India",
          latitude: 25.5788,
          longitude: 91.8933,
        },
      },
    },
  ];

  const invalidCases: InvalidCase[] = [
    {
      name: "invalid-dob",
      input: {
        dateLocal: "1996-02-30",
        timeLocal: "12:00",
        timezone: "Asia/Kolkata",
        place: {
          city: "Guwahati",
          country: "India",
          latitude: 26.1445,
          longitude: 91.7362,
        },
      },
    },
    {
      name: "invalid-time",
      input: {
        dateLocal: "1996-04-12",
        timeLocal: "25:10",
        timezone: "Asia/Kolkata",
        place: {
          city: "Guwahati",
          country: "India",
          latitude: 26.1445,
          longitude: 91.7362,
        },
      },
    },
    {
      name: "invalid-place",
      input: {
        dateLocal: "1996-04-12",
        timeLocal: "12:00",
        timezone: "Asia/Kolkata",
        place: {
          city: "",
          country: "",
          latitude: null,
          longitude: null,
        },
      },
    },
    {
      name: "missing-latitude",
      input: {
        dateLocal: "1996-04-12",
        timeLocal: "12:00",
        timezone: "Asia/Kolkata",
        place: {
          city: "Guwahati",
          country: "India",
          latitude: 26.1445,
          longitude: null,
        },
      },
    },
    {
      name: "missing-timezone",
      input: {
        dateLocal: "1996-04-12",
        timeLocal: "12:00",
        timezone: "",
        place: {
          city: "Guwahati",
          country: "India",
          latitude: 26.1445,
          longitude: 91.7362,
        },
      },
    },
  ];

  const results: Array<{ name: string; pass: boolean; detail: string }> = [];

  for (const testCase of validCases) {
    try {
      await runValidCase(testCase.name, testCase.input, testCase.expectedUtc);
      results.push({ name: testCase.name, pass: true, detail: "validated" });
    } catch (error) {
      results.push({
        name: testCase.name,
        pass: false,
        detail: error instanceof Error ? error.message : String(error),
      });
    }
  }

  for (const testCase of invalidCases) {
    try {
      runInvalidCase(testCase.name, testCase.input);
      results.push({ name: testCase.name, pass: true, detail: "rejected as expected" });
    } catch (error) {
      results.push({
        name: testCase.name,
        pass: false,
        detail: error instanceof Error ? error.message : String(error),
      });
    }
  }

  for (const result of results) {
    const marker = result.pass ? "PASS" : "FAIL";
    console.log(`${marker} ${result.name} :: ${result.detail}`);
  }

  const passed = results.filter((entry) => entry.pass).length;
  console.log(`\nAstrology accuracy checks: ${passed}/${results.length} scenarios passed.`);

  if (passed !== results.length) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
