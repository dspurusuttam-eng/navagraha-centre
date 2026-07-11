// Card 10A.2 — Advanced chart-context adapter (pure).
//
// Normalizes one verified chart into: D1 natal factors, D9 factors (Card 4),
// and active Vimshottari lineage + Sandhi flags (Card 5). No independent
// Ashtakoot/D9/Dasha recomputation — Cards 4/5/10 are consumed. Numeric,
// longitude-derived; no name-string matching. No silent fallback.

import type { UnifiedSiderealChart } from "@/modules/astrology/chart-contract-types";
import {
  buildVargaChart,
  listVargottamaBodies,
} from "@/modules/astrology/divisional";
import type { VargaSourceChart } from "@/modules/astrology/divisional/varga-engine";
import { buildVimshottariActiveLineageForChartContext } from "@/modules/astrology/vimshottari-dasha";
import {
  aspectsHouse,
  dignityOf,
  houseFromSign,
  NATURAL_BENEFICS,
  NATURAL_MALEFICS,
  RELATIONSHIP_KARAKAS,
  signLordOf,
} from "@/modules/astrology/matchmaking/advanced/constants";
import type {
  DashaPeriodContext,
  LayerStatus,
  NatalPersonFactors,
  NavamshaPersonFactors,
  PlanetCondition,
} from "@/modules/astrology/matchmaking/advanced/types";

const CLASSICAL = ["SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN", "RAHU", "KETU"] as const;
const MS_PER_DAY = 86_400_000;

export type AdvancedChartContext = {
  verified: boolean;
  natal: NatalPersonFactors | null;
  d9: NavamshaPersonFactors | null;
  d9Status: LayerStatus;
  dasha: DashaPeriodContext | null;
  dashaStatus: LayerStatus;
  /** D1 sign index per classical body (for mutual comparisons). */
  planetSignIndex: Record<string, number>;
  unavailableReason: string | null;
};

function norm(value: number): number {
  const n = value % 360;
  return n < 0 ? n + 360 : n;
}

function signIndexOf(longitude: number): number {
  return Math.floor(norm(longitude) / 30) % 12;
}

function planetLongitude(chart: UnifiedSiderealChart, name: string): number | null {
  const p = chart.planets?.find((entry) => entry.name?.trim().toUpperCase() === name);
  return p && Number.isFinite(p.longitude) ? p.longitude : null;
}

function conditionFrom(
  signByBody: Record<string, number>,
  houseByBody: Record<string, number>,
  planet: string
): PlanetCondition {
  const signIndex = signByBody[planet] ?? null;
  return {
    planet,
    signIndex,
    house: houseByBody[planet] ?? null,
    dignity: dignityOf(planet, signIndex),
  };
}

function buildNatal(chart: UnifiedSiderealChart): {
  natal: NatalPersonFactors;
  signByBody: Record<string, number>;
} | null {
  if (!Number.isFinite(chart.lagna?.longitude)) {
    return null;
  }

  const lagnaSignIndex = signIndexOf(chart.lagna.longitude);
  const signByBody: Record<string, number> = {};
  const houseByBody: Record<string, number> = {};

  for (const body of CLASSICAL) {
    const lon = planetLongitude(chart, body);
    if (lon === null) continue;
    const sign = signIndexOf(lon);
    signByBody[body] = sign;
    houseByBody[body] = houseFromSign(sign, lagnaSignIndex);
  }

  if (signByBody.MOON === undefined) {
    return null;
  }

  const seventhSignIndex = (lagnaSignIndex + 6) % 12;
  const seventhLord = signLordOf(seventhSignIndex);
  const seventhLordSign = signByBody[seventhLord] ?? null;
  const seventhLordHouse = houseByBody[seventhLord] ?? null;
  const seventhHouseOccupants = CLASSICAL.filter(
    (body) => houseByBody[body] === 7
  );

  // Parashari aspects to the 7th house from each occupied body's house.
  let beneficAspectsSeventh = false;
  let maleficAspectsSeventh = false;
  for (const body of CLASSICAL) {
    const house = houseByBody[body];
    if (house === undefined) continue;
    if (aspectsHouse(body, house, 7)) {
      if (NATURAL_BENEFICS.has(body)) beneficAspectsSeventh = true;
      if (NATURAL_MALEFICS.has(body)) maleficAspectsSeventh = true;
    }
  }
  // Occupants also count as benefic/malefic presence.
  for (const body of seventhHouseOccupants) {
    if (NATURAL_BENEFICS.has(body)) beneficAspectsSeventh = true;
    if (NATURAL_MALEFICS.has(body)) maleficAspectsSeventh = true;
  }

  const natal: NatalPersonFactors = {
    lagnaSignIndex,
    lagnaLord: signLordOf(lagnaSignIndex),
    seventhSignIndex,
    seventhLord,
    seventhLordHouse,
    seventhLordDignity: dignityOf(seventhLord, seventhLordSign),
    seventhHouseOccupants,
    beneficAspectsSeventh,
    maleficAspectsSeventh,
    venus: conditionFrom(signByBody, houseByBody, "VENUS"),
    jupiter: conditionFrom(signByBody, houseByBody, "JUPITER"),
    mars: conditionFrom(signByBody, houseByBody, "MARS"),
    moon: conditionFrom(signByBody, houseByBody, "MOON"),
  };

  return { natal, signByBody };
}

