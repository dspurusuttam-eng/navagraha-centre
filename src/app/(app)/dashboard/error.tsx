"use client";

import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";

export default function DashboardError({
  reset,
}: Readonly<{
  reset: () => void;
}>) {
  return (
    <Section
      eyebrow="Error State"
      title="The protected dashboard couldn't finish loading."
      description="The account data is still private and intact. Try the route again or return to the main dashboard surface."
      tone="transparent"
      className="pt-0"
    >
      <Card className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className={buttonStyles({ size: "lg" })}
        >
          Try Again
        </button>
        <Link
          href="/dashboard"
          className={buttonStyles({ size: "lg", tone: "secondary" })}
        >
          Back to Dashboard
        </Link>
      </Card>
    </Section>
  );
}
