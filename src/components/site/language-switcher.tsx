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
  getLocaleDefinition,
  isLocaleSelectable,
  stripLocaleFromPathname,
} from "@/modules/localization/config";
import { globalFooterCopy, globalLocaleCopy } from "@/modules/localization/copy";
import {
  getLocalizedRoutePath,
  getLocaleRouteDescriptor,
} from "@/modules/localization/routes";

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
  const localizedPath = getLocalizedRoutePath(locale, normalizedPath, {
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
  const activeDefinition = getLocaleRouteDescriptor(activeLocale);

  return (
    <details
      className="relative"
      open={open}
      onToggle={(event) => setOpen((event.target as HTMLDetailsElement).open)}
    >
      <summary
        aria-label={globalFooterCopy.languageLabel}
        className={buttonStyles({
          tone: "tertiary",
          size: "sm",
          className:
            "max-w-[8.75rem] cursor-pointer list-none overflow-hidden text-ellipsis pr-3 marker:content-none sm:max-w-[11rem] [&::-webkit-details-marker]:hidden",
        })}
        dir={activeDefinition.dir}
        lang={activeDefinition.code}
      >
        {activeDefinition.nativeLabel}
      </summary>
      <div className="absolute top-[calc(100%+0.5rem)] z-30 max-h-[min(72vh,28rem)] w-[min(calc(100vw-2rem),20rem)] overflow-y-auto rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,254,250,0.98)] p-3 shadow-[var(--shadow-md)] [inset-inline-end:0]">
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
                  className: "w-full justify-start text-start",
                })}
                dir={locale.dir}
                lang={locale.code}
                onClick={() => setOpen(false)}
              >
                <span className="min-w-0 flex-1 overflow-hidden text-ellipsis">
                  {locale.nativeLabel}
                </span>
                <span className="shrink-0 text-[0.62rem] text-[var(--color-ink-muted)] [margin-inline-start:auto]">
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
                    "w-full cursor-not-allowed justify-start text-start text-[var(--color-ink-muted)]",
                })}
                aria-disabled="true"
                dir={locale.dir}
                lang={locale.code}
                title={globalLocaleCopy.planned}
              >
                <span className="min-w-0 flex-1 overflow-hidden text-ellipsis">
                  {locale.nativeLabel}
                </span>
                <span className="shrink-0 text-[0.62rem] text-[var(--color-ink-muted)] [margin-inline-start:auto]">
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
            className:
              "cursor-default border-[rgba(185,139,70,0.4)] pr-3 text-start",
          })}
          aria-current="true"
          dir={activeDefinition.dir}
          lang={activeDefinition.code}
        >
          <span className="min-w-0 max-w-full overflow-hidden text-ellipsis">
            {activeDefinition.nativeLabel}
          </span>
          <span className="shrink-0 rounded-full bg-[rgba(185,139,70,0.14)] px-2 py-1 text-[0.62rem] text-[var(--color-accent-strong)]">
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
                      "border-[rgba(185,139,70,0.34)] bg-[rgba(255,252,246,0.92)] text-start text-[var(--color-ink-body)]",
                  })}
                  dir={locale.dir}
                  lang={locale.code}
                >
                  <span className="min-w-0 max-w-full overflow-hidden text-ellipsis">
                    {locale.nativeLabel}
                  </span>
                  <span className="shrink-0 text-[0.62rem] text-[var(--color-ink-muted)]">
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
                      "cursor-not-allowed border-[rgba(185,139,70,0.34)] bg-[rgba(255,252,246,0.92)] text-start text-[var(--color-ink-body)]",
                  })}
                  aria-disabled="true"
                  dir={locale.dir}
                  lang={locale.code}
                  title={globalLocaleCopy.planned}
                >
                  <span className="min-w-0 max-w-full overflow-hidden text-ellipsis">
                    {locale.nativeLabel}
                  </span>
                  <span className="shrink-0 text-[0.62rem] text-[var(--color-ink-muted)]">
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
                      "border-dashed border-[rgba(185,139,70,0.24)] bg-[rgba(255,252,245,0.9)] text-start text-[var(--color-ink-muted)]",
                  })}
                  dir={locale.dir}
                  lang={locale.code}
                >
                  <span className="min-w-0 max-w-full overflow-hidden text-ellipsis">
                    {locale.nativeLabel}
                  </span>
                  <span className="shrink-0 text-[0.62rem] text-[var(--color-ink-muted)]">
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
                      "cursor-not-allowed border-dashed border-[rgba(185,139,70,0.24)] bg-[rgba(255,252,245,0.9)] text-start text-[var(--color-ink-muted)]",
                  })}
                  aria-disabled="true"
                  dir={locale.dir}
                  lang={locale.code}
                  title={globalLocaleCopy.planned}
                >
                  <span className="min-w-0 max-w-full overflow-hidden text-ellipsis">
                    {locale.nativeLabel}
                  </span>
                  <span className="shrink-0 text-[0.62rem] text-[var(--color-ink-muted)]">
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
