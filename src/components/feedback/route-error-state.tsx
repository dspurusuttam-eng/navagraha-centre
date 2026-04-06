"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button, buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { captureException } from "@/lib/observability";

type RouteErrorStateProps = {
  error: Error & { digest?: string };
  reset?: () => void;
  eyebrow: string;
  title: string;
  description: string;
  homeHref?: string;
  homeLabel?: string;
  fullScreen?: boolean;
};

export function RouteErrorState({
  error,
  reset,
  eyebrow,
  title,
  description,
  homeHref = "/",
  homeLabel = "Return Home",
  fullScreen = false,
}: Readonly<RouteErrorStateProps>) {
  useEffect(() => {
    captureException(error, {
      boundary: eyebrow,
      digest: error.digest,
    });
  }, [error, eyebrow]);

  return (
    <div className={fullScreen ? "min-h-screen" : undefined}>
      <Container className="py-[var(--space-16)]">
        <Card tone="accent" className="space-y-5">
          <div className="space-y-3">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              {eyebrow}
            </p>
            <h1
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              {title}
            </h1>
            <p className="max-w-2xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {description}
            </p>
            {error.digest ? (
              <p className="text-[0.74rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                Reference {error.digest}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            {reset ? (
              <Button size="sm" onClick={() => reset()}>
                Try Again
              </Button>
            ) : null}
            <Link
              href={homeHref}
              className={buttonStyles({ tone: "secondary", size: "sm" })}
            >
              {homeLabel}
            </Link>
          </div>
        </Card>
      </Container>
    </div>
  );
}
