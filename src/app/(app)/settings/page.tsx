import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { buildPageMetadata } from "@/lib/metadata";
import { ProfileSettingsForm } from "@/modules/account/components/profile-settings-form";
import { getProfileSettings } from "@/modules/account/service";
import { requireUserSession } from "@/modules/auth/server";

export const metadata = buildPageMetadata({
  title: "Account Settings",
  description:
    "Manage your NAVAGRAHA CENTRE account identity and private profile settings.",
  path: "/settings",
  keywords: ["account settings", "member profile", "private astrology account"],
});

export default async function SettingsPage() {
  const session = await requireUserSession();
  const profile = await getProfileSettings(session.user.id);

  return (
    <Section
      eyebrow="Account Settings"
      title="Shape the account foundation with clarity."
      description="Keep your member identity and private profile details current so later birth data, consultation, and commerce modules have a polished starting point."
      tone="transparent"
      className="pt-0"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <ProfileSettingsForm
          defaults={{
            name: session.user.name,
            email: session.user.email,
            image: session.user.image ?? "",
            phone: profile.phone ?? "",
            city: profile.city ?? "",
            region: profile.region ?? "",
            country: profile.country ?? "",
            timezone: profile.timezone ?? "",
            bio: profile.bio ?? "",
            notes: profile.notes ?? "",
          }}
        />

        <Card className="space-y-5">
          <div className="space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Why this matters
            </p>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              A calm account structure makes later phases faster.
            </h2>
          </div>

          <ul className="space-y-4 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            <li>
              Your identity fields now live in a dedicated auth-backed user
              record.
            </li>
            <li>
              Your extended member profile is stored separately, ready for later
              domain modules.
            </li>
            <li>
              Birth data, charts, consultations, orders, remedies, and articles
              already have schema support behind this account.
            </li>
          </ul>
        </Card>
      </div>
    </Section>
  );
}
