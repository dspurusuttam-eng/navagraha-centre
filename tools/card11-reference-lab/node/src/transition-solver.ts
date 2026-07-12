// Card 11.R2 — reusable validation-only transition/root-finding solver (pure).
// Deterministic bisection on circular-angle boundary crossings. NOT a production module.

export type SolveResult = {
  converged: boolean;
  solvedMs: number | null;
  residualDeg: number | null;
  iterations: number;
  status: "CONVERGED" | "NO_BRACKET" | "MAX_ITERS";
};

function norm360(x: number): number {
  return ((x % 360) + 360) % 360;
}

/** Signed distance (deg, in (-span/2, span/2]) from `lon` to the nearest multiple of `span` at `target`. */
function boundaryOffset(lon: number, target: number, span: number): number {
  return (((lon - target) % span) + 1.5 * span) % span - span / 2;
}

/**
 * Find the time (ms epoch) in [t0Ms, t1Ms] where `lonAtMs(t)` crosses `target`
 * (a multiple of `span`). `lonAtMs` returns a longitude in [0,360). Deterministic
 * bisection; convergence when the bracket is under `toleranceMs`.
 */
export function solveCrossing(
  lonAtMs: (ms: number) => number,
  t0Ms: number,
  t1Ms: number,
  target: number,
  span: number,
  toleranceMs = 1000,
  maxIters = 80
): SolveResult {
  const g = (ms: number) => boundaryOffset(lonAtMs(ms), norm360(target), span);
  let a = t0Ms;
  let b = t1Ms;
  let ga = g(a);
  let gb = g(b);
  // require a sign change (a genuine bracket) and no wrap jump between endpoints
  if (!((ga <= 0 && gb >= 0) || (ga >= 0 && gb <= 0)) || Math.abs(ga - gb) > span * 0.9) {
    return { converged: false, solvedMs: null, residualDeg: null, iterations: 0, status: "NO_BRACKET" };
  }
  let iters = 0;
  while (b - a > toleranceMs && iters < maxIters) {
    const m = a + (b - a) / 2;
    const gm = g(m);
    if ((ga <= 0 && gm >= 0) || (ga >= 0 && gm <= 0)) {
      b = m;
      gb = gm;
    } else {
      a = m;
      ga = gm;
    }
    iters += 1;
  }
  const mid = a + (b - a) / 2;
  return {
    converged: b - a <= toleranceMs,
    solvedMs: mid,
    residualDeg: Math.abs(g(mid)),
    iterations: iters,
    status: b - a <= toleranceMs ? "CONVERGED" : "MAX_ITERS",
  };
}
