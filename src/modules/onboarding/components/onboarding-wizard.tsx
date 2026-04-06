"use client";

import Link from "next/link";
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  completeBirthOnboarding,
  initialOnboardingActionState,
} from "@/modules/onboarding/actions";
import { preferredLanguageOptions } from "@/modules/onboarding/constants";
import { cn } from "@/lib/cn";

type OnboardingWizardProps = {
  defaults: {
    name: string;
    preferredLanguage: string;
    birthDate: string;
    birthTime: string;
    city: string;
    region: string;
    country: string;
    timezone: string;
  };
  status: {
    hasBirthProfile: boolean;
    hasChart: boolean;
    generatedAtUtc: string | null;
    providerKey: string | null;
    preferredLanguageLabel: string;
  };
};

const steps = [
  {
    id: "identity",
    eyebrow: "Step 1",
    title: "Identity and reading language",
    description:
      "Set the name and preferred reading language that should anchor the private member experience.",
    fields: ["name", "preferredLanguage"],
  },
  {
    id: "birth-moment",
    eyebrow: "Step 2",
    title: "Birth date, time, and timezone",
    description:
      "Capture the core birth moment with clean, deterministic inputs for the initial chart.",
    fields: ["birthDate", "birthTime", "timezone"],
  },
  {
    id: "birthplace",
    eyebrow: "Step 3",
    title: "Birthplace and final review",
    description:
      "Store the birthplace profile that will stay attached to the chart record and later consultation flows.",
    fields: ["city", "region", "country"],
  },
] as const;

export function OnboardingWizard({
  defaults,
  status,
}: Readonly<OnboardingWizardProps>) {
  const [stepIndex, setStepIndex] = useState(0);
  const [state, formAction, isPending] = useActionState(
    completeBirthOnboarding,
    initialOnboardingActionState
  );
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success" && state.redirectTo) {
      startTransition(() => {
        router.push(state.redirectTo!);
      });
    }
  }, [router, state.redirectTo, state.status]);

  function validateCurrentStep() {
    const form = formRef.current;

    if (!form) {
      return true;
    }

    return steps[stepIndex].fields.every((fieldName) => {
      const field = form.querySelector<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >(`[name="${fieldName}"]`);

      if (!field) {
        return true;
      }

      return field.reportValidity();
    });
  }

  function goToNextStep() {
    if (!validateCurrentStep()) {
      return;
    }

    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  }

  const step = steps[stepIndex];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(260px,0.7fr)]">
      <form ref={formRef} action={formAction} className="space-y-6">
        <Card className="space-y-6">
          <div className="space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              {step.eyebrow}
            </p>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              {step.title}
            </h2>
            <p className="max-w-2xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {step.description}
            </p>
          </div>

          <div className="space-y-6">
            <div
              className={cn("grid gap-5", step.id !== "identity" && "hidden")}
            >
              <div className="space-y-2">
                <label
                  htmlFor="onboarding-name"
                  className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
                >
                  Full Name
                </label>
                <Input
                  id="onboarding-name"
                  name="name"
                  defaultValue={defaults.name}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="onboarding-language"
                  className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
                >
                  Preferred Language
                </label>
                <Select
                  id="onboarding-language"
                  name="preferredLanguage"
                  defaultValue={defaults.preferredLanguage}
                  required
                >
                  {preferredLanguageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div
              className={cn(
                "grid gap-5 md:grid-cols-2",
                step.id !== "birth-moment" && "hidden"
              )}
            >
              <div className="space-y-2">
                <label
                  htmlFor="onboarding-birth-date"
                  className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
                >
                  Birth Date
                </label>
                <Input
                  id="onboarding-birth-date"
                  name="birthDate"
                  type="date"
                  defaultValue={defaults.birthDate}
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="onboarding-birth-time"
                  className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
                >
                  Birth Time
                </label>
                <Input
                  id="onboarding-birth-time"
                  name="birthTime"
                  type="time"
                  defaultValue={defaults.birthTime}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label
                  htmlFor="onboarding-timezone"
                  className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
                >
                  Timezone
                </label>
                <Input
                  id="onboarding-timezone"
                  name="timezone"
                  defaultValue={defaults.timezone}
                  placeholder="Asia/Kolkata"
                  required
                />
              </div>
            </div>

            <div
              className={cn(
                "grid gap-5 md:grid-cols-2",
                step.id !== "birthplace" && "hidden"
              )}
            >
              <div className="space-y-2">
                <label
                  htmlFor="onboarding-city"
                  className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
                >
                  Birth City
                </label>
                <Input
                  id="onboarding-city"
                  name="city"
                  defaultValue={defaults.city}
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="onboarding-region"
                  className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
                >
                  Region
                </label>
                <Input
                  id="onboarding-region"
                  name="region"
                  defaultValue={defaults.region}
                  placeholder="State or province"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label
                  htmlFor="onboarding-country"
                  className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
                >
                  Country
                </label>
                <Input
                  id="onboarding-country"
                  name="country"
                  defaultValue={defaults.country}
                  required
                />
              </div>
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
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                tone="ghost"
                disabled={stepIndex === 0 || isPending}
                onClick={() =>
                  setStepIndex((current) => Math.max(current - 1, 0))
                }
              >
                Back
              </Button>

              {stepIndex < steps.length - 1 ? (
                <Button
                  type="button"
                  tone="secondary"
                  disabled={isPending}
                  onClick={goToNextStep}
                >
                  Continue
                </Button>
              ) : (
                <Button type="submit" size="lg" disabled={isPending}>
                  {isPending
                    ? "Generating Chart..."
                    : "Save and Generate Chart"}
                </Button>
              )}
            </div>

            <Link
              href="/dashboard/chart"
              className="text-[0.74rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)] transition [transition-duration:var(--motion-duration-base)] hover:text-[color:var(--color-foreground)]"
            >
              View current chart overview
            </Link>
          </div>
        </Card>
      </form>

      <div className="space-y-6">
        <Card tone="accent" className="space-y-5">
          <div className="space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Current Status
            </p>
            <h3
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              A private chart foundation with calm structure.
            </h3>
          </div>

          <div className="space-y-4 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            <p>
              Preferred language:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {status.preferredLanguageLabel}
              </span>
            </p>
            <p>
              Birth profile:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {status.hasBirthProfile ? "Saved" : "Not added yet"}
              </span>
            </p>
            <p>
              Initial chart:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {status.hasChart ? "Ready" : "Pending"}
              </span>
            </p>
            <p>
              Provider:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {status.providerKey ?? "Will be selected after save"}
              </span>
            </p>
          </div>
        </Card>

        <Card className="space-y-4">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            What happens next
          </p>
          <div className="space-y-3 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            <p>
              The wizard stores a primary birth profile on your protected
              account.
            </p>
            <p>
              The initial chart is generated server-side and attached to your
              member record for later phases.
            </p>
            <p>
              After save, you will be taken directly to the chart overview page.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
