"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/cn";
import {
  initialConsultationBookingActionState,
  submitConsultationBooking,
} from "@/modules/consultations/actions";
import { consultationHost } from "@/modules/consultations/catalog";
import {
  formatConsultationPackageMeta,
  formatConsultationSlotPreview,
  type ConsultationBookingData,
} from "@/modules/consultations/view";
import { preferredLanguageOptions } from "@/modules/onboarding/constants";

type ConsultationBookingFormProps = {
  data: ConsultationBookingData;
};

export function ConsultationBookingForm({
  data,
}: Readonly<ConsultationBookingFormProps>) {
  const [state, formAction, isPending] = useActionState(
    submitConsultationBooking,
    initialConsultationBookingActionState
  );
  const [selectedPackageSlug, setSelectedPackageSlug] = useState(
    data.defaults.selectedPackageSlug
  );
  const [selectedSlotId, setSelectedSlotId] = useState(data.slots[0]?.id ?? "");
  const [selectedTimezone, setSelectedTimezone] = useState(
    data.defaults.timezone
  );
  const router = useRouter();
  const selectedPackage =
    data.packages.find((item) => item.slug === selectedPackageSlug) ??
    data.packages[0];
  const hasSlots = data.slots.length > 0;

  useEffect(() => {
    const redirectTo = state.redirectTo;

    if (state.status === "success" && redirectTo) {
      startTransition(() => {
        router.push(redirectTo);
      });
    }
  }, [router, state.redirectTo, state.status]);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
      <form action={formAction} className="space-y-6">
        <Card className="space-y-6">
          <div className="space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Consultation Package
            </p>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              Choose the format that best fits the depth of the conversation.
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {data.packages.map((item) => {
              const isSelected = item.slug === selectedPackageSlug;

              return (
                <label
                  key={item.slug}
                  className={cn(
                    "flex cursor-pointer flex-col gap-4 rounded-[var(--radius-2xl)] border px-5 py-5 transition [transition-duration:var(--motion-duration-base)]",
                    isSelected
                      ? "border-[color:var(--color-accent)] bg-[rgba(215,187,131,0.08)]"
                      : "border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)]"
                  )}
                >
                  <input
                    type="radio"
                    name="packageSlug"
                    value={item.slug}
                    className="sr-only"
                    checked={isSelected}
                    onChange={() => setSelectedPackageSlug(item.slug)}
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge tone={isSelected ? "accent" : "neutral"}>
                      {item.durationLabel}
                    </Badge>
                    <Badge tone="outline">{item.priceLabel}</Badge>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[color:var(--color-foreground)]">
                      {item.title}
                    </h3>
                    <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                      {item.summary}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </Card>

        <Card className="space-y-6">
          <div className="space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Timezone And Slot
            </p>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              Keep the calendar explicit from the start.
            </h2>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="booking-client-timezone"
              className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
            >
              Your Timezone
            </label>
            <Select
              id="booking-client-timezone"
              name="clientTimezone"
              value={selectedTimezone}
              onChange={(event) => setSelectedTimezone(event.target.value)}
              required
            >
              {data.timezones.map((timezone) => (
                <option key={timezone} value={timezone}>
                  {timezone}
                </option>
              ))}
            </Select>
          </div>

          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            Every slot is stored in UTC, shown below in{" "}
            <span className="text-[color:var(--color-foreground)]">
              {selectedTimezone}
            </span>
            , and also anchored to Joy Prakash Sarmah&apos;s calendar in{" "}
            <span className="text-[color:var(--color-foreground)]">
              {consultationHost.timezone}
            </span>
            .
          </p>

          {hasSlots ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {data.slots.map((slot) => {
                const preview = formatConsultationSlotPreview(
                  slot.startsAtUtc,
                  slot.endsAtUtc,
                  selectedTimezone
                );
                const isSelected = slot.id === selectedSlotId;

                return (
                  <label
                    key={slot.id}
                    className={cn(
                      "flex cursor-pointer flex-col gap-3 rounded-[var(--radius-2xl)] border px-5 py-5 transition [transition-duration:var(--motion-duration-base)]",
                      isSelected
                        ? "border-[color:var(--color-accent)] bg-[rgba(215,187,131,0.08)]"
                        : "border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)]"
                    )}
                  >
                    <input
                      type="radio"
                      name="slotId"
                      value={slot.id}
                      className="sr-only"
                      checked={isSelected}
                      onChange={() => setSelectedSlotId(slot.id)}
                    />
                    <Badge tone={isSelected ? "accent" : "neutral"}>
                      Available Slot
                    </Badge>
                    <div className="space-y-2">
                      <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
                        {preview.clientLabel}
                      </p>
                      <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                        Joy&apos;s calendar: {preview.hostLabel}
                      </p>
                      {slot.note ? (
                        <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                          {slot.note}
                        </p>
                      ) : null}
                    </div>
                  </label>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[var(--radius-2xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-5 py-5">
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                Joy Prakash Sarmah&apos;s next consultation slots have not been
                opened yet. The flow is ready, but availability still needs to
                be seeded or managed from the admin side.
              </p>
            </div>
          )}
        </Card>

        <Card className="space-y-6">
          <div className="space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Intake
            </p>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              Enough context to prepare the consultation well.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="booking-preferred-language"
                className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
              >
                Preferred Language
              </label>
              <Select
                id="booking-preferred-language"
                name="preferredLanguage"
                defaultValue={data.defaults.preferredLanguage}
                required
              >
                {preferredLanguageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="booking-contact-phone"
                className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
              >
                Contact Phone
              </label>
              <Input
                id="booking-contact-phone"
                name="contactPhone"
                defaultValue={data.defaults.phone}
                autoComplete="tel"
                placeholder="+91"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="booking-birth-data"
                className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
              >
                Birth Profile
              </label>
              <Select
                id="booking-birth-data"
                name="birthDataId"
                defaultValue={data.defaults.selectedBirthDataId}
              >
                <option value="">Book without attaching a birth profile</option>
                {data.birthProfiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.label} - {profile.summary}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="booking-topic-focus"
                className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
              >
                Topic Focus
              </label>
              <Input
                id="booking-topic-focus"
                name="topicFocus"
                placeholder="For example: career transition, relationship clarity, remedy review"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="booking-intake-summary"
                className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
              >
                Intake Summary
              </label>
              <Textarea
                id="booking-intake-summary"
                name="intakeSummary"
                placeholder="Share the context Joy Prakash Sarmah should understand before the consultation."
                required
              />
            </div>
          </div>

          {state.message ? (
            <p
              aria-live="polite"
              className="rounded-[var(--radius-lg)] border px-4 py-3 text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]"
              style={{
                borderColor:
                  state.status === "error"
                    ? "rgba(205,143,143,0.35)"
                    : "rgba(215,187,131,0.25)",
                background:
                  state.status === "error"
                    ? "rgba(90,30,30,0.2)"
                    : "rgba(215,187,131,0.08)",
              }}
            >
              {state.message}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              Booking keeps the schedule explicit in both your timezone and Joy
              Prakash Sarmah&apos;s calendar timezone.
            </p>
            <Button type="submit" size="lg" disabled={isPending || !hasSlots}>
              {isPending ? "Reserving Slot..." : "Confirm Consultation"}
            </Button>
          </div>
        </Card>
      </form>

      <div className="space-y-6">
        <Card tone="accent" className="space-y-5">
          <div className="space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Booking Summary
            </p>
            <h3
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              {selectedPackage?.title ?? "Consultation"}
            </h3>
          </div>

          {selectedPackage ? (
            <div className="space-y-4 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              <p>{selectedPackage.summary}</p>
              <p className="text-[color:var(--color-foreground)]">
                {formatConsultationPackageMeta(selectedPackage)}
              </p>
              <div className="space-y-2">
                {selectedPackage.idealFor.map((item) => (
                  <p key={item}>- {item}</p>
                ))}
              </div>
            </div>
          ) : null}
        </Card>

        <Card className="space-y-4">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Account Context
          </p>
          <div className="space-y-3 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            <p>
              Name:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {data.user.name}
              </span>
            </p>
            <p>
              Email:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {data.user.email}
              </span>
            </p>
            <p>
              Available birth profiles:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {data.birthProfiles.length}
              </span>
            </p>
          </div>
        </Card>

        <Card className="space-y-4">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Before You Confirm
          </p>
          <div className="space-y-3 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            <p>
              This phase centers on a manual consultation workflow, not calendar
              sync or automated CRM follow-up.
            </p>
            <p>
              The intake should clarify context, but it should not be used to
              promise outcomes or make medical, legal, or financial claims.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
