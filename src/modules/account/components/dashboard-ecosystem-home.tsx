import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ChartOverview } from "@/modules/onboarding/service";
import type { RetentionDashboardSnapshot } from "@/modules/retention";
import type {
  DashboardAiHistoryItem,
  DashboardCompatibilityHistoryItem,
  DashboardEcosystemData,
  DashboardSavedReportItem,
} from "@/modules/account/dashboard-ecosystem";

type DashboardEcosystemHomeProps = {
  userName: string;
  chartOverview: ChartOverview;
  retentionState: RetentionDashboardSnapshot;
  ecosystem: DashboardEcosystemData;
};

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusTone(status: DashboardSavedReportItem["statusLabel"]) {
  switch (status) {
    case "Ready":
      return "accent" as const;
    case "Limit Reached":
      return "outline" as const;
    default:
      return "neutral" as const;
  }
}

function categoryTone(category: DashboardAiHistoryItem["category"]) {
  switch (category) {
    case "career":
      return "accent" as const;
    case "marriage":
      return "trust" as const;
    case "finance":
      return "outline" as const;
    case "daily guidance":
      return "neutral" as const;
    default:
      return "neutral" as const;
  }
}

function compatibilityTone(index: number) {
  return index % 2 === 0 ? "trust" : "neutral";
}

function EmptyModuleState({
  title,
  description,
  href,
  cta,
}: Readonly<{
  title: string;
  description: string;
  href: string;
  cta: string;
}>) {
  return (
    <Card className="space-y-4">
      <p className="text-[length:var(--font-size-body-md)] text-[var(--color-ink-strong)]">
        {title}
      </p>
      <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
        {description}
      </p>
      <Link href={href} className={buttonStyles({ size: "sm", tone: "secondary" })}>
        {cta}
      </Link>
    </Card>
  );
}

function QuickActions() {
  const actions = [
    { label: "View Kundli", href: "/dashboard/chart" },
    { label: "Ask NAVAGRAHA AI", href: "/dashboard/ask-my-chart" },
    { label: "Check Rashifal", href: "/rashifal" },
    { label: "View Compatibility", href: "/compatibility" },
    { label: "Download Report", href: "/dashboard/report?download=latest" },
    { label: "Book Consultation", href: "/dashboard/consultations/book" },
  ] as const;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {actions.map((action, index) => (
        <Link
          key={action.label}
          href={action.href}
          className={buttonStyles({
            tone: index === 0 ? "accent" : "secondary",
            size: "sm",
            className: "w-full justify-center",
          })}
        >
          {action.label}
        </Link>
      ))}
    </div>
  );
}

function SavedKundliModule({
  chartOverview,
}: Readonly<{
  chartOverview: ChartOverview;
}>) {
  const hasKundli = Boolean(chartOverview.chart && chartOverview.birthProfile);

  if (!hasKundli) {
    return (
      <EmptyModuleState
        title="No saved Kundli yet"
        description="Complete onboarding once to save your birth profile and generate your structured Kundli foundation."
        href="/dashboard/onboarding"
        cta="Generate Your Kundli"
      />
    );
  }

  return (
    <Card className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-accent)]">
            Saved Kundli
          </p>
          <h2 className="text-[length:var(--font-size-title-sm)] text-[var(--color-ink-strong)]">
            {chartOverview.birthProfile?.label}
          </h2>
        </div>
        <Badge tone="accent">Ready</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-1">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-accent)]">
            Birth Details
          </p>
          <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
            {chartOverview.birthProfile?.birthDate} |{" "}
            {chartOverview.birthProfile?.birthTime ?? "Time pending"}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-accent)]">
            Location
          </p>
          <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
            {chartOverview.birthProfile?.city}
            {chartOverview.birthProfile?.region
              ? `, ${chartOverview.birthProfile.region}`
              : ""}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-accent)]">
            Chart Summary
          </p>
          <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
            Lagna:{" "}
            {chartOverview.chart
              ? chartOverview.chart.ascendantSign.charAt(0) +
                chartOverview.chart.ascendantSign.slice(1).toLowerCase()
              : "Unavailable"}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-accent)]">
            Last Updated
          </p>
          <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
            {formatDateTime(chartOverview.chartRecord?.generatedAtUtc ?? null)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/chart" className={buttonStyles({ size: "sm", tone: "secondary" })}>
          View Full Kundli
        </Link>
        <Link href="/dashboard/onboarding" className={buttonStyles({ size: "sm", tone: "ghost" })}>
          Update Birth Details
        </Link>
      </div>
    </Card>
  );
}

