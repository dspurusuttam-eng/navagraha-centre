import Link from "next/link";
import type { PlanetaryBody } from "@/modules/astrology/types";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import type { ChartOverview } from "@/modules/onboarding/service";

type ChartOverviewProps = {
  overview: ChartOverview;
};

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not generated yet";
  }

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatBody(body: PlanetaryBody) {
  return body.charAt(0) + body.slice(1).toLowerCase();
}

function formatSign(sign: string) {
  return sign.charAt(0) + sign.slice(1).toLowerCase();
}

function formatNakshatraLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function ChartOverviewPanel({ overview }: Readonly<ChartOverviewProps>) {
  if (!overview.birthProfile) {
    return (
      <Section
        eyebrow="Chart Overview"
        title="The private chart overview will appear here."
        description="Complete onboarding first so a primary birth profile and initial chart can be stored on the account."
        tone="transparent"
        className="pt-0"
      >
        <Card className="space-y-5">
          <div className="space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Empty State
            </p>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              No birth profile has been saved yet.
            </h2>
          </div>
          <p className="max-w-2xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            Save your primary birth details first. The onboarding flow will then
            generate the initial natal chart and attach it to the protected
            member record.
          </p>
          <Link
            href="/dashboard/onboarding"
            className={buttonStyles({ size: "lg" })}
          >
            Start Onboarding
          </Link>
        </Card>
      </Section>
    );
  }

  if (!overview.chart || !overview.chartRecord) {
    return (
      <Section
        eyebrow="Chart Overview"
        title="The birth profile is saved, but the first chart is not ready yet."
        description="Return to the onboarding flow to generate or refresh the initial natal chart."
        tone="transparent"
        className="pt-0"
      >
        <Card className="space-y-5">
          <div className="space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Pending State
            </p>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              Birth data is present. Chart generation still needs one clean
              pass.
            </h2>
          </div>
          <p className="max-w-2xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            The protected birth profile is already stored. Re-open the
            onboarding flow to generate the initial natal chart for this
            account.
          </p>
          <Link
            href="/dashboard/onboarding"
            className={buttonStyles({ size: "lg", tone: "secondary" })}
          >
            Generate Initial Chart
          </Link>
        </Card>
      </Section>
    );
  }

  const dominantBodies = overview.chart.summary.dominantBodies.map(formatBody);

  return (
    <Section
      eyebrow="Chart Overview"
      title="A structured first chart, ready inside the private dashboard."
      description="The initial natal chart is stored on the account with clear sections for the birth profile, core summary, planetary placements, houses, and aspects."
      tone="transparent"
      className="pt-0"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
        <Card tone="accent" className="space-y-5">
          <div className="space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Core Summary
            </p>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              {formatSign(overview.chart.ascendantSign)} rising with{" "}
              {dominantBodies.join(", ")} carrying the clearest emphasis.
            </h2>
          </div>

          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            {overview.chart.summary.narrative}
          </p>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-1">
              <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Ascendant
              </p>
              <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
                {formatSign(overview.chart.ascendantSign)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                House System
              </p>
              <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
                {overview.chart.houseSystem === "WHOLE_SIGN"
                  ? "Whole Sign"
                  : "Placidus"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Provider
              </p>
              <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
                {overview.chartRecord.providerKey}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Generated
              </p>
              <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
                {formatDateTime(overview.chartRecord.generatedAtUtc)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="space-y-5">
          <div className="space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Birth Profile
            </p>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              {overview.birthProfile.label}
            </h2>
          </div>

          <div className="space-y-3 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            <p>
              Birth date:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {overview.birthProfile.birthDate}
              </span>
            </p>
            <p>
              Birth time:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {overview.birthProfile.birthTime ?? "Not recorded"}
              </span>
            </p>
            <p>
              Birthplace:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {overview.birthProfile.city}
                {overview.birthProfile.region
                  ? `, ${overview.birthProfile.region}`
                  : ""}
                {`, ${overview.birthProfile.country}`}
              </span>
            </p>
            <p>
              Timezone:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {overview.birthProfile.timezone}
              </span>
            </p>
            <p>
              Coordinates:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {overview.birthProfile.latitude !== null &&
                overview.birthProfile.longitude !== null
                  ? `${overview.birthProfile.latitude}, ${overview.birthProfile.longitude}`
                  : "Not recorded"}
              </span>
            </p>
            <p>
              Preferred language:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {overview.preferredLanguageLabel}
              </span>
            </p>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <Card className="space-y-5">
          <div className="space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Planetary Positions
            </p>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              Core placements for the first natal view.
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {overview.chart.planets.map((planet) => (
              <div
                key={planet.body}
                className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                      {planet.body}
                    </p>
                    <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
                      {formatSign(planet.sign)} {planet.degree}
                      &deg; {planet.minute}&apos;
                    </p>
                  </div>
                  {planet.retrograde ? (
                    <span className="rounded-[var(--radius-pill)] border border-[rgba(215,187,131,0.2)] bg-[rgba(215,187,131,0.08)] px-3 py-1 text-[0.62rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                      Retrograde
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                  House {planet.house}
                </p>
                {planet.nakshatra ? (
                  <p className="mt-1 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                    {formatNakshatraLabel(planet.nakshatra.name)} pada{" "}
                    {planet.nakshatra.pada}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-5">
          <div className="space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Houses
            </p>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              Sign and rulership structure.
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {overview.chart.houses.map((house) => (
              <div
                key={house.house}
                className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4"
              >
                <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                  House {house.house}
                </p>
                <p className="mt-2 text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
                  {formatSign(house.sign)}
                </p>
                <p className="mt-1 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                  Ruler {formatBody(house.ruler)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card className="space-y-5">
          <div className="space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Major Aspects
            </p>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              Structured aspect list for the initial chart.
            </h2>
          </div>

          <div className="space-y-3">
            {overview.chart.aspects.length ? (
              overview.chart.aspects.map((aspect, index) => (
                <div
                  key={`${aspect.source}-${aspect.target}-${aspect.type}-${index}`}
                  className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4"
                >
                  <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
                    {aspect.source} {aspect.type.toLowerCase()} {aspect.target}
                  </p>
                  <p className="mt-2 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                    Orb {aspect.orb.toFixed(2)} |{" "}
                    {aspect.exact ? "Exact" : "Within range"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                No major aspects were stored in the current chart payload.
              </p>
            )}
          </div>
        </Card>

        <Card className="space-y-5">
          <div className="space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Dasha And Yogas
            </p>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              Timing and pattern notes from the stored Jyotish layer.
            </h2>
          </div>

          <div className="space-y-4 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            {overview.chart.currentDasha ? (
              <p>
                Current dasha:{" "}
                <span className="text-[color:var(--color-foreground)]">
                  {formatBody(overview.chart.currentDasha.lord)}
                </span>{" "}
                until{" "}
                <span className="text-[color:var(--color-foreground)]">
                  {formatDateTime(overview.chart.currentDasha.endAtUtc)}
                </span>
              </p>
            ) : (
              <p>No current dasha snapshot is stored on this chart yet.</p>
            )}

            {overview.chart.yogas?.length ? (
              <div className="space-y-2">
                {overview.chart.yogas.map((yoga) => (
                  <div
                    key={yoga.key}
                    className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4"
                  >
                    <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
                      {yoga.title}
                    </p>
                    <p className="mt-2 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                      {yoga.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No named yoga pattern is stored on this chart yet.</p>
            )}
          </div>

          <Link
            href="/dashboard/onboarding"
            className={buttonStyles({ tone: "secondary", size: "lg" })}
          >
            Update Birth Details
          </Link>
        </Card>
      </div>
    </Section>
  );
}
