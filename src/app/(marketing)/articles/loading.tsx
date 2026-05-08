import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

export default function ArticlesLoading() {
  return (
    <Container className="py-12">
      <div className="space-y-6">
        <div className="h-6 w-40 rounded-full bg-[rgba(184,137,67,0.12)]" />
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
          <Card className="space-y-4">
            <div className="h-12 w-3/4 rounded-[var(--radius-lg)] bg-[rgba(184,137,67,0.08)]" />
            <div className="h-5 w-full rounded-[var(--radius-lg)] bg-[rgba(184,137,67,0.06)]" />
            <div className="h-5 w-5/6 rounded-[var(--radius-lg)] bg-[rgba(184,137,67,0.06)]" />
          </Card>
          <Card className="space-y-4">
            <div className="h-4 w-24 rounded-full bg-[rgba(184,137,67,0.08)]" />
            <div className="h-5 w-full rounded-[var(--radius-lg)] bg-[rgba(184,137,67,0.06)]" />
            <div className="h-5 w-4/5 rounded-[var(--radius-lg)] bg-[rgba(184,137,67,0.06)]" />
          </Card>
        </div>
      </div>
    </Container>
  );
}

