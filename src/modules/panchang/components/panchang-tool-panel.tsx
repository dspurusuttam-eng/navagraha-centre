"use client";

import { useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { trackEvent } from "@/lib/analytics/track-event";
import { getApiErrorMessage } from "@/lib/api/http";
import type {
  CanonicalLocationDateTime,
  LocationSearchResult,
} from "@/lib/location-timezone/types";
import type { PanchangContextOutput } from "@/modules/panchang";
import { PREMIUM_PANCHANG_ADAPTER_VERSION } from "@/modules/panchang/premium/adapter-contract";
import type {
  ChoghadiyaInterval,
  HoraInterval,
  PremiumElementState,
  PremiumNakshatraState,
  PremiumPanchangSnapshot,
  PremiumTimedPeriod,
  PremiumTransition,
} from "@/modules/panchang/premium/types";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type PanchangFormState = {
  date: string;
  place: string;
};

type ManualLocationState = {
  displayName: string;
  country: string;
  countryCode: string;
  latitude: string;
  longitude: string;
  timezone: string;
};

type PanchangApiSuccessPayload = {
  data?: PanchangContextOutput;
  premium?: {
    adapterVersion?: string;
    data?: PremiumPanchangSnapshot;
  };
};

type PanchangResultState = {
  legacy: PanchangContextOutput;
  premium: PremiumPanchangSnapshot;
};

type PanchangTab = "panchang" | "hora" | "choghadiya" | "periods";

type LocationState =
  | "idle"
  | "searching"
  | "results"
  | "resolving"
  | "confirmed"
  | "manual"
  | "permission-requested"
  | "permission-denied"
  | "timeout"
  | "unavailable"
  | "error";

const tabs: Array<{ id: PanchangTab; label: string }> = [
  { id: "panchang", label: "Panchang" },
  { id: "hora", label: "Hora" },
  { id: "choghadiya", label: "Choghadiya" },
  { id: "periods", label: "Daily periods" },
];

const chipClass =
  "rounded-[var(--radius-pill)] border border-[rgba(184,137,67,0.2)] bg-white px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-trust-text)]";
const panelClass =
  "rounded-[1.15rem] border border-[rgba(184,137,67,0.2)] bg-white p-4 shadow-[0_14px_32px_rgba(17,24,39,0.045)]";
const controlClass =
  "min-h-10 rounded-[0.85rem] border border-[rgba(184,137,67,0.28)] bg-white px-3 text-[0.88rem] text-[var(--color-ink-strong)] outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.96),0_8px_18px_rgba(17,24,39,0.045)] focus-visible:ring-2 focus-visible:ring-[rgba(184,137,67,0.35)] focus-visible:ring-offset-2";

function getLocalTodayIso() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const initialFormState: PanchangFormState = {
  date: getLocalTodayIso(),
  place: "",
};

const initialManualState: ManualLocationState = {
  displayName: "",
  country: "",
  countryCode: "",
  latitude: "",
  longitude: "",
  timezone: "",
};

function formatIso(value: string | null | undefined, timezone: string) {
  if (!value) {
    return "Unavailable";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Unavailable";
  }

  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: timezone,
      timeZoneName: "short",
    }).format(parsed);
  } catch {
    return parsed.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }
}

function formatEvent(value: { local: string } | null) {
  return value?.local ?? "Unavailable";
}

function statusTone(status: PremiumPanchangSnapshot["status"]) {
  if (status === "ok") {
    return "accent" as const;
  }

  return "neutral" as const;
}

function getErrorMessage(payload: unknown, fallback: string) {
  return getApiErrorMessage(payload, fallback);
}

function toLocationSummary(resolved: CanonicalLocationDateTime) {
  return `${resolved.displayName} (${resolved.latitude.toFixed(5)}, ${resolved.longitude.toFixed(5)} - ${resolved.timezone})`;
}

function KpiCard({
  label,
  value,
  meta,
}: Readonly<{
  label: string;
  value: string;
  meta?: string;
}>) {
  return (
    <div className="min-w-0 rounded-[1rem] border border-[rgba(184,137,67,0.18)] bg-white px-4 py-3 shadow-[0_10px_24px_rgba(17,24,39,0.04)]">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-trust-text)]">
        {label}
      </p>
      <p className="mt-1 break-words text-[0.96rem] font-semibold leading-snug text-[var(--color-ink-strong)]">
        {value}
      </p>
      {meta ? (
        <p className="mt-1 break-words text-[0.76rem] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
          {meta}
        </p>
      ) : null}
    </div>
  );
}

function EmptyState({
  title,
  message,
}: Readonly<{
  title: string;
  message: string;
}>) {
  return (
    <Card tone="light" className="space-y-2 border-[rgba(184,137,67,0.2)] bg-white p-4 before:opacity-0">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-trust-text)]">
        {title}
      </p>
      <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
        {message}
      </p>
    </Card>
  );
}

