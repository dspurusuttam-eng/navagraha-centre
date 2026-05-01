"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { buttonStyles, type ButtonSize, type ButtonTone } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { stripLocaleFromPathname } from "@/modules/localization/config";

type NavigationLinkProps = Omit<ComponentProps<typeof Link>, "className"> & {
  activeClassName?: string;
  className?: string;
  size?: ButtonSize;
  tone?: ButtonTone;
};

function getPathnameFromHref(href: ComponentProps<typeof Link>["href"]) {
  if (typeof href !== "string") {
    return href.pathname ?? "/";
  }

  try {
    return new URL(href, "https://navagraha.local").pathname;
  } catch {
    return href.startsWith("/") ? href : `/${href}`;
  }
}

export function NavigationLink({
  activeClassName,
  children,
  className,
  href,
  size = "sm",
  tone = "ghost",
  ...props
}: Readonly<NavigationLinkProps>) {
  const pathname = usePathname();
  const currentPath = stripLocaleFromPathname(pathname ?? "/");
  const targetPath = stripLocaleFromPathname(getPathnameFromHref(href));
  const isActive =
    targetPath === "/"
      ? currentPath === "/"
      : currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);

  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={buttonStyles({
        tone,
        size,
        className: cn(
          className,
          isActive &&
            (activeClassName ??
              "border-[rgba(185,139,70,0.4)] bg-[color:var(--color-accent-soft)] text-[color:var(--color-text-primary)]")
        ),
      })}
      href={href}
      {...props}
    >
      {children}
    </Link>
  );
}
