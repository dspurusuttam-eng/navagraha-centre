import { buildPageMetadata } from "@/lib/metadata";
import { AuthFormShell } from "@/modules/auth/components/auth-form-shell";
import { SignInForm } from "@/modules/auth/components/sign-in-form";

export const metadata = buildPageMetadata({
  title: "Sign In",
  description:
    "Access the NAVAGRAHA CENTRE private dashboard and account settings foundation.",
  path: "/sign-in",
  keywords: ["NAVAGRAHA CENTRE sign in", "astrology member login"],
});

export default function SignInPage() {
  return (
    <AuthFormShell
      eyebrow="Private Access"
      title="A refined member workspace begins here."
      description="Sign in to the protected NAVAGRAHA CENTRE dashboard foundation, where profile settings, future charts, consultations, and orders will stay organized."
      highlights={[
        "Protected access to the private dashboard shell.",
        "A dedicated account profile prepared for later astrology and chart records.",
        "A clean foundation for consultation and commerce history.",
      ]}
      alternateHref="/sign-up"
      alternateLabel="Create an account"
    >
      <SignInForm />
    </AuthFormShell>
  );
}
