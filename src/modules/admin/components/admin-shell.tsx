import type { ReactNode } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { buttonStyles } from "@/components/ui/button";
import {
  getPrimaryAdminRoleLabel,
  getVisibleAdminRoutes,
  type AdminRoleSummary,
} from "@/modules/admin/permissions";

type AdminShellProps = {
  userName: string;
  userEmail: string;
  adminRoles: readonly AdminRoleSummary[];
  children: ReactNode;
};

export function AdminShell({
  userName,
  userEmail,
  adminRoles,
  children,
}: Readonly<AdminShellProps>) {
  const visibleRoutes = getVisibleAdminRoutes(adminRoles);

  return (
    <Container className="py-[var(--space-10)]">
      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
          <Card tone="accent" className="space-y-5">
            <div className="space-y-3">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Control Panel
              </p>
              <div className="space-y-2">
                <h2
                  className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
                  style={{ letterSpacing: "var(--tracking-display)" }}
                >
                  {userName}
                </h2>
                <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                  {userEmail}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Role Boundary
              </p>
              <div className="flex flex-wrap gap-2">
                {adminRoles.map((role) => (
                  <Badge key={role.key} tone="outline">
                    {role.name}
                  </Badge>
                ))}
              </div>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                The current admin session is operating with{" "}
                <span className="text-[color:var(--color-foreground)]">
                  {getPrimaryAdminRoleLabel(adminRoles)}
                </span>{" "}
                access, and every management action is re-checked server-side.
              </p>
            </div>

            <Link
              href="/dashboard"
              className={buttonStyles({
                tone: "secondary",
                size: "sm",
                className: "w-full",
              })}
            >
              Back To Member Dashboard
            </Link>
          </Card>

          <Card className="space-y-4">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Admin Navigation
            </p>
            <nav
              aria-label="Admin control panel navigation"
              className="space-y-3"
            >
              {visibleRoutes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className="block rounded-[var(--radius-xl)] border border-[color:var(--color-border)] px-4 py-4 transition [transition-duration:var(--motion-duration-base)] hover:border-[color:var(--color-border-strong)] hover:bg-[rgba(255,255,255,0.025)]"
                >
                  <p className="text-[0.78rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                    {route.label}
                  </p>
                  <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                    {route.description}
                  </p>
                </Link>
              ))}
            </nav>
          </Card>
        </aside>

        <div className="space-y-6">{children}</div>
      </div>
    </Container>
  );
}
