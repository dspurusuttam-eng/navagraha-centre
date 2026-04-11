"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  initialPublicInquiryActionState,
  submitPublicInquiryLead,
} from "@/modules/consultations/inquiry-actions";

type PublicInquiryFormProps = {
  defaultInquiryType: string;
  defaultDesiredServiceSlug?: string | null;
  sourcePath: string;
};

const inquiryTypeOptions = [
  {
    value: "GENERAL_INQUIRY",
    label: "General inquiry",
  },
  {
    value: "CONSULTATION_READY",
    label: "Consultation ready",
  },
  {
    value: "COMPATIBILITY_FOCUSED",
    label: "Compatibility focused",
  },
  {
    value: "REMEDY_FOCUSED",
    label: "Remedy focused",
  },
  {
    value: "RETURNING_FOLLOW_UP",
    label: "Returning member / follow-up",
  },
] as const;

const desiredServiceOptions = [
  {
    value: "private-reading",
    label: "Private Reading",
  },
  {
    value: "compatibility-session",
    label: "Compatibility Session",
  },
  {
    value: "business-astrology-brief",
    label: "Business Astrology Brief",
  },
  {
    value: "remedy-guidance-session",
    label: "Remedy Guidance Session",
  },
  {
    value: "follow-up-clarity-session",
    label: "Follow-Up Clarity Session",
  },
] as const;

function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function PublicInquiryForm({
  defaultInquiryType,
  defaultDesiredServiceSlug,
  sourcePath,
}: Readonly<PublicInquiryFormProps>) {
  const [state, formAction, isPending] = useActionState(
    submitPublicInquiryLead,
    initialPublicInquiryActionState
  );

  return (
    <Card className="space-y-5">
      <div className="space-y-2">
        <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
          Lead Capture
        </p>
        <h2 className="text-[length:var(--font-size-body-lg)] font-medium text-[color:var(--color-foreground)]">
          Share your inquiry in one clear step
        </h2>
        <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
          This form records your inquiry securely so the team can review context
          and guide your next step without pressure.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="sourcePath" value={sourcePath} />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="inquiry-full-name"
              className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
            >
              Full Name
            </label>
            <Input
              id="inquiry-full-name"
              name="fullName"
              autoComplete="name"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="inquiry-email"
              className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
            >
              Email
            </label>
            <Input
              id="inquiry-email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="inquiry-phone"
              className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
            >
              Phone (optional)
            </label>
            <Input
              id="inquiry-phone"
              name="phone"
              autoComplete="tel"
              placeholder="+91"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="inquiry-timezone"
              className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
            >
              Timezone (optional)
            </label>
            <Input
              id="inquiry-timezone"
              name="timezone"
              placeholder="Asia/Kolkata"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="inquiry-type"
              className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
            >
              Inquiry Type
            </label>
            <Select
              id="inquiry-type"
              name="inquiryType"
              defaultValue={defaultInquiryType}
              required
            >
              {inquiryTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="desired-service"
              className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
            >
              Desired Service
            </label>
            <Select
              id="desired-service"
              name="desiredServiceSlug"
              defaultValue={defaultDesiredServiceSlug ?? ""}
            >
              <option value="">I would like guidance on the best format</option>
              {desiredServiceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label
              htmlFor="inquiry-message"
              className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
            >
              Inquiry Context
            </label>
            <Textarea
              id="inquiry-message"
              name="message"
              rows={5}
              placeholder="Share your context and what guidance you are looking for."
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
            {state.status === "success" && state.lifecycleStage ? (
              <span className="block pt-2 text-[color:var(--color-muted)]">
                Stage: {formatEnumLabel(state.lifecycleStage)} | Urgency:{" "}
                {formatEnumLabel(state.urgencyLevel ?? "STANDARD")}
              </span>
            ) : null}
          </p>
        ) : null}

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isPending}>
            {isPending ? "Submitting Inquiry..." : "Submit Inquiry"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
