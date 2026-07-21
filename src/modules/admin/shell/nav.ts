// Claude Admin Console C3B1 — admin shell navigation config + active-state resolver (pure).
export type AdminNavItem = { key: string; label: string; href: string };

export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/admin" },
  { key: "desk", label: "Desk", href: "/admin/desk" },
  { key: "consultation", label: "Consultation", href: "/admin/consultation" },
  { key: "media", label: "Media", href: "/admin/media" },
  { key: "notifications", label: "Notifications", href: "/admin/notifications" },
  { key: "analytics", label: "Analytics", href: "/admin/analytics" },
  { key: "settings", label: "Settings", href: "/admin/settings" },
];

/**
 * Resolve the active nav key for a pathname. `/admin` matches Dashboard exactly;
 * the other sections match on prefix (`/admin/desk/x` → desk). Longest href wins.
 * Returns null for admin routes not in the primary nav (e.g. /admin/login).
 */
export function resolveActiveNavKey(pathname: string): string | null {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/admin") return "dashboard";
  let match: AdminNavItem | null = null;
  for (const item of ADMIN_NAV_ITEMS) {
    if (item.href === "/admin") continue;
    if (path === item.href || path.startsWith(`${item.href}/`)) {
      if (!match || item.href.length > match.href.length) match = item;
    }
  }
  return match?.key ?? null;
}
