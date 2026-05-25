import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { createToolMetadata } from "@/lib/seo/metadata";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";

const heroActions = [
  {
    href: "#remedy-category-guide",
    label: "Explore Remedies",
    tone: "accent" as const,
    feature: "remedies-explore",
  },
  {
    href: "/kundli",
    label: "Open Kundli",
    tone: "secondary" as const,
    feature: "remedies-open-kundli",
  },
  {
    href: "/ai",
    label: "Ask NI",
    tone: "ni" as const,
    feature: "remedies-ask-ni",
  },
  {
    href: "/dosha-yoga",
    label: "View Dosha-Yoga",
    tone: "secondary" as const,
    feature: "remedies-dosha-yoga",
  },
  {
    href: "/consultation",
    label: "Consult Expert",
    tone: "secondary" as const,
    feature: "remedies-consult-expert",
  },
] as const;

const remedyRail = [
  "Category Guide",
  "Planet Rail",
  "Dosha Path",
  "Timing Support",
  "Ask NI",
] as const;

const remedyGroups = [
  {
    title: "Spiritual Remedies",
    accent: "saffron" as const,
    items: ["Mantra", "Japa", "Stotra", "Puja", "Vrat"],
    description:
      "Sacred practices are best understood as disciplined spiritual support, not instant outcome promises.",
  },
  {
    title: "Karma / Daan Remedies",
    accent: "marigold" as const,
    items: ["Daan", "Seva", "feeding animals", "respecting elders", "discipline-based direction"],
    description:
      "Service, charity, and conduct-based actions are framed as voluntary spiritual discipline.",
  },
  {
    title: "Sacred Objects",
    accent: "brown" as const,
    items: ["Gemstone", "Rudraksha", "Yantra", "Mala", "Kavach"],
    description:
      "Sacred items should be considered only with suitable Kundli context and responsible guidance.",
  },
  {
    title: "Timing-Based Remedies",
    accent: "gold" as const,
    items: ["Panchang timing", "Muhurat support", "Dasha timing", "Transit timing"],
    description:
      "Timing can support practice selection, but it should be reviewed carefully and without certainty claims.",
  },
  {
    title: "Lifestyle / Conduct Remedies",
    accent: "tulsi" as const,
    items: ["daily discipline", "satvik habits", "gratitude", "respect-based actions", "spiritual routine"],
    description:
      "Simple daily conduct keeps remedies grounded, repeatable, and practical for returning viewers.",
  },
] as const;

const planets = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
  "Rahu",
  "Ketu",
] as const;

const doshaPaths = [
  "Mangal Dosha",
  "Kaal Sarp Yoga",
  "Pitra Dosha",
  "Shani / Sade Sati",
  "Rahu-Ketu influence",
  "Kundli imbalance review",
] as const;

const timingCards = [
  {
    title: "Dasha",
    href: "/dasha",
    label: "Life-phase context",
    description:
      "Review the active planetary period before choosing a remedy category.",
  },
  {
    title: "Transit",
    href: "/transit",
    label: "Current movement",
    description:
      "Use present graha movement as timing context, not as a stand-alone instruction.",
  },
  {
    title: "Panchang",
    href: "/panchang",
    label: "Daily calendar",
    description:
      "Check Tithi, Nakshatra, and daily timing when planning disciplined practice.",
  },
  {
    title: "Muhurat support",
    href: "/panchang",
    label: "Suitable window",
    description:
      "Use auspicious timing as a support layer after responsible review.",
  },
] as const;

const journeySteps = [
  "Understand the concern",
  "Open Kundli context",
  "Review Dosha / Yoga factors",
  "Check Dasha and Transit timing",
  "Choose remedy category",
  "Confirm with expert guidance",
  "Follow remedy responsibly",
] as const;

