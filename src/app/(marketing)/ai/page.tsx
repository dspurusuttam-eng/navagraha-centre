import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { NavagrahaAiIcon } from "@/components/icons/astrology-icons";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { createToolMetadata } from "@/lib/seo/metadata";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();

  return createToolMetadata({
    title: "Ask NI Kundli Assistant",
    description:
      "Ask simple Kundli questions, understand chart terms, and prepare for consultation with NAVAGRAHA CENTRE.",
    path: "/ai",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: [
      "ask ni",
      "kundli interpretation",
      "vedic astrology assistant",
      "navagraha centre",
    ],
  });
}

export const revalidate = 3600;

const suggestedQuestions = [
  "What is Lagna?",
  "What is Rashi?",
  "What does my Kundli result mean?",
  "What should I ask in consultation?",
] as const;

const guidanceCards = [
  {
    title: "Kundli first",
    copy: "Ask NI works best after your birth chart is generated.",
  },
  {
    title: "Simple language",
    copy: "Use it to understand chart terms, not to replace human review.",
  },
  {
    title: "Next step",
    copy: "For serious concerns, continue with an Acharya consultation.",
  },
] as const;

export default function AiPage() {
  return (
    <>
      <PageViewTracker page="/ai" feature="ask-ni-guided-page" />

      <main className="launch-page launch-page-ai min-w-0 overflow-hidden bg-white pb-[calc(7rem+env(safe-area-inset-bottom))] text-[#111111] xl:pb-12">
        <section className="border-b border-black/8 bg-white">
          <Container className="grid gap-4 py-4 sm:py-7 lg:grid-cols-[minmax(0,0.82fr)_minmax(18rem,0.48fr)] lg:items-center">
            <Card
              tone="default"
              className="min-w-0 border-[rgba(76,187,23,0.26)] bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-8px_16px_rgba(76,187,23,0.035),0_16px_30px_rgba(17,17,17,0.065)] before:opacity-0 sm:p-6"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[rgba(76,187,23,0.3)] bg-white text-[#2f7e16] shadow-[0_8px_16px_rgba(17,17,17,0.06)]">
                  <NavagrahaAiIcon className="h-7 w-7" />
                </span>
                <div className="min-w-0">
                  <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[#2f7e16]">
                    Guided assistant
                  </p>
                  <h1
                    className="mt-1 font-[family-name:var(--font-display)] text-[2.3rem] font-semibold text-[#111111] sm:text-[3.5rem]"
                    style={{ lineHeight: "0.96" }}
                  >
                    Ask NI
                  </h1>
                </div>
              </div>
              <p className="mt-4 max-w-2xl text-[1rem] font-semibold leading-6 text-[#111111]">
                Understand your Kundli in simple language.
              </p>
              <div className="mt-5 grid gap-3 min-[430px]:grid-cols-2 sm:flex sm:flex-wrap">
                <TrackedLink
                  href="/kundli"
                  eventName="cta_click"
                  eventPayload={{
                    page: "/ai",
                    feature: "ask-ni-generate-kundli",
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
                  href="/consultation"
                  eventName="consultation_cta_click"
                  eventPayload={{
                    page: "/ai",
                    feature: "ask-ni-consult-acharya",
                  }}
                  className={buttonStyles({
                    tone: "secondary",
                    size: "lg",
                    className:
                      "w-full justify-center rounded-[var(--radius-pill)] border-[rgba(76,187,23,0.34)] sm:w-auto",
                  })}
                >
                  Consult Acharya
                </TrackedLink>
              </div>
            </Card>

            <div className="rounded-[1.55rem] border border-[rgba(184,137,67,0.24)] bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_12px_24px_rgba(17,17,17,0.06)]">
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[color:var(--color-accent-strong)]">
                Suggested questions
              </p>
              <div className="mt-3 grid gap-2">
                {suggestedQuestions.map((question) => (
                  <div
                    key={question}
                    className="rounded-[0.95rem] border border-[rgba(184,137,67,0.2)] bg-white px-3 py-2 text-[0.86rem] font-bold text-[#111111] shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_7px_13px_rgba(17,17,17,0.045)]"
                  >
                    {question}
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section className="bg-white">
          <Container className="grid gap-4 py-4 sm:py-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(18rem,0.45fr)]">
            <Card
              tone="default"
              className="min-w-0 border-[rgba(184,137,67,0.24)] bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_14px_26px_rgba(17,17,17,0.06)] before:opacity-0 sm:p-5"
            >
              <label
                htmlFor="ask-ni-input"
                className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[color:var(--color-accent-strong)]"
              >
                Your question
              </label>
              <textarea
                id="ask-ni-input"
                rows={5}
                placeholder="Ask about Lagna, Rashi, your result, or what to prepare for consultation."
                className="mt-3 w-full resize-none rounded-[1rem] border border-[rgba(184,137,67,0.24)] bg-white px-4 py-3 text-[0.95rem] font-semibold leading-6 text-[#111111] outline-none shadow-[inset_0_2px_8px_rgba(17,17,17,0.045)] placeholder:text-[#111111]/55 focus:border-[rgba(76,187,23,0.42)] focus:ring-2 focus:ring-[rgba(76,187,23,0.14)]"
              />
              <p className="mt-3 rounded-[0.95rem] border border-[rgba(76,187,23,0.22)] bg-white px-3 py-2 text-[0.8rem] font-semibold leading-5 text-[#111111]/80">
                Ask NI is guidance-first and educational. It does not guarantee
                outcomes or replace licensed medical, legal, or financial
                advice.
              </p>
            </Card>

            <div className="grid gap-3">
              {guidanceCards.map((card) => (
                <Card
                  key={card.title}
                  tone="default"
                  className="border-[rgba(184,137,67,0.22)] bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_10px_18px_rgba(17,17,17,0.05)] before:opacity-0"
                >
                  <h2 className="text-[0.95rem] font-extrabold text-[#111111]">
                    {card.title}
                  </h2>
                  <p className="mt-1 text-[0.82rem] font-semibold leading-5 text-[#111111]/80">
                    {card.copy}
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </section>
      </main>
    </>
  );
}
