"use client";

import { RouteErrorState } from "@/components/feedback/route-error-state";

export default function MarketingError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <RouteErrorState
      error={error}
      reset={reset}
      eyebrow="Public Site"
      title="The public page could not be rendered normally."
      description="The page could not be completed right now. Please try again or return to the homepage."
      homeHref="/"
      homeLabel="Return Home"
    />
  );
}