const supportCards = [
  {
    title: "Reports",
    href: "/reports",
    icon: "RP",
    ctaLabel: "View Reports",
    description:
      "Use structured report options when remedy context needs a deeper written review.",
  },
  {
    title: "Consultation",
    href: "/consultation",
    icon: "JP",
    ctaLabel: "Consult Expert",
    description:
      "Use human-reviewed guidance with J P Sarmah for sensitive remedy decisions.",
  },
  {
    title: "Shop",
    href: "/shop",
    icon: "SH",
    ctaLabel: "Explore Shop",
    description:
      "Gemstones, Rudraksha, yantra, mala, and sacred items may be explored when suitable guidance is available.",
  },
  {
    title: "Kundli",
    href: "/kundli",
    icon: "KU",
    ctaLabel: "Open Kundli",
    description:
      "Start with verified chart context before moving into remedy direction.",
  },
  {
    title: "Tools",
    href: "/tools",
    icon: "TH",
    ctaLabel: "Open Tools",
    description:
      "Return to the public tools hub for related Vedic timing and chart utilities.",
  },
] as const;

const navLinks = [
  { label: "Kundli", href: "/kundli" },
  { label: "Dosha-Yoga", href: "/dosha-yoga" },
  { label: "Dasha", href: "/dasha" },
  { label: "Transit", href: "/transit" },
  { label: "Panchang", href: "/panchang" },
  { label: "Matchmaking", href: "/matchmaking" },
  { label: "Ask NI", href: "/ai" },
  { label: "Tools", href: "/tools" },
] as const;

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();

  return createToolMetadata({
    title: "Remedies Guidance",
    description:
      "A calm Vedic pathway for understanding mantra, daan, vrat, puja, gemstone, Rudraksha, yantra, and lifestyle-based remedy guidance responsibly.",
    path: "/remedies",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: [
      "vedic remedies",
      "upaya guidance",
      "mantra guidance",
      "daan remedies",
      "rudraksha guidance",
      "yantra guidance",
      "remedy timing",
    ],
  });
}

export const revalidate = 3600;

function RemedyGroupCard({
  group,
}: Readonly<{
  group: (typeof remedyGroups)[number];
}>) {
  const accentClass = {
    saffron: "border-[rgba(211,137,36,0.22)] shadow-[0_14px_34px_rgba(211,137,36,0.06)]",
    marigold: "border-[rgba(184,137,67,0.24)] shadow-[0_14px_34px_rgba(184,137,67,0.06)]",
    brown: "border-[rgba(111,78,48,0.22)] shadow-[0_14px_34px_rgba(111,78,48,0.06)]",
    gold: "border-[rgba(184,137,67,0.22)] shadow-[0_14px_34px_rgba(184,137,67,0.06)]",
    tulsi: "border-[rgba(88,132,94,0.22)] shadow-[0_14px_34px_rgba(88,132,94,0.06)]",
  }[group.accent];

  const labelClass = {
    saffron: "text-[#9b5b18]",
    marigold: "text-[color:var(--color-accent-strong)]",
    brown: "text-[#6f4e30]",
    gold: "text-[color:var(--color-accent-strong)]",
    tulsi: "text-[#3f6f47]",
  }[group.accent];

  return (
    <Card
      tone="default"
      className={`flex h-full min-h-[14rem] flex-col justify-between gap-4 bg-white p-4 before:opacity-0 ${accentClass}`}
    >
      <div className="space-y-3">
        <p className={`text-[0.68rem] uppercase tracking-[0.12em] ${labelClass}`}>
          Remedy Category
        </p>
        <h3 className="text-[length:var(--font-size-body-lg)] font-semibold leading-tight text-[color:var(--color-ink-strong)]">
          {group.title}
        </h3>
        <p className="text-[0.82rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
          {group.description}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {group.items.map((item) => (
          <span
            key={item}
            className="rounded-full border border-[rgba(184,137,67,0.18)] bg-[rgba(255,250,240,0.72)] px-3 py-1 text-[0.7rem] font-medium text-[color:var(--color-ink-body)]"
          >
            {item}
          </span>
        ))}
      </div>
    </Card>
  );
}

