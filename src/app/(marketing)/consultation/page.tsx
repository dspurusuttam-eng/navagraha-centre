import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { JsonLd } from "@/components/seo/json-ld";
import { createToolMetadata } from "@/lib/seo/metadata";
import {
  createBreadcrumbSchema,
  createPersonSchema,
  createServiceSchema,
} from "@/lib/seo/schema";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";

const concernCards = [
  "Kundli Reading",
  "Career / Work",
  "Marriage / Relationship",
  "Dasha / Transit",
  "Remedies / Dosha",
  "Report Review",
] as const;

const preparationChecklist = [
  "Full name",
  "Date of birth",
  "Exact birth time",
  "Birth place",
  "Main concern",
  "Existing report, if any",
] as const;

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();

  return createToolMetadata({
    title: "Consultation Guidance",
    description:
      "Calm Vedic consultation preparation for Kundli reading, career, marriage, Dasha, remedies, and report review.",
    path: "/consultation",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: [
      "astrology consultation",
      "kundli reading",
      "vedic consultation",
      "consult acharya",
    ],
  });
}

export const revalidate = 3600;

export default async function ConsultationPage() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const consultationSchemas = [
    createBreadcrumbSchema({
      locale,
      explicitLocalePrefix: hasExplicitLocalePrefix,
      items: [
        { name: "Home", path: "/" },
        { name: "Consultation", path: "/consultation" },
      ],
    }),
    createServiceSchema({
      name: "Consultation Guidance",
      description:
        "Responsible Vedic consultation preparation with human chart interpretation.",
      path: "/consultation",
      locale,
      serviceType: "Vedic Consultation Guidance",
    }),
    createPersonSchema({
      locale,
      path: "/joy-prakash-sarmah",
    }),
  ];

  return (
    <>
      <JsonLd id="consultation-page-schema" data={consultationSchemas} />
      <PageViewTracker
        page="/consultation"
        feature="consultation-guidance-page"
      />

      <main className="launch-page launch-page-consultation min-w-0 overflow-hidden bg-white pb-[calc(7rem+env(safe-area-inset-bottom))] text-[#111111] xl:pb-12">
        <section className="border-b border-black/8 bg-white">
          <Container className="grid gap-4 py-4 sm:py-7 lg:grid-cols-[minmax(0,0.88fr)_minmax(18rem,0.5fr)] lg:items-center">
            <Card
              tone="default"
              className="min-w-0 border-[rgba(184,137,67,0.24)] bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-8px_16px_rgba(184,137,67,0.035),0_16px_30px_rgba(17,17,17,0.065)] before:opacity-0 sm:p-6"
            >
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[color:var(--color-accent-strong)]">
                Human guidance
              </p>
              <h1
                className="mt-2 font-[family-name:var(--font-display)] text-[2.25rem] font-semibold text-[#111111] sm:text-[3.6rem]"
                style={{ lineHeight: "0.96" }}
              >
                Consultation Guidance
              </h1>
              <p className="mt-3 max-w-2xl text-[1rem] font-semibold leading-6 text-[#111111]">
                Bring your Kundli, birth details, and main concern into a calm
                human review. No marketplace rush, no fear-based pressure.
              </p>
              <div className="mt-5 grid gap-3 min-[430px]:grid-cols-2 sm:flex sm:flex-wrap">
                <TrackedLink
                  href="/kundli"
                  eventName="cta_click"
                  eventPayload={{
                    page: "/consultation",
                    feature: "consultation-generate-kundli",
                  }}
                  className={buttonStyles({
                    tone: "accent",
                    size: "lg",
                    className:
                      "w-full justify-center rounded-[var(--radius-pill)] sm:w-auto",
                  })}
                >
                  Generate Kundli
                </TrackedLink>
                <TrackedLink
                  href="/contact?intent=consultation"
                  eventName="consultation_cta_click"
                  eventPayload={{
                    page: "/consultation",
                    feature: "consultation-contact",
                  }}
                  className={buttonStyles({
                    tone: "secondary",
                    size: "lg",
                    className:
                      "w-full justify-center rounded-[var(--radius-pill)] border-[rgba(76,187,23,0.34)] sm:w-auto",
                  })}
                >
                  Contact / Book
                </TrackedLink>
              </div>
            </Card>

            <div className="rounded-[1.55rem] border border-[rgba(76,187,23,0.24)] bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_12px_24px_rgba(17,17,17,0.06)]">
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[#2f7e16]">
                Preparation note
              </p>
              <p className="mt-3 text-[1.15rem] font-extrabold leading-6 text-[#111111]">
                Exact birth context and one clear question make consultation
                more useful.
              </p>
            </div>
          </Container>
        </section>

        <section className="bg-white">
          <Container className="space-y-3 py-4 sm:py-7">
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[color:var(--color-accent-strong)]">
              Concern cards
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {concernCards.map((card) => (
                <Card
                  key={card}
                  tone="default"
                  className="min-h-24 border-[rgba(184,137,67,0.22)] bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_10px_18px_rgba(17,17,17,0.05)] before:opacity-0"
                >
                  <h2 className="text-[1rem] font-extrabold leading-tight text-[#111111]">
                    {card}
                  </h2>
                  <p className="mt-2 text-[0.82rem] font-semibold leading-5 text-[#111111]/80">
                    Prepare the question, then review it with Kundli context.
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        <section className="border-y border-[rgba(184,137,67,0.18)] bg-white">
          <Container className="grid gap-4 py-4 sm:py-7 lg:grid-cols-[0.45fr_0.55fr]">
            <Card
              tone="default"
              className="border-[rgba(184,137,67,0.22)] bg-white p-4 before:opacity-0 sm:p-5"
            >
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[color:var(--color-accent-strong)]">
                Preparation checklist
              </p>
              <p className="mt-2 text-[1.05rem] font-extrabold leading-6 text-[#111111]">
                Keep the session focused and respectful of your privacy.
              </p>
            </Card>
            <div className="grid gap-2 sm:grid-cols-2">
              {preparationChecklist.map((item) => (
                <div
                  key={item}
                  className="flex min-h-12 items-center gap-3 rounded-[1rem] border border-[rgba(184,137,67,0.2)] bg-white px-3 py-2 text-[0.86rem] font-bold text-[#111111] shadow-[0_7px_13px_rgba(17,17,17,0.045)]"
                >
                  <span className="h-2 w-2 rounded-full bg-[#4CBB17]" />
                  {item}
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-white">
          <Container className="py-4 sm:py-7">
            <Card
              tone="default"
              className="grid gap-4 border-[rgba(76,187,23,0.24)] bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_12px_22px_rgba(17,17,17,0.055)] before:opacity-0 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
            >
              <div>
                <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[#2f7e16]">
                  Safety note
                </p>
                <p className="mt-2 text-[0.92rem] font-semibold leading-6 text-[#111111]">
                  Astrology guidance is educational and spiritual. It is not a
                  guaranteed outcome and is not a substitute for licensed
                  medical, legal, or financial advice.
                </p>
              </div>
              <TrackedLink
                href="/ai"
                eventName="premium_ai_cta_click"
                eventPayload={{
                  page: "/consultation",
                  feature: "consultation-ask-ni",
                }}
                className={buttonStyles({
                  tone: "secondary",
                  size: "lg",
                  className:
                    "w-full justify-center rounded-[var(--radius-pill)] lg:w-auto",
                })}
              >
                Ask NI
              </TrackedLink>
            </Card>
          </Container>
        </section>
      </main>
    </>
  );
}
