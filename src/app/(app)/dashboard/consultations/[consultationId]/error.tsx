"use client";

import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";

export default function DashboardConsultationDetailError({
  reset,
}: Readonly<{
  reset: () => void;
}>) {
  return (
    <main className="min-h-screen bg-[#FFFFFF] px-4 py-6 text-[#111111] sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl rounded-[24px] border border-[#EAEAEA] bg-white p-6 shadow-[0_8px_30px_rgba(17,17,17,0.04)]">
        <p className="text-[0.72rem] uppercase tracking-[0.16em] text-[#C89B2C]">Consultation Detail</p>
        <h1 className="mt-2 text-[1.5rem] font-semibold text-[#111111]">
          This consultation cannot be loaded right now.
        </h1>
        <p className="mt-3 text-[0.95rem] leading-6 text-[#4A4A4A]">
          The booking remains protected. Please retry or return to the consultation history.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={reset} className={buttonStyles({ size: "sm", tone: "secondary" })}>
            Retry
          </button>
          <Link href="/dashboard/consultations" className={buttonStyles({ size: "sm", tone: "ghost" })}>
            Back To Consultations
          </Link>
        </div>
      </div>
    </main>
  );
}
