import { TrackedLink } from "@/components/analytics/tracked-link";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { PageHero } from "@/components/site/page-hero";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { createToolMetadata } from "@/lib/seo/metadata";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";
import { NumerologyToolPanel } from "@/modules/numerology/components/numerology-tool-panel";

type ReadinessItem = {
  title: string;
  status: string;
  description: string;
};

const readinessItems: readonly ReadinessItem[] = [
  {
    title: "Date of Birth",
    status: "Required",
    description:
      "Anchors the verified Life Path and core number calculation before anything else is shown.",
  },
  {
    title: "Full Name",
    status: "Optional",
    description:
      "Enables name-based numerology while staying strictly within validated letter input.",
  },
  {
    title: "Business Name",
    status: "Optional",
    description:
      "Supports business naming review without inventing any recommendation or guarantee.",
  },
  {
    title: "Mobile Number",
    status: "Optional",
    description:
      "Helps when you want a light number reference for a mobile contact choice.",
  },
  {
    title: "Vehicle Number",
    status: "Optional",
    description:
      "Provides a calm number reference only after a valid number string is entered.",
  },
  {
    title: "Safe Empty State",
    status: "Preparation",
    description:
      "No number is shown until you enter verified inputs. The public page stays calm and factual.",
  },
];

const numerologyCategoryCards: readonly ReadinessItem[] = [
  {
    title: "Life Path Number",
    status: "Calculation preparing",
    description:
      "Appears only after a valid date of birth is entered into the calculator below.",
  },
  {
    title: "Destiny Number",
    status: "Calculation preparing",
    description:
      "Shown only from a verified numerology calculation and never from a fabricated preview.",
  },
  {
    title: "Name Numerology",
    status: "Calculation preparing",
    description:
      "Becomes available after a valid alphabetic name is provided for analysis.",
  },
  {
    title: "Business Name Numerology",
    status: "Calculation preparing",
    description:
      "Shown only when a real business name is entered and the utility is ready.",
  },
  {
    title: "Mobile Number Numerology",
    status: "Calculation preparing",
    description:
      "Appears only after a valid mobile number is supplied for review.",
  },
  {
    title: "Vehicle Number Numerology",
    status: "Calculation preparing",
    description:
      "Shown only after a valid vehicle number is entered into the calculator.",
  },
];

const journeyActions = [
  {
    href: "/ai",
    label: "Ask NI",
    tone: "accent" as const,
    feature: "numerology-journey-ai",
  },
  {
    href: "/reports",
    label: "View Reports",
    tone: "secondary" as const,
    feature: "numerology-journey-reports",
  },
  {
    href: "/consultation",
    label: "Book Consultation",
    tone: "secondary" as const,
    feature: "numerology-journey-consultation",
  },
  {
    href: "/kundli",
    label: "Generate Kundli",
    tone: "secondary" as const,
    feature: "numerology-journey-kundli",
  },
] as const;

function FoundationCard({
  item,
}: Readonly<{
  item: ReadinessItem;
}>) {
  return (
    <Card
      tone="light"
      className="flex h-full flex-col gap-3 border-black/8 bg-white p-4 shadow-[0_12px_28px_rgba(17,24,39,0.04)] before:opacity-0"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
            Numerology Input
          </p>
          <h3 className="text-[length:var(--font-size-body-lg)] font-semibold text-[color:var(--color-ink-strong)]">
            {item.title}
          </h3>
        </div>
        <Badge tone={item.status === "Required" ? "accent" : "neutral"}>
          {item.status}
        </Badge>
      </div>
      <p className="text-[0.88rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
        {item.description}
      </p>
    </Card>
  );
}

