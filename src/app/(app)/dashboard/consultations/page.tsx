import { buildPageMetadata } from "@/lib/metadata";
import { requireUserSession } from "@/modules/auth/server";
import { ConsultationDashboardList } from "@/modules/consultations/components/consultation-dashboard-list";
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
  const consultations = await getUserConsultations(session.user.id);

  return <ConsultationDashboardList consultations={consultations} />;
}
