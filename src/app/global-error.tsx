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
          title="The application hit an unexpected error."
          description="The route could not complete right now. Please try again or return to the homepage."
          fullScreen
        />
      </body>
    </html>
  );
}
