import { notFound } from "next/navigation";
import { buildPageMetadata } from "@/lib/metadata";
import { requireUserSession } from "@/modules/auth/server";
import { ConsultationConfirmation } from "@/modules/consultations/components/consultation-confirmation";
import { getConsultationDetail } from "@/modules/consultations/service";
import {
  createEmptyOfferRecommendationResult,
  getOfferRecommendations,
  type OfferRecommendationResult,
} from "@/modules/offers";

export const metadata = buildPageMetadata({
  title: "Consultation Confirmation",
  description:
    "Review a protected consultation confirmation with Joy Prakash Sarmah, including explicit timing and intake context.",
  path: "/dashboard/consultations",
  keywords: [
    "consultation confirmation",
    "protected booking confirmation",
    "astrology consultation details",
  ],
});

export default async function ConsultationConfirmationPage({
  params,
}: Readonly<{
  params: Promise<{
    consultationId: string;
  }>;
}>) {
  const session = await requireUserSession();
  const { consultationId } = await params;
  const [consultation, offers] = await Promise.all([
    getConsultationDetail(session.user.id, consultationId),
    (async (): Promise<OfferRecommendationResult> => {
      try {
        return await getOfferRecommendations({
          userId: session.user.id,
          surfaceKey: "consultation-detail",
          consultationId,
        });
      } catch (error) {
        console.error("Consultation detail offers failed", error);

        return createEmptyOfferRecommendationResult("consultation-detail");
      }
    })(),
  ]);

  if (!consultation) {
    notFound();
  }

  return (
    <ConsultationConfirmation consultation={consultation} offers={offers} />
  );
}
