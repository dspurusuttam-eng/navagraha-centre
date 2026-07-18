// Claude Admin Console C3A1 — safe post-login redirect handling (pure).
// Only same-origin paths under the private /admin namespace are permitted; anything
// else (external, protocol-relative, backslash, whitespace/control chars, or the auth
// pages themselves) falls back to the admin home. Hyphens are allowed in admin slugs.
const DEFAULT_TARGET = "/admin";
const DISALLOWED_TARGETS = new Set(["/admin/login", "/admin/denied"]);

/** True if the string contains whitespace, ASCII control chars, or DEL. */
function hasUnsafeChars(value: string): boolean {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code <= 0x20 || code === 0x7f) return true;
  }
  return false;
}

export function sanitizeAdminRedirect(target: string | null | undefined, fallback = DEFAULT_TARGET): string {
  if (typeof target !== "string") return fallback;
  const value = target.trim();
  if (!value) return fallback;
  if (value.startsWith("//") || value.includes("://") || value.includes("\\") || hasUnsafeChars(value)) {
    return fallback;
  }
  if (value !== "/admin" && !value.startsWith("/admin/")) return fallback;
  if (DISALLOWED_TARGETS.has(value)) return fallback;
  return value;
}
