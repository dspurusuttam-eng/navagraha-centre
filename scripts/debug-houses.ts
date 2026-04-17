import { config as loadDotenv } from "dotenv";
import type { AstronomyReadyBirthContext } from "@/lib/astrology/birth-context-engine";
import { resolveAstronomyReadyBirthContext } from "@/lib/astrology/birth-context-engine";
import { assertNormalizedBirthContextInput } from "@/lib/astrology/birth-input-normalizer";
import { buildWholeSignHouseStructureFromContext } from "@/lib/astrology/house-engine";

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

function hasFlag(flag: string) {
  return process.argv.includes(flag);
}

function getMode() {
  const mode = readArg("--mode");

  if (mode === "resolve") {
    return "resolve" as const;
  }

  return "static" as const;
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

async function main() {
  const mode = getMode();
  const input = getInput();
  const invalidContextMode = hasFlag("--invalid-context");

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
            note: "Resolution failed before house generation.",
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

  const contextToUse = invalidContextMode
    ? ({
        ...context,
        birth_utc: "invalid-utc",
      } as AstronomyReadyBirthContext)
    : context;

  const output = buildWholeSignHouseStructureFromContext(contextToUse);

  console.log(
    JSON.stringify(
      {
        mode,
        input,
        invalid_context_mode: invalidContextMode,
        resolution: resolutionOutput,
        lagna: output.lagnaResult,
        houses: output.housesResult,
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
