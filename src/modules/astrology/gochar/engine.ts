// Card 6 — Gochar + Sade Sati engine.
//
// Pure derived / on-demand. Nothing persists; no new DB tables.
// Calculation-first: positions, houses, flags and dates only. No interpretation,
// no prediction, no severity, no remedies.
//
// Ayanamsa and node model are inherited from the natal engine:
//   - LAHIRI sidereal (swe_set_sid_mode(SE_SIDM_LAHIRI, 0, 0))
//   - SE_TRUE_NODE, with Ketu = Rahu + 180 (shares Rahu's longitude speed)
// Rahu/Ketu are therefore always reported retrograde and are excluded from the
// speed-based retrograde test.

import { calculateCoreGrahaSiderealLongitudesAtUtc } from "@/lib/astrology/swiss-planetary-service";
import {
  GOCHAR_GRAHAS,
  houseFromLagna,
  houseFromMoon,
  isRetrograde,
  isSadeSatiActive,
  rashiIndex,
  resolveVedhaStatus,
  sadeSatiPhase,
  saturnAffliction,
  transitResultFlag,
  type GocharGraha,
  type HouseNumber1To12,
  type RashiIndex0To11,
  type SadeSatiPhase,
  type SaturnAffliction,
  type TransitResultFlag,
  type VedhaStatus,
} from "@/modules/astrology/gochar/core";
import {
  enumerateSadeSatiWindow,
  findNextIngress,
  type GocharSample,
  type GocharSampler,
} from "@/modules/astrology/gochar/ingress";

export const GOCHAR_AYANAMSA = "LAHIRI" as const;
export const GOCHAR_NODE_MODEL = "TRUE_NODE" as const;

const MS_PER_DAY = 86_400_000;

/** Window used to resolve Sade Sati entry/exit boundaries around the query. */
const SADE_SATI_LOOKBACK_DAYS = 1200;
const SADE_SATI_LOOKAHEAD_DAYS = 1600;

export type GocharTransitEntry = {
  graha: GocharGraha;
  longitude: number;
  rashi: RashiIndex0To11;
  houseFromMoon: HouseNumber1To12;
  houseFromLagna: HouseNumber1To12;
  retrograde: boolean;
  transitResult: TransitResultFlag;
  nextIngress: {
    atUtc: string;
    toRashi: RashiIndex0To11;
  } | null;
};

export type GocharSadeSati = {
  active: boolean;
  phase: SadeSatiPhase | null;
  saturnHouseFromMoon: HouseNumber1To12;
  firstEntryUtc: string | null;
  finalSettledEntryUtc: string | null;
  finalExitUtc: string | null;
  retrogradeReEntry: boolean;
};

export type GocharFlags = {
  ayanamsa: typeof GOCHAR_AYANAMSA;
  nodeModel: typeof GOCHAR_NODE_MODEL;
  enableVedha: boolean;
  vedha: VedhaStatus;
  /** Stable additive slot for Card 7 (Ashtakavarga). Never computed here. */
  sarvaBindu: null;
};

export type GocharSnapshot = {
  queryInstant: string;
  ayanamsa: typeof GOCHAR_AYANAMSA;
  referenceMoonRashi: RashiIndex0To11;
  referenceLagnaRashi: RashiIndex0To11;
  transits: GocharTransitEntry[];
  sadeSati: GocharSadeSati;
  saturnAffliction: SaturnAffliction;
  flags: GocharFlags;
};

export type GocharFailureCode =
  | "INVALID_QUERY_INSTANT"
  | "INVALID_NATAL_MOON_LONGITUDE"
  | "INVALID_NATAL_LAGNA_LONGITUDE"
  | "EPHEMERIS_UNAVAILABLE";

export type GocharResult =
  | { success: true; data: GocharSnapshot }
  | { success: false; issue: { code: GocharFailureCode; message: string } };

export type GocharInput = {
  natalMoonLongitude: number;
  natalLagnaLongitude: number;
  queryInstant: Date | string;
  enableVedha?: boolean;
  /** Injected for deterministic tests; defaults to the Swiss Ephemeris sampler. */
  sampler?: GocharSampler;
  /** Set false to skip ingress + Sade Sati boundary scans (cheap snapshot). */
  resolveIngress?: boolean;
  resolveSadeSatiWindow?: boolean;
};

function fail(
  code: GocharFailureCode,
  message: string
): { success: false; issue: { code: GocharFailureCode; message: string } } {
  return { success: false, issue: { code, message } };
}

