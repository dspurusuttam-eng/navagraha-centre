// Card 11.R5 — observability / fail-closed guards (VALIDATION-ONLY, pure).
// Each guard returns a structured result or throws a structured GuardError — never a
// silent guess. Mirrors the production R3 guards (sidereal restore, rise/set no-event)
// and adds provider-mode, asset, checksum, kernel-range, and civil-time checks.

export type GuardCode =
  | "PROVIDER_MODE_UNEXPECTED"
  | "EPHEMERIS_ASSET_MISSING"
  | "KERNEL_CHECKSUM_MISMATCH"
  | "RISESET_INVALID_TIMESTAMP"
  | "SIDEREAL_STATE_NOT_RESTORED"
  | "CIVIL_TIME_AMBIGUOUS"
  | "CIVIL_TIME_NONEXISTENT"
  | "REFERENCE_ASSET_UNSUPPORTED"
  | "KERNEL_DATE_OUT_OF_RANGE";

export class GuardError extends Error {
  code: GuardCode;
  detail: Record<string, unknown>;
  constructor(code: GuardCode, message: string, detail: Record<string, unknown> = {}) {
    super(message);
    this.name = "GuardError";
    this.code = code;
    this.detail = detail;
  }
}

/** Active ephemeris provider/mode must be the sanctioned one; a silent fallback fails closed. */
export function assertProviderMode(mode: string, expected = "SWISSEPH"): void {
  if (mode !== expected) throw new GuardError("PROVIDER_MODE_UNEXPECTED", `Unexpected ephemeris mode '${mode}' (expected ${expected}); silent fallback is not permitted.`, { mode, expected });
}

export function assertEphemerisAsset(exists: boolean, path: string): void {
  if (!exists) throw new GuardError("EPHEMERIS_ASSET_MISSING", `Required ephemeris asset missing: ${path}`, { path });
}

export function assertKernelChecksum(actual: string, expected: string): void {
  if (actual !== expected) throw new GuardError("KERNEL_CHECKSUM_MISMATCH", "JPL kernel SHA-256 mismatch; refusing to proceed.", { actual, expected });
}

/** swe_rise_trans folds its no-event flag (-2) into transitTime; a valid JD is > 0. */
export function riseSetTimestampStatus(transitTime: number | null | undefined): { available: boolean; reason?: string } {
  if (transitTime == null || !Number.isFinite(transitTime) || transitTime <= 0) {
    return { available: false, reason: "no-event (circumpolar / midnight-sun / polar-night)" };
  }
  return { available: true };
}

/** After any sidereal calculation the global mode must be the canonical one. */
export function assertSiderealRestored(currentModeId: number, canonicalModeId: number): void {
  if (currentModeId !== canonicalModeId) throw new GuardError("SIDEREAL_STATE_NOT_RESTORED", `Sidereal mode ${currentModeId} left un-restored (canonical ${canonicalModeId}).`, { currentModeId, canonicalModeId });
}

/** Civil-time status must be OK; ambiguous/nonexistent fail explicitly. */
export function assertCivilResolvable(status: "OK" | "AMBIGUOUS" | "NONEXISTENT", civil: string, tz: string): void {
  if (status === "AMBIGUOUS") throw new GuardError("CIVIL_TIME_AMBIGUOUS", `Ambiguous civil time (DST fall-back overlap): ${civil} ${tz}`, { civil, tz });
  if (status === "NONEXISTENT") throw new GuardError("CIVIL_TIME_NONEXISTENT", `Nonexistent civil time (DST spring-forward gap): ${civil} ${tz}`, { civil, tz });
}

export function assertKernelDateInRange(jd: number, startJd: number, endJd: number): void {
  if (jd < startJd || jd > endJd) throw new GuardError("KERNEL_DATE_OUT_OF_RANGE", `Julian day ${jd} outside kernel range [${startJd}, ${endJd}].`, { jd, startJd, endJd });
}

export function assertReferenceAssetSupported(assetId: string, supported: string[]): void {
  if (!supported.includes(assetId)) throw new GuardError("REFERENCE_ASSET_UNSUPPORTED", `Reference asset '${assetId}' is not in the supported set.`, { assetId, supported });
}
