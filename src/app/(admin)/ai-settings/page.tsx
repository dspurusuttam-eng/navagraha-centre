import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AdminPageIntro } from "@/modules/admin/components/admin-page-intro";
import { AdminStatusBadge } from "@/modules/admin/components/admin-status-badge";
import {
  activatePromptVersionAction,
  createPromptVersionAction,
} from "@/modules/admin/actions";
import { formatAdminDateTime } from "@/modules/admin/format";
import { buildAdminMetadata } from "@/modules/admin/metadata";
import { listAiPromptTemplates } from "@/modules/admin/service";
import { requireAdminSession } from "@/modules/auth/server";

export const metadata = buildAdminMetadata({
  title: "Admin AI Settings",
  description:
    "Review and manage AI prompt templates, versions, and activation state for NAVAGRAHA CENTRE reporting workflows.",
  path: "/admin/ai-settings",
  keywords: ["ai prompt settings", "prompt versions", "internal ai governance"],
});

export default async function AdminAiSettingsPage() {
  await requireAdminSession({
    allowedRoles: ["founder", "editor"],
  });

  const templates = await listAiPromptTemplates();

  return (
    <div className="space-y-6">
      <AdminPageIntro
        eyebrow="AI Templates"
        title="Prompt changes stay versioned, reviewable, and separate from chart calculation."
        description="This area governs interpretation templates only. It does not alter deterministic astrology math, and it gives the team a controlled place to prepare or promote new prompt versions later."
      />

      <div className="space-y-6">
        {templates.map((template) => (
          <Card key={template.id} className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                  {template.area}
                </p>
                <h2
                  className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
                  style={{ letterSpacing: "var(--tracking-display)" }}
                >
                  {template.title}
                </h2>
                <p className="max-w-3xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                  {template.description ?? "No template description added yet."}
                </p>
              </div>
              {template.activeVersion ? (
                <div className="flex flex-wrap items-center gap-2">
                  <AdminStatusBadge status={template.activeVersion.status} />
                  <AdminStatusBadge
                    status={`V${template.activeVersion.version}`}
                  />
                </div>
              ) : null}
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)]">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                    Version History
                  </p>
                  <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                    Promote only versions that are ready for staff review and
                    controlled rollout.
                  </p>
                </div>

                <div className="space-y-3">
                  {template.versions.map((version) => (
                    <div
                      key={version.id}
                      className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] px-4 py-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
                            {version.label}
                          </p>
                          <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                            v{version.version}
                            {version.model ? ` • ${version.model}` : ""}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <AdminStatusBadge status={version.status} />
                          {template.activeVersionId === version.id ? (
                            <AdminStatusBadge status="CURRENT" />
                          ) : (
                            <form action={activatePromptVersionAction}>
                              <input
                                type="hidden"
                                name="templateId"
                                value={template.id}
                              />
                              <input
                                type="hidden"
                                name="versionId"
                                value={version.id}
                              />
                              <Button tone="secondary" size="sm" type="submit">
                                Activate
                              </Button>
                            </form>
                          )}
                        </div>
                      </div>
                      <p className="mt-3 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                        {version.releaseNotes ?? "No release notes added."}
                      </p>
                      <p className="mt-2 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                        Updated {formatAdminDateTime(version.updatedAt)}
                        {version.activatedAt
                          ? ` • Activated ${formatAdminDateTime(version.activatedAt)}`
                          : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <form action={createPromptVersionAction} className="space-y-4">
                <input type="hidden" name="templateId" value={template.id} />

                <div className="space-y-2">
                  <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                    Create Draft Version
                  </p>
                  <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                    Draft new prompt revisions here before any activation step.
                  </p>
                </div>

                <label className="block space-y-2">
                  <span className="text-[0.74rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                    Version label
                  </span>
                  <Input name="label" required placeholder="v2" />
                </label>

                <label className="block space-y-2">
                  <span className="text-[0.74rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                    Model hint
                  </span>
                  <Input
                    name="model"
                    placeholder={
                      template.activeVersion?.model ?? "curated-template"
                    }
                    defaultValue={template.activeVersion?.model ?? ""}
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-[0.74rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                    System prompt
                  </span>
                  <Textarea
                    name="systemPrompt"
                    rows={10}
                    required
                    defaultValue={template.activeVersion?.systemPrompt ?? ""}
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-[0.74rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                    User prompt scaffold
                  </span>
                  <Textarea
                    name="userPrompt"
                    rows={8}
                    required
                    defaultValue={template.activeVersion?.userPrompt ?? ""}
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-[0.74rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                    Release notes
                  </span>
                  <Textarea
                    name="releaseNotes"
                    rows={4}
                    defaultValue=""
                    placeholder="Summarize tone shifts, guardrail adjustments, or formatting changes."
                  />
                </label>

                <Button size="sm" type="submit">
                  Create Draft Version
                </Button>
              </form>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