function parseInstant(value: Date | string): Date | null {
  const parsed = value instanceof Date ? new Date(value.getTime()) : new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Production sampler: one Swiss Ephemeris call yields all grahas at an instant,
 * so a coarse scan step costs a single call for all nine bodies.
 */
export const swissEphemerisSampler: GocharSampler = (instant: Date) => {
  const result = calculateCoreGrahaSiderealLongitudesAtUtc({ asOfUtc: instant });

  if (!result.success) {
    return null;
  }

  const byGraha = new Map(
    result.data.planets.map((planet) => [planet.graha, planet] as const)
  );
  const samples = {} as Record<GocharGraha, GocharSample>;

  for (const graha of GOCHAR_GRAHAS) {
    const planet = byGraha.get(graha);

    if (!planet) {
      return null;
    }

    samples[graha] = {
      longitude: planet.sidereal_longitude,
      speed: planet.longitude_speed,
    };
  }

  return samples;
};

export function buildGocharSnapshot(input: GocharInput): GocharResult {
  const queryInstant = parseInstant(input.queryInstant);

  if (!queryInstant) {
    return fail(
      "INVALID_QUERY_INSTANT",
      "queryInstant is invalid. Provide a valid Date or UTC ISO string."
    );
  }

  if (!Number.isFinite(input.natalMoonLongitude)) {
    return fail(
      "INVALID_NATAL_MOON_LONGITUDE",
      "natalMoonLongitude must be a finite number."
    );
  }

  if (!Number.isFinite(input.natalLagnaLongitude)) {
    return fail(
      "INVALID_NATAL_LAGNA_LONGITUDE",
      "natalLagnaLongitude must be a finite number."
    );
  }

  const sampler = input.sampler ?? swissEphemerisSampler;
  const samples = sampler(queryInstant);

  if (!samples) {
    return fail(
      "EPHEMERIS_UNAVAILABLE",
      `Sidereal longitudes are unavailable for ${queryInstant.toISOString()}.`
    );
  }

  const enableVedha = input.enableVedha ?? false;
  const resolveIngress = input.resolveIngress ?? true;
  const resolveWindow = input.resolveSadeSatiWindow ?? true;
  const referenceMoonRashi = rashiIndex(input.natalMoonLongitude);
  const referenceLagnaRashi = rashiIndex(input.natalLagnaLongitude);

  const transits: GocharTransitEntry[] = GOCHAR_GRAHAS.map((graha) => {
    const sample = samples[graha];
    const grahaHouseFromMoon = houseFromMoon(
      sample.longitude,
      input.natalMoonLongitude
    );
    let nextIngress: GocharTransitEntry["nextIngress"] = null;

    if (resolveIngress) {
      const ingress = findNextIngress({ sampler, graha, from: queryInstant });

      if (ingress.success) {
        nextIngress = {
          atUtc: ingress.data.atUtc,
          toRashi: ingress.data.toRashi,
        };
      }
    }

    return {
      graha,
      longitude: sample.longitude,
      rashi: rashiIndex(sample.longitude),
      houseFromMoon: grahaHouseFromMoon,
      houseFromLagna: houseFromLagna(sample.longitude, input.natalLagnaLongitude),
      retrograde: isRetrograde(graha, sample.speed),
      transitResult: transitResultFlag(graha, grahaHouseFromMoon),
      nextIngress,
    };
  });

  const saturnHouseFromMoon = houseFromMoon(
    samples.SATURN.longitude,
    input.natalMoonLongitude
  );
  const active = isSadeSatiActive(saturnHouseFromMoon);

  const sadeSati: GocharSadeSati = {
    active,
    phase: active ? sadeSatiPhase(saturnHouseFromMoon) : null,
    saturnHouseFromMoon,
    firstEntryUtc: null,
    finalSettledEntryUtc: null,
    finalExitUtc: null,
    retrogradeReEntry: false,
  };

  if (resolveWindow) {
    const windowResult = enumerateSadeSatiWindow({
      sampler,
      from: new Date(queryInstant.getTime() - SADE_SATI_LOOKBACK_DAYS * MS_PER_DAY),
      to: new Date(queryInstant.getTime() + SADE_SATI_LOOKAHEAD_DAYS * MS_PER_DAY),
      isActive: (saturnLongitude) =>
        isSadeSatiActive(houseFromMoon(saturnLongitude, input.natalMoonLongitude)),
    });

    if (windowResult.success) {
      sadeSati.firstEntryUtc = windowResult.data.firstEntryUtc;
      sadeSati.finalSettledEntryUtc = windowResult.data.finalSettledEntryUtc;
      sadeSati.finalExitUtc = windowResult.data.finalExitUtc;
      sadeSati.retrogradeReEntry = windowResult.data.retrogradeReEntry;
    }
  }

  return {
    success: true,
    data: {
      queryInstant: queryInstant.toISOString(),
      ayanamsa: GOCHAR_AYANAMSA,
      referenceMoonRashi,
      referenceLagnaRashi,
      transits,
      sadeSati,
      saturnAffliction: saturnAffliction(saturnHouseFromMoon),
      flags: {
        ayanamsa: GOCHAR_AYANAMSA,
        nodeModel: GOCHAR_NODE_MODEL,
        enableVedha,
        vedha: resolveVedhaStatus(enableVedha),
        sarvaBindu: null,
      },
    },
  };
}
