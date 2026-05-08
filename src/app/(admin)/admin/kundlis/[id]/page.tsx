import Link from "next/link";
import { Card } from "@/components/ui/card";
import { buttonStyles } from "@/components/ui/button";
import { AdminPageIntro } from "@/modules/admin/components/admin-page-intro";
import { AdminStatusBadge } from "@/modules/admin/components/admin-status-badge";
import { buildAdminMetadata } from "@/modules/admin/metadata";
import { getAdminKundliDetail } from "@/modules/admin/control-panel";
import { requireAdminSession } from "@/modules/auth/server";

export const metadata = buildAdminMetadata({
  title: "Admin Kundli Detail",
  description:
    "Read-only chart detail view for a saved Kundli record inside the admin control panel.",
  path: "/admin/kundlis",
  keywords: ["admin kundli detail", "saved chart detail", "member chart review"],
});

export default async function AdminKundliDetailPage({
  params,
}: Readonly<{
  params: Promise<{
    id: string;
  }>;
}>) {
  await requireAdminSession({
    allowedRoles: ["founder", "support"],
  });

  const { id } = await params;
  const kundli = await getAdminKundliDetail(id);

  if (!kundli) {
    return (
      <div className="space-y-6">
        <AdminPageIntro
          eyebrow="Kundli Detail"
          title="This saved Kundli record could not be found."
          description="The record may have been removed or the reference may no longer be valid."
        />

        <Card className="space-y-4">
          <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
            Return to the saved Kundli overview and choose a valid record.
          </p>
          <Link
            href="/admin/kundlis"
            className={buttonStyles({ tone: "secondary", size: "sm" })}
          >
            Back To Kundlis
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageIntro
        eyebrow="Kundli Detail"
        title={kundli.label}
        description="This detail view stays summary-first and does not expose raw chart JSON. It only surfaces the safe record metadata needed for admin support."
        actions={
          <Link
            href="/admin/kundlis"
            className={buttonStyles({ tone: "secondary", size: "sm" })}
          >
            Back To Kundlis
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <Card className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {kundli.isPrimary ? <AdminStatusBadge status="CURRENT" /> : null}
            <AdminStatusBadge status={kundli.chartStatus} />
            <AdminStatusBadge status={kundli.chartType} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Owner
              </p>
              <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                {kundli.ownerName}
              </p>
              <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                {kundli.ownerEmail}
              </p>
              <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                {kundli.ownerId}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Birth Profile
              </p>
              <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                {kundli.birthPlace}
              </p>
              <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                Birth date {kundli.birthDateLabel}
              </p>
              <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                Birth time {kundli.birthTimeLabel}
              </p>
              <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                Time zone {kundli.timezone}
              </p>
            </div>
          </div>

          <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] px-4 py-4">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Chart Summary
            </p>
            <div className="mt-3 space-y-2 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
              <p>
                Ascendant:{" "}
                <span className="text-[color:var(--color-foreground)]">
                  {kundli.ascendantSign ?? "Not available"}
                </span>
              </p>
              <p>
                Moon:{" "}
                <span className="text-[color:var(--color-foreground)]">
                  {kundli.moonSign ?? "Not available"}
                </span>
              </p>
              <p>{kundli.chartSummary}</p>
            </div>
          </div>
        </Card>

        <Card className="space-y-5">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Operational Metadata
          </p>
          <div className="space-y-3 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
            <p>
              Generated:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {kundli.generatedAtLabel}
              </span>
            </p>
            <p>
              Updated:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {kundli.updatedAtLabel}
              </span>
            </p>
            <p>
              Provider key:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {kundli.providerKey}
              </span>
            </p>
            <p>
              Calculation version:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {kundli.calculationVersion ?? "Not recorded"}
              </span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
