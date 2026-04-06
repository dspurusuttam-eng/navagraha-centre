import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";

export default function DashboardLoading() {
  return (
    <Section
      eyebrow="Loading"
      title="Preparing the private workspace."
      description="The protected dashboard is gathering profile and chart data."
      tone="transparent"
      className="pt-0"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="space-y-4">
            <div className="h-3 w-24 animate-pulse rounded-full bg-[rgba(215,187,131,0.18)]" />
            <div className="h-10 w-20 animate-pulse rounded-full bg-[rgba(255,255,255,0.08)]" />
            <div className="h-16 animate-pulse rounded-[var(--radius-xl)] bg-[rgba(255,255,255,0.05)]" />
          </Card>
        ))}
      </div>
    </Section>
  );
}
