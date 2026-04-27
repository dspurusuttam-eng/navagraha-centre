import { serializeJsonLd, type JsonLdRecord } from "@/lib/seo/schema";

type JsonLdProps = {
  id?: string;
  data: JsonLdRecord | JsonLdRecord[];
};

export function JsonLd({ id, data }: Readonly<JsonLdProps>) {
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return null;
  }

  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: serializeJsonLd(data),
      }}
    />
  );
}