function CategoryCard({
  item,
}: Readonly<{
  item: ReadinessItem;
}>) {
  return (
    <Card
      tone="default"
      className="flex h-full flex-col gap-3 border-black/8 bg-white p-4 shadow-[0_12px_28px_rgba(17,24,39,0.04)] before:opacity-0"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
            Numerology Category
          </p>
          <h3 className="text-[length:var(--font-size-body-lg)] font-semibold text-[color:var(--color-ink-strong)]">
            {item.title}
          </h3>
        </div>
        <Badge tone="neutral">{item.status}</Badge>
      </div>
      <p className="text-[0.88rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
        {item.description}
      </p>
      <TrackedLink
        href="#numerology-tool"
        eventName="cta_click"
        eventPayload={{
          page: "/numerology",
          feature: `numerology-category-${item.title.toLowerCase().replace(/\s+/g, "-")}`,
        }}
        className={buttonStyles({
          size: "sm",
          tone: "secondary",
          className: "w-full justify-center",
        })}
      >
        Open Calculator
      </TrackedLink>
    </Card>
  );
}

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();

  return createToolMetadata({
    title: "Numerology Calculator",
    description:
      "Use date of birth, name, business name, mobile number, and vehicle number as optional numerology references with safe preparation states and verified output only.",
    path: "/numerology",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: [
      "numerology calculator",
      "life path number",
      "destiny number",
      "name numerology",
      "business name numerology",
    ],
  });
}

export const revalidate = 3600;

export default function NumerologyPage() {
  return (
    <>
      <PageViewTracker page="/numerology" feature="numerology-page" />

      <main className="launch-page launch-page-numerology">
      <PageHero
        eyebrow="Numerology Utility"
        title="Numerology Calculator"
        description="Use numerology as an optional reference layer for date of birth, name, business, mobile, and vehicle number review. Verified outputs appear only when the input is valid and the calculator is ready."
        highlights={[
          "DOB and name inputs stay validated before any result appears.",
          "Business, mobile, and vehicle number paths are supported as readiness layers.",
          "No guaranteed life, money, marriage, or health outcome claims are used.",
        ]}
        note="Use numerology as a reflective support tool. For important decisions, combine it with chart context and human review."
        primaryAction={{
          href: "#numerology-tool",
          label: "Start Calculation",
          eventName: "cta_click",
          eventPayload: {
            page: "/numerology",
            feature: "numerology-hero-primary",
          },
        }}
        secondaryAction={{
          href: "/ai",
          label: "Ask NI",
          eventName: "cta_click",
          eventPayload: {
            page: "/numerology",
            feature: "numerology-hero-secondary",
          },
        }}
        supportTitle="Foundation Inputs"
      />

      <Section
        tone="transparent"
        category="utilities"
        eyebrow="Input Readiness"
        title="Prepare the inputs first, then open the calculator for verified numerology output."
        description="The public page stays calm and factual until a valid input set is supplied."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {readinessItems.map((item) => (
            <FoundationCard key={item.title} item={item} />
          ))}
        </div>
      </Section>

      <Section
        tone="light"
        category="utilities"
        eyebrow="Numerology Categories"
        title="Each category stays in preparation mode until the calculator has verified input."
        description="Nothing is fabricated on load. If the calculation is ready, the live calculator below can show the verified result."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {numerologyCategoryCards.map((item) => (
            <CategoryCard key={item.title} item={item} />
          ))}
        </div>
      </Section>

      <Section
        tone="light"
        category="utilities"
        eyebrow="Live Calculator"
        title="Enter your numerology details once and generate verified output when ready."
        description="The panel below uses the existing numerology engine and stays empty until you submit valid inputs."
      >
        <div id="numerology-tool">
          <NumerologyToolPanel />
        </div>
      </Section>

      <Section tone="muted" category="utilities">
        <Card
          tone="accent"
          className="grid gap-5 border-[rgba(184,137,67,0.3)] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
        >
          <div className="space-y-2">
            <Badge tone="accent">Continue Journey</Badge>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[var(--color-ink-strong)]"
              style={{
                letterSpacing: "var(--tracking-display)",
                lineHeight: "var(--line-height-tight)",
              }}
            >
              Move from numerology into chart-aware guidance.
            </h2>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              Start with verified number references, then continue into Ask NI,
              reports, consultation, or Kundli context as needed.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {journeyActions.map((action) => (
              <TrackedLink
                key={action.label}
                href={action.href}
                eventName="cta_click"
                eventPayload={{
                  page: "/numerology",
                  feature: action.feature,
                }}
                className={buttonStyles({
                  size: "lg",
                  tone: action.tone,
                  className: "w-full justify-center",
                })}
              >
                {action.label}
              </TrackedLink>
            ))}
          </div>
        </Card>
      </Section>
      </main>
    </>
  );
}
