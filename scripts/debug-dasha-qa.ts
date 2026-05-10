import {
  buildVimshottariDashaFoundation,
} from "@/modules/astrology/dasha";
import type { VimshottariChartContextInput } from "@/modules/astrology/vimshottari-dasha";
import { buildVimshottariMahadashaForChartContext } from "@/modules/astrology/vimshottari-dasha";

type QaCaseResult = {
  name: string;
  status: "ready" | "unavailable";
  code: string | null;
  currentMahadasha: string | null;
  currentAntardasha: string | null;
  currentPratyantardasha: string | null;
  timelineCount: number;
  missingReason: string | null;
};

function readArg(flag: string) {
  const index = process.argv.indexOf(flag);

  if (index === -1) {
    return null;
  }

  return process.argv[index + 1] ?? null;
}

function buildValidContext(): VimshottariChartContextInput {
  return {
    birth_context: {
      birth_utc: "1996-04-12T14:00:00.000Z",
    },
    planets: [
      {
        name: "Moon",
        longitude: 86.275432,
        nakshatra: "Punarvasu",
      },
    ],
    verification: {
      is_verified_for_chart_logic: true,
    },
  };
}

function buildLocalBirthFixture(input: {
  dateLocal: string;
  timeLocal: string;
  timezone: string;
  city: string;
}) {
  return {
    kind: "NATAL",
    metadata: {
      providerKey: "qa",
      fixtureKey: "qa",
      requestId: `${input.city}-qa`,
      generatedAtUtc: new Date().toISOString(),
      deterministic: true,
      disclaimer: "QA",
    },
    birthDetails: {
      dateLocal: input.dateLocal,
      timeLocal: input.timeLocal,
      timezone: input.timezone,
      place: {
        city: input.city,
        country: "IN",
      },
    },
    houseSystem: "whole_sign",
    ascendantSign: "ARIES",
    planets: [
      {
        body: "MOON",
        longitude: 86.275432,
        sign: "GEMINI",
        degree_in_sign: 26.275432,
        nakshatra: {
          name: "Punarvasu",
          pada: 2,
          ruler: "JUPITER",
          degreesIntoNakshatra: 13.2,
        },
        is_retrograde: false,
        is_combust: false,
        house: 3,
        speed: 13.2,
      },
    ],
    houses: [],
    aspects: [],
    remedySignals: [],
    divisionalCharts: [],
    summary: {
      dominantBodies: ["MOON"],
      narrative: "QA",
    },
  } as never;
}

function summarizeResult(name: string, result: ReturnType<typeof buildVimshottariDashaFoundation>): QaCaseResult {
  if (result.status !== "ready" || !result.data) {
    return {
      name,
      status: "unavailable",
      code: result.error?.code ?? null,
      currentMahadasha: null,
      currentAntardasha: null,
      currentPratyantardasha: null,
      timelineCount: 0,
      missingReason: result.error?.message ?? null,
    };
  }

  return {
    name,
    status: "ready",
    code: null,
    currentMahadasha: result.data.currentMahadasha?.planet ?? null,
    currentAntardasha: result.data.currentAntardasha?.planet ?? null,
    currentPratyantardasha: result.data.currentPratyantardasha?.planet ?? null,
    timelineCount: result.data.timeline.length,
    missingReason: result.data.missingReason,
  };
}

