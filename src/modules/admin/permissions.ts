export const adminRoleKeys = ["founder", "editor", "support"] as const;

export type AdminRoleKey = (typeof adminRoleKeys)[number];

export type AdminRoleSummary = {
  key: string;
  name: string;
};

export type AdminRouteDefinition = {
  href: string;
  label: string;
  description: string;
  allowedRoles: readonly AdminRoleKey[];
};

export const adminRouteCatalog = [
  {
    href: "/admin",
    label: "Overview",
    description:
      "Operations summary, workflow queues, and recent audit activity.",
    allowedRoles: ["founder", "editor", "support"],
  },
  {
    href: "/admin/users",
    label: "Users",
    description: "Review accounts, role assignments, and member readiness.",
    allowedRoles: ["founder"],
  },
  {
    href: "/admin/kundlis",
    label: "Kundlis",
    description:
      "Review safe saved Kundli summaries, active profile flags, and recent chart activity.",
    allowedRoles: ["founder", "support"],
  },
  {
    href: "/admin/reports",
    label: "Reports",
    description:
      "Inspect safe premium report generation history and access state snapshots.",
    allowedRoles: ["founder", "support"],
  },
  {
    href: "/admin/consultations",
    label: "Consultations",
    description: "Manage consultation requests, notes, and session statuses.",
    allowedRoles: ["founder", "support"],
  },
  {
    href: "/admin/content",
    label: "Content",
    description:
      "Manage editorial records and the From the Desk content surface.",
    allowedRoles: ["founder", "editor"],
  },
  {
    href: "/admin/rashifal",
    label: "Daily Rashifal",
    description:
      "Review manual daily Rashifal publishing entries and template coverage.",
    allowedRoles: ["founder", "editor"],
  },
  {
    href: "/admin/orders",
    label: "Orders",
    description:
      "Review order and payment states with internal fulfillment notes.",
    allowedRoles: ["founder", "support"],
  },
  {
    href: "/admin/astrologer-copilot",
    label: "Astrologer Copilot",
    description:
      "Generate grounded consultation briefs and recap drafts for manual sessions.",
    allowedRoles: ["founder", "support"],
  },
  {
    href: "/admin/bookings",
    label: "Bookings",
    description:
      "Monitor slot inventory, confirmed bookings, and availability.",
    allowedRoles: ["founder", "support"],
  },
  {
    href: "/admin/products",
    label: "Products",
    description:
      "Control catalog visibility, merchandising, and featured items.",
    allowedRoles: ["founder"],
  },
  {
    href: "/admin/remedies",
    label: "Remedies",
    description: "Publish or hold approved remedies and featured guidance.",
    allowedRoles: ["founder", "editor"],
  },
  {
    href: "/admin/articles",
    label: "Articles",
    description:
      "Move editorial records through review and publication states.",
    allowedRoles: ["founder", "editor"],
  },
  {
    href: "/admin/ai-settings",
    label: "AI Templates",
    description:
      "Track prompt versions and promote approved template revisions.",
    allowedRoles: ["founder", "editor"],
  },
  {
    href: "/admin/settings",
    label: "Settings",
    description:
      "Review operational health, counts, and admin readiness snapshots.",
    allowedRoles: ["founder", "support"],
  },
] as const satisfies readonly AdminRouteDefinition[];

export function hasAdminAccess(
  adminRoles: readonly Pick<AdminRoleSummary, "key">[],
  allowedRoles: readonly AdminRoleKey[]
) {
  const roleKeys = new Set(adminRoles.map((role) => role.key));

  return (
    roleKeys.has("founder") ||
    allowedRoles.some((roleKey) => roleKeys.has(roleKey))
  );
}

export function getVisibleAdminRoutes(
  adminRoles: readonly Pick<AdminRoleSummary, "key">[]
) {
  return adminRouteCatalog.filter((route) =>
    hasAdminAccess(adminRoles, route.allowedRoles)
  );
}

export function getPrimaryAdminRoleLabel(
  adminRoles: readonly AdminRoleSummary[]
) {
  return adminRoles[0]?.name ?? "Admin";
}
