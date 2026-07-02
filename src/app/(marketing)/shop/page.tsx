import Link from "next/link";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { JsonLd } from "@/components/seo/json-ld";
import { createToolMetadata } from "@/lib/seo/metadata";
import { createBreadcrumbSchema, createServiceSchema } from "@/lib/seo/schema";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";

const categories = [
  "Gemstone",
  "Rudraksha",
  "Mala",
  "Kavacham",
  "Yantra",
  "Bracelet",
  "Puja and Yagya",
  "Books and Knowledge",
  "Others",
] as const;

const safetyPoints = [
  "Catalogue only",
  "Consult before choosing",
  "No guaranteed outcomes",
] as const;

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();

  return createToolMetadata({
    title: "Vedic Shop Catalogue",
    description:
      "Browse guidance-first Vedic categories including gemstones, rudraksha, yantra, mala, and puja items.",
    path: "/shop",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: [
      "vedic shop",
      "gemstone guidance",
      "rudraksha",
      "yantra",
      "puja guidance",
    ],
  });
}

export default async function ShopPage() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const shopSchemas = [
    createBreadcrumbSchema({
      locale,
      explicitLocalePrefix: hasExplicitLocalePrefix,
      items: [
        { name: "Home", path: "/" },
        { name: "Shop", path: "/shop" },
      ],
    }),
    createServiceSchema({
      name: "Vedic Shop Catalogue",
      description:
        "Guidance-first Vedic catalogue categories from NAVAGRAHA CENTRE.",
      path: "/shop",
      locale,
      serviceType: "Vedic Catalogue Guidance",
    }),
  ];

  return (
    <>
      <JsonLd id="shop-page-schema" data={shopSchemas} />
      <PageViewTracker page="/shop" feature="shop-catalogue-page" />

      <main className="launch-page launch-page-shop min-w-0 overflow-hidden bg-white pb-[calc(7rem+env(safe-area-inset-bottom))] text-[#111111] xl:pb-12">
        <section className="border-b border-black/8 bg-white">
          <Container className="grid gap-4 py-4 sm:py-7 lg:grid-cols-[minmax(0,0.88fr)_minmax(18rem,0.5fr)] lg:items-center">
            <Card
              tone="default"
              className="min-w-0 border-[rgba(184,137,67,0.24)] bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-8px_16px_rgba(184,137,67,0.035),0_16px_30px_rgba(17,17,17,0.065)] before:opacity-0 sm:p-6"
            >
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[color:var(--color-accent-strong)]">
                Catalogue only
              </p>
              <h1
                className="mt-2 font-[family-name:var(--font-display)] text-[2.35rem] font-semibold text-[#111111] sm:text-[3.6rem]"
                style={{ lineHeight: "0.96" }}
              >
                Vedic Shop
              </h1>
              <p className="mt-3 max-w-2xl text-[1rem] font-semibold leading-6 text-[#111111]">
                Browse sacred Vedic categories in a guidance-first way. Choose
                only after understanding your Kundli context.
              </p>
              <div className="mt-5 grid gap-3 min-[430px]:grid-cols-2 sm:flex sm:flex-wrap">
                <TrackedLink
                  href="/consultation"
                  eventName="consultation_cta_click"
                  eventPayload={{ page: "/shop", feature: "shop-consult" }}
                  className={buttonStyles({
                    tone: "accent",
                    size: "lg",
                    className:
                      "w-full justify-center rounded-[var(--radius-pill)] sm:w-auto",
                  })}
                >
                  Consult Before Choosing
                </TrackedLink>
                <TrackedLink
                  href="/kundli"
                  eventName="cta_click"
                  eventPayload={{ page: "/shop", feature: "shop-kundli" }}
                  className={buttonStyles({
                    tone: "secondary",
                    size: "lg",
                    className:
                      "w-full justify-center rounded-[var(--radius-pill)] border-[rgba(76,187,23,0.34)] sm:w-auto",
                  })}
                >
                  Generate Kundli
                </TrackedLink>
              </div>
            </Card>

            <Card
              tone="default"
              className="border-[rgba(76,187,23,0.24)] bg-white p-4 before:opacity-0"
            >
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[#2f7e16]">
                Safety
              </p>
              <p className="mt-3 text-[1.08rem] font-extrabold leading-6 text-[#111111]">
                No item is presented as a guaranteed cure, instant solution, or
                replacement for proper guidance.
              </p>
            </Card>
          </Container>
        </section>

        <section className="bg-white">
          <Container className="space-y-3 py-4 sm:py-7">
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[color:var(--color-accent-strong)]">
              3x3 category grid
            </p>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {categories.map((category) => (
                <div
                  key={category}
                  className="flex min-h-[6.8rem] min-w-0 items-center justify-center rounded-[1rem] border border-[rgba(184,137,67,0.22)] bg-white px-2 py-3 text-center text-[0.68rem] font-extrabold leading-tight text-[#111111] shadow-[inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-7px_14px_rgba(184,137,67,0.035),0_10px_18px_rgba(17,17,17,0.055)] sm:text-[0.86rem]"
                >
                  {category}
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="border-y border-[rgba(184,137,67,0.18)] bg-white">
          <Container className="grid gap-3 py-4 sm:grid-cols-3 sm:py-6">
            {safetyPoints.map((point) => (
              <div
                key={point}
                className="rounded-[1rem] border border-[rgba(76,187,23,0.22)] bg-white px-4 py-3 text-center text-[0.82rem] font-extrabold text-[#111111] shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_8px_14px_rgba(17,17,17,0.045)]"
              >
                {point}
              </div>
            ))}
          </Container>
        </section>

        <section className="bg-white">
          <Container className="py-4 sm:py-7">
            <Card
              tone="default"
              className="border-[rgba(184,137,67,0.22)] bg-white p-4 before:opacity-0 sm:p-5"
            >
              <p className="text-[0.92rem] font-semibold leading-6 text-[#111111]">
                Vedic items are spiritual support objects. Personal selection
                should be confirmed through Kundli-based guidance and never used
                as a substitute for licensed medical, legal, or financial care.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/learn"
                  className={buttonStyles({
                    tone: "secondary",
                    size: "sm",
                    className: "rounded-[var(--radius-pill)]",
                  })}
                >
                  Learn Basics
                </Link>
                <Link
                  href="/terms"
                  className={buttonStyles({
                    tone: "ghost",
                    size: "sm",
                    className: "rounded-[var(--radius-pill)]",
                  })}
                >
                  Read Terms
                </Link>
              </div>
            </Card>
          </Container>
        </section>
      </main>
    </>
  );
}
