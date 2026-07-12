// Card 12.1 — pinned numerology tables & matrices (immutable, versioned).

// Chaldean letter values (Cheiro). CRITICAL RULE: no letter maps to 9 in Chaldean;
// 9 occurs only as a compound total. (CHALDEAN_NO_9_LETTER)
export const CHALDEAN_TABLE: Readonly<Record<string, number>> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

// Pythagorean letter values (A=1..I=9, J=1..R=9, S=1..Z=8).
export const PYTHAGOREAN_TABLE: Readonly<Record<string, number>> = {
  A: 1, J: 1, S: 1,
  B: 2, K: 2, T: 2,
  C: 3, L: 3, U: 3,
  D: 4, M: 4, V: 4,
  E: 5, N: 5, W: 5,
  F: 6, O: 6, X: 6,
  G: 7, P: 7, Y: 7,
  H: 8, Q: 8, Z: 8,
  I: 9, R: 9,
};

// V1 vowel policy: A,E,I,O,U are vowels; Y and W are consonants (deterministic).
export const VOWELS_V1: ReadonlySet<string> = new Set(["A", "E", "I", "O", "U"]);

export const MASTER_NUMBERS: ReadonlySet<number> = new Set([11, 22, 33]);

// Lo Shu (Saturn/Saraswati) 3x3 arrangement of the digits 1..9.
export const LO_SHU_ARRANGEMENT: readonly (readonly number[])[] = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6],
];

export const LO_SHU_LINES: ReadonlyArray<{ id: string; type: "ROW" | "COLUMN" | "DIAGONAL"; cells: readonly number[] }> = [
  { id: "ROW_TOP", type: "ROW", cells: [4, 9, 2] },
  { id: "ROW_MID", type: "ROW", cells: [3, 5, 7] },
  { id: "ROW_BOT", type: "ROW", cells: [8, 1, 6] },
  { id: "COL_LEFT", type: "COLUMN", cells: [4, 3, 8] },
  { id: "COL_MID", type: "COLUMN", cells: [9, 5, 1] },
  { id: "COL_RIGHT", type: "COLUMN", cells: [2, 7, 6] },
  { id: "DIAG_MAIN", type: "DIAGONAL", cells: [4, 5, 6] },
  { id: "DIAG_ANTI", type: "DIAGONAL", cells: [2, 5, 8] },
];

// Planetary rulership per numerology digit (documented basis for the matrix).
export const DIGIT_PLANET: Readonly<Record<number, string>> = {
  1: "SUN", 2: "MOON", 3: "JUPITER", 4: "RAHU", 5: "MERCURY",
  6: "VENUS", 7: "KETU", 8: "SATURN", 9: "MARS",
};

type Rel = "SUPPORTIVE" | "NEUTRAL" | "CHALLENGING";

// Symmetric relationship matrix built from unordered pair sets so symmetry is guaranteed
// by construction (COMPAT_MATRIX_SYMMETRIC_V1). Basis: PRODUCT_NORMALIZED (no specific
// classical source is registered for this exact 81-cell matrix; label is honest per
// Card 12 governance). The friend/enemy pairs draw on the planetary rulership pattern
// documented in DIGIT_PLANET; self-pairs are SUPPORTIVE; everything not listed is NEUTRAL.
const FRIEND_PAIRS: ReadonlyArray<readonly [number, number]> = [
  [1, 2], [1, 3], [1, 5], [1, 9],
  [2, 4], [2, 6], [2, 7],
  [3, 6], [3, 7], [3, 9],
  [4, 5], [4, 8],
  [5, 6], [5, 8],
  [6, 7], [6, 8],
];
const ENEMY_PAIRS: ReadonlyArray<readonly [number, number]> = [
  [1, 8], [2, 8], [2, 9], [3, 4], [4, 9], [7, 9],
];

function buildMatrix(): Record<number, Record<number, Rel>> {
  const m: Record<number, Record<number, Rel>> = {};
  for (let a = 1; a <= 9; a += 1) {
    m[a] = {};
    for (let b = 1; b <= 9; b += 1) m[a]![b] = a === b ? "SUPPORTIVE" : "NEUTRAL";
  }
  const set = (pairs: ReadonlyArray<readonly [number, number]>, rel: Rel) => {
    for (const [a, b] of pairs) { m[a]![b] = rel; m[b]![a] = rel; }
  };
  set(FRIEND_PAIRS, "SUPPORTIVE");
  set(ENEMY_PAIRS, "CHALLENGING");
  return m;
}

export const COMPATIBILITY_MATRIX_V1: Readonly<Record<number, Readonly<Record<number, Rel>>>> = buildMatrix();
