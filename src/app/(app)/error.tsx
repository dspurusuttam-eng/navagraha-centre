"use client";

import { RouteErrorState } from "@/components/feedback/route-error-state";

export default function AppError({
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
      eyebrow="Member Fallback"
      title="The protected member route hit a graceful fallback."
      description="Your member data stays protected while the route is retried."
      homeHref="/dashboard"
      homeLabel="Return To Dashboard"
    />
  );
}
