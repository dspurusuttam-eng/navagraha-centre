import {
  buildVimshottariMahadashaForChartContext,
  type VimshottariChartContextInput,
} from "@/modules/astrology/vimshottari-dasha";
import { getDashaContextForChart } from "@/modules/astrology/dasha-context";

function readArg(flag: string) {
  const index = process.argv.indexOf(flag);

  if (index === -1) {
    return null;
  }

  return process.argv[index + 1] ?? null;
}

function hasFlag(flag: string) {
  return process.argv.includes(flag);
}

function parseNumberFlag(flag: string) {
  const value = readArg(flag);

  if (!value) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function buildKnownValidChartContext(): VimshottariChartContextInput {
  return {
    birth_context: {
      birth_utc: "1996-04-12T14:00:00.000Z",
    },
    planets: [
      {
        name: "Moon",
        longitude: 86.275432,
        nakshatra: "Punarvasu",
      },
    ],
    verification: {
      is_verified_for_chart_logic: true,
    },
  };
}

function buildInvalidChartContext(): VimshottariChartContextInput {
  return {
    birth_context: {
      birth_utc: "invalid-utc",
    },
    planets: [],
    verification: {
      is_verified_for_chart_logic: false,
    },
  };
}

function formatSequence(
  result: ReturnType<typeof buildVimshottariMahadashaForChartContext>
) {
  if (!result.success) {
    return null;
  }

  return result.data.mahadashaPeriods.map((period) => ({
    planet: period.planet,
    start_at_utc: period.startAtUtc,
    end_at_utc: period.endAtUtc,
    duration_years: period.durationYears,
    is_active: period.isActive,
    antardashas: period.antardashas.map((antardasha) => ({
      planet: antardasha.planet,
      start_at_utc: antardasha.startAtUtc,
      end_at_utc: antardasha.endAtUtc,
      duration_years: antardasha.durationYears,
      is_active: antardasha.isActive,
      pratyantars: antardasha.pratyantars.map((pratyantar) => ({
        planet: pratyantar.planet,
        start_at_utc: pratyantar.startAtUtc,
        end_at_utc: pratyantar.endAtUtc,
        duration_years: pratyantar.durationYears,
        is_active: pratyantar.isActive,
      })),
    })),
  }));
}

async function main() {
  const asOfDateUtc = readArg("--as-of") ?? undefined;
  const periodCount = parseNumberFlag("--period-count") ?? undefined;
  const moonLongitude = parseNumberFlag("--moon-longitude");
  const birthUtcOverride = readArg("--birth-utc");
  const invalidChartContextMode = hasFlag("--invalid-chart-context");

  const baseContext = invalidChartContextMode
    ? buildInvalidChartContext()
    : buildKnownValidChartContext();
  const context: VimshottariChartContextInput = {
    ...baseContext,
    birth_context: {
      birth_utc: birthUtcOverride ?? baseContext.birth_context.birth_utc,
    },
    planets:
      moonLongitude === null
        ? baseContext.planets
        : baseContext.planets.map((planet) =>
            planet.name.trim().toUpperCase() === "MOON"
              ? {
                  ...planet,
                  longitude: moonLongitude,
                }
              : planet
          ),
  };

  const dasha = buildVimshottariMahadashaForChartContext({
    chart: context,
    asOfDateUtc,
    periodCount,
  });
  const integratedDashaContext = getDashaContextForChart({
    chart: context,
    asOfDateUtc,
    periodCount,
  });
  const integratedDashaStackPreview =
    integratedDashaContext.success
      ? {
          current_mahadasha: integratedDashaContext.data.current_dasha_context.mahadasha,
          current_antardasha:
            integratedDashaContext.data.current_dasha_context.antardasha,
          current_pratyantar:
            integratedDashaContext.data.current_dasha_context.pratyantar,
          current_day_dasha:
            integratedDashaContext.data.current_dasha_context.day_dasha,
          active_chain: integratedDashaContext.data.dasha_timeline_summary.active_chain,
          next_transition_at:
            integratedDashaContext.data.dasha_timeline_summary.next_transition_at,
          next_transition_level:
            integratedDashaContext.data.dasha_timeline_summary.next_transition_level,
        }
      : null;

  console.log(
    JSON.stringify(
      {
        as_of_date_utc: asOfDateUtc ?? null,
        period_count: periodCount ?? null,
        invalid_chart_context_mode: invalidChartContextMode,
        chart_context: context,
        dasha,
        mahadasha_sequence: formatSequence(dasha),
        active_mahadasha: dasha.success ? dasha.data.activeMahadasha : null,
        active_antardasha: dasha.success ? dasha.data.activeAntardasha : null,
        active_pratyantar: dasha.success ? dasha.data.activePratyantar : null,
        active_day_dasha: dasha.success ? dasha.data.activeDayDasha : null,
        current_day_dasha_context: dasha.success
          ? dasha.data.currentDayDashaContext
          : null,
        integrated_dasha_stack_preview: integratedDashaStackPreview,
        integrated_dasha_context: integratedDashaContext,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
