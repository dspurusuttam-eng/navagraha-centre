// Card 11.R1 — normalization contract (pure). Isolated validation lab only.

export const SIGN_SPAN = 30;
export const NAK_SPAN = 360 / 27; // 13°20'
export const PADA_SPAN = NAK_SPAN / 4; // 3°20'

export function norm360(x: number): number {
  return ((x % 360) + 360) % 360;
}

/** Minimum angular separation in [0,180]. 359.999 vs 0.001 => 0.002. */
export function circularDiffDeg(a: number, b: number): number {
  const d = Math.abs(norm360(a) - norm360(b)) % 360;
  return d > 180 ? 360 - d : d;
}

/** Signed circular difference (a-b) in (-180,180]. */
export function signedCircularDiff(a: number, b: number): number {
  let d = (norm360(a) - norm360(b) + 540) % 360 - 180;
  if (d === -180) d = 180;
  return d;
}

export const ARCSEC = 1 / 3600;
export function degToArcsec(d: number): number {
  return d * 3600;
}
export function degToArcmin(d: number): number {
  return d * 60;
}

export function rashiIndex(lon: number): number {
  return Math.floor(norm360(lon) / SIGN_SPAN); // 0..11
}
export function nakshatraIndex(lon: number): number {
  return Math.floor(norm360(lon) / NAK_SPAN) % 27; // 0..26
}
export function padaIndex(lon: number): number {
  const within = norm360(lon) % NAK_SPAN;
  return Math.min(4, Math.floor(within / PADA_SPAN) + 1); // 1..4
}

/** Distance (deg) to the nearest boundary of a lattice of given span. */
export function distanceToBoundary(lon: number, span: number): number {
  const within = norm360(lon) % span;
  return Math.min(within, span - within);
}

export function boundaryDistances(lon: number) {
  return {
    rashiDeg: distanceToBoundary(lon, SIGN_SPAN),
    nakshatraDeg: distanceToBoundary(lon, NAK_SPAN),
    padaDeg: distanceToBoundary(lon, PADA_SPAN),
  };
}
