import { buildPageMetadata } from "@/lib/metadata";
import { requireUserSession } from "@/modules/auth/server";
import { ConsultationDashboardList } from "@/modules/consultations/components/consultation-dashboard-list";
import { getPostConsultationRetentionSnapshot } from "@/modules/consultations/retention";
import { getUserConsultations } from "@/modules/consultations/service";

export const metadata = buildPageMetadata({
  title: "Consultations",
  description:
    "Review booked and requested consultations with Joy Prakash Sarmah inside the protected NAVAGRAHA CENTRE dashboard.",
  path: "/dashboard/consultations",
  keywords: [
    "consultation dashboard",
    "Joy Prakash Sarmah bookings",
    "private consultation history",
  ],
});

export default async function DashboardConsultationsPage() {
  const session = await requireUserSession();
  const [consultations, retentionSnapshot] = await Promise.all([
    getUserConsultations(session.user.id),
    (async () => {
      try {
        return await getPostConsultationRetentionSnapshot(session.user.id);
      } catch (error) {
        console.error("Consultation retention snapshot failed", error);

        return null;
      }
    })(),
  ]);

  return (
    <ConsultationDashboardList
      consultations={consultations}
      retentionSnapshot={retentionSnapshot}
    />
  );
}
