import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { createToolMetadata } from "@/lib/seo/metadata";
import { getCoreSeoCopy } from "@/lib/seo/seo-config";
import { defaultLocale, getLocalizedPath } from "@/modules/localization/config";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";
import { GenerateKundliControl } from "./generate-kundli-control";
import { KundliBirthDetailsForm } from "./kundli-birth-details-form";

const heroChips = ["Lagna", "Rashi", "Dasha"] as const;

const nextSteps = [
  {
    title: "Ask NI",
    href: "/ai",
    eventName: "cta_click",
    feature: "kundli-next-ask-ni",
  },
  {
    title: "Consult Acharya",
    href: "/consultation",
    eventName: "consultation_cta_click",
    feature: "kundli-next-consult-expert",
  },
] as const;

function localizeHref(
  locale: string,
  hasExplicitLocalePrefix: boolean,
  href: string
) {
  return getLocalizedPath(locale, href, {
    forcePrefix: locale !== defaultLocale || hasExplicitLocalePrefix,
  });
}

function SacredDot({ tone = "gold" }: Readonly<{ tone?: "gold" | "green" }>) {
  return (
    <span
      aria-hidden="true"
      className={`h-2 w-2 rounded-full ${
        tone === "green"
          ? "bg-[#4CBB17] shadow-[0_0_0_4px_rgba(76,187,23,0.09)]"
          : "bg-[var(--color-accent-gold)] shadow-[0_0_0_4px_rgba(184,137,67,0.1)]"
      }`}
    />
  );
}

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const localized = getCoreSeoCopy("kundli", locale);

  return createToolMetadata({
    title: localized.title,
    description: localized.description,
    path: "/kundli",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: [
      "kundli",
      "janam kundli",
      "Ask NI birth chart guidance",
      "lagna chart",
      "vedic kundli",
      "rashi and navamsa guidance",
    ],
  });
}

export const dynamic = "force-dynamic";

export default async function KundliPage() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const localize = (href: string) =>
    localizeHref(locale, hasExplicitLocalePrefix, href);

  return (
    <>
      <style>{`
        @media (max-width: 1279px) {
          body:has(.launch-page-kundli) > footer {
            display: none;
          }
        }
        @media (min-width: 1280px) {
          .kundli-mini-footer {
            display: none;
          }
        }
      `}</style>
      <PageViewTracker page="/kundli" feature="kundli-page" />

      <main className="launch-page launch-page-kundli min-h-screen overflow-hidden bg-white pb-[calc(7rem+env(safe-area-inset-bottom))] text-[#111111] xl:pb-12">
        <section className="border-b border-black/8 bg-white">
          <Container className="py-3 sm:py-5">
            <div className="min-w-0 space-y-3 rounded-[1.25rem] border border-[rgba(184,137,67,0.25)] bg-white p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-8px_16px_rgba(184,137,67,0.035),0_14px_26px_rgba(17,17,17,0.075)] sm:p-5">
              <h1
                className="font-[family-name:var(--font-display)] text-[1.85rem] font-semibold text-[#111111] sm:text-[2.55rem]"
                style={{ lineHeight: "var(--line-height-tight)" }}
              >
                JANAM KUNDLI
              </h1>

              <div className="rounded-[1rem] border border-[rgba(76,187,23,0.28)] bg-white px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-6px_12px_rgba(76,187,23,0.04),0_9px_18px_rgba(17,17,17,0.06)]">
                <p className="text-[0.9rem] font-bold leading-5 text-[#111111]">
                  Generate your birth chart
                </p>
              </div>

              <div className="flex max-w-full flex-wrap gap-2">
                {heroChips.map((chip, index) => (
                  <span
                    key={chip}
                    className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[rgba(184,137,67,0.22)] bg-white px-3 py-1.5 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-[#111111] shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_7px_13px_rgba(17,17,17,0.055)]"
                  >
                    <SacredDot tone={index === 1 ? "green" : "gold"} />
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section className="border-b border-black/8 bg-white">
          <Container className="py-3 sm:py-5">
            <Card
              tone="default"
              className="min-w-0 space-y-3 border-[rgba(184,137,67,0.26)] bg-white p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_16px_28px_rgba(17,17,17,0.07)] before:opacity-0 sm:p-5"
            >
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                BIRTH DETAILS
              </p>

              <KundliBirthDetailsForm />

              <GenerateKundliControl
                signInHref={localize("/sign-in")}
                feature="kundli-profile-card-sign-in"
              />
            </Card>
          </Container>
        </section>

        <section className="border-b border-black/8 bg-white">
          <Container className="py-3 sm:py-5">
            <Card
              tone="default"
              className="min-w-0 border-[rgba(76,187,23,0.26)] bg-white p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_12px_22px_rgba(17,17,17,0.06)] before:opacity-0 sm:p-5"
            >
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-[#4CBB17]">
                    BIRTH TIME HELP
                  </p>
                  <p className="mt-1 text-[0.88rem] font-bold leading-5 text-[#111111]">
                    Exact time improves chart accuracy.
                  </p>
                </div>
                <TrackedLink
                  href={localize("/consultation")}
                  eventName="consultation_cta_click"
                  eventPayload={{
                    page: "/kundli",
                    feature: "kundli-birth-time-help",
                  }}
                  className={buttonStyles({
                    tone: "secondary",
                    size: "sm",
                    className:
                      "w-full justify-center rounded-[var(--radius-pill)] border-[rgba(76,187,23,0.32)] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_8px_14px_rgba(17,17,17,0.06)] sm:w-auto",
                  })}
                >
                  CONSULT
                </TrackedLink>
              </div>
            </Card>
          </Container>
        </section>

        <section className="bg-white">
          <Container className="space-y-3 py-3 sm:py-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                NEXT STEP
              </p>
              <SacredDot tone="green" />
            </div>
            <div className="grid min-w-0 gap-2 min-[430px]:grid-cols-2">
              {nextSteps.map((step) => (
                <TrackedLink
                  key={step.title}
                  href={localize(step.href)}
                  eventName={step.eventName}
                  eventPayload={{ page: "/kundli", feature: step.feature }}
                  className="block min-w-0"
                >
                  <Card
                    tone="default"
                    className="flex min-h-14 min-w-0 items-center justify-center border-[rgba(184,137,67,0.22)] bg-white p-2 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-5px_10px_rgba(184,137,67,0.035),0_10px_18px_rgba(17,17,17,0.06)] before:opacity-0 sm:p-3"
                  >
                    <p className="text-[0.68rem] font-extrabold leading-tight text-[#111111] sm:text-[0.86rem]">
                      {step.title}
                    </p>
                  </Card>
                </TrackedLink>
              ))}
            </div>
          </Container>
        </section>

        <section className="kundli-mini-footer border-t border-[rgba(184,137,67,0.22)] bg-white">
          <Container className="py-3 text-center">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#111111]">
              NAVAGRAHA CENTRE
            </p>
            <p className="mt-1 text-[0.78rem] leading-5 text-[color:var(--color-ink-body)]">
              Guidance-first. Illuminating your path.
            </p>
          </Container>
        </section>
      </main>
    </>
  );
}
