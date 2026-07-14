// Card 14.2B2 — Mudda (Varsha Vimshottari) Maha + Antar Dasha (pure). Contract §14.
// Reuses the certified Vimshottari sequence + year table, scaled to the solar-year length.
import {
  MUDDA_DASHA_SEQUENCE,
  MUDDA_DASHA_YEARS,
  MUDDA_VIMSHOTTARI_TOTAL_YEARS,
} from "@/modules/varshaphal/premium/constants";
import type { ClassicalPlanetaryBody } from "@/modules/astrology/types";
import type { VarshaphalEvidenceToken } from "@/modules/varshaphal/premium/types";
import { buildToken, type EngineUnavailable } from "@/modules/varshaphal/premium/engines/token";

const DAY_MS = 86_400_000;

export type MuddaAntar = { lord: ClassicalPlanetaryBody; startUtcMs: number; endUtcMs: number; days: number };
export type MuddaMaha = { lord: ClassicalPlanetaryBody; startUtcMs: number; endUtcMs: number; days: number; antar: MuddaAntar[] };

export type MuddaDashaInput = {
  /** Moon-nakshatra lord at the Varsha Pravesha instant. */
  startLord: ClassicalPlanetaryBody;
  /** Solar-year length in days (return-to-return interval; §14). */
  yearLengthDays: number;
  /** UTC ms of the Varsha Pravesha instant (dasha origin). */
  returnInstantUtcMs: number;
  /** Optional balance: fraction (0..1) of the start lord's period already elapsed at return. */
  startLordElapsedFraction?: number | null;
};

export type MuddaDashaResult = {
  status: "CALCULATED" | "UNAVAILABLE";
  maha: MuddaMaha[];
  totalDays: number;
  tokens: VarshaphalEvidenceToken[];
  unavailableReasons: EngineUnavailable[];
};

function rotate(start: ClassicalPlanetaryBody): ClassicalPlanetaryBody[] {
  const i = MUDDA_DASHA_SEQUENCE.indexOf(start);
  return [...MUDDA_DASHA_SEQUENCE.slice(i), ...MUDDA_DASHA_SEQUENCE.slice(0, i)];
}

function fullDays(lord: ClassicalPlanetaryBody, yearLengthDays: number): number {
  return (MUDDA_DASHA_YEARS[lord] / MUDDA_VIMSHOTTARI_TOTAL_YEARS) * yearLengthDays;
}

function buildAntar(mahaLord: ClassicalPlanetaryBody, mahaDays: number, startMs: number): MuddaAntar[] {
  // Antar proportions mirror Vimshottari, starting from the maha lord.
  const order = rotate(mahaLord);
  const out: MuddaAntar[] = [];
  let cursor = startMs;
  for (const sub of order) {
    const days = (MUDDA_DASHA_YEARS[sub] / MUDDA_VIMSHOTTARI_TOTAL_YEARS) * mahaDays;
    const endMs = cursor + days * DAY_MS;
    out.push({ lord: sub, startUtcMs: Math.round(cursor), endUtcMs: Math.round(endMs), days });
    cursor = endMs;
  }
  return out;
}

export function computeMuddaDasha(input: MuddaDashaInput): MuddaDashaResult {
  const { startLord, yearLengthDays, returnInstantUtcMs, startLordElapsedFraction } = input;
  const tokens: VarshaphalEvidenceToken[] = [];
  const unavailableReasons: EngineUnavailable[] = [];

  if (!(yearLengthDays > 0) || !Number.isFinite(yearLengthDays) || MUDDA_DASHA_SEQUENCE.indexOf(startLord) < 0) {
    unavailableReasons.push({ code: "MUDDA_YEAR_LENGTH", message: "Invalid solar-year length or start lord for Mudda Dasha." });
    return { status: "UNAVAILABLE", maha: [], totalDays: 0, tokens, unavailableReasons };
  }

  const e = startLordElapsedFraction != null && startLordElapsedFraction > 0 && startLordElapsedFraction < 1 ? startLordElapsedFraction : 0;
  const order = rotate(startLord);

  // Sequence of (lord, days): partial-first balance appended at the end so the sum stays = year.
  const plan: Array<{ lord: ClassicalPlanetaryBody; days: number }> = [];
  if (e > 0) {
    plan.push({ lord: startLord, days: fullDays(startLord, yearLengthDays) * (1 - e) });
    for (let i = 1; i < order.length; i += 1) plan.push({ lord: order[i]!, days: fullDays(order[i]!, yearLengthDays) });
    plan.push({ lord: startLord, days: fullDays(startLord, yearLengthDays) * e });
  } else {
    for (const lord of order) plan.push({ lord, days: fullDays(lord, yearLengthDays) });
  }

  let cursor = returnInstantUtcMs;
  const maha: MuddaMaha[] = [];
  for (const { lord, days } of plan) {
    const startMs = cursor;
    const endMs = cursor + days * DAY_MS;
    maha.push({ lord, startUtcMs: Math.round(startMs), endUtcMs: Math.round(endMs), days, antar: buildAntar(lord, days, startMs) });
    cursor = endMs;
  }

  const totalDays = maha.reduce((acc, m) => acc + m.days, 0);
  tokens.push(buildToken("MUDDA_DASHA_V1", "MUDDA_DASHA", 0, "NEUTRAL",
    `Mudda Dasha from ${startLord}; ${maha.length} maha periods over ${yearLengthDays.toFixed(4)} days`, ["MUDDA", startLord]));
  tokens.push(buildToken("MUDDA_YEAR_LENGTH_V1", "MUDDA_DASHA", 0, "NEUTRAL",
    `Year length ${yearLengthDays.toFixed(4)} days (return-to-return)`, ["MUDDA_YEAR", Math.round(yearLengthDays)]));

  return { status: "CALCULATED", maha, totalDays, tokens, unavailableReasons };
}
