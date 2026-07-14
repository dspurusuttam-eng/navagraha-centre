// Card 14.2C — Varshaphal V1 orchestrator (pure, deterministic).
// Wires every V1 engine over an INJECTED ephemeris (the swisseph-backed adapter in
// production; a synthetic one in QA). Returns a versioned snapshot with structured
// evidence, rule IDs, provenance + rulebook hash, and honest partial/unavailable
// states. No narrative, no prediction, no percentages.
import {
  COMBUSTION_ARC_SOURCE,
  VARSHESHA_CANDIDATES,
  signRulerMap,
  type VarsheshaCandidateId,
} from "@/modules/varshaphal/premium/constants";
import { computeVarshaphalRulebookHash } from "@/modules/varshaphal/premium/rule-registry";
import {
  VARSHAPHAL_PREMIUM_CONTRACT_VERSION,
  VARSHAPHAL_PREMIUM_DISCLAIMER,
  type TajikaGraha,
  type VarshaphalEvidenceToken,
  type VarshaphalProvenance,
  type VarshaphalResultStatus,
} from "@/modules/varshaphal/premium/types";
import type { ClassicalPlanetaryBody } from "@/modules/astrology/types";
import {
  computeDinratri, computeMuntha, computePanchavargeeyaBala, computeMuddaDasha, computeVarshaLagna,
  evaluateCombustion, evaluateTajikaAspect, evaluateTajikaYogas, findSolarReturn,
  selectVarshesha,
  type CombustionResult, type DetectedYoga, type DinratriResult, type MunthaResult, type PanchavargeeyaResult,
  type MuddaDashaResult, type SolarReturnResult, type SunriseSunset, type VarsheshaResult, type VarshaLagnaResult,
  type YogaPlanet,
} from "@/modules/varshaphal/premium/engines";

const DAY_MS = 86_400_000;
const TAJIKA_GRAHAS: TajikaGraha[] = ["SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN"];

export type PlanetState = { longitudeDeg: number; speedDegPerDay: number };

export type VarshaphalEphemeris = {
  sunSiderealLongitudeAtUtcMs: (utcMs: number) => number;
  ascendantSiderealLongitudeAt: (utcMs: number, latitudeDeg: number, longitudeDeg: number) => number | null;
  planetSiderealStatesAtUtcMs: (utcMs: number) => Record<TajikaGraha, PlanetState>;
  /** Card 9 sunrise/sunset (UTC ms) of the return's local civil day; null → day/night indeterminate. */
  sunriseSunsetAt: (utcMs: number, latitudeDeg: number, longitudeDeg: number) => SunriseSunset | null;
};

export type VarshaphalOrchestratorInput = {
  natal: {
    sunLongitudeDeg: number;
    lagnaLongitudeDeg: number | null;
    instantUtcMs: number;
    latitudeDeg: number;
    longitudeDeg: number;
    janmaLagnaLord: TajikaGraha | null;
  };
  yearNumber: number;
  ephemeris: VarshaphalEphemeris;
  /** Card 4 divisional sign indices per graha (D3/D9); absent → Panchavargeeya partial. */
  divisional?: Partial<Record<TajikaGraha, { d3SignIndex: number | null; d9SignIndex: number | null }>>;
  /** Card 9: Moon-nakshatra lord at the return instant; absent → Mudda partial. */
  moonNakshatraLordAtReturn?: ClassicalPlanetaryBody | null;
  moonNakshatraElapsedFraction?: number | null;
  /** Certified combustion arcs (deg) per graha, injected by reference (§10). */
  combustionArcByGraha?: Partial<Record<TajikaGraha, number | null>>;
};

export type VarshaphalSnapshot = {
  status: VarshaphalResultStatus;
  contractVersion: typeof VARSHAPHAL_PREMIUM_CONTRACT_VERSION;
  yearNumber: number;
  solarReturn: SolarReturnResult;
  varshaLagna: VarshaLagnaResult | null;
  muntha: MunthaResult | null;
  dinratri: DinratriResult | null;
  planetStates: Record<TajikaGraha, PlanetState> | null;
  panchavargeeya: Record<string, PanchavargeeyaResult> | null;
  combustion: Record<string, CombustionResult> | null;
  yogas: DetectedYoga[];
  varshesha: VarsheshaResult | null;
  muddaDasha: MuddaDashaResult | null;
  tokens: VarshaphalEvidenceToken[];
  partialFlags: string[];
  unavailableReasons: Array<{ code: string; message: string }>;
  provenance: VarshaphalProvenance;
  disclaimer: string;
};

function provenance(): VarshaphalProvenance {
  return {
    contractVersion: VARSHAPHAL_PREMIUM_CONTRACT_VERSION,
    ayanamsa: "LAHIRI",
    node: "TRUE",
    houseSystem: "WHOLE_SIGN",
    returnToleranceArcsec: 0.001,
    rulebookHash: computeVarshaphalRulebookHash(),
  };
}

