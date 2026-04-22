import { Container } from "@/components/ui/container";

export default function DashboardLoading() {
  return (
    <Container className="py-8 sm:py-10">
      <div className="route-loader-fade grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="space-y-4 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.88)] p-5"
          >
            <div className="skeleton-block h-3 w-24 rounded-full" />
            <div className="skeleton-block h-10 w-20 rounded-full" />
            <div className="skeleton-block h-16 rounded-[var(--radius-xl)]" />
          </div>
        ))}
      </div>
    </Container>
  );
}
