import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { AshtakavargaResult } from "@/modules/astrology/ashtakavarga";

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

function formatBody(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function formatRashi(signIndex: number) {
  return rashiLabels[signIndex] ?? `Rashi ${signIndex + 1}`;
}

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

function FactLine({
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

export function AshtakavargaCard({
  result,
}: Readonly<{
  result: AshtakavargaResult | null;
}>) {
  const isReady = result?.success === true;
  const snapshot = isReady ? result.data : null;
  const errorMessage =
    result && !result.success
      ? result.error.message
      : "Ashtakavarga appears after a verified saved chart is available.";

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
            Ashtakavarga
          </p>
          <h2 className="break-words text-[length:var(--font-size-title-sm)] text-[#111111]">
            BAV / SAV snapshot
          </h2>
        </div>
        <Badge tone={isReady ? "accent" : "neutral"}>
          {isReady ? "Ready" : "Unavailable"}
        </Badge>
      </div>

      {!snapshot ? (
        <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-4">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
            Calculation unavailable
          </p>
          <p className="mt-2 break-words text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
            {errorMessage}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-3">
            <FactLine
              label="Sarvashtakavarga"
              value={`${snapshot.sav.total} total bindus across 12 houses`}
            />
            <FactLine
              label="Reference chart"
              value={`${snapshot.ayanamsa} ayanamsha; Lagna as reference`}
            />
            <FactLine
              label="Last chart moment"
              value={formatDateTime(snapshot.referenceChartUtc)}
            />
          </div>

          <div className="space-y-3 rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-4">
            <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
              SAV by house
            </p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {snapshot.sav.byHouse.map((entry) => (
                <div
                  key={`${entry.house}-${entry.sign}`}
                  className="min-w-0 rounded-[var(--radius-lg)] border border-[#EFE6D0] bg-[#FFFDF8] px-3 py-2"
                >
                  <p className="text-[0.62rem] uppercase tracking-[0.12em] text-[#C89B2C]">
                    H{entry.house}
                  </p>
                  <p className="mt-1 truncate text-[0.78rem] text-[#4A4A4A]">
                    {formatRashi(entry.sign)}
                  </p>
                  <p className="mt-1 text-[1rem] font-semibold text-[#111111]">
                    {entry.bindus}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-4">
            <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
              BAV planet totals
            </p>
            <div className="flex flex-wrap gap-2">
              {snapshot.bav.map((entry) => (
                <span
                  key={entry.planet}
                  className="rounded-[var(--radius-pill)] border border-[#EFE6D0] bg-[#FFFDF8] px-3 py-2 text-[0.76rem] text-[#111111]"
                >
                  {formatBody(entry.planet)} {entry.total}
                </span>
              ))}
            </div>
          </div>

          <p className="break-words text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
            Nodes and reduction layers are not included in this MVP calculation view.
            Checksum: {snapshot.flags.checksumsVerified ? "verified" : "not verified"}.
          </p>
        </>
      )}
    </Card>
  );
}
