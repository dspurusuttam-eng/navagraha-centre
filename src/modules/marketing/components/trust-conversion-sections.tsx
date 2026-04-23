import Link from "next/link";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

type TrustTone = "default" | "muted" | "transparent" | "light" | "contrast";

export type TestimonialItem = {
  name: string;
  quote: string;
  tag?: string;
};

export type ThreeStepItem = {
  title: string;
  description: string;
};

type CredibilityMarkersProps = {
  pagePath: string;
  publishedOn: string;
  updatedOn: string;
  author?: string;
  reviewedBy?: string;
  tone?: TrustTone;
  className?: string;
};

function getInitials(name: string) {
  const parts = name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) {
    return "NC";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function TrustIndicatorStrip({
  items,
}: Readonly<{
  items: readonly string[];
}>) {
  return (
    <section className="border-y border-[color:var(--color-border)] bg-[rgba(255,251,244,0.86)]">
      <Container className="py-4">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {items.map((item) => (
            <div
              key={item}
              className="rounded-[var(--radius-pill)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.9)] px-3 py-2 text-center text-[0.66rem] uppercase tracking-[0.14em] text-[var(--color-trust-text)] sm:text-[0.68rem]"
            >
              {item}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function TestimonialsSection({
  pagePath,
  testimonials,
  eyebrow = "Testimonials",
  title = "User reflections from chart-first guidance journeys.",
  description = "Short, believable user feedback helps new visitors understand the quality and tone of the experience.",
  tone = "light",
}: Readonly<{
  pagePath: string;
  testimonials: readonly TestimonialItem[];
  eyebrow?: string;
  title?: string;
  description?: string;
  tone?: TrustTone;
}>) {
  return (
    <Section tone={tone} eyebrow={eyebrow} title={title} description={description}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {testimonials.map((item) => (
          <Card key={`${item.name}-${item.quote.slice(0, 28)}`} tone="light" className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.9)] text-[0.72rem] font-medium uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                  {getInitials(item.name)}
                </div>
                <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-strong)]">
                  {item.name}
                </p>
              </div>
              {item.tag ? <Badge tone="trust">{item.tag}</Badge> : null}
            </div>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              &quot;{item.quote}&quot;
            </p>
          </Card>
        ))}
      </div>
      <div className="mt-6">
        <TrackedLink
          href="/consultation"
          eventName="cta_click"
          eventPayload={{ page: pagePath, feature: "testimonials-book-consultation" }}
          className={buttonStyles({ size: "sm", tone: "secondary" })}
        >
          Book Free Consultation
        </TrackedLink>
      </div>
    </Section>
  );
}

export function AstrologerAuthoritySection({
  pagePath,
  tone = "light",
  ctaHref = "/consultation",
  ctaLabel = "Book Free Consultation",
}: Readonly<{
  pagePath: string;
  tone?: TrustTone;
  ctaHref?: string;
  ctaLabel?: string;
}>) {
  return (
    <Section
      tone={tone}
      eyebrow="Astrologer Authority"
      title="Joy Prakash Sarmah leads a chart-first and human-guided practice."
      description="Technology organizes chart context. Human review and consultation protect interpretive quality."
    >
      <Card tone="accent" className="space-y-5">
        <div className="grid gap-3 md:grid-cols-2">
          {[
            "Vedic chart-first approach with sidereal Lahiri foundation.",
            "Calm, human-guided interpretation for nuanced life questions.",
            "Relationship and remedy guidance framed as supportive pathways.",
            "Human review remains central over fully automated outputs.",
          ].map((line) => (
            <p
              key={line}
              className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]"
            >
              {line}
            </p>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <TrackedLink
            href={ctaHref}
            eventName="cta_click"
            eventPayload={{ page: pagePath, feature: "authority-primary-cta" }}
            className={buttonStyles({ size: "sm", tone: "secondary" })}
          >
            {ctaLabel}
          </TrackedLink>
          <Link href="/joy-prakash-sarmah" className={buttonStyles({ size: "sm", tone: "ghost" })}>
            View Astrologer Profile
          </Link>
        </div>
      </Card>
    </Section>
  );
}

export function ThreeStepProcessSection({
  eyebrow = "How It Works",
  title = "A clear three-step process.",
  description = "Follow one simple process from chart setup to guided action.",
  steps,
  tone = "muted",
}: Readonly<{
  eyebrow?: string;
  title?: string;
  description?: string;
  steps: readonly ThreeStepItem[];
  tone?: TrustTone;
}>) {
  const normalizedSteps = steps.slice(0, 3);

  return (
    <Section tone={tone} eyebrow={eyebrow} title={title} description={description}>
      <div className="grid gap-4 md:grid-cols-3">
        {normalizedSteps.map((step, index) => (
          <Card key={step.title} className="space-y-3">
            <Badge tone="trust">{`Step ${index + 1}`}</Badge>
            <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
              {step.title}
            </h3>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              {step.description}
            </p>
          </Card>
        ))}
      </div>
    </Section>
  );
}

export function SampleProofPreviewSection({
  tone = "light",
}: Readonly<{
  tone?: TrustTone;
}>) {
  const previews = [
    {
      label: "Report Output",
      content: "Career depth panel with priorities, timing windows, and caution notes.",
    },
    {
      label: "AI Response",
      content: "Structured answer + reasoning + confidence from your chart context.",
    },
    {
      label: "Compatibility Preview",
      content: "Relationship strengths, friction themes, and communication guidance.",
    },
    {
      label: "Remedy Suggestion",
      content: "Optional supportive remedy pathway with calm boundaries and no guarantees.",
    },
    {
      label: "Kundli Insight",
      content: "Lagna, house emphasis, and planetary focus in one clear summary.",
    },
  ] as const;

  return (
    <Section
      tone={tone}
      eyebrow="Sample Proof Preview"
      title="Preview the structured outputs before deeper personalization."
      description="These preview cards represent how report, AI, compatibility, and remedy outputs are presented."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {previews.map((item) => (
          <Card key={item.label} tone="light" className="space-y-3">
            <Badge tone="trust">{item.label}</Badge>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              {item.content}
            </p>
          </Card>
        ))}
      </div>
    </Section>
  );
}

export function ExpectationSettingSection({
  tone = "transparent",
}: Readonly<{
  tone?: TrustTone;
}>) {
  return (
    <Section
      tone={tone}
      eyebrow="Expectation Setting"
      title="Guidance is clear, supportive, and non-deterministic."
      description="These boundaries are explicit so trust stays grounded."
    >
      <Card tone="accent" className="space-y-3">
        {[
          "Astrology provides guidance and context, not guaranteed outcomes.",
          "Remedies are supportive practices, not absolute promises.",
          "AI interpretations follow chart context and structured workflow boundaries.",
          "Personalization depth improves after Kundli generation and saved-chart continuity.",
        ].map((line) => (
          <p
            key={line}
            className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]"
          >
            {line}
          </p>
        ))}
      </Card>
    </Section>
  );
}

export function ConsultationReassuranceSection({
  tone = "light",
}: Readonly<{
  tone?: TrustTone;
}>) {
  return (
    <Section
      tone={tone}
      eyebrow="Consultation Reassurance"
      title="What happens in a session, and how it differs from AI."
      description="Consultation is designed for nuance, follow-up, and context you cannot compress into short prompts."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="space-y-3">
          <Badge tone="trust">Session Flow</Badge>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
            We begin with chart context review, then focus on your top priorities and conclude with practical next steps.
          </p>
        </Card>
        <Card className="space-y-3">
          <Badge tone="trust">What You Can Ask</Badge>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
            Career, relationship, timing, decision pressure, and remedy questions can all be discussed in one guided flow.
          </p>
        </Card>
        <Card className="space-y-3">
          <Badge tone="trust">Preparation</Badge>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
            Guidance is prepared from your verified chart, prior context, and session intent before recommendations are framed.
          </p>
        </Card>
        <Card className="space-y-3">
          <Badge tone="trust">AI vs Consultation</Badge>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
            AI is fast for structured queries. Consultation is better for layered, sensitive, or high-stakes interpretation.
          </p>
        </Card>
      </div>
    </Section>
  );
}

export function TrustFaqSection({
  tone = "light",
}: Readonly<{
  tone?: TrustTone;
}>) {
  const faq = [
    {
      question: "How accurate is the chart system?",
      answer:
        "The calculation layer uses validated birth context, Swiss Ephemeris integration, and Lahiri sidereal settings before interpretation begins.",
    },
    {
      question: "Is NAVAGRAHA AI generic chatbot output?",
      answer:
        "No. The AI response layer is chart-aware and follows structured chart context rather than free-form generic replies.",
    },
    {
      question: "Are remedies guaranteed to solve outcomes?",
      answer:
        "No. Remedies are presented as supportive practices and optional guidance with clear non-guarantee boundaries.",
    },
    {
      question: "How long does limited-time free access remain?",
      answer:
        "Core services are currently free under limited launch access. Future pricing will be clearly communicated in plan surfaces.",
    },
    {
      question: "When does personalization become deeper?",
      answer:
        "Depth improves after Kundli generation and saved-chart continuity, because insights can then use your verified personal context.",
    },
  ] as const;

  return (
    <Section
      tone={tone}
      eyebrow="FAQ"
      title="Trust and accuracy questions answered clearly."
      description="These answers set expectations before users enter deeper report, AI, or consultation journeys."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {faq.map((item) => (
          <Card key={item.question} className="space-y-3">
            <h3 className="text-[length:var(--font-size-body-md)] text-[var(--color-ink-strong)]">
              {item.question}
            </h3>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              {item.answer}
            </p>
          </Card>
        ))}
      </div>
    </Section>
  );
}

export function CredibilityMarkersSection({
  pagePath,
  publishedOn,
  updatedOn,
  author = "Joy Prakash Sarmah",
  reviewedBy = "NAVAGRAHA CENTRE Editorial Review",
  tone = "transparent",
  className,
}: Readonly<CredibilityMarkersProps>) {
  return (
    <Section
      tone={tone}
      className={className}
      eyebrow="Credibility Markers"
      title="Transparent editorial and review record."
      description="Authority pages include author, reviewer, and update context for trust and publication clarity."
    >
      <Card tone="accent" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-1">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
            Author
          </p>
          <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-strong)]">
            {author}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
            Reviewed By
          </p>
          <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-strong)]">
            {reviewedBy}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
            Published
          </p>
          <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-strong)]">
            {publishedOn}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
            Updated
          </p>
          <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-strong)]">
            {updatedOn}
          </p>
        </div>
      </Card>
      <div className="mt-4">
        <TrackedLink
          href="/consultation"
          eventName="cta_click"
          eventPayload={{ page: pagePath, feature: "credibility-book-consultation" }}
          className={buttonStyles({ size: "sm", tone: "ghost" })}
        >
          Continue with Human Guidance
        </TrackedLink>
      </div>
    </Section>
  );
}

