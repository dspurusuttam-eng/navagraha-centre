import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { EditorialPlaceholder } from "@/components/site/editorial-placeholder";
import { PageHero } from "@/components/site/page-hero";
import { buildPageMetadata } from "@/lib/metadata";
import {
  getDefaultDesiredServiceForInquiryType,
  mapIntentToInquiryType,
} from "@/modules/consultations/inquiry-lifecycle";
import { PublicInquiryForm } from "@/modules/consultations/components/public-inquiry-form";
import { contactPage } from "@/modules/marketing/content";

export const metadata = buildPageMetadata({
  ...contactPage.metadata,
});

export default async function ContactPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{
    intent?: string;
  }>;
}>) {
  const resolvedSearchParams = await searchParams;
  const inquiryType = mapIntentToInquiryType(resolvedSearchParams.intent);
  const desiredServiceSlug = getDefaultDesiredServiceForInquiryType(inquiryType);

  return (
    <>
      <PageHero {...contactPage.hero} />

      <Section
        description="The contact page should feel welcoming and premium while making the next step clear."
        eyebrow="Inquiry Types"
        title="The kinds of conversations this route is designed for"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {contactPage.inquiryCards.map((item) => (
            <Card
              key={item.title}
              interactive
              className="flex h-full flex-col gap-4"
            >
              <Badge tone="neutral">Inquiry</Badge>
              <h2 className="text-[length:var(--font-size-body-lg)] font-medium text-[color:var(--color-foreground)]">
                {item.title}
              </h2>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        tone="muted"
        description="The centre handles inquiries through careful review, clear next steps, and a human-led tone."
        eyebrow="Contact Path"
        title="Choose the most direct route"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <div className="grid gap-6">
            <PublicInquiryForm
              defaultInquiryType={inquiryType}
              defaultDesiredServiceSlug={desiredServiceSlug}
              sourcePath="/contact"
            />

            <Card className="space-y-5">
              <div className="space-y-2">
                <Badge tone="accent">Consultation Route</Badge>
                <p className="text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                  For private consultations, the clearest next step is to review
                  the service format and move into the secure booking path.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/consultation" className={buttonStyles({ size: "lg" })}>
                  Review Consultations
                </Link>
                <Link
                  href="/services"
                  className={buttonStyles({ tone: "secondary", size: "lg" })}
                >
                  View Services
                </Link>
              </div>
            </Card>

            <Card className="space-y-5">
              <div className="space-y-2">
                <Badge tone="outline">Product And Remedy Questions</Badge>
                <p className="text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                  Questions about products, remedy framing, or editorial guidance
                  are best understood in context. The public shop and insights
                  library help visitors orient themselves before they proceed.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/shop" className={buttonStyles({ size: "lg" })}>
                  Visit Shop
                </Link>
                <Link
                  href="/insights"
                  className={buttonStyles({ tone: "secondary", size: "lg" })}
                >
                  Read Insights
                </Link>
              </div>
            </Card>
          </div>

          <div className="grid gap-6">
            <EditorialPlaceholder
              annotations={[
                "Private handling",
                "Premium inquiry tone",
                "Clear next steps",
              ]}
              description="A composed contact surface can feel reassuring without pretending to be a generic support queue."
              eyebrow="Contact Atmosphere"
              title="Every inquiry should feel clear, discreet, and well framed"
              tone="midnight"
            />

            <Card className="space-y-4">
              <Badge tone="outline">Response Expectations</Badge>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                NAVAGRAHA CENTRE favors careful review, measured follow-up, and
                a consultation path that feels personal rather than rushed.
              </p>
            </Card>
          </div>
        </div>
      </Section>
    </>
  );
}
