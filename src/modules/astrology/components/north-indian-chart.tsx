"use client";

import type { UnifiedSiderealChart } from "@/modules/astrology/chart-contract-types";

type NorthIndianChartProps = {
  chart: UnifiedSiderealChart;
};

type HouseGridPosition = {
  row: number;
  col: number;
};

const housePositions: Record<number, HouseGridPosition> = {
  1: { row: 1, col: 3 },
  2: { row: 1, col: 4 },
  3: { row: 2, col: 5 },
  4: { row: 3, col: 5 },
  5: { row: 4, col: 5 },
  6: { row: 5, col: 4 },
  7: { row: 5, col: 3 },
  8: { row: 5, col: 2 },
  9: { row: 4, col: 1 },
  10: { row: 3, col: 1 },
  11: { row: 2, col: 1 },
  12: { row: 1, col: 2 },
};

const planetAbbreviations: Record<string, string> = {
  Sun: "Su",
  Moon: "Mo",
  Mars: "Ma",
  Mercury: "Me",
  Jupiter: "Ju",
  Venus: "Ve",
  Saturn: "Sa",
  Rahu: "Ra",
  Ketu: "Ke",
};

function formatSign(sign: string) {
  return sign.charAt(0).toUpperCase() + sign.slice(1).toLowerCase();
}

export function NorthIndianChart({ chart }: Readonly<NorthIndianChartProps>) {
  const houseByNumber = new Map(chart.houses.map((house) => [house.house, house]));
  const planetsByHouse = new Map<number, string[]>();

  for (const planet of chart.planets) {
    const existing = planetsByHouse.get(planet.house) ?? [];
    existing.push(planetAbbreviations[planet.name] ?? planet.name.slice(0, 2));
    planetsByHouse.set(planet.house, existing);
  }

  return (
    <div className="rounded-[var(--radius-2xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] p-4 md:p-6">
      <div className="grid grid-cols-5 grid-rows-5 gap-2">
        {Array.from({ length: 12 }).map((_, index) => {
          const houseNumber = index + 1;
          const house = houseByNumber.get(houseNumber);
          const position = housePositions[houseNumber];
          const planets = planetsByHouse.get(houseNumber) ?? [];

          return (
            <div
              key={houseNumber}
              className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.025)] p-2"
              style={{
                gridColumnStart: position.col,
                gridRowStart: position.row,
              }}
            >
              <p className="text-[0.62rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                H{houseNumber}
              </p>
              <p className="mt-1 text-[0.78rem] text-[color:var(--color-foreground)]">
                {house ? formatSign(house.sign) : "Unknown"}
              </p>
              <p className="mt-1 text-[0.68rem] text-[color:var(--color-muted)]">
                {planets.length ? planets.join(" · ") : "—"}
              </p>
            </div>
          );
        })}

        <div
          className="flex flex-col items-center justify-center rounded-[var(--radius-xl)] border border-[rgba(215,187,131,0.25)] bg-[rgba(215,187,131,0.08)] px-3 py-4 text-center"
          style={{ gridColumn: "2 / 5", gridRow: "2 / 5" }}
        >
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            North Indian Chart
          </p>
          <p className="mt-2 text-[0.82rem] text-[color:var(--color-foreground)]">
            Lagna: {formatSign(chart.lagna.sign)}
          </p>
          <p className="mt-1 text-[0.72rem] text-[color:var(--color-muted)]">
            {chart.lagna.degree_in_sign.toFixed(2)}° in house 1
          </p>
        </div>
      </div>
    </div>
  );
}