function TimingCard({ card }: Readonly<{ card: (typeof timingCards)[number] }>) {
  return (
    <TrackedLink
      href={card.href}
      eventName="cta_click"
      eventPayload={{ page: "/remedies", feature: `remedies-timing-${card.title}` }}
      className="group block h-full"
    >
      <Card
        tone="default"
        interactive
        className="flex h-full min-h-[10rem] flex-col gap-3 border-[rgba(184,137,67,0.2)] bg-white p-4 shadow-[0_12px_28px_rgba(17,24,39,0.05)] before:opacity-0"
      >
        <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
          {card.label}
        </p>
        <h3 className="text-[length:var(--font-size-body-lg)] font-semibold text-[color:var(--color-ink-strong)]">
          {card.title}
        </h3>
        <p className="text-[0.82rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
          {card.description}
        </p>
      </Card>
    </TrackedLink>
  );
}

function SupportCard({ card }: Readonly<{ card: (typeof supportCards)[number] }>) {
  return (
    <TrackedLink
      href={card.href}
      eventName="cta_click"
      eventPayload={{ page: "/remedies", feature: `remedies-support-${card.title}` }}
      className="group block h-full"
    >
      <Card
        tone="default"
        interactive
        className="flex h-full min-h-[11rem] flex-col gap-3 border-black/8 bg-white p-4 shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0 hover:border-[rgba(184,137,67,0.28)]"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(184,137,67,0.28)] bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.98)_0%,rgba(249,236,201,0.94)_72%,rgba(239,206,137,0.86)_100%)] text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-accent-strong)] shadow-[0_10px_22px_rgba(121,85,33,0.12)]">
            {card.icon}
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="text-[0.98rem] font-semibold leading-tight text-[color:var(--color-ink-strong)]">
              {card.title}
            </h3>
            <p className="text-[0.68rem] uppercase tracking-[0.08em] text-[color:var(--color-accent-strong)]">
              Safe path
            </p>
          </div>
        </div>
        <p className="text-[0.8rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
          {card.description}
        </p>
        <span className="mt-auto text-[0.74rem] font-semibold text-[color:var(--color-accent-strong)]">
          {card.ctaLabel}
        </span>
      </Card>
    </TrackedLink>
  );
}

