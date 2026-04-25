"use client";

import { useMemo, useState, type FormEvent } from "react";
import { trackEvent } from "@/lib/analytics/track-event";
import {
  calculateNumerologyContext,
  type NumerologyContextOutput,
} from "@/modules/numerology";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type NumerologyFormState = {
  dateOfBirth: string;
  fullName: string;
};

const initialFormState: NumerologyFormState = {
  dateOfBirth: "",
  fullName: "",
};

function getNumberLabel(label: string, isMasterNumber: boolean) {
  return isMasterNumber ? `${label} (Master Number)` : label;
}

function toSentenceCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function InsightList({
  title,
  items,
}: Readonly<{
  title: string;
  items: readonly string[];
}>) {
  return (
    <Card tone="light" className="space-y-3 border-[rgba(184,137,67,0.22)]">
      <p className="text-[0.7rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
        {title}
      </p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={`${title}-${item}`}
            className="rounded-[var(--radius-md)] border border-[rgba(184,137,67,0.16)] bg-[rgba(255,255,255,0.88)] px-3 py-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]"
          >
            {toSentenceCase(item)}
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function NumerologyToolPanel() {
  const [formState, setFormState] = useState<NumerologyFormState>(initialFormState);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<NumerologyContextOutput | null>(null);

  const hasResult = Boolean(result);
  const coreNumbersDisplay = useMemo(
    () => (result ? result.coreNumbers.join(" | ") : ""),
    [result]
  );
  const compoundNumbersDisplay = useMemo(
    () => (result ? result.compoundNumbers.values.join(" | ") : ""),
    [result]
  );

  function handleInputChange(field: keyof NumerologyFormState, value: string) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetCalculator() {
    setFormState(initialFormState);
    setErrorMessage(null);
    setResult(null);
    trackEvent("cta_click", {
      page: "/numerology",
      feature: "numerology-reset",
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedNameInput = formState.fullName.trim();

    const calculation = calculateNumerologyContext({
      dateOfBirth: formState.dateOfBirth,
      fullName: normalizedNameInput ? formState.fullName : null,
    });

    if (!calculation.success) {
      setErrorMessage(calculation.error.message);
      setResult(null);
      trackEvent("cta_click", {
        page: "/numerology",
        feature: "numerology-calculate-error",
        code: calculation.error.code,
      });
      return;
    }

    setErrorMessage(null);
    setResult(calculation.data);

    trackEvent("cta_click", {
      page: "/numerology",
      feature: "numerology-calculate-success",
      includes_name_number: Boolean(calculation.data.nameNumber),
      dominant_number: calculation.data.premiumSummary.dominantNumber.number,
    });
  }

  return (
    <div className="space-y-6">
      <Card
        tone="light"
        className="space-y-4 border-[rgba(184,137,67,0.24)] bg-[rgba(255,255,255,0.95)]"
      >
        <div className="space-y-2">
          <Badge tone="trust">Numerology Input</Badge>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
            Enter date of birth to calculate Birth and Destiny numbers. Add name
            to include Name Number and richer interpretation layers.
          </p>
        </div>

        <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="numerology-dob"
                className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]"
              >
                Date of Birth
              </label>
              <Input
                id="numerology-dob"
                name="dateOfBirth"
                type="date"
                value={formState.dateOfBirth}
                onChange={(event) =>
                  handleInputChange("dateOfBirth", event.currentTarget.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="numerology-name"
                className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]"
              >
                Full Name (Optional)
              </label>
              <Input
                id="numerology-name"
                name="fullName"
                value={formState.fullName}
                onChange={(event) =>
                  handleInputChange("fullName", event.currentTarget.value)
                }
                placeholder="Enter name for name number"
              />
            </div>
          </div>

          {errorMessage ? (
            <p
              aria-live="polite"
              className="rounded-[var(--radius-lg)] border border-[rgba(188,104,104,0.34)] bg-[rgba(244,231,231,0.86)] px-4 py-3 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-strong)]"
            >
              {errorMessage}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button size="lg" type="submit" className="w-full sm:w-auto">
              Generate Numerology Profile
            </Button>
            <Button
              size="lg"
              type="button"
              tone="secondary"
              className="w-full sm:w-auto"
              onClick={resetCalculator}
            >
              Reset
            </Button>
          </div>
        </form>
      </Card>

      {hasResult && result ? (
        <div className="space-y-5">
          <Card
            tone="accent"
            className="space-y-5 border-[rgba(184,137,67,0.34)] bg-[linear-gradient(160deg,rgba(255,252,246,0.98)_0%,rgba(246,232,206,0.94)_58%,rgba(239,222,193,0.96)_100%)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge tone="accent">Premium Numerology Summary</Badge>
              <p className="rounded-[var(--radius-pill)] border border-[rgba(184,137,67,0.28)] bg-[rgba(255,255,255,0.86)] px-3 py-1 text-[0.7rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                Dominant Number: {result.premiumSummary.dominantNumber.number}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[var(--radius-lg)] border border-[rgba(184,137,67,0.22)] bg-[rgba(255,255,255,0.88)] p-4">
                <p className="text-[0.7rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                  Core Numbers
                </p>
                <p className="mt-2 text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
                  {coreNumbersDisplay}
                </p>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[rgba(184,137,67,0.22)] bg-[rgba(255,255,255,0.88)] p-4">
                <p className="text-[0.7rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                  Compound Numbers
                </p>
                <p className="mt-2 text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
                  {compoundNumbersDisplay}
                </p>
              </div>
            </div>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              Calculated from your provided date of birth
              {result.normalizedName ? " and name" : ""}. Output stays
              deterministic and ready for deeper AI/report integration.
            </p>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { ...result.birthNumber, keyLabel: "Birth / Psychic Number" },
              { ...result.destinyNumber, keyLabel: "Destiny / Life Path Number" },
              result.nameNumber
                ? { ...result.nameNumber, keyLabel: "Name Number" }
                : null,
            ]
              .filter(
                (insight): insight is NonNullable<typeof insight> => insight !== null
              )
              .map((insight) => (
                <Card
                  key={`${insight.label}-${insight.number}-${insight.keyLabel}`}
                  tone="light"
                  className="space-y-4 border-[rgba(184,137,67,0.24)]"
                >
                  <div className="space-y-2">
                    <Badge tone="trust">{insight.keyLabel}</Badge>
                    <p className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
                      {getNumberLabel(insight.label, insight.isMasterNumber)}
                    </p>
                    <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
                      Number {insight.number}
                    </p>
                  </div>
                  <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
                    {insight.aliases.join(" | ")}
                  </p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                        Primary Traits
                      </p>
                      <p className="mt-1 text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
                        {insight.primaryTraits.join(", ")}
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                        Relationship Style
                      </p>
                      <p className="mt-1 text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
                        {insight.relationshipTendencies[0]}
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                        Career Tendency
                      </p>
                      <p className="mt-1 text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
                        {insight.careerTendencies[0]}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
          </div>

          <Card tone="light" className="space-y-4 border-[rgba(184,137,67,0.24)]">
            <Badge tone="neutral">Interpretation Layers</Badge>
            <div className="grid gap-4 md:grid-cols-2">
              <InsightList
                title="Core Identity"
                items={result.interpretation.coreIdentity}
              />
              <InsightList
                title="Strengths"
                items={result.interpretation.strengths}
              />
              <InsightList
                title="Caution Areas"
                items={result.interpretation.cautionAreas}
              />
              <InsightList
                title="Relationship Tendencies"
                items={result.interpretation.relationshipTendencies}
              />
              <InsightList
                title="Career Tendencies"
                items={result.interpretation.careerTendencies}
              />
              <InsightList
                title="Financial Tendencies"
                items={result.interpretation.financialTendencies}
              />
            </div>
          </Card>

          <Card tone="light" className="space-y-4 border-[rgba(184,137,67,0.24)]">
            <Badge tone="accent">Premium Guidance Notes</Badge>
            <div className="grid gap-4 md:grid-cols-2">
              <InsightList
                title="Harmony Notes"
                items={result.premiumSummary.harmonyNotes}
              />
              <InsightList
                title="Growth Notes"
                items={result.premiumSummary.growthNotes}
              />
            </div>
          </Card>

          <Card
            tone="accent"
            className="grid gap-5 border-[rgba(184,137,67,0.3)] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
          >
            <div className="space-y-2">
              <Badge tone="accent">Next Step</Badge>
              <p className="text-[length:var(--font-size-body-md)] text-[var(--color-ink-strong)]">
                Continue with AI-assisted chart guidance for deeper personalization.
              </p>
              <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
                Numerology offers a structured layer. Kundli + NAVAGRAHA AI gives
                deeper chart-context interpretation.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <TrackedLink
                href="/ai?tool=numerology"
                eventName="premium_utility_cta_click"
                eventPayload={{
                  page: "/numerology",
                  feature: "numerology-result-ai",
                }}
                className={buttonStyles({
                  size: "sm",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Try NAVAGRAHA AI
              </TrackedLink>
              <TrackedLink
                href="/reports"
                eventName="premium_utility_cta_click"
                eventPayload={{
                  page: "/numerology",
                  feature: "numerology-result-reports",
                }}
                className={buttonStyles({
                  size: "sm",
                  tone: "secondary",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Get Free Report
              </TrackedLink>
              <TrackedLink
                href="/consultation"
                eventName="premium_utility_cta_click"
                eventPayload={{
                  page: "/numerology",
                  feature: "numerology-result-consultation",
                }}
                className={buttonStyles({
                  size: "sm",
                  tone: "secondary",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Book Consultation
              </TrackedLink>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
