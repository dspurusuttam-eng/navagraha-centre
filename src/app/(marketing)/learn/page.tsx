import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { createPageMetadata } from "@/lib/seo/metadata";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();

  return createPageMetadata({
    title: "Learn Vedic Astrology Basics",
    description:
      "Small NAVAGRAHA CENTRE learning hub for Kundli, Lagna, Rashi, Nakshatra, houses, planets, Acharya guidance, and remedy boundaries.",
    path: "/learn",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: [
      "learn kundli",
      "what is lagna",
      "what is rashi",
      "vedic astrology basics",
    ],
  });
}

export const revalidate = 900;

const learningCards = [
  "What is Janam Kundli?",
  "What is Lagna?",
  "What is Rashi?",
  "What is Nakshatra?",
  "What are 12 Houses?",
  "What are 9 Planets?",
  "Why Consult an Acharya?",
  "Remedies: Educational Only",
] as const;

export default function LearnPage() {
  return (
    <>
      <PageViewTracker page="/learn" feature="learn-mini-hub" />

      <main className="launch-page launch-page-learn min-w-0 overflow-hidden bg-white pb-[calc(7rem+env(safe-area-inset-bottom))] text-[#111111] xl:pb-12">
        <section className="border-b border-black/8 bg-white">
          <Container className="py-4 sm:py-7">
            <Card
              tone="default"
              className="min-w-0 border-[rgba(184,137,67,0.24)] bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-8px_16px_rgba(184,137,67,0.035),0_16px_30px_rgba(17,17,17,0.065)] before:opacity-0 sm:p-6"
            >
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[color:var(--color-accent-strong)]">
                Small learning hub
              </p>
              <h1
                className="mt-2 font-[family-name:var(--font-display)] text-[2.35rem] font-semibold text-[#111111] sm:text-[3.6rem]"
                style={{ lineHeight: "0.96" }}
              >
                Learn
              </h1>
              <p className="mt-3 max-w-2xl text-[1rem] font-semibold leading-6 text-[#111111]">
                Simple Vedic astrology basics to help you understand your Kundli
                before asking Ask NI or consulting an Acharya.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <TrackedLink
                  href="/kundli"
                  eventName="cta_click"
                  eventPayload={{
                    page: "/learn",
                    feature: "learn-generate-kundli",
                  }}
                  className={buttonStyles({
                    tone: "accent",
                    size: "lg",
                    className: "rounded-[var(--radius-pill)]",
                  })}
                >
                  Generate Kundli
                </TrackedLink>
                <TrackedLink
                  href="/ai"
                  eventName="premium_ai_cta_click"
                  eventPayload={{ page: "/learn", feature: "learn-ask-ni" }}
                  className={buttonStyles({
                    tone: "secondary",
                    size: "lg",
                    className:
                      "rounded-[var(--radius-pill)] border-[rgba(76,187,23,0.34)]",
                  })}
                >
                  Ask NI
                </TrackedLink>
              </div>
            </Card>
          </Container>
        </section>

        <section className="bg-white">
          <Container className="space-y-3 py-4 sm:py-7">
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[color:var(--color-accent-strong)]">
              Basics
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {learningCards.map((card) => (
                <Card
                  key={card}
                  tone="default"
                  className="min-h-28 border-[rgba(184,137,67,0.22)] bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_10px_18px_rgba(17,17,17,0.05)] before:opacity-0"
                >
                  <h2 className="text-[1rem] font-extrabold leading-tight text-[#111111]">
                    {card}
                  </h2>
                  <p className="mt-2 text-[0.8rem] font-semibold leading-5 text-[#111111]/80">
                    A short, safe learning prompt for understanding Kundli
                    language without fear-based claims.
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        <section className="border-y border-[rgba(184,137,67,0.18)] bg-white">
          <Container className="py-4 sm:py-6">
            <Card
              tone="default"
              className="border-[rgba(76,187,23,0.22)] bg-white p-4 before:opacity-0"
            >
              <p className="text-[0.92rem] font-semibold leading-6 text-[#111111]">
                Learning content is educational. Serious personal decisions
                should be reviewed through Kundli context and human guidance.
              </p>
            </Card>
          </Container>
        </section>
      </main>
    </>
  );
}
