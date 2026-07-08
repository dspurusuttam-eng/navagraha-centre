"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

type HomeRailControlsProps = {
  children: ReactNode;
  className: string;
  label: string;
  leftLabel: string;
  rightLabel: string;
};

type ScrollState = {
  atStart: boolean;
  atEnd: boolean;
};

function RailChevron({ direction }: Readonly<{ direction: "left" | "right" }>) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      className="h-3.5 w-3.5"
    >
      {direction === "left" ? <path d="m10 3-5 5 5 5" /> : <path d="m6 3 5 5-5 5" />}
    </svg>
  );
}

export function HomeRailControls({
  children,
  className,
  label,
  leftLabel,
  rightLabel,
}: Readonly<HomeRailControlsProps>) {
  const railRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState<ScrollState>({
    atStart: true,
    atEnd: false,
  });

  const updateScrollState = useCallback(() => {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    const maxScrollLeft = rail.scrollWidth - rail.clientWidth;

    setScrollState({
      atStart: rail.scrollLeft <= 2,
      atEnd: maxScrollLeft <= 2 || rail.scrollLeft >= maxScrollLeft - 2,
    });
  }, []);

  const scrollRail = useCallback(
    (direction: "left" | "right") => {
      const rail = railRef.current;

      if (!rail) {
        return;
      }

      const firstItem = rail.firstElementChild;
      const itemWidth =
        firstItem instanceof HTMLElement
          ? firstItem.getBoundingClientRect().width
          : rail.clientWidth * 0.72;
      const gap = Number.parseFloat(window.getComputedStyle(rail).columnGap || "0") || 0;
      const scrollAmount = Math.max(itemWidth + gap, rail.clientWidth * 0.48);

      rail.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });

      window.setTimeout(updateScrollState, 260);
    },
    [updateScrollState]
  );

  useEffect(() => {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    updateScrollState();
    rail.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      rail.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  return (
    <div className="space-y-2">
      <div ref={railRef} className={className} aria-label={label}>
        {children}
      </div>
      <div className="flex justify-end gap-2 px-1">
        <button
          type="button"
          aria-label={leftLabel}
          disabled={scrollState.atStart}
          onClick={() => scrollRail("left")}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(185,139,70,0.28)] bg-white text-[color:var(--color-antique-gold-dark)] shadow-[0_6px_14px_rgba(17,17,17,0.055)] transition hover:border-[rgba(185,139,70,0.4)] hover:text-[#111111] disabled:cursor-default disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]"
        >
          <RailChevron direction="left" />
        </button>
        <button
          type="button"
          aria-label={rightLabel}
          disabled={scrollState.atEnd}
          onClick={() => scrollRail("right")}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(185,139,70,0.28)] bg-white text-[color:var(--color-antique-gold-dark)] shadow-[0_6px_14px_rgba(17,17,17,0.055)] transition hover:border-[rgba(185,139,70,0.4)] hover:text-[#111111] disabled:cursor-default disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]"
        >
          <RailChevron direction="right" />
        </button>
      </div>
    </div>
  );
}