function PersonalizedGuidanceModule({
  retentionState,
}: Readonly<{
  retentionState: RetentionDashboardSnapshot;
}>) {
  return (
    <Card tone="accent" className="space-y-5">
      <div className="space-y-2">
        <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-accent)]">
          Today&apos;s Personalized Guidance
        </p>
        <h2 className="text-[length:var(--font-size-title-sm)] text-[var(--color-ink-strong)]">
          {retentionState.dailyInsight.title}
        </h2>
      </div>
      <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
        {retentionState.dailyInsight.summary}
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.65)] px-4 py-4">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-accent)]">
            Current Energy
          </p>
          <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
            {retentionState.currentEnergy.summary}
          </p>
        </div>
        <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.65)] px-4 py-4">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-accent)]">
            Recommended Next Step
          </p>
          <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
            {retentionState.recommendedNextStep.summary}
          </p>
        </div>
      </div>
      <div>
        <Link
          href={retentionState.recommendedNextStep.href}
          className={buttonStyles({ size: "sm", tone: "secondary" })}
        >
          {retentionState.recommendedNextStep.ctaLabel}
        </Link>
      </div>
    </Card>
  );
}

function AiHistoryModule({
  items,
}: Readonly<{
  items: DashboardAiHistoryItem[];
}>) {
  if (!items.length) {
    return (
      <EmptyModuleState
        title="No AI history yet"
        description="Ask your first chart-aware question to build recent AI context, category labels, and resume continuity."
        href="/dashboard/ask-my-chart"
        cta="Ask NAVAGRAHA AI"
      />
    );
  }

  return (
    <Card className="space-y-5">
      <div className="space-y-2">
        <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-accent)]">
          Recent AI Activity
        </p>
        <h2 className="text-[length:var(--font-size-title-sm)] text-[var(--color-ink-strong)]">
          Continue recent chart conversations.
        </h2>
      </div>
      <div className="space-y-3">
        {items.slice(0, 4).map((item) => (
          <div
            key={item.id}
            className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.66)] px-4 py-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge tone={categoryTone(item.category)}>{item.category}</Badge>
              <span className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-accent)]">
                {formatDateTime(item.updatedAtUtc)}
              </span>
            </div>
            <p className="mt-3 text-[length:var(--font-size-body-sm)] text-[var(--color-ink-strong)]">
              Q: {item.question}
            </p>
            <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              A: {item.responsePreview}
            </p>
            <Link
              href={item.resumeHref}
              className={buttonStyles({ size: "sm", tone: "tertiary", className: "mt-3" })}
            >
              Resume Conversation
            </Link>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SavedReportsModule({
  reports,
}: Readonly<{
  reports: DashboardSavedReportItem[];
}>) {
  if (!reports.length) {
    return (
      <EmptyModuleState
        title="No saved reports yet"
        description="Generate your first report preview to create saved report history with ready, preview, and future premium continuity states."
        href="/dashboard/report"
        cta="Get Free Report"
      />
    );
  }

  return (
    <Card className="space-y-5">
      <div className="space-y-2">
        <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-accent)]">
          Saved Reports
        </p>
        <h2 className="text-[length:var(--font-size-title-sm)] text-[var(--color-ink-strong)]">
          Report history with view and download actions.
        </h2>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {reports.slice(0, 4).map((report) => (
          <div
            key={report.id}
            className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.66)] px-4 py-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-strong)]">
                {report.title}
              </p>
              <Badge tone={statusTone(report.statusLabel)}>{report.statusLabel}</Badge>
            </div>
            <p className="mt-2 text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-accent)]">
              Generated {formatDateTime(report.generatedAtUtc)}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={report.viewHref} className={buttonStyles({ size: "sm", tone: "secondary" })}>
                View
              </Link>
              <Link
                href={report.downloadHref ?? report.viewHref}
                className={buttonStyles({ size: "sm", tone: "ghost" })}
              >
                Download
              </Link>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function CompatibilityHistoryModule({
  items,
}: Readonly<{
  items: DashboardCompatibilityHistoryItem[];
}>) {
  if (!items.length) {
    return (
      <EmptyModuleState
        title="No compatibility history yet"
        description="When compatibility sessions are saved, pair labels and result snapshots will appear here for quick re-open."
        href="/compatibility"
        cta="View Compatibility"
      />
    );
  }

  return (
    <Card className="space-y-5">
      <div className="space-y-2">
        <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-accent)]">
          Compatibility History
        </p>
        <h2 className="text-[length:var(--font-size-title-sm)] text-[var(--color-ink-strong)]">
          Revisit saved compatibility snapshots.
        </h2>
      </div>
      <div className="space-y-3">
        {items.slice(0, 3).map((item, index) => (
          <div
            key={item.id}
            className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.66)] px-4 py-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-strong)]">
                {item.pairLabel}
              </p>
              <Badge tone={compatibilityTone(index)}>{formatDateTime(item.generatedAtUtc)}</Badge>
            </div>
            <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              {item.quickResultSummary}
            </p>
            <Link
              href={item.reopenHref}
              className={buttonStyles({ size: "sm", tone: "tertiary", className: "mt-3" })}
            >
              Reopen
            </Link>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ConsultationHistoryModule({
  ecosystem,
}: Readonly<{
  ecosystem: DashboardEcosystemData;
}>) {
  const hasAnyConsultationHistory =
    ecosystem.consultationHistory.upcoming.length > 0 ||
    ecosystem.consultationHistory.past.length > 0;

  if (!hasAnyConsultationHistory) {
    return (
      <EmptyModuleState
        title="No consultations booked yet"
        description="Book a session to see upcoming and past consultation records, preparation guidance, and follow-up notes here."
        href="/dashboard/consultations/book"
        cta="Book Consultation"
      />
    );
  }

  return (
    <Card className="space-y-5">
      <div className="space-y-2">
        <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-accent)]">
          Consultation History
        </p>
        <h2 className="text-[length:var(--font-size-title-sm)] text-[var(--color-ink-strong)]">
          Upcoming sessions, past sessions, and follow-up continuity.
        </h2>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="space-y-3 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.66)] px-4 py-4">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-accent)]">
            Upcoming
          </p>
          {ecosystem.consultationHistory.upcoming.length ? (
            ecosystem.consultationHistory.upcoming.map((item) => (
              <div key={item.id} className="space-y-1">
                <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-strong)]">
                  {item.label}
                </p>
                <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
                  {item.scheduleLine}
                </p>
                <Link href={item.openHref} className={buttonStyles({ size: "sm", tone: "ghost" })}>
                  Open Session
                </Link>
              </div>
            ))
          ) : (
            <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
              No upcoming sessions.
            </p>
          )}
        </div>

        <div className="space-y-3 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.66)] px-4 py-4">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-accent)]">
            Past Sessions
          </p>
          {ecosystem.consultationHistory.past.length ? (
            ecosystem.consultationHistory.past.map((item) => (
              <div key={item.id} className="space-y-1">
                <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-strong)]">
                  {item.label}
                </p>
                <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
                  {item.completedLine}
                </p>
                <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
                  {item.followUpNote ?? "Follow-up note will appear after session updates."}
                </p>
                <Link href={item.openHref} className={buttonStyles({ size: "sm", tone: "ghost" })}>
                  View Details
                </Link>
              </div>
            ))
          ) : (
            <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
              No past sessions yet.
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.66)] px-4 py-4">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-accent)]">
            Preparation Guidance
          </p>
          <div className="mt-2 space-y-2">
            {ecosystem.consultationHistory.preparationGuidance.map((item) => (
              <p
                key={item}
                className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]"
              >
                {item}
              </p>
            ))}
          </div>
        </div>
        <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.66)] px-4 py-4">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-accent)]">
            Follow-Up Notes
          </p>
          <div className="mt-2 space-y-2">
            {ecosystem.consultationHistory.followUpNotes.length ? (
              ecosystem.consultationHistory.followUpNotes.map((item) => (
                <p
                  key={item}
                  className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]"
                >
                  {item}
                </p>
              ))
            ) : (
              <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
                Follow-up notes appear here after completed consultations.
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function PreferencesModule({
  ecosystem,
}: Readonly<{
  ecosystem: DashboardEcosystemData;
}>) {
  const rows = [
    { label: "Daily updates", enabled: ecosystem.preferences.dailyUpdates },
    {
      label: "Consultation reminders",
      enabled: ecosystem.preferences.consultationReminders,
    },
    { label: "AI suggestions", enabled: ecosystem.preferences.aiSuggestions },
    {
      label: "Service announcements",
      enabled: ecosystem.preferences.serviceAnnouncements,
    },
  ] as const;

  return (
    <Card className="space-y-5">
      <div className="space-y-2">
        <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-accent)]">
          Notification & Preferences
        </p>
        <h2 className="text-[length:var(--font-size-title-sm)] text-[var(--color-ink-strong)]">
          Preference structure is ready for personalized retention flows.
        </h2>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.66)] px-4 py-3"
          >
            <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
              {row.label}
            </p>
            <Badge tone={row.enabled ? "accent" : "neutral"}>
              {row.enabled ? "Enabled" : "Off"}
            </Badge>
          </div>
        ))}
      </div>

      <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
        Preference controls are staged through account settings to support future daily nudges, reminders, and service announcements.
      </p>

      <Link
        href={ecosystem.preferences.settingsHref}
        className={buttonStyles({ size: "sm", tone: "secondary" })}
      >
        Manage Preferences
      </Link>
    </Card>
  );
}