function ElementCard({
  label,
  item,
  timezone,
}: Readonly<{
  label: string;
  item: PremiumElementState | PremiumNakshatraState | null;
  timezone: string;
}>) {
  if (!item) {
    return <KpiCard label={label} value="Unavailable" />;
  }

  return (
    <div className="min-w-0 rounded-[1rem] border border-[rgba(184,137,67,0.18)] bg-white p-4 shadow-[0_10px_24px_rgba(17,24,39,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-trust-text)]">
            {label}
          </p>
          <p className="mt-1 break-words text-[0.98rem] font-semibold leading-snug text-[var(--color-ink-strong)]">
            {item.name}
            {"pada" in item ? ` / Pada ${item.pada}` : ""}
          </p>
        </div>
        <span className={chipClass}>#{item.index}</span>
      </div>
      <div className="mt-3">
        <div className="h-2 overflow-hidden rounded-full bg-[rgba(184,137,67,0.12)]">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#C9A24B,#4CBB17)]"
            style={{ width: `${Math.min(100, Math.max(0, item.progressPercent))}%` }}
          />
        </div>
        <p className="mt-2 text-[0.76rem] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
          Progress {item.progressPercent.toFixed(2)}%. Next: {item.next.name}.
        </p>
        <p className="mt-1 text-[0.74rem] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
          Ends {formatIso(item.endUtc, timezone)}
        </p>
      </div>
    </div>
  );
}

