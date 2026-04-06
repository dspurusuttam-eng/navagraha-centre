"use client";

import { RouteErrorState } from "@/components/feedback/route-error-state";

export default function GlobalError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <html lang="en">
      <body>
        <RouteErrorState
          error={error}
          reset={reset}
          eyebrow="Global Error"
          title="The application hit a critical fallback state."
          description="The route could not complete normally, so the launch-ready global fallback took over."
          fullScreen
        />
      </body>
    </html>
  );
}
