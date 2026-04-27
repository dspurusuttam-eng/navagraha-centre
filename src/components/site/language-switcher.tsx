"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { buttonStyles } from "@/components/ui/button";
import {
  defaultLocale,
  detectLocaleFromPathname,
  getIndianLocales,
  getInternationalLocales,
  getLocalizedPath,
  getLocaleDefinition,
  isLocaleSelectable,
  stripLocaleFromPathname,
} from "@/modules/localization/config";
import { globalFooterCopy, globalLocaleCopy } from "@/modules/localization/copy";

type LanguageSwitcherProps = {
  currentLocale?: string;
  variant?: "panel" | "compact";
  className?: string;
};

function localizePath(
  locale: string,
  pathname: string | null,
  search: string
) {
  const normalizedPath = stripLocaleFromPathname(pathname ?? "/");
  const localizedPath = getLocalizedPath(locale, normalizedPath, {
    forcePrefix: true,
  });

  return search ? `${localizedPath}?${search}` : localizedPath;
}

function groupLocales(currentLocale: string) {
  const indianLocales = getIndianLocales().filter((locale) => locale.code !== currentLocale);
  const internationalLocales = getInternationalLocales().filter(
    (locale) => locale.code !== currentLocale
  );

  return { indianLocales, internationalLocales };
}

function getLocaleAvailabilityLabel(isLive: boolean) {
  return isLive ? globalLocaleCopy.live : globalLocaleCopy.planned;
}

