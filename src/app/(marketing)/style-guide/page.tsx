import { PageHero } from "@/components/site/page-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Section } from "@/components/ui/section";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { buildPageMetadata } from "@/lib/metadata";
import {
  colorTokens,
  motionTokens,
  radiusTokens,
  shadowTokens,
  spacingTokens,
  typographyTokens,
  type TokenSpec,
} from "@/modules/design/style-guide";

export const metadata = buildPageMetadata({
  title: "Style Guide",
  description:
    "Premium UI foundation preview for NAVAGRAHA CENTRE with reusable tokens and interface primitives.",
  path: "/style-guide",
});

function TokenCard({ token }: Readonly<{ token: TokenSpec }>) {
  return (
    <Card interactive className="flex h-full flex-col gap-4 p-5">
      <div
        className="h-16 rounded-[var(--radius-lg)] border border-[color:var(--color-border)]"
        style={{ background: `var(${token.cssVar})` }}
      />
      <div className="space-y-2">
        <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
          {token.cssVar}
        </p>
        <h3 className="text-[length:var(--font-size-body-md)] font-medium text-[color:var(--color-foreground)]">
          {token.name}
        </h3>
        <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
          {token.note}
        </p>
        <p className="text-[0.78rem] text-[color:var(--color-muted-soft)]">
          {token.value}
        </p>
      </div>
    </Card>
  );
}

function RailCard({
  title,
  tokens,
}: Readonly<{
  title: string;
  tokens: TokenSpec[];
}>) {
  return (
    <Card className="space-y-5 p-6">
      <h3
        className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[color:var(--color-foreground)]"
        style={{
          letterSpacing: "var(--tracking-display)",
          lineHeight: "var(--line-height-tight)",
        }}
      >
        {title}
      </h3>
      <div className="space-y-4">
        {tokens.map((token) => (
          <div
            key={token.cssVar}
            className="flex flex-col gap-3 border-b border-[color:var(--color-border)] pb-4 last:border-b-0 last:pb-0"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[length:var(--font-size-body-sm)] font-medium text-[color:var(--color-foreground)]">
                  {token.name}
                </p>
                <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                  {token.cssVar}
                </p>
              </div>
              <span className="text-[0.8rem] text-[color:var(--color-muted-soft)]">
                {token.value}
              </span>
            </div>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {token.note}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function StyleGuidePage() {
  return (
    <>
      <PageHero
        description="This page previews the visual contract for future marketing, client, and admin surfaces: dark editorial planes, controlled gold accents, quiet motion, and reusable accessible primitives."
        eyebrow="Premium UI Foundation"
        highlights={[
          "Design tokens cover color, spacing, radius, shadow, typography, and motion",
          "Shared primitives stay modular and ready for future product phases",
          "The shell is responsive, accessible, and visually restrained by default",
        ]}
        note="Use this style guide as the baseline when new public, app, or admin surfaces are introduced."
        primaryAction={{ href: "/", label: "Back to Home" }}
        secondaryAction={{
          href: "/consultation",
          label: "Consultation Route",
          tone: "secondary",
        }}
        supportTitle="System Summary"
        title="A luxury design language, ready for the next phase."
      />

      <Section
        description="The brand system leans on a small number of deliberate tokens so future pages can stay premium without accumulating visual noise."
        eyebrow="Tokens"
        title="Color, typography, spacing, and motion"
      >
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {colorTokens.map((token) => (
            <TokenCard key={token.cssVar} token={token} />
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <RailCard title="Spacing Scale" tokens={spacingTokens} />
          <RailCard
            title="Radius and Shadow"
            tokens={[...radiusTokens, ...shadowTokens]}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <RailCard title="Typography Scale" tokens={typographyTokens} />
          <RailCard title="Motion Tokens" tokens={motionTokens} />
        </div>
      </Section>

      <Section
        tone="muted"
        description="Buttons, form controls, cards, badges, sections, and container rhythm now share one visual language across the project."
        eyebrow="Primitives"
        title="Core UI components"
      >
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
          <Card className="space-y-6">
            <div className="space-y-3">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Buttons and badges
              </p>
              <div className="flex flex-wrap gap-3">
                <Button>Book Consultation</Button>
                <Button tone="secondary">View Services</Button>
                <Button tone="ghost">Read More</Button>
              </div>
              <div className="flex flex-wrap gap-3">
                <Badge tone="accent">Premium</Badge>
                <Badge tone="neutral">Calm</Badge>
                <Badge tone="outline">Editorial</Badge>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card interactive tone="muted" className="space-y-3 p-5">
                <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                  Card
                </p>
                <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[color:var(--color-foreground)]">
                  Layered content module
                </h3>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                  Cards are used sparingly for emphasis, not as a default page
                  structure.
                </p>
              </Card>

              <Card tone="accent" className="space-y-3 p-5">
                <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                  Accent panel
                </p>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-foreground)]">
                  Gold is used as a focused signal for action, emphasis, and
                  premium framing.
                </p>
              </Card>
            </div>
          </Card>

          <Card className="space-y-5">
            <div className="space-y-2">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Form controls
              </p>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                Inputs are styled for calm, legible data collection and keyboard
                accessibility.
              </p>
            </div>

            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-[0.76rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                  Full name
                </span>
                <Input placeholder="Joy Prakash Sarmah" />
              </label>

              <label className="block space-y-2">
                <span className="text-[0.76rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                  Consultation type
                </span>
                <Select defaultValue="general">
                  <option value="general">General consultation</option>
                  <option value="compatibility">Compatibility reading</option>
                  <option value="remedy">Remedy guidance</option>
                </Select>
              </label>

              <label className="block space-y-2">
                <span className="text-[0.76rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                  Notes
                </span>
                <Textarea placeholder="Share the context for this future workflow surface." />
              </label>
            </div>
          </Card>
        </div>
      </Section>

      <Section
        description="The system is designed to support immersive page openings, disciplined spacing, and premium hierarchy without defaulting to template card grids."
        eyebrow="Composition"
        title="Hero, section, and shell rhythm"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <Card className="space-y-6">
            <div className="space-y-3">
              <Badge tone="accent">Page Hero</Badge>
              <h3
                className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] text-[color:var(--color-foreground)]"
                style={{
                  letterSpacing: "var(--tracking-display)",
                  lineHeight: "var(--line-height-tight)",
                }}
              >
                Large typography, calm copy, one clear action
              </h3>
              <p className="max-w-2xl text-[length:var(--font-size-body-lg)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                Future public pages can lead with strong editorial hierarchy
                while staying quiet, spacious, and conversion-aware.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {["Navbar", "Section", "Container"].map((item) => (
                <Card key={item} tone="muted" className="p-5">
                  <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                    Primitive
                  </p>
                  <p className="mt-3 text-[length:var(--font-size-body-md)] font-medium text-[color:var(--color-foreground)]">
                    {item}
                  </p>
                </Card>
              ))}
            </div>
          </Card>

          <Card tone="accent" className="space-y-4">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Accessibility defaults
            </p>
            <ul className="space-y-4 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-foreground)]">
              <li>
                Semantic landmarks for header, nav, main, section, and footer.
              </li>
              <li>
                Visible focus rings and reduced-motion support baked into the
                foundation.
              </li>
              <li>
                Responsive layouts designed to stack cleanly without hidden
                interactions.
              </li>
            </ul>
          </Card>
        </div>
      </Section>
    </>
  );
}
