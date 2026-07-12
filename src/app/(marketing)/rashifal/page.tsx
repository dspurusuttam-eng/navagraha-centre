import Link from "next/link";
import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { createToolMetadata } from "@/lib/seo/metadata";
import { getCoreSeoCopy } from "@/lib/seo/seo-config";
import {
  defaultLocale,
  getLocalizedPath,
} from "@/modules/localization/config";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";
import { listSavedKundliRecords } from "@/modules/account/saved-kundli-service";
import { getSession } from "@/modules/auth/server";
import { PremiumDailyHoroscopePanel } from "@/modules/rashifal/components/premium-daily-horoscope-panel";

function localizeHref(
  locale: string,
  hasExplicitLocalePrefix: boolean,
  href: string
) {
  return getLocalizedPath(locale, href, {
    forcePrefix: locale !== defaultLocale || hasExplicitLocalePrefix,
  });
}

function getTodayLocalDate() {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60_000;

  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const localized = getCoreSeoCopy("rashifal", locale);

  return createToolMetadata({
    title: localized.title,
    description: localized.description,
    path: "/rashifal",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: [
      "daily rashifal",
      "personal daily horoscope",
      "saved kundli daily guidance",
      "vedic daily guidance",
    ],
  });
}

export const dynamic = "force-dynamic";

export default async function RashifalPage() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const session = await getSession().catch(() => null);
  const signInHref = `${localizeHref(
    locale,
    hasExplicitLocalePrefix,
    "/sign-in"
  )}?next=${encodeURIComponent("/rashifal")}`;
  const savedKundliCatalog = session
    ? await listSavedKundliRecords(session.user.id).catch(() => null)
    : null;
  const catalog = savedKundliCatalog?.success ? savedKundliCatalog.data : null;

  return (
    <>
      <PageViewTracker page="/rashifal" feature="premium-daily-rashifal" />
      <AnalyticsEventTracker
        event="rashifal_page_view"
        payload={{ page: "/rashifal", feature: "premium-daily-rashifal" }}
      />

      <main className="launch-page launch-page-rashifal min-h-screen overflow-hidden bg-white pb-[calc(7.2rem+env(safe-area-inset-bottom))] text-[#111111] md:pb-0">
        <section className="relative overflow-hidden border-b border-[rgba(184,137,67,0.16)] bg-white">
          <div className="pointer-events-none absolute right-0 top-[-7rem] h-64 w-64 rounded-full border border-[rgba(184,137,67,0.14)]" />
          <div className="pointer-events-none absolute bottom-[-5rem] left-[-2rem] h-44 w-44 rounded-full border border-[rgba(33,94,68,0.12)]" />
          <Container className="relative py-7 sm:py-9 lg:py-11">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(280px,0.8fr)] lg:items-end">
              <div className="min-w-0 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge tone="accent" className="border-[#D9BE75] bg-[#FFF8E4] text-[#8A641F]">
                    Daily only
                  </Badge>
                  <Badge tone="trust" className="border-[#BFE6D0] bg-[#F2FFF7] text-[#215E44]">
                    Calculation-backed
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h1
                    className="max-w-3xl font-[family-name:var(--font-display)] text-[length:var(--font-size-display-sm)] leading-[var(--line-height-tight)] text-[#111111] sm:text-[length:var(--font-size-display-lg)]"
                    style={{ letterSpacing: "0.01em" }}
                  >
                    Rashifal
                  </h1>
                  <p className="max-w-[44rem] text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[#4A4A4A] sm:text-[length:var(--font-size-body-lg)]">
                    Personal daily guidance from your saved Kundli, current date, confirmed place, and the real daily horoscope engine.
                  </p>
                </div>
              </div>

              <Card className="border-[#E9DFC9] bg-white p-4 shadow-[0_16px_42px_rgba(17,17,17,0.055)] before:opacity-0 sm:p-5">
                <div className="space-y-3">
                  <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#B88943]">
                    Source layers
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[0.82rem] text-[#111111]">
                    {[
                      "Saved Kundli",
                      "Panchang",
                      "Dasha",
                      "Gochar",
                      "Ashtakavarga",
                      "Divisional",
                    ].map((label) => (
                      <span
                        key={label}
                        className="rounded-[1rem] border border-[#E9DFC9] bg-[#FFFDF8] px-3 py-2 text-center"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </Container>
        </section>

        <section className="bg-white">
          <Container className="space-y-5 py-6 sm:py-8">
            {!session ? (
              <Card className="border-[#E9DFC9] bg-white p-5 shadow-[0_16px_42px_rgba(17,17,17,0.055)] before:opacity-0">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                  <div className="space-y-2">
                    <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#B88943]">
                      Sign in required
                    </p>
                    <h2 className="text-[length:var(--font-size-title-md)] text-[#111111]">
                      Use a saved Kundli for personal daily Rashifal.
                    </h2>
                    <p className="max-w-3xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
                      Daily guidance is generated only after secure sign-in so the chart is loaded server-side from your account.
                    </p>
                  </div>
                  <Link
                    href={signInHref}
                    className={buttonStyles({
                      tone: "accent",
                      size: "lg",
                      className: "w-full justify-center lg:w-auto",
                    })}
                  >
                    Sign in for Daily Guidance
                  </Link>
                </div>
              </Card>
            ) : catalog ? (
              <PremiumDailyHoroscopePanel
                catalog={catalog}
                initialDate={getTodayLocalDate()}
              />
            ) : (
              <Card className="border-[#E9DFC9] bg-white p-5 shadow-[0_16px_42px_rgba(17,17,17,0.055)] before:opacity-0">
                <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#B88943]">
                  Saved Kundli unavailable
                </p>
                <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
                  Saved Kundli records could not be loaded safely. Please retry after a moment.
                </p>
              </Card>
            )}
          </Container>
        </section>
      </main>
    </>
  );
}