async function main() {
  const asOfDateUtc = readArg("--as-of") ?? undefined;
  const chart = buildValidContext();
  const invalidMoonLongitude = buildVimshottariMahadashaForChartContext({
    chart: {
      ...chart,
      planets: [
        {
          ...chart.planets[0]!,
          longitude: Number.NaN,
        },
      ],
    },
    asOfDateUtc,
  });
  const invalidNakshatra = buildVimshottariMahadashaForChartContext({
    chart: {
      ...chart,
      planets: [
        {
          ...chart.planets[0]!,
          nakshatra: "",
        },
      ],
    },
    asOfDateUtc,
  });
  const invalidLocalBirth = buildVimshottariDashaFoundation({
    chart: {
      kind: "NATAL",
      metadata: {
        providerKey: "qa",
        fixtureKey: "qa",
        requestId: "qa",
        generatedAtUtc: new Date().toISOString(),
        deterministic: true,
        disclaimer: "QA",
      },
      birthDetails: {
        dateLocal: "1996-02-30",
        timeLocal: "25:61",
        timezone: "Invalid/Timezone",
        place: {
          city: "Guwahati",
          country: "IN",
        },
      } as never,
      houseSystem: "whole_sign",
      ascendantSign: "ARIES",
      planets: [],
      houses: [],
      aspects: [],
      remedySignals: [],
      divisionalCharts: [],
      summary: {
        dominantBodies: [],
        narrative: "QA",
      },
    } as never,
  });
  const futureDate = buildVimshottariDashaFoundation({
    chart,
    asOfDateUtc: "2045-01-01T00:00:00.000Z",
  });
  const midnightDate = buildVimshottariDashaFoundation({
    chart,
    asOfDateUtc: "1996-04-12T00:00:00.000Z",
  });
  const leapYearDate = buildVimshottariDashaFoundation({
    chart,
    asOfDateUtc: "2000-02-29T00:00:00.000Z",
  });

  console.log(
    JSON.stringify(
      {
        cases: [
          summarizeResult("future-date", futureDate),
          summarizeResult("midnight-date", midnightDate),
          summarizeResult("leap-year-date", leapYearDate),
          {
            name: "invalid-moon-longitude",
            status: invalidMoonLongitude.success ? "ready" : "unavailable",
            code: invalidMoonLongitude.success ? null : invalidMoonLongitude.error.code,
            currentMahadasha: invalidMoonLongitude.success
              ? invalidMoonLongitude.data.activeMahadasha?.planet ?? null
              : null,
            currentAntardasha: invalidMoonLongitude.success
              ? invalidMoonLongitude.data.activeAntardasha?.planet ?? null
              : null,
            currentPratyantardasha: invalidMoonLongitude.success
              ? invalidMoonLongitude.data.activePratyantar?.planet ?? null
              : null,
            timelineCount: invalidMoonLongitude.success
              ? invalidMoonLongitude.data.mahadashaPeriods.length
              : 0,
            missingReason: invalidMoonLongitude.success
              ? null
              : invalidMoonLongitude.error.message,
          },
          {
            name: "invalid-nakshatra",
            status: invalidNakshatra.success ? "ready" : "unavailable",
            code: invalidNakshatra.success ? null : invalidNakshatra.error.code,
            currentMahadasha: invalidNakshatra.success
              ? invalidNakshatra.data.activeMahadasha?.planet ?? null
              : null,
            currentAntardasha: invalidNakshatra.success
              ? invalidNakshatra.data.activeAntardasha?.planet ?? null
              : null,
            currentPratyantardasha: invalidNakshatra.success
              ? invalidNakshatra.data.activePratyantar?.planet ?? null
              : null,
            timelineCount: invalidNakshatra.success
              ? invalidNakshatra.data.mahadashaPeriods.length
              : 0,
            missingReason: invalidNakshatra.success
              ? null
      : invalidNakshatra.error.message,
          },
          summarizeResult(
            "assam-local-birth",
            buildVimshottariDashaFoundation({
              chart: buildLocalBirthFixture({
                dateLocal: "1996-04-12",
                timeLocal: "14:00",
                timezone: "Asia/Kolkata",
                city: "Guwahati",
              }),
            })
          ),
          summarizeResult(
            "international-local-birth",
            buildVimshottariDashaFoundation({
              chart: buildLocalBirthFixture({
                dateLocal: "1996-04-12",
                timeLocal: "09:30",
                timezone: "Europe/London",
                city: "London",
              }),
            })
          ),
          summarizeResult(
            "midnight-birth",
            buildVimshottariDashaFoundation({
              chart: {
                ...chart,
                birth_context: {
                  birth_utc: "1996-04-12T00:00:00.000Z",
                },
              },
              asOfDateUtc: "1996-04-12T00:00:00.000Z",
            })
          ),
          summarizeResult("invalid-local-birth", invalidLocalBirth),
        ],
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
