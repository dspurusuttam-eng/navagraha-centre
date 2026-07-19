// Public-route loading state: gives the tap an immediate visual response while the
// dynamically rendered page streams in. Kept deliberately lightweight and structurally
// close to the page shells (same container rhythm) so the swap does not jump.
import { Container } from "@/components/ui/container";

function Block({ className }: Readonly<{ className: string }>) {
  return (
    <div
      className={`animate-pulse rounded-[var(--radius-card)] border border-[rgba(185,139,70,0.16)] bg-[rgba(185,139,70,0.08)] ${className}`}
    />
  );
}

export default function MarketingLoading() {
  return (
    <Container className="space-y-4 pb-10 pt-5 sm:pt-8" aria-busy="true">
      <span className="sr-only">Loading…</span>
      <Block className="h-36 sm:h-40" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Block className="h-28" />
        <Block className="h-28" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Block className="h-24" />
        <Block className="h-24" />
      </div>
    </Container>
  );
}
