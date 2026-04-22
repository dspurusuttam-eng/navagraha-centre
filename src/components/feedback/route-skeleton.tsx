import { Container } from "@/components/ui/container";

type RouteSkeletonProps = {
  compact?: boolean;
  cardCount?: number;
};

export function RouteSkeleton({
  compact = false,
  cardCount = 3,
}: Readonly<RouteSkeletonProps>) {
  return (
    <Container className="py-8 sm:py-10">
      <div className="route-loader-fade space-y-6">
        <div className="space-y-3">
          <div className="skeleton-block h-3 w-32 rounded-full" />
          <div className="skeleton-block h-9 w-full max-w-3xl rounded-[var(--radius-md)]" />
          <div className="skeleton-block h-4 w-full max-w-2xl rounded-[var(--radius-md)]" />
        </div>

        <div
          className={
            compact
              ? "grid gap-4 sm:grid-cols-2"
              : "grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          }
        >
          {Array.from({ length: cardCount }).map((_, index) => (
            <div
              key={index}
              className="space-y-3 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.88)] p-5"
            >
              <div className="skeleton-block h-3 w-20 rounded-full" />
              <div className="skeleton-block h-5 w-3/4 rounded-[var(--radius-sm)]" />
              <div className="skeleton-block h-4 w-full rounded-[var(--radius-sm)]" />
              <div className="skeleton-block h-4 w-5/6 rounded-[var(--radius-sm)]" />
              <div className="skeleton-block h-11 w-36 rounded-[var(--radius-pill)]" />
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