function LanguageSwitcherCompact({
  activeLocale,
  targetPathResolver,
}: {
  activeLocale: string;
  targetPathResolver: (locale: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const { indianLocales, internationalLocales } = useMemo(
    () => groupLocales(activeLocale),
    [activeLocale]
  );
  const allLocales = [...indianLocales, ...internationalLocales];
  const activeDefinition = getLocaleDefinition(activeLocale);

  return (
    <details
      className="relative"
      open={open}
      onToggle={(event) => setOpen((event.target as HTMLDetailsElement).open)}
    >
      <summary
        className={buttonStyles({
          tone: "tertiary",
          size: "sm",
          className:
            "cursor-pointer list-none pr-3 marker:content-none [&::-webkit-details-marker]:hidden",
        })}
      >
        {activeDefinition.nativeLabel}
      </summary>
      <div className="absolute top-[calc(100%+0.5rem)] z-30 w-[min(90vw,18rem)] rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,254,250,0.98)] p-3 shadow-[var(--shadow-md)] [inset-inline-end:0]">
        <div className="grid gap-2">
          {allLocales.map((locale) => {
            const selectable = isLocaleSelectable(locale.code);
            const availabilityLabel = getLocaleAvailabilityLabel(
              locale.availability === "live"
            );

            return selectable ? (
              <Link
                key={locale.code}
                href={targetPathResolver(locale.code)}
                className={buttonStyles({
                  tone: "ghost",
                  size: "sm",
                  className: "w-full justify-start",
                })}
                onClick={() => setOpen(false)}
              >
                {locale.nativeLabel}
                <span className="text-[0.62rem] text-[var(--color-ink-muted)] [margin-inline-start:auto]">
                  {availabilityLabel}
                </span>
              </Link>
            ) : (
              <span
                key={locale.code}
                className={buttonStyles({
                  tone: "ghost",
                  size: "sm",
                  className:
                    "w-full cursor-not-allowed justify-start text-[var(--color-ink-muted)]",
                })}
                aria-disabled="true"
                title={globalLocaleCopy.comingSoon}
              >
                {locale.nativeLabel}
                <span className="text-[0.62rem] text-[var(--color-ink-muted)] [margin-inline-start:auto]">
                  {availabilityLabel}
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </details>
  );
}

export function LanguageSwitcher({
  currentLocale = defaultLocale,
  variant = "panel",
  className,
}: Readonly<LanguageSwitcherProps>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const localeFromPath = detectLocaleFromPathname(pathname ?? "/");
  const activeLocale = localeFromPath ?? currentLocale;
  const activeDefinition = getLocaleDefinition(activeLocale);
  const search = searchParams.toString();
  const { indianLocales, internationalLocales } = groupLocales(activeLocale);

  const targetPathResolver = (locale: string) => localizePath(locale, pathname, search);

  if (variant === "compact") {
    return (
      <LanguageSwitcherCompact
        activeLocale={activeLocale}
        targetPathResolver={targetPathResolver}
      />
    );
  }

  return (
    <section
      aria-label={globalFooterCopy.languageLabel}
      className={`rounded-[var(--radius-2xl)] border border-[color:var(--color-border)] bg-[rgba(255,253,247,0.88)] p-5 shadow-[var(--shadow-sm)] ${className ?? ""}`.trim()}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
          {globalFooterCopy.languageLabel}
        </span>
        <span
          className={buttonStyles({
            tone: "secondary",
            size: "sm",
            className: "cursor-default border-[rgba(185,139,70,0.4)] pr-3",
          })}
          aria-current="true"
        >
          {activeDefinition.nativeLabel}
          <span className="rounded-full bg-[rgba(185,139,70,0.14)] px-2 py-1 text-[0.62rem] text-[var(--color-accent-strong)]">
            {globalLocaleCopy.live}
          </span>
        </span>
      </div>

      <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-ink-body)]">
        {globalFooterCopy.languageHelper}
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
            Indian Languages
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {indianLocales.map((locale) => {
              const selectable = isLocaleSelectable(locale.code);
              const availabilityLabel = getLocaleAvailabilityLabel(
                locale.availability === "live"
              );

              return selectable ? (
                <Link
                  key={locale.code}
                  href={targetPathResolver(locale.code)}
                  className={buttonStyles({
                    tone: "tertiary",
                    size: "sm",
                    className:
                      "border-[rgba(185,139,70,0.34)] bg-[rgba(255,252,246,0.92)] text-[var(--color-ink-body)]",
                  })}
                >
                  {locale.nativeLabel}
                  <span className="text-[0.62rem] text-[var(--color-ink-muted)]">
                    {availabilityLabel}
                  </span>
                </Link>
              ) : (
                <span
                  key={locale.code}
                  className={buttonStyles({
                    tone: "tertiary",
                    size: "sm",
                    className:
                      "cursor-not-allowed border-[rgba(185,139,70,0.34)] bg-[rgba(255,252,246,0.92)] text-[var(--color-ink-body)]",
                  })}
                  aria-disabled="true"
                  title={globalLocaleCopy.comingSoon}
                >
                  {locale.nativeLabel}
                  <span className="text-[0.62rem] text-[var(--color-ink-muted)]">
                    {availabilityLabel}
                  </span>
                </span>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
            International Languages
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {internationalLocales.map((locale) => {
              const selectable = isLocaleSelectable(locale.code);
              const availabilityLabel = getLocaleAvailabilityLabel(
                locale.availability === "live"
              );

              return selectable ? (
                <Link
                  key={locale.code}
                  href={targetPathResolver(locale.code)}
                  className={buttonStyles({
                    tone: "tertiary",
                    size: "sm",
                    className:
                      "border-dashed border-[rgba(185,139,70,0.24)] bg-[rgba(255,252,245,0.9)] text-[var(--color-ink-muted)]",
                  })}
                >
                  {locale.nativeLabel}
                  <span className="text-[0.62rem] text-[var(--color-ink-muted)]">
                    {availabilityLabel}
                  </span>
                </Link>
              ) : (
                <span
                  key={locale.code}
                  className={buttonStyles({
                    tone: "tertiary",
                    size: "sm",
                    className:
                      "cursor-not-allowed border-dashed border-[rgba(185,139,70,0.24)] bg-[rgba(255,252,245,0.9)] text-[var(--color-ink-muted)]",
                  })}
                  aria-disabled="true"
                  title={globalLocaleCopy.comingSoon}
                >
                  {locale.nativeLabel}
                  <span className="text-[0.62rem] text-[var(--color-ink-muted)]">
                    {availabilityLabel}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
