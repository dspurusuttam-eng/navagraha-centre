"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { buttonStyles } from "@/components/ui/button";
import {
  defaultLocale,
  detectLocaleFromPathname,
  stripLocaleFromPathname,
} from "@/modules/localization/config";
import { globalFooterCopy, globalLocaleCopy } from "@/modules/localization/copy";
import {
  getLocalizedRoutePath,
  getLocaleRouteDescriptor,
} from "@/modules/localization/routes";
import { trackLanguageSwitch } from "@/lib/analytics/conversion-events";

type LanguageSwitcherProps = {
  currentLocale?: string;
  variant?: "panel" | "compact" | "inline";
  className?: string;
};

const visibleLanguageCodes = ["en", "as", "hi"] as const;

/** Spoken names for the two-letter pills, so the codes are not read as letters. */
const languageAccessibleNames: Readonly<Record<string, string>> = {
  en: "English",
  as: "Assamese",
  hi: "Hindi",
};

function getAccessibleLanguageName(locale: string) {
  return languageAccessibleNames[locale] ?? locale.toUpperCase();
}

function getVisibleLocales() {
  return visibleLanguageCodes.map((locale) => getLocaleRouteDescriptor(locale));
}

function getLanguageLabel(locale: string) {
  return locale.toUpperCase();
}

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
  const locales = useMemo(() => getVisibleLocales(), []);
  const activeDefinition = getLocaleRouteDescriptor(activeLocale);

  return (
    <details
      className="relative inline-flex h-11 w-11 shrink-0"
      open={open}
      onToggle={(event) => setOpen((event.target as HTMLDetailsElement).open)}
    >
      <summary
        aria-label={globalFooterCopy.languageLabel}
        className={buttonStyles({
          tone: "tertiary",
          size: "sm",
          className:
            "h-11 min-h-11 w-11 min-w-11 cursor-pointer list-none px-2 marker:content-none [&::-webkit-details-marker]:hidden",
        })}
        dir={activeDefinition.dir}
        lang={activeDefinition.code}
      >
        {getLanguageLabel(activeDefinition.code)}
      </summary>
      <div className="absolute top-[calc(100%+0.5rem)] z-30 w-[11rem] rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-2 shadow-[var(--shadow-md)] [inset-inline-end:0]">
        <div className="grid gap-1.5">
          {locales.map((locale) => {
            const isActive = locale.code === activeLocale;
            const availabilityLabel = getLocaleAvailabilityLabel(
              locale.availability === "live"
            );

            return isActive ? (
              <span
                key={locale.code}
                aria-current="true"
                className={buttonStyles({
                  tone: "secondary",
                  size: "sm",
                  className: "w-full cursor-default justify-between px-3",
                })}
                dir={locale.dir}
                lang={locale.code}
              >
                {getLanguageLabel(locale.code)}
                <span className="text-[0.62rem] text-[var(--color-ink-muted)]">
                  Active
                </span>
              </span>
            ) : (
              <Link
                key={locale.code}
                href={targetPathResolver(locale.code)}
                className={buttonStyles({
                  tone: "ghost",
                  size: "sm",
                  className: "w-full justify-between px-3",
                })}
                dir={locale.dir}
                lang={locale.code}
                onClick={() => {
                  trackLanguageSwitch({
                    route: targetPathResolver(locale.code),
                    locale: locale.code,
                    source: "compact-language-switcher",
                    section: "header",
                  });
                  setOpen(false);
                }}
              >
                {getLanguageLabel(locale.code)}
                <span className="text-[0.62rem] text-[var(--color-ink-muted)]">
                  {availabilityLabel}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </details>
  );
}

function LanguageSwitcherInline({
  activeLocale,
  className,
  targetPathResolver,
}: {
  activeLocale: string;
  className?: string;
  targetPathResolver: (locale: string) => string;
}) {
  const locales = useMemo(() => getVisibleLocales(), []);

  return (
    <div className={`grid grid-cols-3 gap-2 ${className ?? ""}`.trim()}>
      {locales.map((locale) => {
        const isActive = locale.code === activeLocale;
        const label = getLanguageLabel(locale.code);

        return isActive ? (
          <span
            key={locale.code}
            aria-current="true"
            aria-label={`${getAccessibleLanguageName(locale.code)} (selected)`}
            className={buttonStyles({
              tone: "secondary",
              size: "sm",
              className: "min-h-11 cursor-default px-3",
            })}
            dir={locale.dir}
            lang={locale.code}
          >
            {label}
          </span>
        ) : (
          <Link
            key={locale.code}
            href={targetPathResolver(locale.code)}
            aria-label={getAccessibleLanguageName(locale.code)}
            className={buttonStyles({
              tone: "ghost",
              size: "sm",
              className:
                "min-h-11 border border-[rgba(185,139,70,0.22)] bg-white px-3 text-[color:var(--color-ink-strong)] hover:border-[rgba(185,139,70,0.38)]",
            })}
            dir={locale.dir}
            lang={locale.code}
            onClick={() => {
              trackLanguageSwitch({
                route: targetPathResolver(locale.code),
                locale: locale.code,
                source: "inline-language-switcher",
                section: "drawer",
              });
            }}
          >
            {label}
          </Link>
        );
      })}
    </div>
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
  const activeDefinition = getLocaleRouteDescriptor(activeLocale);
  const locales = useMemo(() => getVisibleLocales(), []);
  const search = searchParams.toString();

  const targetPathResolver = (locale: string) =>
    localizePath(locale, pathname, search);

  if (variant === "compact") {
    return (
      <LanguageSwitcherCompact
        activeLocale={activeLocale}
        targetPathResolver={targetPathResolver}
      />
    );
  }

  if (variant === "inline") {
    return (
      <LanguageSwitcherInline
        activeLocale={activeLocale}
        className={className}
        targetPathResolver={targetPathResolver}
      />
    );
  }

  return (
    <section
      aria-label={globalFooterCopy.languageLabel}
      className={`rounded-[var(--radius-2xl)] border border-[color:var(--color-border)] bg-white p-5 shadow-[var(--shadow-sm)] ${className ?? ""}`.trim()}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
          {globalFooterCopy.languageLabel}
        </span>
        <span
          aria-current="true"
          className={buttonStyles({
            tone: "secondary",
            size: "sm",
            className: "cursor-default border-[rgba(185,139,70,0.4)] px-3",
          })}
          dir={activeDefinition.dir}
          lang={activeDefinition.code}
        >
          {getLanguageLabel(activeDefinition.code)}
          <span className="shrink-0 rounded-full bg-[rgba(185,139,70,0.14)] px-2 py-1 text-[0.62rem] text-[var(--color-accent-strong)]">
            {globalLocaleCopy.live}
          </span>
        </span>
      </div>

      <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-ink-body)]">
        {globalFooterCopy.languageHelper}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {locales.map((locale) => {
          const isActive = locale.code === activeLocale;
          const availabilityLabel = getLocaleAvailabilityLabel(
            locale.availability === "live"
          );

          return isActive ? (
            <span
              key={locale.code}
              aria-current="true"
              className={buttonStyles({
                tone: "secondary",
                size: "sm",
                className: "cursor-default px-3",
              })}
              dir={locale.dir}
              lang={locale.code}
            >
              {getLanguageLabel(locale.code)}
              <span className="shrink-0 rounded-full bg-[rgba(185,139,70,0.14)] px-2 py-1 text-[0.62rem] text-[var(--color-accent-strong)]">
                Active
              </span>
            </span>
          ) : (
            <Link
              key={locale.code}
              href={targetPathResolver(locale.code)}
              className={buttonStyles({
                tone: "tertiary",
                size: "sm",
                className:
                  "border-[rgba(185,139,70,0.34)] bg-white px-3 text-[var(--color-ink-body)]",
              })}
              dir={locale.dir}
              lang={locale.code}
              onClick={() => {
                trackLanguageSwitch({
                  route: targetPathResolver(locale.code),
                  locale: locale.code,
                  source: "language-switcher",
                  section: "primary",
                });
              }}
            >
              {getLanguageLabel(locale.code)}
              <span className="shrink-0 text-[0.62rem] text-[var(--color-ink-muted)]">
                {availabilityLabel}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
