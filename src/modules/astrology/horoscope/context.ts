// Card 8B — buildHoroscopeChartContext adapter.
//
// The single integration seam: normalizes ONE verified UnifiedSiderealChart
// (+ date/location) into the inputs each dependency engine needs, and resolves
// their authoritative outputs. No dependency math is re-derived here; no silent
// fallback (every missing source is marked unavailable with a reason).
//
// Ephemeris-backed layers (Panchang, Gochar) resolve live on Node 22; on a
// non-ephemeris host they return unavailable honestly. Injected snapshots make
// the whole aggregation deterministically testable without Swiss Ephemeris.

import type { UnifiedSiderealChart } from "@/modules/astrology/chart-contract-types";
import {
  buildVimshottariActiveLineageForChartContext,
} from "@/modules/astrology/vimshottari-dasha";
import type { VimshottariActiveLineage } from "@/lib/astrology/rules/dasha";
import {
  buildAshtakavargaSnapshot,
  type AshtakavargaSnapshot,
} from "@/modules/astrology/ashtakavarga";
import {
  buildGocharSnapshot,
  houseFromReference,
  rashiIndex,
  type GocharSampler,
  type GocharSnapshot,
} from "@/modules/astrology/gochar";
import {
  calculateDailyPanchangContext,
  type PanchangContextOutput,
  type PanchangContextResult,
  type PanchangLocationInput,
} from "@/modules/panchang";
import {
  buildVargaChart,
  type VargaChart,
  type VargaCode,
} from "@/modules/astrology/divisional";
import type { VargaSourceChart } from "@/modules/astrology/divisional/varga-engine";
import { CATEGORY_SIGNIFICATORS } from "@/modules/astrology/horoscope/rules";
import type {
  HoroscopeUnavailableReason,
  SystemReadiness,
} from "@/modules/astrology/horoscope/types";

export type ResolvedNatal = {
  lagnaSign: number;
  lagnaLongitude: number;
  moonSign: number;
  moonLongitude: number;
  planetSign: Record<string, number>;
  planetHouseFromLagna: Record<string, number>;
  /** houseSign[h-1] = rashi index (0..11) occupying house h (whole-sign). */
  houseSign: number[];
};

export type LayerState<T> =
  | { ready: true; data: T; provenance: string }
  | { ready: false; code: string; reason: string };

export type HoroscopeChartContext = {
  chartContextStatus: "verified" | "unverified" | "invalid";
  localDate: string;
  timezone: string | null;
  location: PanchangLocationInput | null;
  queryInstant: string | null;
  dayInstantFallback: boolean;
  natal: ResolvedNatal | null;
  dasha: LayerState<VimshottariActiveLineage>;
  ashtakavarga: LayerState<AshtakavargaSnapshot>;
  gochar: LayerState<GocharSnapshot>;
  panchang: LayerState<PanchangContextOutput>;
  divisional: Record<string, LayerState<VargaChart>>;
  sourceSystems: Record<string, SystemReadiness>;
  unavailableReasons: HoroscopeUnavailableReason[];
  provenance: Record<string, string>;
};

export type BuildHoroscopeChartContextInput = {
  chart: UnifiedSiderealChart | null | undefined;
  localDate: string;
  location: PanchangLocationInput;
  asOfInstant?: Date | string;
  injected?: {
    panchang?: PanchangContextResult;
    gocharSampler?: GocharSampler;
    gocharSnapshot?: GocharSnapshot;
  };
};

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function unavailable<T>(code: string, reason: string): LayerState<T> {
  return { ready: false, code, reason };
}

function resolveNatal(chart: UnifiedSiderealChart): ResolvedNatal | null {
  if (!chart.lagna || !Number.isFinite(chart.lagna.longitude)) {
    return null;
  }

  const lagnaLongitude = chart.lagna.longitude;
  const lagnaSign = rashiIndex(lagnaLongitude);
  const planetSign: Record<string, number> = {};
  const planetHouseFromLagna: Record<string, number> = {};
  let moonSign = -1;
  let moonLongitude = Number.NaN;

  for (const planet of chart.planets ?? []) {
    if (typeof planet.name !== "string" || !Number.isFinite(planet.longitude)) {
      continue;
    }

    const name = planet.name.trim().toUpperCase();
    const sign = rashiIndex(planet.longitude);

    planetSign[name] = sign;
    planetHouseFromLagna[name] = houseFromReference(sign, lagnaSign);

    if (name === "MOON") {
      moonSign = sign;
      moonLongitude = planet.longitude;
    }
  }

  if (moonSign < 0 || !Number.isFinite(moonLongitude)) {
    return null;
  }

  const houseSign = Array.from({ length: 12 }, (_, index) => (lagnaSign + index) % 12);

  return {
    lagnaSign,
    lagnaLongitude,
    moonSign,
    moonLongitude,
    planetSign,
    planetHouseFromLagna,
    houseSign,
  };
}