function ProfileSummaryModule({
  userName,
  chartOverview,
  ecosystem,
}: Readonly<{
  userName: string;
  chartOverview: ChartOverview;
  ecosystem: DashboardEcosystemData;
}>) {
  return (
    <Card className="space-y-5">
      <div className="space-y-2">
        <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-accent)]">
          Profile & Settings
        </p>
        <h2 className="text-[length:var(--font-size-title-sm)] text-[var(--color-ink-strong)]">
          Personal profile, birth details, and communication context.
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="space-y-1">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-accent)]">
            Member
          </p>
          <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
            {userName}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-accent)]">
            Timezone
          </p>
          <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
            {ecosystem.preferences.timezone}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-accent)]">
            Language
          </p>
          <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
            {ecosystem.preferences.language}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-accent)]">
            Birth Profile
          </p>
          <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
            {chartOverview.birthProfile
              ? `${chartOverview.birthProfile.birthDate} | ${
                  chartOverview.birthProfile.birthTime ?? "Time pending"
                }`
              : "Not set"}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-accent)]">
            Birth Location
          </p>
          <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
            {chartOverview.birthProfile
              ? `${chartOverview.birthProfile.city}, ${chartOverview.birthProfile.country}`
              : "Not set"}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-accent)]">
            Communication
          </p>
          <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
            {ecosystem.preferences.communicationPreference}
          </p>
        </div>
      </div>

      <Link href="/settings" className={buttonStyles({ size: "sm", tone: "secondary" })}>
        Open Profile Settings
      </Link>
    </Card>
  );
}

