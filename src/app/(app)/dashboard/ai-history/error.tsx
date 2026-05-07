"use client";

import { useEffect } from "react";

export default function DashboardAIHistoryError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#FFFFFF] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 rounded-[var(--radius-2xl)] border border-[#EAEAEA] bg-white px-5 py-6 shadow-[0_10px_28px_rgba(17,17,17,0.04)]">
        <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
          AI History
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] text-[#111111]">
          We could not load your AI history
        </h1>
        <p className="max-w-3xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
          The dashboard keeps the error safe and generic. Please try again after refreshing the page.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex h-11 items-center justify-center rounded-full border border-[#C89B2C] px-4 text-[0.92rem] font-medium text-[#111111] transition hover:bg-[#FCF8EC]"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
