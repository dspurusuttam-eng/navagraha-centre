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

const heroChips = ["Lagna", "Rashi", "Dasha"] as const;

const birthDetailRows = [
  [{ label: "Name", kind: "name" }],
  [
    { label: "Date of Birth", kind: "date" },
    { label: "Time of Birth", kind: "time" },
  ],
  [
    { label: "Location", kind: "location" },
    { label: "Gender", kind: "gender", options: ["Male", "Female"] },
  ],
  [
    {
      label: "Chart Style",
      kind: "chart",
      options: ["North", "South", "East"],
    },
    { label: "Language", kind: "language", options: ["EN", "HI", "AS"] },
  ],
] as const;

const nextSteps = [
  {
    title: "Janam Patrika",
    href: "/reports",
    eventName: "report_cta_click",
    feature: "kundli-next-janam-patrika",
  },
  {
    title: "Consult",
    href: "/consultation",
    eventName: "consultation_cta_click",
    feature: "kundli-next-consult-expert",
  },
  {
    title: "Ask NI",
    href: "/ai",
    eventName: "cta_click",
    feature: "kundli-next-ask-ni",
  },
] as const;

type BirthDetailField = (typeof birthDetailRows)[number][number];

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

function CalendarIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        d="M7 4v3M17 4v3M5 9h14M6.5 6h11A2.5 2.5 0 0 1 20 8.5v9A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-9A2.5 2.5 0 0 1 6.5 6Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        d="M12 7v5l3 2M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        d="M12 21s6-5.1 6-10a6 6 0 0 0-12 0c0 4.9 6 10 6 10Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <circle cx="12" cy="11" r="2" fill="currentColor" />
    </svg>
  );
}

function FieldIcon({ kind }: Readonly<{ kind: BirthDetailField["kind"] }>) {
  if (kind === "date") {
    return <CalendarIcon />;
  }

  if (kind === "time") {
    return <ClockIcon />;
  }

  if (kind === "location") {
    return <LocationIcon />;
  }

  return (
    <span className="text-[0.68rem] font-black uppercase">
      {kind === "gender"
        ? "G"
        : kind === "chart"
          ? "C"
          : kind === "language"
            ? "L"
            : "N"}
    </span>
  );
}

function OptionRail({
  options,
  tone = "gold",
}: Readonly<{
  options: readonly string[];
  tone?: "gold" | "green";
}>) {
  return (
    <div
      className={`mt-2 grid min-w-0 ${
        options.length === 2 ? "grid-cols-2" : "grid-cols-3"
      } gap-1`}
    >
      {options.map((option, index) => (
        <span
          key={option}
          className={`min-w-0 whitespace-nowrap rounded-[0.6rem] border bg-white px-1 py-1 text-center text-[0.5rem] font-extrabold leading-none text-[#111111] shadow-[inset_0_1px_0_rgba(255,255,255,0.96),0_4px_9px_rgba(17,17,17,0.055)] sm:text-[0.58rem] ${
            index === 0
              ? tone === "green"
                ? "border-[rgba(76,187,23,0.34)] text-[#2f7e16]"
                : "border-[rgba(184,137,67,0.38)] text-[color:var(--color-accent-strong)]"
              : "border-black/10"
          }`}
        >
          {option}
        </span>
      ))}
    </div>
  );
}

function BirthDetailBlock({
  field,
  compact = false,
}: Readonly<{
  field: BirthDetailField;
  compact?: boolean;
}>) {
  const options = "options" in field ? field.options : null;

  return (
    <div
      className={`min-w-0 rounded-[1rem] border border-[rgba(184,137,67,0.24)] bg-white px-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-5px_12px_rgba(184,137,67,0.035),0_10px_18px_rgba(17,17,17,0.075)] ${
        compact ? "py-2.5" : "py-3"
      }`}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgba(184,137,67,0.26)] bg-white text-[color:var(--color-accent-strong)] shadow-[inset_0_1px_0_rgba(255,255,255,0.96),0_6px_12px_rgba(17,17,17,0.06)]">
          <FieldIcon kind={field.kind} />
        </span>
        <span className="min-w-0 text-[0.72rem] font-extrabold leading-tight text-[#111111] sm:text-[0.86rem]">
          {field.label}
        </span>
      </div>
      {options ? (
        <OptionRail
          options={options}
          tone={field.kind === "language" ? "green" : "gold"}
        />
      ) : null}
    </div>
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
      "NAVAGRAHA Intelligence birth chart guidance",
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
        @media (max-width: 768px) {
          body:has(.launch-page-kundli) > footer {
            display: none;
          }
        }
        @media (min-width: 769px) {
          .kundli-mini-footer {
            display: none;
          }
        }
      `}</style>
      <PageViewTracker page="/kundli" feature="kundli-page" />

      <main className="launch-page launch-page-kundli min-h-screen overflow-hidden bg-white pb-[calc(6rem+env(safe-area-inset-bottom))] text-[#111111] md:pb-0">
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

              <div className="grid min-w-0 gap-2">
                {birthDetailRows.map((row) => (
                  <div
                    key={row.map((field) => field.label).join("-")}
                    className={`grid min-w-0 gap-2 ${
                      row.length > 1 ? "grid-cols-2" : ""
                    }`}
                  >
                    {row.map((field) => (
                      <BirthDetailBlock
                        key={field.label}
                        field={field}
                        compact={row.length > 1}
                      />
                    ))}
                  </div>
                ))}
              </div>

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
                    BIRTH TIME
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
            <div className="grid min-w-0 grid-cols-3 gap-2">
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
          <Container className="py-5 text-center">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#111111]">
              NAVAGRAHA CENTRE
            </p>
            <p className="mt-2 text-[0.78rem] leading-5 text-[color:var(--color-ink-body)]">
              Guidance-first. Illuminating your path.
            </p>
          </Container>
        </section>
      </main>
    </>
  );
}
