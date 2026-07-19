/**
 * The single approved visitor-facing commercial statement for NAVAGRAHA CENTRE.
 *
 * Exact capitalisation and punctuation are locked. Every public surface (Home
 * hero, Consultation hero, Android/TWA app) renders this constant rather than a
 * hand-written string, so the sentence can never drift again.
 */
export const COMMERCIAL_MESSAGE = "One-time case fee. Complete Solution. No Clock Running.";

/**
 * Superseded commercial phrasings. Admin-controlled copy (the consultation
 * "short description") is still authored freely, but any line that is one of
 * these retired variants — or a partial of the approved sentence — is dropped
 * before render so a stale string cannot reappear in the HTML or RSC payload.
 */
const RETIRED_COMMERCIAL_FRAGMENTS: readonly string[] = [
  "one fee",
  "complete solution",
  "no clock running",
  "one-time case fee",
  "one time case fee",
  "per-minute billing",
  "per minute billing",
  "not billed per minute",
];

function normalise(line: string) {
  return line
    .toLowerCase()
    .replace(/[·•|]/g, " ")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** True when an admin-authored line is a retired/partial commercial statement. */
export function isRetiredCommercialLine(line: string): boolean {
  const normalised = normalise(line);
  if (!normalised) return true;
  return RETIRED_COMMERCIAL_FRAGMENTS.some((fragment) =>
    normalised.includes(normalise(fragment))
  );
}

/**
 * Resolve the hero copy for a public page: the approved sentence first, then any
 * admin-authored supporting lines that are not retired commercial variants.
 */
export function resolveHeroTaglines(adminShortDescription: string | null | undefined): string[] {
  const supporting = (adminShortDescription ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !isRetiredCommercialLine(line));

  return [COMMERCIAL_MESSAGE, ...supporting];
}
