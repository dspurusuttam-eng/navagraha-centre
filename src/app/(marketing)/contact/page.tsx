import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Section } from "@/components/ui/section";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EditorialPlaceholder } from "@/components/site/editorial-placeholder";
import { PageHero } from "@/components/site/page-hero";
import { buildPageMetadata } from "@/lib/metadata";
import { contactPage } from "@/modules/marketing/content";

export const metadata = buildPageMetadata({
  ...contactPage.metadata,
});

export default function ContactPage() {
  return (
    <>
      <PageHero {...contactPage.hero} />

      <Section
        description="The contact page should feel welcoming and premium even before any live inquiry routing or scheduling systems are connected."
        eyebrow="Inquiry Types"
        title="The kinds of conversations this route is designed for"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {contactPage.inquiryCards.map((item) => (
            <Card
              key={item.title}
              interactive
              className="flex h-full flex-col gap-4"
            >
              <Badge tone="neutral">Inquiry</Badge>
              <h2 className="text-[length:var(--font-size-body-lg)] font-medium text-[color:var(--color-foreground)]">
                {item.title}
              </h2>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        tone="muted"
        description="The inquiry interface remains intentionally non-live for this phase, but the structure and tone are ready for future manual workflows."
        eyebrow="Placeholder Form"
        title="A polished contact surface without live submission logic"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
          <Card className="space-y-5">
            <div className="space-y-2">
              <Badge tone="accent">Inquiry Placeholder</Badge>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                This form is presented as a placeholder only. Submission
                routing, notifications, and CRM logic are intentionally not part
                of this phase.
              </p>
            </div>

            <div className="grid gap-4">
              <label className="block space-y-2">
                <span className="text-[0.76rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                  Full name
                </span>
                <Input placeholder="Your name" />
              </label>

              <label className="block space-y-2">
                <span className="text-[0.76rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                  Inquiry type
                </span>
                <Select defaultValue="consultation">
                  <option value="consultation">Consultation inquiry</option>
                  <option value="remedy">Remedy question</option>
                  <option value="shop">Shop or product question</option>
                </Select>
              </label>

              <label className="block space-y-2">
                <span className="text-[0.76rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                  Message
                </span>
                <Textarea placeholder="Share a short outline of what you would like guidance on." />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Button disabled type="button">
                Submission Flow Coming Soon
              </Button>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                For now, this page is the public-facing design foundation only.
              </p>
            </div>
          </Card>

          <div className="grid gap-6">
            <EditorialPlaceholder
              annotations={[
                "Manual workflow ready later",
                "Premium inquiry tone",
                "Designed for calm first contact",
              ]}
              description="This placeholder visual can later be replaced with branded consultation imagery or portraiture without changing the page structure."
              eyebrow="Contact Atmosphere"
              title="An inquiry page should feel reassuring before it becomes operational"
              tone="midnight"
            />

            <Card className="space-y-4">
              <Badge tone="outline">Response Expectations</Badge>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                The future workflow can support manual review, considered reply
                windows, and a consultation path that still feels personal
                rather than automated.
              </p>
            </Card>
          </div>
        </div>
      </Section>
    </>
  );
}
