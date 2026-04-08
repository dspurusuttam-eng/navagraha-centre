import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { AdminPageIntro } from "@/modules/admin/components/admin-page-intro";
import { buildAdminMetadata } from "@/modules/admin/metadata";
import { requireAdminSession } from "@/modules/auth/server";
import { generateAstrologerCopilotBriefAction } from "@/modules/astrologer-copilot/actions";
import { CopilotDraftPanel } from "@/modules/astrologer-copilot/components/copilot-draft-panel";
import { getAstrologerCopilotPageData } from "@/modules/astrologer-copilot/service";

export const metadata = buildAdminMetadata({
  title: "Astrologer Copilot",
  description:
    "Generate grounded, editable consultation briefs for Joy Prakash Sarmah and admin astrologer workflows.",
  path: "/admin/astrologer-copilot",
  keywords: ["astrologer copilot", "consultation brief", "grounded ai"],
});

function formatDateTime(value: string | null) {
  if (!value) {
    return "Schedule pending";
  }

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AstrologerCopilotPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{
    consultationId?: string;
    snapshotId?: string;
  }>;
}>) {
  await requireAdminSession({
    allowedRoles: ["founder", "support"],
  });
  const { consultationId, snapshotId } = await searchParams;
  const pageData = await getAstrologerCopilotPageData({
    selectedConsultationId: consultationId,
    snapshotId,
  });

  return (
    <div className="space-y-6">
      <AdminPageIntro
        eyebrow="Astrologer Copilot"
        title="Grounded consultation assistance that supports, never replaces, astrologer judgement."
        description="Generate premium internal briefs from deterministic chart context, remedy intelligence, consultation intake, and controlled AI drafting. Every draft remains advisory and editable."
      />

      <Card className="space-y-4">
        <form action={generateAstrologerCopilotBriefAction} className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <label className="block space-y-2">
            <span className="text-[0.74rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
              Consultation / Client
            </span>
            <Select
              name="consultationId"
              defaultValue={pageData.selectedConsultationId ?? ""}
            >
              {pageData.consultationOptions.map((option) => (
                <option key={option.consultationId} value={option.consultationId}>
                  {option.clientName} | {option.serviceLabel} | {option.confirmationCode}
                </option>
              ))}
            </Select>
          </label>
          <Button type="submit">Generate Brief</Button>
        </form>
      </Card>

      {pageData.brief ? (
        <>
          <Card tone="accent" className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="accent">Advisory Draft</Badge>
              <Badge tone="neutral">{pageData.brief.providerKey}</Badge>
              <Badge tone="outline">{pageData.brief.promptVersionLabel}</Badge>
            </div>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              {pageData.brief.drafts.headline}
            </h2>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              Client: {pageData.brief.clientSnapshot.name} |{" "}
              {pageData.brief.clientSnapshot.confirmationCode} |{" "}
              {formatDateTime(pageData.brief.clientSnapshot.scheduledForUtc)}
            </p>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <Card className="space-y-4">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Client Snapshot
              </p>
              <div className="space-y-2 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                <p>
                  Service:{" "}
                  <span className="text-[color:var(--color-foreground)]">
                    {pageData.brief.clientSnapshot.serviceLabel}
                  </span>
                </p>
                <p>
                  Topic Focus:{" "}
                  <span className="text-[color:var(--color-foreground)]">
                    {pageData.brief.clientSnapshot.topicFocus ?? "Not provided"}
                  </span>
                </p>
                <p>
                  Intake Summary:{" "}
                  <span className="text-[color:var(--color-foreground)]">
                    {pageData.brief.clientSnapshot.intakeSummary ?? "Not provided"}
                  </span>
                </p>
                <p>
                  Previous Sessions:{" "}
                  <span className="text-[color:var(--color-foreground)]">
                    {pageData.brief.clientSnapshot.consultationHistoryCount}
                  </span>
                </p>
              </div>
            </Card>

            <Card className="space-y-4">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Chart Summary Packet
              </p>
              <div className="space-y-2 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                <p>
                  Ascendant:{" "}
                  <span className="text-[color:var(--color-foreground)]">
                    {pageData.brief.chartSummaryPacket.ascendantSign}
                  </span>
                </p>
                <p>
                  Dominant Bodies:{" "}
                  <span className="text-[color:var(--color-foreground)]">
                    {pageData.brief.chartSummaryPacket.dominantBodies.join(", ")}
                  </span>
                </p>
                <p>{pageData.brief.chartSummaryPacket.narrative}</p>
              </div>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <Card className="space-y-4">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Strongest Themes
              </p>
              <div className="space-y-3">
                {pageData.brief.priorityThemes.map((theme) => (
                  <div
                    key={theme.key}
                    className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] px-4 py-4"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge tone="neutral">{theme.level}</Badge>
                      {theme.requiresManualJudgement ? (
                        <Badge tone="outline">Manual Judgement</Badge>
                      ) : null}
                    </div>
                    <p className="mt-2 text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                      {theme.title}
                    </p>
                    <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                      {theme.rationale}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="space-y-4">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Remedy Intelligence
              </p>
              <div className="space-y-3">
                {pageData.brief.remedySummary.topRecommendations.map((item) => (
                  <div
                    key={item.slug}
                    className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] px-4 py-4"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge tone="accent">{item.priorityTier}</Badge>
                      <Badge tone="neutral">{item.confidenceLabel}</Badge>
                    </div>
                    <p className="mt-2 text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                      {item.title}
                    </p>
                    <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                      {item.whyThisRemedy}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <Card className="space-y-4">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                What To Focus / Ask / Avoid
              </p>
              <div className="space-y-3 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                <p>{pageData.brief.sections.focusFirst}</p>
                <p>{pageData.brief.sections.questions}</p>
                <p>{pageData.brief.sections.avoidOverstating}</p>
              </div>
            </Card>

            <Card className="space-y-4">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Suggested Talking Points
              </p>
              <div className="space-y-3">
                {pageData.brief.discussionTopics.map((topic) => (
                  <div
                    key={topic.title}
                    className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] px-4 py-4"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge tone="outline">{topic.priority}</Badge>
                    </div>
                    <p className="mt-2 text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                      {topic.title}
                    </p>
                    <p className="mt-2 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                      {topic.question}
                    </p>
                    <p className="mt-2 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                      {topic.rationale}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <Card className="space-y-4">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Caution Areas
              </p>
              <div className="space-y-3">
                {pageData.brief.riskCautionFlags.map((flag) => (
                  <div
                    key={flag.key}
                    className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] px-4 py-4"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge tone="neutral">{flag.severity}</Badge>
                      <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                        {flag.label}
                      </p>
                    </div>
                    <p className="mt-2 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                      {flag.reason}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="space-y-4">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Follow-up Orientation
              </p>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {pageData.brief.remedySummary.consultationPreparationSummary}
              </p>
            </Card>
          </div>

          <Card className="space-y-5">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Draft Workspace
            </p>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <CopilotDraftPanel
                snapshotId={pageData.brief.id}
                title="Follow-up Draft"
                description="Editable advisory follow-up recommendation text."
                defaultValue={pageData.brief.drafts.followUpDraft}
                exportFileName={`${pageData.brief.clientSnapshot.confirmationCode}-follow-up.txt`}
              />
              <CopilotDraftPanel
                snapshotId={pageData.brief.id}
                title="Recap Draft"
                description="Editable post-consultation recap draft."
                defaultValue={pageData.brief.drafts.recapDraft}
                exportFileName={`${pageData.brief.clientSnapshot.confirmationCode}-recap.txt`}
              />
            </div>
            <CopilotDraftPanel
              snapshotId={pageData.brief.id}
              title="Astrologer Notes Draft"
              description="Private editable note draft for internal consultation use."
              defaultValue={pageData.brief.drafts.astrologerNotesDraft}
              exportFileName={`${pageData.brief.clientSnapshot.confirmationCode}-notes.txt`}
            />
          </Card>
        </>
      ) : (
        <Card className="space-y-3">
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            Select a consultation and generate a grounded brief. The copilot will
            prepare advisory sections from deterministic chart facts, approved
            remedies, and consultation context without replacing astrologer authority.
          </p>
        </Card>
      )}
    </div>
  );
}
