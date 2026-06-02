import Link from "next/link";
import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { JsonLd } from "@/components/seo/json-ld";
import { createPageMetadata } from "@/lib/seo/metadata";
import {
  createBreadcrumbSchema,
  createPersonSchema,
} from "@/lib/seo/schema";
import { getLocalizedPath } from "@/modules/localization/config";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";

const guidancePillars = [
  "Kundli Guidance",
  "Panchang & Muhurat",
  "Remedies with Caution",
  "Reports & Janam Patrika",
  "Learning & Ethics",
  "Consultation Support",
];

const guidanceFlow = [
  "Understand the chart",
  "Study timing and context",
  "Recommend carefully",
  "Follow ethics and discipline",
];

const safetyPoints = [
  "No guaranteed outcome claims.",
  "No cure claims.",
  "No fear-based remedies.",
  "Spiritual and astrological guidance should not replace medical, legal, financial, or emergency advice.",
];

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();

  return createPageMetadata({
    title: "J P Sarmah Desk",
    description:
      "Authority notes, Vedic guidance, and careful astrology learning from NAVAGRAHA CENTRE.",
    path: "/from-the-desk",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: [
      "J P Sarmah Desk",
      "Joy Prakash Sarmah",
      "Vedic astrology authority",
      "consultation guidance",
      "astrology learning",
    ],
  });
}

export const revalidate = 900;

export default async function FromTheDeskPage() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const localizeHref = (href: string) =>
    getLocalizedPath(locale, href, {
      forcePrefix: hasExplicitLocalePrefix,
    });

  const deskSchemas = [
    createPersonSchema({
      locale,
      path: "/joy-prakash-sarmah",
    }),
    createBreadcrumbSchema({
      locale,
      explicitLocalePrefix: hasExplicitLocalePrefix,
      items: [
        { name: "Home", path: "/" },
        { name: "J P Sarmah Desk", path: "/from-the-desk" },
      ],
    }),
  ];

  return (
    <>
      <PageViewTracker page="/from-the-desk" feature="from-the-desk-desk" />
      <AnalyticsEventTracker
        event="from_the_desk_read"
        payload={{ page: "/from-the-desk", feature: "from-the-desk-desk" }}
      />
      <JsonLd id="from-the-desk-schema" data={deskSchemas} />

      <main className="bg-white text-[#111111]">
        <section className="mx-auto w-full max-w-6xl px-4 pb-10 pt-5 sm:px-6 lg:px-8">
          <div className="grid gap-6 rounded-[1.75rem] border border-[#111111] bg-white p-5 shadow-[0_20px_50px_rgba(5,5,5,0.06)] sm:p-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:items-end">
            <div className="space-y-5">
              <p className="w-fit rounded-full border border-[#d8c47a] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#111111]">
                J P Sarmah Desk
              </p>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-[#050505] sm:text-5xl">
                  J P Sarmah Desk
                </h1>
                <p className="max-w-2xl text-base leading-7 text-[#111111] sm:text-lg">
                  Authority notes, Vedic guidance, and careful astrology
                  learning from NAVAGRAHA CENTRE.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={localizeHref("/consultation")}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#111111] bg-white px-5 py-2 text-sm font-semibold text-[#111111] transition hover:bg-[#111111] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7a95d]"
                >
                  Consult J P Sarmah
                </Link>
                <Link
                  href={localizeHref("/ai")}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#d8c47a] bg-white px-5 py-2 text-sm font-semibold text-[#111111] transition hover:border-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7a95d]"
                >
                  Ask NI
                </Link>
              </div>
            </div>

            <div className="rounded-[1.4rem] border border-[#111111] bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#111111]">
                Human Authority Identity
              </p>
              <h2 className="mt-3 text-2xl font-semibold leading-tight text-[#050505]">
                Joy Prakash Sarmah
              </h2>
              <p className="mt-3 text-base leading-7 text-[#111111]">
                J P Sarmah is the human authority identity of NAVAGRAHA
                CENTRE. The desk exists to present careful Vedic guidance,
                learning, and consultation direction without turning astrology
                into a biography, testimonial, or guarantee page.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {guidancePillars.map((pillar) => (
              <div
                key={pillar}
                className="rounded-[1.1rem] border border-[#111111] bg-white px-4 py-4 text-sm font-semibold text-[#111111] shadow-[0_10px_24px_rgba(5,5,5,0.04)]"
              >
                {pillar}
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:px-8">
          <div className="rounded-[1.4rem] border border-[#111111] bg-white p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#5f8f4d]">
              How Guidance Works
            </p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-[#050505]">
              Careful guidance follows a simple sequence.
            </h2>
            <div className="mt-5 space-y-3">
              {guidanceFlow.map((step, index) => (
                <div
                  key={step}
                  className="flex items-start gap-3 rounded-[1rem] border border-[#d8c47a] bg-white px-4 py-3"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#111111] text-xs font-semibold text-[#111111]">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-[#111111]">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[1.4rem] border border-[#111111] bg-white p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#111111]">
                Ask NI Support
              </p>
              <h2 className="mt-3 text-2xl font-semibold leading-tight text-[#050505]">
                Ask NI for explanations
              </h2>
              <p className="mt-3 text-base leading-7 text-[#111111]">
                Use Ask NI to understand astrology concepts, terms, and
                guidance before taking decisions. It supports learning and does
                not replace human guidance.
              </p>
              <Link
                href={localizeHref("/ai")}
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-[#d8c47a] bg-white px-5 py-2 text-sm font-semibold text-[#111111] transition hover:border-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7a95d]"
              >
                Ask NI
              </Link>
            </div>

            <div className="rounded-[1.4rem] border border-[#111111] bg-white p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#111111]">
                Need Personal Guidance?
              </p>
              <h2 className="mt-3 text-2xl font-semibold leading-tight text-[#050505]">
                Consult J P Sarmah
              </h2>
              <p className="mt-3 text-base leading-7 text-[#111111]">
                For personal interpretation, use the consultation path. There
                are no booking slots, availability, pricing, or instant
                consultation claims here.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={localizeHref("/consultation")}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#111111] bg-white px-5 py-2 text-sm font-semibold text-[#111111] transition hover:bg-[#111111] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7a95d]"
                >
                  Consult J P Sarmah
                </Link>
                <Link
                  href={localizeHref("/articles")}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#d8c47a] bg-white px-5 py-2 text-sm font-semibold text-[#111111] transition hover:border-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7a95d]"
                >
                  Learn Articles
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-[1.4rem] border border-[#111111] bg-white p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#111111]">
              Safety and Ethics
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {safetyPoints.map((point) => (
                <div
                  key={point}
                  className="rounded-[1rem] border border-[#d8c47a] bg-white px-4 py-3 text-sm leading-6 text-[#111111]"
                >
                  {point}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
