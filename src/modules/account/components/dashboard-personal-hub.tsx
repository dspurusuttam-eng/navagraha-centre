import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { DashboardHubData } from "@/modules/account/dashboard-hub";

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleDateString("en-IN", { dateStyle: "medium" });
}

function statusTone(value: string) {
  if (value === "Ready") {
    return "accent" as const;
  }

  if (value === "Preview") {
    return "trust" as const;
  }

  return "neutral" as const;
}

function readinessTone(value: boolean) {
  return value ? ("accent" as const) : ("neutral" as const);
}

function HubMark({
  label,
}: Readonly<{
  label: string;
}>) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E1C87C] bg-white text-[0.7rem] font-semibold tracking-[0.16em] text-[#C89B2C]">
      {label}
    </div>
  );
}

function HubSectionTitle({
  eyebrow,
  title,
  summary,
}: Readonly<{
  eyebrow: string;
  title: string;
  summary: string;
}>) {
  return (
    <div className="space-y-2">
      <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">{eyebrow}</p>
      <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[#111111]">
        {title}
      </h2>
      <p className="max-w-3xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
        {summary}
      </p>
    </div>
  );
}

function InfoLine({
  label,
  value,
}: Readonly<{
  label: string;
  value: string;
}>) {
  return (
    <div className="space-y-1">
      <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">{label}</p>
      <p className="break-words text-[0.92rem] leading-[var(--line-height-copy)] text-[#111111]">{value}</p>
    </div>
  );
}

function reportTone(accessLabel: string) {
  if (accessLabel === "Ready") {
    return "accent" as const;
  }

  if (accessLabel === "Preview") {
    return "trust" as const;
  }

  return "neutral" as const;
}

function consultationTone(status: string) {
  if (status === "CONFIRMED") {
    return "accent" as const;
  }

  if (status === "REQUESTED") {
    return "trust" as const;
  }

  return "neutral" as const;
}

export function DashboardDashaLineagePanel({
  hub,
}: Readonly<{
  hub: DashboardHubData;
}>) {
  const currentPratyantardasha =
    hub.dasha.currentPratyantardasha ?? hub.dasha.currentPratyantar;
  const dashaLineage: Array<{ label: string; value: string }> = [];

  if (hub.dasha.currentMahadasha) {
    dashaLineage.push({
      label: "Mahadasha",
      value: `${hub.dasha.currentMahadasha.lord} - until ${formatDate(hub.dasha.currentMahadasha.endAtUtc)}`,
    });
  }

  if (hub.dasha.currentAntardasha) {
    dashaLineage.push({
      label: "Antardasha",
      value: `${hub.dasha.currentAntardasha.lord} - until ${formatDate(hub.dasha.currentAntardasha.endAtUtc)}`,
    });
  }

  if (currentPratyantardasha) {
    dashaLineage.push({
      label: "Pratyantardasha",
      value: `${currentPratyantardasha.lord} - until ${formatDate(currentPratyantardasha.endAtUtc)}`,
    });
  }

  return (
    <Card tone="accent" className="space-y-5">
      <div className="flex items-start gap-3">
        <HubMark label="DA" />
        <div className="min-w-0 space-y-1">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
            Current Dasha
          </p>
          <h2 className="break-words text-[length:var(--font-size-title-sm)] text-[#111111]">
            {dashaLineage.length ? "Current Dasha Lineage" : "Data unavailable"}
          </h2>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge tone={readinessTone(hub.dasha.state === "ready")}>
          {hub.dasha.state === "ready" ? "Ready" : "Data unavailable"}
        </Badge>
        <Badge tone={hub.dasha.dashaType === "VIMSHOTTARI" ? "accent" : "neutral"}>
          {hub.dasha.dashaType === "VIMSHOTTARI" ? "Vimshottari" : "No Dasha type"}
        </Badge>
      </div>
      {dashaLineage.length ? (
        <div className="grid gap-3">
          {dashaLineage.map((entry) => (
            <InfoLine key={entry.label} label={entry.label} value={entry.value} />
          ))}
        </div>
      ) : (
        <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-4">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
            Data unavailable
          </p>
          <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
            Save a Kundli with chart data to view the active Dasha lineage.
          </p>
        </div>
      )}
      {hub.dasha.timeline.length ? (
        <div className="space-y-3 rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-4">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
            Mahadasha timeline
          </p>
          <div className="space-y-3">
            {hub.dasha.timeline.slice(0, 3).map((segment) => (
              <div key={`${segment.lord}-${segment.startAtUtc}`} className="space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[length:var(--font-size-body-sm)] font-medium text-[#111111]">
                    {segment.lord}
                  </p>
                  <Badge tone={segment.isCurrent ? "accent" : "neutral"}>
                    {segment.isCurrent ? "Current" : "Upcoming"}
                  </Badge>
                </div>
                <p className="text-[length:var(--font-size-body-xs)] text-[#4A4A4A]">
                  {formatDate(segment.startAtUtc)} - {formatDate(segment.endAtUtc)}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </Card>
  );
}

export function DashboardPersonalHub({
  hub,
}: Readonly<{
  hub: DashboardHubData;
}>) {
  const profileReady = hub.profile.birthDetailsStatus === "Saved";
  const askMyChartReady = hub.readiness.canAskMyChart;
  const reportActionLabel = hub.readiness.canViewReportHistory ? "View Reports" : "Generate Report";
  const aiHistoryHref = hub.ai.historyHref;
  const aiContinueHref = hub.readiness.canContinueAIHistory ? hub.ai.continueHref : hub.ai.historyHref;
  const aiPrimaryLabel = askMyChartReady ? "Ask NAVAGRAHA AI" : "Generate Kundli";
  const aiSecondaryLabel = hub.readiness.canContinueAIHistory ? "Continue Conversation" : "View AI History";
  const kundliHref = hub.readiness.hasActiveKundli ? "/dashboard/kundli" : "/dashboard/kundli/new";
  const guidanceHref = askMyChartReady ? hub.ai.historyHref : "/dashboard/kundli/new";
  const askMyChartHref = askMyChartReady ? hub.dailyGuidance.askMyChartHref : guidanceHref;
  const panchangHref = hub.readiness.canViewPanchang ? hub.panchangSnapshot.panchangHref : "/panchang";
  const recentReports = hub.reports.saved.recent.slice(0, 3);
  const recentConsultations = hub.consultations.recentConsultations.slice(0, 2);
  const upcomingConsultation = hub.consultations.upcomingConsultation;

  return (
    <div className="space-y-6">
      <Card tone="accent" className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
              Welcome
            </p>
            <h1 className="break-words font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] text-[#111111]">
              {hub.profile.displayName}
            </h1>
            <p className="max-w-3xl break-words text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
              {hub.profile.email ?? "Email not shown"} -{" "}
              {hub.profile.accountStatus === "ACTIVE_MEMBER" ? "Active member" : "Setup pending"} -{" "}
              {hub.profile.completionLabel}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <HubMark label="01" />
            <div className="space-y-1 text-right">
              <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
                Profile Completion
              </p>
              <p className="text-[length:var(--font-size-body-sm)] text-[#111111]">
                {hub.profile.profileCompletion.label}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-4">
            <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
              Account Summary
            </p>
            <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#1C1C1C]">
              Signed-in access with user-owned dashboard data and safe fallback states.
            </p>
          </div>
          <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-4">
            <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">Birth Details</p>
            <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#1C1C1C]">
              {hub.profile.birthDetailsStatus} - no unnecessary birth details exposed here.
            </p>
          </div>
          <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-4">
            <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">Safe Access</p>
            <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#1C1C1C]">
              Server-side ownership checks remain active for charts, reports, AI, consultations, and orders.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-4">
            <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">Active Kundli</p>
            <p className="mt-2 text-[length:var(--font-size-body-sm)] text-[#111111]">
              {hub.readiness.hasActiveKundli ? hub.activeKundli.label : "No Kundli yet"}
            </p>
          </div>
          <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-4">
            <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">Ask My Chart</p>
            <p className="mt-2 text-[length:var(--font-size-body-sm)] text-[#111111]">
              {askMyChartReady ? "Ready" : "Needs an active Kundli"}
            </p>
          </div>
          <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-4">
            <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">Panchang</p>
            <p className="mt-2 text-[length:var(--font-size-body-sm)] text-[#111111]">
              {hub.readiness.canViewPanchang ? "Available" : "Unavailable"}
            </p>
          </div>
          <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-4">
            <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">Reports</p>
            <p className="mt-2 text-[length:var(--font-size-body-sm)] text-[#111111]">
              {hub.readiness.canGenerateReport ? "Ready" : "Needs Kundli or unlock"}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
        <DashboardDashaLineagePanel hub={hub} />

        <Card className="space-y-4">
          <div className="flex items-start gap-3">
            <HubMark label="GD" />
            <div className="min-w-0 space-y-1">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
                Today&apos;s Personal Guidance
              </p>
              <h2 className="break-words text-[length:var(--font-size-title-sm)] text-[#111111]">
                {hub.dailyGuidance.title}
              </h2>
            </div>
          </div>
          <Badge tone={hub.dailyGuidance.source === "panchang" ? "accent" : "neutral"}>
            {hub.dailyGuidance.source === "panchang"
              ? "Panchang source"
              : hub.dailyGuidance.source === "current-cycle"
                ? "Current cycle source"
                : "Fallback guidance"}
          </Badge>
          <p className="break-words text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
            {hub.dailyGuidance.summary}
          </p>
          <div className="grid gap-3">
            <InfoLine label="Work / study / business" value={hub.dailyGuidance.focusAreas.workStudyBusiness} />
            <InfoLine label="Relationship / family" value={hub.dailyGuidance.focusAreas.relationshipFamily} />
            <InfoLine label="Money / decision caution" value={hub.dailyGuidance.focusAreas.moneyDecision} />
            <InfoLine label="Wellness / energy" value={hub.dailyGuidance.focusAreas.wellnessEnergy} />
          </div>
          <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-4">
            <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
              Support Line
            </p>
            <p className="mt-2 break-words text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#1C1C1C]">
              {hub.dailyGuidance.supportingLine}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={guidanceHref} className={buttonStyles({ size: "sm", tone: "secondary" })}>
              {askMyChartReady ? "Ask Today&apos;s Guidance" : "Generate Kundli"}
            </Link>
            <Link href={askMyChartHref} className={buttonStyles({ size: "sm", tone: "ghost" })}>
              Ask NAVAGRAHA AI
            </Link>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-start gap-3">
            <HubMark label="PN" />
            <div className="min-w-0 space-y-1">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
                Panchang Snapshot
              </p>
              <h2 className="break-words text-[length:var(--font-size-title-sm)] text-[#111111]">
                {hub.panchangSnapshot.sourceLabel}
              </h2>
            </div>
          </div>
          <Badge tone={readinessTone(hub.panchangSnapshot.state === "ready")}>
            {hub.panchangSnapshot.state === "ready" ? "Ready" : "Fallback"}
          </Badge>
          <div className="grid gap-3">
            <InfoLine label="Date / day" value={`${hub.panchangSnapshot.dateLabel} - ${hub.panchangSnapshot.weekday}`} />
            <InfoLine label="Tithi" value={hub.panchangSnapshot.tithi ?? "Unavailable"} />
            <InfoLine label="Nakshatra" value={hub.panchangSnapshot.nakshatra ?? "Unavailable"} />
            <InfoLine label="Yoga / Karana" value={`${hub.panchangSnapshot.yoga ?? "Unavailable"} - ${hub.panchangSnapshot.karana ?? "Unavailable"}`} />
            <InfoLine
              label="Planning windows"
              value={`Rahu Kaal: ${hub.panchangSnapshot.rahuKaal ?? "Unavailable"} - Gulika: ${hub.panchangSnapshot.gulika ?? "Unavailable"} - Yamaganda: ${hub.panchangSnapshot.yamaganda ?? "Unavailable"} - Abhijit: ${hub.panchangSnapshot.abhijit ?? "Unavailable"}`}
            />
          </div>
          <p className="break-words text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
            Planning windows are for timing awareness only. They do not guarantee an outcome.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href={panchangHref} className={buttonStyles({ size: "sm", tone: "secondary" })}>
              View Panchang
            </Link>
            <Link href={hub.dailyGuidance.panchang.returnPromptHref} className={buttonStyles({ size: "sm", tone: "ghost" })}>
              Open Daily Context
            </Link>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-start gap-3">
            <HubMark label="RM" />
            <div className="min-w-0 space-y-1">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
                Daily Remedy / Spiritual Support
              </p>
              <h2 className="break-words text-[length:var(--font-size-title-sm)] text-[#111111]">
                {hub.dailyRemedy.title}
              </h2>
            </div>
          </div>
          <Badge tone={readinessTone(hub.dailyRemedy.state === "ready")}>
            {hub.dailyRemedy.state === "ready" ? "Ready" : "Fallback"}
          </Badge>
          <p className="break-words text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
            {hub.dailyRemedy.summary}
          </p>
          <div className="grid gap-2">
            {hub.dailyRemedy.supportivePractices.map((practice) => (
              <div
                key={practice}
                className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-3 text-[0.92rem] leading-[var(--line-height-copy)] text-[#111111]"
              >
                {practice}
              </div>
            ))}
          </div>
          <p className="break-words text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
            {hub.dailyRemedy.prayerHint ?? "Optional support only. No guaranteed result."}
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href={hub.dailyRemedy.ctaHref} className={buttonStyles({ size: "sm", tone: "secondary" })}>
              {hub.dailyRemedy.ctaLabel}
            </Link>
            <Link href={guidanceHref} className={buttonStyles({ size: "sm", tone: "ghost" })}>
              Ask Today&apos;s Guidance
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="space-y-4">
          <div className="flex items-start gap-3">
            <HubMark label="KU" />
            <div className="min-w-0 space-y-1">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">Active Kundli</p>
              <h2 className="break-words text-[length:var(--font-size-title-sm)] text-[#111111]">
                {hub.activeKundli.label}
              </h2>
            </div>
          </div>
          <p className="break-words text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
            {hub.activeKundli.hasChart
              ? hub.activeKundli.summary
              : "No saved Kundli yet. Generate your first chart to unlock the active summary."}
          </p>
          <div className="grid gap-2 text-[length:var(--font-size-body-sm)] text-[#1C1C1C]">
            <p className="break-words">
              Lagna: <span className="text-[#111111]">{hub.activeKundli.ascendantSign ?? "Unavailable"}</span>
            </p>
            <p className="break-words">
              Moon sign: <span className="text-[#111111]">{hub.activeKundli.moonSign ?? "Unavailable"}</span>
            </p>
            <p className="break-words">
              Chart update: <span className="text-[#111111]">{formatDateTime(hub.activeKundli.generatedAtUtc)}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={kundliHref} className={buttonStyles({ size: "sm", tone: "secondary" })}>
              {hub.activeKundli.hasChart ? "View Kundli" : "Generate Kundli"}
            </Link>
            <Link href="/dashboard/kundli/new" className={buttonStyles({ size: "sm", tone: "ghost" })}>
              {profileReady ? "Update Kundli" : "Generate Kundli"}
            </Link>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-start gap-3">
            <HubMark label="RP" />
            <div className="min-w-0 space-y-1">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">Saved Reports</p>
              <h2 className="break-words text-[length:var(--font-size-title-sm)] text-[#111111]">
                {hub.reports.current.accessLabel} report access
              </h2>
            </div>
          </div>
          <Badge tone={statusTone(hub.reports.current.accessLabel)}>{hub.reports.current.accessLabel}</Badge>
          <p className="break-words text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
            {hub.reports.current.overview}
          </p>
          <div className="grid gap-2 text-[length:var(--font-size-body-sm)] text-[#1C1C1C]">
            <p className="break-words">
              Unlocked:{" "}
              <span className="text-[#111111]">
                {hub.reports.saved.unlockedCount}
              </span>
            </p>
            <p className="break-words">
              Ready / Preview / Locked:{" "}
              <span className="text-[#111111]">
                {hub.reports.saved.readyCount} / {hub.reports.saved.previewCount} / {hub.reports.saved.lockedCount}
              </span>
            </p>
            <p className="break-words">
              Recent reports:{" "}
              <span className="text-[#111111]">
                {hub.readiness.hasSavedReports ? `${hub.reports.saved.recent[0]?.title ?? "Saved report"}` : "No saved reports yet"}
              </span>
            </p>
          </div>
          <div className="grid gap-3">
            {recentReports.length > 0 ? (
              recentReports.map((report) => (
                <div key={report.id} className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0 space-y-1">
                      <h3 className="break-words text-[0.96rem] text-[#111111]">{report.title}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge tone="accent">{report.type}</Badge>
                      <Badge tone={reportTone(report.accessLabel)}>{report.accessLabel}</Badge>
                    </div>
                  </div>
                  <p className="mt-2 break-words text-[0.88rem] leading-[var(--line-height-copy)] text-[#4A4A4A]">
                    Generated {formatDateTime(report.generatedAtUtc)}
                  </p>
                  <p className="break-words text-[0.88rem] leading-[var(--line-height-copy)] text-[#4A4A4A]">
                    Related Kundli: {report.relatedKundliId ?? "Unavailable"} - Payment: {report.paymentLabel}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={report.accessLabel === "Ready" ? report.fullHref : report.previewHref}
                      className={buttonStyles({ size: "sm", tone: "secondary" })}
                    >
                      {report.accessLabel === "Ready" ? "Open Full Report" : "View Preview"}
                    </Link>
                    <Link href={report.unlockHref} className={buttonStyles({ size: "sm", tone: "ghost" })}>
                      {report.accessLabel === "Locked" ? "Unlock Full Report" : "Continue Report"}
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-4 text-[0.92rem] leading-[var(--line-height-copy)] text-[#4A4A4A]">
                No saved reports yet. Generate a report after creating or unlocking a Kundli.
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={hub.reports.saved.historyHref} className={buttonStyles({ size: "sm", tone: "secondary" })}>
              View Reports
            </Link>
            <Link href={hub.reports.saved.historyHref} className={buttonStyles({ size: "sm", tone: "ghost" })}>
              {reportActionLabel}
            </Link>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-start gap-3">
            <HubMark label="AI" />
            <div className="min-w-0 space-y-1">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
                Ask NAVAGRAHA AI
              </p>
              <h2 className="break-words text-[length:var(--font-size-title-sm)] text-[#111111]">
                {hub.ai.readinessLabel}
              </h2>
            </div>
          </div>
          <p className="break-words text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
            {askMyChartReady
              ? "Your saved chart can support grounded assistant questions and chart continuity."
              : "Generate Kundli first so Ask NAVAGRAHA AI can answer from your own chart context."}
          </p>
          <div className="grid gap-2 text-[length:var(--font-size-body-sm)] text-[#1C1C1C]">
            <p className="break-words">
              Active Kundli: <span className="text-[#111111]">{hub.ai.currentKundliLabel ?? "Unavailable"}</span>
            </p>
            <p className="break-words">
              Recent sessions: <span className="text-[#111111]">{hub.ai.historyCount}</span>
            </p>
            <p className="break-words">
              Latest topic: <span className="text-[#111111]">{hub.ai.latestSessionTitle ?? hub.ai.emptyStateLabel}</span>
            </p>
          </div>
          <div className="grid gap-2">
            {hub.ai.recentSessions.length > 0 ? (
              hub.ai.recentSessions.map((session) => (
                <div key={`${session.moduleLabel}-${session.createdAtUtc ?? session.question}`} className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge tone="accent">{session.moduleLabel}</Badge>
                    <p className="text-[0.72rem] text-[#4A4A4A]">{formatDateTime(session.createdAtUtc)}</p>
                  </div>
                  <p className="mt-2 break-words text-[0.92rem] text-[#111111]">{session.question}</p>
                  <p className="mt-1 break-words text-[0.88rem] leading-[var(--line-height-copy)] text-[#4A4A4A]">
                    {session.snippet}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-4 text-[0.92rem] leading-[var(--line-height-copy)] text-[#4A4A4A]">
                {hub.ai.emptyStateLabel}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={askMyChartReady ? aiHistoryHref : "/dashboard/kundli/new"} className={buttonStyles({ size: "sm", tone: "secondary" })}>
              {aiPrimaryLabel}
            </Link>
            <Link href={aiContinueHref} className={buttonStyles({ size: "sm", tone: "ghost" })}>
              {aiSecondaryLabel}
            </Link>
            <Link href={aiHistoryHref} className={buttonStyles({ size: "sm", tone: "ghost" })}>
              View AI History
            </Link>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-start gap-3">
            <HubMark label="CO" />
            <div className="min-w-0 space-y-1">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">Consultation</p>
              <h2 className="break-words text-[length:var(--font-size-title-sm)] text-[#111111]">
                {hub.consultations.consultationSummary}
              </h2>
            </div>
          </div>
          <p className="break-words text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
            {hub.consultations.leadNote ??
              "No consultation history yet. Book a session to save preparation notes and follow-up continuity."}
          </p>
          <div className="grid gap-2 text-[length:var(--font-size-body-sm)] text-[#1C1C1C]">
            <p className="break-words">
              Total / upcoming / past:{" "}
              <span className="text-[#111111]">
                {hub.consultations.upcomingCount + hub.consultations.pastCount} / {hub.consultations.upcomingCount} / {hub.consultations.pastCount}
              </span>
            </p>
            <p className="break-words">
              Latest booking status:{" "}
              <span className="text-[#111111]">
                {upcomingConsultation?.status ?? recentConsultations[0]?.status ?? "No bookings yet"}
              </span>
            </p>
          </div>
          {upcomingConsultation ? (
            <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge tone={consultationTone(upcomingConsultation.status)}>
                  {upcomingConsultation.status}
                </Badge>
                <p className="text-[0.72rem] text-[#4A4A4A]">
                  {upcomingConsultation.astrologerName}
                </p>
              </div>
              <p className="mt-2 break-words text-[0.92rem] text-[#111111]">
                {upcomingConsultation.label}
              </p>
              <p className="mt-1 break-words text-[0.88rem] leading-[var(--line-height-copy)] text-[#4A4A4A]">
                {upcomingConsultation.scheduleLine}
              </p>
              <p className="mt-1 break-words text-[0.88rem] leading-[var(--line-height-copy)] text-[#4A4A4A]">
                Related Kundli: {upcomingConsultation.relatedKundliLabel ?? "Unavailable"}
              </p>
              <Link href={upcomingConsultation.openHref} className={buttonStyles({ size: "sm", tone: "ghost", className: "mt-3" })}>
                View Details
              </Link>
            </div>
          ) : null}
          <div className="grid gap-2">
            {recentConsultations.length ? (
              recentConsultations.map((item) => (
                <div key={item.id} className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge tone={consultationTone(item.status)}>{item.status}</Badge>
                    <p className="text-[0.72rem] text-[#4A4A4A]">{item.updatedAtUtc ? formatDateTime(item.updatedAtUtc) : "Not available"}</p>
                  </div>
                  <p className="mt-2 break-words text-[0.92rem] text-[#111111]">{item.label}</p>
                  <p className="mt-1 break-words text-[0.88rem] leading-[var(--line-height-copy)] text-[#4A4A4A]">
                    {item.scheduleLine}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-4 text-[0.92rem] leading-[var(--line-height-copy)] text-[#4A4A4A]">
                {hub.consultations.hasConsultationHistory
                  ? "Consultation history is available but recent items could not be summarized."
                  : "No consultation history yet. Book a session to begin."}
              </div>
            )}
          </div>
          <div className="grid gap-2 text-[length:var(--font-size-body-sm)] text-[#1C1C1C]">
            <p className="break-words">
              Upcoming / past: <span className="text-[#111111]">{hub.consultations.upcomingCount} / {hub.consultations.pastCount}</span>
            </p>
            <p className="break-words">
              Preparation:{" "}
              <span className="text-[#111111]">{hub.consultations.preparationGuidance[0] ?? "No preparation guidance yet"}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={hub.consultations.bookHref} className={buttonStyles({ size: "sm", tone: "secondary" })}>
              {hub.consultations.canBookConsultation ? "Book Consultation" : "View Consultation History"}
            </Link>
            <Link href={hub.consultations.historyHref} className={buttonStyles({ size: "sm", tone: "ghost" })}>
              View Consultation History
            </Link>
          </div>
        </Card>
      </div>

      <Card className="space-y-5">
        <HubSectionTitle
          eyebrow="Quick Actions"
          title="Move through the personal hub without losing chart context."
          summary="The dashboard stays calm and direct: generate Kundli, ask NAVAGRAHA AI, review reports, open Panchang, read the desk, or book consultation from one place."
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Link
            href="/dashboard/kundli/new"
            className={buttonStyles({ size: "sm", tone: "secondary", className: "w-full justify-center" })}
          >
            Generate Kundli
          </Link>
          <Link
            href={guidanceHref}
            className={buttonStyles({ size: "sm", tone: "secondary", className: "w-full justify-center" })}
          >
            Ask NAVAGRAHA AI
          </Link>
          <Link href={hub.reports.saved.historyHref} className={buttonStyles({ size: "sm", tone: "secondary", className: "w-full justify-center" })}>
            View Reports
          </Link>
          <Link
            href={panchangHref}
            className={buttonStyles({ size: "sm", tone: "ghost", className: "w-full justify-center" })}
          >
            Check Panchang
          </Link>
          <Link href="/from-the-desk" className={buttonStyles({ size: "sm", tone: "ghost", className: "w-full justify-center" })}>
            Read From the Desk
          </Link>
          <Link
            href={hub.consultations.bookHref}
            className={buttonStyles({ size: "sm", tone: "ghost", className: "w-full justify-center" })}
          >
            Book Consultation
          </Link>
        </div>
      </Card>
    </div>
  );
}