function emptySnapshot(input: VarshaphalOrchestratorInput, solarReturn: SolarReturnResult): VarshaphalSnapshot {
  return {
    status: "UNAVAILABLE_INVALID_INPUT",
    contractVersion: VARSHAPHAL_PREMIUM_CONTRACT_VERSION,
    yearNumber: input.yearNumber,
    solarReturn,
    varshaLagna: null, muntha: null, dinratri: null, planetStates: null, panchavargeeya: null, combustion: null,
    yogas: [], varshesha: null, muddaDasha: null,
    tokens: [...solarReturn.tokens],
    partialFlags: [],
    unavailableReasons: [...solarReturn.unavailableReasons],
    provenance: provenance(),
    disclaimer: VARSHAPHAL_PREMIUM_DISCLAIMER,
  };
}

export function buildVarshaphalSnapshot(input: VarshaphalOrchestratorInput): VarshaphalSnapshot {
  const { natal, yearNumber, ephemeris } = input;
  const tokens: VarshaphalEvidenceToken[] = [];
  const partialFlags = new Set<string>();
  const unavailable: Array<{ code: string; message: string }> = [];

  // --- 1. Solar return (fail-closed) ---
  const solarReturn = findSolarReturn({
    natalSunLongitudeDeg: natal.sunLongitudeDeg,
    natalInstantUtcMs: natal.instantUtcMs,
    yearNumber,
    sunSiderealLongitudeAtUtcMs: ephemeris.sunSiderealLongitudeAtUtcMs,
  });
  if (solarReturn.status === "UNAVAILABLE" || solarReturn.returnInstantUtcMs === null) {
    return emptySnapshot(input, solarReturn);
  }
  tokens.push(...solarReturn.tokens);
  const returnMs = solarReturn.returnInstantUtcMs;

  // --- 2. Planet states at the return ---
  const planetStates = ephemeris.planetSiderealStatesAtUtcMs(returnMs);

  // --- 3. Varsha Lagna ---
  const varshaLagna = computeVarshaLagna({
    returnInstantUtcMs: returnMs, latitudeDeg: natal.latitudeDeg, longitudeDeg: natal.longitudeDeg,
    ascendantSiderealLongitudeAt: ephemeris.ascendantSiderealLongitudeAt,
  });
  tokens.push(...varshaLagna.tokens);
  for (const u of varshaLagna.unavailableReasons) unavailable.push(u);

  // --- 4. Muntha ---
  const muntha = computeMuntha({
    natalLagnaLongitudeDeg: natal.lagnaLongitudeDeg, yearNumber, varshaLagnaSignIndex: varshaLagna.signIndex,
  });
  tokens.push(...muntha.tokens);
  muntha.partialFlags.forEach((f) => partialFlags.add(f));
  for (const u of muntha.unavailableReasons) unavailable.push(u);

  // --- 5. Panchavargeeya Bala (per graha) ---
  const longitudes = Object.fromEntries(TAJIKA_GRAHAS.map((g) => [g, planetStates[g].longitudeDeg])) as Record<TajikaGraha, number>;
  const panchavargeeya: Record<string, PanchavargeeyaResult> = {};
  for (const g of TAJIKA_GRAHAS) {
    const d = input.divisional?.[g];
    const r = computePanchavargeeyaBala({ graha: g, longitudes, d3SignIndex: d?.d3SignIndex ?? null, d9SignIndex: d?.d9SignIndex ?? null });
    panchavargeeya[g] = r;
    tokens.push(...r.tokens);
    r.partialFlags.forEach((f) => partialFlags.add(f));
  }

  // --- 6. Combustion (certified arcs injected by reference) ---
  const combustion: Record<string, CombustionResult> = {};
  const sunLon = planetStates.SUN.longitudeDeg;
  for (const g of TAJIKA_GRAHAS) {
    const arc = input.combustionArcByGraha?.[g] ?? null;
    combustion[g] = evaluateCombustion({ graha: g, planetLongitudeDeg: planetStates[g].longitudeDeg, sunLongitudeDeg: sunLon, combustionArcDeg: arc });
    tokens.push(...combustion[g]!.tokens);
  }
  if (!input.combustionArcByGraha) partialFlags.add(`COMBUSTION_ARCS_NOT_PROVIDED_${COMBUSTION_ARC_SOURCE.symbol}`);

  // --- 7. Dinratri (day/night) + Trirashi-pati from Card 9 sunrise/sunset ---
  const sunriseSunset = ephemeris.sunriseSunsetAt(returnMs, natal.latitudeDeg, natal.longitudeDeg);
  const dinratri = computeDinratri({ returnInstantUtcMs: returnMs, sunriseSunset, varshaLagnaSignIndex: varshaLagna.signIndex });
  tokens.push(...dinratri.tokens);
  for (const u of dinratri.unavailableReasons) unavailable.push(u);

  // --- 8. Key lords ---
  const munthaLord = (muntha.lord ?? null) as TajikaGraha | null;
  const varshaLagnaLord = varshaLagna.sign ? (signRulerMap[varshaLagna.sign] as TajikaGraha) : null;
  const janmaLagnaLord = natal.janmaLagnaLord;
  const dinaratriLord = dinratri.dinratriLord;
  const trirashiPati = dinratri.trirashiPati;

  const asPlanet = (g: TajikaGraha): YogaPlanet => ({ graha: g, longitudeDeg: planetStates[g].longitudeDeg, speedDegPerDay: planetStates[g].speedDegPerDay });
  const activeAspect = (a: TajikaGraha | null, b: TajikaGraha | null): boolean =>
    a !== null && b !== null && a !== b && evaluateTajikaAspect(asPlanet(a), asPlanet(b)).active;

  // --- 8. Tajika yogas (default significators: Varsha Lagna lord + Muntha lord) ---
  let yogas: DetectedYoga[] = [];
  if (varshaLagnaLord && munthaLord) {
    const planets = Object.fromEntries(TAJIKA_GRAHAS.map((g) => [g, asPlanet(g)])) as Partial<Record<TajikaGraha, YogaPlanet>>;
    const yr = evaluateTajikaYogas({ significatorA: varshaLagnaLord, significatorB: munthaLord, planets });
    yogas = yr.yogas;
    tokens.push(...yr.tokens);
    yr.partialFlags.forEach((f) => partialFlags.add(f));
  } else {
    partialFlags.add("YOGAS_SIGNIFICATOR_UNAVAILABLE");
  }

  // --- 9. Varshesha ---
  const eligible = (g: TajikaGraha | null): boolean =>
    g !== null && (g === munthaLord || g === varshaLagnaLord || g === janmaLagnaLord || activeAspect(g, munthaLord) || activeAspect(g, varshaLagnaLord));
  const lordFor = (id: VarsheshaCandidateId): TajikaGraha | null => {
    switch (id) {
      case "MUNTHA_LORD": return munthaLord;
      case "VARSHA_LAGNA_LORD": return varshaLagnaLord;
      case "JANMA_LAGNA_LORD": return janmaLagnaLord;
      case "TRIRASHI_PATI": return trirashiPati;
      case "DINARATRI_LORD": return dinaratriLord;
      default: return null;
    }
  };
  const candidates = VARSHESHA_CANDIDATES.map((id) => {
    const graha = lordFor(id);
    return { id, graha, balaVishwa: graha ? (panchavargeeya[graha]?.totalVishwa ?? null) : null, hasIthasalaWithMunthaOrLagnaLord: eligible(graha) };
  });
  const varshesha = selectVarshesha(candidates);
  tokens.push(...varshesha.tokens);
  for (const u of varshesha.unavailableReasons) unavailable.push(u);
  if (varshesha.status === "PARTIAL") partialFlags.add("VARSHESHA_PARTIAL");

  // --- 10. Mudda Maha/Antar Dasha (year length via the next return) ---
  let muddaDasha: MuddaDashaResult | null = null;
  if (input.moonNakshatraLordAtReturn) {
    const nextReturn = findSolarReturn({
      natalSunLongitudeDeg: natal.sunLongitudeDeg, natalInstantUtcMs: natal.instantUtcMs,
      yearNumber: yearNumber + 1, sunSiderealLongitudeAtUtcMs: ephemeris.sunSiderealLongitudeAtUtcMs,
    });
    if (nextReturn.status === "CONVERGED" && nextReturn.returnInstantUtcMs !== null) {
      const yearLengthDays = (nextReturn.returnInstantUtcMs - returnMs) / DAY_MS;
      muddaDasha = computeMuddaDasha({
        startLord: input.moonNakshatraLordAtReturn, yearLengthDays, returnInstantUtcMs: returnMs,
        startLordElapsedFraction: input.moonNakshatraElapsedFraction ?? null,
      });
      tokens.push(...muddaDasha.tokens);
      for (const u of muddaDasha.unavailableReasons) unavailable.push(u);
    } else {
      unavailable.push({ code: "MUDDA_YEAR_LENGTH", message: "Next solar return did not converge; Mudda year length unavailable." });
    }
  } else {
    partialFlags.add("MISSING_MOON_NAKSHATRA_LORD");
  }

  const status: VarshaphalResultStatus = unavailable.length > 0 || partialFlags.size > 0 ? "PARTIAL" : "CALCULATED";

  return {
    status,
    contractVersion: VARSHAPHAL_PREMIUM_CONTRACT_VERSION,
    yearNumber,
    solarReturn, varshaLagna, muntha, dinratri, planetStates, panchavargeeya, combustion, yogas, varshesha, muddaDasha,
    tokens,
    partialFlags: [...partialFlags].sort(),
    unavailableReasons: unavailable,
    provenance: provenance(),
    disclaimer: VARSHAPHAL_PREMIUM_DISCLAIMER,
  };
}
