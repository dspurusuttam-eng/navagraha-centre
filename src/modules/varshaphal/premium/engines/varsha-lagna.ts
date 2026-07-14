// Card 14.2B1 — Varsha Lagna (annual ascendant) engine (pure). Contract §7.
// Sidereal ascendant (Lahiri) + whole-sign houses at the solar-return instant.
// The ascendant is injected (swisseph-backed in production); null signals an
// undefined ascendant (e.g. beyond the polar latitude bound).
import { VARSHAPHAL_MAX_ABS_LATITUDE_DEG, zodiacSignOrder } from "@/modules/varshaphal/premium/constants";
import type { ZodiacSign } from "@/modules/astrology/types";
import type { VarshaphalEvidenceToken } from "@/modules/varshaphal/premium/types";
import { buildToken, type EngineUnavailable } from "@/modules/varshaphal/premium/engines/token";
import { norm360, signIndexFromLongitude } from "@/modules/varshaphal/premium/engines/geometry";

export type VarshaLagnaInput = {
  returnInstantUtcMs: number;
  latitudeDeg: number;
  longitudeDeg: number;
  /** Injected: sidereal ascendant longitude (deg, Lahiri); null when undefined. */
  ascendantSiderealLongitudeAt: (utcMs: number, latitudeDeg: number, longitudeDeg: number) => number | null;
};

export type VarshaLagnaResult = {
  status: "CALCULATED" | "UNAVAILABLE";
  ascendantLongitudeDeg: number | null;
  signIndex: number | null;
  sign: ZodiacSign | null;
  tokens: VarshaphalEvidenceToken[];
  unavailableReasons: EngineUnavailable[];
};

export function computeVarshaLagna(input: VarshaLagnaInput): VarshaLagnaResult {
  const { returnInstantUtcMs, latitudeDeg, longitudeDeg, ascendantSiderealLongitudeAt } = input;
  const tokens: VarshaphalEvidenceToken[] = [];
  const unavailableReasons: EngineUnavailable[] = [];

  if (!Number.isFinite(latitudeDeg) || Math.abs(latitudeDeg) > VARSHAPHAL_MAX_ABS_LATITUDE_DEG) {
    unavailableReasons.push({ code: "HIGH_LATITUDE_ASCENDANT", message: `Latitude ${latitudeDeg} beyond +/-${VARSHAPHAL_MAX_ABS_LATITUDE_DEG}; ascendant undefined.` });
    return { status: "UNAVAILABLE", ascendantLongitudeDeg: null, signIndex: null, sign: null, tokens, unavailableReasons };
  }

  const raw = ascendantSiderealLongitudeAt(returnInstantUtcMs, latitudeDeg, longitudeDeg);
  if (raw == null || !Number.isFinite(raw)) {
    unavailableReasons.push({ code: "HIGH_LATITUDE_ASCENDANT", message: "Ascendant unavailable for the return instant/location." });
    return { status: "UNAVAILABLE", ascendantLongitudeDeg: null, signIndex: null, sign: null, tokens, unavailableReasons };
  }

  const ascendantLongitudeDeg = norm360(raw);
  const signIndex = signIndexFromLongitude(ascendantLongitudeDeg);
  const sign = zodiacSignOrder[signIndex]!;
  tokens.push(buildToken("VARSHA_LAGNA_V1", "VARSHA_LAGNA", 0, "NEUTRAL",
    `Varsha Lagna ${ascendantLongitudeDeg.toFixed(4)} deg in ${sign} (whole-sign houses)`, ["VARSHA_LAGNA", signIndex]));

  return { status: "CALCULATED", ascendantLongitudeDeg, signIndex, sign, tokens, unavailableReasons };
}