function TransitionTimeline({
  transitions,
}: Readonly<{
  transitions: PremiumTransition[];
}>) {
  if (!transitions.length) {
    return (
      <EmptyState
        title="Transition timeline"
        message="Transition timeline is unavailable for this date and place."
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-[length:var(--font-size-title-xs)] font-semibold text-[var(--color-ink-strong)]">
          Complete transition timeline
        </h4>
        <span className={chipClass}>{transitions.length} transitions</span>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {transitions.map((transition) => (
          <div
            key={`${transition.element}-${transition.atUtc}-${transition.fromIndex}-${transition.toIndex}`}
            className="min-w-0 rounded-[1rem] border border-[rgba(184,137,67,0.16)] bg-white px-4 py-3"
          >
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-trust-text)]">
              {transition.element}
            </p>
            <p className="mt-1 break-words text-[0.9rem] font-semibold text-[var(--color-ink-strong)]">
              {transition.fromName} to {transition.toName}
            </p>
            <p className="mt-1 break-words text-[0.76rem] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              {transition.atLocal}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PeriodCard({
  label,
  period,
  extra,
}: Readonly<{
  label: string;
  period: PremiumTimedPeriod | null;
  extra?: string;
}>) {
  if (!period) {
    return <KpiCard label={label} value="Unavailable" meta="No timing window was fabricated." />;
  }

  return (
    <KpiCard
      label={label}
      value={`${period.startLocal} - ${period.endLocal}`}
      meta={extra ?? period.calculationReference}
    />
  );
}

function HoraCard({ hora }: Readonly<{ hora: HoraInterval }>) {
  return (
    <div className="min-w-0 rounded-[1rem] border border-[rgba(184,137,67,0.16)] bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-trust-text)]">
          Hora {hora.index}
        </p>
        <span className={chipClass}>{hora.half}</span>
      </div>
      <p className="mt-2 text-[0.92rem] font-semibold text-[var(--color-ink-strong)]">
        {hora.lord}
      </p>
      <p className="mt-1 break-words text-[0.76rem] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
        {hora.startLocal} - {hora.endLocal}
      </p>
    </div>
  );
}

function ChoghadiyaCard({ item }: Readonly<{ item: ChoghadiyaInterval }>) {
  return (
    <div className="min-w-0 rounded-[1rem] border border-[rgba(184,137,67,0.16)] bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-trust-text)]">
          {item.half} {item.index}
        </p>
        <span className={chipClass}>{item.classification.replace(/_/g, " ")}</span>
      </div>
      <p className="mt-2 text-[0.92rem] font-semibold text-[var(--color-ink-strong)]">
        {item.name}
      </p>
      <p className="mt-1 break-words text-[0.76rem] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
        {item.startLocal} - {item.endLocal}
      </p>
    </div>
  );
}

function TechnicalDetails({
  premium,
}: Readonly<{
  premium: PremiumPanchangSnapshot;
}>) {
  return (
    <details className="rounded-[1rem] border border-[rgba(184,137,67,0.18)] bg-white px-4 py-3">
      <summary className="cursor-pointer rounded-[0.65rem] text-[0.74rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-trust-text)] outline-none focus-visible:ring-2 focus-visible:ring-[rgba(184,137,67,0.36)] focus-visible:ring-offset-2">
        Calculation Details
      </summary>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard label="Contract" value={premium.contractVersion} />
        <KpiCard label="Ayanamsa" value={premium.conventions.ayanamsa} />
        <KpiCard label="Day boundary" value={premium.conventions.dayBoundary} />
        <KpiCard label="Rise model" value={premium.conventions.riseModel} />
        <KpiCard label="Interval rule" value={premium.conventions.intervalRule} />
        <KpiCard
          label="Transition precision"
          value={`${premium.conventions.transitionPrecisionSeconds}s`}
        />
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className={panelClass}>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-trust-text)]">
            Source readiness
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {Object.entries(premium.sourceSystemReadiness).map(([key, value]) => (
              <KpiCard key={key} label={key} value={value} />
            ))}
          </div>
        </div>
        <div className={panelClass}>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-trust-text)]">
            References
          </p>
          <ul className="mt-3 space-y-2 text-[0.78rem] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
            {premium.calculationReferences.map((reference) => (
              <li key={reference} className="break-words">
                {reference}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {premium.unavailableReasons.length ? (
        <div className="mt-4 rounded-[1rem] border border-[rgba(184,137,67,0.16)] bg-[rgba(255,253,248,0.82)] px-4 py-3">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-trust-text)]">
            Unavailable layers
          </p>
          <ul className="mt-2 space-y-2 text-[0.78rem] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
            {premium.unavailableReasons.map((reason) => (
              <li key={`${reason.system}-${reason.code}`} className="break-words">
                {reason.system}: {reason.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </details>
  );
}

function PanchangPremiumResult({
  result,
  activeTab,
  setActiveTab,
}: Readonly<{
  result: PanchangResultState;
  activeTab: PanchangTab;
  setActiveTab: (tab: PanchangTab) => void;
}>) {
  const premium = result.premium;
  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      return;
    }

    event.preventDefault();

    const focusedIndex = tabs.findIndex(
      (tab) => `panchang-tab-${tab.id}` === event.currentTarget.id
    );
    const baseIndex = focusedIndex >= 0 ? focusedIndex : tabs.findIndex((tab) => tab.id === activeTab);
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? tabs.length - 1
          : event.key === "ArrowLeft"
            ? (baseIndex - 1 + tabs.length) % tabs.length
            : (baseIndex + 1) % tabs.length;
    const nextTab = tabs[nextIndex];

    if (!nextTab) {
      return;
    }

    setActiveTab(nextTab.id);
    requestAnimationFrame(() => {
      document.getElementById(`panchang-tab-${nextTab.id}`)?.focus();
    });
  }

  return (
    <div className="space-y-5">
      <Card tone="accent" className="space-y-5 border-[rgba(184,137,67,0.3)] before:opacity-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap gap-2">
              <Badge tone="accent">Premium Panchang</Badge>
              <Badge tone={statusTone(premium.status)}>{premium.status}</Badge>
            </div>
            <h3 className="break-words text-[length:var(--font-size-title-sm)] font-semibold text-[var(--color-ink-strong)]">
              {result.legacy.location.display_name}
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className={chipClass}>Date {premium.localDate}</span>
              <span className={chipClass}>Timezone {premium.timezone}</span>
              <span className={chipClass}>
                {premium.coordinates.latitude.toFixed(5)},{" "}
                {premium.coordinates.longitude.toFixed(5)}
              </span>
            </div>
          </div>
          <div className="min-w-0 rounded-[1rem] border border-[rgba(184,137,67,0.18)] bg-white px-4 py-3 text-right shadow-[0_10px_24px_rgba(17,24,39,0.04)]">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-trust-text)]">
              Query instant
            </p>
            <p className="mt-1 break-words text-[0.82rem] text-[var(--color-ink-body)]">
              {formatIso(premium.queryInstant, premium.timezone)}
            </p>
          </div>
        </div>

        {premium.status !== "ok" ? (
          <div className="rounded-[1rem] border border-[rgba(184,137,67,0.18)] bg-white px-4 py-3">
            <p className="text-[0.78rem] font-semibold text-[var(--color-ink-strong)]">
              Some premium timing layers are {premium.status}.
            </p>
            <p className="mt-1 text-[0.76rem] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              Missing sunrise, sunset, moon event, or transition data is left
              unavailable. No replacement times are fabricated.
            </p>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Vara" value={premium.vara?.name ?? "Unavailable"} />
          <KpiCard label="Paksha" value={premium.paksha ?? "Unavailable"} />
          <KpiCard label="Sunrise" value={formatEvent(premium.sunrise)} />
          <KpiCard label="Sunset" value={formatEvent(premium.sunset)} />
          <KpiCard label="Next sunrise" value={formatEvent(premium.nextSunrise)} />
          <KpiCard label="Moonrise" value={formatEvent(premium.moonrise)} />
          <KpiCard label="Moonset" value={formatEvent(premium.moonset)} />
          <KpiCard
            label="Panchang day"
            value={
              premium.panchangDay
                ? `${formatIso(premium.panchangDay.startUtc, premium.timezone)} to ${formatIso(
                    premium.panchangDay.endUtc,
                    premium.timezone
                  )}`
                : "Unavailable"
            }
          />
        </div>
      </Card>

      <div
        role="tablist"
        aria-label="Premium Panchang sections"
        className="grid gap-2 rounded-[1rem] border border-[rgba(184,137,67,0.16)] bg-white p-2 shadow-[0_12px_28px_rgba(17,24,39,0.04)] sm:grid-cols-4"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`panchang-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panchang-panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={handleTabKeyDown}
            className={`min-h-11 rounded-[0.85rem] px-3 py-2 text-center text-[0.78rem] font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-[rgba(184,137,67,0.36)] focus-visible:ring-offset-2 ${
              activeTab === tab.id
                ? "border border-[rgba(184,137,67,0.38)] bg-[rgba(244,212,101,0.18)] text-[var(--color-ink-strong)]"
                : "border border-transparent bg-white text-[var(--color-ink-body)] hover:border-[rgba(184,137,67,0.18)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section
        id={`panchang-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`panchang-tab-${activeTab}`}
        className="space-y-5"
      >
        {activeTab === "panchang" ? (
          <>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <ElementCard label="Tithi" item={premium.tithi} timezone={premium.timezone} />
              <ElementCard
                label="Nakshatra"
                item={premium.nakshatra}
                timezone={premium.timezone}
              />
              <ElementCard label="Yoga" item={premium.yoga} timezone={premium.timezone} />
              <ElementCard label="Karana" item={premium.karana} timezone={premium.timezone} />
            </div>
            <TransitionTimeline transitions={premium.transitions} />
          </>
        ) : null}

        {activeTab === "hora" ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-[length:var(--font-size-title-xs)] font-semibold text-[var(--color-ink-strong)]">
                24 Horas
              </h4>
              <span className={chipClass}>{premium.horas.length} available</span>
            </div>
            {premium.horas.length ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {premium.horas.map((hora) => (
                  <HoraCard key={`${hora.index}-${hora.startUtc}`} hora={hora} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Hora unavailable"
                message="Hora windows require valid sunrise, sunset, and next sunrise. None are fabricated."
              />
            )}
          </div>
        ) : null}

        {activeTab === "choghadiya" ? (
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-[length:var(--font-size-title-xs)] font-semibold text-[var(--color-ink-strong)]">
                  Day Choghadiya
                </h4>
                <span className={chipClass}>{premium.choghadiyaDay.length} available</span>
              </div>
              {premium.choghadiyaDay.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {premium.choghadiyaDay.map((item) => (
                    <ChoghadiyaCard key={`${item.half}-${item.index}-${item.startUtc}`} item={item} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Day Choghadiya unavailable"
                  message="Day Choghadiya is not shown without real day timing data."
                />
              )}
            </div>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-[length:var(--font-size-title-xs)] font-semibold text-[var(--color-ink-strong)]">
                  Night Choghadiya
                </h4>
                <span className={chipClass}>{premium.choghadiyaNight.length} available</span>
              </div>
              {premium.choghadiyaNight.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {premium.choghadiyaNight.map((item) => (
                    <ChoghadiyaCard key={`${item.half}-${item.index}-${item.startUtc}`} item={item} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Night Choghadiya unavailable"
                  message="Night Choghadiya is not shown without real night timing data."
                />
              )}
            </div>
          </div>
        ) : null}

        {activeTab === "periods" ? (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <PeriodCard label="Rahu Kaal" period={premium.rahuKaal} />
              <PeriodCard label="Yamaganda" period={premium.yamaganda} />
              <PeriodCard label="Gulika" period={premium.gulika} />
              <PeriodCard label="Abhijit" period={premium.abhijit} />
              <PeriodCard
                label="Brahma Muhurta"
                period={premium.brahmaMuhurta}
                extra={premium.brahmaMuhurta?.convention}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <KpiCard
                label="Moon events"
                value={premium.flags.moonEventsPartial ? "Partial" : "Complete when available"}
                meta="Moonrise and moonset are shown only when returned by the engine."
              />
              <KpiCard
                label="Night span"
                value={premium.flags.nightSpanUnavailable ? "Unavailable" : "Available"}
                meta="Night schedules depend on sunset and next sunrise."
              />
            </div>
          </div>
        ) : null}
      </section>

      <TechnicalDetails premium={premium} />

      <Card
        tone="accent"
        className="grid gap-5 border-[rgba(184,137,67,0.3)] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
      >
        <div className="space-y-2">
          <Badge tone="accent">Continue Journey</Badge>
          <p className="text-[length:var(--font-size-body-md)] text-[var(--color-ink-strong)]">
            Continue from daily Panchang into Kundli, Rashifal, and NAVAGRAHA Intelligence.
          </p>
          <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
            Panchang gives day structure. Chart and AI layers add deeper personal context.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <TrackedLink
            href="/kundli"
            eventName="cta_click"
            eventPayload={{
              page: "/panchang",
              feature: "panchang-result-kundli",
            }}
            className={buttonStyles({
              size: "sm",
              className: "w-full justify-center sm:w-auto",
            })}
          >
            Generate Your Kundli
          </TrackedLink>
          <TrackedLink
            href="/rashifal"
            eventName="cta_click"
            eventPayload={{
              page: "/panchang",
              feature: "panchang-result-rashifal",
            }}
            className={buttonStyles({
              size: "sm",
              tone: "secondary",
              className: "w-full justify-center sm:w-auto",
            })}
          >
            Check Rashifal
          </TrackedLink>
          <TrackedLink
            href="/ai"
            eventName="cta_click"
            eventPayload={{
              page: "/panchang",
              feature: "panchang-result-ai",
            }}
            className={buttonStyles({
              size: "sm",
              tone: "secondary",
              className: "w-full justify-center sm:w-auto",
            })}
          >
            Ask NI
          </TrackedLink>
        </div>
      </Card>
    </div>
  );
}

async function fetchPanchang(input: PanchangFormState) {
  const response = await fetch("/api/astrology/panchang", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      date: input.date,
      place: input.place,
      premium: {
        adapterVersion: PREMIUM_PANCHANG_ADAPTER_VERSION,
      },
    }),
  });
  const payload = (await response.json().catch(() => null)) as
    | PanchangApiSuccessPayload
    | null;

  if (!response.ok) {
    return {
      success: false as const,
      message: getApiErrorMessage(
        payload,
        "Panchang calculation failed. Please review inputs and retry."
      ),
    };
  }

  if (!payload?.data || !payload.premium?.data) {
    return {
      success: false as const,
      message:
        "Premium Panchang calculation returned an incomplete response. Please try again.",
    };
  }

  return {
    success: true as const,
    data: {
      legacy: payload.data,
      premium: payload.premium.data,
    },
  };
}

export function PanchangToolPanel() {
  const [formState, setFormState] = useState<PanchangFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<PanchangResultState | null>(null);
  const [activeTab, setActiveTab] = useState<PanchangTab>("panchang");
  const [locationState, setLocationState] = useState<LocationState>("idle");
  const [locationMessage, setLocationMessage] = useState(
    "Search a place, use current location, or open manual fallback."
  );
  const [locationResults, setLocationResults] = useState<LocationSearchResult[]>([]);
  const [confirmedLocation, setConfirmedLocation] =
    useState<CanonicalLocationDateTime | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [manual, setManual] = useState<ManualLocationState>(initialManualState);
  const submitSequenceRef = useRef(0);
  const locationSequenceRef = useRef(0);

  const locationBadge = useMemo(() => {
    switch (locationState) {
      case "confirmed":
        return "Location confirmed";
      case "searching":
        return "Searching";
      case "results":
        return "Select place";
      case "resolving":
        return "Resolving";
      case "permission-requested":
        return "Permission requested";
      case "permission-denied":
        return "Permission denied";
      case "timeout":
        return "Timeout";
      case "manual":
        return "Manual";
      case "error":
      case "unavailable":
        return "Needs attention";
      default:
        return "Location";
    }
  }, [locationState]);

  function clearResultForInputChange() {
    setResult(null);
    setErrorMessage(null);
    setActiveTab("panchang");
  }

  function handleInputChange(field: keyof PanchangFormState, value: string) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
    if (field === "place") {
      setConfirmedLocation(null);
      setLocationResults([]);
      setLocationState("idle");
      setLocationMessage("Place changed. Confirm or generate again for the new location.");
    }
    clearResultForInputChange();
  }

  function resetForm() {
    setFormState(initialFormState);
    setResult(null);
    setErrorMessage(null);
    setLocationResults([]);
    setConfirmedLocation(null);
    setLocationState("idle");
    setLocationMessage("Search a place, use current location, or open manual fallback.");
    setManual(initialManualState);
    setManualOpen(false);
    trackEvent("cta_click", {
      page: "/panchang",
      feature: "panchang-reset",
    });
  }

  function focusDateInput() {
    requestAnimationFrame(() => {
      const dateInput = document.getElementById(
        "panchang-date"
      ) as HTMLInputElement | null;
      dateInput?.focus();
    });
  }

  function applyTodayShortcut() {
    setFormState((current) => ({
      ...current,
      date: getLocalTodayIso(),
    }));
    clearResultForInputChange();
    trackEvent("cta_click", {
      page: "/panchang",
      feature: "panchang-today-shortcut",
    });
    focusDateInput();
  }

  function checkAnotherDate() {
    clearResultForInputChange();
    trackEvent("cta_click", {
      page: "/panchang",
      feature: "panchang-check-another-date",
    });
    focusDateInput();
  }

  async function postLocation(payload: Record<string, unknown>) {
    const response = await fetch("/api/platform/location-timezone", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json().catch(() => null)) as
      | {
          results?: LocationSearchResult[];
          resolved?: CanonicalLocationDateTime;
        }
      | null;

    if (!response.ok) {
      throw new Error(
        getErrorMessage(data, "Location and timezone resolution failed.")
      );
    }

    return data;
  }

  async function handleSearch() {
    const query = formState.place.trim();

    if (!query) {
      setLocationState("error");
      setLocationMessage("Enter city, region/state, and country before searching.");
      return;
    }

    const sequence = locationSequenceRef.current + 1;
    locationSequenceRef.current = sequence;
    setLocationState("searching");
    setLocationMessage("Searching matching places.");
    setLocationResults([]);
    setConfirmedLocation(null);
    clearResultForInputChange();

    try {
      const payload = await postLocation({ mode: "search", query });

      if (locationSequenceRef.current !== sequence) {
        return;
      }

      const nextResults = payload?.results ?? [];
      setLocationResults(nextResults);
      setLocationState(nextResults.length ? "results" : "error");
      setLocationMessage(
        nextResults.length
          ? "Select the correct place before generating Panchang."
          : "No matching place was found. Try adding state and country."
      );
    } catch (error) {
      if (locationSequenceRef.current !== sequence) {
        return;
      }

      setLocationState("error");
      setLocationMessage(error instanceof Error ? error.message : "Place search failed.");
    }
  }

  async function resolvePlace(place: LocationSearchResult) {
    const sequence = locationSequenceRef.current + 1;
    locationSequenceRef.current = sequence;
    setLocationState("resolving");
    setLocationMessage("Resolving timezone for selected place.");
    clearResultForInputChange();

    try {
      const payload = await postLocation({
        mode: "resolve",
        source: "search",
        dateLocal: formState.date,
        timeLocal: "12:00",
        place,
      });

      if (locationSequenceRef.current !== sequence) {
        return;
      }

      if (!payload?.resolved) {
        throw new Error("Selected place returned no resolved location.");
      }

      setConfirmedLocation(payload.resolved);
      setFormState((current) => ({
        ...current,
        place: payload.resolved?.displayName ?? place.displayName,
      }));
      setLocationResults([]);
      setLocationState("confirmed");
      setLocationMessage(toLocationSummary(payload.resolved));
    } catch (error) {
      if (locationSequenceRef.current !== sequence) {
        return;
      }

      setLocationState("error");
      setLocationMessage(
        error instanceof Error ? error.message : "Place resolution failed."
      );
    }
  }

  async function handleUseCurrentLocation() {
    if (!("geolocation" in navigator)) {
      setLocationState("unavailable");
      setLocationMessage("Browser location is unavailable. Use search or manual entry.");
      return;
    }

    setLocationState("permission-requested");
    setLocationMessage("The browser may ask for one-time location permission.");
    clearResultForInputChange();

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const sequence = locationSequenceRef.current + 1;
        locationSequenceRef.current = sequence;
        setLocationState("resolving");
        setLocationMessage("Coordinates received. Resolving readable place and timezone.");

        try {
          const payload = await postLocation({
            mode: "resolve",
            source: "browser",
            dateLocal: formState.date,
            timeLocal: "12:00",
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracyMeters: Number.isFinite(position.coords.accuracy)
              ? position.coords.accuracy
              : null,
          });

          if (locationSequenceRef.current !== sequence) {
            return;
          }

          if (!payload?.resolved) {
            throw new Error("Current location returned no resolved place.");
          }

          setConfirmedLocation(payload.resolved);
          setFormState((current) => ({
            ...current,
            place: payload.resolved?.displayName ?? current.place,
          }));
          setLocationResults([]);
          setLocationState("confirmed");
          setLocationMessage(toLocationSummary(payload.resolved));
        } catch (error) {
          if (locationSequenceRef.current !== sequence) {
            return;
          }

          setLocationState("error");
          setLocationMessage(
            error instanceof Error
              ? error.message
              : "Current location resolution failed."
          );
        }
      },
      (error) => {
        setLocationState(
          error.code === error.PERMISSION_DENIED
            ? "permission-denied"
            : error.code === error.TIMEOUT
              ? "timeout"
              : "unavailable"
        );
        setLocationMessage(
          error.code === error.PERMISSION_DENIED
            ? "Location permission was denied. Search and manual entry still work."
            : error.code === error.TIMEOUT
              ? "Location detection timed out. Search and manual entry still work."
              : "Location detection is unavailable. Search and manual entry still work."
        );
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 8_000,
      }
    );
  }

  async function handleManualConfirm() {
    const sequence = locationSequenceRef.current + 1;
    locationSequenceRef.current = sequence;
    setLocationState("manual");
    setLocationMessage("Validating manual coordinates and timezone.");
    clearResultForInputChange();

    try {
      const payload = await postLocation({
        mode: "resolve",
        source: "manual",
        dateLocal: formState.date,
        timeLocal: "12:00",
        displayName: manual.displayName,
        country: manual.country,
        countryCode: manual.countryCode,
        latitude: manual.latitude,
        longitude: manual.longitude,
        timezone: manual.timezone,
      });

      if (locationSequenceRef.current !== sequence) {
        return;
      }

      if (!payload?.resolved) {
        throw new Error("Manual entry returned no resolved location.");
      }

      setConfirmedLocation(payload.resolved);
      setFormState((current) => ({
        ...current,
        place: payload.resolved?.displayName ?? manual.displayName,
      }));
      setLocationResults([]);
      setLocationState("confirmed");
      setLocationMessage(toLocationSummary(payload.resolved));
    } catch (error) {
      if (locationSequenceRef.current !== sequence) {
        return;
      }

      setLocationState("error");
      setLocationMessage(error instanceof Error ? error.message : "Manual validation failed.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const date = formState.date.trim();
    const place = formState.place.trim();

    if (!date || !place) {
      setResult(null);
      setErrorMessage("Date and place are required before generating Panchang.");
      return;
    }

    const sequence = submitSequenceRef.current + 1;
    submitSequenceRef.current = sequence;
    setIsSubmitting(true);
    setErrorMessage(null);
    setResult(null);
    setActiveTab("panchang");

    const outcome = await fetchPanchang({
      date,
      place,
    }).catch(() => ({
      success: false as const,
      message: "Panchang request failed unexpectedly. Please try again.",
    }));

    if (submitSequenceRef.current !== sequence) {
      return;
    }

    setIsSubmitting(false);

    if (!outcome.success) {
      setResult(null);
      setErrorMessage(outcome.message);
      trackEvent("cta_click", {
        page: "/panchang",
        feature: "panchang-calculate-error",
      });
      return;
    }

    setResult(outcome.data);
    trackEvent("cta_click", {
      page: "/panchang",
      feature: "panchang-calculate-success",
      tithi: outcome.data.premium.tithi?.name ?? "unavailable",
      nakshatra: outcome.data.premium.nakshatra?.name ?? "unavailable",
      status: outcome.data.premium.status,
    });
    trackEvent("panchang_view", {
      page: "/panchang",
      feature: "panchang-tool-result",
      asOfDate: outcome.data.premium.localDate,
      timezone: outcome.data.premium.timezone,
      status: outcome.data.premium.status,
    });
  }

  return (
    <div className="utility-page-flow min-w-0 space-y-6">
      <Card tone="light" className="utility-form-card space-y-5 before:opacity-0">
        <div className="space-y-2">
          <Badge tone="trust">Panchang Input</Badge>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
            Enter date and place, or confirm a location. The existing Panchang
            route resolves timezone and coordinates before returning the premium
            Panchang snapshot.
          </p>
        </div>

        <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label
                    htmlFor="panchang-date"
                    className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]"
                  >
                    Date
                  </label>
                  <Button
                    type="button"
                    tone="tertiary"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={applyTodayShortcut}
                  >
                    Today
                  </Button>
                </div>
                <Input
                  id="panchang-date"
                  name="date"
                  type="date"
                  value={formState.date}
                  onChange={(event) =>
                    handleInputChange("date", event.currentTarget.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="panchang-place"
                  className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]"
                >
                  Place
                </label>
                <Input
                  id="panchang-place"
                  name="place"
                  value={formState.place}
                  onChange={(event) =>
                    handleInputChange("place", event.currentTarget.value)
                  }
                  placeholder="City, Region/State, Country"
                  required
                />
                <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
                  Timezone is resolved from place for location-accurate timing.
                </p>
              </div>
            </div>

            <div className="space-y-3 rounded-[1.1rem] border border-[rgba(184,137,67,0.18)] bg-white p-4 shadow-[0_12px_28px_rgba(17,24,39,0.04)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-trust-text)]">
                    Location support
                  </p>
                  <p className="mt-1 break-words text-[0.82rem] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                    {locationMessage}
                  </p>
                </div>
                <span className={chipClass}>{locationBadge}</span>
              </div>

              {confirmedLocation ? (
                <div className="rounded-[0.95rem] border border-[rgba(76,187,23,0.22)] bg-white px-3 py-2 text-[0.78rem] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                  <p className="font-semibold text-[#2f7e16]">Confirmed</p>
                  <p className="break-words">{toLocationSummary(confirmedLocation)}</p>
                </div>
              ) : null}

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button type="button" tone="secondary" size="sm" onClick={handleSearch}>
                  Search place
                </Button>
                <Button
                  type="button"
                  tone="secondary"
                  size="sm"
                  onClick={handleUseCurrentLocation}
                >
                  Use current location
                </Button>
                <Button
                  type="button"
                  tone="tertiary"
                  size="sm"
                  onClick={() => {
                    setManualOpen((current) => !current);
                    setLocationState("manual");
                    setLocationMessage(
                      "Manual fallback validates latitude, longitude, and timezone before generation."
                    );
                  }}
                >
                  Manual fallback
                </Button>
              </div>

              {locationResults.length ? (
                <div className="grid gap-2">
                  {locationResults.slice(0, 5).map((place) => (
                    <button
                      key={place.id}
                      type="button"
                      onClick={() => void resolvePlace(place)}
                      className="min-w-0 rounded-[0.95rem] border border-[rgba(184,137,67,0.18)] bg-white px-3 py-2 text-left shadow-[0_8px_18px_rgba(17,24,39,0.035)] outline-none focus-visible:ring-2 focus-visible:ring-[rgba(184,137,67,0.36)] focus-visible:ring-offset-2"
                    >
                      <span className="block break-words text-[0.84rem] font-semibold text-[var(--color-ink-strong)]">
                        {place.displayName}
                      </span>
                      <span className="mt-1 block break-words text-[0.72rem] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                        {place.timezone ?? "Timezone by coordinates"} -{" "}
                        {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}

              {manualOpen ? (
                <div className="grid gap-2 rounded-[0.95rem] border border-[rgba(184,137,67,0.16)] bg-[rgba(255,253,248,0.72)] p-3 sm:grid-cols-2">
                  <input
                    className={controlClass}
                    placeholder="Display place"
                    value={manual.displayName}
                    onChange={(event) =>
                      setManual((current) => ({
                        ...current,
                        displayName: event.currentTarget.value,
                      }))
                    }
                  />
                  <input
                    className={controlClass}
                    placeholder="Country"
                    value={manual.country}
                    onChange={(event) =>
                      setManual((current) => ({
                        ...current,
                        country: event.currentTarget.value,
                      }))
                    }
                  />
                  <input
                    className={controlClass}
                    placeholder="Latitude"
                    value={manual.latitude}
                    onChange={(event) =>
                      setManual((current) => ({
                        ...current,
                        latitude: event.currentTarget.value,
                      }))
                    }
                  />
                  <input
                    className={controlClass}
                    placeholder="Longitude"
                    value={manual.longitude}
                    onChange={(event) =>
                      setManual((current) => ({
                        ...current,
                        longitude: event.currentTarget.value,
                      }))
                    }
                  />
                  <input
                    className={controlClass}
                    placeholder="IANA timezone"
                    value={manual.timezone}
                    onChange={(event) =>
                      setManual((current) => ({
                        ...current,
                        timezone: event.currentTarget.value,
                      }))
                    }
                  />
                  <input
                    className={controlClass}
                    placeholder="Country code"
                    value={manual.countryCode}
                    onChange={(event) =>
                      setManual((current) => ({
                        ...current,
                        countryCode: event.currentTarget.value,
                      }))
                    }
                  />
                  <Button
                    type="button"
                    tone="secondary"
                    size="sm"
                    className="sm:col-span-2"
                    onClick={handleManualConfirm}
                  >
                    Confirm manual place
                  </Button>
                </div>
              ) : null}
            </div>
          </div>

          {errorMessage ? (
            <p
              aria-live="polite"
              className="utility-error rounded-[var(--radius-lg)] border px-4 py-3 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)]"
            >
              {errorMessage}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button
              size="lg"
              type="submit"
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Calculating..." : "Generate Premium Panchang"}
            </Button>
            {result ? (
              <Button
                size="lg"
                type="button"
                tone="secondary"
                className="w-full sm:w-auto"
                onClick={checkAnotherDate}
              >
                Check Another Date
              </Button>
            ) : null}
            <Button
              size="lg"
              type="button"
              tone="secondary"
              className="w-full sm:w-auto"
              onClick={resetForm}
            >
              Reset
            </Button>
          </div>
        </form>
      </Card>

      {isSubmitting ? (
        <EmptyState
          title="Calculating"
          message="Resolving the existing Panchang route, premium adapter, Hora, Choghadiya, and daily periods."
        />
      ) : null}

      {!result && !isSubmitting ? (
        <EmptyState
          title="Result"
          message="Premium Panchang, Hora, Choghadiya, and daily periods will appear after generation."
        />
      ) : null}

      {result ? (
        <PanchangPremiumResult
          result={result}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      ) : null}
    </div>
  );
}
