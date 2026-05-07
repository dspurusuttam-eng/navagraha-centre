"use client";

import { useEffect } from "react";
import { buttonStyles } from "@/components/ui/button";

export default function DashboardReportDetailError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    console.error("Dashboard report detail error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#FFFFFF] px-4 py-6 text-[#111111] sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 rounded-[var(--radius-2xl)] border border-[#EAEAEA] bg-white p-6 shadow-[0_10px_28px_rgba(17,17,17,0.04)]">
        <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
          Report unavailable
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] text-[#111111]">
          We could not load this report right now.
        </h1>
        <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
          Your report data remains protected. Please try again in a moment.
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={reset} className={buttonStyles({ size: "sm", tone: "secondary" })}>
            Try again
          </button>
        </div>
      </div>
    </main>
  );
}
