"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  primaryNavigationFeatures,
  type FeatureIconKey,
} from "@/config/feature-status-registry";
import { navagrahaIconRegistry } from "@/components/icons/navagraha-icon-registry";
import {
  defaultLocale,
  getLocalizedPath,
  stripLocaleFromPathname,
  type SupportedLocale,
} from "@/modules/localization/config";
import { cn } from "@/lib/cn";

export type MobileBottomActionBarProps = {
  locale: SupportedLocale;
  hasExplicitLocalePrefix: boolean;
};

function localizeHref(
  locale: SupportedLocale,
  hasExplicitLocalePrefix: boolean,
  href: string
) {
  return getLocalizedPath(locale, href, {
    forcePrefix: locale !== defaultLocale || hasExplicitLocalePrefix,
  });
}

function normalizePathname(pathname: string | null) {
  if (!pathname) {
    return "/";
  }

  const stripped = stripLocaleFromPathname(pathname);
  const trimmed = stripped.trim().replace(/\/+$/, "");

  return trimmed.length ? trimmed : "/";
}

function isActiveHref(pathname: string, href: string) {
  const normalizedHref = normalizePathname(href);

  return normalizedHref === "/"
    ? pathname === normalizedHref || pathname === `${normalizedHref}/`
    : pathname === normalizedHref || pathname.startsWith(`${normalizedHref}/`);
}

function getFeatureIconPath(iconKey: FeatureIconKey) {
  if (iconKey === "text-fallback") {
    return null;
  }

  return (
    navagrahaIconRegistry.find(
      (icon) =>
        icon.featureName === iconKey && icon.availabilityStatus === "available"
    )?.repositoryPath ?? null
  );
}

function FeatureIcon({
  iconKey,
  label,
}: Readonly<{
  iconKey: FeatureIconKey;
  label: string;
}>) {
  const iconPath = getFeatureIconPath(iconKey);

  if (iconPath) {
    return (
      <Image
        src={iconPath}
        alt=""
        aria-hidden="true"
        width={24}
        height={24}
        className="h-6 w-6 object-contain"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="text-[0.72rem] font-bold uppercase tracking-[0.04em]"
    >
      {label.slice(0, 1)}
    </span>
  );
}

function getBottomNavigationFeatures() {
  const allowedFeatureKeys = new Set(["home", "desk", "consult", "account"]);

  return primaryNavigationFeatures.filter(
    (feature) =>
      allowedFeatureKeys.has(feature.featureKey) &&
      feature.visibility === "LIVE" &&
      feature.runtimeEnabled
  );
}

export function MobileBottomActionBar({
  locale,
  hasExplicitLocalePrefix,
}: Readonly<MobileBottomActionBarProps>) {
  const pathname = normalizePathname(usePathname());
  const bottomActions = getBottomNavigationFeatures();

  const hideForPaths = new Set(
    [
      "/sign-in",
      "/sign-up",
      "/forgot-password",
      "/reset-password",
      "/disclaimer",
      "/refund",
      "/refund-cancellation",
      "/style-guide",
    ].map((path) =>
      normalizePathname(localizeHref(locale, hasExplicitLocalePrefix, path))
    )
  );

  if (hideForPaths.has(pathname)) {
    return null;
  }

  return (
    <nav
      aria-label="Mobile primary navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[rgba(185,139,70,0.34)] bg-white shadow-[0_-8px_22px_rgba(5,5,5,0.07)] xl:hidden"
    >
      <div className="mx-auto grid max-w-5xl grid-cols-4 px-2 pb-[calc(0.45rem+env(safe-area-inset-bottom))] pt-1.5">
        {bottomActions.map((action) => {
          const href = localizeHref(
            locale,
            hasExplicitLocalePrefix,
            action.route
          );
          const active = isActiveHref(pathname, href);
          const isAccount = action.featureKey === "account";

          return (
            <Link
              key={action.featureKey}
              href={href}
              aria-label={action.label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-w-0 flex-col items-center gap-1 rounded-[1.1rem] px-1.5 py-2 text-center transition [transition-duration:var(--motion-duration-base)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]",
                active
                  ? "bg-[rgba(184,137,67,0.1)] text-[color:var(--color-accent-strong)]"
                  : "text-[color:var(--color-ink-strong)] hover:bg-[rgba(185,139,70,0.08)]"
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border bg-white",
                  active
                    ? "border-[rgba(184,137,67,0.4)] text-[color:var(--color-accent-strong)] shadow-[0_5px_14px_rgba(184,137,67,0.12)]"
                    : isAccount
                      ? "border-[rgba(76,187,23,0.24)] text-[color:var(--color-ink-strong)]"
                      : "border-black/12 text-[color:var(--color-ink-strong)]"
                )}
              >
                <FeatureIcon iconKey={action.iconKey} label={action.label} />
              </span>
              <span className="text-[0.6rem] font-semibold uppercase leading-none tracking-[0.035em] text-[color:var(--color-ink-strong)] sm:text-[0.66rem]">
                {action.label}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "h-0.5 w-8 rounded-full bg-transparent",
                  active ? "bg-[var(--color-accent-gold)]" : ""
                )}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
