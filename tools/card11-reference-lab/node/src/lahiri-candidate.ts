// Card 11.R1 — Gate G2 independent Lahiri candidate: "lahiri-navagraha-v1-candidate".
// PROTOTYPE ONLY — never adopted as production output. Compared against the UNCHANGED
// production SE Lahiri (swe_get_ayanamsa_ut) for continuity measurement.
//
// Definition: mean-Chitrapaksha / ICRC-1955 sidereal zero-point, precessing per the
// IAU 2006 (Capitaine et al. 2003) accumulated general precession in longitude p_A,
// with the additive constant ANCHORED to the production SE Lahiri value at J2000.
//   ayanamsa(jd) = anchorJ2000 + p_A(T)/3600   (degrees), T = Julian centuries from J2000.
// TT~=UT approximation used for T (Delta-T effect on p_A is < 0.001" over 1900-2100).

export const J2000 = 2451545.0;

/** IAU 2006 accumulated general precession in longitude, arcsec. T in centuries from J2000. */
export function precessionLongitudeArcsec(T: number): number {
  return (
    5028.796195 * T +
    1.1054348 * T * T +
    0.00007964 * T ** 3 -
    0.000023857 * T ** 4 -
    0.0000000383 * T ** 5
  );
}

export function candidateAyanamsaDeg(jd: number, anchorJ2000Deg: number): number {
  const T = (jd - J2000) / 36525.0;
  return anchorJ2000Deg + precessionLongitudeArcsec(T) / 3600.0;
}

/** Least-squares linear calibration of the residual (candidate - production) vs T.
 * Returns the calibrated residual series (removes best-fit linear drift), showing the
 * achievable continuity once a rate term is fitted to SE (a Card 11.R2 refinement). */
export function linearDetrend(
  points: Array<{ T: number; residualArcsec: number }>
): { a: number; b: number; calibratedArcsec: number[] } {
  const n = points.length;
  const sumT = points.reduce((s, p) => s + p.T, 0);
  const sumR = points.reduce((s, p) => s + p.residualArcsec, 0);
  const sumTT = points.reduce((s, p) => s + p.T * p.T, 0);
  const sumTR = points.reduce((s, p) => s + p.T * p.residualArcsec, 0);
  const denom = n * sumTT - sumT * sumT;
  const b = denom === 0 ? 0 : (n * sumTR - sumT * sumR) / denom; // slope
  const a = (sumR - b * sumT) / n; // intercept
  const calibratedArcsec = points.map((p) => p.residualArcsec - (a + b * p.T));
  return { a, b, calibratedArcsec };
}
