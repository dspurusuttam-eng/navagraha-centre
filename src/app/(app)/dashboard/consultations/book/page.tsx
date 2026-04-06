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

  return <ConsultationBookingForm data={data} />;
}
