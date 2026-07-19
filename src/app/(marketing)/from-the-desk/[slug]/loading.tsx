// Article-shaped loading state for Desk list → article navigation: immediate response on
// tap, article-like silhouette so the streamed page swap does not jump.
import { Container } from "@/components/ui/container";

function Block({ className }: Readonly<{ className: string }>) {
  return (
    <div
      className={`animate-pulse rounded-[var(--radius-card)] border border-[rgba(185,139,70,0.16)] bg-[rgba(185,139,70,0.08)] ${className}`}
    />
  );
}

export default function DeskArticleLoading() {
  return (
    <Container className="space-y-4 pb-10 pt-5 sm:pt-8" aria-busy="true">
      <span className="sr-only">Loading article…</span>
      <Block className="h-8 w-40" />
      <Block className="h-40 sm:h-48" />
      <Block className="h-72" />
    </Container>
  );
}
