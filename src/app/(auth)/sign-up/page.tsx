import { buildPageMetadata } from "@/lib/metadata";
import { AuthFormShell } from "@/modules/auth/components/auth-form-shell";
import { SignUpForm } from "@/modules/auth/components/sign-up-form";

export const metadata = buildPageMetadata({
  title: "Create Account",
  description:
    "Create a private NAVAGRAHA CENTRE account for your protected dashboard and profile foundation.",
  path: "/sign-up",
  keywords: ["NAVAGRAHA CENTRE create account", "astrology member signup"],
});

export default function SignUpPage() {
  return (
    <AuthFormShell
      eyebrow="Member Foundation"
      title="Create your protected NAVAGRAHA CENTRE account."
      description="Open your private workspace now so future consultations, chart records, remedies, orders, and editorial access can live in one calm, secure account foundation."
      highlights={[
        "Email-and-password access powered by a self-hosted authentication layer.",
        "A seed-ready user profile prepared for later astrology and commerce modules.",
        "A private dashboard shell designed for future premium member journeys.",
      ]}
      alternateHref="/sign-in"
      alternateLabel="Sign in instead"
    >
      <SignUpForm />
    </AuthFormShell>
  );
}
