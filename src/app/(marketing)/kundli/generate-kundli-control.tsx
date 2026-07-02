"use client";

import { TrackedLink } from "@/components/analytics/tracked-link";
import { buttonStyles } from "@/components/ui/button";

type KundliGenerateControlProps = {
  signInHref: string;
  feature: string;
};

const kundliIncludes = [
  { label: "Lagna", icon: "lagna" },
  { label: "Rashi", icon: "rashi" },
  { label: "Navamsa", icon: "navamsa" },
  { label: "Graha", icon: "graha" },
  { label: "Dasha", icon: "dasha" },
  { label: "Gochar", icon: "gochar" },
] as const;

type KundliIncludeIconName = (typeof kundliIncludes)[number]["icon"];

function KundliIncludeIcon({
  name,
}: Readonly<{ name: KundliIncludeIconName }>) {
  const commonProps = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.9,
  };

  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 text-[color:var(--color-accent-strong)]"
      viewBox="0 0 24 24"
    >
      {name === "lagna" ? (
        <>
          <path {...commonProps} d="M4 17h16" />
          <path {...commonProps} d="M7 17a5 5 0 0 1 10 0" />
          <path {...commonProps} d="M12 4v3" />
          <path {...commonProps} d="M5.5 8.5l2 2" />
          <path {...commonProps} d="M18.5 8.5l-2 2" />
        </>
      ) : null}
      {name === "rashi" ? (
        <>
          <path
            {...commonProps}
            d="M17.5 16.5A7 7 0 0 1 7.5 6.5 7.2 7.2 0 0 0 16 15a7 7 0 0 0 1.5 1.5Z"
          />
          <path {...commonProps} d="M18 5.5h.01" />
          <path {...commonProps} d="M20 9h.01" />
        </>
      ) : null}
      {name === "navamsa" ? (
        <>
          <rect {...commonProps} x="5" y="5" width="14" height="14" rx="2.5" />
          <path {...commonProps} d="M9.7 5v14" />
          <path {...commonProps} d="M14.3 5v14" />
          <path {...commonProps} d="M5 9.7h14" />
          <path {...commonProps} d="M5 14.3h14" />
        </>
      ) : null}
      {name === "graha" ? (
        <>
          <circle {...commonProps} cx="12" cy="12" r="2.2" />
          <path
            {...commonProps}
            d="M4.8 12a7.2 3.9 0 1 0 14.4 0 7.2 3.9 0 1 0-14.4 0"
          />
          <path {...commonProps} d="M7 7a9.2 9.2 0 0 0 10 10" />
          <circle cx="18.5" cy="8" r="1.2" fill="currentColor" />
        </>
      ) : null}
      {name === "dasha" ? (
        <>
          <path {...commonProps} d="M7 4h10" />
          <path {...commonProps} d="M7 20h10" />
          <path {...commonProps} d="M9 4v4.5L12 12l3-3.5V4" />
          <path {...commonProps} d="M9 20v-4.5L12 12l3 3.5V20" />
        </>
      ) : null}
      {name === "gochar" ? (
        <>
          <circle {...commonProps} cx="12" cy="12" r="7" />
          <path {...commonProps} d="M5 12h14" />
          <path {...commonProps} d="M12 5a12 12 0 0 1 0 14" />
          <path {...commonProps} d="M12 5a12 12 0 0 0 0 14" />
        </>
      ) : null}
    </svg>
  );
}

export function GenerateKundliControl({
  signInHref,
  feature,
}: Readonly<KundliGenerateControlProps>) {
  return (
    <div className="space-y-3">
      <TrackedLink
        href={signInHref}
        eventName="cta_click"
        eventPayload={{ page: "/kundli", feature }}
        className={buttonStyles({
          tone: "accent",
          size: "lg",
          className:
            "w-full justify-center rounded-[var(--radius-pill)] border border-[rgba(184,137,67,0.36)] shadow-[inset_0_1px_0_rgba(255,255,255,0.96),inset_0_-5px_10px_rgba(17,17,17,0.08),0_12px_20px_rgba(184,137,67,0.18)]",
        })}
      >
        SIGN IN
      </TrackedLink>

      <div className="min-w-0 space-y-3 rounded-[1.05rem] border border-[rgba(184,137,67,0.22)] bg-white p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_12px_22px_rgba(17,17,17,0.06)]">
        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
          KUNDLI INCLUDES
        </p>
        <div className="grid min-w-0 grid-cols-3 gap-2 sm:grid-cols-6">
          {kundliIncludes.map((item) => (
            <div
              key={item.label}
              className="min-w-0 rounded-[0.95rem] border border-[rgba(184,137,67,0.2)] bg-white px-2 py-2.5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-5px_10px_rgba(184,137,67,0.035),0_8px_14px_rgba(17,17,17,0.055)]"
            >
              <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(184,137,67,0.23)] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_5px_10px_rgba(17,17,17,0.05)]">
                <KundliIncludeIcon name={item.icon} />
              </div>
              <p className="text-[0.68rem] font-extrabold leading-tight text-[#111111]">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="min-w-0 space-y-2 rounded-[1.05rem] border border-[rgba(184,137,67,0.22)] bg-white p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_10px_18px_rgba(17,17,17,0.055)]">
        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
          RESULT
        </p>
        <div className="rounded-[0.9rem] border border-[rgba(76,187,23,0.2)] bg-white px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-4px_10px_rgba(76,187,23,0.035),0_7px_13px_rgba(17,17,17,0.045)]">
          <p className="text-[0.8rem] font-semibold leading-5 text-[color:var(--color-ink-body)]">
            Kundli result will appear after generation.
          </p>
        </div>
      </div>
    </div>
  );
}
