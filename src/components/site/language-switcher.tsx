import { buttonStyles } from "@/components/ui/button";
import {
  defaultLocale,
  getLiveLocales,
  getLocaleDefinition,
  getPlannedLocales,
} from "@/modules/localization/config";
import { globalFooterCopy, globalLocaleCopy } from "@/modules/localization/copy";

export function LanguageSwitcher({
  currentLocale = defaultLocale,
}: Readonly<{
  currentLocale?: string;
}>) {
  const activeLocale = getLocaleDefinition(currentLocale);
  const liveLocales = getLiveLocales().filter((locale) => locale.code !== activeLocale.code);
  const plannedLocales = getPlannedLocales();

  return (
    <section
      aria-label={globalFooterCopy.languageLabel}
      className="rounded-[var(--radius-2xl)] border border-[color:var(--color-border)] bg-[rgba(255,253,247,0.88)] p-5 shadow-[var(--shadow-sm)]"
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
          {activeLocale.nativeLabel}
          <span className="rounded-full bg-[rgba(185,139,70,0.14)] px-2 py-1 text-[0.62rem] text-[var(--color-accent-strong)]">
            {globalLocaleCopy.live}
          </span>
        </span>
      </div>

      <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-ink-body)]">
        {globalFooterCopy.languageHelper}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {liveLocales.map((locale) => (
          <span
            key={locale.code}
            className={buttonStyles({
              tone: "tertiary",
              size: "sm",
              className: "cursor-default",
            })}
          >
            {locale.nativeLabel}
            <span className="text-[0.62rem] text-[var(--color-accent-strong)]">
              {globalLocaleCopy.live}
            </span>
          </span>
        ))}

        {plannedLocales.map((locale) => (
          <span
            key={locale.code}
            className={buttonStyles({
              tone: "tertiary",
              size: "sm",
              className:
                "cursor-not-allowed border-dashed border-[rgba(185,139,70,0.28)] bg-[rgba(255,252,245,0.9)] text-[var(--color-ink-muted)]",
            })}
            aria-disabled="true"
            title={globalLocaleCopy.comingSoon}
          >
            {locale.nativeLabel}
            <span className="text-[0.62rem] text-[var(--color-ink-muted)]">
              {globalLocaleCopy.planned}
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}
