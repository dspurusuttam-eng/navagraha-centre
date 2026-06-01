import Link from "next/link";
import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { JsonLd } from "@/components/seo/json-ld";
import { createToolMetadata } from "@/lib/seo/metadata";
import { getCoreSeoCopy } from "@/lib/seo/seo-config";
import { createBreadcrumbSchema, createServiceSchema } from "@/lib/seo/schema";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";

const filterTabs = ["All", "Items", "Services", "Reports", "Janam Patrika"];

const trustPoints = [
  "Vedic Guidance First",
  "Consult Before Choosing",
  "Safe Remedy Awareness",
  "Ethical Support",
];

const categories = [
  "Gemstone",
  "Rudraksha",
  "Mala",
  "Kavacham",
  "Yantra",
  "Bracelet",
  "Puja and Yagya",
  "Reports",
  "Janam Patrika",
];

const safetyPoints = [
  "No Guaranteed Outcome Claims",
  "Consultation Recommended",
  "Use with Faith & Discipline",
  "Secure & Ethical Practices",
];

const supportRoutes = [
  { label: "Consultation", href: "/consultation" },
  { label: "Reports", href: "/reports" },
  { label: "Learn", href: "/articles" },
  { label: "Tools", href: "/tools" },
];

const baseButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-[#111111] bg-white px-5 py-2 text-center text-sm font-semibold text-[#111111] transition hover:bg-[#111111] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7a95d]";

const quietButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-[#d8c47a] bg-white px-5 py-2 text-center text-sm font-semibold text-[#111111] transition hover:border-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7a95d]";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const localized = getCoreSeoCopy("shop", locale);

  return createToolMetadata({
    title: localized.title,
    description: localized.description,
    path: "/shop",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: [
      "vedic shop",
      "gemstones",
      "rudraksha",
      "puja guidance",
      "janam patrika",
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
      name: "Vedic Shop Guidance",
      description:
        "Sacred Vedic item, report, Janam Patrika, Puja, and consultation-linked guidance from NAVAGRAHA CENTRE.",
      path: "/shop",
      locale,
      serviceType: "Vedic Commerce Guidance",
    }),
  ];

  return (
    <>
      <JsonLd id="shop-page-schema" data={shopSchemas} />
      <PageViewTracker page="/shop" feature="shop-page" />
      <AnalyticsEventTracker
        event="shop_interaction"
        payload={{ page: "/shop", feature: "shop-page" }}
      />

      <main className="bg-white text-[#111111]">
        <section className="mx-auto flex w-full max-w-7xl flex-col gap-7 px-4 pb-8 pt-5 sm:px-6 lg:px-8">
          <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.48fr)] lg:items-end">
            <div className="min-w-0 space-y-5">
              <p className="w-fit rounded-full border border-[#d8c47a] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#111111]">
                Vedic Commerce Guidance
              </p>
              <div className="space-y-3">
                <h1 className="max-w-full break-words text-4xl font-semibold leading-tight text-[#050505] sm:text-5xl lg:text-6xl">
                  Vedic Shop
                </h1>
                <p className="max-w-2xl text-base leading-7 text-[#111111] sm:text-lg">
                  Sacred Vedic items, Janam Patrika, reports, Puja guidance,
                  and consultation-linked support.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href="#shop-categories" className={baseButtonClass}>
                  Explore Categories
                </a>
                <Link href="/consultation" className={quietButtonClass}>
                  Consult J P Sarmah
                </Link>
                <Link href="/ai" className={quietButtonClass}>
                  Ask NI
                </Link>
              </div>
            </div>

            <div className="min-w-0 rounded-[1.25rem] border border-[#111111] bg-white p-4 shadow-[0_18px_44px_rgba(5,5,5,0.08)]">
              <div className="grid min-w-0 gap-3 rounded-[1rem] border border-[#d8c47a] bg-white p-3 sm:grid-cols-[1fr_auto]">
                <label className="sr-only" htmlFor="shop-search">
                  Search Vedic items, remedies, reports...
                </label>
                <input
                  id="shop-search"
                  readOnly
                  value=""
                  placeholder="Search Vedic items, remedies, reports..."
                  className="min-h-11 w-full min-w-0 bg-white text-sm text-[#111111] outline-none placeholder:text-[#111111]"
                />
                <span className="flex min-h-11 w-fit items-center rounded-full border border-[#111111] bg-white px-4 text-xs font-semibold uppercase tracking-[0.08em] text-[#111111]">
                  Guide
                </span>
              </div>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                {filterTabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className="shrink-0 rounded-full border border-[#d8c47a] bg-white px-4 py-2 text-sm font-semibold text-[#111111]"
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {trustPoints.map((point) => (
              <div
                key={point}
                className="rounded-[1rem] border border-[#111111] bg-white px-4 py-3 text-sm font-semibold text-[#111111]"
              >
                {point}
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:px-8">
          <div className="rounded-[1.5rem] border border-[#111111] bg-white p-5 shadow-[0_16px_42px_rgba(5,5,5,0.07)] sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#5f8f4d]">
              Guidance First
            </p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-[#050505] sm:text-3xl">
              Not Every Remedy Is for Everyone
            </h2>
            <p className="mt-3 text-base leading-7 text-[#111111]">
              Choose the right remedy based on your Kundli, Dasha, Dosha, and
              planetary condition.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/consultation" className={baseButtonClass}>
                Consult J P Sarmah
              </Link>
              <Link href="/ai" className={quietButtonClass}>
                Ask NI
              </Link>
            </div>
          </div>

          <div
            id="shop-categories"
            className="rounded-[1.5rem] border border-[#111111] bg-white p-4 sm:p-5"
          >
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#111111]">
                  Category Grid
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[#050505]">
                  Choose by purpose, then confirm with guidance.
                </h2>
              </div>
              <span className="hidden rounded-full border border-[#d8c47a] px-3 py-1 text-xs font-semibold text-[#111111] sm:inline-flex">
                3x3
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {categories.map((category) => (
                <div
                  key={category}
                  className="flex min-h-24 items-center justify-center rounded-[1rem] border border-[#111111] bg-white px-2 py-3 text-center text-[0.72rem] font-semibold leading-snug text-[#111111] shadow-[0_10px_24px_rgba(5,5,5,0.04)] sm:text-sm"
                >
                  {category}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-5 rounded-[1.5rem] border border-[#111111] bg-white p-5 shadow-[0_18px_48px_rgba(5,5,5,0.07)] sm:p-6 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
            <div className="rounded-[1.25rem] border border-[#d8c47a] bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#111111]">
                Featured Guidance
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight text-[#050505]">
                Puja and Yagya
              </h2>
              <p className="mt-3 text-base leading-7 text-[#111111]">
                Kundli-based Vedic rituals and Yagya guidance.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold leading-tight text-[#050505]">
                Puja and Yagya Services
              </h3>
              <p className="text-base leading-7 text-[#111111]">
                Book Vedic Puja and Yagya practices recommended according to
                Kundli, planetary condition, Dasha, Dosha, and spiritual
                requirement.
              </p>
              <p className="text-base leading-7 text-[#111111]">
                Puja and Yagya are sacred Vedic practices performed for
                spiritual discipline, planetary peace, inner strength, and
                devotional support. At NAVAGRAHA CENTRE, ritual recommendations
                should be made after understanding the person&apos;s Kundli, current
                planetary condition, and purpose of guidance.
              </p>
              <Link href="/consultation" className={baseButtonClass}>
                Request Booking Guidance
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="rounded-[1.5rem] border border-[#111111] bg-white p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#19a9c8]">
              Ask NI
            </p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-[#050505]">
              Ask NI Before Choosing
            </h2>
            <p className="mt-3 text-base leading-7 text-[#111111]">
              Get clarity about gemstones, Rudraksha, Puja, reports, and more.
            </p>
            <Link href="/ai" className={`${baseButtonClass} mt-5`}>
              Ask NI
            </Link>
          </div>

          <div className="rounded-[1.5rem] border border-[#111111] bg-white p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#5f8f4d]">
              Authority
            </p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-[#050505]">
              Guided by J P Sarmah
            </h2>
            <p className="mt-3 text-base leading-7 text-[#111111]">
              Decades of experience in Vedic Astrology, remedies, and spiritual
              guidance.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {supportRoutes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className="rounded-full border border-[#d8c47a] bg-white px-4 py-2 text-sm font-semibold text-[#111111]"
                >
                  {route.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
          <div className="rounded-[1.5rem] border border-[#111111] bg-white p-5 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {safetyPoints.map((point) => (
                <div
                  key={point}
                  className="rounded-[1rem] border border-[#d8c47a] bg-white px-4 py-3 text-sm font-semibold text-[#111111]"
                >
                  {point}
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <p className="text-sm leading-7 text-[#111111]">
                Puja and Yagya recommendations should be selected according to
                Kundli, purpose, tradition, availability, and proper guidance.
                No ritual should be presented as a guaranteed cure or instant
                solution.
              </p>
              <p className="text-sm leading-7 text-[#111111]">
                Puja and Yagya services are spiritual and devotional practices.
                They are not a substitute for medical, legal, financial, or
                emergency advice. NAVAGRAHA CENTRE does not promise guaranteed
                outcomes, instant results, or fear-based remedies. Personal
                recommendations should be confirmed through proper Kundli-based
                consultation.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