export function DashboardEcosystemHome({
  userName,
  chartOverview,
  retentionState,
  ecosystem,
}: Readonly<DashboardEcosystemHomeProps>) {
  return (
    <div className="mb-8 space-y-6">
      <Card tone="accent" className="space-y-5">
        <div className="space-y-2">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-accent)]">
            Dashboard Home
          </p>
          <h1 className="text-[length:var(--font-size-title-lg)] text-[var(--color-ink-strong)]">
            Welcome back, {userName}.
          </h1>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
            Your personal astrology workspace now keeps Kundli, AI continuity, reports, compatibility, and consultation pathways in one retention-friendly view.
          </p>
        </div>
        <QuickActions />
      </Card>

      <SavedKundliModule chartOverview={chartOverview} />

      <PersonalizedGuidanceModule retentionState={retentionState} />

      <div className="grid gap-6 xl:grid-cols-2">
        <AiHistoryModule items={ecosystem.aiHistory} />
        <SavedReportsModule reports={ecosystem.savedReports} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <CompatibilityHistoryModule items={ecosystem.compatibilityHistory} />
        <PreferencesModule ecosystem={ecosystem} />
      </div>

      <ConsultationHistoryModule ecosystem={ecosystem} />

      <ProfileSummaryModule
        userName={userName}
        chartOverview={chartOverview}
        ecosystem={ecosystem}
      />
    </div>
  );
}

