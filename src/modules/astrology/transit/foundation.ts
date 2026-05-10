import type { UnifiedSiderealChart } from "@/modules/astrology/chart-contract-types";
import { planetLabelMap } from "@/lib/astrology/constants";
import { createAstrologyInfrastructureSnapshot } from "@/modules/astrology/core";
import type { AstrologyInfrastructureSnapshot } from "@/modules/astrology/core";
import { calculateSiderealTransitSnapshot } from "@/lib/astrology/transit-engine";

type TransitLocationInput = {
  city: string;
  region?: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
};

export type TransitGocharPlanetEntry = {
  planet: string;
  planetLabel: string;
  sign: string;
  longitude: number;
  degreeInSign: number;
  nakshatra: string;
  pada: number;
  retrograde: boolean;
  speed: number | null;
};

export type TransitGocharComparisonReadiness = {
  natalChartAvailable: boolean;
  houseOverlayReady: boolean;
  aspectReadiness: "pending";
  natalPlanetCount: number;
  transitPlanetCount: number;
  note: string;
};

export type TransitGocharFoundationData = {
  transitDate: string;
  timezone: string | null;
  location: TransitLocationInput | null;
  planets: TransitGocharPlanetEntry[];
  comparisonReadiness: TransitGocharComparisonReadiness;
  safeSummary: string;
  missingReason: string | null;
};

export type TransitGocharFoundationSnapshot =
  AstrologyInfrastructureSnapshot<TransitGocharFoundationData>;

type TransitFoundationInput = {
  transitDateUtc?: Date | string;
  transitDateLocal?: string;
  transitTimeLocal?: string;
  timezone?: string;
  location?: TransitLocationInput | null;
  natalChart?: UnifiedSiderealChart | null | undefined;
};

function formatPlanet(value: string) {
  return planetLabelMap[value.toUpperCase() as keyof typeof planetLabelMap] ?? value;
}

function toUtcFromLocal(dateLocal: string, timeLocal: string, timezone: string) {
  try {
    const [year, month, day] = dateLocal.split("-").map(Number);
    const [hour, minute] = timeLocal.split(":").map(Number);

    if (
      !Number.isInteger(year) ||
      !Number.isInteger(month) ||
      !Number.isInteger(day) ||
      !Number.isInteger(hour) ||
      !Number.isInteger(minute)
    ) {
      return null;
    }

    const getParts = (date: Date) => {
      const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
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
    };

    const getOffsetMs = (date: Date) => {
      const parts = getParts(date);
      const asUtc = Date.UTC(
        parts.year,
        parts.month - 1,
        parts.day,
        parts.hour,
        parts.minute,
        parts.second
      );

      return asUtc - date.getTime();
    };

    const naiveUtcMs = Date.UTC(year, month - 1, day, hour, minute, 0);
    const initialOffset = getOffsetMs(new Date(naiveUtcMs));
    let utcMs = naiveUtcMs - initialOffset;
    const correctedOffset = getOffsetMs(new Date(utcMs));

    if (correctedOffset !== initialOffset) {
      utcMs = naiveUtcMs - correctedOffset;
    }

    return new Date(utcMs);
  } catch {
    return null;
  }
}

function resolveTransitDate(input: TransitFoundationInput) {
  if (input.transitDateUtc) {
    const resolved =
      input.transitDateUtc instanceof Date
        ? new Date(input.transitDateUtc.getTime())
        : new Date(input.transitDateUtc);

    return Number.isNaN(resolved.getTime()) ? null : resolved;
  }

  if (input.transitDateLocal && input.transitTimeLocal && input.timezone) {
    return toUtcFromLocal(
      input.transitDateLocal,
      input.transitTimeLocal,
      input.timezone
    );
  }

  return null;
}

function buildPlanetEntry(input: {
  planet: string;
  longitude: number;
  sign: string;
  degreeInSign: number;
  nakshatra: string;
  pada: number;
  retrograde: boolean;
  speed: number | null;
}): TransitGocharPlanetEntry {
  return {
    planet: input.planet,
    planetLabel: formatPlanet(input.planet),
    sign: input.sign,
    longitude: input.longitude,
    degreeInSign: input.degreeInSign,
    nakshatra: input.nakshatra,
    pada: input.pada,
    retrograde: input.retrograde,
    speed: input.speed,
  };
}

function buildComparisonReadiness(input: {
  natalChart: UnifiedSiderealChart | null | undefined;
  transitCount: number;
}): TransitGocharComparisonReadiness {
  const natalChartAvailable = Boolean(
    input.natalChart?.verification?.is_verified_for_chart_logic &&
      Array.isArray(input.natalChart?.planets)
  );
  const houseOverlayReady = Boolean(
    natalChartAvailable &&
      Array.isArray(input.natalChart?.houses) &&
      input.natalChart?.houses.length === 12
  );

  return {
    natalChartAvailable,
    houseOverlayReady,
    aspectReadiness: "pending",
    natalPlanetCount: natalChartAvailable ? input.natalChart!.planets.length : 0,
    transitPlanetCount: input.transitCount,
    note:
      "Transit-to-natal comparison hooks are ready, but interpretation is not generated in the foundation layer.",
  };
}

export function buildTransitGocharFoundation(input: TransitFoundationInput): TransitGocharFoundationSnapshot {
  const transitDate = resolveTransitDate(input);

  if (!transitDate) {
    return createAstrologyInfrastructureSnapshot({
      status: "unavailable",
      data: null,
      error: {
        code: "INVALID_AS_OF_UTC",
        message:
          "Transit foundation requires a valid UTC timestamp or a valid local date, time, and timezone.",
      },
    });
  }

  const snapshot = calculateSiderealTransitSnapshot({
    asOfUtc: transitDate,
  });

  if (!snapshot.success) {
    return createAstrologyInfrastructureSnapshot({
      status: "unavailable",
      data: null,
      error: {
        code: snapshot.issue.code,
        message: snapshot.issue.message,
      },
    });
  }

  if (snapshot.data.transits.length !== 12) {
    return createAstrologyInfrastructureSnapshot({
      status: "unavailable",
      data: null,
      error: {
        code: "TRANSIT_CALCULATION_FAILED",
        message:
          "Transit snapshot did not return all 12 planetary bodies required for gochar output.",
      },
    });
  }

  const planets = snapshot.data.transits.map((planet) =>
    buildPlanetEntry({
      planet: planet.planet,
      longitude: planet.longitude,
      sign: planet.sign,
      degreeInSign: planet.degree_in_sign,
      nakshatra: planet.nakshatra,
      pada: planet.pada,
      retrograde: planet.is_retrograde,
      speed: Number.isFinite(planet.longitude_speed) ? planet.longitude_speed : null,
    })
  );
  const transitDateUtc = snapshot.data.as_of_utc;
  const comparisonReadiness = buildComparisonReadiness({
    natalChart: input.natalChart,
    transitCount: planets.length,
  });

  return createAstrologyInfrastructureSnapshot({
    status: "ready",
    data: {
      transitDate: transitDateUtc,
      timezone: input.timezone ?? null,
      location: input.location ?? null,
      planets,
      comparisonReadiness,
      safeSummary: `Transit positions are available for ${planets.length} grahas as of ${new Date(transitDateUtc).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}.`,
      missingReason: null,
    },
  });
}
