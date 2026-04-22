import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import type { PostConsultationRetentionSnapshot } from "@/modules/consultations/retention";
import {
  formatConsultationCreatedLine,
  formatConsultationScheduleLine,
  type ConsultationListItem,
} from "@/modules/consultations/service";

type ConsultationDashboardListProps = {
  consultations: ConsultationListItem[];
  retentionSnapshot: PostConsultationRetentionSnapshot | null;
};

function getStatusTone(status: ConsultationListItem["status"]) {
  switch (status) {
    case "CONFIRMED":
      return "accent" as const;
    case "REQUESTED":
      return "outline" as const;
    default:
      return "neutral" as const;
  }
}

export function ConsultationDashboardList({
  consultations,
  retentionSnapshot,
}: Readonly<ConsultationDashboardListProps>) {
  const actionDueCount =
    retentionSnapshot?.states.filter((state) => state.status === "ACTION_DUE")
      .length ?? 0;

  if (!consultations.length) {
    return (
      <Section
        eyebrow="Consultations"
        title="No consultation has been booked yet."
        description="When you reserve a slot with Joy Prakash Sarmah, the confirmation and intake summary will appear here inside the private dashboard."
        tone="transparent"
        className="pt-0"
      >
        <Card className="space-y-5">
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            The booking flow is ready for package selection, slot reservation,
            intake, and timezone-aware confirmation.
          </p>
          <Link
            href="/dashboard/consultations/book"
            className={buttonStyles({ size: "lg" })}
          >
            Book Free Consultation
          </Link>
        </Card>
      </Section>
    );
  }

  return (
    <Section
      eyebrow="Consultations"
      title="Your consultation schedule with Joy Prakash Sarmah."
      description="Each booking keeps the package, timing, intake summary, and confirmation details together inside the protected member dashboard."
      tone="transparent"
      className="pt-0"
    >
      <Card className="space-y-4">
        <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
          Post-Consultation Guidance
        </p>

        {!retentionSnapshot ? (
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            Your consultation schedule is available. Follow-up guidance is
            temporarily unavailable and will return automatically.
          </p>
        ) : retentionSnapshot.status === "pending-session" ? (
          <div className="space-y-3">
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              Complete at least one consultation to unlock structured
              post-session guidance for report, remedy, and timing follow-up.
            </p>
            <Link
              href="/dashboard/consultations/book"
              className={buttonStyles({ size: "sm" })}
            >
              Book First Consultation
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <h2
                className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
                style={{ letterSpacing: "var(--tracking-display)" }}
              >
                {retentionSnapshot.nextRecommendedAction.title}
              </h2>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {retentionSnapshot.nextRecommendedAction.description}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                  Completed Session
                </p>
                <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                  {retentionSnapshot.consultation?.serviceLabel ?? "Not available"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                  Action-Due Signals
                </p>
                <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                  {actionDueCount}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                  Snapshot Updated
                </p>
                <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                  {new Date(retentionSnapshot.generatedAtUtc).toLocaleString(
                    "en-IN",
                    {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }
                  )}
                </p>
              </div>
            </div>

            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {retentionSnapshot.nextRecommendedAction.rationale}
            </p>

            {retentionSnapshot.nextRecommendedAction.href ? (
              <Link
                href={retentionSnapshot.nextRecommendedAction.href}
                className={buttonStyles({ size: "sm" })}
              >
                Open Recommended Step
              </Link>
            ) : null}
          </div>
        )}
      </Card>

      <div className="grid gap-4">
        {consultations.map((consultation) => (
          <Card key={consultation.id} className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge tone={getStatusTone(consultation.status)}>
                    {consultation.status}
                  </Badge>
                  <Badge tone="neutral">{consultation.confirmationCode}</Badge>
                </div>
                <h2
                  className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
                  style={{ letterSpacing: "var(--tracking-display)" }}
                >
                  {consultation.serviceLabel}
                </h2>
              </div>

              <Link
                href={`/dashboard/consultations/${consultation.id}`}
                className={buttonStyles({ tone: "secondary", size: "sm" })}
              >
                View Confirmation
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-1">
                <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                  Scheduled
                </p>
                <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                  {formatConsultationScheduleLine(
                    consultation.scheduledForUtc,
                    consultation.scheduledEndUtc,
                    consultation.clientTimezone
                  )}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                  Your Timezone
                </p>
                <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                  {consultation.clientTimezone ?? "Pending"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                  Birth Profile
                </p>
                <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                  {consultation.birthProfileLabel ?? "Not attached"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                  Created
                </p>
                <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                  {formatConsultationCreatedLine(consultation.createdAtUtc)}
                </p>
              </div>
            </div>

            {consultation.topicFocus ? (
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                Focus: {consultation.topicFocus}
              </p>
            ) : null}
          </Card>
        ))}
      </div>
    </Section>
  );
}
