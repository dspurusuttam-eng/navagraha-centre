"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

type ArticlesErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ArticlesError({ error, reset }: Readonly<ArticlesErrorProps>) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="py-12">
      <Card className="space-y-4">
        <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
          Articles Unavailable
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[var(--color-ink-strong)]">
          The article index could not load.
        </h1>
        <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
          The public content surface is still protected. Try loading the page again.
        </p>
        <Button type="button" onClick={reset}>
          Try Again
        </Button>
      </Card>
    </Container>
  );
}

