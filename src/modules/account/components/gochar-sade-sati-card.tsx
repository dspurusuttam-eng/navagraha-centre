import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type {
  CurrentCycleSummary,
  CurrentTransitPlanetSnapshot,
} from "@/lib/astrology/current-cycle";
import type { GocharResult, GocharTransitEntry } from "@/modules/astrology/gochar";

const rashiLabels = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not available";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Not available";
  }

  return parsed.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatBody(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function formatHouse(value: number) {
  const suffix =
    value === 1 ? "st" : value === 2 ? "nd" : value === 3 ? "rd" : "th";

  return `${value}${suffix} house`;
}

function formatRashi(value: number) {
  return rashiLabels[value] ?? `Rashi ${value + 1}`;
}

function formatPhase(value: string | null) {
  if (!value) {
    return "Not active";
  }

  return formatBody(value);
}

function formatTransitLine(transit: CurrentTransitPlanetSnapshot) {
  const retrograde = transit.retrograde ? " retrograde" : "";
  const nakshatra = transit.nakshatra ? `, ${transit.nakshatra}` : "";

  return `${formatBody(transit.body)}${retrograde} in ${transit.sign}, ${formatHouse(transit.house)}${nakshatra}.`;
}

function formatGocharTransitLine(transit: GocharTransitEntry) {
  const retrograde = transit.retrograde ? " retrograde" : "";
  const transitFlag =
    transit.transitResult === "benefic" ? "benefic transit flag" : "non-benefic transit flag";

  return `${formatBody(transit.graha)}${retrograde} in ${formatRashi(transit.rashi)}, ${formatHouse(transit.houseFromMoon)} from Moon and ${formatHouse(transit.houseFromLagna)} from Lagna; ${transitFlag}.`;
}

function TransitFact({
  label,
  value,
}: Readonly<{
  label: string;
  value: string;
}>) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-3">
      <p className="text-[0.66rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
        {label}
      </p>
      <p className="mt-1 break-words text-[0.92rem] leading-[var(--line-height-copy)] text-[#111111]">
        {value}
      </p>
    </div>
  );
}

export function GocharSadeSatiCard({
  currentCycle,
  gocharResult,
}: Readonly<{
  currentCycle: CurrentCycleSummary;
  gocharResult: GocharResult | null;
}>) {
  const isGocharReady = gocharResult?.success === true;
  const isTransitReady =
    currentCycle.status === "ready" && currentCycle.transitSnapshot.planets.length > 0;
  const isReady = isGocharReady || isTransitReady;
  const leadTransit = currentCycle.transitSnapshot.planets[0] ?? null;
  const saturnTransit =
    currentCycle.transitSnapshot.planets.find((transit) => transit.body === "SATURN") ??
    null;
  const importantTransits = currentCycle.transitSnapshot.planets.slice(0, 3);
  const importantGocharTransits = isGocharReady
    ? gocharResult.data.transits
        .filter((transit) => ["SATURN", "JUPITER", "RAHU"].includes(transit.graha))
        .slice(0, 3)
    : [];
  const calculatedAt =
    (isGocharReady ? gocharResult.data.queryInstant : null) ??
    currentCycle.transitSnapshot.asOfUtc ??
    currentCycle.generatedAtUtc ??
    null;
  const errorMessage =
    gocharResult?.success === false
      ? gocharResult.issue.message
      : currentCycle.unavailableReason;
  const leadGocharTransit = importantGocharTransits[0] ?? null;

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
            Gochar
          </p>
          <h2 className="break-words text-[length:var(--font-size-title-sm)] text-[#111111]">
            Transit snapshot
          </h2>
        </div>
        <Badge tone={isReady ? "accent" : "neutral"}>
          {isReady ? "Ready" : "Unavailable"}
        </Badge>
      </div>

      {!isReady ? (
        <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-4">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
            Calculation unavailable
          </p>
          <p className="mt-2 break-words text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
            {errorMessage ??
              "Gochar data will appear after a saved chart and transit snapshot are available."}
          </p>
        </div>
      ) : null}

      {isReady ? (
        <>
          <div className="grid gap-3">
            <TransitFact
              label="Current transit summary"
              value={
                leadGocharTransit
                  ? formatGocharTransitLine(leadGocharTransit)
                  : leadTransit
                    ? formatTransitLine(leadTransit)
                    : "Transit summary unavailable"
              }
            />
            <TransitFact
              label="Sade Sati status"
              value={
                isGocharReady
                  ? gocharResult.data.sadeSati.active
                    ? "Active"
                    : "Not active"
                  : "Not available in the current dashboard payload"
              }
            />
            <TransitFact
              label="Current phase"
              value={
                isGocharReady
                  ? formatPhase(gocharResult.data.sadeSati.phase)
                  : "Not available in the current dashboard payload"
              }
            />
            <TransitFact label="Last calculated" value={formatDateTime(calculatedAt)} />
          </div>

          {importantGocharTransits.length ? (
            <div className="space-y-3 rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-4">
              <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
                Important transit notes
              </p>
              <div className="space-y-3">
                {importantGocharTransits.map((transit) => (
                  <div key={`${transit.graha}-${transit.rashi}-${transit.houseFromMoon}`} className="space-y-1">
                    <p className="text-[length:var(--font-size-body-sm)] font-medium text-[#111111]">
                      {formatBody(transit.graha)}
                    </p>
                    <p className="break-words text-[length:var(--font-size-body-xs)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
                      {formatGocharTransitLine(transit)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3 rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-4">
              <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
                Important transit notes
              </p>
              <div className="space-y-3">
                {importantTransits.map((transit) => (
                  <div key={`${transit.body}-${transit.sign}-${transit.house}`} className="space-y-1">
                    <p className="text-[length:var(--font-size-body-sm)] font-medium text-[#111111]">
                      {formatBody(transit.body)}
                    </p>
                    <p className="break-words text-[length:var(--font-size-body-xs)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
                      {formatTransitLine(transit)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {saturnTransit ? (
            <p className="break-words text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
              Saturn transit reference: {formatTransitLine(saturnTransit)}
            </p>
          ) : null}
        </>
      ) : null}
    </Card>
  );
}