function buildD9(chart: UnifiedSiderealChart): NavamshaPersonFactors | null {
  const varga = buildVargaChart(chart as unknown as VargaSourceChart, "D9");
  if (!varga) {
    return null;
  }

  const d9LagnaSignIndex = varga.ascendant.signIndex;
  const d9SeventhSignIndex = (d9LagnaSignIndex + 6) % 12;
  const bySign: Record<string, number> = {};
  const byHouse: Record<string, number> = {};
  for (const planet of varga.planets) {
    bySign[planet.body] = planet.signIndex;
    byHouse[planet.body] = planet.house;
  }
  const vargottama = listVargottamaBodies(chart as unknown as VargaSourceChart);

  return {
    d9LagnaSignIndex,
    d9LagnaLord: signLordOf(d9LagnaSignIndex),
    d9SeventhSignIndex,
    d9SeventhLord: signLordOf(d9SeventhSignIndex),
    d9Venus: conditionFrom(bySign, byHouse, "VENUS"),
    d9Jupiter: conditionFrom(bySign, byHouse, "JUPITER"),
    d9Mars: conditionFrom(bySign, byHouse, "MARS"),
    vargottamaBodies: vargottama,
  };
}

function buildDasha(
  chart: UnifiedSiderealChart,
  evaluationInstant: string,
  natal: NatalPersonFactors | null
): { dasha: DashaPeriodContext | null; status: LayerStatus } {
  const lineage = buildVimshottariActiveLineageForChartContext({
    chart: chart as never,
    asOfDateUtc: evaluationInstant,
  });

  if (!lineage.success) {
    return { dasha: null, status: "unavailable" };
  }

  const instantMs = new Date(evaluationInstant).getTime();
  const withinDays = (iso: string, days: number) =>
    Math.abs(new Date(iso).getTime() - instantMs) <= days * MS_PER_DAY;
  const maha = lineage.data.mahadasha;
  const antar = lineage.data.antardasha;
  const praty = lineage.data.pratyantardasha;
  const mahaSandhi =
    withinDays(maha.startAtUtc, 45) || withinDays(maha.endAtUtc, 45);
  const antarSandhi =
    withinDays(antar.startAtUtc, 10) || withinDays(antar.endAtUtc, 10);

  const significators = new Set<string>([
    ...RELATIONSHIP_KARAKAS,
    ...(natal?.seventhLord ? [natal.seventhLord] : []),
    ...(natal?.lagnaLord ? [natal.lagnaLord] : []),
  ]);
  const relationshipActivation = [maha.planet, antar.planet, praty.planet].filter(
    (lord) => significators.has(lord)
  );

  return {
    dasha: {
      mahadashaLord: maha.planet,
      antardashaLord: antar.planet,
      pratyantardashaLord: praty.planet,
      relationshipActivation: [...new Set(relationshipActivation)],
      mahaSandhi,
      antarSandhi,
      lineagePath: praty.lineagePath,
    },
    status: "available",
  };
}

export function buildAdvancedChartContext(input: {
  chart: unknown;
  evaluationInstant: string;
}): AdvancedChartContext {
  const empty: AdvancedChartContext = {
    verified: false,
    natal: null,
    d9: null,
    d9Status: "unavailable",
    dasha: null,
    dashaStatus: "unavailable",
    planetSignIndex: {},
    unavailableReason: null,
  };
  const chart = input.chart as UnifiedSiderealChart | null | undefined;

  if (!chart || !Array.isArray(chart.planets)) {
    return { ...empty, unavailableReason: "Chart data is missing." };
  }
  if (!chart.verification?.is_verified_for_chart_logic) {
    return { ...empty, unavailableReason: "Chart is not verified for compatibility." };
  }

  const natalBuild = buildNatal(chart);
  if (!natalBuild) {
    return {
      ...empty,
      verified: true,
      unavailableReason: "Verified chart lacks a usable Lagna or Moon longitude.",
    };
  }

  const d9 = buildD9(chart);
  const dashaResult = buildDasha(chart, input.evaluationInstant, natalBuild.natal);

  return {
    verified: true,
    natal: natalBuild.natal,
    d9,
    d9Status: d9 ? "available" : "unavailable",
    dasha: dashaResult.dasha,
    dashaStatus: dashaResult.status,
    planetSignIndex: natalBuild.signByBody,
    unavailableReason: null,
  };
}
