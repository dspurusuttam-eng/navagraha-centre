import Link from "next/link";
import { Card } from "@/components/ui/card";
import { buttonStyles } from "@/components/ui/button";
import { buildPageMetadata } from "@/lib/metadata";
import { requireUserSession } from "@/modules/auth/server";
import { ConsultationBookingForm } from "@/modules/consultations/components/consultation-booking-form";
import { getConsultationBookingData } from "@/modules/consultations/service";

export const metadata = buildPageMetadata({
  title: "Book Consultation",
  description:
    "Reserve a consultation with Joy Prakash Sarmah through the protected NAVAGRAHA CENTRE booking flow.",
  path: "/dashboard/consultations/book",
  keywords: [
    "book astrology consultation",
    "Joy Prakash Sarmah booking",
    "consultation intake",
  ],
});

export default async function ConsultationBookingPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{
    package?: string;
  }>;
}>) {
  const session = await requireUserSession();
  const resolvedSearchParams = await searchParams;
  const data = await getConsultationBookingData(
    session.user.id,
    resolvedSearchParams.package
  );

  return (
    <div className="space-y-6">
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Consult
          </p>
          <h1
            className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[color:var(--color-foreground)]"
            style={{ letterSpacing: "var(--tracking-display)" }}
          >
            Book Consultation
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            className={buttonStyles({ size: "sm", tone: "secondary" })}
            href="/consultation"
          >
            Consult
          </Link>
          <Link
            className={buttonStyles({ size: "sm", tone: "ghost" })}
            href="/dashboard"
          >
            Account
          </Link>
        </div>
      </Card>
      <ConsultationBookingForm data={data} />
    </div>
  );
}
