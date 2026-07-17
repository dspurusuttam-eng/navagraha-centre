// Claude C9C1C — temporary Preview-only founder bootstrap page.
// Deliberately outside the admin-session guard: eligibility is its own tightly-scoped gate
// (Preview env + target branch + Preview DB fingerprint + zero founder assignments + zero
// users for the target email), re-checked again at submit time. Self-disables the moment a
// founder account exists, since that flips the gate to ineligible on the next render.
import { checkFounderBootstrapEligible, FOUNDER_BOOTSTRAP_EMAIL } from "@/modules/admin/bootstrap/founder-bootstrap-gate";
import { FounderBootstrapForm } from "@/modules/admin/bootstrap/founder-bootstrap-form";

export const dynamic = "force-dynamic";

export default async function FounderBootstrapPage() {
  const gate = await checkFounderBootstrapEligible();

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <div className="rounded-xl border bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold">Founder setup</h1>
        {gate.eligible ? (
          <>
            <p className="mt-1 mb-6 text-sm text-neutral-600">
              One-time Preview setup. This page disables itself after the account is created.
            </p>
            <FounderBootstrapForm email={FOUNDER_BOOTSTRAP_EMAIL} />
          </>
        ) : (
          <p className="mt-1 text-sm text-neutral-600">This setup step is not available.</p>
        )}
      </div>
    </main>
  );
}
