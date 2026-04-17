import { config as loadDotenv } from "dotenv";
import type { AstronomyReadyBirthContext } from "@/lib/astrology/birth-context-engine";
import { resolveAstronomyReadyBirthContext } from "@/lib/astrology/birth-context-engine";
import { assertNormalizedBirthContextInput } from "@/lib/astrology/birth-input-normalizer";
import type { AstrologyFormattingResult } from "@/lib/astrology/formatter";
import {
  buildPlanetaryVerificationFromContext,
  verifyPlanetaryResults,
} from "@/lib/astrology/planetary-verifier";

const envFiles = [
  ".env",
  ".env.local",
  ".env.development.local",
  ".env.development",
];

for (const envFile of envFiles) {
  loadDotenv({ path: envFile, override: false, quiet: true });
}

function readArg(flag: string) {
  const index = process.argv.indexOf(flag);

  if (index === -1) {
    return null;
  }

  return process.argv[index + 1] ?? null;
}

function getMode() {
  const mode = readArg("--mode");

  if (mode === "resolve") {
    return "resolve" as const;
  }

  return "static" as const;
}

function getTamperKetuDelta() {
  const value = readArg("--tamper-ketu-delta");

  if (!value) {
    return 0;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function getInput() {
  return {
    dateLocalInput: readArg("--date") ?? "1996-04-12",
    timeLocalInput: readArg("--time") ?? "19:30",
    placeTextInput: readArg("--place") ?? "North Lakhimpur, Assam, India",
  };
}

function getStaticContext(input: {
  dateLocalInput: string;
  timeLocalInput: string;
  placeTextInput: string;
}): AstronomyReadyBirthContext {
  const normalized = assertNormalizedBirthContextInput(input);

  return {
    birth_input: normalized,
    normalized_place: {
      display_name: "North Lakhimpur, Assam, India",
      latitude: 27.2352,
      longitude: 94.1034,
      country_code: "IN",
      country_name: "India",
      region: "Assam",
      city: "North Lakhimpur",
    },
    timezone: {
      iana: "Asia/Kolkata",
      utc_offset_at_birth: "+05:30",
    },
    birth_utc: "1996-04-12T14:00:00.000Z",
    quality: {
      location_confidence: "high",
      normalization_status: "ok",
    },
  };
}

async function resolveContext(input: {
  dateLocalInput: string;
  timeLocalInput: string;
  placeTextInput: string;
}) {
  const normalized = assertNormalizedBirthContextInput(input);
  const resolution = await resolveAstronomyReadyBirthContext(normalized);

  if (!resolution.success) {
    return {
      success: false as const,
      resolution,
    };
  }

  return {
    success: true as const,
    context: resolution.data,
    resolution,
  };
}

function tamperKetuLongitude(
  context: AstronomyReadyBirthContext,
  rawResult: ReturnType<typeof buildPlanetaryVerificationFromContext>["rawResult"],
  formattedResult: AstrologyFormattingResult,
  delta: number
) {
  if (!formattedResult.success || delta === 0) {
    return null;
  }

  const formattedClone = {
    ...formattedResult,
    data: {
      ...formattedResult.data,
      planets: formattedResult.data.planets.map((planet) =>
        planet.name === "Ketu"
          ? {
              ...planet,
              longitude: planet.longitude + delta,
            }
          : planet
      ),
    },
  } satisfies AstrologyFormattingResult;

  return verifyPlanetaryResults({
    context,
    rawResult,
    formattedResult: formattedClone,
  });
}

async function main() {
  const mode = getMode();
  const input = getInput();
  const tamperKetuDelta = getTamperKetuDelta();

  let context: AstronomyReadyBirthContext;
  let resolutionOutput: unknown = null;

  if (mode === "resolve") {
    const resolution = await resolveContext(input);

    if (!resolution.success) {
      console.log(
        JSON.stringify(
          {
            mode,
            input,
            resolution,
            note: "Resolution failed before planetary calculation.",
          },
          null,
          2
        )
      );
      return;
    }

    context = resolution.context;
    resolutionOutput = resolution.resolution;
  } else {
    context = getStaticContext(input);
  }

  const pipeline = buildPlanetaryVerificationFromContext(context);
  const tamperedVerification = tamperKetuLongitude(
    context,
    pipeline.rawResult,
    pipeline.formattedResult,
    tamperKetuDelta
  );

  console.log(
    JSON.stringify(
      {
        mode,
        input,
        resolution: resolutionOutput,
        raw: pipeline.rawResult,
        formatted: pipeline.formattedResult,
        verification: tamperedVerification ?? pipeline.verification,
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
