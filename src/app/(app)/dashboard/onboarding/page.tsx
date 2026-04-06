import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { buildPageMetadata } from "@/lib/metadata";
import { requireUserSession } from "@/modules/auth/server";
import { OnboardingWizard } from "@/modules/onboarding/components/onboarding-wizard";
import { getOnboardingSnapshot } from "@/modules/onboarding/service";

export const metadata = buildPageMetadata({
  title: "Birth Onboarding",
  description:
    "Save your primary birth profile and generate the first private NAVAGRAHA CENTRE chart inside the protected dashboard.",
  path: "/dashboard/onboarding",
  keywords: [
    "birth onboarding",
    "private chart intake",
    "member astrology setup",
  ],
});

export default async function DashboardOnboardingPage() {
  const session = await requireUserSession();
  const snapshot = await getOnboardingSnapshot(session.user.id);

  return (
    <Section
      eyebrow="Birth Onboarding"
      title="Build the private chart foundation with clarity."
      description="This guided intake stores the primary birth profile, aligns it with the member account, and generates the initial chart without adding interpretation layers yet."
      tone="transparent"
      className="pt-0"
    >
      <div className="mb-6 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
        <Card className="space-y-4">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Guided Flow
          </p>
          <h2
            className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
            style={{ letterSpacing: "var(--tracking-display)" }}
          >
            One account identity, one primary birth profile, one stored initial
            chart.
          </h2>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            The wizard stays intentionally focused: it captures the essential
            birth details, saves them securely to the signed-in account, and
            generates the first structured natal chart for later phases.
          </p>
        </Card>

        <Card tone="accent" className="space-y-4">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Member Identity
          </p>
          <div className="space-y-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            <p>
              Signed in as{" "}
              <span className="text-[color:var(--color-foreground)]">
                {session.user.email}
              </span>
            </p>
            <p>
              Preferred language currently stored as{" "}
              <span className="text-[color:var(--color-foreground)]">
                {snapshot.status.preferredLanguageLabel}
              </span>
            </p>
          </div>
        </Card>
      </div>

      <OnboardingWizard defaults={snapshot.defaults} status={snapshot.status} />
    </Section>
  );
}
