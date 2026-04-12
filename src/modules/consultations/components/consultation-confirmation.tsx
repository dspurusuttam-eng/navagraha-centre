import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import {
  consultationHost,
  formatDateTimeInTimeZone,
  formatDualTimeZoneSlot,
} from "@/modules/consultations";
import type { ConsultationDetail } from "@/modules/consultations/service";
import { OfferRecommendationPanel } from "@/modules/offers/components/offer-recommendation-panel";
import type { OfferRecommendationResult } from "@/modules/offers/types";
import type { PostConsultationRetentionSnapshot } from "@/modules/consultations/retention";
import { SubscriptionValuePanel } from "@/modules/subscriptions/components/subscription-value-panel";
import type { SubscriptionRetentionIntelligenceSnapshot } from "@/modules/subscriptions/types";

type ConsultationConfirmationProps = {
  consultation: ConsultationDetail;
  offers: OfferRecommendationResult;
  retentionSnapshot: PostConsultationRetentionSnapshot | null;
  subscriptionState: SubscriptionRetentionIntelligenceSnapshot;
};

export function ConsultationConfirmation({
  consultation,
  offers,
  retentionSnapshot,
  subscriptionState,
}: Readonly<ConsultationConfirmationProps>) {
  const dualTime =
    consultation.scheduledForUtc && consultation.scheduledEndUtc
      ? formatDualTimeZoneSlot(
          consultation.scheduledForUtc,
          consultation.scheduledEndUtc,
          consultation.clientTimezone ?? consultationHost.timezone
        )
      : null;

  return (
    <Section
      eyebrow="Booking Confirmation"
      title="Your consultation is now reserved."
      description="The protected confirmation keeps the package, time, intake context, and Joy Prakash Sarmah details in one place."
      tone="transparent"
      className="pt-0"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
        <Card tone="accent" className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="accent">{consultation.status}</Badge>
            <Badge tone="neutral">{consultation.confirmationCode}</Badge>
          </div>
          <div className="space-y-3">
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              {consultation.serviceLabel}
            </h2>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {consultation.packageDescription ??
                "The consultation has been recorded and reserved in the protected dashboard."}
            </p>
          </div>

          {dualTime ? (
            <div className="space-y-3">
              <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Your calendar
              </p>
              <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
                {dualTime.clientLabel}
              </p>
              <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                Joy&apos;s calendar: {dualTime.hostLabel}
              </p>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/consultations"
              className={buttonStyles({ size: "lg" })}
            >
              View All Consultations
            </Link>
            <Link
              href="/dashboard/consultations/book"
              className={buttonStyles({ tone: "secondary", size: "lg" })}
            >
              Book Another Session
            </Link>
          </div>
        </Card>

        <Card className="space-y-5">
          <div className="space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Confirmation Details
            </p>
            <h3
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              Clear and explicit scheduling.
            </h3>
          </div>
          <div className="space-y-3 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            <p>
              Astrologer:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {consultation.astrologerName}
              </span>
            </p>
            <p>
              Preferred language:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {consultation.preferredLanguage ?? "Not recorded"}
              </span>
            </p>
            <p>
              Birth profile:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {consultation.birthProfileLabel ?? "Not attached"}
              </span>
            </p>
            <p>
              Reserved on:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {formatDateTimeInTimeZone(
                  consultation.createdAtUtc,
                  consultationHost.timezone
                )}
              </span>
            </p>
          </div>
        </Card>
      </div>

      <Card className="mt-6 space-y-4">
        <div className="space-y-2">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Retention Timeline
          </p>
          <h3
            className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
            style={{ letterSpacing: "var(--tracking-display)" }}
          >
            Post-session checkpoints and next recommended action
          </h3>
        </div>

        {!retentionSnapshot ? (
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            Retention guidance is temporarily unavailable. This consultation
            confirmation remains valid and your account data is intact.
          </p>
        ) : retentionSnapshot.status === "pending-session" ? (
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            Structured post-session retention activates after at least one
            consultation is marked completed.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {retentionSnapshot.states.map((state) => (
                <div
                  key={state.key}
                  className="space-y-2 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] px-4 py-4 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]"
                >
                  <Badge
                    tone={
                      state.status === "ACTION_DUE"
                        ? "outline"
                        : state.status === "ACHIEVED"
                          ? "accent"
                          : "neutral"
                    }
                  >
                    {state.status === "ACTION_DUE"
                      ? "Action Due"
                      : state.status === "ACHIEVED"
                        ? "Achieved"
                        : "Not Ready"}
                  </Badge>
                  <p className="text-[color:var(--color-foreground)]">
                    {state.title}
                  </p>
                  <p>{state.summary}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] px-4 py-4 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Next Recommended Action
              </p>
              <p className="mt-2 text-[color:var(--color-foreground)]">
                {retentionSnapshot.nextRecommendedAction.title}
              </p>
              <p className="mt-2">
                {retentionSnapshot.nextRecommendedAction.description}
              </p>
              <p className="mt-2">{retentionSnapshot.nextRecommendedAction.rationale}</p>
              {retentionSnapshot.nextRecommendedAction.href ? (
                <Link
                  href={retentionSnapshot.nextRecommendedAction.href}
                  className={buttonStyles({ size: "sm" })}
                >
                  Open Recommended Action
                </Link>
              ) : null}
            </div>
          </div>
        )}
      </Card>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card className="space-y-4">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Topic Focus
          </p>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-foreground)]">
            {consultation.topicFocus ?? "No topic focus was provided."}
          </p>
        </Card>

        <Card className="space-y-4">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Intake Summary
          </p>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            {consultation.intakeSummary ??
              "No intake summary was provided for this consultation."}
          </p>
        </Card>
      </div>

      <div className="mt-6">
        <SubscriptionValuePanel
          snapshot={subscriptionState}
          eyebrow="Membership"
          title="Optional continuity beyond this session."
          description="Use membership only when ongoing timing and report continuity feels relevant to your consultation path."
        />
      </div>

      {consultation.status === "COMPLETED" ||
      offers.contextSummary.hasDueFollowUp ? (
        <div className="mt-6">
          <OfferRecommendationPanel
            eyebrow="Post-Session Offer"
            title="A calm next step after this consultation."
            description="When follow-up is useful, the next recommendation stays grounded in your existing consultation, chart, and retention context."
            recommendations={offers}
            variant="expanded"
          />
        </div>
      ) : null}
    </Section>
  );
}
