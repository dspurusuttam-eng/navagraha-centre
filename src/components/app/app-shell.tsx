"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/modules/auth/components/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

type AppShellProps = {
  userName: string;
  userEmail: string;
  children: React.ReactNode;
};

export function AppShell({
  userName,
  userEmail,
  children,
}: Readonly<AppShellProps>) {
  const pathname = usePathname();

  return (
    <Container className="space-y-8 py-[var(--space-8)] sm:py-[var(--space-10)]">
      <Card className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="space-y-4">
          <Badge tone="accent">Protected App Shell</Badge>
          <div className="space-y-2">
            <h1
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              Welcome back, {userName}
            </h1>
            <p className="text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {userEmail}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:items-end">
          <nav
            aria-label="App navigation"
            className="flex flex-wrap items-center gap-2"
          >
            {siteConfig.appNav.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" &&
                  pathname.startsWith(`${item.href}/`));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-[var(--radius-pill)] border px-4 py-2 text-[0.76rem] uppercase tracking-[var(--tracking-label)] transition [transition-duration:var(--motion-duration-base)]",
                    isActive
                      ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent-soft)] text-[color:var(--color-foreground)]"
                      : "border-[color:var(--color-border)] text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)]"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <SignOutButton tone="secondary" size="sm" />
        </div>
      </Card>

      {children}
    </Container>
  );
}
