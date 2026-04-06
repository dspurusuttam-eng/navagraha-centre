"use client";

import { RouteErrorState } from "@/components/feedback/route-error-state";

export default function RootError({
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
      eyebrow="Application Error"
      title="Something interrupted the current experience."
      description="A graceful fallback is showing instead of a broken screen. You can retry the route or return to the main site."
    />
  );
}
