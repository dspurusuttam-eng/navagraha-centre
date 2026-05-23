const orbitMarkers = Array.from({ length: 12 }, (_, index) => index);

const floatingCards = [
  {
    label: "Dasha",
    title: "Time cycles",
    description: "Understand current planetary periods.",
    position: "lg:left-4 lg:top-8",
  },
  {
    label: "Transit",
    title: "Motion check",
    description: "See the current planetary movement layer.",
    position: "lg:right-4 lg:top-14",
  },
  {
    label: "Panchang",
    title: "Daily timing",
    description: "Track tithi, nakshatra, and useful planning windows.",
    position: "lg:left-8 lg:bottom-28",
  },
  {
    label: "Reports",
    title: "Deeper synthesis",
    description: "Move from preview into fuller report context.",
    position: "lg:right-8 lg:bottom-32",
  },
  {
    label: "NAVAGRAHA Intelligence Guidance",
    title: "Ask NI",
    description: "Bridge chart data into a guided answer flow.",
    position: "lg:left-1/2 lg:bottom-6 lg:-translate-x-1/2",
  },
] as const;

export function HomepagePremiumHeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[34rem] sm:max-w-[38rem]">
      <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-black/8 bg-white shadow-[0_28px_72px_rgba(17,24,39,0.08)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(184,137,67,0.08),transparent_48%),radial-gradient(circle_at_50%_72%,rgba(17,24,39,0.03),transparent_50%)]" />

        <div className="relative min-h-[27rem] px-4 py-4 sm:min-h-[32rem] sm:px-6 sm:py-6 lg:min-h-[36rem]">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[0.62rem] uppercase tracking-[0.12em] text-[color:var(--color-ink-muted)] sm:text-[0.68rem] sm:tracking-[0.18em]">
              Premium Astrology Visual
            </span>
            <span className="rounded-full border border-[rgba(184,137,67,0.24)] bg-white px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.1em] text-[color:var(--color-ink-strong)] shadow-[0_6px_16px_rgba(17,24,39,0.04)] sm:px-3 sm:text-[0.62rem] sm:tracking-[0.16em]">
              White + Gold
            </span>
          </div>

          <div className="relative mx-auto mt-5 aspect-square w-full max-w-[18rem] sm:mt-6 sm:max-w-[23rem]">
            <div className="absolute inset-[6%] rounded-full border border-black/8" />
            <div className="absolute inset-[14%] rounded-full border border-black/6" />
            <div className="absolute inset-[22%] rounded-full border border-dashed border-[rgba(184,137,67,0.34)]" />
            <div className="absolute inset-[30%] rounded-full border border-black/6" />
            <div className="absolute left-1/2 top-1/2 h-[72%] w-px -translate-y-1/2 bg-black/6" />
            <div className="absolute left-1/2 top-1/2 h-px w-[72%] -translate-x-1/2 bg-black/6" />
            <div className="absolute left-1/2 top-1/2 h-[54%] w-px -translate-y-1/2 rotate-45 bg-black/4" />
            <div className="absolute left-1/2 top-1/2 h-[54%] w-px -translate-y-1/2 -rotate-45 bg-black/4" />

            {orbitMarkers.map((marker) => {
              const angle = (marker / orbitMarkers.length) * Math.PI * 2 - Math.PI / 2;
              const x = 50 + 38 * Math.cos(angle);
              const y = 50 + 38 * Math.sin(angle);

              return (
                <span
                  key={marker}
                  aria-hidden="true"
                  className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(184,137,67,0.82)] shadow-[0_0_0_7px_rgba(184,137,67,0.08)]"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                  }}
                />
              );
            })}

            <div className="absolute left-1/2 top-1/2 flex h-[38%] w-[38%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(184,137,67,0.24)] bg-white shadow-[0_20px_42px_rgba(17,24,39,0.06)]">
              <div className="text-center">
                <div className="text-[0.62rem] uppercase tracking-[0.24em] text-[color:var(--color-ink-muted)]">
                  12-Planet
                </div>
                <div className="font-[family-name:var(--font-display)] text-[1.45rem] tracking-[0.14em] text-[color:var(--color-ink-strong)]">
                  NC
                </div>
                <div className="text-[0.62rem] uppercase tracking-[0.24em] text-[color:var(--color-ink-muted)]">
                  Intelligence
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 hidden gap-3 sm:grid sm:grid-cols-2 lg:mt-0 lg:grid">
            {floatingCards.map((card, index) => (
              <div
                key={card.label}
                className={[
                  "relative rounded-[1.25rem] border border-black/8 bg-white/96 p-3 shadow-[0_10px_24px_rgba(17,24,39,0.06)]",
                  index === 4 ? "sm:col-span-2" : "",
                  card.position,
                  "lg:absolute lg:w-[10.75rem]",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--color-accent-gold)]" />
                  <p className="text-[0.62rem] uppercase tracking-[0.18em] text-[color:var(--color-accent-strong)]">
                    {card.label}
                  </p>
                </div>
                <h3 className="mt-2 text-[0.92rem] font-medium text-[color:var(--color-ink-strong)]">
                  {card.title}
                </h3>
                <p className="mt-1 text-[0.72rem] leading-5 text-[color:var(--color-ink-body)]">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
