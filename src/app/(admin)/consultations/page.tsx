import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AdminPageIntro } from "@/modules/admin/components/admin-page-intro";
import { AdminStatusBadge } from "@/modules/admin/components/admin-status-badge";
import { updateConsultationAction } from "@/modules/admin/actions";
import { formatAdminDateTime } from "@/modules/admin/format";
import { buildAdminMetadata } from "@/modules/admin/metadata";
import { listAdminConsultations } from "@/modules/admin/service";
import { requireAdminSession } from "@/modules/auth/server";

const consultationStatusOptions = [
  "REQUESTED",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
] as const;

export const metadata = buildAdminMetadata({
  title: "Admin Consultations",
  description:
    "Manage consultation requests, notes, client context, and scheduling status inside the NAVAGRAHA CENTRE admin panel.",
  path: "/admin/consultations",
  keywords: ["consultation management", "booking operations", "admin queue"],
});

export default async function AdminConsultationsPage() {
  await requireAdminSession({
    allowedRoles: ["founder", "support"],
  });

  const consultations = await listAdminConsultations();

  return (
    <div className="space-y-6">
      <AdminPageIntro
        eyebrow="Consultations"
        title="Client intake and session movement stay visible without leaving the admin shell."
        description="This page focuses on practical coordination: who booked, what they requested, when the session is expected to happen, and which internal notes belong with the record."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Requested
          </p>
          <p className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--color-foreground)]">
            {consultations.filter((item) => item.status === "REQUESTED").length}
          </p>
        </Card>
        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Confirmed
          </p>
          <p className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--color-foreground)]">
            {consultations.filter((item) => item.status === "CONFIRMED").length}
          </p>
        </Card>
        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Completed
          </p>
          <p className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--color-foreground)]">
            {consultations.filter((item) => item.status === "COMPLETED").length}
          </p>
        </Card>
      </div>

      <div className="space-y-4">
        {consultations.map((consultation) => (
          <Card
            key={consultation.id}
            className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]"
          >
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                    {consultation.confirmationCode}
                  </p>
                  <h2
                    className="mt-2 font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
                    style={{ letterSpacing: "var(--tracking-display)" }}
                  >
                    {consultation.serviceLabel}
                  </h2>
                </div>
                <AdminStatusBadge status={consultation.status} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                  <p>
                    Client:{" "}
                    <span className="text-[color:var(--color-foreground)]">
                      {consultation.user.name}
                    </span>
                  </p>
                  <p>
                    Email:{" "}
                    <span className="text-[color:var(--color-foreground)]">
                      {consultation.user.email}
                    </span>
                  </p>
                  <p>
                    Language:{" "}
                    <span className="text-[color:var(--color-foreground)]">
                      {consultation.preferredLanguage ?? "Not set"}
                    </span>
                  </p>
                </div>

                <div className="space-y-2 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                  <p>
                    Scheduled:{" "}
                    <span className="text-[color:var(--color-foreground)]">
                      {consultation.scheduledFor
                        ? formatAdminDateTime(
                            consultation.scheduledFor,
                            consultation.clientTimezone ?? "Asia/Kolkata"
                          )
                        : consultation.slot
                          ? formatAdminDateTime(
                              consultation.slot.startsAt,
                              consultation.slot.timezone
                            )
                          : "Awaiting slot confirmation"}
                    </span>
                  </p>
                  <p>
                    Time zone:{" "}
                    <span className="text-[color:var(--color-foreground)]">
                      {consultation.clientTimezone ??
                        consultation.slot?.timezone ??
                        "Not set"}
                    </span>
                  </p>
                  <p>
                    Created:{" "}
                    <span className="text-[color:var(--color-foreground)]">
                      {formatAdminDateTime(consultation.createdAt)}
                    </span>
                  </p>
                </div>
              </div>

              <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] px-4 py-4 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                  Topic Focus
                </p>
                <p className="mt-2">
                  {consultation.topicFocus ??
                    "No topic focus has been added yet."}
                </p>
              </div>
            </div>

            <form action={updateConsultationAction} className="space-y-4">
              <input
                type="hidden"
                name="consultationId"
                value={consultation.id}
              />

              <label className="block space-y-2">
                <span className="text-[0.74rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                  Status
                </span>
                <Select name="status" defaultValue={consultation.status}>
                  {consultationStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
              </label>

              <label className="block space-y-2">
                <span className="text-[0.74rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                  Internal Notes
                </span>
                <Textarea
                  name="internalNotes"
                  rows={7}
                  defaultValue={consultation.internalNotes ?? ""}
                  placeholder="Add delivery notes, follow-up reminders, or preparation details."
                />
              </label>

              <Button size="sm" type="submit">
                Save Consultation
              </Button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
