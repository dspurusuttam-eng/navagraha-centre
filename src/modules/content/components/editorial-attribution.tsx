import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ContentPerson } from "@/modules/content";

function PersonaBlock({
  eyebrow,
  person,
}: Readonly<{
  eyebrow: string;
  person: ContentPerson;
}>) {
  return (
    <Card className="space-y-4">
      <Badge tone="neutral">{eyebrow}</Badge>
      <div className="space-y-2">
        <p className="text-[length:var(--font-size-body-lg)] text-[color:var(--color-foreground)]">
          {person.name}
        </p>
        <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
          {person.title}
        </p>
      </div>
      <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
        {person.bio}
      </p>
    </Card>
  );
}

export function EditorialAttribution({
  author,
  reviewer,
}: Readonly<{
  author: ContentPerson;
  reviewer?: ContentPerson;
}>) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <PersonaBlock eyebrow="Author" person={author} />
      {reviewer ? <PersonaBlock eyebrow="Reviewer" person={reviewer} /> : null}
    </div>
  );
}
