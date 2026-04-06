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
      eyebrow="Marketing Fallback"
      title="The public page could not be rendered normally."
      description="The premium fallback keeps the public experience graceful while the route is retried."
      homeHref="/"
      homeLabel="Marketing Home"
    />
  );
}
