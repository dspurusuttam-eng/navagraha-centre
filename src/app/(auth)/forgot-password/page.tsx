import { buildPageMetadata } from "@/lib/metadata";
import { AuthFormShell } from "@/modules/auth/components/auth-form-shell";
import { ForgotPasswordForm } from "@/modules/auth/components/forgot-password-form";

export const metadata = buildPageMetadata({
  title: "Forgot Password",
  description:
    "Request a secure password reset link for your NAVAGRAHA CENTRE member account.",
  path: "/forgot-password",
  keywords: ["NAVAGRAHA CENTRE forgot password", "account recovery"],
});

export default function ForgotPasswordPage() {
  return (
    <AuthFormShell
      eyebrow="Account Recovery"
      title="Request a secure password reset link."
      description="Use your account email to begin protected access recovery without exposing account details."
      highlights={[
        "A single-use reset token is generated server-side.",
        "Reset requests are protected by auth rate limiting.",
        "Password recovery keeps existing member data intact.",
      ]}
      alternateHref="/sign-in"
      alternateLabel="Back to sign in"
    >
      <ForgotPasswordForm />
    </AuthFormShell>
  );
}

