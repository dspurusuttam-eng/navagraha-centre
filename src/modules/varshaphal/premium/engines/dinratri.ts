// Card 14.2C1 — Dinratri (day/night) + Trirashi-pati from sunrise/sunset (pure).
// Contract §13 / §13.1A. Day/night is decided by the Varsha Pravesha instant vs the
// local sunrise/sunset (Card 9); the Hindu Vara (weekday) is sunrise-bounded. When
// sunrise/sunset is indeterminate the whole block returns a structured UNAVAILABLE
// (no fabricated day/night, no fabricated lords).
import { SIGN_TRIPLICITY, TRIRASHI_LORDS, VARA_LORDS, zodiacSignOrder } from "@/modules/varshaphal/premium/constants";
import type { TajikaGraha, VarshaphalEvidenceToken } from "@/modules/varshaphal/premium/types";
import { buildToken, type EngineUnavailable } from "@/modules/varshaphal/premium/engines/token";

export type SunriseSunset = { sunriseUtcMs: number; sunsetUtcMs: number };

export type DinratriInput = {
  returnInstantUtcMs: number;
  /** Sunrise/sunset of the local civil day of the return (Card 9); null → indeterminate. */
  sunriseSunset: SunriseSunset | null;
  /** Varsha Lagna sign index (for the Trirashi triplicity); null → Trirashi omitted. */
  varshaLagnaSignIndex: number | null;
};

export type DinratriResult = {
  status: "CALCULATED" | "UNAVAILABLE";
  dayNight: "DAY" | "NIGHT" | null;
  dinratriLord: TajikaGraha | null;
  trirashiPati: TajikaGraha | null;
  tokens: VarshaphalEvidenceToken[];
  unavailableReasons: EngineUnavailable[];
};

export function computeDinratri(input: DinratriInput): DinratriResult {
  const { returnInstantUtcMs, sunriseSunset, varshaLagnaSignIndex } = input;
  const tokens: VarshaphalEvidenceToken[] = [];
  const unavailableReasons: EngineUnavailable[] = [];

  if (!sunriseSunset || !Number.isFinite(sunriseSunset.sunriseUtcMs) || !Number.isFinite(sunriseSunset.sunsetUtcMs)) {
    unavailableReasons.push({ code: "DAY_NIGHT_INDETERMINATE", message: "Sunrise/sunset unavailable; day/night, Dinratri and Trirashi-pati indeterminate." });
    return { status: "UNAVAILABLE", dayNight: null, dinratriLord: null, trirashiPati: null, tokens, unavailableReasons };
  }

  const { sunriseUtcMs, sunsetUtcMs } = sunriseSunset;
  const dayNight: "DAY" | "NIGHT" = returnInstantUtcMs >= sunriseUtcMs && returnInstantUtcMs < sunsetUtcMs ? "DAY" : "NIGHT";

  // Hindu Vara is sunrise-bounded: before sunrise the ruling weekday is the previous one.
  const sunriseWeekday = new Date(sunriseUtcMs).getUTCDay();
  const hinduWeekday = returnInstantUtcMs >= sunriseUtcMs ? sunriseWeekday : (sunriseWeekday + 6) % 7;
  const dinratriLord = VARA_LORDS[hinduWeekday]!;
  tokens.push(buildToken("DINARATRI_LORD_V1", "VARSHESHA", 0, "NEUTRAL",
    `Dinratri lord ${dinratriLord} (Hindu weekday ${hinduWeekday}, ${dayNight})`, ["DINARATRI", hinduWeekday, dinratriLord]));

  let trirashiPati: TajikaGraha | null = null;
  if (varshaLagnaSignIndex != null && Number.isInteger(varshaLagnaSignIndex) && varshaLagnaSignIndex >= 0 && varshaLagnaSignIndex < 12) {
    const trip = SIGN_TRIPLICITY[zodiacSignOrder[varshaLagnaSignIndex]!];
    trirashiPati = dayNight === "DAY" ? TRIRASHI_LORDS[trip].day : TRIRASHI_LORDS[trip].night;
    tokens.push(buildToken("TRIRASHI_PATI_V1", "VARSHESHA", 0, "NEUTRAL",
      `Trirashi-pati ${trirashiPati} (${trip} ${dayNight})`, ["TRIRASHI", trip, dayNight, trirashiPati]));
  }

  return { status: "CALCULATED", dayNight, dinratriLord, trirashiPati, tokens, unavailableReasons };
}
