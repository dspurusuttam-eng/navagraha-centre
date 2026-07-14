// Card 14.2B1 — shared angular geometry (pure, deterministic).
/** Normalize to [0, 360). */
export function norm360(deg: number): number {
  const x = deg % 360;
  return x < 0 ? x + 360 : x;
}
/** Normalize to (-180, 180]. */
export function norm180(deg: number): number {
  let x = norm360(deg);
  if (x > 180) x -= 360;
  return x;
}
/** Minimal unsigned separation in [0, 180]. */
export function minimalSeparation(a: number, b: number): number {
  const d = norm360(a - b);
  return Math.min(d, 360 - d);
}
/** Sign index 0..11 (Aries..Pisces) from a sidereal longitude. */
export function signIndexFromLongitude(deg: number): number {
  return Math.floor(norm360(deg) / 30);
}