export default function RemediesPage() {
  return (
    <>
      <PageViewTracker page="/remedies" feature="remedies-page" />
      <AnalyticsEventTracker
        event="page_view"
        payload={{ page: "/remedies", feature: "remedies-page" }}
      />

      <main className="launch-page launch-page-remedies min-h-screen overflow-hidden bg-[#FFFFFF] pb-[calc(7rem+env(safe-area-inset-bottom))] text-[color:var(--color-ink-strong)] md:pb-0">
        <section className="relative isolate overflow-hidden border-b border-[rgba(184,137,67,0.12)] bg-[#FFFFFF]">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute right-[-5rem] top-[-4rem] h-64 w-64 rounded-full border border-[rgba(184,137,67,0.16)]" />
            <div className="absolute right-8 top-24 h-36 w-36 rounded-full border border-[rgba(211,137,36,0.16)]" />
            <div className="absolute left-[-5rem] bottom-[-5rem] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(248,218,146,0.26)_0%,rgba(255,255,255,0)_70%)]" />
          </div>

          <div className="mx-auto grid w-full max-w-7xl gap-7 px-4 py-8 sm:px-6 md:py-11 lg:grid-cols-[minmax(0,1.02fr)_minmax(320px,0.78fr)] lg:px-8">
            <div className="space-y-5">
              <Badge
                tone="accent"
                className="border border-[rgba(184,137,67,0.22)] bg-[rgba(255,250,240,0.82)] text-[color:var(--color-accent-strong)]"
              >
                Vedic Remedies · Upaya Guidance
              </Badge>
              <div className="space-y-3">
                <h1 className="max-w-3xl font-[family-name:var(--font-display)] text-[clamp(2.15rem,10vw,4.7rem)] leading-[0.92] tracking-[-0.06em] text-[color:var(--color-ink-strong)]">
                  Remedies Guidance
                </h1>
                <p className="max-w-2xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  A calm Vedic pathway to understand mantra, daan, vrat, puja, gemstone, rudraksha, yantra, and lifestyle-based remedies with responsible guidance.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {heroActions.map((action) => (
                  <TrackedLink
                    key={action.label}
                    href={action.href}
                    eventName="cta_click"
                    eventPayload={{ page: "/remedies", feature: action.feature }}
                    className={buttonStyles({
                      size: "lg",
                      tone: action.tone,
                      className: "min-w-[9.5rem] justify-center",
                    })}
                  >
                    {action.label}
                  </TrackedLink>
                ))}
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {remedyRail.map((item) => (
                  <span
                    key={item}
                    className="shrink-0 rounded-full border border-[rgba(184,137,67,0.18)] bg-white px-3 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-ink-body)] shadow-[0_8px_22px_rgba(17,24,39,0.04)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <Card
              tone="default"
              className="relative min-h-[22rem] overflow-hidden border-[rgba(184,137,67,0.18)] bg-white p-5 shadow-[0_22px_60px_rgba(111,78,48,0.1)] before:opacity-0"
            >
              <div className="absolute inset-6 rounded-full border border-[rgba(184,137,67,0.22)]" />
              <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[rgba(211,137,36,0.3)]" />
              <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(88,132,94,0.22)] bg-[rgba(243,250,239,0.74)]" />
              <div className="absolute left-1/2 top-[35%] h-14 w-[2px] -translate-x-1/2 rounded-full bg-[linear-gradient(180deg,rgba(184,137,67,0),rgba(184,137,67,0.8),rgba(184,137,67,0))]" />
              <div className="absolute left-1/2 top-[45%] h-9 w-9 -translate-x-1/2 rounded-full border border-[rgba(184,137,67,0.38)] bg-[radial-gradient(circle_at_50%_42%,#f8d98a_0%,#b88943_42%,rgba(255,255,255,0)_72%)] shadow-[0_0_34px_rgba(184,137,67,0.26)]" />
              <div className="absolute bottom-9 left-1/2 h-20 w-44 -translate-x-1/2 rounded-[50%] border border-[rgba(184,137,67,0.22)]" />
              <div className="absolute bottom-[4.8rem] left-1/2 h-[1px] w-52 -translate-x-1/2 bg-[linear-gradient(90deg,rgba(184,137,67,0),rgba(184,137,67,0.5),rgba(184,137,67,0))]" />

              <div className="relative z-10 flex h-full flex-col justify-between">
                <Badge tone="trust" className="w-fit border border-[rgba(111,78,48,0.18)] bg-[rgba(111,78,48,0.06)] text-[#6f4e30]">
                  Sacred guidance, not pressure
                </Badge>
                <div className="space-y-3 pt-20 text-center">
                  <p className="text-[0.68rem] uppercase tracking-[0.18em] text-[color:var(--color-accent-strong)]">
                    mantra · daan · timing · conduct
                  </p>
                  <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] leading-tight text-[color:var(--color-ink-strong)]">
                    Choose the path with context first.
                  </h2>
                </div>
                <p className="mx-auto max-w-[20rem] text-center text-[0.78rem] leading-[1.55] text-[color:var(--color-ink-body)]">
                  Remedies are presented as educational support connected to Kundli, timing, and expert judgement.
                </p>
              </div>
            </Card>
          </div>
        </section>

        <Section
          id="remedy-category-guide"
          tone="transparent"
          category="utilities"
          eyebrow="Remedy Category Guide"
          title="Start with the remedy type, not a rushed conclusion."
          description="These cards explain traditional remedy directions only. They do not prescribe a personal remedy or promise a fixed outcome."
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {remedyGroups.map((group) => (
              <RemedyGroupCard key={group.title} group={group} />
            ))}
          </div>
        </Section>

        <Section
          tone="light"
          category="utilities"
          eyebrow="Planet Remedy Rail"
          title="Review graha-linked remedy themes safely."
          description="Traditionally associated remedy directions may be reviewed depending on Kundli context."
        >
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {planets.map((planet) => (
              <Card
                key={planet}
                tone="default"
                className="min-w-[9.5rem] border-[rgba(184,137,67,0.16)] bg-white p-4 shadow-[0_12px_28px_rgba(17,24,39,0.04)] before:opacity-0"
              >
                <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                  Graha
                </p>
                <h3 className="mt-2 text-[1rem] font-semibold text-[color:var(--color-ink-strong)]">
                  {planet}
                </h3>
                <p className="mt-2 text-[0.76rem] leading-[1.45] text-[color:var(--color-ink-body)]">
                  Review with Kundli context.
                </p>
              </Card>
            ))}
          </div>
        </Section>

        <Section
          tone="transparent"
          category="utilities"
          eyebrow="Dosha Remedy Path"
          title="Connect remedy direction with careful Dosha-Yoga review."
          description="Dosha-related remedy decisions need calm diagnosis, timing support, and human judgement. This section does not provide a personal prescription."
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.82fr)_minmax(300px,1.18fr)]">
            <Card
              tone="default"
              className="space-y-4 border-[rgba(111,78,48,0.18)] bg-white p-5 shadow-[0_14px_34px_rgba(111,78,48,0.06)] before:opacity-0"
            >
              <Badge tone="trust" className="border border-[rgba(111,78,48,0.18)] bg-[rgba(111,78,48,0.06)] text-[#6f4e30]">
                Review before action
              </Badge>
              <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-ink-strong)]">
                Dosha context should guide remedy direction.
              </h2>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                Mangal, Kaal Sarp, Pitra, Shani, and Rahu-Ketu themes are handled as diagnostic context. No public verdict or remedy instruction is invented here.
              </p>
              <TrackedLink
                href="/dosha-yoga"
                eventName="cta_click"
                eventPayload={{ page: "/remedies", feature: "remedies-dosha-yoga-panel" }}
                className={buttonStyles({
                  size: "lg",
                  tone: "secondary",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                View Dosha-Yoga
              </TrackedLink>
            </Card>

            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {doshaPaths.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.15rem] border border-[rgba(111,78,48,0.16)] bg-white px-3 py-3 shadow-[0_10px_24px_rgba(17,24,39,0.04)]"
                >
                  <p className="text-[0.72rem] font-semibold leading-tight text-[color:var(--color-ink-strong)]">
                    {item}
                  </p>
                  <p className="mt-2 text-[0.68rem] leading-[1.4] text-[color:var(--color-ink-body)]">
                    Review calmly.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section
          tone="light"
          category="utilities"
          eyebrow="Timing Support"
          title="Time remedy practice with chart and calendar context."
          description="Dasha, Transit, Panchang, and Muhurat support should be reviewed carefully and responsibly."
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {timingCards.map((card) => (
              <TimingCard key={card.title} card={card} />
            ))}
          </div>
        </Section>

        <Section
          tone="transparent"
          category="utilities"
          eyebrow="Remedy Journey Timeline"
          title="A responsible remedy path moves step by step."
          description="This journey keeps the page useful for repeat visits without turning remedies into pressure or sales."
        >
          <Card
            tone="default"
            className="border-[rgba(184,137,67,0.18)] bg-white p-4 shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0"
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
              {journeySteps.map((step, index) => (
                <div
                  key={step}
                  className="rounded-[1rem] border border-[rgba(184,137,67,0.16)] bg-[rgba(255,250,240,0.52)] px-3 py-3"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(184,137,67,0.3)] bg-white text-[0.72rem] font-semibold text-[color:var(--color-accent-strong)]">
                    {index + 1}
                  </span>
                  <p className="mt-3 text-[0.78rem] font-medium leading-[1.45] text-[color:var(--color-ink-strong)]">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        <Section
          tone="transparent"
          category="ai"
          eyebrow="Ask NI Support"
          title="Use Ask NI to understand remedy categories before expert review."
          description="Ask NI can explain remedy categories, mantra meanings, daan concepts, timing context, and what to discuss before expert guidance."
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(280px,1.1fr)]">
            <Card
              tone="accent"
              className="space-y-4 border-[rgba(19,211,224,0.22)] bg-white shadow-[0_14px_34px_rgba(19,211,224,0.08)] before:opacity-0"
            >
              <Badge tone="accent">Ask NI</Badge>
              <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-ink-strong)]">
                NAVAGRAHA Intelligence can help prepare better questions.
              </h2>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                Ask NI helps users understand remedy categories, timing layers, and preparation points. Final personalized direction should remain human-reviewed.
              </p>
              <TrackedLink
                href="/ai"
                eventName="cta_click"
                eventPayload={{ page: "/remedies", feature: "remedies-ask-ni-panel" }}
                className={buttonStyles({
                  size: "lg",
                  tone: "ni",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Ask NI
              </TrackedLink>
            </Card>

            <Card
              tone="default"
              className="space-y-4 border-[rgba(111,78,48,0.2)] bg-white shadow-[0_14px_34px_rgba(111,78,48,0.06)] before:opacity-0"
            >
              <Badge
                tone="trust"
                className="border border-[rgba(111,78,48,0.22)] bg-[rgba(111,78,48,0.06)] text-[#6f4e30]"
              >
                J P Sarmah Authority
              </Badge>
              <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-ink-strong)]">
                Remedies should not be selected from one factor alone.
              </h2>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                A responsible Vedic remedy path should consider Kundli, Dosha, Dasha, Transit, practical life context, and expert judgement under the guidance of J P Sarmah.
              </p>
            </Card>
          </div>
        </Section>

        <Section
          tone="transparent"
          category="utilities"
          eyebrow="Reports / Consultation / Shop Bridge"
          title="Move into deeper support without sales pressure."
          description="Reports, consultation, sacred item guidance, Kundli, and tools remain soft public paths. This page does not create item instructions or transaction flows."
        >
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5">
            {supportCards.map((card) => (
              <SupportCard key={card.title} card={card} />
            ))}
          </div>
        </Section>

        <Section
          tone="light"
          category="content"
          eyebrow="Navigation / Path Safety"
          title="Continue through safe public guidance paths."
          description="Use these public routes for related context without exposing protected dashboards or transaction-style flows."
        >
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {navLinks.map((link) => (
              <TrackedLink
                key={link.label}
                href={link.href}
                eventName="cta_click"
                eventPayload={{ page: "/remedies", feature: `remedies-path-${link.label}` }}
                className="shrink-0 rounded-full border border-[rgba(184,137,67,0.18)] bg-white px-4 py-2 text-[0.78rem] font-semibold text-[color:var(--color-ink-strong)] shadow-[0_8px_22px_rgba(17,24,39,0.04)] transition hover:border-[rgba(184,137,67,0.34)] hover:text-[color:var(--color-accent-strong)]"
              >
                {link.label}
              </TrackedLink>
            ))}
          </div>
        </Section>

        <Section
          tone="transparent"
          category="content"
          eyebrow="Trust / Safety Note"
          title="Remedy guidance stays responsible and non-pressured."
          description="No personal chart output, saved birth context, or transaction-style flow is exposed here. Use verified Kundli context and human-reviewed guidance for sensitive decisions."
        >
          <Card
            tone="default"
            className="border-[rgba(184,137,67,0.18)] bg-white p-5 shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0"
          >
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Badge tone="outline" className="border border-black/8 bg-white">
                  Guidance-first
                </Badge>
                <p className="text-[0.88rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  The page explains remedy categories and does not declare a personal remedy.
                </p>
              </div>
              <div className="space-y-2">
                <Badge tone="outline" className="border border-black/8 bg-white">
                  Context-aware
                </Badge>
                <p className="text-[0.88rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  Kundli, Dosha, Dasha, Transit, and Panchang context should be reviewed together.
                </p>
              </div>
              <div className="space-y-2">
                <Badge tone="outline" className="border border-black/8 bg-white">
                  Calm support
                </Badge>
                <p className="text-[0.88rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  Remedies are presented as spiritual support, not as instant solution promises.
                </p>
              </div>
            </div>
          </Card>
        </Section>
      </main>
    </>
  );
}
