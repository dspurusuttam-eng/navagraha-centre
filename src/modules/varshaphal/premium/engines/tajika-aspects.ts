// Card 14.2B1 — Tajika aspect engine (pure). Contract §9 / 14.1A.
// Degree-based aspects with deeptamsha half-sum orbs; applying (Ithasala) vs
// separating (Ishrafa) from the signed closing rate (retrograde handled naturally
// because speeds carry sign).
import { DEEPTAMSHA, TAJIKA_ASPECT_ANGLES, type TajikaAspectAngle } from "@/modules/varshaphal/premium/constants";
import type { TajikaGraha, VarshaphalEvidenceToken } from "@/modules/varshaphal/premium/types";
import { buildToken } from "@/modules/varshaphal/premium/engines/token";
import { minimalSeparation, norm180, norm360 } from "@/modules/varshaphal/premium/engines/geometry";

/** ~0.0003 deg (about 1 arcsec) — inside this the aspect is treated as EXACT. */
const EXACT_EPSILON_DEG = 1 / 3600;

export type AspectBody = {
  graha: TajikaGraha;
  longitudeDeg: number;
  /** Ecliptic speed deg/day; negative = retrograde. */
  speedDegPerDay: number;
};

export type TajikaAspectMotion = "APPLYING" | "SEPARATING" | "EXACT";

export type TajikaAspectResult = {
  active: boolean;
  angle: TajikaAspectAngle | null;
  separationDeg: number;
  orbAllowedDeg: number;
  orbDeltaDeg: number;
  motion: TajikaAspectMotion | null;
  degreesToExact: number | null;
  fasterGraha: TajikaGraha;
  tokens: VarshaphalEvidenceToken[];
};

export function evaluateTajikaAspect(a: AspectBody, b: AspectBody): TajikaAspectResult {
  const tokens: VarshaphalEvidenceToken[] = [];
  const separationDeg = minimalSeparation(a.longitudeDeg, b.longitudeDeg); // [0,180]
  const orbAllowedDeg = (DEEPTAMSHA[a.graha] + DEEPTAMSHA[b.graha]) / 2;
  const fasterGraha = Math.abs(a.speedDegPerDay) >= Math.abs(b.speedDegPerDay) ? a.graha : b.graha;

  // Match the closest aspect angle that is within orb.
  let angle: TajikaAspectAngle | null = null;
  let orbDeltaDeg = Number.POSITIVE_INFINITY;
  for (const candidate of TAJIKA_ASPECT_ANGLES) {
    const delta = Math.abs(separationDeg - candidate);
    if (delta <= orbAllowedDeg && delta < orbDeltaDeg) {
      orbDeltaDeg = delta;
      angle = candidate;
    }
  }

  if (angle === null) {
    return { active: false, angle: null, separationDeg, orbAllowedDeg, orbDeltaDeg: Number.isFinite(orbDeltaDeg) ? orbDeltaDeg : separationDeg, motion: null, degreesToExact: null, fasterGraha, tokens };
  }

  // Signed gap to the exact aspect on the branch nearest the actual separation.
  const delta360 = norm360(a.longitudeDeg - b.longitudeDeg); // 0..360
  const branchLo = angle;
  const branchHi = norm360(360 - angle);
  const distLo = Math.abs(norm180(delta360 - branchLo));
  const distHi = Math.abs(norm180(delta360 - branchHi));
  const branch = distLo <= distHi ? branchLo : branchHi;
  const signedGap = norm180(delta360 - branch); // (-180,180]
  const relSpeed = a.speedDegPerDay - b.speedDegPerDay; // d(delta360)/dt
  const degreesToExact = Math.abs(signedGap);

  let motion: TajikaAspectMotion;
  if (degreesToExact <= EXACT_EPSILON_DEG) {
    motion = "EXACT";
  } else {
    // Closing when the gap and the rate have opposite signs (moving toward zero gap).
    const closing = (signedGap > 0 && relSpeed < 0) || (signedGap < 0 && relSpeed > 0);
    motion = closing ? "APPLYING" : "SEPARATING";
  }

  tokens.push(buildToken("TAJIKA_ASPECT_ANGLES_V1", "TAJIKA_ASPECT", 0, "NEUTRAL",
    `${a.graha}-${b.graha} at ${separationDeg.toFixed(3)} deg matches ${angle} deg aspect`, ["ASPECT", a.graha, b.graha, angle]));
  tokens.push(buildToken("DEEPTAMSHA_ORB_V1", "TAJIKA_ASPECT", 0, "NEUTRAL",
    `Orb delta ${orbDeltaDeg.toFixed(3)} within allowed ${orbAllowedDeg.toFixed(3)} (half-sum deeptamsha)`, ["ORB", a.graha, b.graha]));
  tokens.push(buildToken("ITHASALA_ISHRAFA_V1", "TAJIKA_ASPECT", 0, "NEUTRAL",
    `${motion} (faster ${fasterGraha}); ${degreesToExact.toFixed(3)} deg to exact`, ["MOTION", a.graha, b.graha, motion]));

  return { active: true, angle, separationDeg, orbAllowedDeg, orbDeltaDeg, motion, degreesToExact, fasterGraha, tokens };
}
