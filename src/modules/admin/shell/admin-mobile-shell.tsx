"use client";

// Claude Admin Console C3B1 — protected mobile-first admin shell (client).
// Accessible drawer nav (hamburger with aria-expanded/aria-controls), active state via
// aria-current, skip link, and ≥44px touch targets. Fluid at 360 / 390 / 430 px.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ADMIN_NAV_ITEMS, resolveActiveNavKey } from "@/modules/admin/shell/nav";

type AdminMobileShellProps = {
  userName: string;
  userEmail: string;
  roleLabel: string;
  logout: ReactNode;
  children: ReactNode;
};

export function AdminMobileShell({
  userName,
  userEmail,
  roleLabel,
  logout,
  children,
}: Readonly<AdminMobileShellProps>) {
  const pathname = usePathname();
  const activeKey = resolveActiveNavKey(pathname);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-neutral-900 focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-white px-4 py-3 lg:hidden">
        <span className="text-sm font-semibold tracking-wide">Admin Console</span>
        <button
          type="button"
          aria-expanded={menuOpen}
          aria-controls="admin-nav-drawer"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setMenuOpen((value) => !value)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border"
        >
          <span aria-hidden="true">{menuOpen ? "✕" : "☰"}</span>
        </button>
      </header>

      <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
        <nav
          id="admin-nav-drawer"
          aria-label="Admin navigation"
          className={`${menuOpen ? "block" : "hidden"} border-b bg-white lg:sticky lg:top-0 lg:block lg:h-screen lg:border-b-0 lg:border-r`}
        >
          <div className="hidden px-5 py-5 lg:block">
            <span className="text-sm font-semibold tracking-wide">Admin Console</span>
          </div>
          <div className="px-5 pb-4 pt-4 lg:pt-0">
            <p className="truncate text-sm font-medium">{userName}</p>
            <p className="truncate text-xs text-neutral-500">{userEmail}</p>
            <p className="mt-1 text-[0.7rem] uppercase tracking-wide text-neutral-500">{roleLabel}</p>
          </div>
          <ul className="space-y-1 px-3 pb-4">
            {ADMIN_NAV_ITEMS.map((item) => {
              const active = item.key === activeKey;
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMenuOpen(false)}
                    className={`flex min-h-11 items-center rounded-md px-3 py-2 text-sm ${
                      active ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li className="mt-2 border-t px-1 pt-3">{logout}</li>
          </ul>
        </nav>

        <main id="admin-main" className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
