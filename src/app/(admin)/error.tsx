"use client";

import { RouteErrorState } from "@/components/feedback/route-error-state";

export default function AdminError({
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
      eyebrow="Admin Fallback"
      title="The admin control panel hit a guarded fallback state."
      description="Operational routes stay bounded and recoverable instead of failing hard."
      homeHref="/admin"
      homeLabel="Return To Admin"
    />
  );
}