function fallbackInstant(localDate: string): string {
  const match = localDate.match(DATE_RE);

  if (!match) {
    return new Date(Number.NaN).toISOString();
  }

  // Rough sunrise proxy at 06:00 UTC of the civil date. Only used when Panchang
  // is unavailable; always accompanied by dayInstantFallback = true.
  const utc = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 6, 0, 0);

  return new Date(utc).toISOString();
}

function requiredVargaCodes(): VargaCode[] {
  const codes = new Set<VargaCode>();

  for (const significator of Object.values(CATEGORY_SIGNIFICATORS)) {
    if (significator.varga) {
      codes.add(significator.varga);
    }
  }

  return [...codes];
}

export function buildHoroscopeChartContext(
  input: BuildHoroscopeChartContextInput
): HoroscopeChartContext {
  const localDate = input.localDate?.trim() ?? "";
  const timezone = input.location?.timezoneIana ?? null;
  const unavailableReasons: HoroscopeUnavailableReason[] = [];

  const pushReason = (system: string, code: string, message: string) => {
    unavailableReasons.push({ system, code, message });
  };

  // --- Chart context status --------------------------------------------------
  const chart = input.chart ?? null;
  let chartContextStatus: HoroscopeChartContext["chartContextStatus"] = "verified";

  if (!chart || !chart.lagna || !Array.isArray(chart.planets)) {
    chartContextStatus = "invalid";
  } else if (!chart.verification?.is_verified_for_chart_logic) {
    chartContextStatus = "unverified";
  }

  const natal = chartContextStatus === "verified" ? resolveNatal(chart!) : null;

  if (chartContextStatus === "verified" && !natal) {
    chartContextStatus = "invalid";
    pushReason(
      "natal",
      "NATAL_RESOLUTION_FAILED",
      "Verified chart is missing a usable Lagna or Moon longitude."
    );
  }

  // --- Panchang (also yields the canonical sunrise instant) ------------------
  const panchangResult: PanchangContextResult =
    input.injected?.panchang ??
    calculateDailyPanchangContext({ dateLocal: localDate, location: input.location });

  let panchang: LayerState<PanchangContextOutput>;

  if (panchangResult.success) {
    panchang = {
      ready: true,
      data: panchangResult.data,
      provenance: "card2:panchang",
    };
  } else {
    panchang = unavailable("PANCHANG_UNAVAILABLE", panchangResult.error.message);
    pushReason("panchang", panchangResult.error.code, panchangResult.error.message);
  }

  // --- Canonical query instant (sunrise -> asOfInstant -> flagged fallback) --
  let queryInstant: string | null = null;
  let dayInstantFallback = false;

  if (panchang.ready) {
    queryInstant = panchang.data.sunrise?.utc ?? null;
  }

  if (!queryInstant && input.asOfInstant) {
    const parsed =
      input.asOfInstant instanceof Date
        ? input.asOfInstant
        : new Date(input.asOfInstant);

    queryInstant = Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  if (!queryInstant) {
    const fallback = fallbackInstant(localDate);

    if (!Number.isNaN(new Date(fallback).getTime())) {
      queryInstant = fallback;
      dayInstantFallback = true;
    }
  }

  // --- Dasha (pure) ----------------------------------------------------------
  let dasha: LayerState<VimshottariActiveLineage>;

  if (chartContextStatus !== "verified") {
    dasha = unavailable("CHART_UNAVAILABLE", "Verified chart required for Vimshottari lineage.");
  } else if (!queryInstant) {
    dasha = unavailable("NO_QUERY_INSTANT", "No usable query instant to resolve the active dasha.");
  } else {
    const lineage = buildVimshottariActiveLineageForChartContext({
      chart: chart!,
      asOfDateUtc: queryInstant,
    });

    dasha = lineage.success
      ? { ready: true, data: lineage.data, provenance: "card5:vimshottari" }
      : unavailable(lineage.error.code, lineage.error.message);

    if (!lineage.success) {
      pushReason("vimshottari", lineage.error.code, lineage.error.message);
    }
  }

  // --- Ashtakavarga (pure) ---------------------------------------------------
  let ashtakavarga: LayerState<AshtakavargaSnapshot>;

  if (chartContextStatus !== "verified") {
    ashtakavarga = unavailable("CHART_UNAVAILABLE", "Verified chart required for Ashtakavarga.");
  } else {
    const av = buildAshtakavargaSnapshot({ chart: chart! });

    ashtakavarga = av.success
      ? { ready: true, data: av.data, provenance: "card7:ashtakavarga" }
      : unavailable(av.error.code, av.error.message);

    if (!av.success) {
      pushReason("ashtakavarga", av.error.code, av.error.message);
    }
  }

  // --- Gochar (ephemeris; injectable) ---------------------------------------
  let gochar: LayerState<GocharSnapshot>;

  if (input.injected?.gocharSnapshot) {
    gochar = {
      ready: true,
      data: input.injected.gocharSnapshot,
      provenance: "card6:gochar:injected",
    };
  } else if (chartContextStatus !== "verified" || !natal) {
    gochar = unavailable("CHART_UNAVAILABLE", "Verified chart required for Gochar.");
  } else if (!queryInstant) {
    gochar = unavailable("NO_QUERY_INSTANT", "No usable query instant to resolve transits.");
  } else {
    const snapshot = buildGocharSnapshot({
      natalMoonLongitude: natal.moonLongitude,
      natalLagnaLongitude: natal.lagnaLongitude,
      queryInstant,
      sampler: input.injected?.gocharSampler,
      resolveIngress: false,
      resolveSadeSatiWindow: false,
    });

    gochar = snapshot.success
      ? { ready: true, data: snapshot.data, provenance: "card6:gochar" }
      : unavailable(snapshot.issue.code, snapshot.issue.message);

    if (!snapshot.success) {
      pushReason("gochar", snapshot.issue.code, snapshot.issue.message);
    }
  }

  // --- Divisional (pure) -----------------------------------------------------
  const divisional: Record<string, LayerState<VargaChart>> = {};

  if (chartContextStatus === "verified") {
    for (const code of requiredVargaCodes()) {
      const varga = buildVargaChart(chart as unknown as VargaSourceChart, code);

      divisional[code] = varga
        ? { ready: true, data: varga, provenance: "card4:shodashvarga" }
        : unavailable("VARGA_UNAVAILABLE", `Divisional chart ${code} could not be computed.`);
    }
  } else {
    for (const code of requiredVargaCodes()) {
      divisional[code] = unavailable("CHART_UNAVAILABLE", "Verified chart required for divisional charts.");
    }
  }

  // --- Source-system readiness map ------------------------------------------
  const divisionalReady = Object.values(divisional).some((state) => state.ready);
  const sourceSystems: Record<string, SystemReadiness> = {
    natal: chartContextStatus === "verified" ? "ready" : "unavailable",
    vimshottari: dasha.ready ? "ready" : "unavailable",
    gocharFromMoon: gochar.ready ? "ready" : "unavailable",
    gocharFromLagna: gochar.ready ? "ready" : "unavailable",
    sadeSati: gochar.ready ? "ready" : "unavailable",
    ashtakavargaBAV: ashtakavarga.ready ? "ready" : "unavailable",
    ashtakavargaSAV: ashtakavarga.ready ? "ready" : "unavailable",
    panchang: panchang.ready ? "ready" : "unavailable",
    divisional: divisionalReady ? "ready" : "unavailable",
  };

  const provenance: Record<string, string> = {
    contract: "card8b:premium-daily-horoscope",
    conventions: "LAHIRI/whole-sign/TRUE_NODE/365.2425/SAV337",
  };

  if (panchang.ready) provenance.panchang = panchang.provenance;
  if (dasha.ready) provenance.vimshottari = dasha.provenance;
  if (gochar.ready) provenance.gochar = gochar.provenance;
  if (ashtakavarga.ready) provenance.ashtakavarga = ashtakavarga.provenance;
  if (divisionalReady) provenance.divisional = "card4:shodashvarga";

  return {
    chartContextStatus,
    localDate,
    timezone,
    location: input.location ?? null,
    queryInstant,
    dayInstantFallback,
    natal,
    dasha,
    ashtakavarga,
    gochar,
    panchang,
    divisional,
    sourceSystems,
    unavailableReasons,
    provenance,
  };
}
