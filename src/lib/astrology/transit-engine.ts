import {
  formatRawGrahaLongitudes,
  type AstrologyFormattingResult,
  type NakshatraName,
  type NakshatraPada,
  type ZodiacSignName,
} from "@/lib/astrology/formatter";
import {
  calculateCoreGrahaSiderealLongitudesAtUtc,
  type CoreGrahaName,
} from "@/lib/astrology/swiss-planetary-service";

export type TransitCalculationFailureCode =
  | "INVALID_AS_OF_UTC"
  | "SWISSEPH_CALCULATION_ERROR"
  | "FORMATTING_FAILED";

export type TransitGrahaPosition = {
  planet: CoreGrahaName;
  longitude: number;
  sign: ZodiacSignName;
  degree_in_sign: number;
  nakshatra: NakshatraName;
  pada: NakshatraPada;
  is_retrograde: boolean;
  longitude_speed: number;
};

export type SiderealTransitSnapshotSuccess = {
  success: true;
  data: {
    as_of_utc: string;
    system: {
      zodiac: "sidereal";
      ayanamsha: "LAHIRI";
      ephemeris_mode: "SWISSEPH";
    };
    transits: TransitGrahaPosition[];
  };
};

export type SiderealTransitSnapshotFailure = {
  success: false;
  issue: {
    code: TransitCalculationFailureCode;
    message: string;
  };
};

export type SiderealTransitSnapshotResult =
  | SiderealTransitSnapshotFailure
  | SiderealTransitSnapshotSuccess;

function fail(
  code: TransitCalculationFailureCode,
  message: string
): SiderealTransitSnapshotFailure {
  return {
    success: false,
    issue: {
      code,
      message,
    },
  };
}

function toGrahaPositions(input: {
  formatting: AstrologyFormattingResult;
  raw: ReturnType<typeof calculateCoreGrahaSiderealLongitudesAtUtc>;
}): SiderealTransitSnapshotResult {
  const raw = input.raw;
  const formatting = input.formatting;

  if (!raw.success) {
    return fail(raw.issue.code, raw.issue.message);
  }

  if (!formatting.success) {
    return fail("FORMATTING_FAILED", formatting.issue.message);
  }

  const transits = raw.data.planets.map((planet, index) => {
    const formattedPlanet = formatting.data.planets[index];

    if (!formattedPlanet) {
      return null;
    }

    return {
      planet: planet.graha,
      longitude: formattedPlanet.longitude,
      sign: formattedPlanet.sign,
      degree_in_sign: formattedPlanet.degree_in_sign,
      nakshatra: formattedPlanet.nakshatra,
      pada: formattedPlanet.pada,
      is_retrograde: formattedPlanet.is_retrograde,
      longitude_speed: planet.longitude_speed,
    };
  });

  if (transits.some((planet) => planet === null)) {
    return fail(
      "FORMATTING_FAILED",
      "Transit formatter output is incomplete for one or more grahas."
    );
  }

  return {
    success: true,
    data: {
      as_of_utc: raw.data.as_of_utc,
      system: {
        zodiac: "sidereal",
        ayanamsha: "LAHIRI",
        ephemeris_mode: "SWISSEPH",
      },
      transits: transits.filter(
        (planet): planet is NonNullable<typeof planet> => planet !== null
      ),
    },
  };
}

export function calculateSiderealTransitSnapshot(input?: {
  asOfUtc?: Date | string;
}): SiderealTransitSnapshotResult {
  const asOfUtc = input?.asOfUtc ?? new Date().toISOString();
  const rawResult = calculateCoreGrahaSiderealLongitudesAtUtc({
    asOfUtc,
  });

  if (!rawResult.success) {
    return fail(rawResult.issue.code, rawResult.issue.message);
  }

  const formattingResult = formatRawGrahaLongitudes(rawResult.data.planets);

  return toGrahaPositions({
    formatting: formattingResult,
    raw: rawResult,
  });
}
