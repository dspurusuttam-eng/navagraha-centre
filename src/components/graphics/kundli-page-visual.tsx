import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { GoldZodiacWheel } from "@/components/graphics/premium-vedic-graphics";
import { kundliPreviewItems } from "@/modules/kundli/kundli-foundation";

export function KundliPageHeroVisual() {
  return (
    <Card
      tone="default"
      className="relative overflow-hidden border-black/8 bg-white shadow-[0_22px_58px_rgba(17,24,39,0.07)] before:opacity-0"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_24%,rgba(184,137,67,0.05),transparent_42%),radial-gradient(circle_at_18%_82%,rgba(17,24,39,0.02),transparent_32%)]" />

      <div className="relative space-y-5 p-5 sm:p-6 lg:p-7">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge tone="trust" className="border border-black/8 bg-white">
            Kundli Snapshot
          </Badge>
          <Badge tone="outline" className="border border-black/8 bg-white text-[color:var(--color-ink-strong)]">
            Privacy-Safe
          </Badge>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[23rem]">
          <div className="absolute inset-[6%] rounded-full border border-black/8" />
          <div className="absolute inset-[14%] rounded-full border border-black/6" />
          <div className="absolute inset-[22%] rounded-full border border-dashed border-[rgba(184,137,67,0.34)]" />
          <div className="absolute inset-[31%] rounded-full border border-black/6" />
          <div className="absolute left-1/2 top-1/2 h-[72%] w-px -translate-y-1/2 bg-black/6" />
          <div className="absolute left-1/2 top-1/2 h-px w-[72%] -translate-x-1/2 bg-black/6" />
          <div className="absolute left-1/2 top-1/2 h-[54%] w-px -translate-y-1/2 rotate-45 bg-black/4" />
          <div className="absolute left-1/2 top-1/2 h-[54%] w-px -translate-y-1/2 -rotate-45 bg-black/4" />

          {Array.from({ length: 12 }, (_, index) => {
            const angle = (index / 12) * Math.PI * 2 - Math.PI / 2;
            const x = 50 + 37.5 * Math.cos(angle);
            const y = 50 + 37.5 * Math.sin(angle);

            return (
              <span
                key={index}
                aria-hidden="true"
                className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(184,137,67,0.82)] shadow-[0_0_0_7px_rgba(184,137,67,0.08)]"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                }}
              />
            );
          })}

          <GoldZodiacWheel className="absolute left-1/2 top-1/2 h-[84%] w-[84%] -translate-x-1/2 -translate-y-1/2" />

          <div className="absolute left-1/2 top-1/2 flex h-[34%] w-[34%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(184,137,67,0.26)] bg-white shadow-[0_18px_42px_rgba(17,24,39,0.06)]">
            <div className="text-center">
              <div className="text-[0.64rem] uppercase tracking-[0.22em] text-[color:var(--color-ink-muted)]">
                12-Planet
              </div>
              <div className="font-[family-name:var(--font-display)] text-[1.35rem] tracking-[0.16em] text-[color:var(--color-ink-strong)]">
                NC
              </div>
              <div className="text-[0.64rem] uppercase tracking-[0.22em] text-[color:var(--color-ink-muted)]">
                Intelligence
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {kundliPreviewItems.map((item) => (
            <div
              key={item.title}
              className="rounded-[1.1rem] border border-black/8 bg-white px-3 py-2.5 shadow-[0_10px_24px_rgba(17,24,39,0.05)]"
            >
              <p className="text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--color-accent-strong)]">
                {item.title}
              </p>
              <p className="mt-1 text-[0.72rem] leading-5 text-[color:var(--color-ink-body)]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
